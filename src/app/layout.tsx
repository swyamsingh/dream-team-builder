import './globals.css';
import React from 'react';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { ListsProvider } from '../components/shortlists/useLists';
import type { Metadata } from 'next';
import { ThemeProvider } from '../components/ui/theme-provider';
import { CompareProvider } from '../components/compare/CompareContext';
import { GenomeCacheProvider } from '../components/genome/GenomeCacheContext';
import ComparePanel from '../components/compare/ComparePanel';
import { ToastProvider, ToastViewport, ToastOutlet } from '../components/ui/toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const display = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Dream Team Builder – Real-time People Genome Explorer',
  description: 'Discover talent, open genome-style profiles, compare strengths and curate shortlists. Experimental talent intelligence UI.',
  metadataBase: new URL('https://talent-radar.example.com'),
  icons: {
    icon: '/favicon.svg'
  },
  openGraph: {
    title: 'Dream Team Builder',
    description: 'Stream people/org discovery with genome insights & comparison.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Dream Team Builder' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dream Team Builder',
    description: 'Discover talent, view strengths radar & build shortlists.',
    images: ['/og.png']
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
        <ThemeProvider>
          <ToastProvider swipeDirection="right" duration={3500}>
          <main className="max-w-5xl mx-auto p-6 space-y-8">
            <header className="flex flex-col items-center text-center gap-4 pt-4">
              <a href="/" className="group relative inline-flex flex-col items-center gap-3">
                <div className="relative">
                  <svg width="54" height="54" viewBox="0 0 64 64" className="drop-shadow-[0_0_12px_rgba(168,85,247,0.35)]">
                    <defs>
                      <linearGradient id="grad" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#grad)" className="animate-pulse" />
                    <path d="M20 42c6 2 10-2 12-10 2 8 6 12 12 10" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" className="origin-center animate-[pulse_3s_ease-in-out_infinite]" />
                    <circle cx="32" cy="24" r="5" fill="#fff" className="animate-[ping_2.8s_linear_infinite]" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-4xl font-semibold font-display tracking-tight bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">Dream Team Builder</h1>
                  <p className="text-sm text-neutral-400 max-w-lg mx-auto">Streaming talent search · genome-strength radar · shortlist curation · side-by-side comparison.</p>
                </div>
              </a>
            </header>
            <GenomeCacheProvider>
              <CompareProvider>
                <ListsProvider>
                  {children}
                </ListsProvider>
                <ComparePanel />
              </CompareProvider>
            </GenomeCacheProvider>
            <footer className="pt-12 text-xs text-neutral-500">Prototype – not affiliated with Torre.</footer>
            <ToastViewport />
            <ToastOutlet />
          </main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
