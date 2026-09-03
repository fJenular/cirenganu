"use client";

import React from "react";
import Image from "next/image";
import { Minus, Plus, Package } from "lucide-react";
import { MenuItem } from "@/lib/types";
import { formatRupiah } from "@/lib/whatsapp";

interface Props {
  item: MenuItem;
  cartQuantity?: number;
  onSelect: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
  onUpdateQuantity?: (delta: number) => void;
}

export default function MenuCard({
  item,
  cartQuantity = 0,
  onSelect,
  onQuickAdd,
  onUpdateQuantity,
}: Props) {
  const isOutOfStock =
    !item.is_available || (item.stock !== null && item.stock === 0);

  const isLowStock =
    !isOutOfStock && item.stock !== null && item.stock > 0 && item.stock <= 5;

  return (
    <div
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-200 ${
        isOutOfStock
          ? "border-neutral-200 opacity-70"
          : "border-neutral-200/70 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5"
      }`}
    >
      {/* === IMAGE AREA === */}
      <div
        onClick={() => !isOutOfStock && onSelect(item)}
        className={`relative w-full aspect-[4/3] overflow-hidden bg-neutral-100 ${
          isOutOfStock ? "cursor-default" : "cursor-pointer"
        }`}
      >
        <Image
          src={item.image_url || "/logo.jpg"}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 50vw, 300px"
          className={`object-cover transition-transform duration-400 ${
            !isOutOfStock ? "group-hover:scale-105" : "grayscale-[25%]"
          }`}
        />

        {/* Out of stock full overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-xs font-black bg-red-600/90 px-3 py-1.5 rounded-full shadow-lg tracking-wide">
              HABIS
            </span>
          </div>
        )}

        {/* Stock status badge — bottom-left overlay on image */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
            {isLowStock ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-300/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                <Package className="w-2.5 h-2.5" />
                Sisa {item.stock} porsi
              </span>
            ) : item.stock !== null ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/95 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <Package className="w-2.5 h-2.5" />
                Stok: {item.stock}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/95 bg-emerald-600/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <Package className="w-2.5 h-2.5" />
                Tersedia
              </span>
            )}
          </div>
        )}
      </div>

      {/* === INFO AREA — Matching Example Image (Name on top, Price & Action in row below) === */}
      <div className="p-3 pt-2.5 flex flex-col justify-between">
        {/* Row 1: Menu Name */}
        <h3
          onClick={() => !isOutOfStock && onSelect(item)}
          className={`font-bold text-xs sm:text-sm leading-snug line-clamp-1 ${
            isOutOfStock
              ? "text-neutral-400 cursor-default"
              : "text-neutral-900 cursor-pointer hover:text-orange-600 transition-colors"
          }`}
          title={item.name}
        >
          {item.name}
        </h3>

        {/* Row 2: Price (left) + Button / Capsule Stepper (right) */}
        <div className="flex items-center justify-between gap-1.5 mt-2">
          {/* Price */}
          <p
            className={`text-xs sm:text-sm font-extrabold tracking-tight ${
              isOutOfStock ? "text-neutral-400" : "text-neutral-900"
            }`}
          >
            {formatRupiah(item.price)}
          </p>

          {/* Action: Stepper or "Pesan" Button */}
          <div className="shrink-0">
            {isOutOfStock ? (
              <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full border border-neutral-200">
                Habis
              </span>
            ) : cartQuantity > 0 ? (
              /* Capsule Stepper matching image: [ -  qty  (+) ] */
              <div className="flex items-center gap-1.5 bg-neutral-100/90 hover:bg-neutral-100 rounded-full pl-2 pr-0.5 py-0.5 shadow-2xs border border-neutral-200/60 transition-colors">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdateQuantity) onUpdateQuantity(-1);
                  }}
                  className="text-neutral-700 hover:text-red-600 active:scale-90 p-0.5 transition-colors cursor-pointer flex items-center justify-center"
                  title="Kurang 1"
                  aria-label="Kurang 1"
                >
                  <Minus className="w-3 h-3 stroke-[2.5]" />
                </button>

                <span className="text-xs font-black text-neutral-900 min-w-[14px] text-center tabular-nums select-none">
                  {cartQuantity}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdateQuantity) onUpdateQuantity(1);
                    else onQuickAdd(item);
                  }}
                  className="w-5 h-5 rounded-full bg-[#FF5722] hover:bg-[#F4511E] text-white flex items-center justify-center active:scale-90 transition-transform shadow-xs cursor-pointer"
                  title="Tambah 1"
                  aria-label="Tambah 1"
                >
                  <Plus className="w-3 h-3 stroke-[3]" />
                </button>
              </div>
            ) : (
              /* "Pesan" Button */
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd(item);
                }}
                className="px-3.5 py-1 bg-[#FF5722] hover:bg-[#F4511E] active:scale-95 text-white text-xs font-extrabold rounded-full shadow-xs transition-all cursor-pointer flex items-center justify-center"
              >
                <span>Pesan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
