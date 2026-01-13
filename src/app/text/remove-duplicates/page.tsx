'use client';

import { useState } from 'react';
import { Grid3X3, Copy, Check, Trash2 } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function RemoveDuplicatesPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [stats, setStats] = useState({ original: 0, unique: 0, removed: 0 });
    const [copied, setCopied] = useState(false);
    const [caseSensitive, setCaseSensitive] = useState(true);
    const [trimWhitespace, setTrimWhitespace] = useState(true);

    const removeDuplicates = () => {
        let lines = input.split('\n');
        const originalCount = lines.length;

        if (trimWhitespace) {
            lines = lines.map(l => l.trim());
        }

        const seen = new Set<string>();
        const unique: string[] = [];

        for (const line of lines) {
            const key = caseSensitive ? line : line.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(line);
            }
        }

        setOutput(unique.join('\n'));
        setStats({
            original: originalCount,
            unique: unique.length,
            removed: originalCount - unique.length
        });
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="Remove Duplicates"
            description="Remove duplicate lines from text"
            icon={<Grid3X3 className="w-6 h-6 text-white" />}
            category="text"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-700">Input Text</h3>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Paste text with duplicate lines..."
                            className="w-full h-48 p-4 bg-transparent text-gray-900 outline-none resize-none font-mono text-sm"
                        />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700">Result</h3>
                            {output && (
                                <button
                                    onClick={copyToClipboard}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                        <textarea
                            value={output}
                            readOnly
                            placeholder="Unique lines will appear here..."
                            className="w-full h-48 p-4 bg-transparent text-green-700 outline-none resize-none font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={caseSensitive}
                            onChange={(e) => setCaseSensitive(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        Case sensitive
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={trimWhitespace}
                            onChange={(e) => setTrimWhitespace(e.target.checked)}
                            className="rounded border-gray-300"
                        />
                        Trim whitespace
                    </label>
                </div>

                <button
                    onClick={removeDuplicates}
                    className="w-full py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Remove Duplicates
                </button>

                {stats.removed > 0 && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center shadow-sm">
                        <p className="text-green-700">
                            Removed <strong>{stats.removed}</strong> duplicate line{stats.removed !== 1 ? 's' : ''}
                            ({stats.original} → {stats.unique})
                        </p>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
