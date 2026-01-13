'use client';

import { useState, useCallback } from 'react';
import { Minimize2, Download, Loader2, AlertCircle, Upload, X, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { compressImage } from '@/lib/image/utils';

interface CompressionResult {
    original: File;
    compressed: File;
    error?: string;
}

export default function ImageCompressPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<CompressionResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [quality, setQuality] = useState<number>(80);
    const [compressionMode, setCompressionMode] = useState<'quality' | 'size'>('quality');
    const [targetSizeKB, setTargetSizeKB] = useState<number>(50);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Invalid file type: ${file.type}. Supported: JPG, PNG, WebP, GIF, BMP`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File too large: ${formatSize(file.size)}. Maximum: 50MB`;
        }
        return null;
    };

    const handleFilesSelected = useCallback((newFiles: File[]) => {
        setError(null);
        const validFiles: File[] = [];
        const errors: string[] = [];

        newFiles.forEach(file => {
            const validationError = validateFile(file);
            if (validationError) {
                errors.push(`${file.name}: ${validationError}`);
            } else {
                validFiles.push(file);
            }
        });

        if (errors.length > 0) {
            setError(errors.join('\n'));
        }

        setFiles(prev => [...prev, ...validFiles].slice(0, 20));
        setResults([]);
    }, []);

    const handleRemoveFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setResults([]);
        setError(null);
    }, []);

    const handleCompress = async () => {
        if (files.length === 0) {
            setError('Please add at least one image to compress');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);
        const compressionResults: CompressionResult[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                let options: any = { useWebWorker: true };

                if (compressionMode === 'size') {
                    const maxSizeMB = targetSizeKB / 1024;
                    options = { ...options, maxSizeMB, maxWidthOrHeight: 4096 };
                } else {
                    const maxSizeMB = Math.max(0.01, (quality / 100) * (file.size / (1024 * 1024)));
                    options = {
                        ...options,
                        maxSizeMB: Math.min(maxSizeMB, 20),
                        maxWidthOrHeight: quality >= 80 ? 4096 : quality >= 50 ? 2048 : 1024,
                        quality: quality / 100
                    };
                }

                const compressed = await compressImage(file, options);
                compressionResults.push({ original: file, compressed });
            } catch (err) {
                console.error('Compression failed for', file.name, err);
                compressionResults.push({
                    original: file,
                    compressed: file,
                    error: err instanceof Error ? err.message : 'Compression failed'
                });
            }
            setProgress(((i + 1) / files.length) * 100);
        }

        setResults(compressionResults);
        setIsProcessing(false);
    };

    const downloadFile = useCallback((file: File, name: string) => {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    const downloadAll = useCallback(() => {
        const successfulResults = results.filter(r => !r.error);
        successfulResults.forEach(({ compressed, original }) => {
            downloadFile(compressed, `compressed_${original.name}`);
        });
    }, [results, downloadFile]);

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const successfulResults = results.filter(r => !r.error);
    const totalOriginalSize = successfulResults.reduce((acc, { original }) => acc + original.size, 0);
    const totalCompressedSize = successfulResults.reduce((acc, { compressed }) => acc + compressed.size, 0);
    const savedPercentage = totalOriginalSize > 0 ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) : 0;

    const resetAll = useCallback(() => {
        setFiles([]);
        setResults([]);
        setError(null);
        setProgress(0);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFilesSelected(Array.from(e.dataTransfer.files));
    };

    return (
        <ToolLayout
            title="Compress Image"
            description="Reduce image file size while maintaining quality"
            icon={<Minimize2 className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Unified Single-Screen Layout */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* LEFT: Controls */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <div className="text-red-400 text-xs whitespace-pre-wrap">{error}</div>
                        </div>
                    )}

                    {/* Compression Settings */}
                    <div className="bg-white/50 p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Compression Settings</h3>

                        <div className="flex gap-2 mb-5 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setCompressionMode('quality')}
                                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${compressionMode === 'quality'
                                    ? 'bg-indigo-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                            >
                                Auto / Quality
                            </button>
                            <button
                                onClick={() => setCompressionMode('size')}
                                className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${compressionMode === 'size'
                                    ? 'bg-indigo-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                                    }`}
                            >
                                Target Size
                            </button>
                        </div>

                        {compressionMode === 'quality' ? (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-gray-500">Quality</label>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{quality}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    step="5"
                                    value={quality}
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    disabled={isProcessing}
                                />
                                <div className="mt-2 text-[10px] text-gray-500 flex justify-between px-1">
                                    <span>High Compression</span>
                                    <span>Best Quality</span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1.5">Max File Size</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="10"
                                        max="50000"
                                        value={targetSizeKB}
                                        onChange={(e) => setTargetSizeKB(Number(e.target.value))}
                                        className="w-full pl-3 pr-10 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-gray-900 transition-all outline-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">KB</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Compact Upload Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${isDragging
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                            }`}
                        onClick={() => document.getElementById('compress-file-input')?.click()}
                    >
                        <input
                            id="compress-file-input"
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
                        onClick={results.length > 0 ? resetAll : handleCompress}
                        disabled={isProcessing || files.length === 0}
                        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${files.length === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : results.length > 0
                                ? 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-200'
                                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Compressing...</span>
                            </>
                        ) : results.length > 0 ? (
                            <span>Compress More Files</span>
                        ) : (
                            <>
                                <Minimize2 className="w-4 h-4" />
                                <span>{files.length > 0 ? `Compress ${files.length} File${files.length > 1 ? 's' : ''}` : 'Add Files to Compress'}</span>
                            </>
                        )}
                    </button>

                    {isProcessing && (
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <ProgressBar progress={progress} label="Optimizing images..." />
                        </div>
                    )}
                </div>

                {/* RIGHT: File List / Results */}
                <div className="flex-1 bg-white/50 rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[400px]">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            {results.length > 0 ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Compressed Files
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                                    Selected Files
                                </>
                            )}
                        </h2>
                        {results.length > 0 && successfulResults.length > 0 && (
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
                        ) : results.length > 0 ? (
                            <div className="space-y-2">
                                {/* Stats Summary */}
                                {successfulResults.length > 0 && (
                                    <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold text-green-600">{savedPercentage}%</span>
                                            <span className="text-sm text-green-700 uppercase font-medium">Reduction</span>
                                        </div>
                                        <p className="text-xs text-green-600/80 mt-1">
                                            Saved {formatSize(totalOriginalSize - totalCompressedSize)} total
                                        </p>
                                    </div>
                                )}

                                {results.map(({ original, compressed, error: fileError }, index) => {
                                    const savings = compressed ? Math.round((1 - compressed.size / original.size) * 100) : 0;
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-green-400 transition-all group shadow-sm">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${fileError ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                                {fileError ? <AlertCircle className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <p className="font-medium truncate text-gray-900 text-sm">{original.name}</p>
                                                    {!fileError && (
                                                        <span className={`text-xs font-mono ${savings > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                            {savings > 0 ? `-${savings}%` : '0%'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-500">{formatSize(original.size)}</span>
                                                    {!fileError && (
                                                        <>
                                                            <span className="text-gray-400">→</span>
                                                            <span className="text-xs text-green-600">{formatSize(compressed.size)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {!fileError && (
                                                <button
                                                    onClick={() => downloadFile(compressed, `compressed_${original.name}`)}
                                                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 transition-all group shadow-sm">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-indigo-600 uppercase">{file.name.split('.').pop()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-gray-900 text-sm">{file.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatSize(file.size)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(i)}
                                            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
