'use client';

import { useState, useCallback } from 'react';
import { Merge, Download, Loader2, GripVertical, AlertCircle, Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { mergePDFs } from '@/lib/pdf/utils';

export default function PDFMergePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    const MAX_TOTAL_SIZE = 500 * 1024 * 1024;

    const validateFile = (file: File): string | null => {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            return `Not a PDF file: ${file.name}`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File too large: ${formatSize(file.size)}. Maximum: 100MB per file`;
        }
        if (file.size === 0) {
            return `File is empty: ${file.name}`;
        }
        return null;
    };

    const handleFilesSelected = useCallback((newFiles: File[]) => {
        setError(null);
        setMergedBlob(null);

        const validFiles: File[] = [...files];
        const errors: string[] = [];

        newFiles.forEach(file => {
            if (validFiles.some(f => f.name === file.name && f.size === file.size)) return;
            const validationError = validateFile(file);
            if (validationError) {
                errors.push(validationError);
            } else {
                validFiles.push(file);
            }
        });

        const totalSize = validFiles.reduce((sum, f) => sum + f.size, 0);
        if (totalSize > MAX_TOTAL_SIZE) {
            errors.push(`Total size exceeds 500MB limit`);
        }

        if (errors.length > 0) setError(errors.join('\n'));
        setFiles(validFiles.slice(0, 50));
    }, [files]);

    const handleRemoveFile = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setMergedBlob(null);
        setError(null);
    }, []);

    const moveFile = useCallback((fromIndex: number, toIndex: number) => {
        if (toIndex < 0 || toIndex >= files.length) return;
        setFiles(prev => {
            const newFiles = [...prev];
            const [removed] = newFiles.splice(fromIndex, 1);
            newFiles.splice(toIndex, 0, removed);
            return newFiles;
        });
        setMergedBlob(null);
    }, [files.length]);

    const handleMerge = async () => {
        if (files.length < 2) {
            setError('Please add at least 2 PDF files to merge');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + 5, 85));
            }, 100);

            const merged = await mergePDFs(files);

            clearInterval(progressInterval);
            setProgress(100);

            if (merged.size === 0) throw new Error('Merge produced empty file');
            setMergedBlob(merged);
        } catch (err) {
            setError(err instanceof Error ? `Merge failed: ${err.message}` : 'Failed to merge PDFs');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadMerged = useCallback(() => {
        if (!mergedBlob) return;
        const url = URL.createObjectURL(mergedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `merged_${files.length}_files.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    }, [mergedBlob, files.length]);

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const resetAll = useCallback(() => {
        setFiles([]);
        setMergedBlob(null);
        setError(null);
        setProgress(0);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFilesSelected(Array.from(e.dataTransfer.files));
    };

    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    return (
        <ToolLayout
            title="Merge PDF"
            description="Combine multiple PDF files into one document"
            icon={<Merge className="w-6 h-6 text-white" />}
            category="pdf"
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

                    {/* Info Panel */}
                    <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Merge Settings</h3>
                        <div className="space-y-3 text-xs text-gray-400">
                            <p>• PDFs will merge in the order shown</p>
                            <p>• Use arrows to reorder files</p>
                            <p>• Max 50 files, 500MB total</p>
                        </div>
                        {files.length > 0 && (
                            <div className="mt-4 pt-3 border-t border-white/10">
                                <p className="text-sm text-indigo-400">{files.length} file{files.length > 1 ? 's' : ''} • {formatSize(totalSize)}</p>
                            </div>
                        )}
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
                        onClick={() => document.getElementById('merge-file-input')?.click()}
                    >
                        <input
                            id="merge-file-input"
                            type="file"
                            accept=".pdf,application/pdf"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
                        />
                        <Upload className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
                        <p className="text-sm text-gray-300">Drop PDF files or click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">Up to 50 files</p>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={mergedBlob ? resetAll : handleMerge}
                        disabled={isProcessing || files.length < 2}
                        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${files.length < 2
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : mergedBlob
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Merging...</span>
                            </>
                        ) : mergedBlob ? (
                            <span>Merge More PDFs</span>
                        ) : (
                            <>
                                <Merge className="w-4 h-4" />
                                <span>{files.length >= 2 ? `Merge ${files.length} PDFs` : 'Add 2+ PDFs to Merge'}</span>
                            </>
                        )}
                    </button>

                    {isProcessing && (
                        <div className="bg-white/5 rounded-xl p-4">
                            <ProgressBar progress={progress} label="Merging PDFs..." />
                        </div>
                    )}
                </div>

                {/* RIGHT: File List / Results */}
                <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col min-h-[400px]">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                        <h2 className="text-sm font-medium text-white flex items-center gap-2">
                            {mergedBlob ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Merge Complete
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4 text-indigo-400" />
                                    PDF Files
                                </>
                            )}
                        </h2>
                        {mergedBlob && (
                            <button
                                onClick={downloadMerged}
                                className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500 hover:text-white transition-colors flex items-center gap-1.5"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download
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
                                    <p className="text-xs mt-1 opacity-70">Upload at least 2 PDFs to merge</p>
                                </div>
                            </div>
                        ) : mergedBlob ? (
                            <div className="p-6 text-center">
                                <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-white mb-2">PDFs Merged Successfully!</p>
                                <p className="text-sm text-gray-400">{files.length} files → 1 PDF ({formatSize(mergedBlob.size)})</p>
                                <button onClick={downloadMerged} className="btn-primary mt-6 inline-flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download Merged PDF
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {files.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                        <span className="text-gray-500 text-sm w-6 shrink-0">{index + 1}.</span>
                                        <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="w-4 h-4 text-red-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate text-gray-200 text-sm">{file.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatSize(file.size)}</p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <button
                                                onClick={() => moveFile(index, index - 1)}
                                                disabled={index === 0}
                                                className="p-1.5 rounded text-gray-500 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                            >↑</button>
                                            <button
                                                onClick={() => moveFile(index, index + 1)}
                                                disabled={index === files.length - 1}
                                                className="p-1.5 rounded text-gray-500 hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                            >↓</button>
                                            <button
                                                onClick={() => handleRemoveFile(index)}
                                                className="p-1.5 rounded text-gray-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
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
