'use client';

import { useState, useRef, useEffect } from 'react';
import { Crop as CropIcon, Download, Loader2, Image as ImageIcon, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Upload } from 'lucide-react';
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { cropImage } from '@/lib/image/utils';

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
    );
}

export default function ImageCropPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [aspect, setAspect] = useState<number | undefined>(undefined);
    const [rotate, setRotate] = useState(0);
    const [flip, setFlip] = useState({ horizontal: false, vertical: false });
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const imgRef = useRef<HTMLImageElement>(null);

    const aspectRatios = [
        { label: 'Free', value: undefined },
        { label: '1:1', value: 1 },
        { label: '16:9', value: 16 / 9 },
        { label: '4:3', value: 4 / 3 },
        { label: '9:16', value: 9 / 16 },
    ];

    useEffect(() => {
        if (files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
            reader.readAsDataURL(files[0]);
        } else {
            setImgSrc('');
        }
    }, [files]);

    const handleFilesSelected = (newFiles: File[]) => {
        const imageFiles = newFiles.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            setFiles([imageFiles[0]]);
            setRotate(0);
            setFlip({ horizontal: false, vertical: false });
        }
    };

    const handleRemoveFile = () => {
        setFiles([]);
        setImgSrc('');
        setCrop(undefined);
        setCompletedCrop(undefined);
        setRotate(0);
        setFlip({ horizontal: false, vertical: false });
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, aspect || 16 / 9, width, height),
            width,
            height,
        );
        setCrop(initialCrop);
    };

    const handleDownload = async () => {
        if (!imgRef.current || !completedCrop) return;

        setIsProcessing(true);
        try {
            const blob = await cropImage(imgRef.current, completedCrop, files[0].type as any, rotate, flip);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const originalName = files[0].name;
            const nameParts = originalName.split('.');
            const ext = nameParts.pop();
            a.download = `${nameParts.join('.')}_cropped.${ext}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAspectChange = (value: number | undefined) => {
        setAspect(value);
        if (imgRef.current) {
            const { width, height } = imgRef.current;
            const newCrop = value
                ? centerAspectCrop(width, height, value)
                : centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 16 / 9, width, height), width, height);
            setCrop(newCrop);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFilesSelected(Array.from(e.dataTransfer.files));
    };

    return (
        <ToolLayout
            title="Crop Image"
            description="Crop, rotate, and flip images with precise control"
            icon={<CropIcon className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Unified Single-Screen Layout */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* LEFT: Controls */}
                <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-5">

                    {/* Crop Settings */}
                    <div className="bg-white/50 p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Crop Settings</h3>

                        {/* Aspect Ratio */}
                        <div className="mb-5">
                            <label className="block text-xs text-gray-500 mb-2">Aspect Ratio</label>
                            <div className="grid grid-cols-3 gap-2">
                                {aspectRatios.map((ratio) => (
                                    <button
                                        key={ratio.label}
                                        onClick={() => handleAspectChange(ratio.value)}
                                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${aspect === ratio.value
                                            ? 'bg-indigo-500 text-white border-indigo-500'
                                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm'
                                            }`}
                                    >
                                        {ratio.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Transform Controls */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2">Transform</label>
                            <div className="grid grid-cols-4 gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                                <button
                                    onClick={() => setRotate(r => r - 90)}
                                    className="p-2 hover:bg-white rounded-md text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center hover:shadow-sm"
                                    title="Rotate Left"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setRotate(r => r + 90)}
                                    className="p-2 hover:bg-white rounded-md text-gray-500 hover:text-gray-900 transition-colors flex items-center justify-center hover:shadow-sm"
                                    title="Rotate Right"
                                >
                                    <RotateCw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setFlip(f => ({ ...f, horizontal: !f.horizontal }))}
                                    className={`p-2 rounded-md transition-colors flex items-center justify-center ${flip.horizontal ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}
                                    title="Flip Horizontal"
                                >
                                    <FlipHorizontal className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setFlip(f => ({ ...f, vertical: !f.vertical }))}
                                    className={`p-2 rounded-md transition-colors flex items-center justify-center ${flip.vertical ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'}`}
                                    title="Flip Vertical"
                                >
                                    <FlipVertical className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Compact Upload Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${isDragging
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                            }`}
                        onClick={() => document.getElementById('crop-file-input')?.click()}
                    >
                        <input
                            id="crop-file-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
                        />
                        <Upload className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                        <p className="text-sm text-gray-600">{files.length > 0 ? 'Change image' : 'Drop file or click to upload'}</p>
                    </div>

                    {/* Action Buttons */}
                    <button
                        onClick={handleDownload}
                        disabled={!completedCrop || isProcessing || files.length === 0}
                        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${!completedCrop || files.length === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600'
                            }`}
                    >
                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span>Download Cropped Image</span>
                    </button>

                    {files.length > 0 && (
                        <button onClick={handleRemoveFile} className="text-xs text-gray-500 hover:text-white transition-colors">
                            Remove image
                        </button>
                    )}
                </div>

                {/* RIGHT: Editor / Placeholder */}
                <div className="flex-1 bg-[url('/grid.svg')] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden relative flex items-center justify-center min-h-[400px]">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none" />

                    {files.length > 0 && imgSrc ? (
                        <div className="p-4 flex items-center justify-center w-full h-full">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                                className="max-w-full shadow-2xl"
                                style={{ maxHeight: '100%' }}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    style={{
                                        maxHeight: 'calc(100vh - 350px)',
                                        objectFit: 'contain',
                                        transform: `rotate(${rotate}deg) scale(${flip.horizontal ? -1 : 1}, ${flip.vertical ? -1 : 1})`,
                                        transition: 'transform 0.3s ease-in-out'
                                    }}
                                />
                            </ReactCrop>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-sm">No image selected</p>
                            <p className="text-xs mt-1 opacity-70">Upload an image to start cropping</p>
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}
