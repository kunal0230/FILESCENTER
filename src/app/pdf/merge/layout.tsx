import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Merge PDF Online Free - Combine PDF Files | FilesCenter",
    description: "Free online PDF merger. Combine multiple PDF files into one document. Reorder pages before merging. No upload - all processing happens in your browser.",
    keywords: ["merge pdf", "combine pdf", "join pdf", "pdf merger", "combine pdf files", "merge pdf online"],
    alternates: {
        canonical: "https://filescenter.vercel.app/pdf/merge"
    }
};

export default function PDFMergeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF Merger",
                        "description": "Free online tool to merge multiple PDF files into one",
                        "url": "https://filescenter.vercel.app/pdf/merge",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Any",
                        "offers": {
                            "@type": "Offer",
                            "price": "0",
                            "priceCurrency": "USD"
                        }
                    })
                }}
            />
        </>
    );
}
