"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Download,
  Printer,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Settings,
  Phone,
  Store,
  RefreshCw,
  Search,
  Filter,
  FileText
} from "lucide-react";
import { MenuItem, OrderRecord, StoreSettings } from "@/lib/types";
import { formatRupiah } from "@/lib/whatsapp";
import { getOrders, updateOrderStatus, deleteMenu, saveStoreSettings } from "@/lib/supabase";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  menus: MenuItem[];
  onRefreshMenus: () => void;
  onOpenAddMenu: () => void;
  onOpenEditMenu: (item: MenuItem) => void;
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (settings: StoreSettings) => void;
}

export default function SalesReportView({
  isOpen,
  onClose,
  menus,
  onRefreshMenus,
  onOpenAddMenu,
  onOpenEditMenu,
  storeSettings,
  onUpdateStoreSettings
}: Props) {
  const [activeTab, setActiveTab] = useState<"orders" | "report" | "menus" | "settings">("orders");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [searchOrder, setSearchOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<OrderRecord | null>(null);

  // Settings form state
  const [waNumber, setWaNumber] = useState(storeSettings.whatsapp_number);
  const [storeName, setStoreName] = useState(storeSettings.store_name);
  const [isOpenStore, setIsOpenStore] = useState(storeSettings.is_open);
  const [deliveryFee, setDeliveryFee] = useState(storeSettings.delivery_fee_default);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const fetchOrderHistory = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrderHistory();
      setWaNumber(storeSettings.whatsapp_number);
      setStoreName(storeSettings.store_name);
      setIsOpenStore(storeSettings.is_open);
      setDeliveryFee(storeSettings.delivery_fee_default);
    }
  }, [isOpen, storeSettings]);

  if (!isOpen) return null;

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.customer_phone.includes(searchOrder) ||
      o.id.toLowerCase().includes(searchOrder.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalRevenue = orders
    .filter((o) => o.status !== "Dibatalkan")
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter((o) => o.status === "Selesai").length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / (totalOrdersCount || 1)) : 0;

  // Top Selling Items aggregation
  const itemSalesMap: { [name: string]: { qty: number; revenue: number } } = {};
  orders.forEach((ord) => {
    if (ord.status !== "Dibatalkan" && Array.isArray(ord.items)) {
      ord.items.forEach((it) => {
        if (!itemSalesMap[it.name]) {
          itemSalesMap[it.name] = { qty: 0, revenue: 0 };
        }
        itemSalesMap[it.name].qty += it.quantity;
        itemSalesMap[it.name].revenue += it.itemTotal;
      });
    }
  });

  const topItems = Object.entries(itemSalesMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.qty - a.qty);

  // Status Change
  const handleStatusChange = async (orderId: string, newStatus: OrderRecord["status"]) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Delete menu item
  const handleDeleteMenu = async (id: string, name: string) => {
    if (window.confirm(`Hapus menu "${name}" dari katalog?`)) {
      await deleteMenu(id);
      onRefreshMenus();
    }
  };

  // Export CSV
  const exportToCsv = () => {
    const headers = ["ID Pesanan,Tanggal,Nama Pelanggan,No HP,Metode,Total,Status,Catatan"];
    const rows = orders.map((o) => {
      const date = new Date(o.created_at).toLocaleString("id-ID");
      return `"${o.id}","${date}","${o.customer_name}","${o.customer_phone}","${o.order_type}","${o.total_amount}","${o.status}","${o.customer_notes || ""}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Penjualan_Cireng_Anu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    const updated: StoreSettings = {
      ...storeSettings,
      whatsapp_number: waNumber,
      store_name: storeName,
      is_open: isOpenStore,
      delivery_fee_default: Number(deliveryFee)
    };
    await saveStoreSettings(updated);
    onUpdateStoreSettings(updated);
    setIsSavingSettings(false);
    alert("Pengaturan toko berhasil disimpan!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FAFAFC] rounded-3xl shadow-2xl h-[92vh] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-neutral-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-black flex items-center gap-1.5 text-white">
                <span>Dashboard Admin & Laporan</span>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.2 rounded-full">Supabase</span>
              </h2>
              <p className="text-[10px] text-neutral-400">Cireng Anu Management Hub</p>
            </div>
          </div>

          <button
            onClick={fetchOrderHistory}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 transition-colors cursor-pointer"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-neutral-200/80 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-bold">
          {[
            { id: "orders", label: `Pesanan Masuk (${orders.length})`, icon: ShoppingBag },
            { id: "report", label: "Laporan Penjualan", icon: TrendingUp },
            { id: "menus", label: `Katalog Menu (${menus.length})`, icon: Plus },
            { id: "settings", label: "Pengaturan Toko", icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-3 px-3 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "border-red-600 text-red-600"
                    : "border-transparent text-neutral-500 hover:text-neutral-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar text-xs">
          
          {/* TAB 1: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3" />
                  <input
                    type="text"
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    placeholder="Cari ID, nama pelanggan, no WA..."
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none text-xs"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {["all", "Baru", "Diproses", "Selesai", "Dibatalkan"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        statusFilter === st
                          ? "bg-neutral-900 text-white"
                          : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      {st === "all" ? "Semua" : st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order List */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-neutral-100">
                  <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="font-bold text-neutral-700">Belum ada pesanan yang sesuai</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Pesanan baru yang dikirim customer via WhatsApp akan otomatis tercatat di sini</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredOrders.map((ord) => {
                    const statusColors: { [k: string]: string } = {
                      Baru: "bg-amber-100 text-amber-900 border-amber-300",
                      Diproses: "bg-blue-100 text-blue-900 border-blue-300",
                      Selesai: "bg-emerald-100 text-emerald-900 border-emerald-300",
                      Dibatalkan: "bg-red-100 text-red-900 border-red-300"
                    };

                    return (
                      <div
                        key={ord.id}
                        className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-neutral-900">#{ord.id}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  statusColors[ord.status] || "bg-neutral-100 text-neutral-700"
                                }`}
                              >
                                {ord.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {new Date(ord.created_at).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short"
                              })}
                            </p>
                          </div>

                          <span className="text-sm font-black text-red-600">
                            {formatRupiah(ord.total_amount)}
                          </span>
                        </div>

                        {/* Customer details */}
                        <div className="bg-neutral-50 p-2.5 rounded-xl text-[11px] space-y-1">
                          <p className="font-bold text-neutral-800">
                            ?? {ord.customer_name} ({ord.customer_phone}) �{" "}
                            <span className="capitalize">{ord.order_type}</span>
                          </p>
                          {ord.delivery_address && (
                            <p className="text-neutral-600">?? {ord.delivery_address}</p>
                          )}
                          {ord.customer_notes && (
                            <p className="text-neutral-500 italic">Catatan: &ldquo;{ord.customer_notes}&rdquo;</p>
                          )}

                          {/* Items summary */}
                          <div className="pt-1 border-t border-neutral-200/60 text-neutral-700 font-medium">
                            {Array.isArray(ord.items) &&
                              ord.items.map((it, idx) => (
                                <span key={idx} className="inline-block mr-2">
                                  � {it.name} (x{it.quantity})
                                </span>
                              ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <button
                            onClick={() => setSelectedOrderForReceipt(ord)}
                            className="flex items-center gap-1 font-bold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Lihat Struk</span>
                          </button>

                          {/* Status changer buttons */}
                          <div className="flex items-center gap-1">
                            {["Baru", "Diproses", "Selesai"].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(ord.id, st as any)}
                                className={`px-2 py-0.8 rounded-lg font-bold transition-all cursor-pointer ${
                                  ord.status === st
                                    ? "bg-neutral-900 text-white"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SALES REPORT & ANALYTICS */}
          {activeTab === "report" && (
            <div className="space-y-4">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 font-bold block">Total Omset</span>
                  <span className="text-sm font-black text-red-600 mt-0.5 block">
                    {formatRupiah(totalRevenue)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 font-bold block">Total Pesanan</span>
                  <span className="text-sm font-black text-neutral-900 mt-0.5 block">
                    {totalOrdersCount} Transaksi
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 font-bold block">Pesanan Selesai</span>
                  <span className="text-sm font-black text-emerald-600 mt-0.5 block">
                    {completedOrdersCount} Selesai
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs">
                  <span className="text-[10px] text-neutral-400 font-bold block">Rata-rata Order</span>
                  <span className="text-sm font-black text-amber-600 mt-0.5 block">
                    {formatRupiah(averageOrderValue)}
                  </span>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-amber-600 p-3.5 rounded-2xl text-white shadow-md">
                <div>
                  <h4 className="font-extrabold text-xs">Unduh Laporan Penjualan</h4>
                  <p className="text-[10px] text-white/80">Export seluruh riwayat pesanan ke format Excel / CSV</p>
                </div>
                <button
                  onClick={exportToCsv}
                  className="bg-white hover:bg-neutral-100 active:scale-95 text-neutral-900 px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>

              {/* Top Selling Menu Table */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3">
                <h4 className="font-extrabold text-xs text-neutral-900 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  <span>Menu Paling Laris (Top Sellers)</span>
                </h4>

                {topItems.length === 0 ? (
                  <p className="text-neutral-400 text-[11px]">Belum ada data penjualan tercatat.</p>
                ) : (
                  <div className="space-y-2">
                    {topItems.slice(0, 5).map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-neutral-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-neutral-800">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-neutral-900">{item.qty} terjual</span>
                          <span className="text-[10px] text-neutral-400 block">{formatRupiah(item.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MENUS CRUD */}
          {activeTab === "menus" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-neutral-900">Manajemen Katalog Menu</h4>
                  <p className="text-[10px] text-neutral-400">Tambah, ubah harga, foto, atau hapus menu cireng</p>
                </div>
                <button
                  onClick={onOpenAddMenu}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-3 py-2 rounded-xl font-bold flex items-center gap-1 shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Menu</span>
                </button>
              </div>

              <div className="space-y-2">
                {menus.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                      <Image src={item.image_url || "/logo.jpg"} alt={item.name} fill className="object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-extrabold text-xs text-neutral-900 truncate">{item.name}</h5>
                        {!item.is_available && (
                          <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded-md">Habis</span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate">{item.unit_info} � {item.category}</p>
                      <p className="text-xs font-black text-red-600 mt-0.5">{formatRupiah(item.price)}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditMenu(item)}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(item.id, item.name)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STORE SETTINGS */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-3.5">
              <h4 className="font-black text-neutral-900 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-red-600" />
                <span>Pengaturan Kontak & Toko</span>
              </h4>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">
                  Nomor WhatsApp Penerima Pesanan (Admin)
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="6281234567890"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none font-bold"
                  />
                </div>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Awali dengan kode negara (contoh: 6281234567890)
                </span>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Nama Toko / Brand</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Ongkir Default (Delivery)</label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Status Toko</label>
                <button
                  type="button"
                  onClick={() => setIsOpenStore(!isOpenStore)}
                  className={`w-full py-2 px-3 rounded-xl font-bold border transition-colors cursor-pointer text-center ${
                    isOpenStore
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : "bg-red-50 text-red-800 border-red-300"
                  }`}
                >
                  {isOpenStore ? "?? Toko Sedang Buka (Menerima Pesanan)" : "?? Toko Tutup Sementara"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSavingSettings}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold shadow-md cursor-pointer transition-all active:scale-95"
              >
                {isSavingSettings ? "Menyimpan..." : "Simpan Pengaturan"}
              </button>
            </form>
          )}

        </div>

        {/* Receipt Modal Viewer if clicked */}
        {selectedOrderForReceipt && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-dashed border-neutral-300">
                <h3 className="font-black text-base text-neutral-900">Cireng Anu</h3>
                <p className="text-[10px] text-neutral-400">Struk Pemesanan #{selectedOrderForReceipt.id}</p>
                <p className="text-[10px] text-neutral-400">
                  {new Date(selectedOrderForReceipt.created_at).toLocaleString("id-ID")}
                </p>
              </div>

              <div className="space-y-1 text-[11px]">
                <p><strong>Nama:</strong> {selectedOrderForReceipt.customer_name}</p>
                <p><strong>Kontak:</strong> {selectedOrderForReceipt.customer_phone}</p>
                <p><strong>Tipe:</strong> {selectedOrderForReceipt.order_type}</p>
                {selectedOrderForReceipt.delivery_address && (
                  <p><strong>Alamat:</strong> {selectedOrderForReceipt.delivery_address}</p>
                )}
              </div>

              <div className="py-2 border-y border-dashed border-neutral-300 space-y-1">
                {selectedOrderForReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.name} x{it.quantity}</span>
                    <span className="font-bold">{formatRupiah(it.itemTotal)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 text-right font-bold text-[11px]">
                <p>Subtotal: {formatRupiah(selectedOrderForReceipt.subtotal)}</p>
                {selectedOrderForReceipt.discount > 0 && (
                  <p className="text-emerald-600">Diskon: -{formatRupiah(selectedOrderForReceipt.discount)}</p>
                )}
                <p>Ongkir: {formatRupiah(selectedOrderForReceipt.delivery_fee)}</p>
                <p className="text-sm font-black text-red-600 pt-1">
                  Total: {formatRupiah(selectedOrderForReceipt.total_amount)}
                </p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-neutral-900 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setSelectedOrderForReceipt(null)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
