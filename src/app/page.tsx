import React from 'react';
import { SearchShell } from '../components/search';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Torre Talent Radar</h1>
          <p className="text-sm text-muted-subtle max-w-2xl">Stream people or organization results in real time, open profiles for genome data, and curate shortlists locally. (Early MVP build)</p>
        </div>
        <nav className="flex gap-3 text-xs">
          <a className="rounded-md bg-surfaceAlt px-3 py-1.5 border border-border/60" href="#lists">Lists</a>
        </nav>
      </header>
  <SearchShell />
    </main>
  );
}
