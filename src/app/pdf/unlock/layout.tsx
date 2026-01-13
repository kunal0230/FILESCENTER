import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Unlock PDF Online Free - Remove PDF Password | FilesCenter",
    description: "Free PDF unlocker. Remove password protection from PDF files. Unlock secured PDFs. No upload - all processing in your browser.",
    keywords: ["unlock pdf", "remove pdf password", "pdf unlocker", "decrypt pdf", "unlock pdf online free"],
    alternates: {
        canonical: "https://filescenter.vercel.app/pdf/unlock"
    },
    openGraph: {
        title: "Unlock PDF Online Free - Remove Password | FilesCenter",
        description: "Free tool to remove password from PDF files. Works in your browser.",
        url: "https://filescenter.vercel.app/pdf/unlock",
        type: "website"
    }
};

export default function PDFUnlockLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF Unlocker",
                        "description": "Free online tool to remove password protection from PDF files",
                        "url": "https://filescenter.vercel.app/pdf/unlock",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Any",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
        </>
    );
}
