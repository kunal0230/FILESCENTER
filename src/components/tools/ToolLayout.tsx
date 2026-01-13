import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

type ToolCategory = 'pdf' | 'image' | 'text' | 'developer' | 'generator' | 'converter' | 'calculator' | 'qr' | 'file';

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  category: ToolCategory;
  children: ReactNode;
}

const categoryColors: Record<ToolCategory, string> = {
  pdf: 'badge-pdf',
  image: 'badge-image',
  text: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  developer: 'bg-gradient-to-br from-orange-500 to-amber-600',
  generator: 'bg-gradient-to-br from-pink-500 to-rose-600',
  converter: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  calculator: 'bg-gradient-to-br from-violet-500 to-purple-600',
  qr: 'bg-gradient-to-br from-indigo-500 to-violet-600',
  file: 'bg-gradient-to-br from-slate-500 to-gray-600',
};

export function ToolLayout({ title, description, icon, category, children }: ToolLayoutProps) {
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to All Tools
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-xl ${categoryColors[category]}`}>
          {icon}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-gray-400 mt-1">{description}</p>
        </div>
      </div>

      {/* Tool content */}
      <div className="glass rounded-2xl p-6 sm:p-8">
        {children}
      </div>

      {/* Privacy notice */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Your files are processed locally and never leave your device</span>
      </div>
    </div>
  );
}
