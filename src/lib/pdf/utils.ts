import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { compressPDFLossless } from './qpdf';

// Initialize worker (idempotent)
if (typeof window !== 'undefined') {
    // Force local worker to avoid CDN/Version mismatches
    // This file is automatically managed by next.config.mjs
    const workerPath = '/pdf.worker.min.js';
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;
}

export async function mergePDFs(files: File[]): Promise<Blob> {
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    const mergedPdfBytes = await mergedPdf.save();
    return new Blob([mergedPdfBytes as BlobPart], { type: 'application/pdf' });
}

export async function splitPDF(file: File, pageRanges: number[][]): Promise<Blob[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const results: Blob[] = [];
    for (const range of pageRanges) {
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdf, range.map(p => p - 1));
        pages.forEach(page => newPdf.addPage(page));
        const bytes = await newPdf.save();
        results.push(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
    }
    return results;
}

export async function compressPDF(
    file: File,
    quality: 'low' | 'medium' | 'high' = 'medium',
    grayscale: boolean = false
): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();

    // Clone buffer for PDF.js to prevent main thread detachment if worker transfers it
    const pdfJsBuffer = arrayBuffer.slice(0);

    try {
        // Load with PDF.js for rendering
        const loadingTask = pdfjsLib.getDocument({ data: pdfJsBuffer });
        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;

        // Create new PDF for assembly
        const newPdf = await PDFDocument.create();

        const settings = {
            low: { scale: 2.0, quality: 0.9 },
            medium: { scale: 1.5, quality: 0.75 },
            high: { scale: 1.0, quality: 0.6 }
        }[quality];

        let processedPages = 0;

        for (let i = 1; i <= pageCount; i++) {
            try {
                // Avoid blocking the main thread
                await new Promise(resolve => setTimeout(resolve, 10));

                const page = await pdf.getPage(i);
                let viewport = page.getViewport({ scale: settings.scale });

                // Scale down if dimensions are too large
                const MAX_DIMENSION = 3500;
                if (viewport.width > MAX_DIMENSION || viewport.height > MAX_DIMENSION) {
                    const ratio = Math.min(MAX_DIMENSION / viewport.width, MAX_DIMENSION / viewport.height);
                    viewport = page.getViewport({ scale: settings.scale * ratio });
                }

                // Create canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d', { willReadFrequently: true });

                if (!context) {
                    console.warn(`Failed to create context for page ${i}`);
                    continue;
                }

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                // Apply Grayscale filter if requested
                if (grayscale) {
                    context.filter = 'grayscale(100%)';
                }

                // Render page
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                // Convert to blob (JPEG)
                const imageBlob = await new Promise<Blob | null>(resolve =>
                    canvas.toBlob(resolve, 'image/jpeg', settings.quality)
                );

                if (imageBlob) {
                    const imageBuffer = await imageBlob.arrayBuffer();
                    const embeddedImage = await newPdf.embedJpg(imageBuffer);

                    // Maintain original physical size
                    const originalWidth = viewport.width / viewport.scale;
                    const originalHeight = viewport.height / viewport.scale;

                    const newPage = newPdf.addPage([originalWidth, originalHeight]);
                    newPage.drawImage(embeddedImage, {
                        x: 0,
                        y: 0,
                        width: originalWidth,
                        height: originalHeight,
                    });
                    processedPages++;
                }

                // Cleanup
                canvas.width = 0;
                canvas.height = 0;
                page.cleanup(); // PDF.js cleanup

            } catch (pageError) {
                console.error(`Error processing page ${i}:`, pageError);
                // Continue to next page instead of failing entire document
            }
        }

        const bytes = await newPdf.save();

        // Safety check: If the compressed output is invalid (e.g., empty or no pages processed), revert to the original.
        if (bytes.length === 0 || (processedPages === 0 && pageCount > 0)) {
            console.warn('Compression produced invalid output. Reverting to original.');
            return new Blob([await file.arrayBuffer()], { type: 'application/pdf' });
        }

        // Fallback if compression increased size
        if (bytes.length > file.size) {
            console.warn(`Compression increased size: ${bytes.length} > ${file.size}. Reverting.`);
            return new Blob([await file.arrayBuffer()], { type: 'application/pdf' });
        }

        return new Blob([bytes as BlobPart], { type: 'application/pdf' });

    } catch (error) {
        console.error('Error in compressPDF:', error);
        throw error;
    }
}

/**
 * Smart Compression:
 * Tries lossless first, then falls back to rasterization if needed.
 */
export async function compressPDFSmart(file: File): Promise<Blob> {
    try {
        // Step 1: Try Lossless Structural Optimization (QPDF)
        console.log('SmartCompress: Trying Lossless structural optimization...');
        const losslessBlob = await compressPDFLossless(file);

        // If lossless reduced more than 10%, we're happy
        const losslessReduction = (1 - losslessBlob.size / file.size) * 100;
        if (losslessReduction > 10) {
            console.log(`SmartCompress: Lossless was effective (${losslessReduction.toFixed(1)}%). Done.`);
            return losslessBlob;
        }

        // Step 2: If lossless wasn't enough, try "Balanced" Rasterization
        // This handles image-heavy PDFs where text optimization does little.
        console.log('SmartCompress: Lossless ineffective. Trying Weighted Rasterization...');
        const rasterizedBlob = await compressPDF(file, 'medium', false);

        const rasterizedReduction = (1 - rasterizedBlob.size / file.size) * 100;

        // Pick the best of both
        if (rasterizedBlob.size < losslessBlob.size && rasterizedBlob.size < file.size) {
            console.log(`SmartCompress: Rasterization won (${rasterizedReduction.toFixed(1)}%).`);
            return rasterizedBlob;
        }

        return losslessBlob;
    } catch (error) {
        console.warn('SmartCompress: Combined strategy failed, using original.', error);
        return new Blob([await file.arrayBuffer()], { type: 'application/pdf' });
    }
}

export async function rotatePDF(file: File, rotation: 0 | 90 | 180 | 270): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = pdf.getPages();
    pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotation) % 360));
    });
    const bytes = await pdf.save();
    return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}

export async function getPDFPageCount(file: File): Promise<number> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    return pdf.getPageCount();
}

export async function extractPages(file: File, pageNumbers: number[]): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, pageNumbers.map(p => p - 1));
    pages.forEach(page => newPdf.addPage(page));
    const bytes = await newPdf.save();
    return new Blob([bytes as BlobPart], { type: 'application/pdf' });
}
