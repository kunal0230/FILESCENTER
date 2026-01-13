'use client';

import { useState } from 'react';
import { Code, Copy, Check, Upload, Download } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';

export default function ImageToBase64Page() {
    const [files, setFiles] = useState<File[]>([]);
    const [base64Result, setBase64Result] = useState<string>('');
    const [includeDataUri, setIncludeDataUri] = useState(true);
    const [copied, setCopied] = useState(false);

    const handleFilesSelected = (newFiles: File[]) => {
        if (newFiles.length > 0) {
            setFiles([newFiles[0]]);
            convertToBase64(newFiles[0]);
        }
    };

    const handleRemoveFile = () => {
        setFiles([]);
        setBase64Result('');
    };

    const convertToBase64 = async (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setBase64Result(includeDataUri ? result : result.split(',')[1]);
        };
        reader.readAsDataURL(file);
    };

    const copyToClipboard = async () => {
        const textToCopy = includeDataUri ? base64Result : base64Result.split(',').pop() || base64Result;
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadAsText = () => {
        const textToDownload = includeDataUri ? base64Result : base64Result.split(',').pop() || base64Result;
        const blob = new Blob([textToDownload], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'image-base64.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const getDisplayResult = () => {
        if (!base64Result) return '';
        return includeDataUri ? base64Result : (base64Result.split(',').pop() || base64Result);
    };

    return (
        <ToolLayout
            title="Image to Base64"
            description="Convert images to Base64 encoded strings"
            icon={<Code className="w-6 h-6 text-white" />}
            category="image"
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: Upload & Options */}
                <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-5">
                    <FileUploader
                        accept="image/*"
                        multiple={false}
                        maxFiles={1}
                        onFilesSelected={handleFilesSelected}
                        files={files}
                        onRemoveFile={handleRemoveFile}
                    />

                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={includeDataUri}
                                onChange={(e) => {
                                    setIncludeDataUri(e.target.checked);
                                    if (files[0]) convertToBase64(files[0]);
                                }}
                                className="rounded bg-black/30 border-white/20"
                            />
                            Include data URI prefix
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                            {includeDataUri ? 'data:image/png;base64,...' : 'Raw base64 string'}
                        </p>
                    </div>

                    {base64Result && (
                        <div className="flex gap-2">
                            <button
                                onClick={copyToClipboard}
                                className="flex-1 py-2.5 rounded-xl font-medium bg-indigo-500 text-white hover:bg-indigo-600 flex items-center justify-center gap-2"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={downloadAsText}
                                className="px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {base64Result && (
                        <div className="text-xs text-gray-500">
                            String length: {getDisplayResult().length.toLocaleString()} characters
                        </div>
                    )}
                </div>

                {/* Right: Preview & Result */}
                <div className="flex-1 flex flex-col gap-4">
                    {files[0] && (
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Image Preview</h3>
                            <img
                                src={URL.createObjectURL(files[0])}
                                alt="Preview"
                                className="max-h-48 rounded-lg object-contain mx-auto"
                            />
                        </div>
                    )}

                    <div className="flex-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-3 border-b border-white/5 bg-black/20">
                            <h3 className="text-sm font-medium text-gray-400">Base64 Output</h3>
                        </div>
                        <div className="p-4 h-64 overflow-auto">
                            {base64Result ? (
                                <pre className="font-mono text-xs text-indigo-300 whitespace-pre-wrap break-all">
                                    {getDisplayResult()}
                                </pre>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-500">
                                    <div className="text-center">
                                        <Upload className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Upload an image to see Base64</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ToolLayout>
    );
}
