"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Heart, Star, Plus, Minus, Check, Sparkles, MessageSquare, Clock, Flame, CheckCircle2 } from "lucide-react";
import { MenuItem, CartItem, CartItemOption } from "@/lib/types";
import { formatRupiah } from "@/lib/whatsapp";

interface Props {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function ProductDetailModal({ item, onClose, onAddToCart }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [selectedSpicyLevel, setSelectedSpicyLevel] = useState<string>("");
  const [selectedToppings, setSelectedToppings] = useState<{ name: string; price: number }[]>([]);
  const [itemNotes, setItemNotes] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantity(1);
      setItemNotes("");
      setIsAdding(false);
      if (item.variant_options && item.variant_options.length > 0) {
        setSelectedVariant(item.variant_options[0]);
      } else {
        setSelectedVariant("");
      }

      if (item.spicy_levels && item.spicy_levels.length > 0) {
        setSelectedSpicyLevel(item.spicy_levels[0]);
      } else {
        setSelectedSpicyLevel("");
      }

      setSelectedToppings([]);
    }
  }, [item]);

  if (!item) return null;

  const toppingsPriceTotal = selectedToppings.reduce((acc, curr) => acc + curr.price, 0);
  const singleUnitPrice = item.price + toppingsPriceTotal;
  const totalPrice = singleUnitPrice * quantity;

  const handleToggleTopping = (topping: { name: string; price: number }) => {
    if (selectedToppings.some((t) => t.name === topping.name)) {
      setSelectedToppings(selectedToppings.filter((t) => t.name !== topping.name));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);

    const options: CartItemOption = {
      variant: selectedVariant || undefined,
      spicyLevel: selectedSpicyLevel || undefined,
      extraToppings: selectedToppings.map((t) => `${t.name} (+${formatRupiah(t.price)})`),
      extraToppingsTotal: toppingsPriceTotal
    };

    const optionsHash = [
      selectedVariant,
      selectedSpicyLevel,
      ...selectedToppings.map((t) => t.name),
      itemNotes
    ].filter(Boolean).join("_");

    const cartItem: CartItem = {
      id: `${item.id}-${optionsHash || "default"}`,
      menuId: item.id,
      name: item.name,
      price: singleUnitPrice,
      unit_info: item.unit_info,
      image_url: item.image_url,
      quantity: quantity,
      options: options,
      itemTotal: totalPrice,
      itemNotes: itemNotes.trim() || undefined
    };

    setTimeout(() => {
      onAddToCart(cartItem);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-2xs animate-in fade-in duration-200">
      <div className="w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2.5 z-10 bg-white border-b border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <span className="text-xs font-bold text-neutral-800 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-red-600" />
            <span>Pre-Order Menu</span>
          </span>

          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 ${
                isLiked ? "fill-red-500 text-red-500" : "text-neutral-500"
              }`}
            />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 no-scrollbar">
          {/* Main Hero Product Image */}
          <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/70 shadow-2xs flex items-center justify-center">
            <Image
              src={item.image_url || "/logo.jpg"}
              alt={item.name}
              fill
              className="object-cover"
              priority
            />
            {item.badge && (
              <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-md shadow-xs">
                {item.badge}
              </span>
            )}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs text-neutral-900 text-[10px] font-bold px-2.5 py-1 rounded-md border border-neutral-200 shadow-2xs">
              Slot PO Terbatas
            </div>
          </div>

          {/* Title, Rating & Price Info */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 tracking-tight leading-tight">
                  {item.name}
                </h2>
                <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                  {item.unit_info || "Porsi Spesial"}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 justify-end">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.rating || 4.9}</span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">
                  ({item.reviews_count || 120} Ulasan)
                </span>
              </div>
            </div>

            {/* PO Fresh Notice Banner */}
            <div className="mt-2.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-200/80 flex items-center gap-2 text-[11px] text-neutral-700">
              <Clock className="w-4 h-4 text-red-600 shrink-0" />
              <p className="leading-tight">
                <strong>Pre-Order Fresh:</strong> Dibuat harian sesuai kuota pesanan batch.
              </p>
            </div>

            {item.description && (
              <div className="mt-3 bg-neutral-50/70 p-3 rounded-xl border border-neutral-100">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}
          </div>

          {/* Varian Selection */}
          {item.variant_options && item.variant_options.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                <span>{item.variant_title || "Pilihan Isian / Varian"}</span>
                <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-bold">Wajib</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.variant_options.map((opt) => {
                  const isSelected = selectedVariant === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedVariant(opt)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-red-50/80 border-red-600 text-red-700"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <span>{opt}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-red-600 bg-red-600 text-white" : "border-neutral-300"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spicy Levels */}
          {item.spicy_levels && item.spicy_levels.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800">
                Pilih Level Kepedasan:
              </label>
              <div className="flex flex-wrap gap-2">
                {item.spicy_levels.map((lvl) => {
                  const isSelected = selectedSpicyLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedSpicyLevel(lvl)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-neutral-900 text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extra Toppings */}
          {item.extra_toppings && item.extra_toppings.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-800 flex items-center justify-between">
                <span>Tambah Ekstra Topping:</span>
                <span className="text-[10px] text-neutral-400 font-semibold">Opsional</span>
              </label>
              <div className="space-y-1.5">
                {item.extra_toppings.map((top) => {
                  const isChecked = selectedToppings.some((t) => t.name === top.name);
                  return (
                    <div
                      key={top.name}
                      onClick={() => handleToggleTopping(top)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        isChecked
                          ? "bg-red-50/50 border-red-400 text-neutral-900"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? "bg-red-600 border-red-600 text-white" : "border-neutral-300"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{top.name}</span>
                      </div>
                      <span className="text-red-700 font-bold">+{formatRupiah(top.price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Item Notes */}
          <div className="space-y-1.5 pb-2">
            <label className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
              <span>Catatan Khusus Menu:</span>
            </label>
            <input
              type="text"
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              placeholder="Contoh: Kuah dipisah, cabai banyakan..."
              className="w-full px-3.5 py-2 bg-neutral-50 focus:bg-white text-xs text-neutral-800 rounded-xl border border-neutral-200 focus:border-red-600 focus:outline-none transition-all placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Sticky Bottom Dock */}
        <div className="px-5 py-3 bg-white border-t border-neutral-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-neutral-400 font-medium block">Total Harga</span>
            <span className="text-base font-bold text-neutral-900">
              {formatRupiah(totalPrice)}
            </span>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center gap-2 bg-neutral-100 px-2 py-1 rounded-xl border border-neutral-200">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-6 h-6 rounded-lg bg-white text-neutral-800 flex items-center justify-center hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer disabled:opacity-40"
              disabled={quantity <= 1}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-neutral-900 w-5 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-6 h-6 rounded-lg bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-75"
          >
            {isAdding ? (
              <span className="flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-4 h-4" /> Ditambahkan...
              </span>
            ) : (
              <span>Tambah ke Pesanan</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
