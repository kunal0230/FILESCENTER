import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Word Counter Online Free - Count Words Characters | FilesCenter",
    description: "Free word counter. Count words, characters, sentences, paragraphs. Reading time estimate. No upload - instant results.",
    keywords: ["word counter", "character counter", "count words", "word count tool", "text counter online"],
    alternates: { canonical: "https://filescenter.vercel.app/text/word-counter" },
    openGraph: { title: "Word Counter Online Free | FilesCenter", description: "Free tool to count words and characters.", url: "https://filescenter.vercel.app/text/word-counter", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Word Counter", "description": "Free online word and character counter", "url": "https://filescenter.vercel.app/text/word-counter", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
