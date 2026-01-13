import { PDFDocument, degrees } from 'pdf-lib';

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
        const pages = await newPdf.copyPages(pdf, range.map(p => p - 1)); // Convert to 0-indexed
        pages.forEach(page => newPdf.addPage(page));
        const bytes = await newPdf.save();
        results.push(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
    }

    return results;
}

export async function compressPDF(file: File, quality: 'low' | 'medium' | 'high' = 'medium'): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);

    // Note: pdf-lib doesn't directly support compression
    // This creates a new PDF which can sometimes reduce size
    const newPdf = await PDFDocument.create();
    const pages = await newPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => newPdf.addPage(page));

    const bytes = await newPdf.save({
        useObjectStreams: true, // Helps reduce size
    });

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
