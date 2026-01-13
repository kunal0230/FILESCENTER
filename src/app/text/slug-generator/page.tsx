'use client';

import { useState, useEffect } from 'react';
import { Link2, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function SlugGeneratorPage() {
    const [input, setInput] = useState('');
    const [slug, setSlug] = useState('');
    const [copied, setCopied] = useState(false);
    const [separator, setSeparator] = useState('-');
    const [lowercase, setLowercase] = useState(true);

    useEffect(() => {
        let result = input
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove accents
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .trim()
            .replace(/\s+/g, separator); // Replace spaces with separator

        if (lowercase) {
            result = result.toLowerCase();
        }

        setSlug(result);
    }, [input, separator, lowercase]);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(slug);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="Slug Generator"
            description="Create URL-friendly slugs from text"
            icon={<Link2 className="w-6 h-6 text-white" />}
            category="text"
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-700">Input Text</h3>
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter title or text..."
                        className="w-full px-4 py-4 bg-transparent text-gray-900 outline-none text-lg"
                    />
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Separator:</label>
                        <select
                            value={separator}
                            onChange={(e) => setSeparator(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 outline-none text-sm"
                        >
                            <option value="-">Hyphen (-)</option>
                            <option value="_">Underscore (_)</option>
                            <option value=".">Dot (.)</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={lowercase}
                            onChange={(e) => setLowercase(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        Lowercase
                    </label>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-6 rounded-xl border border-indigo-500/20">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-indigo-900 font-medium">Generated Slug</label>
                        <button
                            onClick={copyToClipboard}
                            disabled={!slug}
                            className="p-2 rounded-lg hover:bg-white/50 text-indigo-700 hover:text-indigo-900 disabled:opacity-50 transition-colors"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="font-mono text-xl text-indigo-900 break-all font-medium">
                        {slug || <span className="text-indigo-400/50">your-slug-here</span>}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">URL Preview</h3>
                    <p className="font-mono text-sm text-gray-500">
                        https://example.com/blog/<span className="text-indigo-600">{slug || 'your-slug'}</span>
                    </p>
                </div>
            </div>
        </ToolLayout>
    );
}
