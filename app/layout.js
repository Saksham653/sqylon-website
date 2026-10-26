import localFont from 'next/font/local';
import { SITE } from '@/lib/site';
import './globals.css';

// Self-hosted (Latin subsets from Google Fonts), so builds never depend on a font CDN.
const geist = localFont({ src: './fonts/geist-latin.woff2', weight: '300 800', variable: '--font-geist', display: 'swap' });
const geistMono = localFont({ src: './fonts/geist-mono-latin.woff2', weight: '400 500', variable: '--font-geist-mono', display: 'swap' });
const serif = localFont({
  src: [
    { path: './fonts/instrument-serif-latin.woff2', weight: '400', style: 'normal' },
    { path: './fonts/instrument-serif-italic-latin.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  authors: [{ name: 'Shivam Jha' }, { name: 'Saksham Srivastava' }],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  icons: { icon: '/favicon.svg', apple: '/assets/icon-180.png' },
  openGraph: {
    type: 'website', siteName: SITE.name, url: '/',
    title: 'Sqaron Technologies — Design that sells. Code that scales.',
    description: 'Shivam Jha and Saksham Srivastava design and build websites, mobile apps, SaaS and AI agents, end to end.',
    images: [{ url: '/assets/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sqaron Technologies — Design that sells. Code that scales.',
    description: 'A two-founder product studio from India: websites, apps, SaaS and AI agents.',
    images: ['/assets/og.png'],
  },
};

export const viewport = { themeColor: '#07080B', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
