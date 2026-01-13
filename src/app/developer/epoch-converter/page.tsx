'use client';

import { useState, useEffect } from 'react';
import { Clock, Copy, Check, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function EpochConverterPage() {
    const [epochInput, setEpochInput] = useState('');
    const [dateInput, setDateInput] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [currentEpoch, setCurrentEpoch] = useState(0);
    const [convertedDate, setConvertedDate] = useState<string | null>(null);
    const [convertedEpoch, setConvertedEpoch] = useState<number | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [unit, setUnit] = useState<'seconds' | 'milliseconds'>('seconds');

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentEpoch(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!epochInput) {
            setConvertedDate(null);
            return;
        }
        let timestamp = parseInt(epochInput);
        if (unit === 'seconds') timestamp *= 1000;
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            setConvertedDate(date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short',
            }));
        } else {
            setConvertedDate('Invalid timestamp');
        }
    }, [epochInput, unit]);

    useEffect(() => {
        if (!dateInput) {
            setConvertedEpoch(null);
            return;
        }
        const dateStr = `${dateInput}T${timeInput || '00:00'}`;
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            setConvertedEpoch(unit === 'seconds' ? Math.floor(date.getTime() / 1000) : date.getTime());
        } else {
            setConvertedEpoch(null);
        }
    }, [dateInput, timeInput, unit]);

    const copyValue = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setCopied(value);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ToolLayout
            title="Epoch/Unix Converter"
            description="Convert between Unix timestamps and dates"
            icon={<Clock className="w-6 h-6 text-white" />}
            category="developer"
        >
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Current Epoch */}
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-4 rounded-xl border border-indigo-500/30 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400">Current Unix Timestamp</p>
                        <p className="text-2xl font-mono font-bold text-white">{currentEpoch}</p>
                    </div>
                    <button
                        onClick={() => copyValue(currentEpoch.toString())}
                        className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                    >
                        {copied === currentEpoch.toString() ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>

                {/* Unit Toggle */}
                <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl">
                    <button
                        onClick={() => setUnit('seconds')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${unit === 'seconds' ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}
                    >
                        Seconds
                    </button>
                    <button
                        onClick={() => setUnit('milliseconds')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium ${unit === 'milliseconds' ? 'bg-indigo-500 text-white' : 'text-gray-400'}`}
                    >
                        Milliseconds
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Epoch to Date */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Epoch → Date</h3>
                        <input
                            type="number"
                            value={epochInput}
                            onChange={(e) => setEpochInput(e.target.value)}
                            placeholder={unit === 'seconds' ? '1704067200' : '1704067200000'}
                            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none font-mono"
                        />
                        {convertedDate && (
                            <div className="mt-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                <p className="text-sm text-green-400">{convertedDate}</p>
                            </div>
                        )}
                    </div>

                    {/* Date to Epoch */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 mb-3">Date → Epoch</h3>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="date"
                                value={dateInput}
                                onChange={(e) => setDateInput(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                            />
                            <input
                                type="time"
                                value={timeInput}
                                onChange={(e) => setTimeInput(e.target.value)}
                                className="px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                            />
                        </div>
                        {convertedEpoch !== null && (
                            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 flex justify-between items-center">
                                <p className="font-mono text-indigo-400">{convertedEpoch}</p>
                                <button onClick={() => copyValue(convertedEpoch.toString())} className="p-1 hover:bg-white/10 rounded">
                                    {copied === convertedEpoch.toString() ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
