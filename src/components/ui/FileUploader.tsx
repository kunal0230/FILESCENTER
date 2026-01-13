'use client';

import { useState, useRef, DragEvent } from 'react';
import { Upload, X, FileIcon } from 'lucide-react';

interface FileUploaderProps {
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    onFilesSelected: (files: File[]) => void;
    files: File[];
    onRemoveFile: (index: number) => void;
}

export function FileUploader({
    accept = '*',
    multiple = false,
    maxFiles = 20,
    onFilesSelected,
    files,
    onRemoveFile
}: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFiles(droppedFiles);
    };

    const handleFiles = (newFiles: File[]) => {
        const validFiles = newFiles.slice(0, maxFiles - files.length);
        onFilesSelected([...files, ...validFiles]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            {/* Upload zone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`upload-zone p-8 cursor-pointer text-center transition-all ${isDragging ? 'drag-over scale-[1.02]' : ''
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleInputChange}
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500/30' : 'bg-indigo-500/20'} transition-colors`}>
                        <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-300' : 'text-indigo-400'}`} />
                    </div>

                    <div>
                        <p className="text-lg font-medium">
                            {isDragging ? 'Drop your files here' : 'Drag & drop files here'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            or click to browse from your device
                        </p>
                    </div>

                    <p className="text-xs text-gray-500">
                        {accept === '.pdf' ? 'PDF files only' : accept === 'image/*' ? 'Images only' : 'All files supported'}
                        {multiple && ` • Up to ${maxFiles} files`}
                    </p>
                </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                        >
                            <div className="p-2 rounded-lg bg-indigo-500/20">
                                <FileIcon className="w-5 h-5 text-indigo-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFile(index);
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
