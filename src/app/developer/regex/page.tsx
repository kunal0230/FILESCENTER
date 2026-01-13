'use client';

import { useState, useEffect } from 'react';
import { FileSearch, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function RegexTesterPage() {
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState('g');
    const [testString, setTestString] = useState('');
    const [matches, setMatches] = useState<{ match: string; index: number; groups?: string[] }[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!pattern || !testString) {
            setMatches([]);
            setError(null);
            return;
        }

        try {
            const regex = new RegExp(pattern, flags);
            const results: { match: string; index: number; groups?: string[] }[] = [];
            let match;

            if (flags.includes('g')) {
                while ((match = regex.exec(testString)) !== null) {
                    results.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1).length > 0 ? match.slice(1) : undefined
                    });
                    if (!match[0]) break; // Prevent infinite loop on zero-width matches
                }
            } else {
                match = regex.exec(testString);
                if (match) {
                    results.push({
                        match: match[0],
                        index: match.index,
                        groups: match.slice(1).length > 0 ? match.slice(1) : undefined
                    });
                }
            }

            setMatches(results);
            setError(null);
        } catch (e) {
            setMatches([]);
            setError(e instanceof Error ? e.message : 'Invalid regex');
        }
    }, [pattern, flags, testString]);

    const highlightMatches = () => {
        if (!pattern || matches.length === 0) return testString;

        try {
            const regex = new RegExp(pattern, flags);
            return testString.replace(regex, '<mark class="bg-yellow-500/50 text-yellow-100 px-0.5 rounded">$&</mark>');
        } catch {
            return testString;
        }
    };

    const copyPattern = async () => {
        await navigator.clipboard.writeText(`/${pattern}/${flags}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const flagOptions = [
        { flag: 'g', label: 'Global', desc: 'Find all matches' },
        { flag: 'i', label: 'Insensitive', desc: 'Case insensitive' },
        { flag: 'm', label: 'Multiline', desc: '^ and $ match line starts/ends' },
    ];

    return (
        <ToolLayout
            title="Regex Tester"
            description="Test regular expressions with live highlighting"
            icon={<FileSearch className="w-6 h-6 text-white" />}
            category="developer"
        >
            <div className="space-y-6">
                {/* Pattern Input */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Pattern</h3>
                        <button
                            onClick={copyPattern}
                            disabled={!pattern}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-50"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-mono">/</span>
                        <input
                            type="text"
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            placeholder="Enter regex pattern..."
                            className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none font-mono"
                        />
                        <span className="text-gray-500 font-mono">/</span>
                        <input
                            type="text"
                            value={flags}
                            onChange={(e) => setFlags(e.target.value)}
                            className="w-16 px-3 py-2 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none font-mono text-center"
                        />
                    </div>

                    {/* Flag toggles */}
                    <div className="flex gap-3 mt-3">
                        {flagOptions.map(({ flag, label }) => (
                            <label key={flag} className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={flags.includes(flag)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFlags(flags + flag);
                                        } else {
                                            setFlags(flags.replace(flag, ''));
                                        }
                                    }}
                                    className="rounded bg-black/30 border-white/20"
                                />
                                {label}
                            </label>
                        ))}
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm mt-2">{error}</p>
                    )}
                </div>

                {/* Test String */}
                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-400">Test String</h3>
                        {matches.length > 0 && (
                            <span className="text-xs text-green-400 font-mono">
                                {matches.length} match{matches.length !== 1 ? 'es' : ''}
                            </span>
                        )}
                    </div>
                    <textarea
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        placeholder="Enter text to test against..."
                        className="w-full h-32 p-4 bg-transparent text-white outline-none resize-none font-mono text-sm"
                    />
                </div>

                {/* Highlighted Result */}
                {testString && pattern && !error && (
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-black/20">
                            <h3 className="text-sm font-medium text-gray-400">Highlighted Matches</h3>
                        </div>
                        <div
                            className="p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                        />
                    </div>
                )}

                {/* Match Details */}
                {matches.length > 0 && (
                    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-black/20">
                            <h3 className="text-sm font-medium text-gray-400">Match Details</h3>
                        </div>
                        <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                            {matches.map((m, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-black/20 font-mono text-sm">
                                    <span className="text-gray-500 w-6">{i + 1}.</span>
                                    <span className="text-green-400">&quot;{m.match}&quot;</span>
                                    <span className="text-gray-500">at index {m.index}</span>
                                    {m.groups && (
                                        <span className="text-purple-400">
                                            groups: [{m.groups.join(', ')}]
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
