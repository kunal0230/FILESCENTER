"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const closeMenu = () => setIsOpen(false);

    const isActive = (path: string) => pathname === path;

    return (
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center" onClick={closeMenu}>
                    <img
                        src="/logo-full.png"
                        alt="FilesCenter"
                        className="h-10 sm:h-12 w-auto transition-all"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1 lg:gap-2">
                    <NavLink href="/#pdf-tools" label="PDF Tools" active={isActive("/#pdf-tools")} />
                    <NavLink href="/#image-tools" label="Image Tools" active={isActive("/#image-tools")} />
                    <NavLink href="/catalog" label="Catalog" active={isActive("/catalog")} />
                    <div className="w-px h-6 bg-gray-200 mx-2"></div>
                    <Link
                        href="/"
                        className="btn-primary text-sm whitespace-nowrap px-4 py-2"
                    >
                        All Tools
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label="Toggle menu"
                >
                    {isOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </nav>

            {/* Mobile Navigation Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100 border-b border-gray-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="px-4 py-3 space-y-2 bg-white/95 backdrop-blur-sm">
                    <MobileNavLink href="/#pdf-tools" label="PDF Tools" onClick={closeMenu} />
                    <MobileNavLink href="/#image-tools" label="Image Tools" onClick={closeMenu} />
                    <MobileNavLink href="/catalog" label="Full Catalog" onClick={closeMenu} />
                    <div className="border-t border-gray-100 my-2 pt-2">
                        <Link
                            href="/"
                            onClick={closeMenu}
                            className="flex items-center justify-center w-full btn-primary text-sm py-3 mt-2"
                        >
                            Access All Tools
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                ? "text-primary bg-primary/5"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
        >
            {label}
        </Link>
    );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
        >
            {label}
        </Link>
    );
}
