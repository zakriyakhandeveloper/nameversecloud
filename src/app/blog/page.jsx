import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Heart,
  Clock,
  ArrowRight,
  Calendar,
  Award,
  TrendingUp,
  User,
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
  Share2,
  ChevronRight,
  ChevronDown,
  Menu,
  Search,
  X,
  Grid3x3,
  List,
  Filter,
  SortAsc,
} from 'lucide-react';
import blogPosts from '../../../public/data/blog-posts.json';
import StructuredData from '@/components/SEO/StructuredData';
import BlogImageWithFallback from '@/components/Blog/BlogImageWithFallback';
import { getSiteUrl } from '@/lib/seo/site';
import SitePage from '@/components/Layout/SitePage';
import NativeBanner from '@/components/Ads/NativeBanner';

// ISR with 365-day cache
export const revalidate = 2592000; // 30 days

const blogFaq = [
  {
    question: 'How do I choose the perfect baby name?',
    answer:
      'Choose a baby name by balancing meaning, cultural relevance, pronunciation, and family tradition. Our guides help you compare Islamic, Christian, Hindu, and global name choices with trusted origin notes.',
  },
  {
    question: 'What are the most popular Islamic baby names?',
    answer:
      'The most popular Islamic baby names include Muhammad, Ali, Yusuf, Aisha, Fatima, Zainab and Maryam — names with Quranic meaning and modern appeal.',
  },
  {
    question: 'What baby names are trending in 2026?',
    answer:
      'Trending baby names for 2026 include names with spiritual meaning, short modern forms, and cross-cultural appeal such as Rayan, Noor, Elias, Leila, Vihaan, and Zara.',
  },
  {
    question: 'How important is name meaning?',
    answer:
      'Name meaning is very important for cultural identity and long-term satisfaction; choose a name with a positive meaning that reflects your family values and heritage.',
  },
];

const blogCollection = {
  name: 'NameVerse Blog: Baby Names & Guides',
  description:
    'Explore expert baby naming advice, trends, and naming traditions for Islamic, Christian, Hindu, and global names.',
  url: `${getSiteUrl()}/blog`,
  items: [
    { name: 'Islamic Boy Names', path: 'islamic/boy-names' },
    { name: 'Islamic Girl Names', path: 'islamic/girl-names' },
    { name: 'Christian Boy Names', path: 'christian/boy-names' },
    { name: 'Christian Girl Names', path: 'christian/girl-names' },
    { name: 'Hindu Boy Names', path: 'hindu/boy-names' },
    { name: 'Hindu Girl Names', path: 'hindu/girl-names' },
  ],
};

export const metadata = {
  title: 'Baby Names Blog & Expert Guides | Naming Tips, Trends & Advice | NameVerse',
  description:
    'Expert guides and articles on choosing the perfect baby name. Learn about Islamic, Christian, and Hindu naming traditions, 2026 baby name trends, and expert naming tips.',
  keywords:
    'baby names blog, naming guides, baby name trends 2026, Islamic naming guide, Christian naming guide, Hindu naming guide, how to choose baby name, baby naming tips',
  alternates: {
    canonical: `${getSiteUrl()}/blog`,
  },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'Baby Names Blog & Expert Guides | Naming Tips, Trends & Advice | NameVerse',
    description:
      'Expert guides and articles on choosing the perfect baby name. Learn about Islamic, Christian, and Hindu naming traditions, 2026 baby name trends, and expert naming tips.',
    type: 'website',
    url: `${getSiteUrl()}/blog`,
    images: [`${getSiteUrl()}/api/og?section=blog&page=1`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Baby Names Blog & Expert Guides | Naming Tips, Trends & Advice | NameVerse',
    description:
      'Expert guides and articles on choosing the perfect baby name. Learn about Islamic, Christian, and Hindu naming traditions, 2026 baby name trends, and expert naming tips.',
    images: [`${getSiteUrl()}/api/og?section=blog&page=1`],
  },
};

// ─── Premium Components ──────────────────────────────────────────────────

// ─── HERO SECTION (Refined) ──────────────────────────────────────────────

function BlogHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-white to-blue-50/20" />
      
      {/* Subtle decorative elements */}
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-100/10 blur-3xl" />
      <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-purple-100/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-12 py-16 lg:flex-row lg:py-24">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Breadcrumb / Category */}
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-gray-100 px-4 py-1.5 text-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-500" />
              <span className="font-medium text-gray-700">Expert Guides</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">50+ Articles</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Baby Names
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Blog &amp; Guides
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 lg:mx-0">
              Expert advice, naming traditions, and cultural insights to help you
              choose the perfect name for your baby.
            </p>

            {/* Trust Indicators */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 ring-2 ring-white"
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-700">10k+ parents helped</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Expert reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Updated weekly</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <Link
                href="#articles"
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-3.5 text-sm font-medium text-white transition hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-200"
              >
                Browse Articles <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/names/religion/islamic/1"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-3.5 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
              >
                <BookOpen className="h-4 w-4" /> Explore Names
              </Link>
            </div>
          </div>

          {/* Right Side - Stats Panel */}
          <div className="w-full max-w-sm flex-shrink-0 lg:max-w-md">
            <div className="relative rounded-2xl bg-white/80 p-6 shadow-xl ring-1 ring-gray-200/50 backdrop-blur-sm lg:p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">60K+</p>
                  <p className="text-sm text-gray-500">Name meanings</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">50+</p>
                  <p className="text-sm text-gray-500">Expert guides</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">100%</p>
                  <p className="text-sm text-gray-500">Free access</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">4.9★</p>
                  <p className="text-sm text-gray-500">Parent rating</p>
                </div>
              </div>

              {/* Trending Names */}
              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-gray-700">Trending now:</span>
                  <span className="text-gray-600">Rayan, Noor, Zara, Elias</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────

function SectionHeader({ label, title, description, actionText, actionHref }) {
  return (
    <div className="mb-12">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          {label && (
            <span className="text-sm font-medium uppercase tracking-wider text-blue-600">
              {label}
            </span>
          )}
          <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
          {description && (
            <p className="mt-3 max-w-2xl text-lg text-gray-600">{description}</p>
          )}
        </div>
        {actionText && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-800 whitespace-nowrap"
          >
            {actionText} <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="mt-4 h-0.5 w-16 bg-gradient-to-r from-blue-600 to-indigo-600" />
    </div>
  );
}

// ─── FEATURE ARTICLE ─────────────────────────────────────────────────────

function FeatureArticle({ post, isFirst = false }) {
  const imageUrl = post.featuredImage
    ? post.featuredImage.startsWith('http')
      ? post.featuredImage
      : `${getSiteUrl()}${post.featuredImage}`
    : `${getSiteUrl()}/api/og?title=${encodeURIComponent(post.title)}`;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl bg-white transition-all ${
        isFirst ? 'lg:col-span-2 lg:row-span-2' : ''
      }`}
    >
      <div className="relative h-64 overflow-hidden lg:h-full">
        <BlogImageWithFallback
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          containerClassName="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900 backdrop-blur">
            {post.category}
          </span>
          {post.featured && (
            <span className="rounded-full bg-amber-500/90 px-3 py-1 text-xs font-medium text-white backdrop-blur">
              Featured
            </span>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 p-6 text-white">
        <div className="flex items-center gap-3 text-xs text-white/80">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" /> {post.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.readTime}
          </span>
        </div>
        <h3 className="mt-3 text-xl font-bold leading-tight group-hover:text-blue-200 transition-colors lg:text-2xl">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/80">{post.excerpt}</p>
        <Link
          href={`/blog/${post.id}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
        >
          Read article <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

// ─── ARTICLE CARD ────────────────────────────────────────────────────────

function ArticleCard({ post }) {
  const imageUrl = post.featuredImage
    ? post.featuredImage.startsWith('http')
      ? post.featuredImage
      : `${getSiteUrl()}${post.featuredImage}`
    : `${getSiteUrl()}/api/og?title=${encodeURIComponent(post.title)}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-48 overflow-hidden">
        <BlogImageWithFallback
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          containerClassName="h-full w-full"
        />
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur">
            {post.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" /> {post.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.readTime}
          </span>
        </div>
        <h3 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 line-clamp-2">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.id}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-800"
        >
          Read more <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

// ─── CATEGORY NAV CARD ───────────────────────────────────────────────────

function CategoryNavCard({ href, title, description, icon: Icon, color = 'blue', count }) {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100/50 border-blue-200 hover:border-blue-300',
    indigo: 'from-indigo-50 to-indigo-100/50 border-indigo-200 hover:border-indigo-300',
    pink: 'from-pink-50 to-pink-100/50 border-pink-200 hover:border-pink-300',
    purple: 'from-purple-50 to-purple-100/50 border-purple-200 hover:border-purple-300',
    amber: 'from-amber-50 to-amber-100/50 border-amber-200 hover:border-amber-300',
    emerald: 'from-emerald-50 to-emerald-100/50 border-emerald-200 hover:border-emerald-300',
  };

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${colorClasses[color]}`}
    >
      <div className="relative">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/60 text-gray-700">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
        {count && (
          <p className="mt-3 text-sm font-medium text-gray-500">{count} names</p>
        )}
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
          Explore <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

// ─── FAQ ITEM ─────────────────────────────────────────────────────────────

function FaqItem({ question, answer, index }) {
  return (
    <details className="group border-b border-gray-200 transition last:border-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-5 text-base font-semibold text-gray-900 transition hover:text-blue-600">
        <span className="flex-1">{question}</span>
        <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-gray-600">{answer}</div>
    </details>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────

export default function BlogPage() {
  const featuredPosts = blogPosts.filter((p) => p.featured);
  const recentPosts = blogPosts.filter((p) => !p.featured);

  return (
    <SitePage
      className="bg-white"
      containerClassName="max-w-none px-0 py-0"
      showShare
      showBookmark
      pageUrl={`${getSiteUrl()}/blog`}
      pageTitle="Baby Names Blog & Expert Guides"
    >
      <StructuredData
        organization={true}
        website={true}
        breadcrumbs={[
          { name: 'Home', url: getSiteUrl() },
          { name: 'Blog', url: `${getSiteUrl()}/blog` },
        ]}
        collectionPage={blogCollection}
        faq={blogFaq}
      />

      {/* ─── HERO ─── */}
      <BlogHero />

      {/* ─── FEATURED ARTICLES ─── */}
      <section className="bg-gray-50/50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Editor's Picks"
            title="Featured Articles"
            description="Handpicked guides and insights from our editorial team"
            actionText="View all"
            actionHref="#articles"
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:grid-rows-2">
            {featuredPosts.slice(0, 3).map((post, index) => (
              <FeatureArticle key={post.id} post={post} isFirst={index === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORY NAVIGATION ─── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Browse by Tradition"
            title="Find Names from Every Culture"
            description="Explore curated collections for Islamic, Christian, and Hindu naming traditions"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <CategoryNavCard
              href="/islamic/boy-names"
              title="Islamic Boy Names"
              description="Explore Quranic, Arabic, and modern Muslim boy names with meaning and pronunciation."
              icon={BookOpen}
              color="indigo"
              count="150+"
            />
            <CategoryNavCard
              href="/islamic/girl-names"
              title="Islamic Girl Names"
              description="Discover meaningful Islamic girl names with cultural context and modern appeal."
              icon={Heart}
              color="pink"
              count="200+"
            />
            <CategoryNavCard
              href="/christian/boy-names"
              title="Christian Boy Names"
              description="Browse biblical and contemporary Christian boy names with strong spiritual meaning."
              icon={Shield}
              color="blue"
              count="100+"
            />
            <CategoryNavCard
              href="/christian/girl-names"
              title="Christian Girl Names"
              description="Find popular and timeless Christian girl names that honor faith and family heritage."
              icon={Star}
              color="purple"
              count="100+"
            />
            <CategoryNavCard
              href="/hindu/boy-names"
              title="Hindu Boy Names"
              description="Explore Sanskrit, Vedic, and devotional boy names for modern Hindu families."
              icon={Globe}
              color="amber"
              count="120+"
            />
            <CategoryNavCard
              href="/hindu/girl-names"
              title="Hindu Girl Names"
              description="Discover beautiful Hindu girl names with meanings rooted in myth, nature, and virtue."
              icon={Sparkles}
              color="emerald"
              count="150+"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <CategoryNavCard
              href="/names/religion/islamic/1"
              title="All Islamic Names"
              description="Browse the complete Islamic names collection, paginated and searchable."
              icon={Grid3x3}
              color="indigo"
            />
            <CategoryNavCard
              href="/names/religion/christian/1"
              title="All Christian Names"
              description="Access the full Christian names directory with meanings and origins."
              icon={Grid3x3}
              color="blue"
            />
            <CategoryNavCard
              href="/names/religion/hindu/1"
              title="All Hindu Names"
              description="Explore the full Hindu names collection, searchable by origin and gender."
              icon={Grid3x3}
              color="amber"
            />
          </div>
        </div>
      </section>

      <NativeBanner className="my-8" minHeight="90px" instanceId="blog-index-1" />

      {/* ─── ALL ARTICLES ─── */}
      <section id="articles" className="bg-gray-50/50 px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            label="Latest Insights"
            title="All Articles"
            description="Explore our complete library of naming guides and expert advice"
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <ArticleCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <NativeBanner className="my-8" minHeight="90px" instanceId="blog-index-2" />

      {/* ─── FAQ ─── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-blue-600">
              Help Center
            </span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Everything you need to know about choosing the perfect baby name
            </p>
          </div>

          <div className="mt-10 rounded-2xl border border-gray-200 bg-white px-6">
            {blogFaq.map((item, index) => (
              <FaqItem key={index} question={item.question} answer={item.answer} index={index} />
            ))}
          </div>
        </div>
      </section>

      <NativeBanner className="my-8" minHeight="90px" instanceId="blog-index-3" />

      {/* ─── CTA ─── */}
      <section className="px-4 pb-20">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 px-8 py-16 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-10 [background:radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.3),transparent_50%),radial-gradient(circle_at_80%_70%,rgba(139,92,246,0.2),transparent_50%)]" />
          <div className="relative">
            <Heart className="mx-auto mb-4 h-12 w-12 text-blue-400" />
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Find the Perfect Name?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
              Explore our database of 60,000+ baby names with detailed meanings,
              origins, and cultural context.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/names/religion/islamic/1"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-100 hover:shadow-lg"
              >
                <BookOpen className="h-4 w-4" /> Browse All Names
              </Link>
              <Link
                href="#articles"
                className="inline-flex items-center gap-2 rounded-full border border-gray-600 px-8 py-3.5 text-sm font-medium text-white transition hover:border-gray-400 hover:bg-gray-700"
              >
                Explore Guides <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SitePage>
  );
}