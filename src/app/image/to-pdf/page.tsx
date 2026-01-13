'use client';

import { useState } from 'react';
import { FileText, Download, Trash2, Upload } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';
import { PDFDocument } from 'pdf-lib';

export default function ImageToPDFPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const [pageSize, setPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');

    const handleFilesSelected = (newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles]);
        setPdfBlob(null);
    };

    const handleRemoveFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPdfBlob(null);
    };

    const convertToPDF = async () => {
        if (files.length === 0) return;

        setIsProcessing(true);
        try {
            const pdfDoc = await PDFDocument.create();

            for (const file of files) {
                const imageBytes = await file.arrayBuffer();
                let image;

                if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                    image = await pdfDoc.embedJpg(imageBytes);
                } else if (file.type === 'image/png') {
                    image = await pdfDoc.embedPng(imageBytes);
                } else {
                    // Convert other formats to PNG using canvas
                    const img = new Image();
                    const url = URL.createObjectURL(file);
                    await new Promise((resolve) => {
                        img.onload = resolve;
                        img.src = url;
                    });

                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);

                    const pngBlob = await new Promise<Blob>((resolve) => {
                        canvas.toBlob(b => resolve(b!), 'image/png');
                    });
                    const pngBytes = await pngBlob.arrayBuffer();
                    image = await pdfDoc.embedPng(pngBytes);
                }

                let pageWidth, pageHeight;

                if (pageSize === 'fit') {
                    pageWidth = image.width;
                    pageHeight = image.height;
                } else if (pageSize === 'a4') {
                    pageWidth = 595.28;
                    pageHeight = 841.89;
                } else {
                    pageWidth = 612;
                    pageHeight = 792;
                }

                const page = pdfDoc.addPage([pageWidth, pageHeight]);

                if (pageSize === 'fit') {
                    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
                } else {
                    const scale = Math.min(pageWidth / image.width, pageHeight / image.height) * 0.9;
                    const scaledWidth = image.width * scale;
                    const scaledHeight = image.height * scale;
                    page.drawImage(image, {
                        x: (pageWidth - scaledWidth) / 2,
                        y: (pageHeight - scaledHeight) / 2,
                        width: scaledWidth,
                        height: scaledHeight
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            setPdfBlob(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }));
        } catch (error) {
            console.error('Error creating PDF:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadPDF = () => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'images.pdf';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <ToolLayout
            title="Image to PDF"
            description="Convert images to a single PDF document"
            icon={<FileText className="w-6 h-6 text-white" />}
            category="image"
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Controls */}
                <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-5">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">Page Size</h3>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'fit', label: 'Fit Image' },
                                { id: 'a4', label: 'A4' },
                                { id: 'letter', label: 'Letter' },
                            ].map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setPageSize(id as typeof pageSize)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${pageSize === id
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-black/20 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <FileUploader
                        accept="image/*"
                        multiple={true}
                        maxFiles={20}
                        onFilesSelected={handleFilesSelected}
                        files={files}
                        onRemoveFile={handleRemoveFile}
                    />

                    <button
                        onClick={convertToPDF}
                        disabled={files.length === 0 || isProcessing}
                        className="w-full py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isProcessing ? 'Creating PDF...' : 'Convert to PDF'}
                    </button>

                    {pdfBlob && (
                        <button
                            onClick={downloadPDF}
                            className="w-full py-3 rounded-xl font-medium bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                    )}
                </div>

                {/* Right: Preview */}
                <div className="flex-1 bg-white/5 rounded-xl border border-white/10 min-h-[400px] flex items-center justify-center">
                    {files.length === 0 ? (
                        <div className="text-center text-gray-500">
                            <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Upload images to convert to PDF</p>
                        </div>
                    ) : (
                        <div className="p-4 w-full">
                            <p className="text-sm text-gray-400 mb-3">{files.length} image(s) selected</p>
                            <div className="grid grid-cols-4 gap-2">
                                {files.slice(0, 8).map((file, i) => (
                                    <div key={i} className="aspect-square rounded-lg bg-black/30 overflow-hidden relative group">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => handleRemoveFile(i)}
                                            className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                {files.length > 8 && (
                                    <div className="aspect-square rounded-lg bg-black/30 flex items-center justify-center text-gray-400 text-sm">
                                        +{files.length - 8} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}
