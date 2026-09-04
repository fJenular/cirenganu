"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";
import { CartItem } from "@/lib/types";
import { formatRupiah } from "@/lib/whatsapp";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: Props) {
  const router = useRouter();

  const [isRendered, setIsRendered] = React.useState(isOpen);
  const [isAnimatingIn, setIsAnimatingIn] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      const timer = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 20);
      return () => clearTimeout(timer);
    } else if (isRendered && !isClosing) {
      setIsClosing(true);
      setIsAnimatingIn(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 260);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCloseWithAnimation = () => {
    if (isClosing) return;
    setIsClosing(true);
    setIsAnimatingIn(false);
    setTimeout(() => {
      onClose();
      setIsRendered(false);
      setIsClosing(false);
    }, 260);
  };

  if (!isRendered) return null;

  const totalItemsCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalPrice = items.reduce((acc, curr) => acc + curr.itemTotal, 0);

  const handleProceedToCheckout = () => {
    setIsClosing(true);
    setIsAnimatingIn(false);
    setTimeout(() => {
      onClose();
      router.push("/checkout");
    }, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-260 ${
        isAnimatingIn && !isClosing ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={handleCloseWithAnimation} />

      <div
        className={`relative w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] max-h-[85vh] h-auto flex flex-col shadow-2xl overflow-hidden border border-neutral-200/80 z-10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isAnimatingIn && !isClosing ? "translate-y-0 opacity-100 scale-100" : "translate-y-full md:translate-y-8 opacity-0 scale-95"
        }`}
      >
        
        {/* Pull Handle for Mobile */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-neutral-900 leading-tight">
                Atur Isi Keranjang
              </h2>
              <p className="text-[11px] text-neutral-400">
                {totalItemsCount} item dipilih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-[11px] font-bold text-neutral-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                title="Kosongkan Keranjang"
              >
                Kosongkan
              </button>
            )}
            <button
              type="button"
              onClick={handleCloseWithAnimation}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Items List Body (Only + / - / delete controls) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-neutral-100 no-scrollbar">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-300 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800">Keranjang masih kosong</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Yuk pilih menu lezat favoritmu sekarang!
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseWithAnimation}
                className="px-5 py-2 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Pilih Menu
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5">
                {/* Thumbnail Image */}
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/60 shadow-2xs">
                  <Image
                    src={item.image_url || "/logo.jpg"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Name & Unit Price */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-xs text-neutral-900 truncate leading-snug">
                    {item.name}
                  </h4>
                  <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                    {formatRupiah(item.price)}
                  </p>
                  <p className="text-xs font-black text-red-600 mt-1">
                    {formatRupiah(item.itemTotal)}
                  </p>
                </div>

                {/* Stepper (+ / -) & Trash button */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-neutral-50 border border-neutral-200/80 rounded-xl p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-neutral-200 text-neutral-700 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-90 transition-all cursor-pointer"
                      title="Kurang 1"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>

                    <span className="w-7 text-center text-xs font-black text-neutral-900 select-none tabular-nums">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-700 active:scale-90 transition-all cursor-pointer shadow-xs"
                      title="Tambah 1"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Delete Item button */}
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.id)}
                    className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                    title="Hapus dari keranjang"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Total & "Pesan Sekarang" CTA */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-neutral-100 space-y-3 shadow-lg">
            <div className="flex items-center justify-between px-1">
              <div>
                <span className="text-[11px] text-neutral-400 font-medium">
                  Total Pembayaran
                </span>
                <p className="text-base font-black text-neutral-900">
                  {formatRupiah(totalPrice)}
                </p>
              </div>
              <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
                {totalItemsCount} Porsi
              </span>
            </div>

            {/* Main Action Button — Directs to Checkout Order Form */}
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 transition-all cursor-pointer"
            >
              <span>Pesan Sekarang</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
