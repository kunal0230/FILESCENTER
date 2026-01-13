'use client';

import { useState } from 'react';
import { Key, AlertTriangle, Check, Copy } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

interface JWTPayload {
    [key: string]: unknown;
    iat?: number;
    exp?: number;
    nbf?: number;
}

export default function JWTDecoderPage() {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState<object | null>(null);
    const [payload, setPayload] = useState<JWTPayload | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<'header' | 'payload' | null>(null);

    const decodeJWT = (jwt: string) => {
        try {
            const parts = jwt.trim().split('.');
            if (parts.length !== 3) {
                setError('Invalid JWT format (should have 3 parts)');
                setHeader(null);
                setPayload(null);
                return;
            }

            const decodeBase64 = (str: string) => {
                const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
                return JSON.parse(atob(base64));
            };

            setHeader(decodeBase64(parts[0]));
            setPayload(decodeBase64(parts[1]));
            setError(null);
        } catch (e) {
            setError('Failed to decode JWT');
            setHeader(null);
            setPayload(null);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const isExpired = payload?.exp ? Date.now() / 1000 > payload.exp : false;

    const copyJson = async (type: 'header' | 'payload') => {
        const data = type === 'header' ? header : payload;
        await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <ToolLayout
            title="JWT Decoder"
            description="Decode and inspect JSON Web Tokens"
            icon={<Key className="w-6 h-6 text-white" />}
            category="developer"
        >
            <div className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-500">JWT Token</h3>
                    </div>
                    <textarea
                        value={token}
                        onChange={(e) => { setToken(e.target.value); decodeJWT(e.target.value); }}
                        placeholder="Paste your JWT token here..."
                        className="w-full h-24 p-4 bg-white text-gray-900 outline-none resize-none font-mono text-sm"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400">{error}</span>
                    </div>
                )}

                {payload && isExpired && (
                    <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400">This token has expired</span>
                    </div>
                )}

                {(header || payload) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {header && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between">
                                    <h3 className="text-sm font-medium text-gray-500">Header</h3>
                                    <button onClick={() => copyJson('header')} className="p-1 rounded hover:bg-gray-200 transition-colors">
                                        {copied === 'header' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                    </button>
                                </div>
                                <pre className="p-4 text-sm font-mono text-indigo-600 overflow-auto max-h-48">
                                    {JSON.stringify(header, null, 2)}
                                </pre>
                            </div>
                        )}

                        {payload && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between">
                                    <h3 className="text-sm font-medium text-gray-500">Payload</h3>
                                    <button onClick={() => copyJson('payload')} className="p-1 rounded hover:bg-gray-200 transition-colors">
                                        {copied === 'payload' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
                                    </button>
                                </div>
                                <pre className="p-4 text-sm font-mono text-green-600 overflow-auto max-h-48">
                                    {JSON.stringify(payload, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                )}

                {payload && (payload.iat || payload.exp || payload.nbf) && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Token Dates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            {payload.iat && <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Issued:</span> <span className="text-gray-900">{formatDate(payload.iat)}</span></div>}
                            {payload.exp && <div className={`p-3 rounded-lg ${isExpired ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}><span className="text-gray-500">Expires:</span> <span className={isExpired ? 'text-red-500' : 'text-gray-900'}>{formatDate(payload.exp)}</span></div>}
                            {payload.nbf && <div className="p-3 bg-gray-50 rounded-lg"><span className="text-gray-500">Not Before:</span> <span className="text-gray-900">{formatDate(payload.nbf)}</span></div>}
                        </div>
                    </div>
                )}
            </div>
        </ToolLayout>
    );
}
