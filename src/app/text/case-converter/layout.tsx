import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Case Converter Online Free - Uppercase Lowercase | FilesCenter",
    description: "Free text case converter. Convert to uppercase, lowercase, title case, sentence case. Instant conversion - no upload needed.",
    keywords: ["case converter", "uppercase converter", "lowercase converter", "title case", "text case tool"],
    alternates: { canonical: "https://filescenter.vercel.app/text/case-converter" },
    openGraph: { title: "Case Converter Online Free | FilesCenter", description: "Free tool to convert text case.", url: "https://filescenter.vercel.app/text/case-converter", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Case Converter", "description": "Free online text case converter", "url": "https://filescenter.vercel.app/text/case-converter", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
