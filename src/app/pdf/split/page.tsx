'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Split, Download, Loader2, AlertCircle, Plus, X, Eye, ZoomIn, RefreshCw, FileDown } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageRange {
    id: string;
    start: string;
    end: string;
}

interface PagePreview {
    pageNum: number;
    dataUrl: string;
    selected: boolean;
}

interface ExtractedPage {
    pageNum: number;
    dataUrl: string;
    blob: Blob;
}

export default function SplitPDFPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [pageCount, setPageCount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'extract' | 'range' | 'every'>('extract');
    const [ranges, setRanges] = useState<PageRange[]>([{ id: '1', start: '1', end: '1' }]);
    const [everyN, setEveryN] = useState(1);
    const [results, setResults] = useState<{ name: string; blob: Blob }[]>([]);
    const [previews, setPreviews] = useState<PagePreview[]>([]);
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
    const [selectedExtracted, setSelectedExtracted] = useState<Set<number>>(new Set());
    const [fullPagePreview, setFullPagePreview] = useState<string | null>(null);
    const [fullPageNum, setFullPageNum] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInputKey = useRef(0);

    const generatePreviews = async (file: File) => {
        setIsLoadingPreviews(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const newPreviews: PagePreview[] = [];

            for (let i = 1; i <= Math.min(numPages, 20); i++) {
                const page = await pdf.getPage(i);
                const scale = 0.3;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d')!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;

                newPreviews.push({
                    pageNum: i,
                    dataUrl: canvas.toDataURL('image/jpeg', 0.6),
                    selected: true
                });
            }

            setPreviews(newPreviews);
            setSelectedPages(new Set(newPreviews.map(p => p.pageNum)));
        } catch (err) {
            console.error('Failed to generate previews:', err);
        } finally {
            setIsLoadingPreviews(false);
        }
    };

    const generateFullPreview = async (pageNum: number) => {
        if (!files[0]) return;

        try {
            const arrayBuffer = await files[0].arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(pageNum);
            const scale = 2;
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            setFullPagePreview(canvas.toDataURL('image/jpeg', 0.9));
            setFullPageNum(pageNum);
        } catch (err) {
            console.error('Failed to generate full preview:', err);
        }
    };

    const handleFilesSelected = useCallback(async (newFiles: File[]) => {
        setError(null);
        setResults([]);
        setPreviews([]);
        setSelectedPages(new Set());
        setExtractedPages([]);
        setSelectedExtracted(new Set());

        if (newFiles.length === 0) return;

        const file = newFiles[0];
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        if (file.size > 100 * 1024 * 1024) {
            setError('File too large. Maximum size is 100MB');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const count = pdfDoc.getPageCount();
            setPageCount(count);
            setFiles([file]);
            setRanges([{ id: '1', start: '1', end: String(count) }]);

            generatePreviews(file);
        } catch (err) {
            setError('Failed to read PDF. The file may be corrupted or encrypted.');
        }
    }, []);

    const togglePageSelection = (pageNum: number) => {
        setSelectedPages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pageNum)) {
                newSet.delete(pageNum);
            } else {
                newSet.add(pageNum);
            }
            return newSet;
        });
    };

    const toggleExtractedSelection = (pageNum: number) => {
        setSelectedExtracted(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pageNum)) {
                newSet.delete(pageNum);
            } else {
                newSet.add(pageNum);
            }
            return newSet;
        });
    };

    const selectAll = () => {
        setSelectedPages(new Set(previews.map(p => p.pageNum)));
    };

    const deselectAll = () => {
        setSelectedPages(new Set());
    };

    const selectAllExtracted = () => {
        setSelectedExtracted(new Set(extractedPages.map(p => p.pageNum)));
    };

    const deselectAllExtracted = () => {
        setSelectedExtracted(new Set());
    };

    const handleSplit = async () => {
        if (files.length === 0 || pageCount === 0) {
            setError('Please upload a PDF file first');
            return;
        }

        const pagesToExtract = mode === 'extract'
            ? Array.from(selectedPages).sort((a, b) => a - b)
            : [];

        if (mode === 'extract' && pagesToExtract.length === 0) {
            setError('Please select at least one page to extract');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);
        setResults([]);
        setExtractedPages([]);

        try {
            const arrayBuffer = await files[0].arrayBuffer();
            const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const baseName = files[0].name.replace('.pdf', '');
            const newResults: { name: string; blob: Blob }[] = [];
            const newExtractedPages: ExtractedPage[] = [];

            if (mode === 'extract') {
                // Create individual pages AND a combined PDF
                for (let i = 0; i < pagesToExtract.length; i++) {
                    const pageNum = pagesToExtract[i];

                    // Create individual page PDF
                    const singleDoc = await PDFDocument.create();
                    const [page] = await singleDoc.copyPages(srcDoc, [pageNum - 1]);
                    singleDoc.addPage(page);
                    const singleBytes = await singleDoc.save();
                    const singleBlob = new Blob([singleBytes as BlobPart], { type: 'application/pdf' });

                    // Generate preview for extracted page
                    const previewData = previews.find(p => p.pageNum === pageNum);

                    newExtractedPages.push({
                        pageNum,
                        dataUrl: previewData?.dataUrl || '',
                        blob: singleBlob
                    });

                    setProgress(((i + 1) / pagesToExtract.length) * 80);
                }

                // Create combined PDF
                const combinedDoc = await PDFDocument.create();
                for (const pageNum of pagesToExtract) {
                    const [page] = await combinedDoc.copyPages(srcDoc, [pageNum - 1]);
                    combinedDoc.addPage(page);
                }
                const combinedBytes = await combinedDoc.save();
                newResults.push({
                    name: `${baseName}_extracted_${pagesToExtract.length}pages.pdf`,
                    blob: new Blob([combinedBytes as BlobPart], { type: 'application/pdf' })
                });

                setExtractedPages(newExtractedPages);
                setSelectedExtracted(new Set(newExtractedPages.map(p => p.pageNum)));

            } else if (mode === 'range') {
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    const start = Math.max(1, parseInt(range.start) || 1);
                    const end = Math.min(pageCount, parseInt(range.end) || pageCount);

                    if (start > end || start > pageCount) continue;

                    const newDoc = await PDFDocument.create();
                    for (let p = start; p <= end; p++) {
                        const [page] = await newDoc.copyPages(srcDoc, [p - 1]);
                        newDoc.addPage(page);
                    }

                    const pdfBytes = await newDoc.save();
                    newResults.push({
                        name: `${baseName}_${start}-${end}.pdf`,
                        blob: new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
                    });
                    setProgress(((i + 1) / ranges.length) * 100);
                }

            } else if (mode === 'every') {
                const n = Math.max(1, everyN);
                const totalParts = Math.ceil(pageCount / n);

                for (let i = 0; i < totalParts; i++) {
                    const start = i * n;
                    const end = Math.min(start + n, pageCount);

                    const newDoc = await PDFDocument.create();
                    for (let p = start; p < end; p++) {
                        const [page] = await newDoc.copyPages(srcDoc, [p]);
                        newDoc.addPage(page);
                    }

                    const pdfBytes = await newDoc.save();
                    newResults.push({
                        name: `${baseName}_part${i + 1}.pdf`,
                        blob: new Blob([pdfBytes as BlobPart], { type: 'application/pdf' })
                    });
                    setProgress(((i + 1) / totalParts) * 100);
                }
            }

            setProgress(100);
            setResults(newResults);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to split PDF');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadFile = (blob: Blob, name: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadAll = () => {
        results.forEach(({ blob, name }) => downloadFile(blob, name));
    };

    const downloadAllIndividual = () => {
        extractedPages.forEach(({ pageNum, blob }) => {
            downloadFile(blob, `${files[0].name.replace('.pdf', '')}_page_${pageNum}.pdf`);
        });
    };

    const downloadSelectedIndividual = () => {
        extractedPages
            .filter(p => selectedExtracted.has(p.pageNum))
            .forEach(({ pageNum, blob }) => {
                downloadFile(blob, `${files[0].name.replace('.pdf', '')}_page_${pageNum}.pdf`);
            });
    };

    const addRange = () => {
        setRanges([...ranges, { id: Date.now().toString(), start: '1', end: String(pageCount) }]);
    };

    const removeRange = (id: string) => {
        if (ranges.length > 1) {
            setRanges(ranges.filter(r => r.id !== id));
        }
    };

    const updateRange = (id: string, field: 'start' | 'end', value: string) => {
        setRanges(ranges.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Go back to extraction view (keep the same PDF loaded)
    const goBackToExtract = () => {
        setResults([]);
        setExtractedPages([]);
        setSelectedExtracted(new Set());
        // Keep files, previews, selectedPages intact so user can re-extract
    };

    // Full reset - new PDF
    const resetAll = () => {
        setFiles([]);
        setPageCount(0);
        setResults([]);
        setPreviews([]);
        setSelectedPages(new Set());
        setExtractedPages([]);
        setSelectedExtracted(new Set());
        setError(null);
        // Increment key to force re-render of file input
        fileInputKey.current += 1;
    };

    return (
        <ToolLayout
            title="Split PDF"
            description="Extract pages or split PDF into multiple files"
            icon={<Split className="w-6 h-6 text-white" />}
            category="pdf"
        >
            {/* Full Page Preview Modal */}
            {fullPagePreview && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setFullPagePreview(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
                        <button
                            onClick={() => setFullPagePreview(null)}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300 flex items-center gap-2"
                        >
                            <X className="w-6 h-6" />
                            Close
                        </button>
                        <div className="bg-white p-2 rounded-lg">
                            <img
                                src={fullPagePreview}
                                alt={`Page ${fullPageNum} Full View`}
                                className="max-w-full max-h-[85vh] object-contain"
                            />
                        </div>
                        <p className="text-center text-white mt-2">Page {fullPageNum}</p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* File Uploader - use key to force remount */}
            <div key={fileInputKey.current}>
                <FileUploader
                    accept=".pdf,application/pdf"
                    multiple={false}
                    maxFiles={1}
                    onFilesSelected={handleFilesSelected}
                    files={files}
                    onRemoveFile={() => resetAll()}
                />
            </div>

            {/* Page info */}
            {pageCount > 0 && (
                <p className="mt-2 text-sm text-indigo-400 text-center">
                    PDF has {pageCount} page{pageCount !== 1 ? 's' : ''}
                    {pageCount > 20 && ' (showing first 20 pages)'}
                </p>
            )}

            {/* Options - Show when we have files but no results yet */}
            {files.length > 0 && pageCount > 0 && results.length === 0 && (
                <div className="mt-6 space-y-6">
                    {/* Mode Selection */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('extract')}
                            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${mode === 'extract' ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            <Eye className="w-4 h-4 inline mr-2" />
                            Visual Extract
                        </button>
                        <button
                            onClick={() => setMode('range')}
                            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${mode === 'range' ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            Split by Ranges
                        </button>
                        <button
                            onClick={() => setMode('every')}
                            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${mode === 'every' ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            Split Every N
                        </button>
                    </div>

                    {/* Visual Extract Mode - Page Previews */}
                    {mode === 'extract' && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-sm font-medium">
                                    Click pages to select/deselect ({selectedPages.size} selected)
                                </label>
                                <div className="flex gap-2">
                                    <button onClick={selectAll} className="text-xs text-indigo-400 hover:text-indigo-300">
                                        Select All
                                    </button>
                                    <span className="text-gray-600">|</span>
                                    <button onClick={deselectAll} className="text-xs text-gray-400 hover:text-gray-300">
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            {isLoadingPreviews ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                                    <span className="ml-2 text-gray-400">Loading previews...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-80 overflow-y-auto p-2 bg-white/5 rounded-xl">
                                    {previews.map((preview) => (
                                        <div
                                            key={preview.pageNum}
                                            className={`relative rounded-lg overflow-hidden border-2 transition-all ${selectedPages.has(preview.pageNum)
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/50'
                                                : 'border-transparent opacity-50 hover:opacity-75'
                                                }`}
                                        >
                                            <div
                                                onClick={() => togglePageSelection(preview.pageNum)}
                                                className="cursor-pointer"
                                            >
                                                <img
                                                    src={preview.dataUrl}
                                                    alt={`Page ${preview.pageNum}`}
                                                    className="w-full h-auto"
                                                />
                                            </div>
                                            {/* Zoom button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    generateFullPreview(preview.pageNum);
                                                }}
                                                className="absolute top-1 left-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded flex items-center justify-center"
                                                title="View full page"
                                            >
                                                <ZoomIn className="w-3 h-3 text-white" />
                                            </button>
                                            <div className={`absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-medium ${selectedPages.has(preview.pageNum)
                                                ? 'bg-indigo-500 text-white'
                                                : 'bg-black/50 text-gray-300'
                                                }`}>
                                                {preview.pageNum}
                                            </div>
                                            {selectedPages.has(preview.pageNum) && (
                                                <div className="absolute top-1 right-1 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {pageCount > 20 && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Only first 20 pages shown. All {pageCount} pages will be processed.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Range Mode */}
                    {mode === 'range' && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium block">Page Ranges (creates separate PDFs)</label>
                            {ranges.map((range, index) => (
                                <div key={range.id} className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm w-8">#{index + 1}</span>
                                    <input
                                        type="number"
                                        value={range.start}
                                        onChange={(e) => updateRange(range.id, 'start', e.target.value)}
                                        min={1}
                                        max={pageCount}
                                        className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-center"
                                        placeholder="Start"
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        value={range.end}
                                        onChange={(e) => updateRange(range.id, 'end', e.target.value)}
                                        min={1}
                                        max={pageCount}
                                        className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-center"
                                        placeholder="End"
                                    />
                                    {ranges.length > 1 && (
                                        <button onClick={() => removeRange(range.id)} className="p-2 hover:bg-white/10 rounded">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addRange} className="btn-secondary flex items-center gap-2 text-sm">
                                <Plus className="w-4 h-4" /> Add Range
                            </button>
                        </div>
                    )}

                    {/* Every N Mode */}
                    {mode === 'every' && (
                        <div>
                            <label className="text-sm font-medium mb-2 block">Split every N pages</label>
                            <input
                                type="number"
                                value={everyN}
                                onChange={(e) => setEveryN(Math.max(1, parseInt(e.target.value) || 1))}
                                min={1}
                                max={pageCount}
                                className="w-32 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-center"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Will create {Math.ceil(pageCount / everyN)} PDF{Math.ceil(pageCount / everyN) !== 1 ? 's' : ''}
                            </p>
                        </div>
                    )}

                    {/* Split Button */}
                    <button
                        onClick={handleSplit}
                        disabled={isProcessing || (mode === 'extract' && selectedPages.size === 0)}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Splitting... ({Math.round(progress)}%)
                            </>
                        ) : (
                            <>
                                <Split className="w-5 h-5" />
                                {mode === 'extract' ? `Extract ${selectedPages.size} Page${selectedPages.size !== 1 ? 's' : ''}` : 'Split PDF'}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Progress */}
            {isProcessing && (
                <div className="mt-6">
                    <ProgressBar progress={progress} label="Splitting PDF..." />
                </div>
            )}

            {/* Results - Extracted Pages with Individual Downloads */}
            {results.length > 0 && mode === 'extract' && extractedPages.length > 0 && (
                <div className="mt-6 space-y-6">
                    {/* Success Message */}
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <p className="text-green-400 font-semibold">
                            ✓ Successfully extracted {extractedPages.length} page{extractedPages.length !== 1 ? 's' : ''}!
                        </p>
                    </div>

                    {/* Combined PDF Download */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Combined PDF</p>
                                <p className="text-sm text-gray-400">{extractedPages.length} pages • {formatSize(results[0].blob.size)}</p>
                            </div>
                            <button
                                onClick={() => downloadFile(results[0].blob, results[0].name)}
                                className="btn-primary flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download Combined
                            </button>
                        </div>
                    </div>

                    {/* Individual Pages Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium">
                                Individual Pages ({selectedExtracted.size} selected)
                            </label>
                            <div className="flex gap-2 items-center">
                                <button onClick={selectAllExtracted} className="text-xs text-indigo-400 hover:text-indigo-300">
                                    Select All
                                </button>
                                <span className="text-gray-600">|</span>
                                <button onClick={deselectAllExtracted} className="text-xs text-gray-400 hover:text-gray-300">
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        {/* Extracted Pages Grid */}
                        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 bg-white/5 rounded-xl">
                            {extractedPages.map((page) => (
                                <div
                                    key={page.pageNum}
                                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${selectedExtracted.has(page.pageNum)
                                        ? 'border-green-500 ring-2 ring-green-500/50'
                                        : 'border-transparent opacity-60 hover:opacity-80'
                                        }`}
                                >
                                    <div
                                        onClick={() => toggleExtractedSelection(page.pageNum)}
                                        className="cursor-pointer"
                                    >
                                        <img
                                            src={page.dataUrl}
                                            alt={`Page ${page.pageNum}`}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                    {/* Zoom button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            generateFullPreview(page.pageNum);
                                        }}
                                        className="absolute top-1 left-1 w-6 h-6 bg-black/60 hover:bg-black/80 rounded flex items-center justify-center"
                                        title="View full page"
                                    >
                                        <ZoomIn className="w-3 h-3 text-white" />
                                    </button>
                                    {/* Individual download button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            downloadFile(page.blob, `${files[0].name.replace('.pdf', '')}_page_${page.pageNum}.pdf`);
                                        }}
                                        className="absolute top-1 right-1 w-6 h-6 bg-green-500/80 hover:bg-green-500 rounded flex items-center justify-center"
                                        title="Download this page"
                                    >
                                        <Download className="w-3 h-3 text-white" />
                                    </button>
                                    <div className={`absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-medium ${selectedExtracted.has(page.pageNum)
                                        ? 'bg-green-500 text-white'
                                        : 'bg-black/50 text-gray-300'
                                        }`}>
                                        Page {page.pageNum}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Download Buttons */}
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={downloadAllIndividual}
                                className="flex-1 btn-secondary flex items-center justify-center gap-2"
                            >
                                <FileDown className="w-4 h-4" />
                                Download All ({extractedPages.length})
                            </button>
                            <button
                                onClick={downloadSelectedIndividual}
                                disabled={selectedExtracted.size === 0}
                                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                Download Selected ({selectedExtracted.size})
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={goBackToExtract}
                            className="flex-1 btn-secondary flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Extract More Pages
                        </button>
                        <button onClick={resetAll} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            New PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Results for Range/Every modes */}
            {results.length > 0 && mode !== 'extract' && (
                <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-green-400 font-semibold">PDF split successfully!</p>
                                <p className="text-sm text-gray-400">{results.length} file{results.length !== 1 ? 's' : ''} created</p>
                            </div>
                            {results.length > 1 && (
                                <button onClick={downloadAll} className="btn-primary flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download All
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {results.map(({ name, blob }, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{name}</p>
                                    <p className="text-sm text-gray-400">{formatSize(blob.size)}</p>
                                </div>
                                <button onClick={() => downloadFile(blob, name)} className="btn-primary text-sm py-2 px-4">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={goBackToExtract} className="flex-1 btn-secondary">
                            Split Same PDF Again
                        </button>
                        <button onClick={resetAll} className="flex-1 btn-secondary">
                            New PDF
                        </button>
                    </div>
                </div>
            )}
        </ToolLayout>
    );
}
