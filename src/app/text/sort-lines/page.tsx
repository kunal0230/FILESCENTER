'use client';

import { useState } from 'react';
import { ArrowUpDown, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type SortOrder = 'asc' | 'desc' | 'reverse' | 'shuffle' | 'numeric-asc' | 'numeric-desc';

export default function SortLinesPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [copied, setCopied] = useState(false);
    const [removeBlanks, setRemoveBlanks] = useState(false);

    const sortLines = () => {
        let lines = input.split('\n');

        if (removeBlanks) {
            lines = lines.filter(l => l.trim() !== '');
        }

        switch (sortOrder) {
            case 'asc':
                lines.sort((a, b) => a.localeCompare(b));
                break;
            case 'desc':
                lines.sort((a, b) => b.localeCompare(a));
                break;
            case 'reverse':
                lines.reverse();
                break;
            case 'shuffle':
                for (let i = lines.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [lines[i], lines[j]] = [lines[j], lines[i]];
                }
                break;
            case 'numeric-asc':
                lines.sort((a, b) => parseFloat(a) - parseFloat(b));
                break;
            case 'numeric-desc':
                lines.sort((a, b) => parseFloat(b) - parseFloat(a));
                break;
        }

        setOutput(lines.join('\n'));
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sortOptions: { id: SortOrder; label: string }[] = [
        { id: 'asc', label: 'A → Z' },
        { id: 'desc', label: 'Z → A' },
        { id: 'numeric-asc', label: '1 → 9' },
        { id: 'numeric-desc', label: '9 → 1' },
        { id: 'reverse', label: 'Reverse' },
        { id: 'shuffle', label: 'Shuffle' },
    ];

    return (
        <ToolLayout
            title="Sort Lines"
            description="Sort text lines alphabetically, numerically, or randomly"
            icon={<ArrowUpDown className="w-6 h-6 text-white" />}
            category="text"
        >
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Sort Order</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {sortOptions.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => setSortOrder(id)}
                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${sortOrder === id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 mt-3 cursor-pointer">
                        <input type="checkbox" checked={removeBlanks} onChange={(e) => setRemoveBlanks(e.target.checked)} className="rounded border-gray-300" />
                        Remove blank lines
                    </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-700">Input</h3>
                        </div>
                        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Enter lines to sort..." className="w-full h-48 p-4 bg-transparent text-gray-900 outline-none resize-none font-mono text-sm" />
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between">
                            <h3 className="text-sm font-medium text-gray-700">Sorted Output</h3>
                            {output && <button onClick={copyToClipboard} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900">{copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}</button>}
                        </div>
                        <textarea value={output} readOnly placeholder="Sorted lines..." className="w-full h-48 p-4 bg-transparent text-indigo-600 outline-none resize-none font-mono text-sm" />
                    </div>
                </div>

                <button onClick={sortLines} disabled={!input} className="w-full py-3 rounded-xl font-medium bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    Sort Lines
                </button>
            </div>
        </ToolLayout>
    );
}
