"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogPost } from "@/lib/blog";

export function RelatedArticles({ currentSlug, posts }: { currentSlug: string, posts: BlogPost[] }) {
    // Simple "Get next 3 posts" logic (cycling)
    const currentIndex = posts.findIndex(p => p.slug === currentSlug);
    const relatedPosts = [];

    for (let i = 1; i <= 3; i++) {
        relatedPosts.push(posts[(currentIndex + i) % posts.length]);
    }

    // Abstract image mapping fallback (simple logic)
    const getImage = (slug: string) => {
        // Logic duplicated from main page for now
        if (slug.includes('pdf')) return '/images/blog/blog_hero_pdf_privacy.png';
        if (slug.includes('image')) return '/images/blog/blog_hero_image_algorithms.png';
        return '/images/blog/blog_hero_abstract_1.png';
    }

    return (
        <div className="py-12 border-t border-[var(--border-light)] mt-12">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-[var(--text-heading)]">Continue Reading</h3>
                <Link href="/blog" className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest hover:underline">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(post => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-[var(--border-light)] shadow-sm">
                            <img
                                src={post.image || getImage(post.slug)}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">{post.tags?.[0] || 'Article'}</div>
                            <h4 className="font-bold text-[var(--text-heading)] leading-tight group-hover:text-[var(--primary)] transition-colors">
                                {post.title}
                            </h4>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
