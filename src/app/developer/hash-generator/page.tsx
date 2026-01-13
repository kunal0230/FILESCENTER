'use client';

import { useState, useCallback } from 'react';
import { Hash, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export default function HashGeneratorPage() {
    const [input, setInput] = useState('');
    const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>({
        'SHA-1': '',
        'SHA-256': '',
        'SHA-384': '',
        'SHA-512': '',
    });
    const [copied, setCopied] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uppercase, setUppercase] = useState(false);

    const generateHash = useCallback(async (text: string, algorithm: HashAlgorithm): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }, []);

    const generateAllHashes = useCallback(async () => {
        if (!input.trim()) {
            setError('Please enter some text to hash');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const algorithms: HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
            const results: Record<HashAlgorithm, string> = {
                'SHA-1': '',
                'SHA-256': '',
                'SHA-384': '',
                'SHA-512': '',
            };

            for (const algo of algorithms) {
                results[algo] = await generateHash(input, algo);
            }

            setHashes(results);
        } catch (err) {
            setError('Failed to generate hashes. Your browser may not support Web Crypto API.');
        } finally {
            setIsProcessing(false);
        }
    }, [input, generateHash]);

    const copyHash = useCallback(async (hash: string, algorithm: string) => {
        if (!hash) return;

        const textToCopy = uppercase ? hash.toUpperCase() : hash;

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(algorithm);
            setTimeout(() => setCopied(null), 2000);
        } catch {
            setError('Failed to copy to clipboard');
        }
    }, [uppercase]);

    const formatHash = (hash: string) => {
        return uppercase ? hash.toUpperCase() : hash;
    };

    const clearAll = useCallback(() => {
        setInput('');
        setHashes({
            'SHA-1': '',
            'SHA-256': '',
            'SHA-384': '',
            'SHA-512': '',
        });
        setError(null);
    }, []);

    const hashInfo: Record<HashAlgorithm, { bits: number; security: string }> = {
        'SHA-1': { bits: 160, security: 'Deprecated - not secure' },
        'SHA-256': { bits: 256, security: 'Secure' },
        'SHA-384': { bits: 384, security: 'Very Secure' },
        'SHA-512': { bits: 512, security: 'Maximum Security' },
    };

    return (
        <ToolLayout
            title="Hash Generator"
            description="Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes"
            icon={<Hash className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Input */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Text to Hash</label>
                    <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-300">
                        Clear
                    </button>
                </div>
                <textarea
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setError(null);
                    }}
                    placeholder="Enter text to generate hash values..."
                    className="w-full h-32 p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none"
                    spellCheck={false}
                />
                {input && (
                    <p className="text-xs text-gray-500 mt-1">
                        {input.length.toLocaleString()} characters • {new Blob([input]).size.toLocaleString()} bytes
                    </p>
                )}
            </div>

            {/* Options */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={generateAllHashes}
                    disabled={isProcessing || !input.trim()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                    {isProcessing ? 'Generating...' : 'Generate Hashes'}
                </button>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={uppercase}
                        onChange={(e) => setUppercase(e.target.checked)}
                        className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Uppercase</span>
                </label>
            </div>

            {/* Results */}
            {(hashes['SHA-256'] || isProcessing) && (
                <div className="space-y-3">
                    {(Object.keys(hashes) as HashAlgorithm[]).map((algo) => (
                        <div key={algo} className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{algo}</span>
                                    <span className="text-xs text-gray-500">
                                        ({hashInfo[algo].bits} bits)
                                    </span>
                                    {algo === 'SHA-1' && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                                            Deprecated
                                        </span>
                                    )}
                                </div>
                                {hashes[algo] && (
                                    <button
                                        onClick={() => copyHash(hashes[algo], algo)}
                                        className="p-1.5 rounded hover:bg-white/10 transition-colors"
                                    >
                                        {copied === algo ? (
                                            <Check className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                            <div className="font-mono text-sm text-green-400 break-all">
                                {hashes[algo] ? formatHash(hashes[algo]) : (
                                    <span className="text-gray-500">Generating...</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info */}
            <div className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                <h3 className="font-medium mb-2">About Hash Functions</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                    <li>• <strong>SHA-256</strong> is recommended for most use cases</li>
                    <li>• <strong>SHA-512</strong> provides maximum security but longer output</li>
                    <li>• <strong>SHA-1</strong> is deprecated and should not be used for security</li>
                    <li>• Hash functions are one-way - you cannot reverse a hash to get the original text</li>
                </ul>
            </div>
        </ToolLayout>
    );
}
