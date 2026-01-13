import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rotate PDF Online Free - Rotate PDF Pages | FilesCenter",
    description: "Free PDF rotator. Rotate PDF pages 90, 180, or 270 degrees. Rotate all or specific pages. No upload - processing in your browser.",
    keywords: ["rotate pdf", "rotate pdf pages", "pdf rotator", "turn pdf", "rotate pdf online free"],
    alternates: {
        canonical: "https://filescenter.vercel.app/pdf/rotate"
    },
    openGraph: {
        title: "Rotate PDF Online Free - Rotate Pages | FilesCenter",
        description: "Free tool to rotate PDF pages. Works entirely in your browser.",
        url: "https://filescenter.vercel.app/pdf/rotate",
        type: "website"
    }
};

export default function PDFRotateLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF Rotator",
                        "description": "Free online tool to rotate PDF pages",
                        "url": "https://filescenter.vercel.app/pdf/rotate",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Any",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
        </>
    );
}
