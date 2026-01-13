import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Protect PDF with Password Online Free | FilesCenter",
    description: "Free PDF password protection. Add password encryption to PDF files. Secure your documents. No upload - all processing in your browser.",
    keywords: ["protect pdf", "password pdf", "encrypt pdf", "pdf password", "secure pdf online"],
    alternates: {
        canonical: "https://filescenter.vercel.app/pdf/protect"
    },
    openGraph: {
        title: "Protect PDF with Password Online Free | FilesCenter",
        description: "Free tool to add password protection to PDF files. Works in your browser.",
        url: "https://filescenter.vercel.app/pdf/protect",
        type: "website"
    }
};

export default function PDFProtectLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF Password Protector",
                        "description": "Free online tool to add password protection to PDF files",
                        "url": "https://filescenter.vercel.app/pdf/protect",
                        "applicationCategory": "UtilitiesApplication",
                        "operatingSystem": "Any",
                        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    })
                }}
            />
        </>
    );
}
