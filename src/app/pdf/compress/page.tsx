'use client';

import { useState } from 'react';
import { Minimize2, Download, Loader2, Upload, FileText, CheckCircle2, X, AlertCircle, Settings2, ShieldCheck } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { compressPDF } from '@/lib/pdf/utils';
import { compressPDFLossless } from '@/lib/pdf/qpdf';

type CompressionLevel = 'low' | 'medium' | 'high';
type CompressionType = 'lossless' | 'strong';

export default function PDFCompressPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [compressedFiles, setCompressedFiles] = useState<{ original: File; compressed: Blob }[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [compressionType, setCompressionType] = useState<CompressionType>('lossless');
    const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
    const [grayscale, setGrayscale] = useState(false);
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

            // Allow UI to update
            await new Promise(resolve => setTimeout(resolve, 50));

            try {
                let compressed: Blob;
                if (compressionType === 'lossless') {
                    compressed = await compressPDFLossless(file);
                } else {
                    compressed = await compressPDF(file, compressionLevel, grayscale);
                }
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

                    {/* Compression Method Selection */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-4">Compression Method</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setCompressionType('lossless')}
                                className={`w-full p-3 rounded-lg border text-left transition-all ${compressionType === 'lossless'
                                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheck className={`w-4 h-4 ${compressionType === 'lossless' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${compressionType === 'lossless' ? 'text-indigo-700' : 'text-gray-700'}`}>Optimize (Text)</span>
                                </div>
                                <p className="text-xs text-gray-500">Preserves text selection. Removes redundant data.</p>
                            </button>

                            <button
                                onClick={() => setCompressionType('strong')}
                                className={`w-full p-3 rounded-lg border text-left transition-all ${compressionType === 'strong'
                                    ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500'
                                    : 'bg-white border-gray-200 hover:border-indigo-300'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <Minimize2 className={`w-4 h-4 ${compressionType === 'strong' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                    <span className={`font-medium ${compressionType === 'strong' ? 'text-indigo-700' : 'text-gray-700'}`}>Rasterize (Images)</span>
                                </div>
                                <p className="text-xs text-gray-500">Converts to images. Best for scans. Max reduction.</p>
                            </button>
                        </div>
                    </div>

                    {/* Quality Level (Only for Strong Mode) */}
                    {compressionType === 'strong' && (
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider mb-4">Quality Level</h3>
                            <div className="space-y-2">
                                {(['low', 'medium', 'high'] as CompressionLevel[]).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setCompressionLevel(level)}
                                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all text-left flex justify-between items-center ${compressionLevel === level
                                            ? 'bg-indigo-500 text-white shadow-sm'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        <span className="capitalize">{level}</span>
                                        <span className="text-xs opacity-70">
                                            {level === 'low' && 'Best Quality'}
                                            {level === 'medium' && 'Balanced'}
                                            {level === 'high' && 'Smallest Size'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${grayscale ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 bg-white'}`}>
                                        {grayscale && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={grayscale}
                                        onChange={(e) => setGrayscale(e.target.checked)}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">Grayscale</span>
                                        <span className="text-xs text-gray-500">Convert to B&W for max reduction</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Compact Upload Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${isDragging
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
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
                        <Upload className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                        <p className="text-sm text-gray-600">Drop PDFs or click to upload</p>
                        <p className="text-xs text-gray-400 mt-1">Up to 20 files</p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={compressedFiles.length > 0 ? resetAll : handleCompress}
                        disabled={isProcessing || files.length === 0}
                        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${files.length === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : compressedFiles.length > 0
                                ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
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
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <ProgressBar progress={progress} label={compressionType === 'lossless' ? "Optimizing structure..." : "Rasterizing & Compressing..."} />
                        </div>
                    )}
                </div>

                {/* RIGHT: File List / Results */}
                <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col min-h-[400px] shadow-sm">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            {compressedFiles.length > 0 ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    Compressed Files
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 text-indigo-500" />
                                    Selected Files
                                </>
                            )}
                        </h2>
                        {compressedFiles.length > 0 && (
                            <button
                                onClick={downloadAll}
                                className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors flex items-center gap-1.5 border border-green-200"
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
                                <div className="text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-medium text-gray-500">No files selected</p>
                                    <p className="text-xs mt-1">Upload PDFs to get started</p>
                                </div>
                            </div>
                        ) : compressedFiles.length > 0 ? (
                            <div className="space-y-2">
                                {/* Stats Summary */}
                                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-100">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-green-600">{savedPercentage}%</span>
                                        <span className="text-sm text-green-600/80 uppercase font-medium">Reduction</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatSize(totalOriginalSize)} → {formatSize(totalCompressedSize)}
                                    </p>
                                </div>

                                {compressedFiles.map(({ original, compressed }, index) => {
                                    const savings = Math.round((1 - compressed.size / original.size) * 100);
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-green-300 transition-all group shadow-sm">
                                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0 border border-green-100">
                                                <Minimize2 className="w-4 h-4 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <p className="font-medium truncate text-gray-700 text-sm">{original.name}</p>
                                                    <span className={`text-xs font-mono font-medium ${savings > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                        {savings > 0 ? `-${savings}%` : '0%'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-400">{formatSize(original.size)}</span>
                                                    <span className="text-gray-400">→</span>
                                                    <span className="text-xs text-green-600 font-medium">{formatSize(compressed.size)}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => downloadFile(compressed, `compressed_${original.name}`)}
                                                className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
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
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 hover:border-indigo-300 transition-all group shadow-sm">
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-gray-700 text-sm">{file.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{formatSize(file.size)}</p>
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
