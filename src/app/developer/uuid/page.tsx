'use client';

import { useState } from 'react';
import { Fingerprint, Copy, Check, RefreshCw, Plus } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function UUIDGeneratorPage() {
    const [uuids, setUuids] = useState<string[]>([]);
    const [count, setCount] = useState(1);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [version, setVersion] = useState<'v4' | 'v1'>('v4');

    const generateUUID = (): string => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for older browsers
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    const handleGenerate = () => {
        const newUuids = Array.from({ length: count }, () => generateUUID());
        setUuids(newUuids);
    };

    const copyToClipboard = async (uuid: string, index: number) => {
        await navigator.clipboard.writeText(uuid);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const copyAll = async () => {
        await navigator.clipboard.writeText(uuids.join('\n'));
        setCopiedIndex(-1);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <ToolLayout
            title="UUID Generator"
            description="Generate unique identifiers (UUIDs) instantly"
            icon={<Fingerprint className="w-6 h-6 text-white" />}
            category="developer"
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* LEFT: Controls */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">

                    <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Settings</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-2">Version</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setVersion('v4')}
                                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${version === 'v4' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        UUID v4 (Random)
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 block mb-2">Count</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={count}
                                        onChange={(e) => setCount(Number(e.target.value))}
                                        className="flex-1 h-2 bg-black/30 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <span className="text-sm font-mono text-indigo-400 w-8 text-right">{count}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        className="w-full py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Generate {count} UUID{count > 1 ? 's' : ''}
                    </button>

                    {uuids.length > 1 && (
                        <button
                            onClick={copyAll}
                            className="w-full py-2.5 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors"
                        >
                            {copiedIndex === -1 ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            Copy All
                        </button>
                    )}
                </div>

                {/* RIGHT: Results */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[400px]">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                        <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Fingerprint className="w-4 h-4 text-indigo-600" />
                            Generated UUIDs
                        </h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {uuids.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center">
                                <div className="text-gray-500">
                                    <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">Click Generate to create UUIDs</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {uuids.map((uuid, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-indigo-300 group transition-all"
                                    >
                                        <span className="text-xs text-gray-400 w-6">{index + 1}.</span>
                                        <code className="flex-1 font-mono text-sm text-indigo-600 select-all">{uuid}</code>
                                        <button
                                            onClick={() => copyToClipboard(uuid, index)}
                                            className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                                        >
                                            {copiedIndex === index ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
