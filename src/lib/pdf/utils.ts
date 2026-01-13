import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize worker (idempotent)
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
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

    // Load with PDF.js for rendering
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;

    // Create new PDF with pdf-lib for assembly
    const newPdf = await PDFDocument.create();

    // FIXED SCALING (Requested by user to avoid "trash" quality and 100% reduction)
    // Scale: Higher = sharper text, larger size. Lower = blurry text, smaller size.
    // Quality: JPEG compression (0 to 1).
    const settings = {
        low: { scale: 2.0, quality: 0.9 },     // 144 DPI, High Quality (UI 'Low' = Low Compression)
        medium: { scale: 1.5, quality: 0.75 }, // 108 DPI, Balanced
        high: { scale: 1.0, quality: 0.6 }      // 72 DPI, High Compression (UI 'High' = Smallest Size)
    }[quality];

    console.log(`Starting Strong Compression: ${quality}, Scale: ${settings.scale}, Grayscale: ${grayscale}`);

    for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        let viewport = page.getViewport({ scale: settings.scale });

        // Safety check: Cap dimensions at 4096px to avoid browser canvas limits
        const MAX_DIMENSION = 4096;
        if (viewport.width > MAX_DIMENSION || viewport.height > MAX_DIMENSION) {
            const ratio = Math.min(MAX_DIMENSION / viewport.width, MAX_DIMENSION / viewport.height);
            viewport = page.getViewport({ scale: settings.scale * ratio });
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Apply Grayscale filter if requested
        if (grayscale) {
            context.filter = 'grayscale(100%)';
        }

        // Render page to canvas
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
        }

        // Cleanup canvas early to help memory
        canvas.width = 0;
        canvas.height = 0;
    }

    const bytes = await newPdf.save();

    // Safety Check: If compression actually increased size, return original.
    if (bytes.length > file.size) {
        console.warn(`Compression increased size: ${bytes.length} > ${file.size}. Reverting.`);
        return new Blob([arrayBuffer], { type: 'application/pdf' });
    }

    console.log(`Compression finished: ${file.size} -> ${bytes.length} (${Math.round((1 - bytes.length / file.size) * 100)}% reduction)`);
    return new Blob([bytes as BlobPart], { type: 'application/pdf' });
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
