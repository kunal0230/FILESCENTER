import { getAllPosts } from '@/lib/blog';
import Link from 'next/link';
import { ArrowRight, Search, Zap, Newspaper } from 'lucide-react';
import { BlogSidebar } from '@/components/blog/BlogSidebar';

// Map specific posts to our new abstract images
// We should eventually move this to frontmatter, but this override ensures design consistency
const postImages: Record<string, string> = {
    'pdf-manifestation-internals': '/images/blog/blog_hero_abstract_1.png',
    'ultimate-image-compression-guide': '/images/blog/blog_hero_abstract_2.png',
    'securing-sensitive-data': '/images/blog/blog_hero_security.png',
    'psychology-of-security': '/images/blog/blog_hero_security.png',
    'why-client-side-pdf-merging-is-safer': '/images/blog/blog_hero_pdf_privacy.png',
    'understanding-image-compression-algorithms': '/images/blog/blog_hero_image_algorithms.png',
    'the-hidden-risks-of-online-converters': '/images/blog/blog_hero_converters.png'
};

export default function BlogIndex() {
    const posts = getAllPosts();

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Search Header - Matches Hero styles */}
            <header className="border-b border-[var(--border-light)] bg-[var(--surface)] sticky top-0 z-30 shadow-sm/50 backdrop-blur-xl bg-opacity-90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--background-alt)] flex items-center justify-center text-[var(--primary)]">
                                <Newspaper className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-[var(--text-heading)] leading-none">The Journal</h1>
                                <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">Engineering & Privacy</p>
                            </div>
                        </div>

                        <div className="relative w-full max-w-sm hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-light)]" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--background)] border border-[var(--input-border)] rounded-xl text-sm text-[var(--text)] focus:ring-2 focus:ring-[var(--primary)]/10 focus:border-[var(--primary)] transition-all placeholder:text-[var(--text-light)]"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Theme-Consistent Sidebar */}
                    <BlogSidebar />

                    {/* Denser Feed - Using Global Card Styles */}
                    <div className="flex-1">
                        <div className="flex items-baseline justify-between mb-6 border-b border-[var(--border)] pb-4">
                            <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Latest</h2>
                            <span className="text-xs font-semibold text-[var(--text-light)] bg-[var(--background-alt)] px-2 py-1 rounded-md">{posts.length} Articles</span>
                        </div>

                        {posts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {posts.map((post) => {
                                    const heroImage = postImages[post.slug] || post.image || '/images/blog/blog_hero_abstract_1.png';

                                    return (
                                        <article key={post.slug} className="group tool-card overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                            <Link href={`/blog/${post.slug}`} className="flex flex-col md:flex-row h-full">
                                                {/* Image Section */}
                                                <div className="w-full md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden md:border-r border-[var(--border-light)]">
                                                    <img
                                                        src={heroImage}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-[var(--primary)]/5 group-hover:bg-transparent transition-colors"></div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="flex-1 p-6 flex flex-col justify-center">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className="px-2.5 py-1 rounded-lg bg-[var(--background-alt)] text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                                                            {post.tags?.[0] || 'Engineering'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-[var(--text-light)] uppercase tracking-wider">{post.date}</span>
                                                    </div>

                                                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-heading)] mb-3 group-hover:text-[var(--primary)] transition-colors leading-tight">
                                                        {post.title}
                                                    </h2>

                                                    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 line-clamp-2">
                                                        {post.description}
                                                    </p>

                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--border-light)]">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-[var(--background-alt)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)]">
                                                                {post.author?.[0] || 'F'}
                                                            </div>
                                                            <span className="text-[11px] font-bold text-[var(--text)]">{post.author || 'FilesCenter'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[var(--primary)] font-bold text-[11px] uppercase tracking-wider group-hover:gap-2 transition-all">
                                                            Read Article <ArrowRight className="w-3.5 h-3.5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--background-alt)]/30">
                                <p className="text-[var(--text-light)] font-medium">No publications found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
