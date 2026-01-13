'use client';

import { useState } from 'react';
import { Type, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type CaseType = 'lowercase' | 'uppercase' | 'titlecase' | 'sentencecase' | 'alternating' | 'inverse';

export default function CaseConverterPage() {
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);

    const convert = (type: CaseType): string => {
        switch (type) {
            case 'lowercase':
                return text.toLowerCase();
            case 'uppercase':
                return text.toUpperCase();
            case 'titlecase':
                return text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            case 'sentencecase':
                return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
            case 'alternating':
                return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
            case 'inverse':
                return text.split('').map(c => c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()).join('');
            default:
                return text;
        }
    };

    const applyConversion = (type: CaseType) => {
        setText(convert(type));
    };

    const copyText = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const caseButtons: { type: CaseType; label: string; example: string }[] = [
        { type: 'lowercase', label: 'lowercase', example: 'hello world' },
        { type: 'uppercase', label: 'UPPERCASE', example: 'HELLO WORLD' },
        { type: 'titlecase', label: 'Title Case', example: 'Hello World' },
        { type: 'sentencecase', label: 'Sentence case', example: 'Hello world. This is text.' },
        { type: 'alternating', label: 'aLtErNaTiNg', example: 'hElLo WoRlD' },
        { type: 'inverse', label: 'InVeRsE', example: 'hELLO wORLD' },
    ];

    return (
        <ToolLayout
            title="Case Converter"
            description="Convert text between different cases"
            icon={<Type className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Text Input */}
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                className="w-full h-48 p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none text-white placeholder-gray-500"
            />

            {/* Case Buttons */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {caseButtons.map(({ type, label, example }) => (
                    <button
                        key={type}
                        onClick={() => applyConversion(type)}
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-indigo-500/50 transition-all text-left"
                    >
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-gray-500 mt-1">{example}</p>
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
                <button onClick={copyText} className="btn-primary flex items-center gap-2">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                </button>
                <button onClick={() => setText('')} className="btn-secondary">
                    Clear
                </button>
            </div>
        </ToolLayout>
    );
}
