import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Slug Generator Online Free - URL Friendly | FilesCenter",
    description: "Free slug generator. Create URL-friendly slugs from text. SEO friendly URLs. Instant conversion - no upload.",
    keywords: ["slug generator", "url slug", "url friendly", "seo url", "slug maker"],
    alternates: { canonical: "https://filescenter.vercel.app/text/slug-generator" },
    openGraph: { title: "Slug Generator Online Free | FilesCenter", description: "Free tool to create URL-friendly slugs.", url: "https://filescenter.vercel.app/text/slug-generator", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Slug Generator", "description": "Free online URL slug generator", "url": "https://filescenter.vercel.app/text/slug-generator", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
