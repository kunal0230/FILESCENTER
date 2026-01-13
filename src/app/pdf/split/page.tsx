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
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
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
                <p className="mt-2 text-sm text-indigo-600 text-center font-medium">
                    PDF has {pageCount} page{pageCount !== 1 ? 's' : ''}
                    {pageCount > 20 && ' (showing first 20 pages)'}
                </p>
            )}

            {/* Options - Show when we have files but no results yet */}
            {files.length > 0 && pageCount > 0 && results.length === 0 && (
                <div className="mt-6 space-y-6">
                    {/* Mode Selection */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setMode('extract')}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${mode === 'extract'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200/50'
                                }`}
                        >
                            <Eye className="w-4 h-4 inline mr-2" />
                            Visual Extract
                        </button>
                        <button
                            onClick={() => setMode('range')}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${mode === 'range'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200/50'
                                }`}
                        >
                            Split by Ranges
                        </button>
                        <button
                            onClick={() => setMode('every')}
                            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${mode === 'every'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-gray-600 hover:bg-gray-200/50'
                                }`}
                        >
                            Split Every N
                        </button>
                    </div>

                    {/* Visual Extract Mode - Page Previews */}
                    {mode === 'extract' && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-gray-700">
                                    Click pages to select/deselect ({selectedPages.size} selected)
                                </label>
                                <div className="flex gap-3">
                                    <button onClick={selectAll} className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline">
                                        Select All
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button onClick={deselectAll} className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline">
                                        Deselect All
                                    </button>
                                </div>
                            </div>

                            {isLoadingPreviews ? (
                                <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-100">
                                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                    <span className="ml-2 text-gray-500 font-medium">Loading previews...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-100 custom-scrollbar">
                                    {previews.map((preview) => (
                                        <div
                                            key={preview.pageNum}
                                            className={`relative rounded-lg overflow-hidden border-2 transition-all shadow-sm ${selectedPages.has(preview.pageNum)
                                                ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                                                : 'border-white opacity-70 hover:opacity-100 hover:border-gray-300'
                                                }`}
                                        >
                                            <div
                                                onClick={() => togglePageSelection(preview.pageNum)}
                                                className="cursor-pointer bg-white"
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
                                                className="absolute top-1 left-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded flex items-center justify-center transition-colors"
                                                title="View full page"
                                            >
                                                <ZoomIn className="w-3 h-3 text-white" />
                                            </button>
                                            <div className={`absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-medium ${selectedPages.has(preview.pageNum)
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-900/80 text-white'
                                                }`}>
                                                {preview.pageNum}
                                            </div>
                                            {selectedPages.has(preview.pageNum) && (
                                                <div className="absolute top-1 right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-sm">
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
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    Only first 20 pages shown. All {pageCount} pages will be processed.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Range Mode */}
                    {mode === 'range' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                            <label className="text-sm font-medium text-gray-700 block">Page Ranges (creates separate PDFs)</label>
                            {ranges.map((range, index) => (
                                <div key={range.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-gray-500 text-sm font-medium w-6 lg:w-8">#{index + 1}</span>
                                    <input
                                        type="number"
                                        value={range.start}
                                        onChange={(e) => updateRange(range.id, 'start', e.target.value)}
                                        min={1}
                                        max={pageCount}
                                        className="w-24 px-3 py-2 rounded-lg bg-white border border-gray-200 text-center focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-gray-900"
                                        placeholder="Start"
                                    />
                                    <span className="text-gray-400 text-sm font-medium">to</span>
                                    <input
                                        type="number"
                                        value={range.end}
                                        onChange={(e) => updateRange(range.id, 'end', e.target.value)}
                                        min={1}
                                        max={pageCount}
                                        className="w-24 px-3 py-2 rounded-lg bg-white border border-gray-200 text-center focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-gray-900"
                                        placeholder="End"
                                    />
                                    {ranges.length > 1 && (
                                        <button onClick={() => removeRange(range.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto">
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button onClick={addRange} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                                <Plus className="w-4 h-4" /> Add Another Range
                            </button>
                        </div>
                    )}

                    {/* Every N Mode */}
                    {mode === 'every' && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <label className="text-sm font-medium text-gray-700 mb-3 block">Split every N pages</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="number"
                                    value={everyN}
                                    onChange={(e) => setEveryN(Math.max(1, parseInt(e.target.value) || 1))}
                                    min={1}
                                    max={pageCount}
                                    className="w-32 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-center text-lg font-medium text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                                <span className="text-gray-500">pages</span>
                            </div>
                            <div className="mt-4 p-3 bg-indigo-50 text-indigo-700 rounded-lg text-sm border border-indigo-100 inline-block">
                                This will create <strong>{Math.ceil(pageCount / everyN)}</strong> PDF files
                            </div>
                        </div>
                    )}

                    {/* Split Button */}
                    <button
                        onClick={handleSplit}
                        disabled={isProcessing || (mode === 'extract' && selectedPages.size === 0)}
                        className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg transition-all"
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
                <div className="mt-8 max-w-md mx-auto">
                    <ProgressBar progress={progress} label="Splitting PDF..." />
                </div>
            )}

            {/* Results - Extracted Pages with Individual Downloads */}
            {results.length > 0 && mode === 'extract' && extractedPages.length > 0 && (
                <div className="mt-8 space-y-6">
                    {/* Success Message */}
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <FileDown className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-green-700 font-medium">
                            Successfully extracted {extractedPages.length} page{extractedPages.length !== 1 ? 's' : ''}!
                        </p>
                    </div>

                    {/* Combined PDF Download */}
                    <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
                                <Split className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Combined PDF</p>
                                <p className="text-sm text-gray-500">{extractedPages.length} pages • {formatSize(results[0].blob.size)}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => downloadFile(results[0].blob, results[0].name)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download Combined
                        </button>
                    </div>

                    {/* Individual Pages Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3">
                            <label className="text-sm font-medium text-gray-700">
                                Individual Pages ({selectedExtracted.size} selected)
                            </label>
                            <div className="flex gap-3">
                                <button onClick={selectAllExtracted} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                                    Select All
                                </button>
                                <span className="text-gray-300">|</span>
                                <button onClick={deselectAllExtracted} className="text-xs font-medium text-gray-500 hover:text-gray-700">
                                    Deselect All
                                </button>
                            </div>
                        </div>

                        {/* Extracted Pages Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1">
                                {extractedPages.map((page) => (
                                    <div
                                        key={page.pageNum}
                                        className={`relative rounded-lg overflow-hidden border-2 transition-all shadow-sm ${selectedExtracted.has(page.pageNum)
                                            ? 'border-green-500 ring-2 ring-green-500/30'
                                            : 'border-gray-100 opacity-80 hover:opacity-100 hover:border-gray-300'
                                            }`}
                                    >
                                        <div
                                            onClick={() => toggleExtractedSelection(page.pageNum)}
                                            className="cursor-pointer bg-white"
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
                                            className="absolute top-1 left-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded flex items-center justify-center"
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
                                            className="absolute top-1 right-1 w-6 h-6 bg-green-500 text-white rounded shadow-sm hover:bg-green-600 flex items-center justify-center transition-colors"
                                            title="Download this page"
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        <div className={`absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-medium ${selectedExtracted.has(page.pageNum)
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-900/80 text-white'
                                            }`}>
                                            Page {page.pageNum}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Download Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-6">
                                <button
                                    onClick={downloadAllIndividual}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Download All ({extractedPages.length})
                                </button>
                                <button
                                    onClick={downloadSelectedIndividual}
                                    disabled={selectedExtracted.size === 0}
                                    className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 shadow-md shadow-green-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Selected ({selectedExtracted.size})
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={goBackToExtract}
                            className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Extract More Pages
                        </button>
                        <button onClick={resetAll} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" />
                            New PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Results for Range/Every modes */}
            {results.length > 0 && mode !== 'extract' && (
                <div className="mt-8 space-y-4 max-w-2xl mx-auto">
                    <div className="p-6 rounded-xl bg-green-50 border border-green-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Split className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">PDF Split Successfully!</h3>
                        <p className="text-gray-500 mb-6">{results.length} file{results.length !== 1 ? 's' : ''} created</p>

                        {results.length > 1 && (
                            <button onClick={downloadAll} className="w-full py-3 rounded-xl font-bold bg-green-600 text-white shadow-lg shadow-green-500/25 hover:bg-green-700 flex items-center justify-center gap-2 transition-all">
                                <Download className="w-5 h-5" />
                                Download All Files (ZIP)
                            </button>
                        )}
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                        {results.map(({ name, blob }, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center border border-red-100 text-red-500 shrink-0">
                                    <FileDown className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-700 truncate">{name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{formatSize(blob.size)}</p>
                                </div>
                                <button
                                    onClick={() => downloadFile(blob, name)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    title="Download"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button onClick={resetAll} className="w-full py-3 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                            Split Another PDF
                        </button>
                    </div>
                </div>
            )}
        </ToolLayout>
    );
}
