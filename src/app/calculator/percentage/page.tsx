'use client';

import { useState } from 'react';
import { Calculator, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function PercentageCalculatorPage() {
    const [copied, setCopied] = useState<string | null>(null);

    // Calculator 1: What is X% of Y?
    const [percentOf, setPercentOf] = useState({ percent: '', number: '', result: '' });

    // Calculator 2: X is what % of Y?
    const [whatPercent, setWhatPercent] = useState({ part: '', whole: '', result: '' });

    // Calculator 3: Percentage increase/decrease
    const [change, setChange] = useState({ from: '', to: '', result: '', type: '' });

    // Calculator 4: Add/subtract percentage
    const [addSubtract, setAddSubtract] = useState({ number: '', percent: '', resultAdd: '', resultSubtract: '' });

    const calculatePercentOf = () => {
        const p = parseFloat(percentOf.percent);
        const n = parseFloat(percentOf.number);
        if (!isNaN(p) && !isNaN(n)) {
            setPercentOf({ ...percentOf, result: ((p / 100) * n).toFixed(2) });
        }
    };

    const calculateWhatPercent = () => {
        const part = parseFloat(whatPercent.part);
        const whole = parseFloat(whatPercent.whole);
        if (!isNaN(part) && !isNaN(whole) && whole !== 0) {
            setWhatPercent({ ...whatPercent, result: ((part / whole) * 100).toFixed(2) });
        }
    };

    const calculateChange = () => {
        const from = parseFloat(change.from);
        const to = parseFloat(change.to);
        if (!isNaN(from) && !isNaN(to) && from !== 0) {
            const changePercent = ((to - from) / from) * 100;
            setChange({
                ...change,
                result: Math.abs(changePercent).toFixed(2),
                type: changePercent >= 0 ? 'increase' : 'decrease'
            });
        }
    };

    const calculateAddSubtract = () => {
        const n = parseFloat(addSubtract.number);
        const p = parseFloat(addSubtract.percent);
        if (!isNaN(n) && !isNaN(p)) {
            const amount = (p / 100) * n;
            setAddSubtract({
                ...addSubtract,
                resultAdd: (n + amount).toFixed(2),
                resultSubtract: (n - amount).toFixed(2)
            });
        }
    };

    const copy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ToolLayout
            title="Percentage Calculator"
            description="Calculate percentages, increases, and more"
            icon={<Calculator className="w-6 h-6 text-white" />}
            category="image"
        >
            <div className="space-y-8">
                {/* Calculator 1 */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-4 text-gray-900">What is X% of Y?</h3>
                    <div className="flex flex-wrap items-center gap-3 text-gray-700">
                        <span>What is</span>
                        <input
                            type="number"
                            value={percentOf.percent}
                            onChange={(e) => setPercentOf({ ...percentOf, percent: e.target.value, result: '' })}
                            className="w-20 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:outline-none focus:border-indigo-500"
                            placeholder="10"
                        />
                        <span>% of</span>
                        <input
                            type="number"
                            value={percentOf.number}
                            onChange={(e) => setPercentOf({ ...percentOf, number: e.target.value, result: '' })}
                            className="w-24 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:outline-none focus:border-indigo-500"
                            placeholder="200"
                        />
                        <button onClick={calculatePercentOf} className="btn-primary py-2">Calculate</button>
                        {percentOf.result && (
                            <span className="flex items-center gap-2 text-green-600 font-semibold">
                                = {percentOf.result}
                                <button onClick={() => copy(percentOf.result, 'percentOf')}>
                                    {copied === 'percentOf' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </span>
                        )}
                    </div>
                </div>

                {/* Calculator 2 */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-4 text-gray-900">X is what % of Y?</h3>
                    <div className="flex flex-wrap items-center gap-3 text-gray-700">
                        <input
                            type="number"
                            value={whatPercent.part}
                            onChange={(e) => setWhatPercent({ ...whatPercent, part: e.target.value, result: '' })}
                            className="w-24 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:outline-none focus:border-indigo-500"
                            placeholder="25"
                        />
                        <span>is what % of</span>
                        <input
                            type="number"
                            value={whatPercent.whole}
                            onChange={(e) => setWhatPercent({ ...whatPercent, whole: e.target.value, result: '' })}
                            className="w-24 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:outline-none focus:border-indigo-500"
                            placeholder="100"
                        />
                        <button onClick={calculateWhatPercent} className="btn-primary py-2">Calculate</button>
                        {whatPercent.result && (
                            <span className="flex items-center gap-2 text-green-600 font-semibold">
                                = {whatPercent.result}%
                                <button onClick={() => copy(whatPercent.result + '%', 'whatPercent')}>
                                    {copied === 'whatPercent' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </span>
                        )}
                    </div>
                </div>

                {/* Calculator 3 */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-4 text-gray-900">Percentage Change</h3>
                    <div className="flex flex-wrap items-center gap-3 text-gray-700">
                        <span>From</span>
                        <input
                            type="number"
                            value={change.from}
                            onChange={(e) => setChange({ ...change, from: e.target.value, result: '', type: '' })}
                            className="w-24 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:outline-none focus:border-indigo-500"
                            placeholder="100"
                        />
                        <span>to</span>
                        <input
                            type="number"
                            value={change.to}
                            onChange={(e) => setChange({ ...change, to: e.target.value, result: '', type: '' })}
                            className="w-24 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:outline-none focus:border-indigo-500"
                            placeholder="150"
                        />
                        <button onClick={calculateChange} className="btn-primary py-2">Calculate</button>
                        {change.result && (
                            <span className={`font-semibold ${change.type === 'increase' ? 'text-green-600' : 'text-red-500'}`}>
                                = {change.result}% {change.type}
                            </span>
                        )}
                    </div>
                </div>

                {/* Calculator 4 */}
                <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <h3 className="font-semibold mb-4 text-gray-900">Add/Subtract Percentage</h3>
                    <div className="flex flex-wrap items-center gap-3 text-gray-700">
                        <input
                            type="number"
                            value={addSubtract.number}
                            onChange={(e) => setAddSubtract({ ...addSubtract, number: e.target.value, resultAdd: '', resultSubtract: '' })}
                            className="w-24 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:outline-none focus:border-indigo-500"
                            placeholder="100"
                        />
                        <span>±</span>
                        <input
                            type="number"
                            value={addSubtract.percent}
                            onChange={(e) => setAddSubtract({ ...addSubtract, percent: e.target.value, resultAdd: '', resultSubtract: '' })}
                            className="w-20 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:outline-none focus:border-indigo-500"
                            placeholder="20"
                        />
                        <span>%</span>
                        <button onClick={calculateAddSubtract} className="btn-primary py-2">Calculate</button>
                    </div>
                    {(addSubtract.resultAdd || addSubtract.resultSubtract) && (
                        <div className="mt-3 flex gap-6">
                            <span className="text-green-600">+ {addSubtract.percent}% = {addSubtract.resultAdd}</span>
                            <span className="text-red-500">- {addSubtract.percent}% = {addSubtract.resultSubtract}</span>
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}
