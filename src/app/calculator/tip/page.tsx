'use client';

import { useState, useEffect } from 'react';
import { Receipt, Users, DollarSign } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function TipCalculatorPage() {
    const [billAmount, setBillAmount] = useState<string>('');
    const [tipPercent, setTipPercent] = useState<number>(18);
    const [splitCount, setSplitCount] = useState<number>(1);
    const [customTip, setCustomTip] = useState<string>('');

    const tipPresets = [15, 18, 20, 25];

    const bill = parseFloat(billAmount) || 0;
    const tipAmount = bill * (tipPercent / 100);
    const total = bill + tipAmount;
    const perPerson = total / splitCount;

    const handlePresetClick = (percent: number) => {
        setTipPercent(percent);
        setCustomTip('');
    };

    const handleCustomTip = (value: string) => {
        setCustomTip(value);
        const parsed = parseFloat(value);
        if (!isNaN(parsed) && parsed >= 0) {
            setTipPercent(parsed);
        }
    };

    return (
        <ToolLayout
            title="Tip Calculator"
            description="Calculate tips and split bills easily"
            icon={<Receipt className="w-6 h-6 text-white" />}
            category="calculator"
        >
            <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Inputs */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-5">

                        {/* Bill Amount */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Bill Amount</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    value={billAmount}
                                    onChange={(e) => setBillAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-xl"
                                />
                            </div>
                        </div>

                        {/* Tip Percentage */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Tip Percentage</label>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {tipPresets.map((percent) => (
                                    <button
                                        key={percent}
                                        onClick={() => handlePresetClick(percent)}
                                        className={`py-2.5 rounded-lg text-sm font-medium transition-all ${tipPercent === percent && !customTip
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-black/20 text-gray-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {percent}%
                                    </button>
                                ))}
                            </div>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={customTip}
                                    onChange={(e) => handleCustomTip(e.target.value)}
                                    placeholder="Custom %"
                                    className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Split */}
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Split Between</label>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                                    className="w-10 h-10 rounded-lg bg-black/30 text-white hover:bg-white/10 text-xl font-bold"
                                >
                                    -
                                </button>
                                <div className="flex-1 flex items-center justify-center gap-2">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <span className="text-2xl font-bold text-white">{splitCount}</span>
                                </div>
                                <button
                                    onClick={() => setSplitCount(splitCount + 1)}
                                    className="w-10 h-10 rounded-lg bg-black/30 text-white hover:bg-white/10 text-xl font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-xl border border-indigo-500/30 flex flex-col justify-center">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                <span className="text-gray-400">Bill</span>
                                <span className="text-xl text-white">${bill.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                <span className="text-gray-400">Tip ({tipPercent}%)</span>
                                <span className="text-xl text-green-400">+${tipAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/10">
                                <span className="text-gray-400">Total</span>
                                <span className="text-xl text-white">${total.toFixed(2)}</span>
                            </div>
                            {splitCount > 1 && (
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-gray-400">Per Person</span>
                                    <span className="text-2xl font-bold text-indigo-400">${perPerson.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {splitCount === 1 && (
                            <div className="mt-6 text-center">
                                <p className="text-4xl font-bold text-white">${total.toFixed(2)}</p>
                                <p className="text-sm text-gray-400 mt-1">Total with tip</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
