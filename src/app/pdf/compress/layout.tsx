import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Compress PDF Online Free - Reduce PDF Size | FilesCenter",
    description: "Free PDF compressor. Reduce PDF file size while maintaining quality. Choose compression levels. No upload - all processing in your browser.",
    keywords: ["compress pdf", "reduce pdf size", "pdf compressor", "shrink pdf", "compress pdf online free"],
    alternates: {
        canonical: "https://filescenter.vercel.app/pdf/compress"
    },
    openGraph: {
        title: "Compress PDF Online Free - Reduce File Size | FilesCenter",
        description: "Free tool to compress PDF files and reduce size. Works entirely in your browser.",
        url: "https://filescenter.vercel.app/pdf/compress",
        type: "website"
    }
};

export default function PDFCompressLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF Compressor",
                        "description": "Free online tool to compress PDF files and reduce size",
                        "url": "https://filescenter.vercel.app/pdf/compress",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Any",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
        </>
    );
}
