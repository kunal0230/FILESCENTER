'use client';

import { useState, useRef } from 'react';
import { RotateCw, Download, Upload } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';

export default function RotateImagePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [rotation, setRotation] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFilesSelected = (newFiles: File[]) => {
        if (newFiles.length > 0) {
            setFiles([newFiles[0]]);
            setRotation(0);
            const url = URL.createObjectURL(newFiles[0]);
            setPreviewUrl(url);
        }
    };

    const handleRemoveFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFiles([]);
        setPreviewUrl('');
        setRotation(0);
    };

    const rotateBy = (degrees: number) => {
        setRotation((prev) => (prev + degrees) % 360);
    };

    const downloadRotated = async () => {
        if (!files[0] || !canvasRef.current) return;

        const img = new Image();
        img.src = previewUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;

        const radians = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(radians));
        const cos = Math.abs(Math.cos(radians));

        canvas.width = img.width * cos + img.height * sin;
        canvas.height = img.width * sin + img.height * cos;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(radians);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rotated-${rotation}deg-${files[0].name}`;
            a.click();
            URL.revokeObjectURL(url);
        }, files[0].type || 'image/png');
    };

    return (
        <ToolLayout
            title="Rotate Image"
            description="Rotate images by 90°, 180°, or custom angles"
            icon={<RotateCw className="w-6 h-6 text-white" />}
            category="image"
        >
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Controls */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">
                    <FileUploader
                        accept="image/*"
                        multiple={false}
                        maxFiles={1}
                        onFilesSelected={handleFilesSelected}
                        files={files}
                        onRemoveFile={handleRemoveFile}
                    />

                    {files.length > 0 && (
                        <>
                            <div className="bg-white/50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Quick Rotate</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {[90, 180, 270, 0].map((deg) => (
                                        <button
                                            key={deg}
                                            onClick={() => setRotation(deg)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${rotation === deg
                                                ? 'bg-indigo-500 text-white shadow-sm'
                                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                                }`}
                                        >
                                            {deg === 0 ? 'Reset' : `${deg}°`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/50 p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Fine Control</h3>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => rotateBy(-90)}
                                        className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        <RotateCw className="w-5 h-5 transform -scale-x-100" />
                                    </button>
                                    <div className="flex-1 text-center">
                                        <p className="text-2xl font-bold text-gray-900">{rotation}°</p>
                                    </div>
                                    <button
                                        onClick={() => rotateBy(90)}
                                        className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        <RotateCw className="w-5 h-5" />
                                    </button>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="359"
                                    value={rotation}
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    className="w-full mt-3 accent-indigo-500 bg-gray-200 h-1.5 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={downloadRotated}
                                className="w-full py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download Rotated Image
                            </button>
                        </>
                    )}
                </div>

                {/* Right: Preview */}
                <div className="flex-1 bg-white/50 rounded-xl border border-gray-200 min-h-[400px] flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                        <div className="p-8">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{ transform: `rotate(${rotation}deg)` }}
                                className="max-w-full max-h-80 object-contain transition-transform duration-300"
                            />
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Upload an image to rotate</p>
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}
