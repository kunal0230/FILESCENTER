'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Unlock, Download, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';
import { ProgressBar } from '@/components/ui/ProgressBar';

export default function UnlockPDFPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);
    const [needsPassword, setNeedsPassword] = useState(false);
    const [isModuleLoaded, setIsModuleLoaded] = useState(false);
    const qpdfModuleRef = useRef<any>(null);

    // Load qpdf.js manually
    useEffect(() => {
        if (window.hasOwnProperty('Module')) {
            setIsModuleLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = '/qpdf.js';
        script.async = true;
        script.onload = () => {
            console.log('qpdf.js loaded');
            // Initialize the module immediately or wait?
            // The script defines 'Module' as a function factory
            setIsModuleLoaded(true);
        };
        script.onerror = () => {
            console.error('Failed to load qpdf.js');
            setError('Failed to load decryption engine. Please refresh.');
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, []);

    const getQpdfModule = async () => {
        if (qpdfModuleRef.current) return qpdfModuleRef.current;

        if (typeof (window as any).Module !== 'function') {
            throw new Error('QPDF Module not found');
        }

        // Initialize the module
        return new Promise((resolve) => {
            const ModuleFactory = (window as any).Module;
            const instance = ModuleFactory({
                locateFile: (path: string) => {
                    if (path.endsWith('.wasm')) {
                        return '/qpdf.wasm';
                    }
                    return path;
                },
                onRuntimeInitialized: () => {
                    console.log('QPDF Runtime Initialized');
                    resolve(instance);
                },
                // Fallback for some emscripten versions that don't trigger onRuntimeInitialized if already ready
                // But usually standard way is passing object
            });
            // In some variations, the factory returns a promise.
            if (instance instanceof Promise) {
                instance.then((mod: any) => {
                    qpdfModuleRef.current = mod;
                    resolve(mod);
                });
            } else {
                // If it returns the module object directly (older emscripten or specific config)
                qpdfModuleRef.current = instance;
                // Wait for it to be ready if needed, but onRuntimeInitialized handles it
            }
        });
    };

    const handleFilesSelected = useCallback(async (newFiles: File[]) => {
        setError(null);
        setResultBlob(null);
        setNeedsPassword(false);
        setPassword('');

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
            const { PDFDocument } = await import('pdf-lib');
            const arrayBuffer = await file.arrayBuffer();

            try {
                await PDFDocument.load(arrayBuffer);
                // Not encrypted or empty password
                setFiles([file]);
                setNeedsPassword(false);
            } catch (e) {
                setFiles([file]);
                setNeedsPassword(true);
            }
        } catch (err) {
            setError('Failed to read PDF file.');
        }
    }, []);

    const handleUnlock = async () => {
        if (files.length === 0) {
            setError('Please upload a PDF file first');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            setProgress(10);

            const arrayBuffer = await files[0].arrayBuffer();
            const inputData = new Uint8Array(arrayBuffer);

            setProgress(30);

            const qpdf = await getQpdfModule();

            setProgress(50);

            // Write input file to virtual FS
            const inputFileName = `input_${Date.now()}.pdf`;
            const outputFileName = `output_${Date.now()}.pdf`;

            qpdf.FS.writeFile(inputFileName, inputData);

            setProgress(70);

            // qpdf --decrypt --password=PASS input.pdf output.pdf
            const args = ['--decrypt'];
            if (password) {
                args.push(`--password=${password}`);
            }
            args.push(inputFileName, outputFileName);

            console.log('Running qpdf with args:', args);

            // Capture stdout/stderr if possible, but callMain returns exit code
            let exitCode;
            try {
                exitCode = qpdf.callMain(args);
            } catch (e) {
                // callMain might throw on error exit in some configurations
                const msg = String(e);
                if (msg.includes('Status:')) {
                    // Extract exit code from "exit(status)" error
                    // But usually we catch explicit exit
                    console.log("Caught exit:", e);
                    // Assume failure if it threw
                    exitCode = 1;
                } else {
                    throw e;
                }
            }

            if (exitCode === 0) {
                // Success
                try {
                    const outputData = qpdf.FS.readFile(outputFileName);
                    const blob = new Blob([outputData], { type: 'application/pdf' });
                    setResultBlob(blob);
                    setProgress(100);
                } catch (e) {
                    throw new Error('Failed to read output PDF. Decryption might have failed silently.');
                }

                // Cleanup
                try {
                    qpdf.FS.unlink(inputFileName);
                    qpdf.FS.unlink(outputFileName);
                } catch (e) { }
            } else {
                throw new Error(`Decryption failed (Exit code: ${exitCode}). Password might be incorrect.`);
            }

        } catch (err) {
            console.error('Unlock error:', err);
            let msg = err instanceof Error ? err.message : 'Unknown error';
            if (msg.includes('Exit code: 2') || msg.includes('Exit code: 3')) { // 3 is password error usually
                msg = 'Incorrect password. Please try again.';
            }
            setError(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadResult = () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = files[0].name.replace('.pdf', '_unlocked.pdf');
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
        setResultBlob(null);
        setError(null);
        setPassword('');
        setNeedsPassword(false);
    };

    return (
        <ToolLayout
            title="Unlock PDF"
            description="Remove password protection from PDF files"
            icon={<Unlock className="w-6 h-6 text-white" />}
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

            {/* Password & Unlock Action */}
            {files.length > 0 && !resultBlob && (
                <div className="mt-6 space-y-6">
                    {needsPassword && (
                        <div>
                            <label className="text-sm font-medium mb-2 block">PDF Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter the PDF password"
                                    className="w-full px-4 py-3 pr-12 rounded-lg bg-white/5 border border-white/10 focus:border-indigo-500 focus:outline-none"
                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {!needsPassword && (
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                            <p className="text-green-400 text-sm flex items-center gap-2">
                                <Unlock className="w-4 h-4" />
                                This PDF is not password protected. You can process it to ensure it's fully decrypted.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleUnlock}
                        disabled={isProcessing || !isModuleLoaded || (needsPassword && !password)}
                        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Unlocking... ({Math.round(progress)}%)
                            </>
                        ) : !isModuleLoaded ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Loading Engine...
                            </>
                        ) : (
                            <>
                                <Unlock className="w-5 h-5" />
                                {needsPassword ? 'Unlock PDF' : 'Remove Restrictions'}
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Progress */}
            {isProcessing && (
                <div className="mt-6">
                    <ProgressBar progress={progress} label="Decrypting..." />
                </div>
            )}

            {/* Result */}
            {resultBlob && (
                <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <p className="text-green-400 font-semibold">PDF Unlocked Successfully!</p>
                                <p className="text-sm text-gray-400">{formatSize(resultBlob.size)}</p>
                            </div>
                            <button onClick={downloadResult} className="btn-primary flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download Unlocked PDF
                            </button>
                        </div>
                    </div>

                    <button onClick={resetAll} className="btn-secondary w-full">
                        Unlock Another PDF
                    </button>
                </div>
            )}
        </ToolLayout>
    );
}
