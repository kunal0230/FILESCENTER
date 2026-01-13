'use client';

import { useState, useEffect } from 'react';
import { Binary, Copy, Check, ArrowRightLeft } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type Base = 'binary' | 'decimal' | 'hex' | 'octal';

export default function NumberBaseConverterPage() {
    const [input, setInput] = useState('');
    const [fromBase, setFromBase] = useState<Base>('decimal');
    const [results, setResults] = useState<Record<Base, string>>({
        binary: '',
        decimal: '',
        hex: '',
        octal: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<Base | null>(null);

    const bases: { id: Base; label: string; radix: number; prefix: string }[] = [
        { id: 'binary', label: 'Binary', radix: 2, prefix: '0b' },
        { id: 'decimal', label: 'Decimal', radix: 10, prefix: '' },
        { id: 'hex', label: 'Hexadecimal', radix: 16, prefix: '0x' },
        { id: 'octal', label: 'Octal', radix: 8, prefix: '0o' },
    ];

    useEffect(() => {
        if (!input) {
            setResults({ binary: '', decimal: '', hex: '', octal: '' });
            setError(null);
            return;
        }

        try {
            const radix = bases.find(b => b.id === fromBase)?.radix ?? 10;
            const cleanInput = input.replace(/^(0b|0x|0o)/i, '');
            const decimal = parseInt(cleanInput, radix);

            if (isNaN(decimal)) {
                setError('Invalid number format');
                return;
            }

            setResults({
                binary: decimal.toString(2),
                decimal: decimal.toString(10),
                hex: decimal.toString(16).toUpperCase(),
                octal: decimal.toString(8)
            });
            setError(null);
        } catch {
            setError('Conversion error');
        }
    }, [input, fromBase]);

    const copyToClipboard = async (base: Base) => {
        await navigator.clipboard.writeText(results[base]);
        setCopied(base);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ToolLayout
            title="Number Base Converter"
            description="Convert between Binary, Decimal, Hexadecimal, and Octal"
            icon={<Binary className="w-6 h-6 text-white" />}
            category="converter"
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <div>
                        <label className="text-sm text-gray-500 block mb-2">Input Number</label>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter a number..."
                            className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 outline-none font-mono text-lg transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-500 block mb-2">Input Base</label>
                        <div className="grid grid-cols-4 gap-2">
                            {bases.map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setFromBase(id)}
                                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${fromBase === id
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}
                </div>

                {/* Results */}
                {!error && input && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {bases.map(({ id, label, prefix }) => (
                            <div
                                key={id}
                                className={`p-4 rounded-xl border transition-all ${fromBase === id
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                    : 'bg-white border-gray-200 shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-sm ${fromBase === id ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</span>
                                    <button
                                        onClick={() => copyToClipboard(id)}
                                        className={`p-1.5 rounded-lg hover:bg-gray-200 ${fromBase === id ? 'text-indigo-600 hover:bg-indigo-100' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        {copied === id ? (
                                            <Check className="w-3.5 h-3.5 text-green-600" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                                <p className="font-mono text-lg text-gray-900 break-all">
                                    <span className="text-gray-500">{prefix}</span>
                                    {results[id]}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
