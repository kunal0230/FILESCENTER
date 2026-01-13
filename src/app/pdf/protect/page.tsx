'use client';

import { useState, useCallback } from 'react';
import { Shield, Download, Loader2, AlertCircle, Eye, EyeOff, Lock, Check, X, CheckCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { FileUploader } from '@/components/ui/FileUploader';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PDFDocument } from 'pdf-lib';

interface PasswordRequirement {
    label: string;
    check: (password: string) => boolean;
}

export default function ProtectPDFPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [pageCount, setPageCount] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resultBlob, setResultBlob] = useState<Blob | null>(null);

    const passwordRequirements: PasswordRequirement[] = [
        { label: 'At least 4 characters', check: (p) => p.length >= 4 },
        { label: 'At least 8 characters (recommended)', check: (p) => p.length >= 8 },
    ];

    const handleFilesSelected = useCallback(async (newFiles: File[]) => {
        setError(null);
        setResultBlob(null);

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
        } catch (err) {
            setError('Failed to read PDF. The file may be corrupted or already encrypted.');
        }
    }, []);

    const handleProtect = async () => {
        if (files.length === 0) {
            setError('Please upload a PDF file first');
            return;
        }

        if (!password) {
            setError('Please enter a password');
            return;
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setError(null);

        try {
            setProgress(10);

            // Get the PDF bytes
            const arrayBuffer = await files[0].arrayBuffer();
            const pdfBytes = new Uint8Array(arrayBuffer);

            setProgress(30);

            // Dynamic import the encryption library
            const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt-lite');

            setProgress(50);

            // Encrypt the PDF with user password (same for owner password for simplicity)
            const encryptedBytes = await encryptPDF(
                pdfBytes,
                password,        // user password (required to open)
                password + '_owner'  // owner password (for full permissions)
            );

            setProgress(90);

            setResultBlob(new Blob([encryptedBytes as BlobPart], { type: 'application/pdf' }));
            setProgress(100);
        } catch (err) {
            console.error('Encryption error:', err);
            setError(err instanceof Error ? err.message : 'Failed to protect PDF. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadResult = () => {
        if (!resultBlob) return;
        const url = URL.createObjectURL(resultBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = files[0].name.replace('.pdf', '_protected.pdf');
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
        setError(null);
        setPassword('');
        setConfirmPassword('');
    };

    const getPasswordStrength = () => {
        if (!password) return { score: 0, label: '', color: '' };
        let score = 0;
        if (password.length >= 4) score++;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 1) return { score: 17, label: 'Weak', color: 'bg-red-500' };
        if (score <= 2) return { score: 33, label: 'Fair', color: 'bg-orange-500' };
        if (score <= 3) return { score: 50, label: 'Good', color: 'bg-yellow-500' };
        if (score <= 4) return { score: 67, label: 'Strong', color: 'bg-blue-500' };
        if (score <= 5) return { score: 83, label: 'Very Strong', color: 'bg-green-500' };
        return { score: 100, label: 'Excellent', color: 'bg-green-600' };
    };

    const strength = getPasswordStrength();
    const canProtect = password.length >= 4 && password === confirmPassword;

    return (
        <ToolLayout
            title="Protect PDF"
            description="Add password protection to your PDF files"
            icon={<Shield className="w-6 h-6 text-white" />}
            category="pdf"
        >
            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
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
                <p className="mt-2 text-sm text-indigo-500 text-center font-medium">
                    PDF has {pageCount} page{pageCount !== 1 ? 's' : ''}
                </p>
            )}

            {/* Password Options */}
            {files.length > 0 && !resultBlob && (
                <div className="mt-6 space-y-6 max-w-lg mx-auto">
                    {/* Security Notice */}
                    <div className="p-4 rounded-xl bg-green-50 border border-green-200 shadow-sm">
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-green-700 font-medium">Real PDF Encryption</p>
                                <p className="text-sm text-green-600/80 mt-1">
                                    Your PDF will be encrypted with <strong>RC4 128-bit encryption</strong>.
                                    The protected file will require this password to open in any PDF reader.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full px-4 py-3 pr-12 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none text-lg text-gray-900 placeholder:text-gray-400 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Password Strength Bar */}
                            {password && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">Password Strength</span>
                                        <span className={`text-xs font-medium ${strength.score >= 50 ? 'text-green-600' : 'text-orange-500'
                                            }`}>
                                            {strength.label}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${strength.color} transition-all duration-300`}
                                            style={{ width: `${strength.score}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Password Requirements */}
                            {password && (
                                <div className="mt-3 space-y-1">
                                    {passwordRequirements.map((req, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center gap-2 text-xs ${req.check(password) ? 'text-green-600' : 'text-gray-400'
                                                }`}
                                        >
                                            {req.check(password) ? (
                                                <Check className="w-3 h-3" />
                                            ) : (
                                                <X className="w-3 h-3" />
                                            )}
                                            {req.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                className={`w-full px-4 py-3 rounded-lg bg-gray-50 border focus:outline-none focus:ring-2 text-lg text-gray-900 placeholder:text-gray-400 transition-all ${confirmPassword && password !== confirmPassword
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                    : confirmPassword && password === confirmPassword
                                        ? 'border-green-300 focus:border-green-500 focus:ring-green-100'
                                        : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                                    }`}
                            />
                            {confirmPassword && (
                                <div className={`flex items-center gap-2 mt-2 text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-500'
                                    }`}>
                                    {password === confirmPassword ? (
                                        <>
                                            <Check className="w-3 h-3" />
                                            Passwords match
                                        </>
                                    ) : (
                                        <>
                                            <X className="w-3 h-3" />
                                            Passwords don't match
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Protect Button */}
                    <button
                        onClick={handleProtect}
                        disabled={isProcessing || !canProtect}
                        className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg transition-all"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Encrypting... ({Math.round(progress)}%)
                            </>
                        ) : (
                            <>
                                <Shield className="w-5 h-5" />
                                Protect PDF with Password
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Progress */}
            {isProcessing && (
                <div className="mt-8 max-w-md mx-auto">
                    <ProgressBar progress={progress} label="Encrypting PDF with RC4 128-bit..." />
                </div>
            )}

            {/* Result */}
            {resultBlob && (
                <div className="mt-8 space-y-4 max-w-lg mx-auto">
                    <div className="p-6 rounded-xl bg-green-50 border border-green-200 shadow-sm">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">PDF Encrypted Successfully!</h3>
                            <p className="text-gray-500 mt-2">
                                {formatSize(resultBlob.size)} • Password: <span className="font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-700 font-medium ml-1">{password}</span>
                            </p>
                        </div>

                        <button onClick={downloadResult} className="w-full py-3 rounded-xl font-bold bg-green-600 text-white shadow-lg shadow-green-500/25 hover:bg-green-700 flex items-center justify-center gap-2 transition-all">
                            <Download className="w-5 h-5" />
                            Download Protected PDF
                        </button>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <p className="text-amber-800 text-sm flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                            <span>
                                <strong className="text-amber-900">Remember your password!</strong> There is no way to recover a forgotten password.
                                The PDF will require this password to open in any PDF reader.
                            </span>
                        </p>
                    </div>

                    <button onClick={resetAll} className="w-full py-3 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                        Protect Another PDF
                    </button>
                </div>
            )}
        </ToolLayout>
    );
}
