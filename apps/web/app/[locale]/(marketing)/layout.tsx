'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [enrollOpen, setEnrollOpen] = useState(false);

  return (
    <>
      <Header onEnroll={() => setEnrollOpen(true)} />
      <main className="min-h-screen pt-16 lg:pt-20">
        {children}
      </main>
      <Footer />

      {/* Enroll Modal placeholder — will be built in Phase 5 */}
      {enrollOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setEnrollOpen(false)}
        >
          <div
            className="bg-card rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-heading text-2xl font-bold mb-2">Kursa Yazıl</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Bu funksiya tezliklə əlavə ediləcək.
            </p>
            <button
              onClick={() => setEnrollOpen(false)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Bağla
            </button>
          </div>
        </div>
      )}
    </>
  );
}
