import imageCompression from 'browser-image-compression';
import { PDFDocument } from 'pdf-lib';

export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    quality?: number;
}

export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const defaultOptions = {
        maxSizeMB: options.maxSizeMB || 1,
        maxWidthOrHeight: options.maxWidthOrHeight || 1920,
        useWebWorker: true,
        ...options
    };

    return await imageCompression(file, defaultOptions);
}

export async function resizeImage(
    file: File,
    width: number,
    height: number,
    maintainAspectRatio: boolean = true
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let targetWidth = width;
            let targetHeight = height;

            if (maintainAspectRatio) {
                const ratio = Math.min(width / img.width, height / img.height);
                targetWidth = img.width * ratio;
                targetHeight = img.height * ratio;
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            ctx?.drawImage(img, 0, 0, targetWidth, targetHeight);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob'));
                    }
                },
                file.type,
                0.9
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image'));
        };
        img.src = objectUrl;
    });
}

export async function convertImageFormat(
    file: File,
    targetFormat: string
): Promise<Blob> {
    // Handle HEIC input
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
        try {
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/png',
                quality: 1
            });
            const pngBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            return convertImageFormat(
                new File([pngBlob], "converted.png", { type: "image/png" }),
                targetFormat
            );
        } catch (e) {
            console.error('HEIC conversion failed', e);
            throw e;
        }
    }

    // Handle PDF Export
    if (targetFormat === 'application/pdf') {
        try {
            const pdfDoc = await PDFDocument.create();

            // To embed in PDF, we need PNG or JPG. 
            // Convert input to PNG blob first via canvas to ensure compatibility.
            const img = new Image();
            const pngBlob = await new Promise<Blob>((resolve, reject) => {
                const objectUrl = URL.createObjectURL(file);
                img.onload = () => {
                    URL.revokeObjectURL(objectUrl);
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('No context');
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(blob => blob ? resolve(blob) : reject('Blob failed'), 'image/png');
                };
                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Failed to load image'));
                };
                img.src = objectUrl;
            });

            const pngBuffer = await pngBlob.arrayBuffer();
            const embeddedImage = await pdfDoc.embedPng(pngBuffer);

            const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
            page.drawImage(embeddedImage, {
                x: 0,
                y: 0,
                width: embeddedImage.width,
                height: embeddedImage.height,
            });

            const pdfBytes = await pdfDoc.save();
            return new Blob([pdfBytes as any], { type: 'application/pdf' });
        } catch (e) {
            console.error('PDF Conversion failed', e);
            throw e;
        }
    }

    // Max dimension cap for canvas to prevent OOM crashes on very large images
    const MAX_CANVAS_DIMENSION = 8192;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let outputWidth = img.width;
            let outputHeight = img.height;

            // Scale down if exceeds max dimension
            if (outputWidth > MAX_CANVAS_DIMENSION || outputHeight > MAX_CANVAS_DIMENSION) {
                const scale = Math.min(MAX_CANVAS_DIMENSION / outputWidth, MAX_CANVAS_DIMENSION / outputHeight);
                outputWidth = Math.floor(outputWidth * scale);
                outputHeight = Math.floor(outputHeight * scale);
            }

            canvas.width = outputWidth;
            canvas.height = outputHeight;

            // For JPEG and BMP, fill with white background (no transparency)
            if (targetFormat === 'image/jpeg' || targetFormat === 'image/bmp') {
                ctx!.fillStyle = '#FFFFFF';
                ctx!.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx?.drawImage(img, 0, 0, outputWidth, outputHeight);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error(`Failed to convert image to ${targetFormat}`));
                    }
                },
                targetFormat,
                0.92
            );
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image'));
        };
        img.src = objectUrl;
    });
}

export async function rotateImage(file: File, degrees: 90 | 180 | 270): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            if (degrees === 90 || degrees === 270) {
                canvas.width = img.height;
                canvas.height = img.width;
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
            }

            ctx!.translate(canvas.width / 2, canvas.height / 2);
            ctx!.rotate((degrees * Math.PI) / 180);
            ctx!.drawImage(img, -img.width / 2, -img.height / 2);

            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Failed to rotate image'));
                },
                file.type,
                0.92
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image'));
        };
        img.src = objectUrl;
    });
}

