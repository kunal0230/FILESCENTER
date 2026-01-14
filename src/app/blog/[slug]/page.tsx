import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, Calendar, User, Tag, ArrowRight } from 'lucide-react';

interface Props {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = getPostBySlug(params.slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: `${post.title} - FilesCenter Blog`,
        description: post.description,
    };
}

export default function BlogPost({ params }: Props) {
    const post = getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-white">
            {/* Blog Hero Section */}
            <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
                {post.image ? (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-primary/80"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full pb-12">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-gray-900 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full hover:text-primary transition-all mb-8 text-sm font-bold shadow-sm border border-white/50"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Blog
                        </Link>

                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-8 text-sm font-bold text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-primary" />
                                <time dateTime={post.date}>{post.date}</time>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                <span>{post.author || 'FilesCenter Team'}</span>
                            </div>
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-primary" />
                                    <div className="flex gap-2">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
                            <span className="text-primary uppercase tracking-widest">5 Min Read</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Blog Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
                <div className="prose prose-xl prose-slate max-w-none 
            prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900
            prose-p:leading-relaxed prose-p:text-gray-600
            prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900
            prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-gray-100
            prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:italic
            prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
        ">
                    <ReactMarkdown>{post.content}</ReactMarkdown>
                </div>

                <div className="mt-24 pt-16 border-t border-gray-100">
                    <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                        <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Optimizing Beyond Content</h2>
                        <p className="text-gray-400 mb-10 max-w-xl mx-auto relative z-10 font-medium">
                            Content is king, but performance is the kingdom. Explore our professional-grade tools to keep your digital life fast and secure.
                        </p>
                        <Link
                            href="/"
                            className="btn-primary inline-flex items-center gap-2 group relative z-10"
                        >
                            Explore Tools Collection
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
}
