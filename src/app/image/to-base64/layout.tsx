import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Image to Base64 Online Free - Encode Image | FilesCenter",
    description: "Free image to Base64 encoder. Convert images to Base64 strings for embedding. Copy or download. No upload - browser processing.",
    keywords: ["image to base64", "base64 encoder", "encode image", "image to data uri", "base64 image converter"],
    alternates: { canonical: "https://filescenter.vercel.app/image/to-base64" },
    openGraph: {
        title: "Image to Base64 Online Free | FilesCenter",
        description: "Free tool to convert images to Base64. Works in your browser.",
        url: "https://filescenter.vercel.app/image/to-base64", type: "website"
    }
};

export default function ImageToBase64Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "SoftwareApplication",
                    "name": "Image to Base64 Encoder", "description": "Free online tool to encode images to Base64",
                    "url": "https://filescenter.vercel.app/image/to-base64",
                    "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any",
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                })
            }} />
        </>
    );
}
