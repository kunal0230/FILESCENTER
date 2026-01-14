"use client";

import React from "react";
import Link from "next/link";
import {
    FileText, Image, Type, Code, Calculator, ChevronRight, Zap
} from "lucide-react";

const categories = [
    {
        name: "PDF Tools",
        icon: FileText,
        href: "/#pdf-tools",
        color: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
        tools: ["Merge", "Split", "Compress", "Protect"]
    },
    {
        name: "Image Tools",
        icon: Image,
        href: "/#image-tools",
        color: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
        tools: ["Compress", "Resize", "Crop", "Convert"]
    },
    {
        name: "Text Tools",
        icon: Type,
        href: "/#text-tools",
        color: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
        tools: ["Word Count", "Case", "Diff"]
    },
    {
        name: "Developer",
        icon: Code,
        href: "/#developer-tools",
        color: "bg-sky-50 text-sky-600 group-hover:bg-sky-100",
        tools: ["JSON", "Base64", "UUID", "Hash"]
    },
    {
        name: "Calculators",
        icon: Calculator,
        href: "/#calculator-tools",
        color: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
        tools: ["Percentage", "Age", "BMI"]
    }
];

export function BlogSidebar() {
    return (
        <aside className="w-full lg:w-80 shrink-0 z-20">
            <div className="sticky top-28 space-y-6">

                {/* Main Catalog Container - Matches global card style */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-[0_1px_3px_var(--card-shadow)] overflow-hidden">

                    <div className="p-5 border-b border-[var(--border-light)] bg-[var(--background-alt)]/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
                                <Zap className="w-4 h-4 fill-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[var(--text-heading)] leading-none mb-1">Tools Catalog</h3>
                                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Access 50+ Free Tools</p>
                            </div>
                        </div>
                    </div>

                    <nav className="p-3 space-y-1">
                        {categories.map((cat) => (
                            <div key={cat.name} className="group">
                                <Link
                                    href={cat.href}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--background-alt)] transition-all duration-200 group-hover:translate-x-1"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${cat.color} transition-colors`}>
                                            <cat.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--text-heading)]">{cat.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[var(--text-light)] group-hover:text-[var(--primary)] transition-colors" />
                                </Link>
                                {/* Micro-list of tools - Visible on hover only or keep subtle */}
                                <div className="px-4 py-2 hidden group-hover:flex flex-wrap gap-x-3 gap-y-1 animate-fade-in">
                                    {cat.tools.map(tool => (
                                        <span key={tool} className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--primary)] cursor-pointer transition-colors">
                                            • {tool}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="p-4 bg-[var(--background-alt)]/30 border-t border-[var(--border-light)]">
                        <Link href="/" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-bold text-[var(--primary)] hover:border-[var(--primary)] hover:shadow-sm transition-all uppercase tracking-wide">
                            View All Tools <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>

            </div>
        </aside>
    );
}
