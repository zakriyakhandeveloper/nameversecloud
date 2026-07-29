import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { validateMetaTitle, validateMetaDescription } from '@/lib/seo/meta-helpers';
import { getSiteUrl } from '@/lib/seo/site';
import {
  BookOpen,
  Heart,
  Clock,
  ArrowLeft,
  Share2,
  Calendar,
  User,
  Tag,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowUp,
  Menu,
  X,
  Search,
  TrendingUp,
  Award,
  CheckCircle,
  Shield,
  Sparkles,
  Quote,
  Lightbulb,
  Info,
  AlertCircle,
  Hash,
  Globe,
  Users,
  Star,
  PenTool,
  Eye,
  Bookmark,
  ArrowRight,
} from 'lucide-react';
import blogPostsData from '../../../../public/data/blog-posts.json';
import BlogImageWithFallback from '@/components/Blog/BlogImageWithFallback';
import islamicNames from '../../../../public/islamic_names.json';
import hinduNames from '../../../../public/hindu_names.json';
import christianNames from '../../../../public/christians_names.json';
import SitePage from '@/components/Layout/SitePage';
import { createSafeSlug } from '@/lib/utils/createSafeSlug';
import NativeBanner from '@/components/Ads/NativeBanner';
import ReadingProgress from '@/components/Blog/ReadingProgress';
import BackToTop from '@/components/Blog/BackToTop';

export const dynamic = 'force-static';
export const dynamicParams = false;
export async function generateStaticParams() {
  return blogPostsData.map((post) => ({ slug: post.id }));
}

// ─── Metadata Generator (Enhanced) ──────────────────────────────────────

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = blogPostsData.find((p) => p.id === slug);

  if (!post) {
    return { title: 'Post Not Found | NameVerse' };
  }

  const canonical = `${getSiteUrl()}/blog/${post.id}`;
  const ogImage = post.featuredImage
    ? post.featuredImage.startsWith('http')
      ? post.featuredImage
      : `${getSiteUrl()}${post.featuredImage}`
    : `${getSiteUrl()}/api/og?title=${encodeURIComponent(post.title)}`;

  const seoDescription = validateMetaDescription(
    `${post.excerpt} Read this expert guide to ${post.category.toLowerCase()} baby names, meaning, and naming trends for modern families.`
  );
  const seoTitle = validateMetaTitle(
    `${post.title} | NameVerse Blog — Expert Baby Naming Advice & Latest Trends`
  );

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: post.seoKeywords ||
      [...(post.tags || []), `${post.category} baby names`, 'baby name trends', 'baby naming guide'].join(
        ', '
      ),
    alternates: {
      canonical,
      languages: {
        en: canonical,
        'x-default': canonical,
      },
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      url: canonical,
      images: [
        {
          url: ogImage,
          alt: `${post.title} | NameVerse`,
          width: 1200,
          height: 630,
        },
      ],
      publishedTime: post.publishDate,
      modifiedTime: post.lastUpdated || post.publishDate,
      authors: [post.author],
      tags: post.tags,
      section: post.category,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [ogImage],
      creator: '@NameVerseOfficial',
      site: '@NameVerseOfficial',
    },
    robots: { index: true, follow: true },
    other: {
      'article:published_time': post.publishDate,
      'article:modified_time': post.lastUpdated || post.publishDate,
      'article:section': post.category,
      'article:tag': (post.tags || []).join(', '),
      'citation:author': post.author,
      'citation:publication_date': post.publishDate,
      'citation:update_date': post.lastUpdated || post.publishDate,
    },
  };
}

// ─── Schema Components ──────────────────────────────────────────────────

function ArticleSchema({ post, ogImage }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    alternativeHeadline: post.subtitle || post.title,
    description: post.excerpt,
    image: ogImage,
    author: {
      '@type': 'Person',
      name: post.author,
      jobTitle: post.authorCredentials || 'Baby Name Expert',
      affiliation: {
        '@type': 'Organization',
        name: 'NameVerse',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'NameVerse',
      url: getSiteUrl(),
      logo: {
        '@type': 'ImageObject',
        url: `${getSiteUrl()}/logo.png`,
        width: 192,
        height: 192,
      },
    },
    datePublished: post.publishDate,
    dateModified: post.lastUpdated || post.publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${getSiteUrl()}/blog/${post.id}`,
    },
    keywords: post.seoKeywords || (post.tags || []).join(', '),
    articleSection: post.category,
    genre: 'Baby Naming Advice',
    inLanguage: 'en-US',
    wordCount: post.content?.sections?.reduce((acc, s) => acc + (s.content?.length || 0), 0) || 0,
    timeRequired: post.readTime || '5 min read',
    about: {
      '@type': 'Thing',
      name: post.category,
    },
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

function BreadcrumbSchema({ post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: getSiteUrl(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${getSiteUrl()}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${getSiteUrl()}/blog/${post.id}`,
      },
    ],
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

