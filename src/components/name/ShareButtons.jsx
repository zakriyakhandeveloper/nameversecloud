"use client";

import { useState } from 'react';
import { Copy, MessageCircle, Check } from 'lucide-react';

/**
 * ShareButtons — Minimal, premium social sharing
 *
 * Brand colors are used only for the icon (authentic recognition).
 * Copy action uses the page's own "social" token and flips to a success state.
 */

const FacebookIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M22.46 6c-.77.35-1.6.59-2.46.69a4.28 4.28 0 0 0 1.88-2.36 8.57 8.57 0 0 1-2.72 1.04 4.26 4.26 0 0 0-7.27 3.88A12.08 12.08 0 0 1 3.16 4.5a4.26 4.26 0 0 0 1.32 5.69 4.24 4.24 0 0 1-1.93-.53v.05a4.26 4.26 0 0 0 3.42 4.17 4.3 4.3 0 0 1-1.92.07 4.26 4.26 0 0 0 3.98 2.96A8.54 8.54 0 0 1 2 19.54a12.05 12.05 0 0 0 6.52 1.91c7.83 0 12.11-6.49 12.11-12.11 0-.18-.01-.36-.02-.54A8.66 8.66 0 0 0 24 5.56a8.45 8.45 0 0 1-2.54.7z" />
  </svg>
);

const shareLinks = {
  facebook: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  whatsapp: (text, url) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
};

const PLATFORM_STYLE = {
  facebook: { icon: '#1877F2', hoverBorder: 'hover:border-[#1877F2]/30' },
  twitter: { icon: '#1DA1F2', hoverBorder: 'hover:border-[#1DA1F2]/30' },
  whatsapp: { icon: '#25D366', hoverBorder: 'hover:border-[#25D366]/30' },
};

function ShareButton({ platform, icon: Icon, label, onClick }) {
  const style = PLATFORM_STYLE[platform];
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-full border border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] px-4 py-2.5 text-sm font-medium text-[color:var(--nv-ink)] transition hover:-translate-y-0.5 hover:shadow-sm ${style.hoverBorder}`}
      aria-label={`Share on ${label}`}
    >
      <Icon className="h-4 w-4" style={{ color: style.icon }} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function ShareButtons({ name, pageUrl, description }) {
  const [copied, setCopied] = useState(false);
  const shareText = description || `Discover the meaning, origin, and lucky details of ${name}.`;

  const handleShare = (platform) => {
    if (!pageUrl) return;

    if (platform === 'copy') {
      navigator.clipboard.writeText(pageUrl).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      });
      return;
    }

    const url = shareLinks[platform];
    if (!url) return;

    const shareUrl = platform === 'facebook'
      ? url(pageUrl)
      : url(shareText, pageUrl);

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[color:var(--nv-muted)]">
        Share this name
      </div>
      <div className="flex flex-wrap gap-2">
        <ShareButton platform="facebook" icon={FacebookIcon} label="Facebook" onClick={() => handleShare('facebook')} />
        <ShareButton platform="twitter" icon={TwitterIcon} label="Twitter" onClick={() => handleShare('twitter')} />
        <ShareButton platform="whatsapp" icon={MessageCircle} label="WhatsApp" onClick={() => handleShare('whatsapp')} />
        <button
          onClick={() => handleShare('copy')}
          className={`flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:shadow-sm ${
            copied
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-[color:var(--nv-border)] bg-[color:var(--nv-surface)] text-[color:var(--nv-ink)] hover:border-[color:var(--nv-accent-5)]/30'
          }`}
          aria-label="Copy page link"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" /> <span className="hidden sm:inline">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-[color:var(--nv-accent-5)]" /> <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}