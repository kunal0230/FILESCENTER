import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Remove Duplicate Lines Online Free | FilesCenter",
    description: "Free duplicate line remover. Remove duplicate lines from text. Case sensitive options. Instant results - no upload needed.",
    keywords: ["remove duplicates", "duplicate line remover", "remove duplicate lines", "delete duplicates", "unique lines"],
    alternates: { canonical: "https://filescenter.vercel.app/text/remove-duplicates" },
    openGraph: { title: "Remove Duplicate Lines Online Free | FilesCenter", description: "Free tool to remove duplicate lines from text.", url: "https://filescenter.vercel.app/text/remove-duplicates", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Duplicate Line Remover", "description": "Free online tool to remove duplicate lines", "url": "https://filescenter.vercel.app/text/remove-duplicates", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
