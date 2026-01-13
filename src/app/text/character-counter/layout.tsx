import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Character Counter Online Free - Count Characters | FilesCenter",
    description: "Free character counter. Count characters, letters, numbers, spaces. Detailed text statistics. Instant results.",
    keywords: ["character counter", "letter counter", "text counter", "count characters", "character count online"],
    alternates: { canonical: "https://filescenter.vercel.app/text/character-counter" },
    openGraph: { title: "Character Counter Online Free | FilesCenter", description: "Free tool to count characters and text statistics.", url: "https://filescenter.vercel.app/text/character-counter", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Character Counter", "description": "Free online character counter", "url": "https://filescenter.vercel.app/text/character-counter", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