function FAQSchema({ faqs }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NameVerse',
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/logo.png`,
    description: 'Baby names with meanings, origins, and expert guidance.',
    email: 'contact@nameverse.com',
    sameAs: [
      'https://twitter.com/NameVerseOfficial',
      'https://facebook.com/NameVerse',
      'https://instagram.com/nameverse',
    ],
    founder: {
      '@type': 'Person',
      name: 'NameVerse Team',
    },
    knowsAbout: ['Baby Names', 'Islamic Names', 'Christian Names', 'Hindu Names'],
    award: 'Top Baby Name Resource 2026',
  };

  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

// ─── Name Religion Detection ────────────────────────────────────────────

const islamicNameSet = new Set(islamicNames.map((n) => n.toLowerCase()));
const hinduNameSet = new Set(hinduNames.map((n) => n.toLowerCase()));
const christianNameSet = new Set(christianNames.map((n) => n.toLowerCase()));

function detectNameReligion(name) {
  const normalized = (typeof name === 'string' ? name : name.name || name).toLowerCase().trim();
  if (islamicNameSet.has(normalized)) return 'islamic';
  if (hinduNameSet.has(normalized)) return 'hindu';
  if (christianNameSet.has(normalized)) return 'christian';
  return 'islamic';
}

function getReligionFromCategory(category) {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('islamic') || categoryLower.includes('muslim')) return 'islamic';
  if (categoryLower.includes('christian') || categoryLower.includes('biblical')) return 'christian';
  if (categoryLower.includes('hindu') || categoryLower.includes('vedic') || categoryLower.includes('sanskrit'))
    return 'hindu';
  return 'islamic';
}

// ─── Components ─────────────────────────────────────────────────────────

function FeaturedNameLink({ name, religion: blogReligion = 'islamic' }) {
  const displayName = typeof name === 'string' ? name : name.name;
  const nameSlug = createSafeSlug(displayName);
  const detectedReligion = detectNameReligion(name);
  const finalReligion = blogReligion !== 'islamic' ? blogReligion : detectedReligion;

  return (
    <Link
      href={`/names/${finalReligion}/${nameSlug}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-medium text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 hover:shadow-sm"
    >
      {displayName}
      <ExternalLink className="h-3 w-3" />
    </Link>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = blogPostsData.find((p) => p.id === slug);

  if (!post) {
    notFound();
  }

  const religion = getReligionFromCategory(post.category);
  const ogImage = post.featuredImage
    ? post.featuredImage.startsWith('http')
      ? post.featuredImage
      : `${getSiteUrl()}${post.featuredImage}`
    : `${getSiteUrl()}/api/og?title=${encodeURIComponent(post.title)}`;

  const relatedPosts = blogPostsData
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Build TOC from sections
  const tocItems = post.content?.sections?.map((section) => ({
    id: section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: section.title,
  })) || [];

  return (
    <>
      <ReadingProgress />
      <OrganizationSchema />
      <ArticleSchema post={post} ogImage={ogImage} />
      <BreadcrumbSchema post={post} />
      {post.content?.faqs && post.content.faqs.length > 0 && <FAQSchema faqs={post.content.faqs} />}

      <SitePage className="bg-white" containerClassName="max-w-none px-0 py-0">
        {/* ─── STICKY HEADER ─── */}
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NameVerse
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  href="/search"
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </Link>
                <Link
                  href="/blog"
                  className="hidden rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 sm:inline-flex"
                >
                  Back to Blog
                </Link>
                <Link
                  href="/names/religion/islamic/1"
                  className="hidden rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 sm:inline-flex"
                >
                  Browse Names
                </Link>
                <button
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ─── HERO SECTION ─── */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-blue-50/20 px-4 py-12 sm:py-16 lg:py-20">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.12),transparent_45%)]" />

          <div className="relative mx-auto max-w-4xl">
            {/* Category & Featured Badges */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1.5 text-sm font-medium text-blue-700">
                {post.category}
              </span>
              {post.featured && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-sm font-medium text-amber-700">
                  <Sparkles className="h-3.5 w-3.5" /> Featured
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-sm font-medium text-emerald-700">
                <CheckCircle className="h-3.5 w-3.5" /> Expert Reviewed
              </span>
            </div>

            {/* Title */}
            {post.subtitle && (
              <p className="mb-3 text-lg font-medium text-blue-600">{post.subtitle}</p>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="mt-6 text-lg leading-relaxed text-gray-600">{post.excerpt}</p>

            {/* Meta Info */}
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-gray-900">{post.author}</span>
                  {post.authorCredentials && (
                    <span className="block text-xs text-gray-500">{post.authorCredentials}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
              {post.lastUpdated && post.lastUpdated !== post.publishDate && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <Shield className="h-4 w-4" />
                  <span>Updated {new Date(post.lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="relative mt-8 h-64 w-full overflow-hidden rounded-2xl bg-gray-100 sm:h-80 lg:h-96">
                <BlogImageWithFallback
                  src={post.featuredImage.startsWith('http') ? post.featuredImage : `${getSiteUrl()}${post.featuredImage}`}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                  priority
                />
              </div>
            )}
          </div>
        </section>

        {/* ─── TOC & CONTENT ─── */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Sidebar: TOC */}
            <div className="lg:col-span-3">
              <nav className="lg:sticky lg:top-24 space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                    On this page
                  </div>
                  <ol className="space-y-1 text-sm">
                    {tocItems.map((item) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="block rounded-lg px-3 py-2 text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Quick Stats */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-3 text-sm font-bold text-gray-900">Article Stats</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Reading time</span>
                      <span className="font-medium text-gray-900">{post.readTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category</span>
                      <span className="font-medium text-gray-900">{post.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Published</span>
                      <span className="font-medium text-gray-900">{new Date(post.publishDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6">
              <article className="prose prose-lg prose-blue max-w-none">
                {/* Introduction */}
                {post.content?.introduction && (
                  <div className="mb-8 text-gray-700">{post.content.introduction}</div>
                )}

                {/* Sections */}
                {post.content?.sections?.map((section, index) => (
                  <section key={index} id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="mb-12 scroll-mt-20">
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                    <p className="mt-4 text-gray-600 leading-relaxed">{section.content}</p>

                    {/* Featured Names */}
                    {section.featuredNames && section.featuredNames.length > 0 && (
                      <div className="mt-6">
                        <h4 className="mb-3 text-sm font-semibold text-gray-700">Featured Names:</h4>
                        <div className="flex flex-wrap gap-2">
                          {section.featuredNames.map((name, i) => (
                            <FeaturedNameLink key={i} name={name} religion={religion} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Subsections */}
                    {section.subsections?.map((subsection, subIndex) => (
                      <div key={subIndex} className="mt-6 pl-4 border-l-2 border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-900">{subsection.title}</h3>
                        <p className="mt-2 text-gray-600 leading-relaxed">{subsection.content}</p>
                      </div>
                    ))}
                  </section>
                ))}
              </article>

              {/* Native Ad */}
              <NativeBanner className="my-8" minHeight="90px" instanceId="blog-post-1" />

              {/* FAQ Section */}
              {post.content?.faqs && post.content.faqs.length > 0 && (
                <section className="mt-12 scroll-mt-20" id="faq">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {post.content.faqs.map((faq, index) => (
                      <details
                        key={index}
                        className="group rounded-2xl border border-gray-200 bg-white transition hover:border-gray-300"
                      >
                        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-base font-semibold text-gray-900 transition hover:text-blue-600">
                          <span className="flex-1">{faq.question}</span>
                          <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
                        </summary>
                        <div className="px-5 pb-5 text-sm leading-relaxed text-gray-600">{faq.answer}</div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              <NativeBanner className="my-8" minHeight="90px" instanceId="blog-post-2" />

              {/* Author Section */}
              <section className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{post.author}</h3>
                    <p className="text-sm text-gray-600">{post.authorCredentials || 'Baby Name Expert'}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-500" /> Expert Reviewer
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-blue-500" /> Fact Checked
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-amber-500" /> Trusted Source
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section className="mt-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        href={`/blog/${related.id}`}
                        className="group rounded-2xl border border-gray-200 bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg"
                      >
                        <span className="text-xs font-medium text-blue-600">{related.category}</span>
                        <h3 className="mt-2 font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {related.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{related.excerpt}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{related.readTime}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <NativeBanner className="my-8" minHeight="90px" instanceId="blog-post-3" />
            </div>

            {/* Sidebar: Right */}
            <div className="hidden lg:col-span-3 lg:block">
              <div className="lg:sticky lg:top-24 space-y-4">
                {/* Categories */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h4 className="mb-3 text-sm font-bold text-gray-900">Categories</h4>
                  <div className="space-y-2">
                    {['Islamic Names', 'Christian Names', 'Hindu Names', 'Trends', 'Tips & Advice'].map((cat) => (
                      <Link
                        key={cat}
                        href={`/blog?category=${cat.toLowerCase().replace(/ /g, '-')}`}
                        className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Newsletter */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <h4 className="text-sm font-bold text-gray-900">Stay Updated</h4>
                  <p className="mt-2 text-sm text-gray-600">Get the latest naming guides and trends.</p>
                  <form className="mt-4 space-y-2">
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── CTA ─── */}
        <section className="px-4 py-16">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 px-8 py-16 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.3),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.2),transparent_50%)]" />
            <div className="relative">
              <Heart className="mx-auto mb-4 h-12 w-12 text-blue-400" />
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Ready to Find the Perfect Name?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
                Explore our database of 60,000+ baby names with meanings, origins, and numerology.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/names/religion/islamic/1"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 hover:shadow-lg"
                >
                  <BookOpen className="h-4 w-4" /> Browse All Names
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-600 px-8 py-3.5 text-sm font-medium text-white transition hover:border-gray-400 hover:bg-gray-700"
                >
                  Explore Guides <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <BackToTop />
      </SitePage>
    </>
  );
}