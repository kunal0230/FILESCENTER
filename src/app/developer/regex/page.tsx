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
                {/* Pattern Input */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pattern</h3>
                        <button
                            onClick={copyPattern}
                            disabled={!pattern}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 disabled:opacity-50 transition-colors"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-mono">/</span>
                        <input
                            type="text"
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            placeholder="Enter regex pattern..."
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 outline-none font-mono placeholder-gray-400"
                        />
                        <span className="text-gray-400 font-mono">/</span>
                        <input
                            type="text"
                            value={flags}
                            onChange={(e) => setFlags(e.target.value)}
                            className="w-16 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 outline-none font-mono text-center"
                        />
                    </div>

                    {/* Flag toggles */}
                    <div className="flex gap-3 mt-3">
                        {flagOptions.map(({ flag, label }) => (
                            <label key={flag} className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer hover:text-gray-900">
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
                                    className="rounded bg-gray-50 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                {label}
                            </label>
                        ))}
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span className="w-1 h-3 bg-red-500 rounded-full inline-block"></span> {error}
                        </p>
                    )}
                </div>

                {/* Test String */}
                {/* Test String */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-500">Test String</h3>
                        {matches.length > 0 && (
                            <span className="text-xs text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                {matches.length} match{matches.length !== 1 ? 'es' : ''}
                            </span>
                        )}
                    </div>
                    <textarea
                        value={testString}
                        onChange={(e) => setTestString(e.target.value)}
                        placeholder="Enter text to test against..."
                        className="w-full h-32 p-4 bg-transparent text-gray-900 outline-none resize-none font-mono text-sm placeholder-gray-400"
                    />
                </div>

                {/* Highlighted Result */}
                {testString && pattern && !error && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-500">Highlighted Matches</h3>
                        </div>
                        <div
                            className="p-4 font-mono text-sm text-gray-600 whitespace-pre-wrap bg-gray-50/30"
                            dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                        />
                    </div>
                )}

                {/* Match Details */}
                {matches.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-sm font-medium text-gray-500">Match Details</h3>
                        </div>
                        <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                            {matches.map((m, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100 font-mono text-sm hover:border-indigo-300 transition-all">
                                    <span className="text-gray-400 w-6">{i + 1}.</span>
                                    <span className="text-green-600 bg-green-50 px-1 rounded">&quot;{m.match}&quot;</span>
                                    <span className="text-gray-500">at index {m.index}</span>
                                    {m.groups && (
                                        <span className="text-purple-600 bg-purple-50 px-1 rounded">
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
