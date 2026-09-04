"use client";

import React from "react";
import { Salad, Snowflake } from "lucide-react";

export type OrderVariant = "siap-makan" | "frozen";

interface Props {
  activeVariant: OrderVariant;
  onSelectVariant: (v: OrderVariant) => void;
}

const VARIANTS: {
  id: OrderVariant;
  label: string;
  emoji: string;
  icon: any;
  desc: string;
  activeClass: string;
  inactiveClass: string;
  iconActiveClass: string;
  iconInactiveClass: string;
}[] = [
  {
    id: "siap-makan",
    label: "Siap Makan",
    emoji: "🍽️",
    icon: Salad,
    desc: "Fresh & langsung makan",
    activeClass: "bg-red-600 text-white shadow-md shadow-red-200",
    inactiveClass:
      "bg-white text-neutral-600 border border-neutral-200 hover:border-red-200 hover:bg-red-50",
    iconActiveClass: "text-white",
    iconInactiveClass: "text-neutral-400",
  },
  {
    id: "frozen",
    label: "Frozen",
    emoji: "❄️",
    icon: Snowflake,
    desc: "Mentah beku, goreng sendiri",
    activeClass: "bg-sky-600 text-white shadow-md shadow-sky-200",
    inactiveClass:
      "bg-white text-neutral-600 border border-neutral-200 hover:border-sky-300 hover:bg-sky-50",
    iconActiveClass: "text-white",
    iconInactiveClass: "text-sky-400",
  },
];

export default function CategoryTabs({ activeVariant, onSelectVariant }: Props) {
  return (
    <div className="px-4 pt-3 pb-1 bg-white border-b border-neutral-100/90 shadow-2xs">
      {/* Tab pills */}
      <div className="flex gap-2">
        {VARIANTS.map((v) => {
          const Icon = v.icon;
          const isActive = activeVariant === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVariant(v.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-300 active:scale-[0.96] cursor-pointer group ${
                isActive ? `${v.activeClass} scale-[1.01]` : `${v.inactiveClass} hover:bg-neutral-50`
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-transform duration-300 ${
                  isActive
                    ? `${v.iconActiveClass} scale-110`
                    : `${v.iconInactiveClass} group-hover:scale-110`
                }`}
              />
              <span className="tracking-tight">{v.label}</span>
              {isActive && (
                <span className="text-[10px] font-semibold opacity-80 hidden sm:inline animate-fade-in-up">
                  — {v.desc}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active variant description with smooth switch animation */}
      <p
        key={activeVariant}
        className="text-[11px] text-neutral-400 text-center mt-2 mb-0.5 animate-fade-in-up transition-opacity duration-300"
      >
        {activeVariant === "siap-makan"
          ? "✨ Menu dimasak fresh, langsung siap disajikan atau dikirim"
          : "❄️ Produk mentah beku, tahan 1 bulan di freezer — praktis digoreng sendiri"}
      </p>
    </div>
  );
}
