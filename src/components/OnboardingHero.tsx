"use client";

import React from "react";
import Image from "next/image";
import { ArrowDown, Flame, Award, Clock, Sparkles } from "lucide-react";

interface Props {
  onScrollToMenu: () => void;
}

export default function OnboardingHero({ onScrollToMenu }: Props) {
  return (
    <section className="bg-gradient-to-b from-white via-red-50/40 to-white px-5 pt-4 pb-6 border-b border-neutral-100">
      {/* Top Tag & Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300/60 text-amber-900 text-xs font-semibold shadow-xs">
          <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" />
          <span>Juaranya Cireng & Cemilan Gurih</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Buka Sekarang</span>
        </div>
      </div>

      {/* Hero Card with Mascot Logo */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-600 to-amber-600 rounded-3xl p-5 text-white shadow-xl shadow-red-600/20 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-white p-1 shadow-lg border-2 border-amber-300">
            <Image
              src="/logo.jpg"
              alt="Cireng Anu Mascot"
              fill
              priority
              sizes="80px"
              className="object-cover rounded-xl"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1 text-amber-200 text-xs font-bold uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cemilan Viral Mantap</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-none text-white drop-shadow-sm">
              Cireng <span className="text-amber-300">Anu</span>
            </h2>
            <p className="text-xs text-white/90 font-medium mt-1 leading-snug">
              Sensasi cireng crispy, cimol kuah keju lumer, dan dimsum premium favorit semua kalangan!
            </p>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
          <div className="bg-black/20 backdrop-blur-xs rounded-xl py-1.5 px-1">
            <p className="text-[10px] text-amber-200 font-medium">Isian</p>
            <p className="text-xs font-bold text-white">Lumer & Padat</p>
          </div>
          <div className="bg-black/20 backdrop-blur-xs rounded-xl py-1.5 px-1">
            <p className="text-[10px] text-amber-200 font-medium">Bumbu</p>
            <p className="text-xs font-bold text-white">Pedas Gurih</p>
          </div>
          <div className="bg-black/20 backdrop-blur-xs rounded-xl py-1.5 px-1">
            <p className="text-[10px] text-amber-200 font-medium">Pesan Cepat</p>
            <p className="text-xs font-bold text-white">Direct WA ?</p>
          </div>
        </div>
      </div>

      {/* Call to action button to scroll down */}
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={onScrollToMenu}
          className="w-full bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] text-white py-3.5 px-5 rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <span>Pilih & Pesan Menu Sekarang</span>
          <ArrowDown className="w-4 h-4 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
        </button>

        <p className="text-center text-[11px] text-neutral-500 font-medium">
          ?? Siap kirim & takeaway � Pembayaran QRIS / Tunai / Transfer
        </p>
      </div>
    </section>
  );
}
