'use client';

import { useState } from 'react';
import { FileOutput, ArrowRightLeft } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function TextDiffPage() {
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [diffResult, setDiffResult] = useState<{ type: 'same' | 'add' | 'remove'; text: string }[]>([]);

    const computeDiff = () => {
        const lines1 = text1.split('\n');
        const lines2 = text2.split('\n');
        const result: { type: 'same' | 'add' | 'remove'; text: string }[] = [];

        const maxLen = Math.max(lines1.length, lines2.length);

        for (let i = 0; i < maxLen; i++) {
            const l1 = lines1[i];
            const l2 = lines2[i];

            if (l1 === l2) {
                if (l1 !== undefined) result.push({ type: 'same', text: l1 });
            } else {
                if (l1 !== undefined) result.push({ type: 'remove', text: l1 });
                if (l2 !== undefined) result.push({ type: 'add', text: l2 });
            }
        }

        setDiffResult(result);
    };

    const swapTexts = () => {
        const temp = text1;
        setText1(text2);
        setText2(temp);
    };

    return (
        <ToolLayout
            title="Text Diff"
            description="Compare two texts and see the differences"
            icon={<FileOutput className="w-6 h-6 text-white" />}
            category="text"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-black/20">
                            <h3 className="text-sm font-medium text-gray-400">Original Text</h3>
                        </div>
                        <textarea
                            value={text1}
                            onChange={(e) => setText1(e.target.value)}
                            placeholder="Paste your original text here..."
                            className="w-full h-48 p-4 bg-transparent text-white outline-none resize-none font-mono text-sm"
                        />
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-black/20">
                            <h3 className="text-sm font-medium text-gray-400">Modified Text</h3>
                        </div>
                        <textarea
                            value={text2}
                            onChange={(e) => setText2(e.target.value)}
                            placeholder="Paste your modified text here..."
                            className="w-full h-48 p-4 bg-transparent text-white outline-none resize-none font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={computeDiff}
                        className="flex-1 py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 flex items-center justify-center gap-2"
                    >
                        <FileOutput className="w-4 h-4" />
                        Compare Texts
                    </button>
                    <button
                        onClick={swapTexts}
                        className="px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                    </button>
                </div>

                {diffResult.length > 0 && (
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-400">Differences</h3>
                            <div className="flex gap-4 text-xs">
                                <span className="text-red-400">- Removed</span>
                                <span className="text-green-400">+ Added</span>
                            </div>
                        </div>
                        <div className="p-4 font-mono text-sm max-h-64 overflow-y-auto">
                            {diffResult.map((line, i) => (
                                <div
                                    key={i}
                                    className={`py-0.5 px-2 ${line.type === 'remove' ? 'bg-red-500/20 text-red-300' :
                                            line.type === 'add' ? 'bg-green-500/20 text-green-300' :
                                                'text-gray-400'
                                        }`}
                                >
                                    <span className="mr-2 opacity-50">
                                        {line.type === 'remove' ? '-' : line.type === 'add' ? '+' : ' '}
                                    </span>
                                    {line.text || <span className="opacity-30">(empty line)</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
