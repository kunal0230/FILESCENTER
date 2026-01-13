'use client';

import { useState } from 'react';
import { Minimize2, Download, Loader2, Upload, FileText, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { compressPDF } from '@/lib/pdf/utils';

type CompressionLevel = 'low' | 'medium' | 'high';

export default function PDFCompressPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [compressedFiles, setCompressedFiles] = useState<{ original: File; compressed: Blob }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
    const [isDragging, setIsDragging] = useState(false);

    const handleFilesSelected = (newFiles: File[]) => {
        const pdfFiles = newFiles.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
        setFiles(prev => [...prev, ...pdfFiles].slice(0, 20));
        setCompressedFiles([]);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
        setCompressedFiles([]);
    };

    const handleCompress = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        setProgress(0);
        const results: { original: File; compressed: Blob }[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const compressed = await compressPDF(file, compressionLevel);
                results.push({ original: file, compressed });
            } catch (error) {
                console.error('Compression failed for', file.name, error);
            }
            setProgress(((i + 1) / files.length) * 100);
        }

        setCompressedFiles(results);
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
        compressedFiles.forEach(({ original, compressed }) => {
            downloadFile(compressed, `compressed_${original.name}`);
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
        setCompressedFiles([]);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFilesSelected(Array.from(e.dataTransfer.files));
    };

    const totalOriginalSize = compressedFiles.reduce((acc, { original }) => acc + original.size, 0);
    const totalCompressedSize = compressedFiles.reduce((acc, { compressed }) => acc + compressed.size, 0);
    const savedPercentage = totalOriginalSize > 0 ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) : 0;

    return (
        <ToolLayout
            title="Compress PDF"
            description="Reduce PDF file size while maintaining quality"
            icon={<Minimize2 className="w-6 h-6 text-white" />}
            category="pdf"
        >
            {/* Unified Single-Screen Layout */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* LEFT: Controls */}
                <div className="w-full lg:w-[320px] shrink-0 flex flex-col gap-5">

                    {/* Compression Level */}
                    <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Compression Level</h3>
                        <div className="space-y-2">
                            {(['low', 'medium', 'high'] as CompressionLevel[]).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setCompressionLevel(level)}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all text-left flex justify-between items-center ${compressionLevel === level
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-black/20 text-gray-300 hover:bg-white/10 border border-transparent'
                                        }`}
                                >
                                    <span className="capitalize">{level}</span>
                                    <span className="text-xs opacity-70">
                                        {level === 'low' && 'Best quality'}
                                        {level === 'medium' && 'Balanced'}
                                        {level === 'high' && 'Smallest size'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Compact Upload Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${isDragging
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-white/20 hover:border-indigo-500/50 hover:bg-white/5'
                            }`}
                        onClick={() => document.getElementById('compress-pdf-input')?.click()}
                    >
                        <input
                            id="compress-pdf-input"
                            type="file"
                            accept=".pdf,application/pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
                        />
                        <Upload className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                        <p className="text-sm text-gray-300">Drop PDFs or click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">Up to 20 files</p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={compressedFiles.length > 0 ? resetAll : handleCompress}
                        disabled={isProcessing || files.length === 0}
                        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${files.length === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : compressedFiles.length > 0
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Compressing...</span>
                            </>
                        ) : compressedFiles.length > 0 ? (
                            <span>Compress More PDFs</span>
                        ) : (
                            <>
                                <Minimize2 className="w-4 h-4" />
                                <span>{files.length > 0 ? `Compress ${files.length} PDF${files.length > 1 ? 's' : ''}` : 'Add PDFs to Compress'}</span>
                            </>
                        )}
                    </button>

                    {isProcessing && (
                        <div className="bg-white/5 rounded-xl p-4">
                            <ProgressBar progress={progress} label="Compressing PDFs..." />
                        </div>
                    )}
                </div>

                {/* RIGHT: File List / Results */}
                <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col min-h-[400px]">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                        <h2 className="text-sm font-medium text-white flex items-center gap-2">
                            {compressedFiles.length > 0 ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Compressed Files
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 text-indigo-400" />
                                    Selected Files
                                </>
                            )}
                        </h2>
                        {compressedFiles.length > 0 && (
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
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm">No files selected</p>
                                    <p className="text-xs mt-1 opacity-70">Upload PDFs to get started</p>
                                </div>
                            </div>
                        ) : compressedFiles.length > 0 ? (
                            <div className="space-y-2">
                                {/* Stats Summary */}
                                <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-green-400">{savedPercentage}%</span>
                                        <span className="text-sm text-green-300/80 uppercase font-medium">Reduction</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatSize(totalOriginalSize)} → {formatSize(totalCompressedSize)}
                                    </p>
                                </div>

                                {compressedFiles.map(({ original, compressed }, index) => {
                                    const savings = Math.round((1 - compressed.size / original.size) * 100);
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-green-500/30 transition-all group">
                                            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                                                <Minimize2 className="w-4 h-4 text-green-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <p className="font-medium truncate text-gray-200 text-sm">{original.name}</p>
                                                    <span className={`text-xs font-mono ${savings > 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {savings > 0 ? `-${savings}%` : '0%'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-500">{formatSize(original.size)}</span>
                                                    <span className="text-gray-600">→</span>
                                                    <span className="text-xs text-green-400">{formatSize(compressed.size)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => downloadFile(compressed, `compressed_${original.name}`)}
                                                className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-red-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-gray-200 text-sm">{file.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatSize(file.size)}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveFile(i)}
                                            className="p-1.5 rounded-lg text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
