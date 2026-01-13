'use client';

import { useState, useCallback } from 'react';
import { Binary, Copy, Check, ArrowRightLeft, Upload, AlertCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function Base64Page() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<string | null>(null);

    const encodeToBase64 = (text: string): string => {
        try {
            // Handle Unicode properly
            const bytes = new TextEncoder().encode(text);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        } catch (e) {
            throw new Error('Failed to encode text');
        }
    };

    const decodeFromBase64 = (base64: string): string => {
        try {
            // Clean input (remove whitespace, line breaks)
            const cleaned = base64.replace(/\s/g, '');

            // Validate base64 format
            if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
                throw new Error('Invalid Base64 characters detected');
            }

            // Check padding
            if (cleaned.length % 4 !== 0) {
                throw new Error('Invalid Base64 length (must be multiple of 4)');
            }

            const binary = atob(cleaned);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            return new TextDecoder().decode(bytes);
        } catch (e) {
            if (e instanceof Error && e.message.includes('Invalid')) {
                throw e;
            }
            throw new Error('Invalid Base64 string - unable to decode');
        }
    };

    const process = useCallback(() => {
        setError(null);
        setFileInfo(null);

        if (!input.trim()) {
            setError('Please enter some text to ' + mode);
            setOutput('');
            return;
        }

        try {
            if (mode === 'encode') {
                const encoded = encodeToBase64(input);
                setOutput(encoded);
                setFileInfo(`Encoded: ${input.length} chars → ${encoded.length} chars (${Math.round((encoded.length / input.length) * 100)}%)`);
            } else {
                const decoded = decodeFromBase64(input);
                setOutput(decoded);
                setFileInfo(`Decoded: ${input.length} chars → ${decoded.length} chars`);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Processing failed');
            setOutput('');
        }
    }, [input, mode]);

    const copyOutput = useCallback(async () => {
        if (!output) return;

        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setError('Failed to copy to clipboard');
        }
    }, [output]);

    const swap = useCallback(() => {
        if (!output) return;
        setInput(output);
        setOutput('');
        setMode(prev => prev === 'encode' ? 'decode' : 'encode');
        setError(null);
        setFileInfo(null);
    }, [output]);

    const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Limit file size to 5MB
        if (file.size > 5 * 1024 * 1024) {
            setError('File too large. Maximum size is 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (mode === 'encode') {
                // Read as data URL and extract base64 part
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                setOutput(base64);
                setFileInfo(`File: ${file.name} (${formatSize(file.size)}) → ${formatSize(base64.length)}`);
                setError(null);
            } else {
                // Read as text for decoding
                setInput(reader.result as string);
            }
        };
        reader.onerror = () => setError('Failed to read file');

        if (mode === 'encode') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    }, [mode]);

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const clearAll = useCallback(() => {
        setInput('');
        setOutput('');
        setError(null);
        setFileInfo(null);
    }, []);

    return (
        <ToolLayout
            title="Base64 Encoder/Decoder"
            description="Encode or decode Base64 strings with Unicode support"
            icon={<Binary className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => { setMode('encode'); setOutput(''); setError(null); setFileInfo(null); }}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${mode === 'encode' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                >
                    Encode
                </button>
                <button
                    onClick={() => { setMode('decode'); setOutput(''); setError(null); setFileInfo(null); }}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${mode === 'decode' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                >
                    Decode
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Input */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">
                        {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
                    </label>
                    <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-300">
                        Clear
                    </button>
                </div>
                <textarea
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setError(null); }}
                    placeholder={mode === 'encode' ? 'Enter text to encode (supports Unicode)...' : 'Enter Base64 string to decode...'}
                    className="w-full h-32 p-4 rounded-xl bg-white border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none font-mono text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all"
                    spellCheck={false}
                />
                {input && (
                    <p className="text-xs text-gray-500 mt-1">{input.length.toLocaleString()} characters</p>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-4">
                <button onClick={process} className="btn-primary flex-1 sm:flex-none">
                    {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
                </button>

                <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {mode === 'encode' ? 'Encode File' : 'Load File'}
                    <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept={mode === 'encode' ? '*' : '.txt,.text'}
                    />
                </label>
            </div>

            {/* Info */}
            {fileInfo && (
                <p className="text-sm text-indigo-600 mb-4">{fileInfo}</p>
            )}

            {/* Output */}
            {output && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium">Result</label>
                        <div className="flex gap-2">
                            <button
                                onClick={swap}
                                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                                <ArrowRightLeft className="w-3 h-3" /> Swap
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        className="w-full h-32 p-4 rounded-xl bg-gray-50 border border-gray-200 resize-none font-mono text-sm text-gray-900 shadow-sm"
                    />
                    <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{output.length.toLocaleString()} characters</p>
                        <button
                            onClick={copyOutput}
                            className="btn-secondary flex items-center gap-2 text-sm py-2 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>
            )}
        </ToolLayout>
    );
}
