'use client';

import { useState } from 'react';
import { Calendar, ArrowRight, Plus, Minus } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type Mode = 'between' | 'add' | 'subtract';

export default function DateCalculatorPage() {
    const [mode, setMode] = useState<Mode>('between');
    const [date1, setDate1] = useState<string>('');
    const [date2, setDate2] = useState<string>('');
    const [days, setDays] = useState<string>('');
    const [result, setResult] = useState<string | null>(null);

    const calculate = () => {
        if (mode === 'between') {
            if (!date1 || !date2) return;
            const d1 = new Date(date1);
            const d2 = new Date(date2);
            const diffTime = Math.abs(d2.getTime() - d1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const weeks = Math.floor(diffDays / 7);
            const months = Math.floor(diffDays / 30.44);
            const years = Math.floor(diffDays / 365.25);

            let resultText = `${diffDays} days`;
            if (weeks >= 1) resultText += ` (${weeks} weeks)`;
            if (months >= 1) resultText += ` • ${months} months`;
            if (years >= 1) resultText += ` • ${years} years`;
            setResult(resultText);
        } else {
            if (!date1 || !days) return;
            const d = new Date(date1);
            const daysNum = parseInt(days) * (mode === 'subtract' ? -1 : 1);
            d.setDate(d.getDate() + daysNum);
            setResult(d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <ToolLayout
            title="Date Calculator"
            description="Calculate days between dates or add/subtract days"
            icon={<Calendar className="w-6 h-6 text-white" />}
            category="calculator"
        >
            <div className="max-w-2xl mx-auto">

                {/* Mode Selection */}
                <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-xl">
                    <button
                        onClick={() => { setMode('between'); setResult(null); }}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === 'between' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <ArrowRight className="w-4 h-4" />
                        Days Between
                    </button>
                    <button
                        onClick={() => { setMode('add'); setResult(null); }}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === 'add' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Plus className="w-4 h-4" />
                        Add Days
                    </button>
                    <button
                        onClick={() => { setMode('subtract'); setResult(null); }}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${mode === 'subtract' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Minus className="w-4 h-4" />
                        Subtract Days
                    </button>
                </div>

                <div className="bg-white/5 p-6 rounded-xl border border-white/10">

                    {mode === 'between' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={date1}
                                    onChange={(e) => setDate1(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none"
                                />
                                {date1 && <p className="text-xs text-gray-500 mt-1">{formatDate(date1)}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={date2}
                                    onChange={(e) => setDate2(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none"
                                />
                                {date2 && <p className="text-xs text-gray-500 mt-1">{formatDate(date2)}</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Starting Date</label>
                                <input
                                    type="date"
                                    value={date1}
                                    onChange={(e) => setDate1(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none"
                                />
                                {date1 && <p className="text-xs text-gray-500 mt-1">{formatDate(date1)}</p>}
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">
                                    Days to {mode === 'add' ? 'Add' : 'Subtract'}
                                </label>
                                <input
                                    type="number"
                                    value={days}
                                    onChange={(e) => setDays(e.target.value)}
                                    placeholder="30"
                                    min="0"
                                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={calculate}
                        className="w-full py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        Calculate
                    </button>
                </div>

                {/* Result */}
                {result && (
                    <div className="mt-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-xl border border-indigo-500/30 text-center">
                        <p className="text-sm text-gray-400 mb-2">
                            {mode === 'between' ? 'Difference' : `Date after ${mode === 'add' ? 'adding' : 'subtracting'} ${days} days`}
                        </p>
                        <p className="text-2xl font-bold text-white">{result}</p>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
