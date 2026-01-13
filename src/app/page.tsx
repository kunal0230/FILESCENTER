import { Metadata } from "next";
import Link from "next/link";
import {
  FileText, Image, Merge, Split, Minimize2, RotateCw,
  Shield, Unlock, FileOutput, Layers, Crop, RefreshCw,
  FlipHorizontal, Palette, Download, Code, Grid3X3,
  Type, Binary, Calculator, Calendar, ArrowRightLeft,
  Hash, FileSearch, Braces, Clock, Percent, Key, Wand2, QrCode
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Online Tools - PDF, Image, Text, Developer, Calculator | FilesCenter",
  description: "50+ free online tools for PDF, images, text, developers, and calculators. Compress PDF, resize images, convert formats, format JSON, calculate percentages. No upload required - all processing in your browser.",
  alternates: {
    canonical: "https://filescenter.vercel.app"
  }
};

interface Tool {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  popular?: boolean;
}

const pdfTools: Tool[] = [
  { name: "Merge PDF", description: "Combine multiple PDF files into one", href: "/pdf/merge", icon: Merge, category: "pdf", popular: true },
  { name: "Split PDF", description: "Extract pages from PDF file", href: "/pdf/split", icon: Split, category: "pdf" },
  { name: "Compress PDF", description: "Reduce PDF file size", href: "/pdf/compress", icon: Minimize2, category: "pdf", popular: true },
  { name: "PDF to Image", description: "Convert PDF pages to images", href: "/pdf/to-image", icon: Image, category: "pdf" },
  { name: "Rotate PDF", description: "Rotate PDF pages", href: "/pdf/rotate", icon: RotateCw, category: "pdf" },
  { name: "Add Watermark", description: "Add watermark to PDF", href: "/pdf/watermark", icon: Layers, category: "pdf" },
  { name: "Protect PDF", description: "Add password protection", href: "/pdf/protect", icon: Shield, category: "pdf" },
  { name: "Unlock PDF", description: "Remove PDF password", href: "/pdf/unlock", icon: Unlock, category: "pdf" },
];

const imageTools: Tool[] = [
  { name: "Compress Image", description: "Reduce image file size", href: "/image/compress", icon: Minimize2, category: "image", popular: true },
  { name: "Resize Image", description: "Change image dimensions", href: "/image/resize", icon: RefreshCw, category: "image", popular: true },
  { name: "Crop Image", description: "Crop images with ratios", href: "/image/crop", icon: Crop, category: "image" },
  { name: "Convert Format", description: "PNG, JPG, WebP conversion", href: "/image/convert", icon: RefreshCw, category: "image", popular: true },
  { name: "Image to PDF", description: "Convert images to PDF", href: "/image/to-pdf", icon: FileText, category: "image" },
  { name: "Image to Base64", description: "Convert to Base64 string", href: "/image/to-base64", icon: Code, category: "image" },
  { name: "Rotate Image", description: "Rotate images 90°/180°", href: "/image/rotate", icon: RotateCw, category: "image" },
  { name: "Flip Image", description: "Flip horizontally/vertically", href: "/image/flip", icon: FlipHorizontal, category: "image" },
];

const textTools: Tool[] = [
  { name: "Word Counter", description: "Count words, characters, sentences", href: "/text/word-counter", icon: FileSearch, category: "text", popular: true },
  { name: "Case Converter", description: "Convert text case", href: "/text/case-converter", icon: Type, category: "text", popular: true },
  { name: "Lorem Generator", description: "Generate placeholder text", href: "/text/lorem-generator", icon: FileText, category: "text" },
  { name: "Text Diff", description: "Compare two texts", href: "/text/diff", icon: FileOutput, category: "text" },
  { name: "Remove Duplicates", description: "Remove duplicate lines", href: "/text/remove-duplicates", icon: Grid3X3, category: "text" },
  { name: "Text Reverse", description: "Reverse text or words", href: "/text/reverse", icon: RefreshCw, category: "text" },
  { name: "Sort Lines", description: "Sort lines alphabetically", href: "/text/sort-lines", icon: ArrowRightLeft, category: "text" },
  { name: "Markdown Preview", description: "Live markdown preview", href: "/text/markdown-preview", icon: FileText, category: "text" },
  { name: "Slug Generator", description: "Create URL-friendly slugs", href: "/text/slug-generator", icon: Code, category: "text" },
  { name: "Char Counter", description: "Count characters & stats", href: "/text/character-counter", icon: Type, category: "text" },
];

