'use client';

import { useState, useRef } from 'react';
import { FlipHorizontal, FlipVertical, Download, Upload } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';

export default function FlipImagePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFilesSelected = (newFiles: File[]) => {
        if (newFiles.length > 0) {
            setFiles([newFiles[0]]);
            setFlipH(false);
            setFlipV(false);
            const url = URL.createObjectURL(newFiles[0]);
            setPreviewUrl(url);
        }
    };

    const handleRemoveFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setFiles([]);
        setPreviewUrl('');
        setFlipH(false);
        setFlipV(false);
    };

    const downloadFlipped = async () => {
        if (!files[0] || !canvasRef.current) return;

        const img = new Image();
        img.src = previewUrl;
        await new Promise((resolve) => { img.onload = resolve; });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.translate(flipH ? img.width : 0, flipV ? img.height : 0);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const suffix = [flipH ? 'h' : '', flipV ? 'v' : ''].filter(Boolean).join('-');
            a.download = `flipped-${suffix || 'original'}-${files[0].name}`;
            a.click();
            URL.revokeObjectURL(url);
        }, files[0].type || 'image/png');
    };

    const getTransform = () => {
        const transforms = [];
        if (flipH) transforms.push('scaleX(-1)');
        if (flipV) transforms.push('scaleY(-1)');
        return transforms.join(' ') || 'none';
    };

    return (
        <ToolLayout
            title="Flip Image"
            description="Flip images horizontally or vertically"
            icon={<FlipHorizontal className="w-6 h-6 text-white" />}
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
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Flip Options</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setFlipH(!flipH)}
                                        className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${flipH
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-black/20 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <FlipHorizontal className="w-6 h-6" />
                                        <span className="text-sm font-medium">Horizontal</span>
                                    </button>
                                    <button
                                        onClick={() => setFlipV(!flipV)}
                                        className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${flipV
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-black/20 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <FlipVertical className="w-6 h-6" />
                                        <span className="text-sm font-medium">Vertical</span>
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => { setFlipH(false); setFlipV(false); }}
                                className="w-full py-2.5 rounded-xl font-medium bg-white/10 text-white hover:bg-white/20"
                            >
                                Reset
                            </button>

                            <button
                                onClick={downloadFlipped}
                                disabled={!flipH && !flipV}
                                className="w-full py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download Flipped Image
                            </button>
                        </>
                    )}
                </div>

                {/* Right: Preview */}
                <div className="flex-1 bg-white/5 rounded-xl border border-white/10 min-h-[400px] flex items-center justify-center overflow-hidden">
                    {previewUrl ? (
                        <div className="p-8">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{ transform: getTransform() }}
                                className="max-w-full max-h-80 object-contain transition-transform duration-300"
                            />
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Upload an image to flip</p>
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}
