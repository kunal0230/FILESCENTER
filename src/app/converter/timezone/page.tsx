'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowRightLeft } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

const timezones = [
    { id: 'UTC', label: 'UTC', offset: 0 },
    { id: 'America/New_York', label: 'New York (EST)', offset: -5 },
    { id: 'America/Los_Angeles', label: 'Los Angeles (PST)', offset: -8 },
    { id: 'America/Chicago', label: 'Chicago (CST)', offset: -6 },
    { id: 'Europe/London', label: 'London (GMT)', offset: 0 },
    { id: 'Europe/Paris', label: 'Paris (CET)', offset: 1 },
    { id: 'Europe/Berlin', label: 'Berlin (CET)', offset: 1 },
    { id: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
    { id: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
    { id: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
    { id: 'Asia/Kolkata', label: 'India (IST)', offset: 5.5 },
    { id: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
    { id: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 11 },
    { id: 'Pacific/Auckland', label: 'Auckland (NZST)', offset: 13 },
];

export default function TimezoneConverterPage() {
    const [fromTz, setFromTz] = useState('America/New_York');
    const [toTz, setToTz] = useState('Asia/Kolkata');
    const [inputTime, setInputTime] = useState('12:00');
    const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
    const [result, setResult] = useState<string>('');

    useEffect(() => {
        if (!inputTime || !inputDate) return;

        try {
            const fromOffset = timezones.find(t => t.id === fromTz)?.offset ?? 0;
            const toOffset = timezones.find(t => t.id === toTz)?.offset ?? 0;

            const [hours, minutes] = inputTime.split(':').map(Number);
            const date = new Date(inputDate);
            date.setHours(hours, minutes, 0, 0);

            // Convert to UTC then to target timezone
            const utcMillis = date.getTime() - (fromOffset * 60 * 60 * 1000);
            const targetMillis = utcMillis + (toOffset * 60 * 60 * 1000);
            const targetDate = new Date(targetMillis);

            setResult(targetDate.toLocaleString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }));
        } catch {
            setResult('Invalid date/time');
        }
    }, [fromTz, toTz, inputTime, inputDate]);

    const swapTimezones = () => {
        const temp = fromTz;
        setFromTz(toTz);
        setToTz(temp);
    };

    return (
        <ToolLayout
            title="Timezone Converter"
            description="Convert times between different timezones"
            icon={<Clock className="w-6 h-6 text-white" />}
            category="converter"
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                    {/* Input time and date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-500 block mb-2">Time</label>
                            <input
                                type="time"
                                value={inputTime}
                                onChange={(e) => setInputTime(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500 block mb-2">Date</label>
                            <input
                                type="date"
                                value={inputDate}
                                onChange={(e) => setInputDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Timezone selectors */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="text-sm text-gray-500 block mb-2">From</label>
                            <select
                                value={fromTz}
                                onChange={(e) => setFromTz(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            >
                                {timezones.map((tz) => (
                                    <option key={tz.id} value={tz.id}>{tz.label}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={swapTimezones}
                            className="mt-6 p-3 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors shadow-sm"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                        </button>

                        <div className="flex-1">
                            <label className="text-sm text-gray-500 block mb-2">To</label>
                            <select
                                value={toTz}
                                onChange={(e) => setToTz(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            >
                                {timezones.map((tz) => (
                                    <option key={tz.id} value={tz.id}>{tz.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Result */}
                {result && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm text-center">
                        <p className="text-sm text-gray-500 mb-2">Converted Time</p>
                        <p className="text-2xl font-bold text-gray-900">{result}</p>
                        <p className="text-sm text-indigo-600 mt-2">
                            {timezones.find(t => t.id === toTz)?.label}
                        </p>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
