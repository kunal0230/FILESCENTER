import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Split PDF Online Free - Extract Pages from PDF | FilesCenter",
    description: "Free online PDF splitter. Extract pages, split by page range, or separate every page. No upload required - all processing happens in your browser.",
    keywords: ["split pdf", "extract pdf pages", "pdf splitter", "separate pdf pages", "split pdf online free"],
    alternates: {
        canonical: "https://filescenter.vercel.app/pdf/split"
    },
    openGraph: {
        title: "Split PDF Online Free - Extract Pages | FilesCenter",
        description: "Free tool to split PDF files and extract pages. Works entirely in your browser.",
        url: "https://filescenter.vercel.app/pdf/split",
        type: "website"
    }
};

export default function PDFSplitLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF Splitter",
                        "description": "Free online tool to split PDF files and extract pages",
                        "url": "https://filescenter.vercel.app/pdf/split",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Any",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
        </>
    );
}
