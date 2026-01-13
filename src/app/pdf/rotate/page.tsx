'use client';

import { useState, useCallback, useEffect } from 'react';
import { RotateCw, Download, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

type RotationAngle = 90 | 180 | 270;

interface PagePreview {
    pageNum: number;
    originalDataUrl: string;
    rotation: number;
}

export default function RotatePDFPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [pageCount, setPageCount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [rotation, setRotation] = useState<RotationAngle>(90);
    const [mode, setMode] = useState<'all' | 'specific'>('all');
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [previews, setPreviews] = useState<PagePreview[]>([]);
    const [isLoadingPreviews, setIsLoadingPreviews] = useState(false);
    const [pageRotations, setPageRotations] = useState<Map<number, number>>(new Map());
    const [previewRotation, setPreviewRotation] = useState(0);

    const generatePreviews = async (file: File) => {
        setIsLoadingPreviews(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const numPages = pdf.numPages;
            const newPreviews: PagePreview[] = [];

            for (let i = 1; i <= Math.min(numPages, 12); i++) {
                const page = await pdf.getPage(i);
                const scale = 0.4;
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d')!;
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;

                newPreviews.push({
                    pageNum: i,
                    originalDataUrl: canvas.toDataURL('image/jpeg', 0.7),
                    rotation: 0
                });
            }

            setPreviews(newPreviews);
            // Initialize all page rotations to 0
            const rotations = new Map<number, number>();
            for (let i = 1; i <= numPages; i++) {
                rotations.set(i, 0);
            }
            setPageRotations(rotations);
        } catch (err) {
            console.error('Failed to generate previews:', err);
        } finally {
            setIsLoadingPreviews(false);
        }
    };

    const handleFilesSelected = useCallback(async (newFiles: File[]) => {
        setError(null);
        setResultBlob(null);
        setPreviews([]);
        setPageRotations(new Map());
        setPreviewRotation(0);

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

            generatePreviews(file);
        } catch (err) {
            setError('Failed to read PDF. The file may be corrupted or encrypted.');
        }
    }, []);

    const applyRotationToAll = () => {
        setPreviewRotation((prev) => (prev + rotation) % 360);

        // Update all page rotations
        const newRotations = new Map(pageRotations);
        previews.forEach(preview => {
            const current = newRotations.get(preview.pageNum) || 0;
            newRotations.set(preview.pageNum, (current + rotation) % 360);
        });
        setPageRotations(newRotations);
    };

    const rotateSpecificPage = (pageNum: number) => {
        const newRotations = new Map(pageRotations);
        const current = newRotations.get(pageNum) || 0;
        newRotations.set(pageNum, (current + rotation) % 360);
        setPageRotations(newRotations);
    };

    const handleRotate = async () => {
        if (files.length === 0) {
            setError('Please upload a PDF file first');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const arrayBuffer = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const rotationToApply = mode === 'all'
                    ? previewRotation
                    : (pageRotations.get(i + 1) || 0);

                if (rotationToApply !== 0) {
                    const currentRotation = page.getRotation().angle;
                    page.setRotation(degrees(currentRotation + rotationToApply));
                }
                setProgress(((i + 1) / pages.length) * 100);
            }

            const pdfBytes = await pdfDoc.save();
            setResultBlob(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to rotate PDF');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadResult = () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = files[0].name.replace('.pdf', `_rotated.pdf`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const resetAll = () => {
        setFiles([]);
        setPageCount(0);
        setResultBlob(null);
        setPreviews([]);
        setPageRotations(new Map());
        setPreviewRotation(0);
        setError(null);
    };

    return (
        <ToolLayout
            title="Rotate PDF"
            description="Rotate PDF pages with live preview"
            icon={<RotateCw className="w-6 h-6 text-white" />}
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
            {files.length > 0 && !resultBlob && (
                <div className="mt-6 space-y-6">
                    {/* Rotation Controls */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium">Rotation Angle</label>
                            <div className="flex gap-2">
                                {([90, 180, 270] as RotationAngle[]).map((angle) => (
                                    <button
                                        key={angle}
                                        onClick={() => setRotation(angle)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${rotation === angle
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    >
                                        {angle}°
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mode Selection */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setMode('all')}
                                className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'all' ? 'bg-indigo-500 text-white' : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                Rotate All Pages
                            </button>
                            <button
                                onClick={() => setMode('specific')}
                                className={`flex-1 py-2 rounded-lg transition-colors ${mode === 'specific' ? 'bg-indigo-500 text-white' : 'bg-white/10 hover:bg-white/20'
                                    }`}
                            >
                                Rotate Individual Pages
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium">
                                {mode === 'all' ? 'Preview (all pages will rotate together)' : 'Click a page to rotate it'}
                            </label>
                            {mode === 'all' && (
                                <button
                                    onClick={applyRotationToAll}
                                    className="btn-secondary text-sm flex items-center gap-2"
                                >
                                    <RotateCw className="w-4 h-4" />
                                    Rotate {rotation}°
                                </button>
                            )}
                        </div>

                        {isLoadingPreviews ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                                <span className="ml-2 text-gray-400">Loading previews...</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4 bg-white/5 rounded-xl max-h-80 overflow-y-auto">
                                {previews.map((preview) => {
                                    const pageRot = mode === 'all' ? previewRotation : (pageRotations.get(preview.pageNum) || 0);
                                    return (
                                        <div
                                            key={preview.pageNum}
                                            onClick={() => mode === 'specific' && rotateSpecificPage(preview.pageNum)}
                                            className={`relative rounded-lg overflow-hidden border-2 transition-all bg-gray-800 ${mode === 'specific' ? 'cursor-pointer hover:border-indigo-400' : ''
                                                } ${pageRot !== 0 ? 'border-indigo-500' : 'border-transparent'}`}
                                        >
                                            <div className="aspect-[3/4] flex items-center justify-center p-1">
                                                <img
                                                    src={preview.originalDataUrl}
                                                    alt={`Page ${preview.pageNum}`}
                                                    className="max-w-full max-h-full object-contain transition-transform duration-300"
                                                    style={{ transform: `rotate(${pageRot}deg)` }}
                                                />
                                            </div>
                                            <div className={`absolute bottom-0 left-0 right-0 py-1 text-center text-xs font-medium ${pageRot !== 0 ? 'bg-indigo-500 text-white' : 'bg-black/70 text-gray-300'
                                                }`}>
                                                {preview.pageNum} {pageRot !== 0 && `(${pageRot}°)`}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {pageCount > 12 && (
                            <p className="text-xs text-gray-500 mt-2">
                                Showing first 12 pages. All {pageCount} pages will be rotated.
                            </p>
                        )}
                    </div>

                    {/* Rotate Button */}
                    <button
                        onClick={handleRotate}
                        disabled={isProcessing || (mode === 'all' ? previewRotation === 0 : !Array.from(pageRotations.values()).some(r => r !== 0))}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Rotating... ({Math.round(progress)}%)
                            </>
                        ) : (
                            <>
                                <RotateCw className="w-5 h-5" />
                                Apply Rotation
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Progress */}
            {isProcessing && (
                <div className="mt-6">
                    <ProgressBar progress={progress} label="Rotating pages..." />
                </div>
            )}

            {/* Result */}
            {resultBlob && (
                <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-green-400 font-semibold">PDF rotated successfully!</p>
                                <p className="text-sm text-gray-400">{formatSize(resultBlob.size)}</p>
                            </div>
                            <button onClick={downloadResult} className="btn-primary flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>

                    <button onClick={resetAll} className="btn-secondary w-full">
                        Rotate Another PDF
                    </button>
                </div>
            )}
        </ToolLayout>
    );
}
