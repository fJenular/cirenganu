"use client";

import React from "react";
import { Moon, Clock, ShoppingBag, CalendarDays, ArrowRight } from "lucide-react";

interface Props {
  openingHours?: string;
  onPreOrder: () => void;
}

export default function StoreClosedBanner({ openingHours, onPreOrder }: Props) {
  // Get tomorrow's date label
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowLabel = tomorrow.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  return (
    <div className="mx-4 mb-4 overflow-hidden rounded-3xl border border-neutral-800/80 shadow-2xl animate-store-open-reveal">
      {/* Dark header with shutter visual */}
      <div className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-5 pt-6 pb-5 text-white overflow-hidden">
        {/* Decorative horizontal stripes (shutter look) */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-10">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="w-full border-b border-white/40"
              style={{ height: "10%" }}
            />
          ))}
        </div>

        {/* Neon closed sign effect */}
        <div className="relative z-10 flex flex-col items-center gap-3 text-center">
          {/* Moon icon pulsing */}
          <div className="w-14 h-14 rounded-full bg-neutral-700/80 border border-neutral-600 flex items-center justify-center shadow-[0_0_24px_rgba(239,68,68,0.35)] animate-sign-flash">
            <Moon className="w-7 h-7 text-red-400" />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-white">
              🔒 Toko Sedang Tutup
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 font-medium">
              Maaf, kami belum bisa menerima pesanan saat ini.
            </p>
          </div>

          {openingHours && (
            <div className="flex items-center gap-1.5 bg-neutral-700/60 border border-neutral-600/60 px-3 py-1.5 rounded-full text-xs text-neutral-300 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Buka: {openingHours}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pre-order CTA section */}
      <div className="bg-white px-5 py-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-black text-neutral-900">
              Pesan untuk Besok (Pre-Order)
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
              Kamu tetap bisa memesan sekarang dan pesananmu akan diproses besok —{" "}
              <span className="font-bold text-amber-700">{tomorrowLabel}</span>.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-pre-order"
          onClick={onPreOrder}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.98] text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Ya, Saya Mau Pre-Order untuk Besok</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[10px] text-neutral-400 text-center">
          Pesananmu akan ditandai sebagai <span className="font-bold text-amber-600">📦 PO – Besok</span> dan kami akan konfirmasi via WhatsApp.
        </p>
      </div>
    </div>
  );
}
