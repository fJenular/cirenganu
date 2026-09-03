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
  ChevronRight
} from "lucide-react";
import confetti from "canvas-confetti";
import DesktopPhoneFrame from "@/components/DesktopPhoneFrame";
import { CartItem, OrderCustomerInfo, OrderRecord, StoreSettings } from "@/lib/types";
import { formatRupiah, buildWhatsAppMessage, createWhatsAppUrl } from "@/lib/whatsapp";
import { PROMO_CODES, DEFAULT_STORE_SETTINGS } from "@/lib/initialData";
import { createOrder, getStoreSettings } from "@/lib/supabase";

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
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "transfer" | "cash">("qris");

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; desc: string } | null>(null);
  const [promoError, setPromoError] = useState("");

  // Submission State
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  // Load cart and settings on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("anu_cireng_active_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
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

  const handleCheckoutWhatsApp = async (e: React.FormEvent) => {
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
        paymentMethod: paymentMethod
      };

      const orderRecord: OrderRecord = {
        id: orderId,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        order_type: customerInfo.orderType,
        delivery_address: customerInfo.address,
        payment_method: customerInfo.paymentMethod,
        items: items,
        subtotal: subtotal,
        discount: discountAmount,
        delivery_fee: deliveryFee,
        total_amount: finalTotal,
        promo_code: appliedPromo?.code,
        customer_notes: customerInfo.notes,
        status: "Baru",
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

      // Build WhatsApp message with official template
      const waMessage = buildWhatsAppMessage(
        orderId,
        items,
        customerInfo,
        subtotal,
        discountAmount,
        deliveryFee,
        finalTotal,
        appliedPromo?.code
      );

      const targetWaNumber = storeSettings.whatsapp_number || "6281234567890";
      const waUrl = createWhatsAppUrl(targetWaNumber, waMessage);

      // Clear local storage cart
      try {
        localStorage.removeItem("anu_cireng_active_cart");
      } catch {}

      setIsOrderPlaced(true);

      // Open WhatsApp in new tab
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DesktopPhoneFrame>
      <div className="min-h-full flex flex-col bg-[#F7F7F8] text-neutral-900 selection:bg-red-500 selection:text-white pb-12">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-100 shadow-2xs">
          <div className="px-4 py-3.5 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-1 text-xs font-black text-neutral-700 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Menu</span>
            </Link>

            <h1 className="text-sm font-black text-neutral-900 tracking-tight">
              Formulir Pemesanan
            </h1>

            <div className="w-12 text-right">
              <span className="text-[11px] font-bold text-neutral-400">
                PO Fresh
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 space-y-4">
          
          {/* Order Success State */}
          {isOrderPlaced ? (
            <div className="bg-white rounded-3xl p-6 text-center border border-neutral-200/80 shadow-xs space-y-4 animate-in zoom-in-95 duration-200 my-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-black text-neutral-900">Pesanan Telah Dikirim!</h2>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Detail pesanan Anda sedang dialihkan ke WhatsApp Admin <b>Anu CiRENG</b> untuk konfirmasi dan proses pembuatan.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-2xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Katalog Menu</span>
                </Link>
              </div>
            </div>
          ) : isLoaded && items.length === 0 ? (
            /* Empty Cart State */
            <div className="bg-white rounded-3xl p-8 text-center border border-neutral-200/80 shadow-xs space-y-4 my-8">
              <div className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-300 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-800">Keranjang Masih Kosong</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Pilih menu camilan favorit Anda terlebih dahulu.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl transition-colors shadow-md shadow-red-200"
              >
                <span>Lihat Daftar Menu</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            /* Active Checkout Form */
            <form onSubmit={handleCheckoutWhatsApp} className="space-y-4 text-xs">
              
              {/* Card 1: Order Summary List */}
              <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <h3 className="font-black text-xs text-neutral-900 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-red-600" />
                    <span>Ringkasan Pesanan ({items.length} Menu)</span>
                  </h3>
                  <Link
                    href="/"
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    Ubah Menu
                  </Link>
                </div>

                <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto no-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-100">
                          <Image
                            src={item.image_url || "/logo.jpg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-neutral-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            {formatRupiah(item.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <span className="font-black text-xs text-neutral-900 shrink-0">
                        {formatRupiah(item.itemTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Customer Identity Form */}
              <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
                <h3 className="font-black text-xs text-neutral-900 flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                  <User className="w-4 h-4 text-red-600" />
                  <span>Data Diri Pemesan</span>
                </h3>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Nama Pemesan *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Kak Dinda"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-medium"
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-red-500 font-bold mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-medium"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-[11px] text-red-500 font-bold mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Card 3: Order Type & Delivery Address */}
              <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
                <h3 className="font-black text-xs text-neutral-900 flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                  <Truck className="w-4 h-4 text-red-600" />
                  <span>Metode Pengambilan Pesanan</span>
                </h3>

                {/* Toggle Order Type */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "delivery", label: "Delivery", desc: "Kirim Kurir", icon: Truck },
                    { id: "takeaway", label: "Takeaway", desc: "Ambil Sendiri", icon: ShoppingBag },
                    { id: "dine_in", label: "Dine In", desc: "Makan di Sini", icon: Utensils }
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

                {/* Delivery Address Input */}
                {orderType === "delivery" && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <label className="font-bold text-neutral-700 block mb-1">
                      Alamat Lengkap Pengiriman *
                    </label>
                    <div className="relative">
                      <textarea
                        rows={2}
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Nama jalan, nomor rumah, RT/RW, patokan lokasi..."
                        className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-medium leading-relaxed"
                      />
                    </div>
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

              {/* Card 4: Payment Method */}
              <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
                <h3 className="font-black text-xs text-neutral-900 flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                  <CreditCard className="w-4 h-4 text-red-600" />
                  <span>Pilihan Metode Pembayaran</span>
                </h3>

                <div className="space-y-2">
                  {[
                    { id: "qris", label: "QRIS (Semua E-Wallet & M-Banking)", desc: "Scan barcode instan (GoPay, OVO, Dana, BCA, dll)" },
                    { id: "transfer", label: "Transfer Bank", desc: "Transfer manual ke rekening resmi toko" },
                    { id: "cash", label: "Tunai / Cash", desc: "Bayar langsung saat pesanan diambil / diterima" }
                  ].map((p) => {
                    const isSelected = paymentMethod === p.id;
                    return (
                      <label
                        key={p.id}
                        onClick={() => setPaymentMethod(p.id as any)}
                        className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-red-50/70 border-red-400 shadow-2xs"
                            : "bg-neutral-50 border-neutral-200/80 hover:border-neutral-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={isSelected}
                          onChange={() => setPaymentMethod(p.id as any)}
                          className="mt-0.5 accent-red-600"
                        />
                        <div className="min-w-0">
                          <p className={`font-bold text-xs leading-none ${isSelected ? "text-red-900" : "text-neutral-900"}`}>
                            {p.label}
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-1 leading-snug">
                            {p.desc}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Card 5: Promo Code Input */}
              <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-2.5">
                <h3 className="font-black text-xs text-neutral-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>Kupon / Kode Promo</span>
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Masukkan kode promo..."
                    className="flex-1 px-3.5 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none uppercase font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Gunakan
                  </button>
                </div>

                {appliedPromo && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-800">
                    <span className="font-bold">✓ Promo {appliedPromo.code}: Diskon {formatRupiah(appliedPromo.discount)}</span>
                    <button
                      type="button"
                      onClick={() => setAppliedPromo(null)}
                      className="text-emerald-700 underline font-bold"
                    >
                      Batal
                    </button>
                  </div>
                )}

                {promoError && (
                  <p className="text-[11px] text-red-500 font-bold">
                    {promoError}
                  </p>
                )}
              </div>

              {/* Card 6: Payment Breakdown & Total */}
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

              {/* Big Submit Button — Send Order to WhatsApp */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.98] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Memproses Pesanan..." : "Kirim Pesanan ke WhatsApp"}</span>
                </button>
                <p className="text-[10px] text-neutral-400 text-center mt-2">
                  Format pesanan akan otomatis terkirim rapi ke WhatsApp toko untuk konfirmasi pesanan.
                </p>
              </div>

            </form>
          )}

        </div>

      </div>
    </DesktopPhoneFrame>
  );
}
