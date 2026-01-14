"use client";

import React from "react";
import Link from "next/link";
import {
    FileText, Image, ChevronRight, Zap, ArrowRight
} from "lucide-react";

export function BlogRightSidebar() {
    return (
        <div className="space-y-6">

            {/* Mini Tools Catalog */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-[0_1px_3px_var(--card-shadow)] overflow-hidden">
                <div className="p-4 border-b border-[var(--border-light)] bg-[var(--background-alt)]/50">
                    <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-3 h-3 text-[var(--primary)]" /> Quick Tools
                    </h3>
                </div>
                <div className="p-2 space-y-1">
                    <Link href="/pdf/merge" className="flex items-center gap-3 p-3 hover:bg-[var(--background-alt)] rounded-xl transition-colors group">
                        <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-[var(--text-heading)]">Merge PDF</div>
                            <div className="text-[10px] text-[var(--text-muted)]">Combine files instantly</div>
                        </div>
                    </Link>
                    <Link href="/image/compress" className="flex items-center gap-3 p-3 hover:bg-[var(--background-alt)] rounded-xl transition-colors group">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                            <Image className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-[var(--text-heading)]">Compress Image</div>
                            <div className="text-[10px] text-[var(--text-muted)]">Reduce size by 80%</div>
                        </div>
                    </Link>
                    <Link href="/pdf/to-image" className="flex items-center gap-3 p-3 hover:bg-[var(--background-alt)] rounded-xl transition-colors group">
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
                            <FileText className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-[var(--text-heading)]">PDF to JPG</div>
                            <div className="text-[10px] text-[var(--text-muted)]">Extract pages as images</div>
                        </div>
                    </Link>
                </div>
                <div className="p-3 border-t border-[var(--border-light)]">
                    <Link href="/" className="flex items-center justify-center w-full py-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold hover:bg-[var(--primary)] hover:text-white transition-all uppercase tracking-wide">
                        View All Tools
                    </Link>
                </div>
            </div>

            {/* "Why Us" Mini Card */}
            <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
                <h3 className="font-bold text-lg mb-2 relative z-10">Zero Uploads.</h3>
                <p className="text-xs text-white/80 leading-relaxed mb-6 relative z-10">
                    Your files never leave your browser. We prioritize your privacy above all else.
                </p>
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all relative z-10">
                    Learn More <ArrowRight className="w-3 h-3" />
                </Link>
            </div>

        </div>
    );
}
