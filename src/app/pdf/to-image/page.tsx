'use client';

import { useState, useCallback, useRef } from 'react';
import { Image, Download, Loader2, AlertCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

type ImageFormat = 'png' | 'jpeg';

export default function PDFToImagePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [pageCount, setPageCount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [format, setFormat] = useState<ImageFormat>('png');
    const [quality, setQuality] = useState(90);
    const [scale, setScale] = useState(2);
    const [pageRange, setPageRange] = useState('');
    const [results, setResults] = useState<{ name: string; dataUrl: string }[]>([]);

    const handleFilesSelected = useCallback(async (newFiles: File[]) => {
        setError(null);
        setResults([]);

        if (newFiles.length === 0) return;

        const file = newFiles[0];
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            setError('File too large. Maximum size is 50MB');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const count = pdf.numPages;
            setPageCount(count);
            setFiles([file]);
            setPageRange(`1-${count}`);
        } catch (err) {
            setError('Failed to read PDF. The file may be corrupted or password protected.');
        }
    }, []);

    const parsePageNumbers = (input: string, maxPages: number): number[] => {
        if (!input.trim()) {
            return Array.from({ length: maxPages }, (_, i) => i + 1);
        }

        const pages = new Set<number>();
        const parts = input.split(',').map(s => s.trim());

        for (const part of parts) {
            if (part.includes('-')) {
                const [startStr, endStr] = part.split('-').map(s => s.trim());
                const start = Math.max(1, parseInt(startStr) || 1);
                const end = Math.min(maxPages, parseInt(endStr) || maxPages);
                for (let i = start; i <= end; i++) {
                    pages.add(i);
                }
            } else {
                const page = parseInt(part);
                if (page >= 1 && page <= maxPages) {
                    pages.add(page);
                }
            }
        }

        return Array.from(pages).sort((a, b) => a - b);
    };

    const handleConvert = async () => {
        if (files.length === 0) {
            setError('Please upload a PDF file first');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);
        setResults([]);

        try {
            const arrayBuffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const pagesToConvert = parsePageNumbers(pageRange, pageCount);

            if (pagesToConvert.length === 0) {
                throw new Error('No valid pages specified');
            }

            const baseName = files[0].name.replace('.pdf', '');
            const newResults: { name: string; dataUrl: string }[] = [];

            for (let i = 0; i < pagesToConvert.length; i++) {
                const pageNum = pagesToConvert[i];
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d')!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                }).promise;

                const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, quality / 100);

                newResults.push({
                    name: `${baseName}_page_${pageNum}.${format}`,
                    dataUrl
                });

                setProgress(((i + 1) / pagesToConvert.length) * 100);
            }

            setResults(newResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to convert PDF to images');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadImage = (dataUrl: string, name: string) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const downloadAll = () => {
        results.forEach(({ dataUrl, name }) => {
            downloadImage(dataUrl, name);
        });
    };

    const resetAll = () => {
        setFiles([]);
        setPageCount(0);
        setResults([]);
        setError(null);
    };

    return (
        <ToolLayout
            title="PDF to Image"
            description="Convert PDF pages to high-quality images"
            icon={<Image className="w-6 h-6 text-white" />}
            category="pdf"
        >
            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* File Uploader */}
            <FileUploader
                accept=".pdf,application/pdf"
                multiple={false}
                maxFiles={1}
                onFilesSelected={handleFilesSelected}
                files={files}
                onRemoveFile={() => resetAll()}
            />

            {pageCount > 0 && (
                <p className="mt-2 text-sm text-indigo-400 text-center">
                    PDF has {pageCount} page{pageCount !== 1 ? 's' : ''}
                </p>
            )}

            {/* Options */}
            {files.length > 0 && !results.length && (
                <div className="mt-6 space-y-6">
                    {/* Format Selection */}
                    <div>
                        <label className="text-sm font-medium mb-3 block">Image Format</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setFormat('png')}
                                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${format === 'png' ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                PNG (Lossless)
                            </button>
                            <button
                                onClick={() => setFormat('jpeg')}
                                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${format === 'jpeg' ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                JPEG (Smaller)
                            </button>
                        </div>
                    </div>

                    {/* Quality (for JPEG) */}
                    {format === 'jpeg' && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium">Quality: {quality}%</label>
                            </div>
                            <input
                                type="range"
                                min="50"
                                max="100"
                                step="5"
                                value={quality}
                                onChange={(e) => setQuality(Number(e.target.value))}
                                className="w-full"
                            />
                        </div>
                    )}

                    {/* Scale */}
                    <div>
                        <label className="text-sm font-medium mb-3 block">Image Scale (Resolution)</label>
                        <div className="flex gap-3">
                            {[1, 2, 3].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setScale(s)}
                                    className={`flex-1 py-3 rounded-lg transition-colors ${scale === s ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {s}x {s === 1 ? '(72 DPI)' : s === 2 ? '(144 DPI)' : '(216 DPI)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Page Range */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Pages to Convert</label>
                        <input
                            type="text"
                            value={pageRange}
                            onChange={(e) => setPageRange(e.target.value)}
                            placeholder="e.g., 1-5, 8, 10-12 (leave empty for all)"
                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    {/* Convert Button */}
                    <button
                        onClick={handleConvert}
                        disabled={isProcessing}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Converting... ({Math.round(progress)}%)
                            </>
                        ) : (
                            <>
                                <Image className="w-5 h-5" />
                                Convert to {format.toUpperCase()}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Progress */}
            {isProcessing && (
                <div className="mt-6">
                    <ProgressBar progress={progress} label="Converting pages to images..." />
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-green-400 font-semibold">Conversion complete!</p>
                                <p className="text-sm text-gray-400">{results.length} image{results.length !== 1 ? 's' : ''} created</p>
                            </div>
                            <button onClick={downloadAll} className="btn-primary flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download All
                            </button>
                        </div>
                    </div>

                    {/* Preview Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                        {results.map(({ name, dataUrl }, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={dataUrl}
                                    alt={name}
                                    className="w-full h-32 object-cover rounded-lg border border-white/10"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <button
                                        onClick={() => downloadImage(dataUrl, name)}
                                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 truncate">{name}</p>
                            </div>
                        ))}
                    </div>

                    <button onClick={resetAll} className="btn-secondary w-full">
                        Convert Another PDF
                    </button>
                </div>
            )}
        </ToolLayout>
    );
}
