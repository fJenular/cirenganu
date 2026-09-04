"use client";

import React from "react";

interface Props {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenInfo?: () => void;
}

export default function Header(_props: Props) {
  return (
    <header className="bg-white px-5 pt-8 pb-5 animate-fade-in-up">
      {/* Hero greeting — Caacupé One font */}
      <div>
        <h1
          style={{ fontFamily: "'Caacupe One', sans-serif" }}
          className="text-[32px] leading-tight text-neutral-900 tracking-tight"
        >
          Mau pesan{" "}
          <span className="text-red-600 inline-block hover:scale-105 transition-transform duration-200 cursor-default">
            apa
          </span>
          ? <span className="inline-block animate-pulse">🔥</span>
        </h1>
        <div className="flex items-center gap-2 mt-1.5 transition-all duration-300">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-emerald-200 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Buka</span>
          </span>
          <p className="text-[12px] text-neutral-500 font-medium">
            Pesan langsung, siap antar hangat &amp; fresh
          </p>
        </div>
      </div>
    </header>
  );
}

