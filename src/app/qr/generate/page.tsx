'use client';

import { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Copy, Check, Link, Mail, Wifi, User, MessageSquare } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import QRCode from 'qrcode';

type QRType = 'url' | 'text' | 'wifi' | 'email' | 'vcard';

export default function QRGeneratorPage() {
    const [qrType, setQrType] = useState<QRType>('url');
    const [content, setContent] = useState('https://');
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [size, setSize] = useState(256);
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');

    // WiFi fields
    const [wifiName, setWifiName] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');

    // Email fields
    const [emailTo, setEmailTo] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    // vCard fields
    const [vcardName, setVcardName] = useState('');
    const [vcardPhone, setVcardPhone] = useState('');
    const [vcardEmail, setVcardEmail] = useState('');

    const generateQRContent = (): string => {
        switch (qrType) {
            case 'wifi':
                return `WIFI:T:${wifiEncryption};S:${wifiName};P:${wifiPassword};;`;
            case 'email':
                return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
            case 'vcard':
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nEND:VCARD`;
            default:
                return content;
        }
    };

    useEffect(() => {
        const qrContent = generateQRContent();
        if (!qrContent || qrContent.length < 2) {
            setQrDataUrl('');
            return;
        }

        QRCode.toDataURL(qrContent, {
            width: size,
            margin: 2,
            color: { dark: fgColor, light: bgColor }
        }).then(setQrDataUrl).catch(console.error);
    }, [content, qrType, size, fgColor, bgColor, wifiName, wifiPassword, wifiEncryption, emailTo, emailSubject, emailBody, vcardName, vcardPhone, vcardEmail]);

    const downloadQR = (format: 'png' | 'svg') => {
        if (!qrDataUrl) return;

        const a = document.createElement('a');
        a.href = qrDataUrl;
        a.download = `qrcode.${format}`;
        a.click();
    };

    const copyToClipboard = async () => {
        if (!qrDataUrl) return;
        try {
            const blob = await (await fetch(qrDataUrl)).blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const qrTypes = [
        { id: 'url', label: 'URL', icon: Link },
        { id: 'text', label: 'Text', icon: MessageSquare },
        { id: 'wifi', label: 'WiFi', icon: Wifi },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'vcard', label: 'Contact', icon: User },
    ];

    return (
        <ToolLayout
            title="QR Code Generator"
            description="Create QR codes for URLs, WiFi, contacts, and more"
            icon={<QrCode className="w-6 h-6 text-white" />}
            category="qr"
        >
            <div className="flex flex-col lg:flex-row gap-6">
                {/* LEFT: Controls */}
                <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-5">

                    {/* QR Type Selection */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">QR Type</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {qrTypes.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setQrType(id as QRType)}
                                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${qrType === id
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-[10px]">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Input */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Content</h3>

                        {qrType === 'url' && (
                            <input
                                type="url"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 outline-none"
                            />
                        )}

                        {qrType === 'text' && (
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Enter text..."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 outline-none resize-none"
                            />
                        )}

                        {qrType === 'wifi' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={wifiName}
                                    onChange={(e) => setWifiName(e.target.value)}
                                    placeholder="Network name (SSID)"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900 outline-none text-sm"
                                />
                                <input
                                    type="password"
                                    value={wifiPassword}
                                    onChange={(e) => setWifiPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900 outline-none text-sm"
                                />
                                <select
                                    value={wifiEncryption}
                                    onChange={(e) => setWifiEncryption(e.target.value as any)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 outline-none text-sm"
                                >
                                    <option value="WPA">WPA/WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">No Password</option>
                                </select>
                            </div>
                        )}

                        {qrType === 'email' && (
                            <div className="space-y-3">
                                <input
                                    type="email"
                                    value={emailTo}
                                    onChange={(e) => setEmailTo(e.target.value)}
                                    placeholder="Email address"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900 outline-none text-sm"
                                />
                                <input
                                    type="text"
                                    value={emailSubject}
                                    onChange={(e) => setEmailSubject(e.target.value)}
                                    placeholder="Subject"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900 outline-none text-sm"
                                />
                                <textarea
                                    value={emailBody}
                                    onChange={(e) => setEmailBody(e.target.value)}
                                    placeholder="Message body"
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900 outline-none text-sm resize-none"
                                />
                            </div>
                        )}

                        {qrType === 'vcard' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={vcardName}
                                    onChange={(e) => setVcardName(e.target.value)}
                                    placeholder="Full name"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900 outline-none text-sm"
                                />
                                <input
                                    type="tel"
                                    value={vcardPhone}
                                    onChange={(e) => setVcardPhone(e.target.value)}
                                    placeholder="Phone number"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900 outline-none text-sm"
                                />
                                <input
                                    type="email"
                                    value={vcardEmail}
                                    onChange={(e) => setVcardEmail(e.target.value)}
                                    placeholder="Email address"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900 outline-none text-sm"
                                />
                            </div>
                        )}
                    </div>

                    {/* Style Options */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Style</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Size</label>
                                <select
                                    value={size}
                                    onChange={(e) => setSize(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 outline-none text-sm"
                                >
                                    <option value={128}>128px</option>
                                    <option value={256}>256px</option>
                                    <option value={512}>512px</option>
                                    <option value={1024}>1024px</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Foreground</label>
                                <input
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="w-full h-9 rounded-lg border border-gray-200 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => downloadQR('png')}
                            disabled={!qrDataUrl}
                            className="flex-1 py-3 rounded-xl font-medium bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download PNG
                        </button>
                        <button
                            onClick={copyToClipboard}
                            disabled={!qrDataUrl}
                            className="px-4 py-3 rounded-xl bg-white text-gray-900 hover:bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* RIGHT: QR Preview */}
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center min-h-[400px]">
                    {qrDataUrl ? (
                        <div className="text-center">
                            <div className="p-6 bg-white rounded-2xl shadow-2xl inline-block">
                                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
                            </div>
                            <p className="mt-4 text-sm text-gray-500">Scan with your phone camera</p>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            <QrCode className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-sm">Enter content to generate QR code</p>
                        </div>
                    )}
                </div>
            </div>
        </ToolLayout>
    );
}