const developerTools: Tool[] = [
  { name: "JSON Formatter", description: "Format & validate JSON", href: "/developer/json-formatter", icon: Braces, category: "developer", popular: true },
  { name: "Base64 Encode/Decode", description: "Encode or decode Base64", href: "/developer/base64", icon: Binary, category: "developer", popular: true },
  { name: "UUID Generator", description: "Generate unique IDs", href: "/developer/uuid", icon: Key, category: "developer", popular: true },
  { name: "Hash Generator", description: "Generate MD5, SHA hashes", href: "/developer/hash-generator", icon: Hash, category: "developer" },
  { name: "URL Encode/Decode", description: "Encode or decode URLs", href: "/developer/url-encoder", icon: Code, category: "developer" },
  { name: "Regex Tester", description: "Test regular expressions", href: "/developer/regex", icon: FileSearch, category: "developer" },
  { name: "JWT Decoder", description: "Decode JSON Web Tokens", href: "/developer/jwt-decoder", icon: Key, category: "developer" },
  { name: "HTML Encoder", description: "Encode/decode HTML entities", href: "/developer/html-encoder", icon: Code, category: "developer" },
  { name: "Epoch Converter", description: "Unix timestamp converter", href: "/developer/epoch-converter", icon: Clock, category: "developer" },
  { name: "CSS Units", description: "Convert px, rem, em, vw", href: "/developer/css-unit-converter", icon: Code, category: "developer" },
  { name: "Color Picker", description: "Pick colors from images", href: "/developer/color-picker", icon: Palette, category: "developer" },
];

const calculatorTools: Tool[] = [
  { name: "Percentage Calculator", description: "Calculate percentages", href: "/calculator/percentage", icon: Percent, category: "calculator", popular: true },
  { name: "Age Calculator", description: "Calculate exact age", href: "/calculator/age", icon: Calendar, category: "calculator", popular: true },
  { name: "BMI Calculator", description: "Calculate Body Mass Index", href: "/calculator/bmi", icon: Calculator, category: "calculator" },
  { name: "Tip Calculator", description: "Calculate tips & split bills", href: "/calculator/tip", icon: Calculator, category: "calculator" },
  { name: "Date Calculator", description: "Days between dates", href: "/calculator/date", icon: Calendar, category: "calculator" },
  { name: "Loan Calculator", description: "Calculate loan payments", href: "/calculator/loan", icon: Calculator, category: "calculator" },
];


const converterTools: Tool[] = [
  { name: "Unit Converter", description: "Convert units of measurement", href: "/converter/unit", icon: ArrowRightLeft, category: "converter", popular: true },
  { name: "Color Converter", description: "HEX, RGB, HSL conversion", href: "/converter/color", icon: Palette, category: "converter", popular: true },
  { name: "Currency Converter", description: "Convert currencies", href: "/converter/currency", icon: ArrowRightLeft, category: "converter" },
  { name: "Timezone Converter", description: "Convert timezones", href: "/converter/timezone", icon: Clock, category: "converter" },
  { name: "Number Base", description: "Binary, Hex, Decimal", href: "/converter/number-base", icon: Binary, category: "converter" },
  { name: "Temperature", description: "Convert °C, °F, K", href: "/converter/temperature", icon: RefreshCw, category: "converter" },
];

const qrTools: Tool[] = [
  { name: "QR Generator", description: "Create QR codes for URLs, WiFi, contacts", href: "/qr/generate", icon: QrCode, category: "qr", popular: true },
];

const generatorTools: Tool[] = [
  { name: "Password Generator", description: "Create secure passwords", href: "/generator/password", icon: Key, category: "generator", popular: true },
];

