'use client';

import { useState, useCallback } from 'react';
import { FileText, Copy, Check, RefreshCw } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

type LoremType = 'paragraphs' | 'sentences' | 'words';

const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
    'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
    'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
    'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
    'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
    'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi',
    'nesciunt', 'neque', 'porro', 'quisquam', 'nihil', 'molestiae', 'illum',
];

export default function LoremGeneratorPage() {
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [count, setCount] = useState(3);
    const [type, setType] = useState<LoremType>('paragraphs');
    const [startWithLorem, setStartWithLorem] = useState(true);

    const getRandomWord = useCallback(() => {
        return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
    }, []);

    const generateSentence = useCallback((isFirst: boolean, startWithLoremIpsum: boolean) => {
        const sentenceLength = Math.floor(Math.random() * 10) + 5; // 5-15 words
        const words: string[] = [];

        if (isFirst && startWithLoremIpsum) {
            words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
        }

        while (words.length < sentenceLength) {
            words.push(getRandomWord());
        }

        // Capitalize first word
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

        // Add random comma
        if (words.length > 6 && Math.random() > 0.5) {
            const commaPos = Math.floor(words.length / 2);
            words[commaPos] = words[commaPos] + ',';
        }

        return words.join(' ') + '.';
    }, [getRandomWord]);

    const generateParagraph = useCallback((isFirst: boolean, startWithLoremIpsum: boolean) => {
        const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-7 sentences
        const sentences: string[] = [];

        for (let i = 0; i < sentenceCount; i++) {
            sentences.push(generateSentence(i === 0 && isFirst, i === 0 && isFirst && startWithLoremIpsum));
        }

        return sentences.join(' ');
    }, [generateSentence]);

    const generateWords = useCallback((wordCount: number, startWithLoremIpsum: boolean) => {
        const words: string[] = [];

        if (startWithLoremIpsum) {
            words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
        }

        while (words.length < wordCount) {
            words.push(getRandomWord());
        }

        return words.slice(0, wordCount).join(' ');
    }, [getRandomWord]);

    const generate = useCallback(() => {
        let result = '';

        switch (type) {
            case 'paragraphs':
                const paragraphs: string[] = [];
                for (let i = 0; i < count; i++) {
                    paragraphs.push(generateParagraph(i === 0, startWithLorem));
                }
                result = paragraphs.join('\n\n');
                break;

            case 'sentences':
                const sentences: string[] = [];
                for (let i = 0; i < count; i++) {
                    sentences.push(generateSentence(i === 0, startWithLorem));
                }
                result = sentences.join(' ');
                break;

            case 'words':
                result = generateWords(count, startWithLorem);
                break;
        }

        setOutput(result);
    }, [count, type, startWithLorem, generateParagraph, generateSentence, generateWords]);

    const copyOutput = useCallback(async () => {
        if (!output) return;

        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
        }
    }, [output]);

    const wordCount = output.split(/\s+/).filter(w => w).length;
    const charCount = output.length;

    return (
        <ToolLayout
            title="Lorem Ipsum Generator"
            description="Generate placeholder text for designs and mockups"
            icon={<FileText className="w-6 h-6 text-white" />}
            category="image"
        >
            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Type */}
                <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700">Generate</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as LoremType)}
                        className="w-full px-4 py-2.5 rounded-lg bg-white border border-gray-200 focus:border-indigo-500 focus:outline-none text-gray-900"
                    >
                        <option value="paragraphs">Paragraphs</option>
                        <option value="sentences">Sentences</option>
                        <option value="words">Words</option>
                    </select>
                </div>

                {/* Count */}
                <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700">Count: {count}</label>
                    <input
                        type="range"
                        min="1"
                        max={type === 'words' ? 500 : type === 'sentences' ? 50 : 20}
                        value={count}
                        onChange={(e) => setCount(Number(e.target.value))}
                        className="w-full mt-2"
                    />
                </div>

                {/* Start with Lorem */}
                <div className="flex items-end">
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-gray-50 w-full shadow-sm">
                        <input
                            type="checkbox"
                            checked={startWithLorem}
                            onChange={(e) => setStartWithLorem(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Start with "Lorem ipsum"</span>
                    </label>
                </div>
            </div>

            {/* Generate Button */}
            <button onClick={generate} className="btn-primary w-full flex items-center justify-center gap-2 mb-6">
                <RefreshCw className="w-5 h-5" />
                Generate {count} {type}
            </button>

            {/* Output */}
            {output && (
                <>
                    <div className="relative">
                        <textarea
                            value={output}
                            readOnly
                            className="w-full h-64 p-4 rounded-xl bg-white border border-gray-200 resize-none text-sm text-gray-900 shadow-sm"
                        />
                    </div>

                    {/* Stats and Copy */}
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {wordCount.toLocaleString()} words • {charCount.toLocaleString()} characters
                        </p>
                        <button onClick={copyOutput} className="btn-secondary flex items-center gap-2">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'Copied!' : 'Copy Text'}
                        </button>
                    </div>
                </>
            )}
        </ToolLayout>
    );
}
