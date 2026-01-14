import { getPostBySlug, getAllPosts, BlogPost as BlogPostType } from '@/lib/blog';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronLeft, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { ScrollProgress, TableOfContents, ShareBar } from '@/components/blog/BlogComponents';
import { BlogRightSidebar } from '@/components/blog/BlogRightSidebar';
import { RelatedArticles } from '@/components/blog/RelatedArticles';

// Map specific posts to our new abstract images
const postImages: Record<string, string> = {
    'pdf-manifestation-internals': '/images/blog/blog_hero_abstract_1.png',
    'ultimate-image-compression-guide': '/images/blog/blog_hero_abstract_2.png',
    'securing-sensitive-data': '/images/blog/blog_hero_security.png',
    'psychology-of-security': '/images/blog/blog_hero_security.png',
    'why-client-side-pdf-merging-is-safer': '/images/blog/blog_hero_pdf_privacy.png',
    'understanding-image-compression-algorithms': '/images/blog/blog_hero_image_algorithms.png',
    'the-hidden-risks-of-online-converters': '/images/blog/blog_hero_converters.png'
};

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

    const heroImage = postImages[params.slug] || post.image || '/images/blog/blog_hero_abstract_1.png';

    return {
        title: `${post.title} - FilesCenter Journal`,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author || 'FilesCenter Team'],
            images: [
                {
                    url: heroImage,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: [heroImage],
        }
    };
}

export default function BlogPost({ params }: Props) {
    const post = getPostBySlug(params.slug);
    const allPosts = getAllPosts();

    if (!post) {
        notFound();
    }

    const heroImage = postImages[params.slug] || post.image || '/images/blog/blog_hero_abstract_1.png';

    // Helper to render code blocks
    const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
            <div className="my-8 rounded-xl overflow-hidden border border-[var(--border)] shadow-sm">
                <div className="bg-[var(--background-alt)] px-4 py-2 border-b border-[var(--border-light)] flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{match[1]}</span>
                </div>
                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{ margin: 0, padding: '1.5rem', fontSize: '13px', lineHeight: '1.6' }}
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            </div>
        ) : (
            <code className="bg-[var(--background-alt)] text-[var(--primary)] px-1.5 py-0.5 rounded font-bold text-sm border border-[var(--border-light)]" {...props}>
                {children}
            </code>
        );
    };

    return (
        <article className="min-h-screen bg-[var(--background)] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <ScrollProgress />

            {/* Consistent Header Area */}
            <header className="bg-[var(--surface)] border-b border-[var(--border-light)] pb-16 pt-32 px-4 shadow-sm relative overflow-hidden">
                {/* Subtle background flair */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="max-w-6xl mx-auto relative">
                    <Link
                        href="/blog"
                        className="inline-flex items-center text-[var(--text-light)] hover:text-[var(--primary)] transition-all mb-10 text-[10px] font-bold uppercase tracking-[0.2em] group"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Journal
                    </Link>

                    {/* Hero Image - Standard Card Style */}
                    <div className="w-full h-72 sm:h-96 rounded-3xl overflow-hidden mb-12 relative shadow-[0_4px_20px_var(--card-shadow)] border border-[var(--border-light)]">
                        <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-6 left-8 text-white text-xs font-bold uppercase tracking-widest bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                            {post.tags?.[0] || 'Article'}
                        </div>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-heading)] mb-8 leading-tight tracking-tight max-w-4xl">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] border-t border-[var(--border-light)] pt-8">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[var(--primary)]" />
                            <span className="text-[var(--text)]">{post.author || 'FilesCenter Team'}</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[var(--primary)]" />
                            <time dateTime={post.date}>{post.date}</time>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[var(--primary)]" />
                            <span>5 min read</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area - 3 Column Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

                    {/* LEFT COL: TOC (Sticky) - 2 Cols */}
                    <div className="hidden lg:block col-span-2 relative">
                        <div className="sticky top-32">
                            <TableOfContents content={post.content} />
                        </div>
                    </div>

                    {/* CENTER COL: Content (Main) - 7 Cols */}
                    <div className="lg:col-span-7">
                        <div className="bg-[var(--surface)] rounded-2xl p-8 sm:p-12 border border-[var(--card-border)] shadow-[0_1px_3px_var(--card-shadow)]">
                            <div className="prose prose-slate max-w-none 
                        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[var(--text-heading)] prose-headings:scroll-mt-32
                        prose-p:leading-[1.8] prose-p:text-[var(--text-muted)] prose-p:mb-6 prose-p:font-sans prose-p:text-[17px]
                        prose-a:text-[var(--primary)] prose-a:font-semibold prose-a:no-underline hover:text-[var(--primary-dark)] transition-colors
                        prose-strong:text-[var(--text-heading)] prose-strong:font-bold
                        prose-img:rounded-2xl prose-img:shadow-md prose-img:my-8 prose-img:border prose-img:border-[var(--border-light)]
                        prose-blockquote:border-l-4 prose-blockquote:border-[var(--primary)] prose-blockquote:bg-[var(--background-alt)] prose-blockquote:rounded-r-xl prose-blockquote:py-6 prose-blockquote:px-8 prose-blockquote:text-[var(--text)] prose-blockquote:font-medium prose-blockquote:not-italic prose-blockquote:my-10
                    ">
                                <ReactMarkdown
                                    components={{
                                        code: CodeBlock,
                                        h1: ({ children }) => <h1 id={children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}>{children}</h1>,
                                        h2: ({ children }) => <h2 id={children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}>{children}</h2>,
                                        h3: ({ children }) => <h3 id={children?.toString().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}>{children}</h3>,
                                    }}
                                >
                                    {post.content}
                                </ReactMarkdown>
                            </div>
                        </div>

                        <RelatedArticles currentSlug={params.slug} posts={allPosts} />
                    </div>

                    {/* RIGHT COL: Tools & Ads (Sticky) - 3 Cols */}
                    <div className="hidden lg:block col-span-3">
                        <div className="sticky top-32">
                            <BlogRightSidebar />
                        </div>
                    </div>

                </div>
            </div>
        </article>
    );
}
