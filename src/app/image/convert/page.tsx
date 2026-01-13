'use client';

import { useState } from 'react';
import { ArrowRightLeft, Download, Loader2, Image as ImageIcon, Upload, X, CheckCircle2 } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { convertImageFormat } from '@/lib/image/utils';

type ImageFormat = string;

const formatOptions: { value: ImageFormat; label: string; ext: string }[] = [
    { value: 'image/png', label: 'PNG', ext: 'png' },
    { value: 'image/jpeg', label: 'JPG', ext: 'jpg' },
    { value: 'image/webp', label: 'WebP', ext: 'webp' },
    { value: 'image/bmp', label: 'BMP', ext: 'bmp' },
    { value: 'image/gif', label: 'GIF', ext: 'gif' },
    { value: 'image/x-icon', label: 'ICO', ext: 'ico' },
    { value: 'image/avif', label: 'AVIF', ext: 'avif' },
    { value: 'application/pdf', label: 'PDF', ext: 'pdf' },
];

export default function ImageConvertPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [convertedFiles, setConvertedFiles] = useState<{ original: File; converted: Blob; format: string }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/png');
    const [isDragging, setIsDragging] = useState(false);

    const handleFilesSelected = (newFiles: File[]) => {
        const imageFiles = newFiles.filter(f => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic'));
        setFiles(prev => [...prev, ...imageFiles].slice(0, 20));
        setConvertedFiles([]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
        setConvertedFiles([]);
    };

    const resetAll = () => {
        setFiles([]);
        setConvertedFiles([]);
    };

    const handleConvert = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setProgress(0);
        const results: { original: File; converted: Blob; format: string }[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const converted = await convertImageFormat(file, targetFormat);
                results.push({
                    original: file,
                    converted,
                    format: formatOptions.find(f => f.value === targetFormat)?.ext || 'png'
                });
            } catch (error) {
                console.error('Convert failed for', file.name, error);
            }
            setProgress(((i + 1) / files.length) * 100);
        }

        setConvertedFiles(results);
        setIsProcessing(false);
    };

    const downloadFile = (blob: Blob, originalName: string, ext: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nameParts = originalName.split('.');
        nameParts.pop();
        a.download = `${nameParts.join('.')}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadAll = () => {
        convertedFiles.forEach(({ converted, original, format }) => {
            downloadFile(converted, original.name, format);
        });
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFilesSelected(droppedFiles);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <ToolLayout
            title="Convert Image"
            description="Convert images between JPG, PNG, WebP, GIF, BMP, and PDF"
            icon={<ArrowRightLeft className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Unified Single-Screen Layout */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* LEFT: Controls + Upload Zone */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">

                    {/* Target Format Selection */}
                    <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Target Format</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {formatOptions.map((fmt) => (
                                <button
                                    key={fmt.value}
                                    onClick={() => setTargetFormat(fmt.value)}
                                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-all ${targetFormat === fmt.value
                                        ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                        : 'bg-black/20 border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xs font-bold uppercase">{fmt.ext}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compact Upload Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${isDragging
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-white/20 hover:border-indigo-500/50 hover:bg-white/5'
                            }`}
                        onClick={() => document.getElementById('file-input')?.click()}
                    >
                        <input
                            id="file-input"
                            type="file"
                            accept="image/*,.heic"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
                        />
                        <Upload className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                        <p className="text-sm text-gray-300">Drop files or click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">Up to 20 images</p>
                    </div>

                    {/* Convert Button */}
                    <button
                        onClick={convertedFiles.length > 0 ? resetAll : handleConvert}
                        disabled={isProcessing || files.length === 0}
                        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${files.length === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : convertedFiles.length > 0
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Converting...</span>
                            </>
                        ) : convertedFiles.length > 0 ? (
                            <span>Convert More Files</span>
                        ) : (
                            <>
                                <ArrowRightLeft className="w-4 h-4" />
                                <span>{files.length > 0 ? `Convert ${files.length} File${files.length > 1 ? 's' : ''}` : 'Add Files to Convert'}</span>
                            </>
                        )}
                    </button>

                    {/* Progress */}
                    {isProcessing && (
                        <div className="bg-white/5 rounded-xl p-4">
                            <ProgressBar progress={progress} label={`Converting to ${formatOptions.find(f => f.value === targetFormat)?.ext}...`} />
                        </div>
                    )}
                </div>

                {/* RIGHT: File List / Results */}
                <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col min-h-[400px]">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                        <h2 className="text-sm font-medium text-white flex items-center gap-2">
                            {convertedFiles.length > 0 ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Converted Files
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="w-4 h-4 text-indigo-400" />
                                    Selected Files
                                </>
                            )}
                        </h2>
                        {convertedFiles.length > 0 && (
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
                        ) : convertedFiles.length > 0 ? (
                            <div className="space-y-2">
                                {convertedFiles.map(({ original, converted, format }, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-green-500/30 transition-all group">
                                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-green-400 uppercase">{format}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-gray-200 text-sm">{original.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500">{formatSize(original.size)}</span>
                                                <span className="text-gray-600">→</span>
                                                <span className="text-xs text-green-400">{formatSize(converted.size)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(converted, original.name, format)}
                                            className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                        <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-bold text-indigo-400 uppercase">{file.name.split('.').pop()}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-gray-200 text-sm">{file.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatSize(file.size)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(i)}
                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove"
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
