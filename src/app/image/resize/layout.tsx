import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Resize Image Online Free - Change Image Dimensions | FilesCenter",
    description: "Free image resizer. Change image dimensions with aspect ratio lock. Resize by percentage or pixels. No upload - browser processing.",
    keywords: ["resize image", "image resizer", "change image size", "resize photo", "resize image online free"],
    alternates: { canonical: "https://filescenter.vercel.app/image/resize" },
    openGraph: {
        title: "Resize Image Online Free | FilesCenter",
        description: "Free tool to resize images. Works entirely in your browser.",
        url: "https://filescenter.vercel.app/image/resize", type: "website"
    }
};

export default function ImageResizeLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "SoftwareApplication",
                    "name": "Image Resizer", "description": "Free online tool to resize images",
                    "url": "https://filescenter.vercel.app/image/resize",
                    "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any",
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                })
            }} />
        </>
    );
}
