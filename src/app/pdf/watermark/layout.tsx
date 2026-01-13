import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Add Watermark to PDF Online Free | FilesCenter",
    description: "Free PDF watermark tool. Add text or image watermarks to PDF. Customize position, opacity, rotation. No upload - browser processing.",
    keywords: ["add watermark pdf", "pdf watermark", "watermark pdf online", "stamp pdf", "pdf watermark tool"],
    alternates: {
        canonical: "https://filescenter.vercel.app/pdf/watermark"
    },
    openGraph: {
        title: "Add Watermark to PDF Online Free | FilesCenter",
        description: "Free tool to add watermarks to PDF files. Works entirely in your browser.",
        url: "https://filescenter.vercel.app/pdf/watermark",
        type: "website"
    }
};

export default function PDFWatermarkLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF Watermark Tool",
                        "description": "Free online tool to add watermarks to PDF files",
                        "url": "https://filescenter.vercel.app/pdf/watermark",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Any",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
        </>
    );
}
