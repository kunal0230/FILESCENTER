'use client';

import { useState } from 'react';
import { Calendar, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function AgeCalculatorPage() {
    const [birthDate, setBirthDate] = useState('');
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [result, setResult] = useState<{
        years: number;
        months: number;
        days: number;
        totalDays: number;
        totalWeeks: number;
        totalMonths: number;
        nextBirthday: number;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const calculate = () => {
        if (!birthDate) return;

        const birth = new Date(birthDate);
        const to = new Date(toDate);

        if (birth > to) {
            alert('Birth date cannot be in the future');
            return;
        }

        let years = to.getFullYear() - birth.getFullYear();
        let months = to.getMonth() - birth.getMonth();
        let days = to.getDate() - birth.getDate();

        if (days < 0) {
            months--;
            const lastMonth = new Date(to.getFullYear(), to.getMonth(), 0);
            days += lastMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        const totalDays = Math.floor((to.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const totalMonths = years * 12 + months;

        // Next birthday
        let nextBirthday = new Date(to.getFullYear(), birth.getMonth(), birth.getDate());
        if (nextBirthday <= to) {
            nextBirthday = new Date(to.getFullYear() + 1, birth.getMonth(), birth.getDate());
        }
        const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - to.getTime()) / (1000 * 60 * 60 * 24));

        setResult({
            years,
            months,
            days,
            totalDays,
            totalWeeks,
            totalMonths,
            nextBirthday: daysUntilBirthday
        });
    };

    const copyResult = () => {
        if (!result) return;
        const text = `Age: ${result.years} years, ${result.months} months, ${result.days} days`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="Age Calculator"
            description="Calculate exact age in years, months, and days"
            icon={<Calendar className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Date Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Age at Date</label>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none"
                    />
                </div>
            </div>

            <button onClick={calculate} className="btn-primary w-full mb-6">
                Calculate Age
            </button>

            {/* Results */}
            {result && (
                <div className="space-y-6">
                    {/* Main Result */}
                    <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-center">
                        <p className="text-gray-400 mb-2">Your age is</p>
                        <p className="text-4xl font-bold">
                            <span className="text-indigo-400">{result.years}</span> years,{' '}
                            <span className="text-purple-400">{result.months}</span> months,{' '}
                            <span className="text-cyan-400">{result.days}</span> days
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                            <p className="text-2xl font-bold text-indigo-400">{result.totalMonths.toLocaleString()}</p>
                            <p className="text-sm text-gray-400">Total Months</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                            <p className="text-2xl font-bold text-purple-400">{result.totalWeeks.toLocaleString()}</p>
                            <p className="text-sm text-gray-400">Total Weeks</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                            <p className="text-2xl font-bold text-cyan-400">{result.totalDays.toLocaleString()}</p>
                            <p className="text-sm text-gray-400">Total Days</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 text-center">
                            <p className="text-2xl font-bold text-green-400">{result.nextBirthday}</p>
                            <p className="text-sm text-gray-400">Days to Birthday</p>
                        </div>
                    </div>

                    <button onClick={copyResult} className="btn-secondary flex items-center gap-2 mx-auto">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy Result'}
                    </button>
                </div>
            )}
        </ToolLayout>
    );
}
