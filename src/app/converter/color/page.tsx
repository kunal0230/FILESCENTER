'use client';

import { useState, useEffect } from 'react';
import { Palette, Copy, Check } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function ColorConverterPage() {
    const [hex, setHex] = useState('#6366f1');
    const [rgb, setRgb] = useState({ r: 99, g: 102, b: 241 });
    const [hsl, setHsl] = useState({ h: 239, s: 84, l: 67 });
    const [copied, setCopied] = useState<string | null>(null);

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const rgbToHex = (r: number, g: number, b: number) => {
        return '#' + [r, g, b].map(x => {
            const hex = Math.max(0, Math.min(255, x)).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    };

    const rgbToHsl = (r: number, g: number, b: number) => {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    };

    const hslToRgb = (h: number, s: number, l: number) => {
        s /= 100; l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) { r = c; g = x; b = 0; }
        else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
        else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
        else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
        else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
        else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    };

    const updateFromHex = (newHex: string) => {
        setHex(newHex);
        const newRgb = hexToRgb(newHex);
        if (newRgb) {
            setRgb(newRgb);
            setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
        }
    };

    const updateFromRgb = (newRgb: typeof rgb) => {
        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
        setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    };

    const updateFromHsl = (newHsl: typeof hsl) => {
        setHsl(newHsl);
        const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
        setRgb(newRgb);
        setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    const copy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const randomColor = () => {
        const newHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        updateFromHex(newHex);
    };

    return (
        <ToolLayout
            title="Color Converter"
            description="Convert between HEX, RGB, and HSL color formats"
            icon={<Palette className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Color Preview */}
            <div
                className="h-32 rounded-xl mb-6 flex items-center justify-center border border-gray-200 shadow-sm"
                style={{ backgroundColor: hex }}
            >
                <button onClick={randomColor} className="px-4 py-2 rounded-lg bg-white/90 text-gray-900 shadow-sm text-sm hover:bg-white transition-colors">
                    Random Color
                </button>
            </div>

            {/* HEX */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-700">HEX</label>
                    <button onClick={() => copy(hex, 'hex')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        {copied === 'hex' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
                <input
                    type="text"
                    value={hex}
                    onChange={(e) => updateFromHex(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 font-mono text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
            </div>

            {/* RGB */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-700">RGB</label>
                    <button onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        {copied === 'rgb' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs text-gray-500">R</label>
                        <input
                            type="number"
                            min="0"
                            max="255"
                            value={rgb.r}
                            onChange={(e) => updateFromRgb({ ...rgb, r: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">G</label>
                        <input
                            type="number"
                            min="0"
                            max="255"
                            value={rgb.g}
                            onChange={(e) => updateFromRgb({ ...rgb, g: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">B</label>
                        <input
                            type="number"
                            min="0"
                            max="255"
                            value={rgb.b}
                            onChange={(e) => updateFromRgb({ ...rgb, b: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* HSL */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <label className="font-medium text-gray-700">HSL</label>
                    <button onClick={() => copy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        {copied === 'hsl' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs text-gray-500">H (°)</label>
                        <input
                            type="number"
                            min="0"
                            max="360"
                            value={hsl.h}
                            onChange={(e) => updateFromHsl({ ...hsl, h: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">S (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={hsl.s}
                            onChange={(e) => updateFromHsl({ ...hsl, s: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500">L (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={hsl.l}
                            onChange={(e) => updateFromHsl({ ...hsl, l: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-center text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
