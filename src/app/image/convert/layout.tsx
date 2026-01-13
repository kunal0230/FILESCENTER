import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Convert Image Format Online Free - PNG JPG WebP | FilesCenter",
    description: "Free image format converter. Convert between PNG, JPG, WebP, GIF. High quality conversion. No upload - browser processing.",
    keywords: ["convert image", "png to jpg", "jpg to png", "webp converter", "image format converter"],
    alternates: { canonical: "https://filescenter.vercel.app/image/convert" },
    openGraph: {
        title: "Convert Image Format Online Free | FilesCenter",
        description: "Free tool to convert image formats. PNG, JPG, WebP.",
        url: "https://filescenter.vercel.app/image/convert", type: "website"
    }
};

export default function ImageConvertLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "SoftwareApplication",
                    "name": "Image Format Converter", "description": "Free online tool to convert image formats",
                    "url": "https://filescenter.vercel.app/image/convert",
                    "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any",
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                })
            }} />
        </>
    );
}
