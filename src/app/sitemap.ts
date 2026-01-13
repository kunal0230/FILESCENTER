import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://filescenter.vercel.app';

    const pdfTools = ['merge', 'split', 'compress', 'to-image', 'rotate', 'watermark', 'protect', 'unlock'];
    const imageTools = ['compress', 'resize', 'crop', 'convert', 'to-pdf', 'to-base64', 'rotate', 'flip'];
    const textTools = ['word-counter', 'case-converter', 'lorem-generator', 'diff', 'remove-duplicates', 'reverse', 'sort-lines', 'markdown-preview', 'slug-generator', 'character-counter'];
    const developerTools = ['json-formatter', 'base64', 'uuid', 'hash-generator', 'url-encoder', 'regex', 'jwt-decoder', 'html-encoder', 'epoch-converter', 'css-unit-converter', 'color-picker'];
    const calculatorTools = ['percentage', 'age', 'bmi', 'tip', 'date', 'loan'];
    const converterTools = ['unit', 'color', 'currency', 'timezone', 'number-base', 'temperature'];
    const qrTools = ['generate'];
    const generatorTools = ['password'];

    const staticPages = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
        { url: `${baseUrl}/catalog`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    ];

    const createToolPages = (tools: string[], category: string, priority = 0.8) =>
        tools.map(tool => ({
            url: `${baseUrl}/${category}/${tool}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority,
        }));

    return [
        ...staticPages,
        ...createToolPages(pdfTools, 'pdf'),
        ...createToolPages(imageTools, 'image'),
        ...createToolPages(textTools, 'text'),
        ...createToolPages(developerTools, 'developer'),
        ...createToolPages(calculatorTools, 'calculator'),
        ...createToolPages(converterTools, 'converter'),
        ...createToolPages(qrTools, 'qr'),
        ...createToolPages(generatorTools, 'generator'),
    ];
}
