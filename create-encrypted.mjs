
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import fs from 'fs';

async function createEncrypted() {
    // Create a minimal PDF (1.4 header, 1 page)
    const pdfData = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 20 >>
stream
Scan for encryption!
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000201 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
271
%%EOF`;

    const inputBytes = new TextEncoder().encode(pdfData);

    console.log('Encrypting PDF...');
    const encryptedBytes = await encryptPDF(
        inputBytes,
        'password123', // User password
        'owner123'     // Owner password
    );

    fs.writeFileSync('public/test-encrypted.pdf', Buffer.from(encryptedBytes));
    console.log('Created public/test-encrypted.pdf with password: password123');
}

createEncrypted();
