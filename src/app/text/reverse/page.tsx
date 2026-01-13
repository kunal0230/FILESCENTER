'use client';

import { useState } from 'react';
import { RefreshCw, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type ReverseMode = 'characters' | 'words' | 'lines';

export default function TextReversePage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<ReverseMode>('characters');
    const [copied, setCopied] = useState(false);

    const reverseText = () => {
        let result = '';

        switch (mode) {
            case 'characters':
                result = input.split('').reverse().join('');
                break;
            case 'words':
                result = input.split(' ').reverse().join(' ');
                break;
            case 'lines':
                result = input.split('\n').reverse().join('\n');
                break;
        }

        setOutput(result);
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const modes: { id: ReverseMode; label: string; desc: string }[] = [
        { id: 'characters', label: 'Characters', desc: 'abc → cba' },
        { id: 'words', label: 'Words', desc: 'hello world → world hello' },
        { id: 'lines', label: 'Lines', desc: 'Reverse line order' },
    ];

    return (
        <ToolLayout
            title="Text Reverse"
            description="Reverse text by characters, words, or lines"
            icon={<RefreshCw className="w-6 h-6 text-white" />}
            category="text"
        >
            <div className="space-y-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Reverse Mode</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {modes.map(({ id, label, desc }) => (
                            <button
                                key={id}
                                onClick={() => setMode(id)}
                                className={`p-3 rounded-lg text-left transition-all ${mode === id
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-black/20 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <p className="font-medium text-sm">{label}</p>
                                <p className="text-xs opacity-70 mt-0.5">{desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-black/20">
                            <h3 className="text-sm font-medium text-gray-400">Input Text</h3>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to reverse..."
                            className="w-full h-40 p-4 bg-transparent text-white outline-none resize-none font-mono text-sm"
                        />
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-400">Reversed Text</h3>
                            {output && (
                                <button
                                    onClick={copyToClipboard}
                                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                        <textarea
                            value={output}
                            readOnly
                            placeholder="Reversed text will appear here..."
                            className="w-full h-40 p-4 bg-transparent text-indigo-300 outline-none resize-none font-mono text-sm"
                        />
                    </div>
                </div>

                <button
                    onClick={reverseText}
                    disabled={!input}
                    className="w-full py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reverse Text
                </button>
            </div>
        </ToolLayout>
    );
}
