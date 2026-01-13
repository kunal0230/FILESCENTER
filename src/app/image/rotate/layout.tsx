import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rotate Image Online Free - Rotate Photos | FilesCenter",
    description: "Free image rotator. Rotate images 90, 180, 270 degrees or any custom angle. No upload - processing in your browser.",
    keywords: ["rotate image", "image rotator", "rotate photo", "turn image", "rotate image online free"],
    alternates: { canonical: "https://filescenter.vercel.app/image/rotate" },
    openGraph: {
        title: "Rotate Image Online Free | FilesCenter",
        description: "Free tool to rotate images. Works entirely in your browser.",
        url: "https://filescenter.vercel.app/image/rotate", type: "website"
    }
};

export default function ImageRotateLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "SoftwareApplication",
                    "name": "Image Rotator", "description": "Free online tool to rotate images",
                    "url": "https://filescenter.vercel.app/image/rotate",
                    "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any",
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                })
            }} />
        </>
    );
}
