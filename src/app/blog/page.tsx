import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';
import { Calendar, User, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Blog - FilesCenter | Tips, Tutorials & Updates',
    description: 'Read the latest articles about PDF management, image editing, and productivity tools. Learn how to get the most out of FilesCenter.',
};

export default function BlogIndex() {
    const posts = getAllPosts();
    const featuredPost = posts[0];
    const remainingPosts = posts.slice(1);

    return (
        <div className="min-h-screen pb-20 bg-gray-50/30">
            {/* Featured Post / Hero Section */}
            {featuredPost && (
                <section className="relative h-[500px] flex items-center overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src="/images/blog/featured-hero.png"
                            alt="Featured background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                        <div className="max-w-2xl">
                            <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs font-bold tracking-wider uppercase mb-4 border border-primary/30 blur-backdrop-sm">
                                Featured Article
                            </span>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                                {featuredPost.title}
                            </h1>
                            <p className="text-lg text-gray-300 mb-8 line-clamp-2 max-w-xl">
                                {featuredPost.description}
                            </p>
                            <Link
                                href={`/blog/${featuredPost.slug}`}
                                className="btn-primary inline-flex items-center gap-2 group"
                            >
                                Read Featured Article
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Categories & Filter Bar (Optional) */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                            {['All Posts', 'PDF', 'Images', 'Security', 'Tutorials'].map((cat) => (
                                <button key={cat} className={`text-sm font-medium whitespace-nowrap ${cat === 'All Posts' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-900'} h-14 px-1`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Blog Posts Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">Latest Updates</h2>
                        <p className="text-gray-500 mt-1">Insights and guides from the FilesCenter team.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {remainingPosts.map((post) => (
                        <article key={post.slug} className="glass rounded-2xl overflow-hidden group border border-gray-100/50 hover:border-primary/50 transition-all duration-500 flex flex-col h-full bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1">
                            {/* Card Image */}
                            <div className="aspect-[16/9] overflow-hidden relative">
                                {post.image ? (
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-200 flex items-center justify-center">
                                        <ArrowRight className="w-12 h-12 text-teal-400 opacity-20" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/90 backdrop-blur-md text-gray-900 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                                        {post.tags?.[0] || 'General'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3" />
                                        {post.date}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1.5 text-primary">
                                        5 min read
                                    </span>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors leading-snug">
                                    <Link href={`/blog/${post.slug}`} className="focus:outline-none">
                                        {post.title}
                                    </Link>
                                </h3>

                                <p className="text-gray-600 mb-8 line-clamp-3 text-sm leading-relaxed">
                                    {post.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-white shadow-sm">
                                            <User className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{post.author || 'FilesCenter Team'}</span>
                                    </div>
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300"
                                    >
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-32 glass rounded-3xl">
                        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <ArrowRight className="w-10 h-10 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-xl font-medium">Coming soon: Insights, guides, and tutorials.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
