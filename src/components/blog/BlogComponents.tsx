"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Share2, Twitter, Facebook, Link as LinkIcon } from "lucide-react";

// 1. Scroll Progress Bar
export function ScrollProgress() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const currentProgress = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight) {
                setProgress(Number((currentProgress / scrollHeight).toFixed(2)) * 100);
            }
        };

        window.addEventListener("scroll", updateProgress);
        return () => window.removeEventListener("scroll", updateProgress);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none">
            <div
                className="h-full bg-primary transition-all duration-150 ease-out shadow-[0_0_10px_rgba(46,125,82,0.5)]"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

// 2. Table of Contents
export function TableOfContents({ content }: { content: string }) {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

    useEffect(() => {
        const headingRegex = /^(#{1,3})\s+(.*)$/gm;
        const matches = Array.from(content.matchAll(headingRegex));
        const extractedHeadings = matches.map(match => ({
            id: match[2].toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
            text: match[2],
            level: match[1].length
        }));
        setHeadings(extractedHeadings);
    }, [content]);

    if (headings.length === 0) return null;

    return (
        <nav className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Table of Contents</h4>
            <ul className="space-y-4">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        style={{ marginLeft: `${(heading.level - 1) * 1}rem` }}
                    >
                        <a
                            href={`#${heading.id}`}
                            className="text-sm font-medium text-gray-500 hover:text-primary transition-colors block"
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

// 3. Newsletter Box
export function NewsletterBox() {
    return (
        <div className="bg-gray-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                        <Mail className="w-6 h-6 text-primary-light" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Master Your Workflow</h3>
                    <p className="text-gray-400 text-lg">
                        Get expert PDF and image optimization tips delivered straight to your inbox. No spam, only high-value content.
                    </p>
                </div>

                <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-500"
                    />
                    <button className="btn-primary whitespace-nowrap group">
                        Join Newsletter
                        <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
}

// 4. Share Bar
export function ShareBar({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">Share</span>
            <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-100 transition-all">
                <Twitter className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-700 hover:border-blue-100 transition-all">
                <Facebook className="w-5 h-5" />
            </button>
            <button
                onClick={handleCopy}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${copied ? 'bg-green-50 border-green-100 text-green-500' : 'border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20'}`}
            >
                {copied ? <ArrowRight className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
            </button>
        </div>
    );
}
