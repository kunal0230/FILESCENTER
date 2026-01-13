import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Compress Image Online Free - Reduce Image Size | FilesCenter",
    description: "Free online image compressor. Reduce image file size without losing quality. Supports JPG, PNG, WebP, GIF. No upload - all processing happens in your browser.",
    keywords: ["compress image", "reduce image size", "image compressor", "compress jpg", "compress png", "reduce file size"],
    alternates: {
        canonical: "https://filescenter.vercel.app/image/compress"
    }
};

export default function ImageCompressLayout({
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
                        "name": "Image Compressor",
                        "description": "Free online tool to compress images and reduce file size",
                        "url": "https://filescenter.vercel.app/image/compress",
                        "applicationCategory": "MultimediaApplication",
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
