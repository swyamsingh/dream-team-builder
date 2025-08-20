"use client";
import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Floating information button + dialog that explains app usage.
 * Small, visible, gently animated (slow pulse) but not intrusive.
 */
export function InfoHelp() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="How to use Dream Team Builder"
          className="group relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-surface/80 backdrop-blur text-neutral-300 hover:text-neutral-50 hover:border-border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <HelpCircle className="h-5 w-5 animate-[pulse_6s_ease-in-out_infinite] group-hover:animate-none" />
          <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-800 px-2 py-0.5 text-[10px] font-medium text-neutral-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">How it works</span>
        </button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              {/* Wrapper flex centers the panel even if transforms on ancestors exist */}
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  role="dialog"
                  aria-describedby="info-help-body"
                  aria-modal="true"
                  className="w-[min(96vw,720px)] max-h-[82vh] overflow-hidden rounded-xl border border-border/60 bg-neutral-900/95 shadow-2xl ring-1 ring-black/40 focus:outline-none backdrop-blur-lg"
                  initial={{ y: 28, opacity: 0, scale: 0.97 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 16, opacity: 0, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 26, mass: 0.7 }}
                >
                  <div className="p-6 overflow-y-auto max-h-[82vh] custom-scrollbar">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <Dialog.Title className="text-lg font-semibold bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-indigo-300 bg-clip-text text-transparent">How to Use Dream Team Builder</Dialog.Title>
                  <Dialog.Close asChild>
                    <button aria-label="Close help" className="rounded-md p-1 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/40 focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <X className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>
                <div id="info-help-body" className="space-y-5 text-sm leading-relaxed text-neutral-300">
                  <section>
                    <h3 className="text-xs uppercase tracking-wide text-neutral-400 mb-1">1. Stream Search</h3>
                    <p>Enter a name or keyword, pick People or Orgs, adjust filters (location hint, remote, min compensation, limit) then press <span className="font-medium text-neutral-200">Stream</span>. Results arrive live via Server‑Sent Events.</p>
                  </section>
                  <section>
                    <h3 className="text-xs uppercase tracking-wide text-neutral-400 mb-1">2. Profiles & Genome</h3>
                    <p>Click a card to open the profile drawer with overview, strengths radar/bars, roles, education, languages. First few genomes are prefetched in the background for instant open.</p>
                  </section>
                  <section>
                    <h3 className="text-xs uppercase tracking-wide text-neutral-400 mb-1">3. Shortlists</h3>
                    <p>Use the bookmark icon on a card to add/remove from the active shortlist. Manage multiple lists in the side panel (bottom area).</p>
                  </section>
                  <section>
                    <h3 className="text-xs uppercase tracking-wide text-neutral-400 mb-1">4. Compare</h3>
                    <p>Pin up to three profiles using the compare (square check) icon. Open the comparison drawer (bottom) to see shared vs unique strengths with avatars.</p>
                  </section>
                  <section>
                    <h3 className="text-xs uppercase tracking-wide text-neutral-400 mb-1">5. Privacy & Source</h3>
                    <p>Data proxied from public Torre endpoints. No personal data stored; everything lives in session memory.</p>
                  </section>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-fg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50">Got it</button>
                  </Dialog.Close>
                </div>
                  </div>
                </motion.div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default InfoHelp;
