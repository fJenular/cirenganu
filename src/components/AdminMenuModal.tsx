"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Trash2, Save, Image as ImageIcon, Sparkles, Package } from "lucide-react";
import { MenuItem } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
  onSave: (menu: MenuItem) => Promise<void>;
}

export default function AdminMenuModal({ isOpen, onClose, menuItem, onSave }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<MenuItem["category"]>("cireng-cimol");
  const [description, setDescription] = useState("");
  const [unitInfo, setUnitInfo] = useState("");
  const [price, setPrice] = useState<number>(10000);
  const [imageUrl, setImageUrl] = useState("");
  const [badge, setBadge] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [stockMode, setStockMode] = useState<"unlimited" | "limited">("limited");
  const [stockValue, setStockValue] = useState<number>(20);
  const [variantTitle, setVariantTitle] = useState("");
  const [variantOptionsText, setVariantOptionsText] = useState("");
  const [spicyLevelsText, setSpicyLevelsText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (menuItem) {
      setName(menuItem.name);
      setCategory(menuItem.category);
      setDescription(menuItem.description);
      setUnitInfo(menuItem.unit_info);
      setPrice(menuItem.price);
      setImageUrl(menuItem.image_url);
      setBadge(menuItem.badge || "");
      setIsAvailable(menuItem.is_available);
      if (menuItem.stock === null) {
        setStockMode("unlimited");
        setStockValue(20);
      } else {
        setStockMode("limited");
        setStockValue(menuItem.stock);
      }
      setVariantTitle(menuItem.variant_title || "");
      setVariantOptionsText(menuItem.variant_options ? menuItem.variant_options.join(", ") : "");
      setSpicyLevelsText(menuItem.spicy_levels ? menuItem.spicy_levels.join(", ") : "");
    } else {
      setName("");
      setCategory("cireng-cimol");
      setDescription("");
      setUnitInfo("Porsi Nikmat");
      setPrice(10000);
      setImageUrl("https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80");
      setBadge("🔥 Menu Baru");
      setIsAvailable(true);
      setStockMode("limited");
      setStockValue(20);
      setVariantTitle("");
      setVariantOptionsText("");
      setSpicyLevelsText("Level 0: Original, Level 1: Pedas Sedang, Level 2: Extra Pedas");
    }
  }, [menuItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    setIsSaving(true);
    try {
      const id = menuItem?.id || name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();

      const variantOptions = variantOptionsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const spicyLevels = spicyLevelsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Compute final stock value
      const finalStock: number | null = stockMode === "unlimited" ? null : stockValue;
      // If stock = 0, automatically mark as unavailable
      const finalIsAvailable = isAvailable && (finalStock === null || finalStock > 0);

      const menuPayload: MenuItem = {
        id,
        name: name.trim(),
        category,
        description: description.trim(),
        unit_info: unitInfo.trim(),
        price: Number(price),
        image_url: imageUrl.trim() || "/logo.jpg",
        badge: badge.trim() || undefined,
        stock: finalStock,
        rating: menuItem?.rating || 4.9,
        reviews_count: menuItem?.reviews_count || 50,
        is_available: finalIsAvailable,
        variant_title: variantTitle.trim() || undefined,
        variant_options: variantOptions.length > 0 ? variantOptions : undefined,
        spicy_levels: spicyLevels.length > 0 ? spicyLevels : undefined,
        extra_toppings: menuItem?.extra_toppings
      };

      await onSave(menuPayload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-sm font-black text-neutral-900">
              {menuItem ? "Edit Menu Cemilan" : "Tambah Menu Baru"}
            </h3>
            <p className="text-[11px] text-neutral-400">Database Supabase CRUD Menu</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs no-scrollbar">

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Nama Menu *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: CIMOL KUAH KEJU"
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
              >
                <option value="cireng-cimol">Cimol & Cireng</option>
                <option value="pempek">Pempek</option>
                <option value="cheese-roll">Cheese Roll</option>
                <option value="dimsum">Dimsum</option>
                <option value="siap-makan">🍽️ Siap Makan</option>
                <option value="frozen">❄️ Frozen</option>
                <option value="snack">Snack & Lainnya</option>
              </select>
            </div>
          </div>

          {/* Price & Unit Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Harga (Rp) *</label>
              <input
                type="number"
                required
                min={1000}
                step={500}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none font-bold text-red-600"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Info Porsi / Unit</label>
              <input
                type="text"
                value={unitInfo}
                onChange={(e) => setUnitInfo(e.target.value)}
                placeholder="Contoh: 4 pcs · Rp5k"
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-neutral-700 block mb-1">Deskripsi Menu</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi kelezatan, tekstur, dan rasa..."
              className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Image URL & Preview */}
          <div>
            <label className="font-bold text-neutral-700 block mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span>URL Foto Menu</span>
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Badge & Stock Management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Tag / Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Misal: 🔥 Best Seller, 🧀 Lumer"
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Status Ketersediaan</label>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`w-full py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer text-center ${
                  isAvailable
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-red-50 text-red-800 border-red-300"
                }`}
              >
                {isAvailable ? "✓ Menu Tersedia (Ready)" : "✕ Stok Habis"}
              </button>
            </div>
          </div>

          {/* Stok Realtime */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <h4 className="font-bold text-neutral-800">Manajemen Stok Realtime</h4>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Stok ditampilkan ke customer secara realtime. Jika stok = 0, menu otomatis tampil &quot;Habis&quot; dan tidak bisa dipesan.
            </p>

            {/* Stock Mode Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStockMode("limited")}
                className={`flex-1 py-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                  stockMode === "limited"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                Stok Terbatas
              </button>
              <button
                type="button"
                onClick={() => setStockMode("unlimited")}
                className={`flex-1 py-2 rounded-xl font-bold text-[11px] border transition-all cursor-pointer ${
                  stockMode === "unlimited"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                Tidak Terbatas
              </button>
            </div>

            {/* Stock Input */}
            {stockMode === "limited" && (
              <div>
                <label className="text-neutral-600 font-bold block mb-1">
                  Jumlah Stok Tersedia
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStockValue(Math.max(0, stockValue - 1))}
                    className="w-9 h-9 rounded-xl bg-white border border-neutral-300 text-neutral-700 flex items-center justify-center font-black text-lg hover:bg-neutral-100 cursor-pointer transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    max={9999}
                    value={stockValue}
                    onChange={(e) => setStockValue(Math.max(0, Number(e.target.value)))}
                    className="flex-1 text-center px-3 py-2 bg-white rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none font-black text-lg text-amber-600"
                  />
                  <button
                    type="button"
                    onClick={() => setStockValue(stockValue + 1)}
                    className="w-9 h-9 rounded-xl bg-white border border-neutral-300 text-neutral-700 flex items-center justify-center font-black text-lg hover:bg-neutral-100 cursor-pointer transition-colors"
                  >
                    +
                  </button>
                </div>
                {stockValue === 0 && (
                  <p className="text-[11px] text-red-500 font-bold mt-1">
                    ⚠️ Stok 0 = menu akan otomatis ditandai HABIS
                  </p>
                )}
                {stockValue > 0 && stockValue <= 5 && (
                  <p className="text-[11px] text-amber-600 font-bold mt-1">
                    ⚡ Stok rendah — customer akan melihat peringatan sisa {stockValue} porsi
                  </p>
                )}
              </div>
            )}

            {stockMode === "unlimited" && (
              <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                ✓ Tidak ada batasan stok — menu selalu tampil tersedia selama status aktif
              </p>
            )}
          </div>

          {/* Variants & Spicy */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <h4 className="font-bold text-neutral-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Kustomisasi Varian & Level Pedas (Pisahkan dengan koma)</span>
            </h4>

            <div>
              <label className="text-neutral-600 block mb-0.5">Judul Varian (Opsional)</label>
              <input
                type="text"
                value={variantTitle}
                onChange={(e) => setVariantTitle(e.target.value)}
                placeholder="Contoh: Pilihan Isian Cireng"
                className="w-full px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200"
              />
            </div>

            <div>
              <label className="text-neutral-600 block mb-0.5">Pilihan Opsi Varian</label>
              <input
                type="text"
                value={variantOptionsText}
                onChange={(e) => setVariantOptionsText(e.target.value)}
                placeholder="Isi Ayam, Isi Keju, Mix"
                className="w-full px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200"
              />
            </div>

            <div>
              <label className="text-neutral-600 block mb-0.5">Opsi Level Pedas</label>
              <input
                type="text"
                value={spicyLevelsText}
                onChange={(e) => setSpicyLevelsText(e.target.value)}
                placeholder="Level 0, Level 1: Pedas Sedang, Level 2: Extra Pedas"
                className="w-full px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-600 hover:bg-neutral-100 font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black flex items-center gap-1.5 shadow-md shadow-red-600/25 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Menyimpan..." : "Simpan Menu"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
