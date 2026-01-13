import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Markdown Preview Online Free - Live Editor | FilesCenter",
    description: "Free Markdown previewer. Live preview with HTML export. Write and preview markdown instantly. No upload needed.",
    keywords: ["markdown preview", "markdown editor", "markdown to html", "live markdown", "markdown viewer"],
    alternates: { canonical: "https://filescenter.vercel.app/text/markdown-preview" },
    openGraph: { title: "Markdown Preview Online Free | FilesCenter", description: "Free live Markdown previewer.", url: "https://filescenter.vercel.app/text/markdown-preview", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Markdown Previewer", "description": "Free online Markdown preview tool", "url": "https://filescenter.vercel.app/text/markdown-preview", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
