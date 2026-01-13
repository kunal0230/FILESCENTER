import { Metadata } from "next";

export const metadata: Metadata = {
    title: "PDF to Image Online Free - Convert PDF to JPG/PNG | FilesCenter",
    description: "Free PDF to image converter. Convert PDF pages to JPG or PNG images. High quality output. No upload - browser processing.",
    keywords: ["pdf to image", "pdf to jpg", "pdf to png", "convert pdf to image", "pdf to image converter"],
    alternates: {
        canonical: "https://filescenter.vercel.app/pdf/to-image"
    },
    openGraph: {
        title: "PDF to Image Online Free - Convert PDF to JPG/PNG | FilesCenter",
        description: "Free tool to convert PDF pages to images. Works in your browser.",
        url: "https://filescenter.vercel.app/pdf/to-image",
        type: "website"
    }
};

export default function PDFToImageLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF to Image Converter",
                        "description": "Free online tool to convert PDF pages to images",
                        "url": "https://filescenter.vercel.app/pdf/to-image",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Any",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
        </>
    );
}
