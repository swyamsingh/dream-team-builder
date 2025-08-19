import './globals.css';
import React from 'react';
import { ListsProvider } from '../components/shortlists/useLists';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Torre Talent Radar',
  description: 'Real-time streaming people/org discovery + genome insights + shortlists.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <main className="max-w-5xl mx-auto p-6 space-y-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold">Torre Talent Radar</h1>
            <p className="text-sm text-neutral-400">Streaming Torre people/org search • genome profiles • curated shortlists.</p>
          </header>
          <ListsProvider>
            {children}
          </ListsProvider>
          <footer className="pt-12 text-xs text-neutral-500">Prototype – not affiliated with Torre.</footer>
        </main>
      </body>
    </html>
  );
}
