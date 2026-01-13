'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Layers, Download, Loader2, AlertCircle, Type, Move } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

type WatermarkPosition = 'center' | 'diagonal' | 'tile' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export default function WatermarkPDFPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [pageCount, setPageCount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
    const [fontSize, setFontSize] = useState(48);
    const [opacity, setOpacity] = useState(30);
    const [position, setPosition] = useState<WatermarkPosition>('diagonal');
    const [color, setColor] = useState('#ff0000');
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const generatePreview = useCallback(async (file: File) => {
        if (!canvasRef.current) return;

        setIsLoadingPreview(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);

            const scale = 1.5;
            const viewport = page.getViewport({ scale });

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d')!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;

            setPreviewUrl(canvas.toDataURL('image/jpeg', 0.8));
        } catch (err) {
            console.error('Failed to generate preview:', err);
        } finally {
            setIsLoadingPreview(false);
        }
    }, []);

    const handleFilesSelected = useCallback(async (newFiles: File[]) => {
        setError(null);
        setResultBlob(null);
        setPreviewUrl(null);

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

            generatePreview(file);
        } catch (err) {
            setError('Failed to read PDF. The file may be corrupted or encrypted.');
        }
    }, [generatePreview]);

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 1, g: 0, b: 0 };
    };

    const handleAddWatermark = async () => {
        if (files.length === 0) {
            setError('Please upload a PDF file first');
            return;
        }

        if (!watermarkText.trim()) {
            setError('Please enter watermark text');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            const arrayBuffer = await files[0].arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const pages = pdfDoc.getPages();
            const { r, g, b } = hexToRgb(color);
            const actualOpacity = opacity / 100;

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

                if (position === 'tile') {
                    // Tile watermark across the page
                    const spacing = fontSize * 3;
                    for (let y = 0; y < height; y += spacing) {
                        for (let x = -width; x < width * 2; x += textWidth + 100) {
                            page.drawText(watermarkText, {
                                x: x + (y % (spacing * 2) === 0 ? 0 : textWidth / 2),
                                y,
                                size: fontSize,
                                font,
                                color: rgb(r, g, b),
                                opacity: actualOpacity * 0.5,
                                rotate: degrees(-45),
                            });
                        }
                    }
                } else if (position === 'diagonal') {
                    page.drawText(watermarkText, {
                        x: width / 2 - textWidth / 2,
                        y: height / 2,
                        size: fontSize,
                        font,
                        color: rgb(r, g, b),
                        opacity: actualOpacity,
                        rotate: degrees(-45),
                    });
                } else {
                    let x = 0, y = 0;
                    const margin = 50;

                    switch (position) {
                        case 'center':
                            x = (width - textWidth) / 2;
                            y = height / 2;
                            break;
                        case 'top-left':
                            x = margin;
                            y = height - margin - fontSize;
                            break;
                        case 'top-center':
                            x = (width - textWidth) / 2;
                            y = height - margin - fontSize;
                            break;
                        case 'top-right':
                            x = width - textWidth - margin;
                            y = height - margin - fontSize;
                            break;
                        case 'bottom-left':
                            x = margin;
                            y = margin;
                            break;
                        case 'bottom-center':
                            x = (width - textWidth) / 2;
                            y = margin;
                            break;
                        case 'bottom-right':
                            x = width - textWidth - margin;
                            y = margin;
                            break;
                    }

                    page.drawText(watermarkText, {
                        x,
                        y,
                        size: fontSize,
                        font,
                        color: rgb(r, g, b),
                        opacity: actualOpacity,
                    });
                }

                setProgress(((i + 1) / pages.length) * 100);
            }

            const pdfBytes = await pdfDoc.save();
            setResultBlob(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add watermark');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadResult = () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = files[0].name.replace('.pdf', '_watermarked.pdf');
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
        setPreviewUrl(null);
        setError(null);
    };

    const positions: { value: WatermarkPosition; label: string; icon?: string }[] = [
        { value: 'diagonal', label: 'Diagonal' },
        { value: 'center', label: 'Center' },
        { value: 'tile', label: 'Tile (Repeat)' },
        { value: 'top-left', label: '↖ Top Left' },
        { value: 'top-center', label: '↑ Top' },
        { value: 'top-right', label: '↗ Top Right' },
        { value: 'bottom-left', label: '↙ Bottom Left' },
        { value: 'bottom-center', label: '↓ Bottom' },
        { value: 'bottom-right', label: '↘ Bottom Right' },
    ];

    const presetColors = ['#ff0000', '#0000ff', '#000000', '#666666', '#ff6600', '#009900'];

    return (
        <ToolLayout
            title="Add Watermark"
            description="Add text watermark to your PDF documents"
            icon={<Layers className="w-6 h-6 text-white" />}
            category="pdf"
        >
            {/* Hidden canvas for preview generation */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
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
                <p className="mt-2 text-sm text-indigo-600 text-center font-medium">
                    PDF has {pageCount} page{pageCount !== 1 ? 's' : ''}
                </p>
            )}

            {/* Options */}
            {files.length > 0 && !resultBlob && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* Left Column - Controls */}
                    <div className="space-y-5 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        {/* Watermark Text */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <Type className="w-4 h-4 text-indigo-500" /> Watermark Text
                            </label>
                            <input
                                type="text"
                                value={watermarkText}
                                onChange={(e) => setWatermarkText(e.target.value)}
                                placeholder="Enter watermark text"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 text-lg text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        {/* Position Grid */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                                <Move className="w-4 h-4 text-indigo-500" /> Position
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {positions.map(({ value, label }) => (
                                    <button
                                        key={value}
                                        onClick={() => setPosition(value)}
                                        className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${position === value
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Size */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">Font Size: {fontSize}px</label>
                            </div>
                            <input
                                type="range"
                                min="12"
                                max="120"
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                                className="w-full accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Small</span>
                                <span>Large</span>
                            </div>
                        </div>

                        {/* Color */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                            <div className="flex gap-2 items-center">
                                {presetColors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`w-8 h-8 rounded-lg border-2 transition-transform shadow-sm ${color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                                            }`}
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Opacity */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">Opacity: {opacity}%</label>
                            </div>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                step="5"
                                value={opacity}
                                onChange={(e) => setOpacity(Number(e.target.value))}
                                className="w-full accent-indigo-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Subtle</span>
                                <span>Visible</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Preview & Action */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Live Preview</label>
                            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[300px]">
                                {isLoadingPreview ? (
                                    <div className="h-80 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                                    </div>
                                ) : previewUrl ? (
                                    <div className="relative w-full">
                                        <img
                                            src={previewUrl}
                                            alt="PDF Preview"
                                            className="w-full h-auto max-h-[400px] object-contain mx-auto shadow-sm"
                                        />
                                        {/* Watermark overlay */}
                                        <div
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
                                            style={{
                                                ...(position === 'tile' ? {
                                                    background: `repeating-linear-gradient(
                          -45deg,
                          transparent,
                          transparent 80px,
                          ${color}${Math.round(opacity * 0.3).toString(16).padStart(2, '0')} 80px,
                          ${color}${Math.round(opacity * 0.3).toString(16).padStart(2, '0')} 81px
                        )`
                                                } : {})
                                            }}
                                        >
                                            {position !== 'tile' && (
                                                <span
                                                    className="whitespace-nowrap font-bold"
                                                    style={{
                                                        color: color,
                                                        opacity: opacity / 100,
                                                        fontSize: `${Math.min(fontSize * 0.5, 48)}px`,
                                                        transform: position === 'diagonal' ? 'rotate(-45deg)' : 'none',
                                                        position: 'absolute',
                                                        ...(position === 'top-left' && { top: '10%', left: '5%' }),
                                                        ...(position === 'top-center' && { top: '10%', left: '50%', transform: 'translateX(-50%)' }),
                                                        ...(position === 'top-right' && { top: '10%', right: '5%' }),
                                                        ...(position === 'center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
                                                        ...(position === 'diagonal' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)' }),
                                                        ...(position === 'bottom-left' && { bottom: '10%', left: '5%' }),
                                                        ...(position === 'bottom-center' && { bottom: '10%', left: '50%', transform: 'translateX(-50%)' }),
                                                        ...(position === 'bottom-right' && { bottom: '10%', right: '5%' }),
                                                    }}
                                                >
                                                    {watermarkText || 'WATERMARK'}
                                                </span>
                                            )}
                                            {position === 'tile' && (
                                                <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-8" style={{ transform: 'rotate(-45deg) scale(1.5)' }}>
                                                    {Array(9).fill(0).map((_, i) => (
                                                        <span
                                                            key={i}
                                                            style={{
                                                                color: color,
                                                                opacity: (opacity / 100) * 0.5,
                                                                fontSize: `${Math.min(fontSize * 0.4, 24)}px`,
                                                            }}
                                                            className="font-bold"
                                                        >
                                                            {watermarkText}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-80 flex items-center justify-center text-gray-400">
                                        Preview will appear here
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Add Watermark Button */}
                        <button
                            onClick={handleAddWatermark}
                            disabled={isProcessing || !watermarkText.trim()}
                            className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg transition-all"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Adding watermark... ({Math.round(progress)}%)
                                </>
                            ) : (
                                <>
                                    <Layers className="w-5 h-5" />
                                    Add Watermark to All Pages
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Progress */}
            {isProcessing && (
                <div className="mt-8 max-w-md mx-auto">
                    <ProgressBar progress={progress} label="Adding watermark to pages..." />
                </div>
            )}

            {/* Result */}
            {resultBlob && (
                <div className="mt-8 space-y-4 max-w-lg mx-auto">
                    <div className="p-6 rounded-xl bg-green-50 border border-green-200 shadow-sm text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Layers className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Watermark Added Successfully!</h3>
                        <p className="text-gray-500 mb-6">{formatSize(resultBlob.size)} • Ready for download</p>

                        <button onClick={downloadResult} className="w-full py-3 rounded-xl font-bold bg-green-600 text-white shadow-lg shadow-green-500/25 hover:bg-green-700 flex items-center justify-center gap-2 transition-all">
                            <Download className="w-5 h-5" />
                            Download Watermarked PDF
                        </button>
                    </div>

                    <button onClick={resetAll} className="w-full py-3 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                        Watermark Another PDF
                    </button>
                </div>
            )}
        </ToolLayout>
    );
}
