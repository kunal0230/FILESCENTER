import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reverse Text Online Free - Reverse Words | FilesCenter",
    description: "Free text reverser. Reverse text by characters, words, or lines. Instant conversion - no upload needed.",
    keywords: ["reverse text", "text reverser", "reverse words", "reverse string", "backwards text"],
    alternates: { canonical: "https://filescenter.vercel.app/text/reverse" },
    openGraph: { title: "Reverse Text Online Free | FilesCenter", description: "Free tool to reverse text.", url: "https://filescenter.vercel.app/text/reverse", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Text Reverser", "description": "Free online text reversing tool", "url": "https://filescenter.vercel.app/text/reverse", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
