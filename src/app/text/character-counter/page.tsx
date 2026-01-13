'use client';

import { useState, useEffect } from 'react';
import { Type } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function CharacterCounterPage() {
    const [text, setText] = useState('');
    const [stats, setStats] = useState({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        readingTime: 0,
        speakingTime: 0,
    });

    useEffect(() => {
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
        const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length;
        const lines = text.split('\n').length;
        const readingTime = Math.ceil(words / 200); // ~200 wpm
        const speakingTime = Math.ceil(words / 150); // ~150 wpm

        setStats({
            characters: chars,
            charactersNoSpaces: charsNoSpaces,
            words,
            sentences,
            paragraphs,
            lines,
            readingTime,
            speakingTime,
        });
    }, [text]);

    const statItems = [
        { label: 'Characters', value: stats.characters, color: 'text-indigo-400' },
        { label: 'Without Spaces', value: stats.charactersNoSpaces, color: 'text-purple-400' },
        { label: 'Words', value: stats.words, color: 'text-blue-400' },
        { label: 'Sentences', value: stats.sentences, color: 'text-cyan-400' },
        { label: 'Paragraphs', value: stats.paragraphs, color: 'text-teal-400' },
        { label: 'Lines', value: stats.lines, color: 'text-green-400' },
    ];

    return (
        <ToolLayout
            title="Character Counter"
            description="Count characters, words, sentences, and more"
            icon={<Type className="w-6 h-6 text-white" />}
            category="text"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {statItems.map(({ label, value, color }) => (
                        <div key={label} className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                            <p className="text-xs text-gray-500 mt-1">{label}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-400">Enter your text</h3>
                        <div className="text-xs text-gray-500">
                            ~{stats.readingTime} min read • ~{stats.speakingTime} min speak
                        </div>
                    </div>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type or paste your text here..."
                        className="w-full h-64 p-4 bg-transparent text-white outline-none resize-none"
                    />
                </div>

                {text && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Character Breakdown</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="p-3 bg-black/20 rounded-lg">
                                <span className="text-gray-400">Letters: </span>
                                <span className="text-white">{text.replace(/[^a-zA-Z]/g, '').length}</span>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg">
                                <span className="text-gray-400">Numbers: </span>
                                <span className="text-white">{text.replace(/[^0-9]/g, '').length}</span>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg">
                                <span className="text-gray-400">Spaces: </span>
                                <span className="text-white">{(text.match(/\s/g) || []).length}</span>
                            </div>
                            <div className="p-3 bg-black/20 rounded-lg">
                                <span className="text-gray-400">Special: </span>
                                <span className="text-white">{text.replace(/[a-zA-Z0-9\s]/g, '').length}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
