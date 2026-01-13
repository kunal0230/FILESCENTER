'use client';

import { useState, useRef } from 'react';
import { Pipette, Copy, Check, Upload } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function ColorPickerPage() {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [pickedColor, setPickedColor] = useState<{ hex: string; rgb: string } | null>(null);
    const [colors, setColors] = useState<{ hex: string; rgb: string }[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setColors([]);
        }
    };

    const handleImageClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

        const color = { hex, rgb };
        setPickedColor(color);
        if (!colors.find(c => c.hex === hex)) {
            setColors(prev => [color, ...prev].slice(0, 10));
        }
    };

    const handleImageLoad = () => {
        if (!imgRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = imgRef.current.naturalWidth;
        canvas.height = imgRef.current.naturalHeight;
        ctx.drawImage(imgRef.current, 0, 0);
    };

    const copyColor = async (value: string) => {
        await navigator.clipboard.writeText(value);
        setCopied(value);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ToolLayout
            title="Color Picker"
            description="Pick colors from any image"
            icon={<Pipette className="w-6 h-6 text-white" />}
            category="developer"
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Image area */}
                <div className="flex-1">
                    {!imageUrl ? (
                        <label className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 hover:bg-gray-100 transition-all">
                            <Upload className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-gray-500 font-medium">Click to upload an image</p>
                            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                        </label>
                    ) : (
                        <div className="relative bg-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <img ref={imgRef} src={imageUrl} alt="" className="hidden" onLoad={handleImageLoad} />
                            <canvas
                                ref={canvasRef}
                                onClick={handleImageClick}
                                className="w-full h-auto max-h-[500px] object-contain cursor-crosshair"
                            />
                            <button
                                onClick={() => setImageUrl('')}
                                className="absolute top-2 right-2 px-3 py-1 bg-white/90 text-gray-900 text-xs rounded-lg hover:bg-white shadow-sm border border-gray-200"
                            >
                                Change Image
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Color info */}
                <div className="w-full lg:w-[320px] shrink-0 space-y-4">
                    {pickedColor && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Selected Color</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-xl shadow-lg border border-gray-200" style={{ backgroundColor: pickedColor.hex }} />
                                <div className="space-y-2">
                                    <button onClick={() => copyColor(pickedColor.hex)} className="flex items-center gap-2 text-sm font-mono text-gray-900 hover:text-indigo-600">
                                        {pickedColor.hex}
                                        {copied === pickedColor.hex ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                                    </button>
                                    <button onClick={() => copyColor(pickedColor.rgb)} className="flex items-center gap-2 text-sm font-mono text-gray-500 hover:text-indigo-600">
                                        {pickedColor.rgb}
                                        {copied === pickedColor.rgb ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {colors.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Picked Colors</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {colors.map((color, i) => (
                                    <button
                                        key={i}
                                        onClick={() => copyColor(color.hex)}
                                        className="group relative w-full aspect-square rounded-lg shadow-sm hover:ring-2 ring-indigo-500 border border-gray-100"
                                        style={{ backgroundColor: color.hex }}
                                    >
                                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded-lg transition-opacity">
                                            <Copy className="w-4 h-4 text-white drop-shadow-sm" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {!pickedColor && imageUrl && (
                        <div className="text-center text-gray-500 p-4">
                            <Pipette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Click on the image to pick a color</p>
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}
