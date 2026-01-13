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
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-3 border-b border-white/5 bg-black/20">
                        <h3 className="text-sm font-medium text-gray-400">Input Text</h3>
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter title or text..."
                        className="w-full px-4 py-4 bg-transparent text-white outline-none text-lg"
                    />
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">Separator:</label>
                        <select
                            value={separator}
                            onChange={(e) => setSeparator(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-white outline-none text-sm"
                        >
                            <option value="-">Hyphen (-)</option>
                            <option value="_">Underscore (_)</option>
                            <option value=".">Dot (.)</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-400">
                        <input
                            type="checkbox"
                            checked={lowercase}
                            onChange={(e) => setLowercase(e.target.checked)}
                            className="rounded bg-black/30"
                        />
                        Lowercase
                    </label>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-xl border border-indigo-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-gray-400">Generated Slug</label>
                        <button
                            onClick={copyToClipboard}
                            disabled={!slug}
                            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-50"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="font-mono text-xl text-white break-all">
                        {slug || <span className="text-gray-500">your-slug-here</span>}
                    </p>
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-sm font-medium text-gray-400 mb-2">URL Preview</h3>
                    <p className="font-mono text-sm text-gray-400">
                        https://example.com/blog/<span className="text-indigo-400">{slug || 'your-slug'}</span>
                    </p>
                </div>
            </div>
        </ToolLayout>
    );
}
