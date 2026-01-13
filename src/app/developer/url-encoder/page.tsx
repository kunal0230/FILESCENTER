'use client';

import { useState, useEffect } from 'react';
import { Link2, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type Mode = 'encode' | 'decode';

export default function URLEncoderPage() {
    const [mode, setMode] = useState<Mode>('encode');
    const [input, setInput] = useState<string>('');
    const [output, setOutput] = useState<string>('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        try {
            if (mode === 'encode') {
                setOutput(encodeURIComponent(input));
            } else {
                setOutput(decodeURIComponent(input));
            }
        } catch (err) {
            setOutput('Invalid input');
        }
    }, [input, mode]);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const swapContent = () => {
        setInput(output);
        setMode(mode === 'encode' ? 'decode' : 'encode');
    };

    return (
        <ToolLayout
            title="URL Encoder/Decoder"
            description="Encode and decode URL components"
            icon={<Link2 className="w-6 h-6 text-white" />}
            category="developer"
        >
            <div className="max-w-3xl mx-auto">

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-xl">
                    <button
                        onClick={() => setMode('encode')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'encode' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Encode URL
                    </button>
                    <button
                        onClick={() => setMode('decode')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'decode' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Decode URL
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Input */}
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-black/20">
                            <h3 className="text-sm font-medium text-gray-400">
                                {mode === 'encode' ? 'Text to Encode' : 'Encoded URL'}
                            </h3>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'encode' ? 'Enter text with special characters...' : 'Paste encoded URL...'}
                            className="w-full h-48 p-4 bg-transparent text-white outline-none resize-none font-mono text-sm"
                        />
                    </div>

                    {/* Swap Button */}
                    <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <button
                            onClick={swapContent}
                            className="p-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Output */}
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden relative">
                        <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-400">
                                {mode === 'encode' ? 'Encoded Result' : 'Decoded Text'}
                            </h3>
                            <button
                                onClick={copyToClipboard}
                                disabled={!output}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-50"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="h-48 p-4 overflow-auto">
                            <pre className="font-mono text-sm text-indigo-300 whitespace-pre-wrap break-all">
                                {output || <span className="text-gray-600">Result will appear here...</span>}
                            </pre>
                        </div>
                    </div>
                </div>

                {/* Swap Button Mobile */}
                <div className="flex lg:hidden justify-center my-4">
                    <button
                        onClick={swapContent}
                        className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center gap-2 text-sm"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                        Swap & Switch Mode
                    </button>
                </div>

                {/* Quick Examples */}
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Examples</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Hello World!', 'user@email.com', 'https://example.com?q=test&lang=en', 'price=$100&discount=20%'].map((example) => (
                            <button
                                key={example}
                                onClick={() => { setInput(example); setMode('encode'); }}
                                className="px-3 py-1.5 rounded-lg bg-black/20 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                {example.length > 25 ? example.slice(0, 25) + '...' : example}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
