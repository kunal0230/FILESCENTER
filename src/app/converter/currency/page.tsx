'use client';

import { useState, useEffect } from 'react';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

// Common currency rates (approximate, for demo - normally would use an API)
const basRates: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CNY: 7.24,
    INR: 83.12,
    AUD: 1.53,
    CAD: 1.36,
    CHF: 0.88,
    KRW: 1320.50,
    SGD: 1.34,
    HKD: 7.82,
    MXN: 17.15,
    BRL: 4.97,
    AED: 3.67,
};

const currencyInfo: Record<string, { name: string; symbol: string }> = {
    USD: { name: 'US Dollar', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    GBP: { name: 'British Pound', symbol: '£' },
    JPY: { name: 'Japanese Yen', symbol: '¥' },
    CNY: { name: 'Chinese Yuan', symbol: '¥' },
    INR: { name: 'Indian Rupee', symbol: '₹' },
    AUD: { name: 'Australian Dollar', symbol: 'A$' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$' },
    CHF: { name: 'Swiss Franc', symbol: 'Fr' },
    KRW: { name: 'South Korean Won', symbol: '₩' },
    SGD: { name: 'Singapore Dollar', symbol: 'S$' },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
    MXN: { name: 'Mexican Peso', symbol: '$' },
    BRL: { name: 'Brazilian Real', symbol: 'R$' },
    AED: { name: 'UAE Dirham', symbol: 'د.إ' },
};

export default function CurrencyConverterPage() {
    const [amount, setAmount] = useState<string>('100');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('EUR');
    const [result, setResult] = useState<number>(0);

    useEffect(() => {
        const amountNum = parseFloat(amount) || 0;
        const fromRate = basRates[fromCurrency];
        const toRate = basRates[toCurrency];

        // Convert to USD first, then to target currency
        const usdAmount = amountNum / fromRate;
        const converted = usdAmount * toRate;

        setResult(converted);
    }, [amount, fromCurrency, toCurrency]);

    const swapCurrencies = () => {
        const temp = fromCurrency;
        setFromCurrency(toCurrency);
        setToCurrency(temp);
    };

    const formatCurrency = (value: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const currencies = Object.keys(currencyInfo);

    return (
        <ToolLayout
            title="Currency Converter"
            description="Convert between world currencies"
            icon={<ArrowRightLeft className="w-6 h-6 text-white" />}
            category="converter"
        >
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-5">
                    {/* Amount Input */}
                    <div>
                        <label className="text-sm text-gray-400 block mb-2">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="100"
                            className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-indigo-500 text-white outline-none text-xl"
                        />
                    </div>

                    {/* Currency Selectors */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <label className="text-sm text-gray-400 block mb-2">From</label>
                            <select
                                value={fromCurrency}
                                onChange={(e) => setFromCurrency(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                            >
                                {currencies.map((code) => (
                                    <option key={code} value={code}>
                                        {code} - {currencyInfo[code].name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={swapCurrencies}
                            className="mt-6 p-3 rounded-lg bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-colors"
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                        </button>

                        <div className="flex-1">
                            <label className="text-sm text-gray-400 block mb-2">To</label>
                            <select
                                value={toCurrency}
                                onChange={(e) => setToCurrency(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none"
                            >
                                {currencies.map((code) => (
                                    <option key={code} value={code}>
                                        {code} - {currencyInfo[code].name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Result */}
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-6 rounded-xl border border-indigo-500/30">
                    <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">
                            {currencyInfo[fromCurrency].symbol}{parseFloat(amount) || 0} {fromCurrency} =
                        </p>
                        <p className="text-3xl font-bold text-white mb-1">
                            {formatCurrency(result, toCurrency)}
                        </p>
                        <p className="text-sm text-indigo-400">
                            {currencyInfo[toCurrency].name}
                        </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 text-center">
                        <p className="text-xs text-gray-500">
                            1 {fromCurrency} = {(basRates[toCurrency] / basRates[fromCurrency]).toFixed(4)} {toCurrency}
                        </p>
                    </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                    <RefreshCw className="w-3 h-3 inline mr-1" />
                    Exchange rates are approximate and for reference only
                </p>
            </div>
        </ToolLayout>
    );
}
