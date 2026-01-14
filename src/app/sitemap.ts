import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/blog';

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
        { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    ];

    const createToolPages = (tools: string[], category: string, priority = 0.8) =>
        tools.map(tool => ({
            url: `${baseUrl}/${category}/${tool}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority,
        }));

    // Generate blog post URLs
    const blogPosts = getAllPosts().map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
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
        ...blogPosts,
    ];
}
