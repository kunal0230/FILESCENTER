'use client';

import { useState } from 'react';
import { ArrowRightLeft, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'time' | 'data';

interface UnitConfig {
    name: string;
    units: { unit: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[];
}

const unitConfigs: Record<UnitCategory, UnitConfig> = {
    length: {
        name: 'Length',
        units: [
            { unit: 'mm', label: 'Millimeters', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            { unit: 'cm', label: 'Centimeters', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
            { unit: 'm', label: 'Meters', toBase: (v) => v, fromBase: (v) => v },
            { unit: 'km', label: 'Kilometers', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
            { unit: 'in', label: 'Inches', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
            { unit: 'ft', label: 'Feet', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
            { unit: 'mi', label: 'Miles', toBase: (v) => v * 1609.34, fromBase: (v) => v / 1609.34 },
        ]
    },
    weight: {
        name: 'Weight',
        units: [
            { unit: 'mg', label: 'Milligrams', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
            { unit: 'g', label: 'Grams', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            { unit: 'kg', label: 'Kilograms', toBase: (v) => v, fromBase: (v) => v },
            { unit: 'lb', label: 'Pounds', toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
            { unit: 'oz', label: 'Ounces', toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
            { unit: 't', label: 'Metric Tons', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
        ]
    },
    temperature: {
        name: 'Temperature',
        units: [
            { unit: '°C', label: 'Celsius', toBase: (v) => v, fromBase: (v) => v },
            { unit: '°F', label: 'Fahrenheit', toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
            { unit: 'K', label: 'Kelvin', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
        ]
    },
    area: {
        name: 'Area',
        units: [
            { unit: 'mm²', label: 'Square Millimeters', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
            { unit: 'cm²', label: 'Square Centimeters', toBase: (v) => v / 10000, fromBase: (v) => v * 10000 },
            { unit: 'm²', label: 'Square Meters', toBase: (v) => v, fromBase: (v) => v },
            { unit: 'km²', label: 'Square Kilometers', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
            { unit: 'ft²', label: 'Square Feet', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
            { unit: 'ac', label: 'Acres', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
        ]
    },
    volume: {
        name: 'Volume',
        units: [
            { unit: 'ml', label: 'Milliliters', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            { unit: 'L', label: 'Liters', toBase: (v) => v, fromBase: (v) => v },
            { unit: 'm³', label: 'Cubic Meters', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
            { unit: 'gal', label: 'Gallons (US)', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
            { unit: 'fl oz', label: 'Fluid Ounces', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
        ]
    },
    speed: {
        name: 'Speed',
        units: [
            { unit: 'm/s', label: 'Meters per Second', toBase: (v) => v, fromBase: (v) => v },
            { unit: 'km/h', label: 'Kilometers per Hour', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
            { unit: 'mph', label: 'Miles per Hour', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
            { unit: 'kn', label: 'Knots', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
        ]
    },
    time: {
        name: 'Time',
        units: [
            { unit: 'ms', label: 'Milliseconds', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
            { unit: 's', label: 'Seconds', toBase: (v) => v, fromBase: (v) => v },
            { unit: 'min', label: 'Minutes', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
            { unit: 'hr', label: 'Hours', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
            { unit: 'day', label: 'Days', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
            { unit: 'wk', label: 'Weeks', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
        ]
    },
    data: {
        name: 'Data',
        units: [
            { unit: 'B', label: 'Bytes', toBase: (v) => v, fromBase: (v) => v },
            { unit: 'KB', label: 'Kilobytes', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
            { unit: 'MB', label: 'Megabytes', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
            { unit: 'GB', label: 'Gigabytes', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
            { unit: 'TB', label: 'Terabytes', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
        ]
    }
};

export default function UnitConverterPage() {
    const [category, setCategory] = useState<UnitCategory>('length');
    const [fromUnit, setFromUnit] = useState('m');
    const [toUnit, setToUnit] = useState('km');
    const [fromValue, setFromValue] = useState('1');
    const [copied, setCopied] = useState(false);

    const config = unitConfigs[category];
    const fromConfig = config.units.find(u => u.unit === fromUnit)!;
    const toConfig = config.units.find(u => u.unit === toUnit)!;

    const convert = () => {
        const value = parseFloat(fromValue);
        if (isNaN(value)) return '';
        const baseValue = fromConfig.toBase(value);
        const result = toConfig.fromBase(baseValue);
        return result.toFixed(6).replace(/\.?0+$/, '');
    };

    const result = convert();

    const swapUnits = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
        setFromValue(result || '0');
    };

    const copy = () => {
        navigator.clipboard.writeText(`${fromValue} ${fromUnit} = ${result} ${toUnit}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="Unit Converter"
            description="Convert between different units of measurement"
            icon={<ArrowRightLeft className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Category Selection */}
            <div className="flex flex-wrap gap-2 mb-6">
                {(Object.keys(unitConfigs) as UnitCategory[]).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => {
                            setCategory(cat);
                            setFromUnit(unitConfigs[cat].units[0].unit);
                            setToUnit(unitConfigs[cat].units[1]?.unit || unitConfigs[cat].units[0].unit);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${category === cat
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                    >
                        {unitConfigs[cat].name}
                    </button>
                ))}
            </div>

            {/* Converter */}
            <div className="space-y-4">
                {/* From */}
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-sm text-gray-500 mb-1 block">From</label>
                            <input
                                type="number"
                                value={fromValue}
                                onChange={(e) => setFromValue(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-xl font-medium text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="Enter value"
                            />
                        </div>
                        <div className="w-40">
                            <label className="text-sm text-gray-500 mb-1 block">Unit</label>
                            <select
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            >
                                {config.units.map((u) => (
                                    <option key={u.unit} value={u.unit}>{u.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                    <button onClick={swapUnits} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors shadow-sm">
                        <ArrowRightLeft className="w-5 h-5 rotate-90" />
                    </button>
                </div>

                {/* To */}
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-sm text-gray-500 mb-1 block">To</label>
                            <div className="w-full px-4 py-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xl font-medium text-indigo-700">
                                {result || '0'}
                            </div>
                        </div>
                        <div className="w-40">
                            <label className="text-sm text-gray-500 mb-1 block">Unit</label>
                            <select
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            >
                                {config.units.map((u) => (
                                    <option key={u.unit} value={u.unit}>{u.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copy */}
            <button onClick={copy} className="mt-6 btn-secondary flex items-center gap-2 mx-auto">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Result'}
            </button>
        </ToolLayout>
    );
}
