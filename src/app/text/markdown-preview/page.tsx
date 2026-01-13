'use client';

import { useState, useEffect } from 'react';
import { FileText, Copy, Check, Eye } from 'lucide-react';
import { ToolLayout } from '@/components/tools/ToolLayout';

export default function MarkdownPreviewPage() {
    const [markdown, setMarkdown] = useState(`# Welcome to Markdown Preview

This is a **live preview** of your markdown.

## Features
- Real-time preview
- Common markdown syntax support
- Copy HTML output

### Code Example
\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

> This is a blockquote

[Visit FilesCenter](/)
`);
    const [html, setHtml] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Simple markdown to HTML converter
        let result = markdown
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
            .replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>')
            .replace(/^\- (.*$)/gm, '<li>$1</li>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        result = '<p>' + result + '</p>';
        result = result.replace(/<p>(<h[123]>)/g, '$1').replace(/(<\/h[123]>)<\/p>/g, '$1');
        result = result.replace(/<p>(<pre>)/g, '$1').replace(/(<\/pre>)<\/p>/g, '$1');
        result = result.replace(/<p>(<li>)/g, '<ul>$1').replace(/(<\/li>)<\/p>/g, '$1</ul>');

        setHtml(result);
    }, [markdown]);

    const copyHtml = async () => {
        await navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <ToolLayout
            title="Markdown Preview"
            description="Live preview markdown with HTML output"
            icon={<FileText className="w-6 h-6 text-white" />}
            category="text"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-700">Markdown</h3>
                    </div>
                    <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        className="flex-1 p-4 bg-transparent text-gray-900 outline-none resize-none font-mono text-sm"
                        placeholder="Type your markdown here..."
                    />
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                    <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Preview
                        </h3>
                        <button onClick={copyHtml} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 text-xs flex items-center gap-1">
                            {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                            Copy HTML
                        </button>
                    </div>
                    <div
                        className="flex-1 p-4 overflow-auto prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: html }}
                        style={{
                            lineHeight: 1.6,
                        }}
                    />
                </div>
            </div>
        </ToolLayout>
    );
}
