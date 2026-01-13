import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lorem Ipsum Generator Online Free | FilesCenter",
    description: "Free Lorem Ipsum generator. Generate placeholder text for designs. Customize paragraphs, words, sentences. Instant generation.",
    keywords: ["lorem ipsum generator", "placeholder text", "dummy text", "lipsum generator", "lorem generator"],
    alternates: { canonical: "https://filescenter.vercel.app/text/lorem-generator" },
    openGraph: { title: "Lorem Ipsum Generator Online Free | FilesCenter", description: "Free tool to generate Lorem Ipsum placeholder text.", url: "https://filescenter.vercel.app/text/lorem-generator", type: "website" }
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return (<>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "Lorem Ipsum Generator", "description": "Free online Lorem Ipsum placeholder text generator", "url": "https://filescenter.vercel.app/text/lorem-generator", "applicationCategory": "UtilitiesApplication", "operatingSystem": "Any", "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" } }) }} /></>);
}
