'use client';

import { useState, useCallback, useMemo } from 'react';
import { FileJson, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

interface JsonError {
    message: string;
    line?: number;
    column?: number;
}

export default function JsonFormatterPage() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<JsonError | null>(null);
    const [copied, setCopied] = useState(false);
    const [indentSize, setIndentSize] = useState(2);

    const parseJsonWithLineInfo = (jsonString: string): { parsed: unknown; error?: JsonError } => {
        try {
            const parsed = JSON.parse(jsonString);
            return { parsed };
        } catch (e) {
            const errorMessage = (e as Error).message;

            // Try to extract line and column from error message
            const positionMatch = errorMessage.match(/position\s+(\d+)/i);
            let line = 1;
            let column = 1;

            if (positionMatch) {
                const position = parseInt(positionMatch[1]);
                const lines = jsonString.substring(0, position).split('\n');
                line = lines.length;
                column = lines[lines.length - 1].length + 1;
            }

            return {
                parsed: null,
                error: {
                    message: errorMessage.replace(/^JSON\.parse:\s*/i, ''),
                    line,
                    column
                }
            };
        }
    };

    const formatJson = useCallback(() => {
        if (!input.trim()) {
            setError({ message: 'Please enter some JSON to format' });
            setOutput('');
            return;
        }

        const { parsed, error: parseError } = parseJsonWithLineInfo(input);

        if (parseError) {
            setError(parseError);
            setOutput('');
            return;
        }

        try {
            const indentChar = indentSize === 1 ? '\t' : ' '.repeat(indentSize);
            setOutput(JSON.stringify(parsed, null, indentSize === 1 ? '\t' : indentSize));
            setError(null);
        } catch (e) {
            setError({ message: 'Failed to format JSON' });
        }
    }, [input, indentSize]);

    const minifyJson = useCallback(() => {
        if (!input.trim()) {
            setError({ message: 'Please enter some JSON to minify' });
            setOutput('');
            return;
        }

        const { parsed, error: parseError } = parseJsonWithLineInfo(input);

        if (parseError) {
            setError(parseError);
            setOutput('');
            return;
        }

        try {
            setOutput(JSON.stringify(parsed));
            setError(null);
        } catch (e) {
            setError({ message: 'Failed to minify JSON' });
        }
    }, [input]);

    const validateJson = useCallback(() => {
        if (!input.trim()) {
            setError({ message: 'Please enter some JSON to validate' });
            return;
        }

        const { error: parseError } = parseJsonWithLineInfo(input);

        if (parseError) {
            setError(parseError);
            setOutput('');
        } else {
            setError(null);
            setOutput('Success: Valid JSON');
        }
    }, [input]);

    const copyOutput = useCallback(async () => {
        if (!output) return;

        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = output;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [output]);

    const sampleJson = useCallback(() => {
        const sample = {
            name: "John Doe",
            age: 30,
            email: "john@example.com",
            isActive: true,
            address: {
                street: "123 Main St",
                city: "New York",
                country: "USA",
                zipCode: "10001"
            },
            hobbies: ["coding", "reading", "gaming"],
            scores: [95, 87, 92, 88],
            metadata: null
        };
        setInput(JSON.stringify(sample));
        setOutput('');
        setError(null);
    }, []);

    const clearAll = useCallback(() => {
        setInput('');
        setOutput('');
        setError(null);
    }, []);

    const stats = useMemo(() => {
        if (!output || output === 'Success: Valid JSON') return null;
        try {
            const parsed = JSON.parse(output);
            const type = Array.isArray(parsed) ? 'Array' : typeof parsed;
            const keyCount = typeof parsed === 'object' && parsed !== null
                ? Object.keys(parsed).length
                : 0;
            return {
                type: type.charAt(0).toUpperCase() + type.slice(1),
                size: new Blob([output]).size,
                keys: keyCount
            };
        } catch {
            return null;
        }
    }, [output]);

    return (
        <ToolLayout
            title="JSON Formatter"
            description="Format, validate, and minify JSON data"
            icon={<FileJson className="w-6 h-6 text-white" />}
            category="developer"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Input JSON</label>
                        <div className="flex gap-2">
                            <button
                                onClick={sampleJson}
                                className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                Load Sample
                            </button>
                            <button
                                onClick={clearAll}
                                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            setError(null);
                        }}
                        placeholder='{"key": "value"}'
                        className={`w-full h-64 p-4 rounded-xl bg-white border focus:outline-none resize-none font-mono text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-indigo-500'
                            }`}
                        spellCheck={false}
                    />
                    {input && (
                        <p className="text-xs text-gray-500 mt-1">
                            {new Blob([input]).size.toLocaleString()} bytes
                        </p>
                    )}
                </div>

                {/* Output */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Output</label>
                        {stats && (
                            <span className="text-xs text-gray-500">
                                {stats.type} • {stats.keys > 0 ? `${stats.keys} keys • ` : ''}{stats.size.toLocaleString()} bytes
                            </span>
                        )}
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        placeholder="Formatted JSON will appear here..."
                        className={`w-full h-64 p-4 rounded-xl bg-gray-50 border border-gray-200 resize-none font-mono text-sm shadow-sm ${output === 'Success: Valid JSON' ? 'text-green-600' : 'text-gray-900 placeholder-gray-400'
                            }`}
                    />
                </div>
            </div>

            {/* Error */}
            {
                error && (
                    <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-700 text-sm font-medium">Invalid JSON</p>
                            <p className="text-red-600 text-sm mt-1">{error.message}</p>
                            {error.line && (
                                <p className="text-red-500 text-xs mt-1">
                                    Line {error.line}, Column {error.column}
                                </p>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Controls */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-500">Indent:</label>
                    <select
                        value={indentSize}
                        onChange={(e) => setIndentSize(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                        <option value={2}>2 spaces</option>
                        <option value={4}>4 spaces</option>
                        <option value={1}>Tab</option>
                    </select>
                </div>

                <button
                    onClick={formatJson}
                    className="btn-primary flex items-center gap-2"
                    disabled={!input.trim()}
                >
                    <RefreshCw className="w-4 h-4" />
                    Format
                </button>
                <button
                    onClick={minifyJson}
                    className="btn-secondary text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
                    disabled={!input.trim()}
                >
                    Minify
                </button>
                <button
                    onClick={validateJson}
                    className="btn-secondary text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
                    disabled={!input.trim()}
                >
                    Validate
                </button>
                {output && output !== 'Success: Valid JSON' && (
                    <button
                        onClick={copyOutput}
                        className="btn-secondary flex items-center gap-2 text-gray-700 bg-white border-gray-200 hover:bg-gray-50"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>
        </ToolLayout >
    );
}
