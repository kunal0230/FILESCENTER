
import loadQpdf from '@jspawn/qpdf-wasm';
import fs from 'fs';

async function test() {
    try {
        console.log('Loading qpdf...');
        const qpdf = await loadQpdf();
        console.log('qpdf loaded:', Object.keys(qpdf));

        // Check if FS and callMain exist
        if (qpdf.FS && qpdf.callMain) {
            console.log('FS and callMain found.');

            // Mocking a PDF file creation for test (if I had one)
            // For now just checking API availability
            console.log('API verification successful.');
        } else {
            console.log('FS or callMain missing.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

test();