const categoryColors: Record<string, string> = {
  pdf: 'bg-gradient-to-br from-rose-400/90 to-orange-400/90',
  image: 'bg-gradient-to-br from-emerald-400/90 to-teal-400/90',
  text: 'bg-gradient-to-br from-amber-400/90 to-yellow-400/90',
  developer: 'bg-gradient-to-br from-sky-400/90 to-blue-400/90',
  calculator: 'bg-gradient-to-br from-violet-400/90 to-purple-400/90',
  converter: 'bg-gradient-to-br from-teal-400/90 to-cyan-400/90',
  qr: 'bg-gradient-to-br from-indigo-400/90 to-blue-400/90',
  generator: 'bg-gradient-to-br from-pink-400/90 to-rose-400/90',
};

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link href={tool.href} className="tool-card rounded-2xl p-5 block group">
      <div className="flex items-start gap-3">
        <div className={`p-2.5 rounded-xl ${categoryColors[tool.category]}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-800 group-hover:text-teal-600 transition-colors truncate">
              {tool.name}
            </h3>
            {tool.popular && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 shrink-0 font-medium">
                Popular
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mt-0.5 truncate">{tool.description}</p>
        </div>
      </div>
    </Link>
  );
}

function ToolSection({ title, description, tools, icon: Icon, color }: {
  title: string;
  description: string;
  tools: Tool[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.href} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="gradient-text">50+ Powerful Tools</span>
              <br />
              <span style={{ color: 'var(--text-heading)' }}>Built for You</span>
            </h1>
            <p className="text-xl mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              PDF, images, text, developer tools & more.
              <span className="font-semibold" style={{ color: 'var(--primary)' }}> 100% free</span> —
              everything runs in your browser.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {[
                { href: '#pdf-tools', label: 'PDF', color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
                { href: '#image-tools', label: 'Image', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
                { href: '#text-tools', label: 'Text', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
                { href: '#developer-tools', label: 'Developer', color: 'bg-sky-50 text-sky-600 hover:bg-sky-100' },
                { href: '#calculator-tools', label: 'Calculators', color: 'bg-violet-50 text-violet-600 hover:bg-violet-100' },
                { href: '#converter-tools', label: 'Converters', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
              ].map((item) => (
                <a key={item.href} href={item.href} className={`${item.color} px-4 py-2 rounded-full font-medium text-sm transition-colors`}>
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span>Fast Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" />
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span>No Limits</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Sections */}
      <div id="pdf-tools">
        <ToolSection title="PDF Tools" description="Edit, convert, and optimize PDFs" tools={pdfTools} icon={FileText} color="badge-pdf" />
      </div>
      <div id="image-tools">
        <ToolSection title="Image Tools" description="Resize, convert, and enhance images" tools={imageTools} icon={Image} color="badge-image" />
      </div>
      <div id="text-tools">
        <ToolSection title="Text Tools" description="Format, convert, and analyze text" tools={textTools} icon={Type} color="bg-gradient-to-br from-amber-500 to-orange-600" />
      </div>
      <div id="developer-tools">
        <ToolSection title="Developer Tools" description="Format, encode, and debug" tools={developerTools} icon={Code} color="bg-gradient-to-br from-blue-500 to-cyan-600" />
      </div>
      <div id="calculator-tools">
        <ToolSection title="Calculators" description="Calculate percentages, age, and more" tools={calculatorTools} icon={Calculator} color="bg-gradient-to-br from-purple-500 to-pink-600" />
      </div>
      <div id="converter-tools">
        <ToolSection title="Converters" description="Convert units, colors, and formats" tools={converterTools} icon={ArrowRightLeft} color="bg-gradient-to-br from-teal-500 to-emerald-600" />
      </div>
      <div id="qr-tools">
        <ToolSection title="QR Code" description="Generate and scan QR codes" tools={qrTools} icon={QrCode} color="bg-gradient-to-br from-indigo-500 to-violet-600" />
      </div>
      <div id="generator-tools">
        <ToolSection title="Generators" description="Create passwords, lorem ipsum, and more" tools={generatorTools} icon={Wand2} color="bg-gradient-to-br from-pink-500 to-rose-600" />
      </div>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose FilesCenter?</h2>
            <p className="text-gray-400">Privacy, speed, and simplicity in everything we do.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Private</h3>
              <p className="text-gray-400">Files never leave your computer. All processing happens locally.</p>
            </div>

            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-400">No uploads or downloads. Process files instantly.</p>
            </div>

            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Always Free</h3>
              <p className="text-gray-400">No hidden fees, subscriptions, or limits. Free forever.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
