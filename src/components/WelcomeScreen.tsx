"use client";

import React from "react";
import Image from "next/image";
import {
  ArrowRight,
  Flame,
  Star,
  Clock,
  ShieldCheck,
  ChefHat
} from "lucide-react";

interface Props {
  onStartOrder: () => void;
}

export default function WelcomeScreen({ onStartOrder }: Props) {
  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-between overflow-hidden text-neutral-900 select-none">
      
      {/* TOP PORTION: CLEAN HERO VISUAL & TYPOGRAPHY */}
      <div className="relative flex-1 min-h-[52vh] flex flex-col justify-between p-6">
        {/* Background Image with subtle light overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=1000&auto=format&fit=crop&q=80"
            alt="Anu CiRENG Specialty"
            fill
            priority
            className="object-cover brightness-95"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
        </div>

        {/* Top Status & Brand Bar */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-200/80 shadow-sm">
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-red-500">
              <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
            </div>
            <span className="text-xs font-black text-neutral-900 tracking-tight">
              Anu <span className="text-red-600">CiRENG</span>
            </span>
          </div>

          {/* Pre-Order Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold shadow-xs">
            <Flame className="w-3.5 h-3.5 fill-white text-white" />
            <span>PRE-ORDER FRESH</span>
          </div>
        </div>

        {/* Hero Title over visual */}
        <div className="relative z-10 mt-auto pt-8 pb-3 space-y-1.5 text-white drop-shadow-md">
          <span className="text-[11px] font-bold tracking-widest uppercase bg-neutral-900/80 px-2.5 py-0.5 rounded-md text-amber-300 inline-block">
            ★ Cemilan Khas Bandung
          </span>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-white">
            Cireng Isi Lumer & Cimol Kuah
          </h1>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-white text-[11px] drop-shadow">4.9 / 5.0 (1.2k+ Ulasan)</span>
          </div>
        </div>
      </div>

      {/* BOTTOM PORTION: MODERN MINIMALISM WHITE CARD (Matching Screenshot Reference) */}
      <div className="relative z-20 bg-white px-6 pt-5 pb-8 flex flex-col justify-between space-y-5 border-t border-neutral-100">
        
        {/* Welcome Text */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Selamat Datang di Anu CiRENG
          </h2>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            Sistem <strong>Pre-Order (PO)</strong> harian. Setiap porsi dibuat fresh sesuai pesanan dengan kuota terbatas.
          </p>
        </div>

        {/* Minimalist 3 Highlights */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="bg-neutral-50 p-2.5 rounded-2xl text-center border border-neutral-200/60">
            <Clock className="w-4 h-4 text-red-600 mx-auto mb-1" />
            <p className="text-[10px] font-bold text-neutral-800">Fresh Daily</p>
            <p className="text-[9px] text-neutral-400">Dibuat Tiap Hari</p>
          </div>

          <div className="bg-neutral-50 p-2.5 rounded-2xl text-center border border-neutral-200/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
            <p className="text-[10px] font-bold text-neutral-800">Slot Terbatas</p>
            <p className="text-[9px] text-neutral-400">Amankan Kuota</p>
          </div>

          <div className="bg-neutral-50 p-2.5 rounded-2xl text-center border border-neutral-200/60">
            <ChefHat className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <p className="text-[10px] font-bold text-neutral-800">Bumbu Gurih</p>
            <p className="text-[9px] text-neutral-400">Bebas Varian</p>
          </div>
        </div>

        {/* Black Pill CTA Button (Matching Screenshot) */}
        <button
          type="button"
          onClick={onStartOrder}
          className="w-full bg-neutral-950 hover:bg-neutral-900 active:scale-[0.98] text-white py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm shadow-md flex items-center justify-between transition-all cursor-pointer group"
        >
          <span className="tracking-wide">Mulai Pesan (Order Now)</span>
          <div className="w-7 h-7 rounded-full bg-white/20 group-hover:bg-red-600 flex items-center justify-center transition-colors">
            <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Small Bottom Info */}
        <p className="text-center text-[10px] text-neutral-400 font-medium">
          Format pemesanan otomatis terhubung ke WhatsApp Admin
        </p>
      </div>

    </div>
  );
}
