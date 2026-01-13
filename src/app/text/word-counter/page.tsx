'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Copy, Check, RotateCcw } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

interface TextStats {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    sentences: number;
    paragraphs: number;
    lines: number;
    readingTime: number;
    speakingTime: number;
    avgWordLength: number;
    longestWord: string;
}

export default function WordCounterPage() {
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);

    const stats: TextStats = useMemo(() => {
        const trimmedText = text.trim();

        // Handle empty text
        if (!trimmedText) {
            return {
                characters: 0,
                charactersNoSpaces: 0,
                words: 0,
                sentences: 0,
                paragraphs: 0,
                lines: 0,
                readingTime: 0,
                speakingTime: 0,
                avgWordLength: 0,
                longestWord: '',
            };
        }

        // Characters
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;

        // Words - handle multiple spaces, tabs, newlines
        const wordMatches = trimmedText.match(/\b[\w']+\b/g) || [];
        const words = wordMatches.length;

        // Sentences - handle abbreviations, multiple punctuation
        const sentenceMatches = trimmedText.match(/[^.!?]*[.!?]+/g) || [];
        const sentences = sentenceMatches.length || (trimmedText.length > 0 ? 1 : 0);

        // Paragraphs - handle various line break formats
        const paragraphMatches = trimmedText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
        const paragraphs = paragraphMatches.length || (trimmedText.length > 0 ? 1 : 0);

        // Lines
        const lines = text.split(/\n/).length;

        // Reading/Speaking time (words per minute)
        const readingTime = Math.max(1, Math.ceil(words / 200));
        const speakingTime = Math.max(1, Math.ceil(words / 150));

        // Average word length
        const avgWordLength = words > 0
            ? parseFloat((wordMatches.join('').length / words).toFixed(1))
            : 0;

        // Longest word
        const longestWord = wordMatches.reduce((longest, word) =>
            word.length > longest.length ? word : longest, ''
        );

        return {
            characters,
            charactersNoSpaces,
            words,
            sentences,
            paragraphs,
            lines,
            readingTime,
            speakingTime,
            avgWordLength,
            longestWord,
        };
    }, [text]);

    const copyStats = useCallback(() => {
        const statsText = [
            `Characters: ${stats.characters}`,
            `Characters (no spaces): ${stats.charactersNoSpaces}`,
            `Words: ${stats.words}`,
            `Sentences: ${stats.sentences}`,
            `Paragraphs: ${stats.paragraphs}`,
            `Lines: ${stats.lines}`,
            `Reading time: ${stats.readingTime} min`,
            `Speaking time: ${stats.speakingTime} min`,
        ].join('\n');

        navigator.clipboard.writeText(statsText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            // Fallback for clipboard API failure
            alert('Failed to copy. Please select and copy manually.');
        });
    }, [stats]);

    const clearText = useCallback(() => {
        setText('');
    }, []);

    const handlePaste = useCallback(async () => {
        try {
            const clipboardText = await navigator.clipboard.readText();
            setText(prev => prev + clipboardText);
        } catch {
            // Clipboard read not supported or denied
        }
    }, []);

    return (
        <ToolLayout
            title="Word Counter"
            description="Count words, characters, sentences, and more"
            icon={<FileText className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-center">
                    <p className="text-3xl font-bold text-indigo-400">{stats.words.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Words</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center">
                    <p className="text-3xl font-bold text-purple-400">{stats.characters.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Characters</p>
                </div>
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                    <p className="text-3xl font-bold text-cyan-400">{stats.sentences.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Sentences</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                    <p className="text-3xl font-bold text-green-400">{stats.paragraphs.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Paragraphs</p>
                </div>
            </div>

            {/* Text Input */}
            <div className="relative">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your text here to analyze..."
                    className="w-full h-64 p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none resize-none text-white placeholder-gray-500"
                    spellCheck={false}
                />
                {text.length > 0 && (
                    <span className="absolute bottom-3 right-3 text-xs text-gray-500">
                        {stats.characters.toLocaleString()} chars
                    </span>
                )}
            </div>

            {/* Additional Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-gray-400">Chars (no spaces)</p>
                    <p className="font-semibold">{stats.charactersNoSpaces.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-gray-400">Lines</p>
                    <p className="font-semibold">{stats.lines.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-gray-400">Reading Time</p>
                    <p className="font-semibold">{stats.readingTime} min</p>
                </div>
                <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-gray-400">Speaking Time</p>
                    <p className="font-semibold">{stats.speakingTime} min</p>
                </div>
            </div>

            {/* Extra Stats */}
            {stats.words > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-gray-400">Avg Word Length</p>
                        <p className="font-semibold">{stats.avgWordLength} chars</p>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5">
                        <p className="text-gray-400">Longest Word</p>
                        <p className="font-semibold truncate" title={stats.longestWord}>
                            {stats.longestWord || '-'}
                        </p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
                <button
                    onClick={copyStats}
                    className="btn-secondary flex items-center gap-2"
                    disabled={stats.characters === 0}
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Stats'}
                </button>
                <button
                    onClick={clearText}
                    className="btn-secondary flex items-center gap-2"
                    disabled={text.length === 0}
                >
                    <RotateCcw className="w-4 h-4" />
                    Clear
                </button>
            </div>
        </ToolLayout>
    );
}
