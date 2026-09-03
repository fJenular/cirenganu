"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Smartphone, Monitor, Sparkles, ShieldCheck, PhoneCall } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export default function DesktopPhoneFrame({ children }: Props) {
  const [isDesktopFrameActive, setIsDesktopFrameActive] = useState(true);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-neutral-900 flex flex-col items-center justify-center relative overflow-x-hidden selection:bg-red-500 selection:text-white">
      {/* Background Info on Desktop View */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
        
        {/* Subtle Brand Watermark Pattern on Desktop */}
        <div className="absolute top-12 left-16 max-w-sm text-neutral-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-sm border border-neutral-200 relative bg-white">
              <Image src="/logo.jpg" alt="Anu Cireng Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tight text-neutral-900 flex items-center gap-1">
                Anu <span className="text-red-600">CiRENG</span>
              </h1>
              <p className="text-xs text-neutral-500 font-medium">Pre-Order Fresh Daily</p>
            </div>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed mt-3">
            Aplikasi pemesanan camilan khas Bandung. Sistem Pre-Order (PO) dengan kuota porsi harian terbatas, langsung terhubung ke WhatsApp.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 text-xs text-neutral-600">
            <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-neutral-200/80 shadow-2xs">
              <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
              <span>Dibuat Fresh Setiap Hari Sesuai Pesanan</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-neutral-200/80 shadow-2xs">
              <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Format Reservasi WhatsApp Otomatis</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-neutral-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Sistem Manajemen Cloud Supabase</span>
            </div>
          </div>
        </div>

        {/* View Switcher Floating Top Right */}
        <div className="absolute top-8 right-12 flex items-center gap-1.5 bg-white border border-neutral-200 p-1 rounded-full shadow-sm">
          <button
            onClick={() => setIsDesktopFrameActive(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              isDesktopFrameActive
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Tampilan HP</span>
          </button>
          <button
            onClick={() => setIsDesktopFrameActive(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              !isDesktopFrameActive
                ? "bg-neutral-900 text-white shadow-2xs"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Lebar</span>
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Frame on Desktop, 100% Full Width on Mobile */}
      <main
        className={`w-full transition-all duration-300 relative z-10 flex flex-col justify-center ${
          isDesktopFrameActive
            ? "md:max-w-[430px] md:my-6 md:h-[92vh] md:max-h-[920px] md:rounded-[40px] md:shadow-[0_20px_60px_rgba(0,0,0,0.15),0_0_0_10px_#FFFFFF,0_0_0_12px_#E5E7EB]"
            : "md:max-w-2xl md:my-6 md:min-h-[90vh] md:rounded-3xl md:shadow-xl"
        } bg-white text-neutral-900 overflow-hidden border border-neutral-200/60`}
      >
        {/* Smartphone Dynamic Island / Speaker Top Bar */}
        {isDesktopFrameActive && (
          <div className="hidden md:flex items-center justify-between px-7 pt-3 pb-1 bg-white border-b border-neutral-100 z-30 select-none">
            <span className="text-[11px] font-bold text-neutral-800 tracking-tight">09:41</span>
            <div className="w-20 h-3.5 bg-neutral-900 rounded-full flex items-center justify-center gap-2 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-neutral-800" />
            </div>
            <div className="flex items-center gap-1 text-neutral-800 text-[10px] font-bold">
              <span>5G</span>
              <div className="w-4 h-2 border border-neutral-700 rounded-xs p-0.5 flex items-center">
                <div className="w-full h-full bg-neutral-900 rounded-2xs" />
              </div>
            </div>
          </div>
        )}

        {/* The Screen Contents with smooth scrolling */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col no-scrollbar bg-white">
          {children}
        </div>
      </main>
    </div>
  );
}
