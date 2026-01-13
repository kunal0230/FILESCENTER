import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Text Diff Online Free - Compare Text | FilesCenter",
    description: "Free text diff tool. Compare two texts and see differences highlighted. Side by side comparison. Instant results - no upload.",
    keywords: ["text diff", "compare text", "text comparison", "diff tool", "find differences in text"],
    alternates: { canonical: "https://filescenter.vercel.app/text/diff" },
    openGraph: { title: "Text Diff Online Free | FilesCenter", description: "Free tool to compare texts and find differences.", url: "https://filescenter.vercel.app/text/diff", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Text Diff Tool", "description": "Free online text comparison tool", "url": "https://filescenter.vercel.app/text/diff", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
