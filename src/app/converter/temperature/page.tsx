'use client';

import { useState, useEffect } from 'react';
import { Thermometer, ArrowRightLeft } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type TempUnit = 'celsius' | 'fahrenheit' | 'kelvin';

export default function TemperatureConverterPage() {
    const [value, setValue] = useState<string>('0');
    const [fromUnit, setFromUnit] = useState<TempUnit>('celsius');
    const [results, setResults] = useState<Record<TempUnit, number>>({ celsius: 0, fahrenheit: 32, kelvin: 273.15 });

    useEffect(() => {
        const num = parseFloat(value) || 0;
        let celsius: number;

        // Convert to Celsius first
        switch (fromUnit) {
            case 'fahrenheit':
                celsius = (num - 32) * 5 / 9;
                break;
            case 'kelvin':
                celsius = num - 273.15;
                break;
            default:
                celsius = num;
        }

        setResults({
            celsius: Math.round(celsius * 100) / 100,
            fahrenheit: Math.round((celsius * 9 / 5 + 32) * 100) / 100,
            kelvin: Math.round((celsius + 273.15) * 100) / 100,
        });
    }, [value, fromUnit]);

    const units: { id: TempUnit; label: string; symbol: string }[] = [
        { id: 'celsius', label: 'Celsius', symbol: '°C' },
        { id: 'fahrenheit', label: 'Fahrenheit', symbol: '°F' },
        { id: 'kelvin', label: 'Kelvin', symbol: 'K' },
    ];

    const getTemperatureColor = (celsius: number) => {
        if (celsius < 0) return 'text-blue-400';
        if (celsius < 20) return 'text-cyan-400';
        if (celsius < 30) return 'text-green-400';
        if (celsius < 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <ToolLayout
            title="Temperature Converter"
            description="Convert between Celsius, Fahrenheit, and Kelvin"
            icon={<Thermometer className="w-6 h-6 text-white" />}
            category="converter"
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-5">
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Temperature</label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-2xl font-bold text-center"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-gray-400 block mb-2">From Unit</label>
                        <div className="grid grid-cols-3 gap-2">
                            {units.map(({ id, label, symbol }) => (
                                <button
                                    key={id}
                                    onClick={() => setFromUnit(id)}
                                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${fromUnit === id ? 'bg-indigo-500 text-white' : 'bg-black/20 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {label} ({symbol})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="grid grid-cols-3 gap-3">
                    {units.map(({ id, label, symbol }) => (
                        <div
                            key={id}
                            className={`p-4 rounded-xl border transition-all ${fromUnit === id ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <p className="text-xs text-gray-400 mb-1">{label}</p>
                            <p className={`text-2xl font-bold ${fromUnit === id ? 'text-indigo-400' : getTemperatureColor(results.celsius)}`}>
                                {results[id]}{symbol}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Temperature Scale Visual */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Reference Points</h3>
                    <div className="grid grid-cols-4 gap-2 text-xs text-center">
                        <div className="p-2 bg-blue-500/20 rounded-lg"><span className="text-blue-400">-40°</span><br />Same in °C & °F</div>
                        <div className="p-2 bg-cyan-500/20 rounded-lg"><span className="text-cyan-400">0°C / 32°F</span><br />Freezing</div>
                        <div className="p-2 bg-green-500/20 rounded-lg"><span className="text-green-400">20°C / 68°F</span><br />Room Temp</div>
                        <div className="p-2 bg-red-500/20 rounded-lg"><span className="text-red-400">100°C / 212°F</span><br />Boiling</div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
