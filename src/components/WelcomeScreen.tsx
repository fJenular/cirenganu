"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Flame
} from "lucide-react";

interface Props {
  onStartOrder: () => void;
}

export default function WelcomeScreen({ onStartOrder }: Props) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0070df] flex flex-col justify-between overflow-hidden text-white select-none">
      
      {/* Background Poster Image — Cinematic zoom-in & fade-in entrance */}
      <div
        className={`absolute inset-0 z-0 overflow-hidden bg-[#0070df] transition-all duration-1000 ease-out ${
          isMounted ? "opacity-100 scale-100" : "opacity-0 scale-105"
        }`}
      >
        <Image
          src="/onboarding-cover.png"
          alt="Cireng Ayam & Keju - Cireng Anu"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 450px"
          className="object-cover object-top translate-y-12 sm:translate-y-9"
        />
        {/* Subtle gradient overlay for top status & bottom readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Top Status & Brand Bar — Slide Down Entrance */}
      <div
        className={`relative z-10 flex items-center justify-between p-5 pt-6 transition-all duration-700 delay-150 ease-out ${
          isMounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-6"
        }`}
      >
        {/* Brand Logo */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-1.5 py-1.5 rounded-full border border-white/60 shadow-sm hover:scale-105 transition-transform">
          <div className="relative w-6 h-6 rounded-full overflow-hidden border border-red-500">
            <Image src="/logo.jpg" alt="Logo" fill sizes="24px" className="object-cover" />
          </div>
        </div>

        {/* Order Online Tag with flame pulse */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-md shadow-red-600/30 hover:shadow-red-600/50 transition-shadow">
          <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse" />
          <span className="tracking-wide">ORDER ONLINE & FRESH</span>
        </div>
      </div>

      {/* Spacer to push card to bottom */}
      <div className="flex-1" />

      {/* BOTTOM PORTION: WHITE CARD — Slide Up from bottom with smooth iOS curve */}
      <div
        className={`relative z-15 bg-white backdrop-blur-md px-6 pt-5 pb-8 flex flex-col justify-between space-y-5 rounded-t-[32px] sm:rounded-t-[36px] shadow-[0_-16px_48px_rgba(0,0,0,0.22)] border-t border-white/40 transition-all duration-700 delay-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMounted ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
      >
        {/* Subtle decorative drag pill */}
        <div className="w-10 h-1 bg-neutral-200 rounded-full mx-auto" />

        {/* Welcome Text — Staggered Fade Up */}
        <div className="text-center space-y-1.5">
          <h2
            className={`text-2xl font-black text-neutral-900 tracking-tight transition-all duration-600 delay-400 ease-out ${
              isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Selamat Datang di Cireng Anu
          </h2>
          <p
            className={`text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed transition-all duration-600 delay-550 ease-out ${
              isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
          >
            Pesan aneka camilan gurih khas Bandung secara praktis! Tersedia varian{" "}
            <strong className="text-neutral-900 font-bold">Siap Makan</strong> hangat &amp; kemasan{" "}
            <strong className="text-neutral-900 font-bold">Frozen</strong>.
          </p>
        </div>

        {/* CTA Button — Spring Pop-In with Light Shimmer Beam */}
        <div
          className={`transition-all duration-600 delay-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-95"
          }`}
        >
          <button
            type="button"
            onClick={onStartOrder}
            className="relative w-full overflow-hidden bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 active:scale-[0.98] text-white py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm shadow-lg shadow-neutral-900/25 flex items-center justify-between transition-all cursor-pointer group"
          >
            {/* Shimmer Light Beam Effect across button */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 animate-shimmer" />
            </div>

            <span className="tracking-wide text-white relative z-10 flex items-center gap-1.5">
              <span>Mulai Pesan (Order Now)</span>
            </span>

            <div className="relative z-10 w-7 h-7 rounded-full bg-white/15 group-hover:bg-red-600 group-hover:scale-105 active:scale-95 flex items-center justify-center transition-all">
              <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>

        {/* Small Bottom Info — Gentle Fade In */}
        <p
          className={`text-center text-[10px] text-neutral-400 font-medium transition-all duration-500 delay-850 ease-out ${
            isMounted ? "opacity-100" : "opacity-0"
          }`}
        >
          Format pemesanan otomatis terhubung ke WhatsApp Admin
        </p>
      </div>

    </div>
  );
}
