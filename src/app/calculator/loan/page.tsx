'use client';

import { useState, useEffect } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function LoanCalculatorPage() {
    const [principal, setPrincipal] = useState<string>('100000');
    const [interestRate, setInterestRate] = useState<string>('5');
    const [loanTerm, setLoanTerm] = useState<string>('30');
    const [termUnit, setTermUnit] = useState<'years' | 'months'>('years');

    const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
    const [totalPayment, setTotalPayment] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);

    useEffect(() => {
        const p = parseFloat(principal) || 0;
        const r = (parseFloat(interestRate) || 0) / 100 / 12;
        let n = parseFloat(loanTerm) || 0;
        if (termUnit === 'years') n *= 12;

        if (p > 0 && r > 0 && n > 0) {
            const monthly = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const total = monthly * n;

            setMonthlyPayment(monthly);
            setTotalPayment(total);
            setTotalInterest(total - p);
        } else if (p > 0 && n > 0) {
            // 0% interest
            setMonthlyPayment(p / n);
            setTotalPayment(p);
            setTotalInterest(0);
        }
    }, [principal, interestRate, loanTerm, termUnit]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(value);
    };

    return (
        <ToolLayout
            title="Loan Calculator"
            description="Calculate monthly loan payments and total interest"
            icon={<Calculator className="w-6 h-6 text-white" />}
            category="calculator"
        >
            <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Inputs */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-5">
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Loan Amount</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    value={principal}
                                    onChange={(e) => setPrincipal(e.target.value)}
                                    placeholder="100000"
                                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Annual Interest Rate (%)</label>
                            <input
                                type="number"
                                value={interestRate}
                                onChange={(e) => setInterestRate(e.target.value)}
                                placeholder="5"
                                step="0.1"
                                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-lg"
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Loan Term</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={loanTerm}
                                    onChange={(e) => setLoanTerm(e.target.value)}
                                    placeholder="30"
                                    className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-lg"
                                />
                                <select
                                    value={termUnit}
                                    onChange={(e) => setTermUnit(e.target.value as 'years' | 'months')}
                                    className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                                >
                                    <option value="years">Years</option>
                                    <option value="months">Months</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-xl border border-indigo-500/30">
                        <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>

                        <div className="space-y-4">
                            <div className="text-center p-4 bg-black/20 rounded-xl">
                                <p className="text-sm text-gray-400 mb-1">Monthly Payment</p>
                                <p className="text-3xl font-bold text-white">{formatCurrency(monthlyPayment)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-black/20 rounded-lg text-center">
                                    <p className="text-xs text-gray-400 mb-1">Total Payment</p>
                                    <p className="text-lg font-semibold text-white">{formatCurrency(totalPayment)}</p>
                                </div>
                                <div className="p-3 bg-black/20 rounded-lg text-center">
                                    <p className="text-xs text-gray-400 mb-1">Total Interest</p>
                                    <p className="text-lg font-semibold text-red-400">{formatCurrency(totalInterest)}</p>
                                </div>
                            </div>

                            {/* Visual breakdown */}
                            <div className="pt-4">
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                                    <span className="w-3 h-3 bg-indigo-500 rounded"></span>
                                    Principal: {formatCurrency(parseFloat(principal) || 0)}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="w-3 h-3 bg-red-500 rounded"></span>
                                    Interest: {formatCurrency(totalInterest)}
                                </div>
                                <div className="mt-2 h-4 rounded-full overflow-hidden flex">
                                    <div
                                        className="bg-indigo-500 h-full"
                                        style={{ width: `${((parseFloat(principal) || 0) / totalPayment) * 100}%` }}
                                    />
                                    <div
                                        className="bg-red-500 h-full"
                                        style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
