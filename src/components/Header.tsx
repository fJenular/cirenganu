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
    <header className="bg-white px-5 pt-8 pb-5">
      {/* Hero greeting — Caacupé One font */}
      <div>
        <h1
          style={{ fontFamily: "'Caacupe One', sans-serif" }}
          className="text-[32px] leading-tight text-neutral-900"
        >
          Mau pesan{" "}
          <span className="text-red-600">apa</span>? 🔥
        </h1>
        <p className="text-[13px] text-neutral-400 font-medium mt-1.5">
          Pilih menu untuk pre‑order sekarang
        </p>
      </div>
    </header>
  );
}

