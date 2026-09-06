"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShoppingBag,
  Send,
  MapPin,
  User,
  Phone,
  CreditCard,
  Tag,
  CheckCircle2,
  Sparkles,
  Clock,
  AlertCircle,
  Truck,
  Utensils,
  ChevronRight,
  Upload,
  QrCode,
  FileCheck,
  ExternalLink,
  Copy,
  Check,
  Download
} from "lucide-react";
import confetti from "canvas-confetti";
import DesktopPhoneFrame from "@/components/DesktopPhoneFrame";
import { CartItem, OrderCustomerInfo, OrderRecord, StoreSettings } from "@/lib/types";
import { formatRupiah, buildWhatsAppMessage, createWhatsAppUrl, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { PROMO_CODES, DEFAULT_STORE_SETTINGS } from "@/lib/initialData";
import { createOrder, getStoreSettings, uploadPaymentProof, updateOrderPaymentProof } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();

  // Cart Items State
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  // Form Fields State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<"delivery" | "takeaway" | "dine_in">("delivery");
  const [address, setAddress] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; desc: string } | null>(null);
  const [promoError, setPromoError] = useState("");

  // Submission & Post-Order QRIS Payment State
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderRecord | null>(null);

  // Upload Payment Proof State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedProofUrl, setUploadedProofUrl] = useState<string | null>(null);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Load cart and settings on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("anu_cireng_active_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      localStorage.setItem("cireng_anu_has_onboarded", "true");
    } catch {}

    getStoreSettings().then((res) => {
      if (res) setStoreSettings(res);
    });

    setIsLoaded(true);
  }, []);

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + curr.itemTotal, 0);
  const deliveryFee = orderType === "delivery" && subtotal > 0 ? storeSettings.delivery_fee_default || 5000 : 0;
  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyPromo = () => {
    setPromoError("");
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;

    const promo = PROMO_CODES[code];
    if (!promo) {
      setPromoError("Kode promo tidak valid");
      return;
    }

    if (subtotal < promo.minOrder) {
      setPromoError(`Minimal order ${formatRupiah(promo.minOrder)}`);
      return;
    }

    let calculatedDiscount = 0;
    if (promo.type === "percent") {
      calculatedDiscount = Math.round((subtotal * promo.value) / 100);
    } else {
      calculatedDiscount = promo.value;
    }

    setAppliedPromo({
      code,
      discount: calculatedDiscount,
      desc: promo.desc
    });
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    const errors: { [k: string]: string } = {};
    if (!customerName.trim()) {
      errors.name = "Nama pemesan wajib diisi";
    }
    if (!customerPhone.trim()) {
      errors.phone = "Nomor WhatsApp wajib diisi";
    } else if (customerPhone.replace(/[^0-9]/g, "").length < 8) {
      errors.phone = "Nomor WhatsApp tidak valid";
    }
    if (orderType === "delivery" && !address.trim()) {
      errors.address = "Alamat pengiriman wajib diisi untuk delivery";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      const orderId = `ANU-${Date.now().toString().slice(-6)}`;

      const customerInfo: OrderCustomerInfo = {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        orderType: orderType,
        address: orderType === "delivery" ? address.trim() : undefined,
        notes: generalNotes.trim() || undefined,
        paymentMethod: "qris"
      };

      const orderRecord: OrderRecord = {
        id: orderId,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        order_type: customerInfo.orderType,
        delivery_address: customerInfo.address,
        payment_method: "qris",
        items: items,
        subtotal: subtotal,
        discount: discountAmount,
        delivery_fee: deliveryFee,
        total_amount: finalTotal,
        promo_code: appliedPromo?.code,
        customer_notes: customerInfo.notes,
        status: "Baru",
        payment_status: "Menunggu",
        created_at: new Date().toISOString()
      };

      // Save to Supabase (and local cache)
      await createOrder(orderRecord);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      // Clear active cart
      try {
        localStorage.removeItem("anu_cireng_active_cart");
      } catch {}

      setPlacedOrder(orderRecord);
    } catch (err) {
      console.error("Gagal membuat pesanan:", err);
      alert("Terjadi kesalahan saat menyimpan pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !placedOrder) return;

    setIsUploading(true);
    try {
      const proofUrl = await uploadPaymentProof(placedOrder.id, selectedFile);
      await updateOrderPaymentProof(placedOrder.id, proofUrl);
      setUploadedProofUrl(proofUrl);
      setPlacedOrder({
        ...placedOrder,
        payment_proof_url: proofUrl,
        payment_status: "Menunggu"
      });
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}
    } catch (err) {
      console.error("Gagal unggah bukti:", err);
      alert("Gagal mengunggah bukti pembayaran. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!placedOrder) return;

    const customerInfo: OrderCustomerInfo = {
      name: placedOrder.customer_name,
      phone: placedOrder.customer_phone,
      orderType: placedOrder.order_type as any,
      address: placedOrder.delivery_address,
      notes: placedOrder.customer_notes,
      paymentMethod: "qris"
    };

    let waMessage = buildWhatsAppMessage(
      placedOrder.id,
      placedOrder.items,
      customerInfo,
      placedOrder.subtotal,
      placedOrder.discount,
      placedOrder.delivery_fee,
      placedOrder.total_amount,
      placedOrder.promo_code
    );

    if (uploadedProofUrl) {
      waMessage += `\n📌 *Bukti Pembayaran QRIS*: Sudah diunggah ke sistem.`;
    } else {
      waMessage += `\n📌 *Metode Pembayaran*: QRIS (Menunggu Bukti Transfer)`;
    }

    const targetNumber = storeSettings.whatsapp_number || WHATSAPP_NUMBER;
    const waUrl = createWhatsAppUrl(targetNumber, waMessage);
    window.open(waUrl, "_blank");
  };

  const copyTotalAmount = () => {
    if (!placedOrder) return;
    navigator.clipboard.writeText(placedOrder.total_amount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  if (!isLoaded) return null;

  return (
    <DesktopPhoneFrame>
      <div className="min-h-screen bg-neutral-50 flex flex-col font-sans pb-12">
        {/* Top Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-sm text-neutral-900 leading-none">
              {placedOrder ? "Pembayaran QRIS" : "Konfirmasi Pesanan"}
            </h1>
            <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
              {placedOrder ? `Order ID #${placedOrder.id}` : "Lengkapi data pengiriman"}
            </p>
          </div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-red-200 shrink-0">
            <Image src="/logo.jpg" alt="Logo" fill sizes="32px" className="object-cover" />
          </div>
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto w-full">

          {/* IF ORDER IS PLACED: SHOW QRIS PAYMENT & PROOF UPLOAD SCREEN */}
          {placedOrder ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Card 1: Success Banner & Order Total */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-md text-center space-y-3 relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center text-white">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-semibold">Pesanan Berhasil Dibuat!</p>
                  <h2 className="text-xl font-black mt-0.5">ID: #{placedOrder.id}</h2>
                </div>
                
                <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 mt-2 border border-white/20 flex flex-col items-center justify-center">
                  <span className="text-[11px] text-emerald-100 font-medium">Total Pembayaran QRIS</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black tracking-tight">{formatRupiah(placedOrder.total_amount)}</span>
                    <button
                      onClick={copyTotalAmount}
                      type="button"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                      title="Salin Nominal"
                    >
                      {copiedAmount ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copiedAmount && <span className="text-[10px] text-emerald-200 font-bold mt-1">Nominal tersalin!</span>}
                </div>
              </div>

              {/* Card 2: QRIS Display */}
              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs text-center space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2 text-neutral-900 font-black text-xs">
                    <QrCode className="w-4 h-4 text-red-600" />
                    <span>Scan QRIS Cireng Anu</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                    Instan & Bebas Biaya
                  </span>
                </div>

                <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                  Silakan scan kode QRIS di bawah menggunakan e-wallet (GoPay, OVO, Dana, ShopeePay) atau M-Banking kamu:
                </p>

                {/* QRIS Image Container */}
                <div className="relative w-60 h-60 mx-auto rounded-2xl overflow-hidden border-2 border-neutral-200 shadow-sm group">
                  <Image
                    src="/QRIS.jpeg"
                    alt="QRIS Pembayaran Cireng Anu"
                    fill
                    sizes="240px"
                    className="object-contain p-2 bg-white"
                    priority
                  />
                </div>

                {/* Download QRIS Button */}
                <div className="pt-1 flex justify-center">
                  <a
                    href="/QRIS.jpeg"
                    download="QRIS_Cireng_Anu.jpeg"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-red-600" />
                    <span>Unduh Gambar QRIS</span>
                  </a>
                </div>

                <div className="bg-amber-50 border border-amber-200/60 p-3 rounded-2xl text-[11px] text-amber-800 font-medium text-left flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Bayar pas sesuai nominal <b>{formatRupiah(placedOrder.total_amount)}</b> lalu simpan tangkapan layar (screenshot) bukti transfernya.</span>
                </div>
              </div>

              {/* Card 3: Upload Proof Form (Compact & Optional) */}
              <div className="bg-white p-3.5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
                  <h3 className="font-black text-xs text-neutral-900 flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-red-600" />
                    <span>Upload Bukti Bayar <span className="font-medium text-[10px] text-neutral-400">(Opsional)</span></span>
                  </h3>
                  <span className="text-[10px] text-neutral-400 font-medium">Bisa diunggah di sini</span>
                </div>

                {uploadedProofUrl || placedOrder.payment_proof_url ? (
                  <div className="space-y-2 bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Bukti Pembayaran Terunggah!</span>
                    </div>
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-emerald-200 bg-black/5">
                      <Image
                        src={uploadedProofUrl || placedOrder.payment_proof_url || ""}
                        alt="Bukti Transfer"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      Status: <span className="font-bold bg-emerald-200/80 px-2 py-0.5 rounded-full text-emerald-900">Menunggu Konfirmasi Admin</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="border border-dashed border-neutral-300 hover:border-red-500 bg-neutral-50 hover:bg-red-50/30 p-2.5 rounded-xl text-center transition-colors">
                        {previewUrl ? (
                          <div className="space-y-1">
                            <div className="relative w-24 h-24 mx-auto rounded-lg overflow-hidden border border-neutral-200">
                              <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                            </div>
                            <span className="text-[10px] font-bold text-red-600 block">Klik untuk ganti foto</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 py-1">
                            <Upload className="w-4 h-4 text-neutral-400" />
                            <span className="text-xs font-bold text-neutral-700">Pilih Foto Bukti Transfer</span>
                            <span className="text-[10px] text-neutral-400">(Bila Ada)</span>
                          </div>
                        )}
                      </div>
                    </label>

                    {selectedFile && (
                      <button
                        type="button"
                        onClick={handleUploadProof}
                        disabled={isUploading}
                        className="w-full py-2 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? "Mengunggah..." : "Unggah Bukti Bayar"}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Konfirmasi Pesanan ke WhatsApp</span>
                </button>

                <Link
                  href="/"
                  className="w-full py-3.5 bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Kembali ke Beranda</span>
                </Link>
              </div>

            </div>
          ) : items.length === 0 ? (
            /* EMPTY CART VIEW */
            <div className="bg-white p-8 rounded-3xl border border-neutral-200/80 shadow-xs text-center space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-black text-base text-neutral-900">Keranjang Kamu Kosong</h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                  Belum ada menu yang dipilih. Yuk cari camilan favoritmu terlebih dahulu!
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-red-600 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-md hover:bg-red-700 transition-colors"
              >
                <span>Lihat Menu</span>
              </Link>
            </div>
          ) : (
            /* CHECKOUT FORM VIEW */
            <form onSubmit={handleCreateOrder} className="space-y-4">
              
              {/* Card 1: Order Summary */}
              <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
                <h3 className="font-black text-xs text-neutral-900 flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                  <Utensils className="w-4 h-4 text-red-600" />
                  <span>Ringkasan Menu ({items.reduce((s, i) => s + i.quantity, 0)})</span>
                </h3>

                <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-neutral-900 leading-tight">
                          {item.name} <span className="text-red-600">x{item.quantity}</span>
                        </p>
                        {item.options && (
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                            {[
                              item.options.variant,
                              item.options.spicyLevel,
                              item.options.extraToppings?.join(", ")
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-neutral-900 shrink-0">
                        {formatRupiah(item.itemTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Promo Code */}
              <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
                <h3 className="font-black text-xs text-neutral-900 flex items-center gap-1.5 pb-1">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>Kode Promo / Voucher</span>
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Masukkan kode (Cth: CIRENGPAHAM)"
                    className="flex-1 px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs font-bold uppercase placeholder:normal-case placeholder:font-normal focus:border-red-500 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                  >
                    Gunakan
                  </button>
                </div>

                {promoError && (
                  <p className="text-[11px] text-red-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{promoError}</span>
                  </p>
                )}

                {appliedPromo && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <span>Diskon {appliedPromo.code} ({appliedPromo.desc})</span>
                    <span>-{formatRupiah(appliedPromo.discount)}</span>
                  </div>
                )}
              </div>

              {/* Card 3: Customer Info & Order Type */}
              <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
                <h3 className="font-black text-xs text-neutral-900 flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                  <User className="w-4 h-4 text-red-600" />
                  <span>Data Pemesan</span>
                </h3>

                {/* Name Input */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-medium"
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-red-500 font-bold mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Phone Input */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Nomor WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-medium"
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-red-500 font-bold mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Order Type Toggle */}
                <div className="pt-1">
                  <label className="font-bold text-neutral-700 block mb-1.5">
                    Tipe Pesanan
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "delivery", label: "Delivery", desc: "Kirim Kurir", icon: Truck },
                      { id: "takeaway", label: "Takeaway", desc: "Ambil Sendiri", icon: ShoppingBag }
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = orderType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setOrderType(t.id as any)}
                          className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-red-50 border-red-500 text-red-700 shadow-2xs font-black"
                              : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:border-neutral-300 font-bold"
                          }`}
                        >
                          <Icon className={`w-4 h-4 mx-auto mb-1 ${isSelected ? "text-red-600" : "text-neutral-400"}`} />
                          <span className="block text-xs leading-none">{t.label}</span>
                          <span className="block text-[9px] text-neutral-400 mt-0.5">{t.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Address Input */}
                {orderType === "delivery" && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <label className="font-bold text-neutral-700 block mb-1">
                      Alamat Lengkap Pengiriman *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah, RT/RW, patokan lokasi..."
                      className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-medium leading-relaxed"
                    />
                    {formErrors.address && (
                      <p className="text-[11px] text-red-500 font-bold mt-1">
                        {formErrors.address}
                      </p>
                    )}
                  </div>
                )}

                {/* Notes Input */}
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Catatan Khusus (Opsional)
                  </label>
                  <input
                    type="text"
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Contoh: Sambal dipisah, jangan terlalu gosong..."
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Card 4: Payment Method Info Banner */}
              <div className="bg-red-50/70 p-4 rounded-3xl border border-red-200/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <h4 className="font-black text-xs text-red-900">Metode Pembayaran: QRIS Only</h4>
                    <p className="text-[10px] text-red-700 font-medium">
                      Setelah klik buat pesanan, barcode QRIS dan form upload bukti bayar akan langsung muncul.
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 5: Payment Breakdown & Total */}
              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2">
                <div className="flex justify-between text-neutral-500 text-xs">
                  <span>Subtotal Menu</span>
                  <span className="font-bold text-neutral-900">{formatRupiah(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 text-xs">
                    <span>Diskon Promo</span>
                    <span className="font-bold">-{formatRupiah(discountAmount)}</span>
                  </div>
                )}

                {orderType === "delivery" && (
                  <div className="flex justify-between text-neutral-500 text-xs">
                    <span>Ongkos Kirim Delivery</span>
                    <span className="font-bold text-neutral-900">
                      {deliveryFee > 0 ? formatRupiah(deliveryFee) : "Gratis"}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-sm font-black text-neutral-900">
                  <span>Total Pembayaran</span>
                  <span className="text-base text-red-600">{formatRupiah(finalTotal)}</span>
                </div>
              </div>

              {/* Big Submit Button — Directs to QRIS Payment Screen */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-[0.98] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-60"
                >
                  <QrCode className="w-5 h-5" />
                  <span>{isSubmitting ? "Memproses Pesanan..." : "Buat Pesanan & Bayar QRIS"}</span>
                </button>
                <p className="text-[10px] text-neutral-400 text-center mt-2">
                  Pesanan akan tersimpan dan QRIS akan ditampilkan untuk pembayaran.
                </p>
              </div>

            </form>
          )}

        </div>

      </div>
    </DesktopPhoneFrame>
  );
}
