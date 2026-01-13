import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Flip Image Online Free - Mirror Images | FilesCenter",
    description: "Free image flipper. Flip images horizontally or vertically. Mirror effect. No upload - processing in your browser.",
    keywords: ["flip image", "mirror image", "flip photo", "horizontal flip", "vertical flip", "flip image online"],
    alternates: { canonical: "https://filescenter.vercel.app/image/flip" },
    openGraph: {
        title: "Flip Image Online Free | FilesCenter",
        description: "Free tool to flip and mirror images. Works in your browser.",
        url: "https://filescenter.vercel.app/image/flip", type: "website"
    }
};

export default function ImageFlipLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "SoftwareApplication",
                    "name": "Image Flipper", "description": "Free online tool to flip and mirror images",
                    "url": "https://filescenter.vercel.app/image/flip",
                    "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any",
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                })
            }} />
        </>
    );
}
