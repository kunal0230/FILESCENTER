import { Metadata } from "next";
import Link from "next/link";
import {
    FileText, Image, Merge, Split, Minimize2, RotateCw,
    Shield, Unlock, Layers, Crop, RefreshCw, FlipHorizontal,
    Code, Type, Binary, Calculator, Calendar, ArrowRightLeft,
    Hash, FileSearch, Braces, Clock, Percent, Key, QrCode,
    FileOutput, Grid3X3, Palette
} from "lucide-react";

export const metadata: Metadata = {
    title: "All Tools Catalog - 51 Free Online Tools | FilesCenter",
    description: "Browse our complete catalog of 51 free online tools. PDF tools, image editors, text processors, developer utilities, calculators, and converters. All tools process files locally in your browser.",
    alternates: {
        canonical: "https://filescenter.vercel.app/catalog"
    }
};

interface Tool {
    name: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    category: string;
}

const allTools: Tool[] = [
    // PDF Tools
    { name: "Merge PDF", description: "Combine multiple PDF files into one document", href: "/pdf/merge", icon: Merge, category: "PDF" },
    { name: "Split PDF", description: "Extract pages or split PDF into multiple files", href: "/pdf/split", icon: Split, category: "PDF" },
    { name: "Compress PDF", description: "Reduce PDF file size while maintaining quality", href: "/pdf/compress", icon: Minimize2, category: "PDF" },
    { name: "PDF to Image", description: "Convert PDF pages to JPG or PNG images", href: "/pdf/to-image", icon: Image, category: "PDF" },
    { name: "Rotate PDF", description: "Rotate PDF pages by 90, 180, or 270 degrees", href: "/pdf/rotate", icon: RotateCw, category: "PDF" },
    { name: "Add Watermark", description: "Add text or image watermark to PDF", href: "/pdf/watermark", icon: Layers, category: "PDF" },
    { name: "Protect PDF", description: "Add password protection to PDF files", href: "/pdf/protect", icon: Shield, category: "PDF" },
    { name: "Unlock PDF", description: "Remove password from protected PDFs", href: "/pdf/unlock", icon: Unlock, category: "PDF" },

    // Image Tools
    { name: "Compress Image", description: "Reduce image file size with quality control", href: "/image/compress", icon: Minimize2, category: "Image" },
    { name: "Resize Image", description: "Change image dimensions with aspect ratio lock", href: "/image/resize", icon: RefreshCw, category: "Image" },
    { name: "Crop Image", description: "Crop images with preset or custom ratios", href: "/image/crop", icon: Crop, category: "Image" },
    { name: "Convert Format", description: "Convert between PNG, JPG, WebP formats", href: "/image/convert", icon: RefreshCw, category: "Image" },
    { name: "Image to PDF", description: "Convert multiple images to a single PDF", href: "/image/to-pdf", icon: FileText, category: "Image" },
    { name: "Image to Base64", description: "Encode images to Base64 strings", href: "/image/to-base64", icon: Code, category: "Image" },
    { name: "Rotate Image", description: "Rotate images by any angle", href: "/image/rotate", icon: RotateCw, category: "Image" },
    { name: "Flip Image", description: "Flip images horizontally or vertically", href: "/image/flip", icon: FlipHorizontal, category: "Image" },

    // Text Tools
    { name: "Word Counter", description: "Count words, characters, sentences, paragraphs", href: "/text/word-counter", icon: FileSearch, category: "Text" },
    { name: "Case Converter", description: "Convert to uppercase, lowercase, title case", href: "/text/case-converter", icon: Type, category: "Text" },
    { name: "Lorem Generator", description: "Generate placeholder lorem ipsum text", href: "/text/lorem-generator", icon: FileText, category: "Text" },
    { name: "Text Diff", description: "Compare two texts and highlight differences", href: "/text/diff", icon: FileOutput, category: "Text" },
    { name: "Remove Duplicates", description: "Remove duplicate lines from text", href: "/text/remove-duplicates", icon: Grid3X3, category: "Text" },
    { name: "Text Reverse", description: "Reverse text by characters, words, or lines", href: "/text/reverse", icon: RefreshCw, category: "Text" },
    { name: "Sort Lines", description: "Sort lines alphabetically or numerically", href: "/text/sort-lines", icon: ArrowRightLeft, category: "Text" },
    { name: "Markdown Preview", description: "Live preview markdown with HTML export", href: "/text/markdown-preview", icon: FileText, category: "Text" },
    { name: "Slug Generator", description: "Create URL-friendly slugs from text", href: "/text/slug-generator", icon: Code, category: "Text" },
    { name: "Character Counter", description: "Detailed character and text statistics", href: "/text/character-counter", icon: Type, category: "Text" },

    // Developer Tools
    { name: "JSON Formatter", description: "Format, validate, and beautify JSON", href: "/developer/json-formatter", icon: Braces, category: "Developer" },
    { name: "Base64 Encode/Decode", description: "Encode or decode Base64 strings", href: "/developer/base64", icon: Binary, category: "Developer" },
    { name: "UUID Generator", description: "Generate unique UUID v4 identifiers", href: "/developer/uuid", icon: Key, category: "Developer" },
    { name: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256 hashes", href: "/developer/hash-generator", icon: Hash, category: "Developer" },
    { name: "URL Encode/Decode", description: "Encode or decode URL components", href: "/developer/url-encoder", icon: Code, category: "Developer" },
    { name: "Regex Tester", description: "Test regular expressions with highlighting", href: "/developer/regex", icon: FileSearch, category: "Developer" },
    { name: "JWT Decoder", description: "Decode and inspect JSON Web Tokens", href: "/developer/jwt-decoder", icon: Key, category: "Developer" },
    { name: "HTML Encoder", description: "Encode and decode HTML entities", href: "/developer/html-encoder", icon: Code, category: "Developer" },
    { name: "Epoch Converter", description: "Convert Unix timestamps to dates", href: "/developer/epoch-converter", icon: Clock, category: "Developer" },
    { name: "CSS Unit Converter", description: "Convert px, rem, em, vw, vh units", href: "/developer/css-unit-converter", icon: Code, category: "Developer" },
    { name: "Color Picker", description: "Pick and extract colors from images", href: "/developer/color-picker", icon: Palette, category: "Developer" },

    // Calculator Tools
    { name: "Percentage Calculator", description: "Calculate percentages and changes", href: "/calculator/percentage", icon: Percent, category: "Calculator" },
    { name: "Age Calculator", description: "Calculate exact age in years, months, days", href: "/calculator/age", icon: Calendar, category: "Calculator" },
    { name: "BMI Calculator", description: "Calculate Body Mass Index with categories", href: "/calculator/bmi", icon: Calculator, category: "Calculator" },
    { name: "Tip Calculator", description: "Calculate tips and split bills", href: "/calculator/tip", icon: Calculator, category: "Calculator" },
    { name: "Date Calculator", description: "Calculate days between dates", href: "/calculator/date", icon: Calendar, category: "Calculator" },
    { name: "Loan Calculator", description: "Calculate monthly loan payments", href: "/calculator/loan", icon: Calculator, category: "Calculator" },

    // Converter Tools
    { name: "Unit Converter", description: "Convert length, weight, volume units", href: "/converter/unit", icon: ArrowRightLeft, category: "Converter" },
    { name: "Color Converter", description: "Convert between HEX, RGB, HSL colors", href: "/converter/color", icon: Palette, category: "Converter" },
    { name: "Currency Converter", description: "Convert between world currencies", href: "/converter/currency", icon: ArrowRightLeft, category: "Converter" },
    { name: "Timezone Converter", description: "Convert times between timezones", href: "/converter/timezone", icon: Clock, category: "Converter" },
    { name: "Number Base Converter", description: "Convert binary, hex, octal, decimal", href: "/converter/number-base", icon: Binary, category: "Converter" },
    { name: "Temperature Converter", description: "Convert Celsius, Fahrenheit, Kelvin", href: "/converter/temperature", icon: RefreshCw, category: "Converter" },

    // QR & Generator Tools
    { name: "QR Code Generator", description: "Create QR codes for URLs, WiFi, contacts", href: "/qr/generate", icon: QrCode, category: "Generator" },
    { name: "Password Generator", description: "Generate secure random passwords", href: "/generator/password", icon: Key, category: "Generator" },
];

const categories = ["PDF", "Image", "Text", "Developer", "Calculator", "Converter", "Generator"];

const categoryColors: Record<string, string> = {
    PDF: 'badge-pdf',
    Image: 'badge-image',
    Text: 'bg-gradient-to-br from-amber-500 to-orange-600',
    Developer: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    Calculator: 'bg-gradient-to-br from-purple-500 to-pink-600',
    Converter: 'bg-gradient-to-br from-teal-500 to-emerald-600',
    Generator: 'bg-gradient-to-br from-indigo-500 to-violet-600',
};

export default function CatalogPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">
                    <span className="gradient-text">Complete Tools Catalog</span>
                </h1>
                <p className="text-gray-400 text-lg">
                    {allTools.length} free tools to process files, convert formats, and boost productivity
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-12">
                {categories.map((cat) => {
                    const count = allTools.filter(t => t.category === cat).length;
                    return (
                        <div key={cat} className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                            <p className="text-2xl font-bold text-white">{count}</p>
                            <p className="text-xs text-gray-500">{cat}</p>
                        </div>
                    );
                })}
            </div>

            {/* Category Sections */}
            {categories.map((category) => {
                const categoryTools = allTools.filter(t => t.category === category);
                return (
                    <section key={category} className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`px-4 py-2 rounded-lg text-white font-medium ${categoryColors[category]}`}>
                                {category}
                            </div>
                            <span className="text-gray-500">{categoryTools.length} tools</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryTools.map((tool) => {
                                const Icon = tool.icon;
                                return (
                                    <Link
                                        key={tool.href}
                                        href={tool.href}
                                        className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`p-2.5 rounded-lg ${categoryColors[category]}`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                                    {tool.name}
                                                </h3>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {tool.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                );
            })}

            {/* Footer CTA */}
            <div className="text-center mt-16 p-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                <h2 className="text-2xl font-bold text-white mb-3">All Tools are Free & Private</h2>
                <p className="text-gray-400 mb-6">Files are processed locally in your browser. Nothing is uploaded to any server.</p>
                <Link href="/" className="inline-flex px-6 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