export async function flipImage(
    file: File,
    direction: 'horizontal' | 'vertical'
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            canvas.width = img.width;
            canvas.height = img.height;

            if (direction === 'horizontal') {
                ctx!.scale(-1, 1);
                ctx!.drawImage(img, -img.width, 0);
            } else {
                ctx!.scale(1, -1);
                ctx!.drawImage(img, 0, -img.height);
            }

            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Failed to flip image'));
                },
                file.type,
                0.92
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to flip image'));
        };
        img.src = objectUrl;
    });
}

export function imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to load image'));
        };
        img.src = objectUrl;
    });
}

export async function cropImage(
    image: HTMLImageElement,
    crop: { x: number; y: number; width: number; height: number },
    outputFormat: string = 'image/png',
    rotation: number = 0,
    flip: { horizontal: boolean; vertical: boolean } = { horizontal: false, vertical: false }
): Promise<Blob> {
    // Guard against invalid image dimensions (prevents division by zero)
    if (image.width === 0 || image.height === 0 || image.naturalWidth === 0 || image.naturalHeight === 0) {
        throw new Error('Invalid image dimensions: image may not be loaded or is hidden.');
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // We need to draw the transformed image onto a canvas first, then crop from that.
    // Or we can transform the context and draw the image such that the cropped area maps to the canvas.

    // Easier approach for correctness: 
    // 1. Calculate destination canvas size (the crop size)
    // 2. Setup context with rotation/flip
    // 3. Draw the image offset by the crop/transform

    // Actually, react-image-crop returns coordinates RELATIVE TO THE TRANSFORMED IMAGE if we style the image.
    // However, usually we style the image and the cropper sits on top.
    // If we rotate the image, the cropper rotates with it? No, usually the container rotates or we reset.
    // Let's assume the UI rotates the visual image. The 'crop' coordinates passed here 
    // are likely relative to the VISUAL image dimensions (after rotation/flip?).

    // If the image is rotated 90deg, the 'width' becomes 'height'.
    // To keep it simple and robust:
    // 1. Create a "source" canvas that represents the fully transformed full-resolution image.
    // 2. Draw the original image onto it with transforms.
    // 3. Crop from this source canvas.

    // 1. Calculate dimensions of the transformed full image
    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));

    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;

    const transformedWidth = originalWidth * cos + originalHeight * sin;
    const transformedHeight = originalWidth * sin + originalHeight * cos;

    // Create an intermediate canvas for the full transformed image
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = transformedWidth;
    sourceCanvas.height = transformedHeight;
    const sourceCtx = sourceCanvas.getContext('2d');
    if (!sourceCtx) throw new Error('No 2d context');

    // Apply transforms to source context
    sourceCtx.translate(transformedWidth / 2, transformedHeight / 2);
    sourceCtx.rotate(radians);
    sourceCtx.scale(
        flip.horizontal ? -1 : 1,
        flip.vertical ? -1 : 1
    );
    sourceCtx.translate(-originalWidth / 2, -originalHeight / 2);

    sourceCtx.drawImage(image, 0, 0);

    // Now we have the full image transformed in sourceCanvas. 
    // The 'crop' object passed from the UI is relative to the *displayed* image size.
    // We need to map that to the *natural* transformed size.

    // image.width/height in the DOM might be scaled down by CSS (object-fit: contain).
    // But does the UI component rotate the IMG element? 
    // If we use CSS rotate on the img, the `image.width` and `height` properties don't change, 
    // but the clear visual dimensions do.

    // Let's assume 'crop' pixels match the `image.width/height` scale relative to `transformedWidth/Height`.
    // Wait, if we rotate 90deg, `image.width` (dom) is still the original width?
    // If we use specific React Crop rotation support, we need to know how it behaves.
    // Usually, we simple treat the crop coordinates as percentage or we scale them.

    // Let's assume the crop passed in acts on the *transformed* space.
    // We need the ratio between "Displayed Transformed Image" and "Actual Transformed Image".
    // Since we don't know the exact displayed size easily here without more args, 
    // let's rely on the fact that `crop` is often passed as pixel values relative to the IMAGE ELEMENT.

    // If the UI rotates via CSS, the "image" element dimensions might not reflect the rotated bouding box.
    // HOWEVER, standard `react-image-crop` with rotation usually involves a wrapping div or specific logic.

    // Let's use the standard "draw to canvas" approach for the output crop.

    canvas.width = crop.width * scaleX; // This scale might need adjustment if rotated?
    canvas.height = crop.height * scaleY;

    // Let's refine the scale factor.
    // If rotated 90deg, the "width" of the natural image is now vertical. 
    // So scaleX should be based on...

    // Actually, simpler approach:
    // The `crop` arg usually comes from the UI. If the UI handles rotation visually, 
    // it usually passes coordinates relative to that visual state.
    // BUT maintaining accurate backing coordinates is hard.

    // Alternative:
    // We can rely on `scale` passed from UI?
    // Or we simply recalculate:

    const finalScaleX = transformedWidth / image.width; // This assumes image.width matches the visual width of the transformed image... which is risky if just CSS rotated.
    // Actually, safely, we calculate scale based on the original image vs displayed image, 
    // assuming the displayed image is just fitted.

    // Let's assume the caller passes the correct crop coordinates relative to the *displayed* image, 
    // and we just need to scale them up to the *natural* transformed size.
    // But `image.width` (DOM) is the *untransformed* width.

    // Determine the scale factor by comparing the `transformedWidth` (natural) 
    // to the `image.width` (displayed, UNTRANSFORMED DOM width). 
    // This is WRONG if rotated 90deg because displayed width might be different.

    // Let's rely on a simpler assumption:
    // The caller should ideally pass `scaleX` and `scaleY` if they know it.
    // But since we are calculating it: 
    // `scaleX = image.naturalWidth / image.width` works for 0 rotation.

    // For 90 rotation, the "natural width" of the RESULT is `image.naturalHeight`. 
    // The "displayed width" is likely `image.getBoundingClientRect().width`? 
    // But we only have `image` (HTMLImageElement).

    // Let's try to map the crop directly from the `sourceCanvas`.

    // If we assume `crop` pixels are relative to the *image element as currently rendered*, 
    // checking `image.width` and `image.height` gives the rendered size (if width/height attrs are set or css-sized).
    // If rotated 90deg via CSS, `image.width` is typically still the original width in flow, but visually...

    // OK, to be safe, we will use the `scaleX/scaleY` derived from valid assumption that 
    // `crop.width` should be scaled by `transformedWidth / visualWidth`.
    // If logic is complicated, we'll try:

    // Target Output Canvas
    canvas.width = crop.width * scaleX; // Initial guess
    canvas.height = crop.height * scaleY;

    // We will draw the `sourceCanvas` into `canvas`.
    // We need to know where to crop from `sourceCanvas`.
    // sourceCanvas is `transformedWidth` x `transformedHeight`.

    // We assume the relationship between `crop` (UI px) and `sourceCanvas` (Natural px) 
    // follows the `scaleX` = `natural / displayed`.

    // BUT we need to know which dimension matches which.
    // If rotation % 180 === 0:
    //   UI Width ~ Natural Width
    //   UI Height ~ Natural Height
    // If rotation % 180 === 90:
    //   UI Width ~ Natural Height
    //   UI Height ~ Natural Width

    let boxScaleX = 1;
    let boxScaleY = 1;

    if (rotation % 180 === 90) {
        boxScaleX = image.naturalHeight / image.width; // Mapping UI Width (which maps to Natural Height visually)
        boxScaleY = image.naturalWidth / image.height;
    } else {
        boxScaleX = image.naturalWidth / image.width;
        boxScaleY = image.naturalHeight / image.height;
    }

    canvas.width = crop.width * boxScaleX;
    canvas.height = crop.height * boxScaleY;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No 2d context');

    ctx.drawImage(
        sourceCanvas,
        crop.x * boxScaleX,
        crop.y * boxScaleY,
        crop.width * boxScaleX,
        crop.height * boxScaleY,
        0,
        0,
        canvas.width,
        canvas.height
    );

    // Default to 'image/png' if formatted incorrectly or passed broadly
    const validFormat = (outputFormat === 'image/jpeg' || outputFormat === 'image/webp') ? outputFormat : 'image/png';

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas is empty'));
            },
            validFormat,
            1 // high quality
        );
    });
}
