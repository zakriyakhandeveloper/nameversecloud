import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, CheckCircle, Clock, Calendar, Share2, Bookmark } from 'lucide-react';

export default function SitePage({
  title,
  subtitle,
  breadcrumbs,
  actions,
  className,
  containerClassName,
  headerClassName,
  children,
  showReadingProgress = false,
  readingProgress = 0,
  showShare = false,
  showBookmark = false,
  pageUrl = '',
  pageTitle = '',
}) {
  return (
    <main className={cn('nv-page min-h-screen bg-white', className)}>
      {/* Reading Progress Bar */}
      {showReadingProgress && (
        <div className="fixed top-0 left-0 z-50 h-1 w-full bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
            style={{ width: `${readingProgress}%` }}
            role="progressbar"
            aria-valuenow={readingProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      <div className={cn('nv-container nv-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6', containerClassName)}>
        {/* Breadcrumbs with enhanced styling */}
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              {breadcrumbs.map((item, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <li key={`${item.href || item.label}-${idx}`} className="flex items-center gap-2">
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="font-medium text-gray-600 transition-colors hover:text-gray-900 hover:underline"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className={cn('font-medium', isLast ? 'text-gray-900' : 'text-gray-600')}>
                        {item.label}
                      </span>
                    )}
                    {!isLast && <span className="text-gray-300">/</span>}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* Header with enhanced actions */}
        {(title || subtitle || actions || showShare || showBookmark) && (
          <header
            className={cn(
              'mb-10 flex flex-col gap-6 sm:mb-12',
              headerClassName
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-3xl flex-1">
                {title && (
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="mt-4 text-lg leading-relaxed text-gray-600 sm:text-xl">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Header Actions */}
              <div className="flex shrink-0 items-center gap-3">
                {showBookmark && (
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                    aria-label="Bookmark this article"
                  >
                    <Bookmark className="h-5 w-5" />
                  </button>
                )}
                {showShare && pageUrl && (
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                    aria-label="Share this article"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                )}
                {actions && <div className="shrink-0">{actions}</div>}
              </div>
            </div>
          </header>
        )}

        {children}
      </div>
    </main>
  );
}