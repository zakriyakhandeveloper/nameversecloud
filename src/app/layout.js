import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import AppInstallPopup from "./install";
import { Fraunces, Inter } from 'next/font/google';
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";
import ResourceHints from "@/components/Performance/ResourceHints";
import StructuredData from "@/components/SEO/StructuredData";
import GoogleBotMeta from "@/components/SEO/GoogleBotMeta";
import { validateMetaTitle, validateMetaDescription } from '@/lib/seo/meta-helpers';
import { AppProvider } from "@/contexts/AppContext";
import LoadingWrapper from "@/components/LoadingAnimation/LoadingWrapper";
import { Suspense } from 'react';
import Script from 'next/script';
import RouteChrome from "@/components/Layout/RouteChrome";
import NativeAdScript from "@/components/Ads/NativeAdScript";
import NativeBarAd from "@/components/Ads/NativeBarAd";

// Dedicated Revolthem container id for the top-of-page native bar (below the
// navbar, every page). Distinct from the mid-page banner (container-1606e…)
// so there is no duplicate-id collision. Its invoke.js is loaded in
// NativeAdScript.jsx. The id MUST exactly match the dashboard container.
const TOP_NATIVE_BAR_CONTAINER_ID = "container-c90e1cf06dc7451f1fd3d33c703af951";

import { getSiteUrl } from '@/lib/seo/site';

const siteUrl = getSiteUrl();

const displayFont = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700'],
  display: 'swap',
  preload: true,
});

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
});

export const metadata = {
  title: {
    default: validateMetaTitle("Baby Names, Meanings, Origins & Lucky Numbers | NameVerse"),
    template: "%s | NameVerse"
  },
  description: validateMetaDescription(
    "Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions. Trusted by parents worldwide."
  ),
  keywords:
    "baby names, baby names 2026, islamic baby names, hindu baby names, christian baby names, quranic names, biblical names, sanskrit names, muslim baby names, baby name meanings, lucky numbers, baby name generator, name suggestions, trending baby names 2026, baby names with meanings, unique baby names, popular baby names, arabic names, urdu names",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  authors: [{ name: "NameVerse Editorial Team", url: `${siteUrl}/about` }],
  creator: "NameVerse",
  publisher: "NameVerse",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: validateMetaTitle("Baby Names, Meanings, Origins & Lucky Numbers | NameVerse"),
    description: validateMetaDescription(
      "Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions."
    ),
    url: siteUrl,
    siteName: "NameVerse",
    images: [
      { 
        url: `/og-home.png`, 
        width: 1200, 
        height: 630, 
        type: "image/png", 
        alt: "NameVerse — Baby Names with Meanings, Origins & Lucky Numbers" 
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: validateMetaTitle("Baby Names, Meanings, Origins & Lucky Numbers | NameVerse"),
    description: validateMetaDescription(
      "Discover baby names with verified meanings, origins, lucky numbers, pronunciation guides, and cultural context across Islamic, Hindu, Christian and global traditions."
    ),
    images: [`/og-home.png`],
    creator: "@NameVerseOfficial",
    site: "@NameVerseOfficial",
  },
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/logo.svg',
    apple: [
      { url: '/logo.svg', type: 'image/svg+xml', sizes: '180x180' },
    ],
  },
  manifest: `/manifest.json`,
  category: "Baby Names, Culture, Religion",
  classification: "Baby Name Dictionary & Cultural Knowledge Base",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1E3A5F",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="application-name" content="NameVerse" />
        <meta property="og:site_name" content="NameVerse" />
        <meta name="content-language" content="en" />
        <meta name="theme-color" content="#1E3A5F" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="google-site-verification" content="iPU1wdP26kg58gDN3U4H39YuS20alsLvjfXRM-QtKLw" />
        <meta name="google-site-verification" content="YpyQkTA9hX2f0MgD5oN8mVvssqJOD4L96gJn2yRzc3k" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="NameVerse" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="msapplication-TileColor" content="#1E3A5F" />
        <meta name="msapplication-TileImage" content="/logo.svg" />
        <link rel="apple-touch-icon" href="/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="ahrefs-site-verification" content="650afaf6635223ff618a281883a22b69b937a121e933b19907debeca67754cd4" />
        <meta name="415fb3e376dd03499e3ea3cfd086272b2330a942" content="415fb3e376dd03499e3ea3cfd086272b2330a942" />
        <meta name="p:domain_verify" content="2182ce49319a6b4ede3da073a469ce4a" />

        <ResourceHints />

        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <link rel="shortcut icon" type="image/svg+xml" href="/logo.svg" />

        <GoogleBotMeta siteUrl={siteUrl} />

        <StructuredData
          organization={true}
          website={true}
          breadcrumbs={[
            { name: "Home", url: siteUrl },
            { name: "Baby Names", url: `/names` },
          ]}
          collectionPage={{
            name: "Popular Baby Names by Religion",
            description: "Browse top baby names from different faiths — Muslim, Hindu, and Christian — with meanings and translations.",
            url: `/names`,
            items: [],
          }}
        />
      </head>

      <body className={`${bodyFont.variable} ${displayFont.variable} antialiased nv-body nv-page`}>
        <div id="temp-wrapper">
          <AppProvider>
            <Suspense fallback={<div>Loading Navbar...</div>}>
              <Navbar />
            </Suspense>

            <NativeAdScript />

            {/* PAGE-TOP NATIVE BAR — directly below navbar, on every page.
                Uses the REAL Revolthem container id (same one the invoke.js
                script targets) with a reserved-height (.native-bar) wrapper so
                there is zero layout shift. Desktop/mobile variants are toggled
                by CSS; the Revolthem script serves the correct creative. */}
            <NativeBarAd
              variant="mobile"
              containerId={TOP_NATIVE_BAR_CONTAINER_ID}
              className="pt-3"
            />
            <NativeBarAd
              variant="desktop"
              containerId={TOP_NATIVE_BAR_CONTAINER_ID}
              className="pt-3"
            />

            {/* DESKTOP 4:1 AD — Desktop only */}
            <div id="container-desktop-4x1" className="hidden lg:block" />

            <RouteChrome>{children}</RouteChrome>

            <Footer />
            <AppInstallPopup />

            <Script
              id="adsbygoogle"
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1510675468129183"
              strategy="afterInteractive"
            />

          </AppProvider>
        </div>
      </body>
    </html>
  );
}
