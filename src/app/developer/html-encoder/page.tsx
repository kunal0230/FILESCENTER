'use client';

import { useState, useEffect } from 'react';
import { Code, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type Mode = 'encode' | 'decode';

const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
};

export default function HTMLEncoderPage() {
    const [mode, setMode] = useState<Mode>('encode');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (mode === 'encode') {
            let result = input;
            for (const [char, entity] of Object.entries(htmlEntities)) {
                result = result.split(char).join(entity);
            }
            setOutput(result);
        } else {
            let result = input;
            for (const [char, entity] of Object.entries(htmlEntities)) {
                result = result.split(entity).join(char);
            }
            // Handle numeric entities
            result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)));
            result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
            setOutput(result);
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
            title="HTML Entity Encoder"
            description="Encode and decode HTML entities"
            icon={<Code className="w-6 h-6 text-white" />}
            category="developer"
        >
            <div className="space-y-6">
                <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
                    <button
                        onClick={() => setMode('encode')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'encode' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Encode HTML
                    </button>
                    <button
                        onClick={() => setMode('decode')}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'decode' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        Decode HTML
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-500">{mode === 'encode' ? 'Plain Text' : 'Encoded HTML'}</h3>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'encode' ? '<div class="test">Hello & goodbye</div>' : '&lt;div&gt;Hello&lt;/div&gt;'}
                            className="w-full h-48 p-4 bg-transparent text-gray-900 outline-none resize-none font-mono text-sm placeholder-gray-400"
                        />
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between">
                            <h3 className="text-sm font-medium text-gray-500">{mode === 'encode' ? 'Encoded HTML' : 'Decoded Text'}</h3>
                            <div className="flex gap-2">
                                <button onClick={swapContent} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-900"><ArrowRightLeft className="w-4 h-4" /></button>
                                <button onClick={copyToClipboard} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-900">{copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}</button>
                            </div>
                        </div>
                        <textarea value={output} readOnly className="w-full h-48 p-4 bg-gray-50/50 text-indigo-600 outline-none resize-none font-mono text-sm" />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Common HTML Entities</h3>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                        {Object.entries(htmlEntities).slice(0, 6).map(([char, entity]) => (
                            <span key={char} className="px-2 py-1 bg-gray-100 rounded text-gray-600 border border-gray-200">
                                <span className="text-gray-900">{char}</span> → <span className="text-indigo-600">{entity}</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
