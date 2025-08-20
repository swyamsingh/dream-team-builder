import React from 'react';
import { SearchShell } from '../components/search';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-8">
      <SearchShell />
    </main>
  );
}
