'use client';

import { useState, useCallback, useMemo } from 'react';
import { Key, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

interface PasswordOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    excludeAmbiguous: boolean;
    excludeSimilar: boolean;
}

export default function PasswordGeneratorPage() {
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [options, setOptions] = useState<PasswordOptions>({
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeAmbiguous: false,
        excludeSimilar: false,
    });
    const [history, setHistory] = useState<string[]>([]);

    const charSets = useMemo(() => {
        let uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let lowercase = 'abcdefghijklmnopqrstuvwxyz';
        let numbers = '0123456789';
        let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        if (options.excludeAmbiguous) {
            uppercase = uppercase.replace(/[O]/g, '');
            lowercase = lowercase.replace(/[l]/g, '');
            numbers = numbers.replace(/[01]/g, '');
        }

        if (options.excludeSimilar) {
            uppercase = uppercase.replace(/[ILO]/g, '');
            lowercase = lowercase.replace(/[ilo]/g, '');
            numbers = numbers.replace(/[015]/g, '');
        }

        return { uppercase, lowercase, numbers, symbols };
    }, [options.excludeAmbiguous, options.excludeSimilar]);

    const generatePassword = useCallback(() => {
        setError(null);

        // Validate at least one character type is selected
        if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
            setError('Please select at least one character type');
            return;
        }

        // Build character pool
        let chars = '';
        const required: string[] = [];

        if (options.uppercase) {
            chars += charSets.uppercase;
            required.push(charSets.uppercase[Math.floor(Math.random() * charSets.uppercase.length)]);
        }
        if (options.lowercase) {
            chars += charSets.lowercase;
            required.push(charSets.lowercase[Math.floor(Math.random() * charSets.lowercase.length)]);
        }
        if (options.numbers) {
            chars += charSets.numbers;
            required.push(charSets.numbers[Math.floor(Math.random() * charSets.numbers.length)]);
        }
        if (options.symbols) {
            chars += charSets.symbols;
            required.push(charSets.symbols[Math.floor(Math.random() * charSets.symbols.length)]);
        }

        if (chars.length === 0) {
            setError('No characters available with current options');
            return;
        }

        // Generate password using crypto API for better randomness
        const array = new Uint32Array(options.length);
        crypto.getRandomValues(array);

        let newPassword = '';
        for (let i = 0; i < options.length; i++) {
            newPassword += chars[array[i] % chars.length];
        }

        // Ensure at least one of each required character type
        const passwordArray = newPassword.split('');
        required.forEach((char, index) => {
            if (index < passwordArray.length) {
                const randomPos = Math.floor(Math.random() * passwordArray.length);
                passwordArray[randomPos] = char;
            }
        });

        // Shuffle to distribute required characters
        for (let i = passwordArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
        }

        const finalPassword = passwordArray.join('');
        setPassword(finalPassword);
        setHistory(prev => [finalPassword, ...prev.slice(0, 9)]);
    }, [options, charSets]);

    const copyPassword = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setError('Failed to copy password');
        }
    }, []);

    const passwordStrength = useMemo(() => {
        if (!password) return { score: 0, label: '', color: '' };

        let score = 0;

        // Length scoring
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (password.length >= 16) score += 1;
        if (password.length >= 20) score += 1;

        // Character variety
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) score += 1;

        if (score <= 2) return { score, label: 'Weak', color: 'text-red-400 bg-red-500' };
        if (score <= 4) return { score, label: 'Fair', color: 'text-yellow-400 bg-yellow-500' };
        if (score <= 6) return { score, label: 'Good', color: 'text-blue-400 bg-blue-500' };
        return { score, label: 'Strong', color: 'text-green-400 bg-green-500' };
    }, [password]);

    const updateOption = useCallback(<K extends keyof PasswordOptions>(key: K, value: PasswordOptions[K]) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    }, []);

    return (
        <ToolLayout
            title="Password Generator"
            description="Generate secure, random passwords"
            icon={<Key className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* Generated Password */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={password}
                        readOnly
                        placeholder="Click generate to create a password"
                        className="w-full px-4 py-4 pr-24 rounded-xl bg-white border border-gray-200 font-mono text-lg text-center tracking-wider text-gray-900 shadow-sm"
                    />
                    {password && (
                        <button
                            onClick={() => copyPassword(password)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    )}
                </div>

                {/* Strength indicator */}
                {password && (
                    <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${passwordStrength.color.split(' ')[1]} transition-all`}
                                style={{ width: `${(passwordStrength.score / 8) * 100}%` }}
                            />
                        </div>
                        <span className={`text-sm font-medium ${passwordStrength.color.split(' ')[0]}`}>
                            {passwordStrength.label}
                        </span>
                    </div>
                )}
            </div>

            {/* Generate Button */}
            <button onClick={generatePassword} className="btn-primary w-full flex items-center justify-center gap-2 mb-6">
                <RefreshCw className="w-5 h-5" />
                Generate Password
            </button>

            {/* Options */}
            <div className="space-y-4">
                {/* Length Slider */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-700">Length: {options.length}</label>
                        <span className="text-xs text-gray-500">4-128 characters</span>
                    </div>
                    <input
                        type="range"
                        min="4"
                        max="128"
                        value={options.length}
                        onChange={(e) => updateOption('length', Number(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Character Types */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { key: 'uppercase' as const, label: 'Uppercase (A-Z)' },
                        { key: 'lowercase' as const, label: 'Lowercase (a-z)' },
                        { key: 'numbers' as const, label: 'Numbers (0-9)' },
                        { key: 'symbols' as const, label: 'Symbols (!@#$...)' },
                    ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                            <input
                                type="checkbox"
                                checked={options[key]}
                                onChange={(e) => updateOption(key, e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                        </label>
                    ))}
                </div>

                {/* Advanced Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                        <input
                            type="checkbox"
                            checked={options.excludeAmbiguous}
                            onChange={(e) => updateOption('excludeAmbiguous', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Exclude ambiguous (0, O, l)</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                        <input
                            type="checkbox"
                            checked={options.excludeSimilar}
                            onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Exclude similar (i, l, 1, L, o, 0, O)</span>
                    </label>
                </div>
            </div>

            {/* History */}
            {history.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-sm font-medium mb-3 text-gray-500">Recent Passwords</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {history.map((pw, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                                <span className="font-mono flex-1 truncate text-gray-700">{pw}</span>
                                <button
                                    onClick={() => copyPassword(pw)}
                                    className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </ToolLayout>
    );
}
