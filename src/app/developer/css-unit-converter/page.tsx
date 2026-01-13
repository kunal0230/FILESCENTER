'use client';

import { useState, useEffect } from 'react';
import { Ruler, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type CSSUnit = 'px' | 'rem' | 'em' | 'vw' | 'vh' | '%' | 'pt';

export default function CSSUnitConverterPage() {
    const [value, setValue] = useState<string>('16');
    const [fromUnit, setFromUnit] = useState<CSSUnit>('px');
    const [baseFontSize, setBaseFontSize] = useState<string>('16');
    const [viewportWidth, setViewportWidth] = useState<string>('1920');
    const [viewportHeight, setViewportHeight] = useState<string>('1080');
    const [results, setResults] = useState<Record<CSSUnit, string>>({} as Record<CSSUnit, string>);
    const [copied, setCopied] = useState<string | null>(null);

    const units: { id: CSSUnit; label: string }[] = [
        { id: 'px', label: 'Pixels (px)' },
        { id: 'rem', label: 'Root EM (rem)' },
        { id: 'em', label: 'EM (em)' },
        { id: 'vw', label: 'Viewport Width (vw)' },
        { id: 'vh', label: 'Viewport Height (vh)' },
        { id: '%', label: 'Percentage (%)' },
        { id: 'pt', label: 'Points (pt)' },
    ];

    useEffect(() => {
        const num = parseFloat(value) || 0;
        const base = parseFloat(baseFontSize) || 16;
        const vw = parseFloat(viewportWidth) || 1920;
        const vh = parseFloat(viewportHeight) || 1080;

        let px: number;

        // Convert to pixels first
        switch (fromUnit) {
            case 'rem':
            case 'em':
                px = num * base;
                break;
            case 'vw':
                px = (num * vw) / 100;
                break;
            case 'vh':
                px = (num * vh) / 100;
                break;
            case '%':
                px = (num * base) / 100;
                break;
            case 'pt':
                px = num * 1.333;
                break;
            default:
                px = num;
        }

        // Convert from pixels to all units
        setResults({
            px: px.toFixed(2),
            rem: (px / base).toFixed(4),
            em: (px / base).toFixed(4),
            vw: ((px / vw) * 100).toFixed(4),
            vh: ((px / vh) * 100).toFixed(4),
            '%': ((px / base) * 100).toFixed(2),
            pt: (px / 1.333).toFixed(2),
        });
    }, [value, fromUnit, baseFontSize, viewportWidth, viewportHeight]);

    const copyValue = async (unit: CSSUnit) => {
        const text = `${results[unit]}${unit}`;
        await navigator.clipboard.writeText(text);
        setCopied(unit);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ToolLayout
            title="CSS Unit Converter"
            description="Convert between px, rem, em, vw, vh, and more"
            icon={<Ruler className="w-6 h-6 text-white" />}
            category="developer"
        >
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">Value</label>
                            <input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none font-mono text-xl"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 block mb-2">From Unit</label>
                            <select
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value as CSSUnit)}
                                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                            >
                                {units.map(({ id, label }) => (
                                    <option key={id} value={id}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Base Font Size (px)</label>
                            <input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white outline-none text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Viewport Width (px)</label>
                            <input type="number" value={viewportWidth} onChange={(e) => setViewportWidth(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white outline-none text-sm" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Viewport Height (px)</label>
                            <input type="number" value={viewportHeight} onChange={(e) => setViewportHeight(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white outline-none text-sm" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {units.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => copyValue(id)}
                            className={`p-4 rounded-xl border transition-all text-left ${fromUnit === id ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-white/5 border-white/10 hover:border-indigo-500/30'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs text-gray-500">{id.toUpperCase()}</span>
                                {copied === id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100" />}
                            </div>
                            <p className="font-mono text-lg text-white">{results[id]}<span className="text-gray-500">{id}</span></p>
                        </button>
                    ))}
                </div>
            </div>
        </ToolLayout>
    );
}
