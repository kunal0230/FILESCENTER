import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Image to PDF Online Free - Convert Images to PDF | FilesCenter",
    description: "Free image to PDF converter. Convert multiple images to a single PDF. Supports JPG, PNG, WebP. No upload - browser processing.",
    keywords: ["image to pdf", "jpg to pdf", "png to pdf", "convert image to pdf", "image to pdf converter"],
    alternates: { canonical: "https://filescenter.vercel.app/image/to-pdf" },
    openGraph: {
        title: "Image to PDF Online Free | FilesCenter",
        description: "Free tool to convert images to PDF. Works in your browser.",
        url: "https://filescenter.vercel.app/image/to-pdf", type: "website"
    }
};

export default function ImageToPDFLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "SoftwareApplication",
                    "name": "Image to PDF Converter", "description": "Free online tool to convert images to PDF",
                    "url": "https://filescenter.vercel.app/image/to-pdf",
                    "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any",
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                })
            }} />
        </>
    );
}
