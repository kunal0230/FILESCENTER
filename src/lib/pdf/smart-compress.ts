
import { PDFDocument, PDFName, PDFRawStream, PDFDict, PDFStream } from 'pdf-lib';
import { compressImage } from '@/lib/image/utils';

export async function compressPDFSmart(file: File, onProgress?: (p: number) => void): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // We need to access the low-level context to find all objects
    const context = pdfDoc.context;

    // 1. Enumerate all objects to find Images
    const imageRefs: any[] = [];

    context.enumerateIndirectObjects().forEach(([ref, obj]) => {
        if (obj instanceof PDFRawStream || obj instanceof PDFStream) {
            const dict = obj.dict;
            if (dict instanceof PDFDict) {
                const subtype = dict.get(PDFName.of('Subtype'));
                const filter = dict.get(PDFName.of('Filter'));

                if (subtype === PDFName.of('Image')) {
                    // We found an image!
                    imageRefs.push({ ref, obj, dict });
                }
            }
        }
    });

    console.log(`Found ${imageRefs.length} images to optimize`);
    let processed = 0;

    for (const { ref, obj, dict } of imageRefs) {
        try {
            // 2. Extract raw data
            // Note: decode() might be needed if it's compressed involved
            const rawBytes = obj.getContents();

            // We can't easily know the format (JPEG/PNG) from raw bytes if it's filtered
            // But we can try to detect or just assume we can't easily re-compress arbitrary streams 
            // without decoding them first.
            // This is the hard part: Decoding the PDF Image Stream to a browser-readable format (PNG/JPEG)
            // pdf-lib doesn't decode filters (FlateDecode, DCTDecode) automatically for us to get a Blob.

            // Strategy B: We can't easily decode 'FlateDecode' bitmaps in JS without a library.
            // BUT, 'DCTDecode' IS a JPEG. We can optimize JPEGs.

            const filter = dict.get(PDFName.of('Filter'));
            const isJpeg = filter === PDFName.of('DCTDecode');

            if (isJpeg) {
                // It's already a JPEG. We can try to re-compress it.
                const blob = new Blob([rawBytes], { type: 'image/jpeg' });
                // Compress logic
                const compressedFile = await compressImage(new File([blob], "image.jpg"), {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 2048
                });

                // If compressed is smaller, replace!
                if (compressedFile.size < blob.size) {
                    const newBytes = await compressedFile.arrayBuffer();
                    // Update stream content
                    // This is 'unsafe' in pdf-lib API but works if we are careful
                    // We need to construct a new stream or modify existing
                    // updating contents is protected usually.
                }
            }

        } catch (e) {
            console.warn('Failed to process image', e);
        }
        processed++;
        if (onProgress) onProgress(processed / imageRefs.length * 100);
    }

    // ...
    // Since direct stream replacement is blocked by pdf-lib's encapsulation,
    // The "Smart" strategy usually involves copying pages to a new doc and REPLACING images 
    // as we draw them. 

    return await pdfDoc.save().then(b => new Blob([b], { type: 'application/pdf' }));
}
