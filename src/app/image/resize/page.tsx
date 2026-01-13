'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Download, Loader2, Upload, X, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { resizeImage, getImageDimensions } from '@/lib/image/utils';

export default function ImageResizePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [resizedFiles, setResizedFiles] = useState<{ original: File; resized: Blob; dimensions: { width: number; height: number } }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [width, setWidth] = useState<number>(800);
    const [height, setHeight] = useState<number>(600);
    const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
    const [resizeMode, setResizeMode] = useState<'dimensions' | 'percentage'>('dimensions');
    const [percentage, setPercentage] = useState<number>(50);
    const [originalAspectRatio, setOriginalAspectRatio] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Preview state
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

    useEffect(() => {
        if (files.length > 0) {
            getImageDimensions(files[0]).then(dims => {
                setWidth(dims.width);
                setHeight(dims.height);
                setOriginalAspectRatio(dims.width / dims.height);
            });
        }
    }, [files]);

    useEffect(() => {
        if (files.length === 0) {
            setPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
            setPreviewDimensions(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsGeneratingPreview(true);
            try {
                const file = files[0];
                let targetWidth = width;
                let targetHeight = height;

                if (resizeMode === 'percentage') {
                    const originalDims = await getImageDimensions(file);
                    targetWidth = Math.round(originalDims.width * (percentage / 100));
                    targetHeight = Math.round(originalDims.height * (percentage / 100));
                }

                if (targetWidth <= 0 || targetHeight <= 0) return;

                const resizedBlob = await resizeImage(file, targetWidth, targetHeight, maintainAspectRatio);

                const url = URL.createObjectURL(resizedBlob);
                setPreviewUrl(prev => {
                    if (prev) URL.revokeObjectURL(prev);
                    return url;
                });

                const img = new Image();
                img.onload = () => {
                    setPreviewDimensions({ width: img.width, height: img.height });
                };
                img.src = url;
            } catch (err) {
                console.error('Preview generation failed', err);
            } finally {
                setIsGeneratingPreview(false);
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            setPreviewUrl(prev => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
        };
    }, [files, width, height, resizeMode, percentage, maintainAspectRatio]);

    const handleFilesSelected = (newFiles: File[]) => {
        const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
        setFiles(prev => [...prev, ...imageFiles].slice(0, 20));
        setResizedFiles([]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
        setResizedFiles([]);
    };

    const handleResize = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setProgress(0);
        const results: { original: File; resized: Blob; dimensions: { width: number; height: number } }[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                let targetWidth = width;
                let targetHeight = height;

                if (resizeMode === 'percentage') {
                    const originalDims = await getImageDimensions(file);
                    targetWidth = Math.round(originalDims.width * (percentage / 100));
                    targetHeight = Math.round(originalDims.height * (percentage / 100));
                }

                const resized = await resizeImage(file, targetWidth, targetHeight, maintainAspectRatio);

                const img = new Image();
                const url = URL.createObjectURL(resized);
                await new Promise<void>((resolve) => {
                    img.onload = () => {
                        results.push({
                            original: file,
                            resized,
                            dimensions: { width: img.width, height: img.height }
                        });
                        URL.revokeObjectURL(url);
                        resolve();
                    };
                    img.src = url;
                });
            } catch (error) {
                console.error('Resize failed for', file.name, error);
            }
            setProgress(((i + 1) / files.length) * 100);
        }

        setResizedFiles(results);
        setIsProcessing(false);
    };

    const downloadFile = (blob: Blob, name: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadAll = () => {
        resizedFiles.forEach(({ resized, original }) => {
            downloadFile(resized, `resized_${original.name}`);
        });
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const resetAll = () => {
        setFiles([]);
        setResizedFiles([]);
        setPreviewUrl(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFilesSelected(Array.from(e.dataTransfer.files));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    return (
        <ToolLayout
            title="Resize Image"
            description="Change image dimensions by pixels or percentage"
            icon={<RefreshCw className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Unified Single-Screen Layout */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* LEFT: Controls */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">

                    {/* Resize Mode Toggle */}
                    <div className="bg-white/50 p-5 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setResizeMode('dimensions')}
                                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${resizeMode === 'dimensions'
                                    ? 'bg-indigo-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                            >
                                Dimensions
                            </button>
                            <button
                                onClick={() => setResizeMode('percentage')}
                                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${resizeMode === 'percentage'
                                    ? 'bg-indigo-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                            >
                                Percentage
                            </button>
                        </div>

                        {resizeMode === 'dimensions' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Width</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={width}
                                            onChange={(e) => {
                                                const newWidth = Number(e.target.value);
                                                setWidth(newWidth);
                                                if (maintainAspectRatio && originalAspectRatio && newWidth > 0) {
                                                    setHeight(Math.round(newWidth / originalAspectRatio));
                                                }
                                            }}
                                            className="w-full pl-3 pr-8 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-gray-900 transition-all outline-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1.5">Height</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => {
                                                const newHeight = Number(e.target.value);
                                                setHeight(newHeight);
                                                if (maintainAspectRatio && originalAspectRatio && newHeight > 0) {
                                                    setWidth(Math.round(newHeight * originalAspectRatio));
                                                }
                                            }}
                                            className="w-full pl-3 pr-8 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-gray-900 transition-all outline-none"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">px</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs text-gray-400">Scale Factor</label>
                                    <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{percentage}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    value={percentage}
                                    onChange={(e) => setPercentage(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        )}

                        <div className="mt-5 pt-4 border-t border-gray-200">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${maintainAspectRatio ? 'bg-indigo-500 border-indigo-500' : 'border-gray-600 group-hover:border-gray-500'}`}>
                                    {maintainAspectRatio && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={maintainAspectRatio}
                                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                                    className="hidden"
                                />
                                <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">Maintain aspect ratio</span>
                            </label>
                        </div>
                    </div>

                    {/* Compact Upload Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={() => setIsDragging(false)}
                        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${isDragging
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                            }`}
                        onClick={() => document.getElementById('resize-file-input')?.click()}
                    >
                        <input
                            id="resize-file-input"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
                        />
                        <Upload className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                        <p className="text-sm text-gray-600">Drop files or click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">Up to 20 images</p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={resizedFiles.length > 0 ? resetAll : handleResize}
                        disabled={isProcessing || files.length === 0}
                        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${files.length === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : resizedFiles.length > 0
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                            </>
                        ) : resizedFiles.length > 0 ? (
                            <span>Resize More Files</span>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                <span>{files.length > 0 ? `Resize ${files.length} File${files.length > 1 ? 's' : ''}` : 'Add Files to Resize'}</span>
                            </>
                        )}
                    </button>

                    {isProcessing && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <ProgressBar progress={progress} label="Resizing images..." />
                        </div>
                    )}
                </div>

                {/* RIGHT: Preview / Results */}
                <div className="flex-1 bg-white/50 rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            {resizedFiles.length > 0 ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Resized Files
                                </>
                            ) : files.length > 0 ? (
                                <>
                                    <div className={`w-2 h-2 rounded-full ${isGeneratingPreview ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
                                    Live Preview
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                                    Preview
                                </>
                            )}
                        </h2>
                        {resizedFiles.length > 0 && (
                            <button
                                onClick={downloadAll}
                                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download All
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {files.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-center">
                                <div className="text-gray-500">
                                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No files selected</p>
                                    <p className="text-xs mt-1 opacity-70">Upload images to get started</p>
                                </div>
                            </div>
                        ) : resizedFiles.length > 0 ? (
                            <div className="space-y-2">
                                {resizedFiles.map(({ original, resized, dimensions }, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-green-400 transition-all group shadow-sm">
                                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                                            <RefreshCw className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-gray-900 text-sm">{original.name}</p>
                                            <p className="text-xs text-green-600 mt-0.5">{dimensions.width} × {dimensions.height} • {formatSize(resized.size)}</p>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(resized, `resized_${original.name}`)}
                                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                {/* Preview Image */}
                                <div className="flex-1 flex items-center justify-center relative">
                                    {isGeneratingPreview ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                            <span className="text-xs text-indigo-400/80">Generating preview...</span>
                                        </div>
                                    ) : previewUrl ? (
                                        <div className="relative group">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="max-w-full max-h-[300px] object-contain rounded-lg border border-gray-200 shadow-sm"
                                            />
                                            {previewDimensions && (
                                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1 rounded-full text-xs text-white">
                                                    {previewDimensions.width} × {previewDimensions.height}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                {/* File List */}
                                <div className="border-t border-gray-200 pt-4 mt-4">
                                    <p className="text-xs text-gray-500 mb-2">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
                                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                                        {files.map((file, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/50 text-xs group border border-gray-100">
                                                <span className="flex-1 truncate text-gray-700">{file.name}</span>
                                                <span className="text-gray-500">{formatSize(file.size)}</span>
                                                <button
                                                    onClick={() => handleRemoveFile(i)}
                                                    className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
