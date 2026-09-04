import { CartItem, OrderCustomerInfo } from "./types";

/** Nomor WhatsApp admin — hanya bisa diubah lewat kode sumber */
export const WHATSAPP_NUMBER = "083871136586";

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount).replace("Rp", "Rp ");
}

export function buildWhatsAppMessage(
  orderId: string,
  items: CartItem[],
  customer: OrderCustomerInfo,
  subtotal: number,
  discount: number,
  deliveryFee: number,
  totalAmount: number,
  promoCode?: string
): string {
  const dateStr = new Date().toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  });

  const orderTypeLabels: { [key: string]: string } = {
    delivery: "🛵 Pesan Antar (Delivery ke Alamat)",
    takeaway: "🛍️ Ambil Sendiri (Takeaway / Pickup)",
    dine_in: "🍽️ Makan di Tempat (Dine In)"
  };

  const paymentLabels: { [key: string]: string } = {
    qris: "📱 QRIS (Semua E-Wallet / M-Banking)",
    transfer: "🏦 Transfer Bank",
    cash: "💵 Bayar Tunai (Cash / COD)"
  };

  let msg = `Halo *Cireng Anu!* 👋✨\n`;
  msg += `Saya mau pesan makanan lezat dari *Cireng Anu*:\n\n`;

  msg += `📋 *NO. PESANAN: #${orderId}*\n`;
  msg += `🕒 Waktu Pemesanan: ${dateStr}\n`;
  msg += `⚡ *Status: Pesanan Langsung (Order Online)*\n`;
  msg += `-------------------------\n\n`;

  msg += `🍟 *RINCIAN MENU PESANAN:*\n`;

  items.forEach((item, index) => {
    msg += `*${index + 1}. ${item.name}* (x${item.quantity})\n`;
    if (item.options?.variant) {
      msg += `   + Varian: ${item.options.variant}\n`;
    }
    if (item.options?.spicyLevel) {
      msg += `   + Level: ${item.options.spicyLevel}\n`;
    }
    if (item.options?.extraToppings && item.options.extraToppings.length > 0) {
      msg += `   + Ekstra: ${item.options.extraToppings.join(", ")}\n`;
    }
    if (item.itemNotes) {
      msg += `   + Catatan: _${item.itemNotes}_\n`;
    }
    msg += `   💰 Subtotal Menu: ${formatRupiah(item.itemTotal)}\n\n`;
  });

  msg += `-------------------------\n`;
  msg += `📦 Subtotal: *${formatRupiah(subtotal)}*\n`;
  if (discount > 0) {
    msg += `🏷️ Diskon Promo${promoCode ? ` (${promoCode})` : ""}: -${formatRupiah(discount)}\n`;
  }
  if (customer.orderType === "delivery") {
    msg += `🛵 Ongkir Pengiriman: ${deliveryFee > 0 ? formatRupiah(deliveryFee) : "Gratis"}\n`;
  }
  msg += `💰 *TOTAL PEMBAYARAN: ${formatRupiah(totalAmount)}*\n`;
  msg += `-------------------------\n\n`;

  msg += `👤 *DATA PEMESAN:*\n`;
  msg += `• *Nama Pelanggan:* ${customer.name}\n`;
  msg += `• *No. WhatsApp:* ${customer.phone}\n`;
  msg += `• *Metode Penerimaan:* ${orderTypeLabels[customer.orderType] || customer.orderType}\n`;

  if (customer.orderType === "delivery" && customer.address) {
    msg += `• *Alamat Pengiriman:* ${customer.address}\n`;
  }

  msg += `• *Metode Bayar:* ${paymentLabels[customer.paymentMethod] || customer.paymentMethod}\n`;

  if (customer.notes) {
    msg += `• *Catatan Pesanan:* _"${customer.notes}"_\n`;
  }

  msg += `\nMohon konfirmasi pesanan dan estimasi waktu penyiapan/pengantarannya ya min. Terima kasih! 🙏✨`;

  return msg;
}

export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  let cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  if (cleanNumber.startsWith("0")) {
    cleanNumber = "62" + cleanNumber.substring(1);
  }
  if (!cleanNumber.startsWith("62")) {
    cleanNumber = "62" + cleanNumber;
  }
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
