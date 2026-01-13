import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sort Lines Online Free - Sort Text Alphabetically | FilesCenter",
    description: "Free line sorter. Sort lines alphabetically, numerically, or randomly. Remove blanks. Instant results - no upload.",
    keywords: ["sort lines", "sort text", "alphabetical sort", "line sorter", "sort lines online"],
    alternates: { canonical: "https://filescenter.vercel.app/text/sort-lines" },
    openGraph: { title: "Sort Lines Online Free | FilesCenter", description: "Free tool to sort text lines.", url: "https://filescenter.vercel.app/text/sort-lines", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Line Sorter", "description": "Free online tool to sort text lines", "url": "https://filescenter.vercel.app/text/sort-lines", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
