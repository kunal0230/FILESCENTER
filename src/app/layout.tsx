import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://filescenter.vercel.app"),
  title: {
    default: "FilesCenter - 50+ Free Online PDF, Image & Developer Tools | No Upload Required",
    template: "%s | FilesCenter - Free Online Tools"
  },
  description: "50+ free online tools: compress PDF, merge PDF, resize images, convert formats, JSON formatter, Base64 encoder, UUID generator & more. 100% free, no registration, no file uploads - all processing happens securely in your browser.",
  keywords: [
    "free PDF tools", "online PDF editor", "PDF compress", "merge PDF online", "split PDF", "PDF to image",
    "image compressor", "resize image online", "crop image", "image converter", "PNG to JPG", "WebP converter",
    "developer tools", "JSON formatter", "Base64 encoder decoder", "UUID generator", "hash generator",
    "URL encoder", "regex tester", "JWT decoder", "color picker", "text tools", "word counter",
    "case converter", "lorem ipsum generator", "QR code generator", "password generator",
    "percentage calculator", "age calculator", "BMI calculator", "unit converter",
    "free online tools", "browser-based tools", "privacy-first", "no upload required", "client-side processing"
  ],
  authors: [{ name: "FilesCenter", url: "https://filescenter.vercel.app" }],
  creator: "FilesCenter",
  publisher: "FilesCenter",
  category: "Technology",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/site.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://filescenter.vercel.app",
    siteName: "FilesCenter",
    title: "FilesCenter - 50+ Free Online Tools for PDF, Images & Developers",
    description: "Free online tools for PDF, images, text & developers. Compress, convert, merge - all processing in your browser. No uploads, 100% private.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FilesCenter - 50+ Free Online Tools"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "FilesCenter - 50+ Free Online Tools",
    description: "Free PDF, image & developer tools. No uploads required - everything runs in your browser.",
    images: ["/og-image.png"],
    creator: "@filescenter"
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://filescenter.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicons for browser tabs and Google search */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="canonical" href="https://filescenter.vercel.app" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <a href="/" className="flex items-center">
                <img
                  src="/logo-full.png"
                  alt="FilesCenter"
                  className="h-12"
                />
              </a>

              <div className="hidden md:flex items-center gap-6">
                <a href="/pdf" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">PDF Tools</a>
                <a href="/image" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Image Tools</a>
                <a href="/catalog" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Catalog</a>
                <a href="/" className="btn-primary text-sm">All Tools</a>
              </div>

              {/* Mobile menu button */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </nav>
          </header>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4 gradient-text">FilesCenter</h3>
                  <p className="text-gray-600 text-sm">
                    Free online tools for PDF and image processing.
                    All processing happens in your browser - your files never leave your device.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">PDF Tools</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="/pdf/merge" className="hover:text-gray-900 transition-colors">Merge PDF</a></li>
                    <li><a href="/pdf/split" className="hover:text-gray-900 transition-colors">Split PDF</a></li>
                    <li><a href="/pdf/compress" className="hover:text-gray-900 transition-colors">Compress PDF</a></li>
                    <li><a href="/pdf/to-image" className="hover:text-gray-900 transition-colors">PDF to Image</a></li>
                    <li><a href="/pdf/rotate" className="hover:text-gray-900 transition-colors">Rotate PDF</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">Image Tools</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><a href="/image/compress" className="hover:text-gray-900 transition-colors">Compress Image</a></li>
                    <li><a href="/image/resize" className="hover:text-gray-900 transition-colors">Resize Image</a></li>
                    <li><a href="/image/convert" className="hover:text-gray-900 transition-colors">Convert Format</a></li>
                    <li><a href="/image/to-pdf" className="hover:text-gray-900 transition-colors">Image to PDF</a></li>
                    <li><a href="/image/crop" className="hover:text-gray-900 transition-colors">Crop Image</a></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">Privacy First</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Files never uploaded
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Browser-only processing
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      No registration needed
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      100% free forever
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} FilesCenter. All rights reserved. Made with ❤️ for everyone.</p>
              </div>
            </div>
          </footer>
        </div>

        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "FilesCenter",
              "url": "https://filescenter.vercel.app",
              "description": "Free online PDF and image tools with privacy-first approach",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://filescenter.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
