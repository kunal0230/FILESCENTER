import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Crop Image Online Free - Crop Photos | FilesCenter",
    description: "Free image cropper. Crop images with preset or custom aspect ratios. 1:1, 16:9, 4:3 and more. No upload - browser processing.",
    keywords: ["crop image", "image cropper", "crop photo", "cut image", "crop image online free"],
    alternates: { canonical: "https://filescenter.vercel.app/image/crop" },
    openGraph: {
        title: "Crop Image Online Free | FilesCenter",
        description: "Free tool to crop images with various aspect ratios.",
        url: "https://filescenter.vercel.app/image/crop", type: "website"
    }
};

export default function ImageCropLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org", "@type": "SoftwareApplication",
                    "name": "Image Cropper", "description": "Free online tool to crop images",
                    "url": "https://filescenter.vercel.app/image/crop",
                    "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any",
                    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                })
            }} />
        </>
    );
}
