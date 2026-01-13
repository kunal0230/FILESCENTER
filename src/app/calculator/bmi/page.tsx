'use client';

import { useState } from 'react';
import { Activity, Calculator } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type Unit = 'metric' | 'imperial';

export default function BMICalculatorPage() {
    const [unit, setUnit] = useState<Unit>('metric');
    const [weight, setWeight] = useState<string>('');
    const [height, setHeight] = useState<string>('');
    const [heightFt, setHeightFt] = useState<string>('');
    const [heightIn, setHeightIn] = useState<string>('');
    const [bmi, setBmi] = useState<number | null>(null);

    const calculateBMI = () => {
        let weightKg: number;
        let heightM: number;

        if (unit === 'metric') {
            weightKg = parseFloat(weight);
            heightM = parseFloat(height) / 100;
        } else {
            weightKg = parseFloat(weight) * 0.453592; // lbs to kg
            const totalInches = (parseFloat(heightFt) * 12) + parseFloat(heightIn || '0');
            heightM = totalInches * 0.0254;
        }

        if (isNaN(weightKg) || isNaN(heightM) || heightM === 0) {
            setBmi(null);
            return;
        }

        const bmiValue = weightKg / (heightM * heightM);
        setBmi(Math.round(bmiValue * 10) / 10);
    };

    const getBMICategory = () => {
        if (!bmi) return null;
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400', bg: 'bg-blue-500/20' };
        if (bmi < 25) return { label: 'Normal', color: 'text-green-400', bg: 'bg-green-500/20' };
        if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
        return { label: 'Obese', color: 'text-red-400', bg: 'bg-red-500/20' };
    };

    const category = getBMICategory();

    const getBMIPosition = () => {
        if (!bmi) return 0;
        // Scale: 15-40 range
        const min = 15, max = 40;
        return Math.max(0, Math.min(100, ((bmi - min) / (max - min)) * 100));
    };

    return (
        <ToolLayout
            title="BMI Calculator"
            description="Calculate your Body Mass Index and health category"
            icon={<Activity className="w-6 h-6 text-white" />}
            category="calculator"
        >
            <div className="max-w-2xl mx-auto">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">

                    {/* Unit Toggle */}
                    <div className="flex gap-2 mb-6 bg-black/20 p-1 rounded-lg">
                        <button
                            onClick={() => setUnit('metric')}
                            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${unit === 'metric' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Metric (kg/cm)
                        </button>
                        <button
                            onClick={() => setUnit('imperial')}
                            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${unit === 'imperial' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Imperial (lb/ft)
                        </button>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">
                                Weight ({unit === 'metric' ? 'kg' : 'lb'})
                            </label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder={unit === 'metric' ? '70' : '154'}
                                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-lg"
                            />
                        </div>

                        {unit === 'metric' ? (
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Height (cm)</label>
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="175"
                                    className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-lg"
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Height</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={heightFt}
                                        onChange={(e) => setHeightFt(e.target.value)}
                                        placeholder="5"
                                        className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-lg"
                                    />
                                    <span className="flex items-center text-gray-400">ft</span>
                                    <input
                                        type="number"
                                        value={heightIn}
                                        onChange={(e) => setHeightIn(e.target.value)}
                                        placeholder="9"
                                        className="flex-1 px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-lg"
                                    />
                                    <span className="flex items-center text-gray-400">in</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={calculateBMI}
                        className="w-full py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 flex items-center justify-center gap-2"
                    >
                        <Calculator className="w-4 h-4" />
                        Calculate BMI
                    </button>
                </div>

                {/* Result */}
                {bmi !== null && category && (
                    <div className="mt-6 bg-white/5 p-6 rounded-xl border border-white/10">
                        <div className="text-center mb-6">
                            <p className="text-gray-400 text-sm mb-2">Your BMI</p>
                            <p className="text-5xl font-bold text-white mb-2">{bmi}</p>
                            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${category.bg} ${category.color}`}>
                                {category.label}
                            </span>
                        </div>

                        {/* BMI Scale */}
                        <div className="relative h-4 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500">
                            <div
                                className="absolute top-0 w-1 h-full bg-white shadow-lg rounded-full transform -translate-x-1/2"
                                style={{ left: `${getBMIPosition()}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>15</span>
                            <span>18.5</span>
                            <span>25</span>
                            <span>30</span>
                            <span>40</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                            <span>Underweight</span>
                            <span>Normal</span>
                            <span>Overweight</span>
                            <span>Obese</span>
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
