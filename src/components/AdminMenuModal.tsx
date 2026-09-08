"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Sparkles,
  Package,
  Upload,
  Link as LinkIcon,
  Loader2,
  Check
} from "lucide-react";
import { MenuItem } from "@/lib/types";
import { uploadMenuImage } from "@/lib/supabase";

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
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      setName(menuItem.name || "");
      setCategory(menuItem.category || "cireng-cimol");
      setDescription(menuItem.description || "");
      setUnitInfo(menuItem.unit_info || "");
      setPrice(menuItem.price ?? 10000);
      setImageUrl(menuItem.image_url || "");
      setBadge(menuItem.badge || "");
      setIsAvailable(menuItem.is_available ?? true);
      if (menuItem.stock === null || menuItem.stock === undefined) {
        setStockMode("unlimited");
        setStockValue(20);
      } else {
        setStockMode("limited");
        setStockValue(menuItem.stock ?? 20);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Ukuran gambar maksimal 10MB.");
      return;
    }

    setUploadError(null);
    setIsUploadingImage(true);
    try {
      const url = await uploadMenuImage(file);
      setImageUrl(url);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
                value={name || ""}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: CIMOL KUAH KEJU"
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Kategori *</label>
              <select
                value={category || "cireng-cimol"}
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
                value={price ?? 0}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none font-bold text-red-600"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Info Porsi / Unit</label>
              <input
                type="text"
                value={unitInfo || ""}
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
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi kelezatan, tekstur, dan rasa..."
              className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
            />
          </div>

          {/* Foto Menu: Upload File atau Masukkan URL */}
          <div className="space-y-2.5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-neutral-800 flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>Foto Menu</span>
              </label>

              {/* Mode switch */}
              <div className="flex items-center bg-neutral-200/70 p-0.5 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => { setImageInputMode("upload"); setUploadError(null); }}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    imageInputMode === "upload"
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setImageInputMode("url"); setUploadError(null); }}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    imageInputMode === "url"
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>URL Link</span>
                </button>
              </div>
            </div>

            {/* Hidden file input - placed outside conditional block to prevent DOM element reuse between file and text input */}
            <input
              key="menu-photo-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="menu-photo-file-input"
            />

            {/* Upload Mode */}
            {imageInputMode === "upload" ? (
              <div className="space-y-2">
                <div
                  onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                    isUploadingImage
                      ? "border-red-400 bg-red-50/50 cursor-wait"
                      : "border-neutral-300 hover:border-red-500 hover:bg-neutral-100/60 bg-white"
                  }`}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center justify-center py-2 text-red-600">
                      <Loader2 className="w-6 h-6 animate-spin mb-1.5" />
                      <p className="font-bold text-xs">Mengunggah & memproses foto...</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">Harap tunggu sebentar</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-1">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-neutral-800 text-xs">
                        Klik untuk upload foto dari galeri / perangkat
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Mendukung format JPG, PNG, WEBP (Maksimal 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {uploadError && (
                  <p className="text-[11px] text-red-500 font-bold bg-red-50 border border-red-200 rounded-xl px-3 py-1.5">
                    ⚠️ {uploadError}
                  </p>
                )}
              </div>
            ) : (
              /* URL Mode */
              <div className="space-y-1.5">
                <input
                  key="menu-photo-url-input"
                  type="url"
                  value={imageUrl || ""}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-white rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none text-xs font-medium"
                />
                <p className="text-[10px] text-neutral-400">
                  Gunakan URL gambar dari internet seperti Unsplash atau CDN.
                </p>
              </div>
            )}

            {/* Preview Box if image exists */}
            {imageUrl && (
              <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-neutral-200 mt-2">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/logo.jpg";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-1 mb-1">
                    <Check className="w-3 h-3" /> Foto Terpilih
                  </span>
                  <p className="text-[10px] text-neutral-500 truncate" title={imageUrl}>
                    {imageUrl.startsWith("data:") ? "Foto dari galeri / perangkat" : imageUrl}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors"
                  title="Hapus foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Badge & Stock Management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Tag / Badge</label>
              <input
                type="text"
                value={badge || ""}
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
                    value={stockValue ?? 0}
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
                value={variantTitle || ""}
                onChange={(e) => setVariantTitle(e.target.value)}
                placeholder="Contoh: Pilihan Isian Cireng"
                className="w-full px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200"
              />
            </div>

            <div>
              <label className="text-neutral-600 block mb-0.5">Pilihan Opsi Varian</label>
              <input
                type="text"
                value={variantOptionsText || ""}
                onChange={(e) => setVariantOptionsText(e.target.value)}
                placeholder="Isi Ayam, Isi Keju, Mix"
                className="w-full px-3 py-1.5 bg-neutral-50 rounded-lg border border-neutral-200"
              />
            </div>

            <div>
              <label className="text-neutral-600 block mb-0.5">Opsi Level Pedas</label>
              <input
                type="text"
                value={spicyLevelsText || ""}
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
