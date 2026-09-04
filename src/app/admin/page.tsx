"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  TrendingUp,
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Settings,
  Phone,
  Store,
  RefreshCw,
  Search,
  Download,
  Printer,
  FileText,
  ArrowLeft,
  Eye,
  EyeOff,
  LogOut,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { MenuItem, OrderRecord, StoreSettings } from "@/lib/types";
import { formatRupiah } from "@/lib/whatsapp";
import {
  getMenus,
  saveMenu,
  deleteMenu,
  getOrders,
  updateOrderStatus,
  getStoreSettings,
  saveStoreSettings
} from "@/lib/supabase";
import { INITIAL_MENUS, DEFAULT_STORE_SETTINGS } from "@/lib/initialData";
import AdminMenuModal from "@/components/AdminMenuModal";

const ADMIN_AUTH_KEY = "anu_cireng_admin_authenticated";
const ADMIN_PIN_KEY = "anu_cireng_admin_pin";
const DEFAULT_PIN = "1234";

type AdminTab = "orders" | "report" | "menus" | "settings";

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [showPin, setShowPin] = useState(false);

  // PIN settings state
  const [currentSavedPin, setCurrentSavedPin] = useState(DEFAULT_PIN);
  const [oldPinInput, setOldPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [pinChangeSuccess, setPinChangeSuccess] = useState("");
  const [pinChangeError, setPinChangeError] = useState("");

  // Admin Data State
  const [activeTab, setActiveTab] = useState<AdminTab>("orders");
  const [menus, setMenus] = useState<MenuItem[]>(INITIAL_MENUS);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Menu Modal State
  const [adminEditingMenu, setAdminEditingMenu] = useState<MenuItem | null>(null);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  // Order Filter & Receipt State
  const [searchOrder, setSearchOrder] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<OrderRecord | null>(null);

  // Menu Filter State
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState<string>("all");

  // Settings form state
  const [waNumber, setWaNumber] = useState(DEFAULT_STORE_SETTINGS.whatsapp_number);
  const [storeName, setStoreName] = useState(DEFAULT_STORE_SETTINGS.store_name);
  const [isOpenStore, setIsOpenStore] = useState(DEFAULT_STORE_SETTINGS.is_open);
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_STORE_SETTINGS.delivery_fee_default);
  const [openingHours, setOpeningHours] = useState(DEFAULT_STORE_SETTINGS.opening_hours);
  const [storeAddress, setStoreAddress] = useState(DEFAULT_STORE_SETTINGS.store_address);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMsg, setSettingsSuccessMsg] = useState("");

  // Check auth & load data on mount
  useEffect(() => {
    try {
      const savedAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
      const customPin = localStorage.getItem(ADMIN_PIN_KEY);
      if (customPin) {
        setCurrentSavedPin(customPin);
      }
    } catch {}

    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setIsRefreshing(true);
    try {
      const [fetchedMenus, fetchedOrders, fetchedSettings] = await Promise.all([
        getMenus(),
        getOrders(),
        getStoreSettings()
      ]);

      if (fetchedMenus && fetchedMenus.length > 0) {
        setMenus(fetchedMenus);
      }
      if (fetchedOrders) {
        setOrders(fetchedOrders);
      }
      if (fetchedSettings) {
        setStoreSettings(fetchedSettings);
        setWaNumber(fetchedSettings.whatsapp_number);
        setStoreName(fetchedSettings.store_name);
        setIsOpenStore(fetchedSettings.is_open);
        setDeliveryFee(fetchedSettings.delivery_fee_default);
        setOpeningHours(fetchedSettings.opening_hours);
        setStoreAddress(fetchedSettings.store_address);
      }
    } catch (err) {
      console.warn("Failed to load admin data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle PIN login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === currentSavedPin) {
      setIsAuthenticated(true);
      setPinError("");
      try {
        sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
      } catch {}
    } else {
      setPinError("PIN Admin salah! Silakan coba lagi.");
      setPinInput("");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput("");
    setPinError("");
    try {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
    } catch {}
  };

  // Handle Change PIN
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeSuccess("");
    setPinChangeError("");

    if (oldPinInput !== currentSavedPin) {
      setPinChangeError("PIN lama salah!");
      return;
    }

    if (newPinInput.length < 4) {
      setPinChangeError("PIN baru minimal 4 digit angka!");
      return;
    }

    setCurrentSavedPin(newPinInput);
    try {
      localStorage.setItem(ADMIN_PIN_KEY, newPinInput);
    } catch {}

    setOldPinInput("");
    setNewPinInput("");
    setPinChangeSuccess("PIN Admin berhasil diperbarui!");
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccessMsg("");
    try {
      const updated: StoreSettings = {
        whatsapp_number: waNumber,
        store_name: storeName,
        is_open: isOpenStore,
        delivery_fee_default: Number(deliveryFee),
        opening_hours: openingHours,
        store_address: storeAddress
      };
      await saveStoreSettings(updated);
      setStoreSettings(updated);
      setSettingsSuccessMsg("Pengaturan toko berhasil disimpan!");
      setTimeout(() => setSettingsSuccessMsg(""), 3500);
    } catch (err) {
      alert("Gagal menyimpan pengaturan.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Status Change for Orders
  const handleStatusChange = async (orderId: string, newStatus: OrderRecord["status"]) => {
    await updateOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  // Delete Menu Item
  const handleDeleteMenu = async (id: string, name: string) => {
    if (window.confirm(`Hapus menu "${name}" dari katalog?`)) {
      await deleteMenu(id);
      loadAllAdminData();
    }
  };

  // Toggle Menu Availability
  const handleToggleMenuAvailability = async (item: MenuItem) => {
    const updated = { ...item, is_available: !item.is_available };
    await saveMenu(updated);
    loadAllAdminData();
  };

  // Update Stock
  const handleUpdateStock = async (item: MenuItem, delta: number) => {
    if (item.stock === null) return; // unlimited, do nothing
    const newStock = Math.max(0, item.stock + delta);
    const updated = { ...item, stock: newStock, is_available: newStock > 0 ? item.is_available : false };
    await saveMenu(updated);
    loadAllAdminData();
  };

  // Export Data to CSV (Exclusive to Admin)
  const exportToCsv = () => {
    const headers = [
      "ID Pesanan",
      "Tanggal & Waktu",
      "Nama Pelanggan",
      "No WhatsApp",
      "Tipe Pesanan",
      "Alamat Pengiriman",
      "Detail Menu Item",
      "Subtotal",
      "Diskon",
      "Ongkir",
      "Total Pembayaran",
      "Metode Bayar",
      "Status",
      "Catatan Pelanggan"
    ];

    const rows = orders.map((o) => {
      const date = new Date(o.created_at).toLocaleString("id-ID");
      const itemsSummary = Array.isArray(o.items)
        ? o.items.map((it) => `${it.name} (x${it.quantity})`).join(" | ")
        : "";

      return [
        `"${o.id}"`,
        `"${date}"`,
        `"${(o.customer_name || "").replace(/"/g, '""')}"`,
        `"${o.customer_phone || ""}"`,
        `"${o.order_type || ""}"`,
        `"${(o.delivery_address || "").replace(/"/g, '""')}"`,
        `"${itemsSummary.replace(/"/g, '""')}"`,
        o.subtotal || 0,
        o.discount || 0,
        o.delivery_fee || 0,
        o.total_amount || 0,
        `"${o.payment_method || ""}"`,
        `"${o.status}"`,
        `"${(o.customer_notes || "").replace(/"/g, '""')}"`
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Laporan_Penjualan_Anu_Cireng_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Metrics Calculation
  const totalRevenue = orders
    .filter((o) => o.status !== "Dibatalkan")
    .reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter((o) => o.status === "Selesai").length;
  const pendingOrdersCount = orders.filter((o) => o.status === "Baru" || o.status === "Diproses").length;
  const averageOrderValue =
    totalOrdersCount > 0 ? Math.round(totalRevenue / (totalOrdersCount || 1)) : 0;

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

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(searchOrder.toLowerCase()) ||
      o.customer_phone.includes(searchOrder) ||
      o.id.toLowerCase().includes(searchOrder.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Menus
  const filteredMenus = menus.filter((item) => {
    const matchesCategory =
      menuCategoryFilter === "all" || item.category === menuCategoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Nav Items Configuration matching the reference design
  const NAV_ITEMS: {
    id: AdminTab;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number | null;
  }[] = [
    {
      id: "orders",
      label: "Pesanan Masuk",
      shortLabel: "Pesanan",
      icon: ShoppingBag,
      count: pendingOrdersCount > 0 ? pendingOrdersCount : (orders.length > 0 ? orders.length : null)
    },
    {
      id: "report",
      label: "Laporan & Omset",
      shortLabel: "Laporan",
      icon: TrendingUp,
      count: null
    },
    {
      id: "menus",
      label: "Katalog Menu",
      shortLabel: "Menu",
      icon: Sparkles,
      count: menus.length
    },
    {
      id: "settings",
      label: "Pengaturan & PIN",
      shortLabel: "Pengaturan",
      icon: Settings,
      count: null
    }
  ];

  // ==========================================
  // VIEW: PIN LOCKSCREEN IF NOT AUTHENTICATED
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950 flex flex-col items-center justify-center p-4 selection:bg-red-500 selection:text-white">
        <div className="w-full max-w-md bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center relative z-10 space-y-2 mb-6">
            <div className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden shadow-xl border-2 border-red-500/80 mb-3">
              <Image src="/logo.jpg" alt="Logo" fill sizes="64px" className="object-cover" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
              <Shield className="w-3.5 h-3.5" /> Portal Khusus Admin
            </span>
            <h1 className="text-xl font-black text-white">Cireng Anu Management</h1>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto">
              Masukkan PIN Admin untuk mengelola data menu, pesanan, dan ekspor laporan penjualan.
            </p>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-2 text-center">
                PIN Admin (Default: 1234)
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-4 pointer-events-none" />
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={10}
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError("");
                  }}
                  placeholder="Masukkan PIN..."
                  className="w-full pl-11 pr-11 py-3 bg-neutral-950 text-white font-mono text-center tracking-widest text-lg rounded-2xl border border-neutral-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {pinError && (
                <div className="mt-2 text-xs font-bold text-red-400 flex items-center justify-center gap-1 animate-shake">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Buka Dashboard Admin</span>
            </button>
          </form>

          {/* Quick Return to Store Link */}
          <div className="mt-6 pt-5 border-t border-neutral-800 text-center relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Customer</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F4F4F8] text-neutral-900 flex flex-col selection:bg-red-500 selection:text-white relative">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-neutral-900 text-white shadow-lg border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          
          {/* Brand & Store status badge */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-red-500/80 shrink-0">
              <Image src="/logo.jpg" alt="Logo" fill sizes="36px" className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1 text-white">
                  Anu <span className="text-red-500">CiRENG</span>
                  <span className="text-[10px] font-bold bg-red-600/80 text-white px-2 py-0.5 rounded-full ml-1">
                    ADMIN
                  </span>
                </h1>
                <span
                  className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    storeSettings.is_open
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                      : "bg-red-950 text-red-300 border border-red-700"
                  }`}
                >
                  {storeSettings.is_open ? "● Toko Buka" : "● Toko Tutup"}
                </span>
              </div>
              <p className="text-[10px] text-neutral-400">Pusat Kelola Data, Menu & Penjualan</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Optional on desktop, while mobile uses the sleek floating bottom pill) */}
          <div className="hidden lg:flex items-center gap-1 bg-neutral-950/80 p-1 rounded-full border border-neutral-800">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-white text-neutral-950 font-black shadow-sm scale-100"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-red-600" : ""}`} />
                  <span>{item.shortLabel}</span>
                  {item.count !== null && item.count !== undefined && item.count > 0 && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? "bg-red-600 text-white" : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions: Customer Preview, Refresh, Logout */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-neutral-700"
              title="Buka tampilan toko customer di tab baru"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Lihat Toko</span>
            </Link>

            <button
              onClick={loadAllAdminData}
              disabled={isRefreshing}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded-xl transition-all cursor-pointer border border-neutral-700"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/40 cursor-pointer"
              title="Kunci / Keluar Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (With extra bottom padding for floating mobile pill bar) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-24 space-y-6">
        
        {/* =======================================================
            TAB 1: ORDERS MANAGEMENT
        ======================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Header & Filter Row */}
            <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-red-600" />
                    <span>Daftar Pesanan Masuk ({orders.length})</span>
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Kelola status pesanan dari customer, cetak struk, atau hubungi pelanggan via WhatsApp.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportToCsv}
                    className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-2.5 pt-2 border-t border-neutral-100">
                <div className="flex-1 relative flex items-center">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    placeholder="Cari ID pesanan, nama customer, atau nomor WhatsApp..."
                    className="w-full pl-10 pr-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none text-xs font-medium"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
                  {["all", "Baru", "Diproses", "Selesai", "Dibatalkan"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        statusFilter === st
                          ? "bg-neutral-900 text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {st === "all" ? "Semua Status" : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Orders List Grid */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200/80 shadow-xs">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-bold text-neutral-700 text-sm">Tidak ada pesanan yang sesuai</h3>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  Pesanan baru yang dikirim pelanggan via WhatsApp akan otomatis tercatat di halaman ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredOrders.map((ord) => {
                  const statusColors: { [k: string]: string } = {
                    Baru: "bg-amber-100 text-amber-900 border-amber-300",
                    Diproses: "bg-blue-100 text-blue-900 border-blue-300",
                    Selesai: "bg-emerald-100 text-emerald-900 border-emerald-300",
                    Dibatalkan: "bg-red-100 text-red-900 border-red-300"
                  };

                  const cleanPhone = (ord.customer_phone || "").replace(/[^0-9]/g, "");
                  const waCustomerUrl = `https://wa.me/${cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone}`;

                  return (
                    <div
                      key={ord.id}
                      className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        {/* Order Header */}
                        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-neutral-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-neutral-900 text-sm">#{ord.id}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  statusColors[ord.status] || "bg-neutral-100 text-neutral-700"
                                }`}
                              >
                                {ord.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(ord.created_at).toLocaleString("id-ID", {
                                dateStyle: "medium",
                                timeStyle: "short"
                              })}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-base font-black text-red-600 block">
                              {formatRupiah(ord.total_amount)}
                            </span>
                            <span className="text-[10px] text-neutral-400 uppercase font-bold">
                              {ord.payment_method}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Delivery Details */}
                        <div className="mt-2.5 bg-neutral-50 p-3 rounded-2xl text-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-neutral-800">
                              👤 {ord.customer_name}
                            </p>
                            <a
                              href={waCustomerUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-lg transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{ord.customer_phone}</span>
                            </a>
                          </div>

                          <p className="text-neutral-600 font-medium">
                            📦 Tipe: <span className="capitalize font-bold text-neutral-900">{ord.order_type}</span>
                          </p>

                          {ord.delivery_address && (
                            <p className="text-neutral-600">
                              📍 <span className="text-neutral-800 font-medium">{ord.delivery_address}</span>
                            </p>
                          )}

                          {ord.customer_notes && (
                            <p className="text-neutral-500 italic bg-amber-50/60 p-1.5 rounded-lg border border-amber-100">
                              📝 &ldquo;{ord.customer_notes}&rdquo;
                            </p>
                          )}

                          {/* Items summary */}
                          <div className="pt-2 border-t border-neutral-200/60 text-neutral-700 font-medium space-y-1">
                            {Array.isArray(ord.items) &&
                              ord.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <span>
                                    • {it.name} <span className="font-bold text-neutral-900">x{it.quantity}</span>
                                    {it.options?.variant && ` (${it.options.variant})`}
                                    {it.options?.spicyLevel && ` (${it.options.spicyLevel})`}
                                  </span>
                                  <span className="font-bold text-neutral-800">{formatRupiah(it.itemTotal)}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions row: View Receipt & Status Change */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 text-xs">
                        <button
                          onClick={() => setSelectedOrderForReceipt(ord)}
                          className="flex items-center gap-1 font-bold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Lihat Struk</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-neutral-400 font-bold mr-1">Ubah Status:</span>
                          {(["Baru", "Diproses", "Selesai", "Dibatalkan"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(ord.id, st)}
                              className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] cursor-pointer ${
                                ord.status === st
                                  ? "bg-neutral-900 text-white shadow-xs"
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

        {/* =======================================================
            TAB 2: SALES REPORT, ANALYTICS & EXPORT
        ======================================================= */}
        {activeTab === "report" && (
          <div className="space-y-6">
            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Total Omset</span>
                <span className="text-xl sm:text-2xl font-black text-red-600 mt-1 block">
                  {formatRupiah(totalRevenue)}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
                  Dari pesanan berstatus aktif
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Total Transaksi</span>
                <span className="text-xl sm:text-2xl font-black text-neutral-900 mt-1 block">
                  {totalOrdersCount} Pesanan
                </span>
                <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
                  Semua riwayat pemesanan
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Pesanan Selesai</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 block">
                  {completedOrdersCount} Selesai
                </span>
                <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
                  {totalOrdersCount > 0 ? Math.round((completedOrdersCount / totalOrdersCount) * 100) : 0}% tingkat sukses
                </span>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-xs">
                <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">Rata-rata Order</span>
                <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">
                  {formatRupiah(averageOrderValue)}
                </span>
                <span className="text-[10px] text-neutral-400 font-medium mt-1 block">
                  Average order value (AOV)
                </span>
              </div>
            </div>

            {/* Exclusive Data Export Banner */}
            <div className="bg-gradient-to-r from-red-600 via-red-700 to-amber-600 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full mb-1">
                  <Shield className="w-3.5 h-3.5" /> Akses Khusus Admin
                </div>
                <h3 className="font-black text-lg">Download Data & Laporan Penjualan (CSV / Excel)</h3>
                <p className="text-xs text-white/90 max-w-xl leading-relaxed">
                  Export seluruh data transaksi pelanggan, rincian menu yang dipesan, nominal pendapatan, dan status pengiriman ke file CSV/Excel untuk rekap pembukuan toko.
                </p>
              </div>

              <button
                onClick={exportToCsv}
                className="bg-white hover:bg-neutral-100 active:scale-95 text-neutral-900 px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 text-red-600" />
                <span>Unduh Laporan CSV</span>
              </button>
            </div>

            {/* Top Selling Items Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base text-neutral-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    <span>Peringkat Menu Terlaris (Top Selling Items)</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Dihitung otomatis berdasarkan total item yang terjual</p>
                </div>
              </div>

              {topItems.length === 0 ? (
                <p className="text-neutral-400 text-xs py-4 text-center">Belum ada data penjualan tercatat.</p>
              ) : (
                <div className="space-y-2.5">
                  {topItems.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100/80 rounded-2xl transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-xl font-black flex items-center justify-center text-xs ${
                            idx === 0
                              ? "bg-amber-400 text-neutral-950 shadow-xs"
                              : idx === 1
                              ? "bg-neutral-300 text-neutral-800"
                              : idx === 2
                              ? "bg-amber-700 text-white"
                              : "bg-neutral-200 text-neutral-600"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-extrabold text-neutral-900 block">{item.name}</span>
                          <span className="text-[11px] text-neutral-400">{item.qty} porsi terjual</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-neutral-900 text-sm block">
                          {formatRupiah(item.revenue)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">Total Omset</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =======================================================
            TAB 3: MENUS CATALOG CRUD
        ======================================================= */}
        {activeTab === "menus" && (
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-neutral-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Manajemen Katalog Menu ({menus.length} Produk)</span>
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Tambah menu baru, update harga, ganti foto produk, ubah stok, dan kustomisasi rasa.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setAdminEditingMenu(null);
                    setIsMenuModalOpen(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Menu Baru</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-2.5 pt-2 border-t border-neutral-100">
                <div className="flex-1 relative flex items-center">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Cari nama menu cemilan..."
                    className="w-full pl-10 pr-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none text-xs font-medium"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs">
                  {[
                    { id: "all", label: "Semua Kategori" },
                    { id: "cireng-cimol", label: "Cireng & Cimol" },
                    { id: "pempek", label: "Pempek" },
                    { id: "cheese-roll", label: "Cheese Roll" },
                    { id: "dimsum", label: "Dimsum" },
                    { id: "siap-makan", label: "🍽️ Siap Makan" },
                    { id: "frozen", label: "❄️ Frozen" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setMenuCategoryFilter(cat.id)}
                      className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                        menuCategoryFilter === cat.id
                          ? "bg-neutral-900 text-white shadow-xs"
                          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenus.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs flex flex-col justify-between gap-3 hover:border-neutral-300 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-100">
                      <Image
                        src={item.image_url || "/logo.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                      {item.badge && (
                        <span className="absolute top-1 left-1 bg-amber-400 text-neutral-950 font-black text-[9px] px-1.5 py-0.2 rounded-md shadow-xs">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-black text-sm text-neutral-900 truncate">{item.name}</h4>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            item.is_available
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.is_available ? "Ready" : "Habis"}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
                        {item.unit_info} • {item.category}
                      </p>

                      <p className="text-sm font-black text-red-600 mt-1">
                        {formatRupiah(item.price)}
                      </p>

                      {/* Stock display */}
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {item.stock === null ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            ∞ Stok Tak Terbatas
                          </span>
                        ) : item.stock === 0 ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            ✕ Stok Habis (0)
                          </span>
                        ) : item.stock <= 5 ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                            ⚡ Sisa {item.stock} stok
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
                            📦 Stok: {item.stock}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stock Quick-Adjust Row */}
                  {item.stock !== null && (
                    <div className="px-1 pb-1">
                      <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-xl p-2">
                        <span className="text-[11px] font-bold text-neutral-500 flex-1">Atur Stok:</span>
                        <button
                          onClick={() => handleUpdateStock(item, -5)}
                          className="px-2 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-[11px] font-bold hover:bg-neutral-100 cursor-pointer"
                        >-5</button>
                        <button
                          onClick={() => handleUpdateStock(item, -1)}
                          className="px-2 py-1 rounded-lg bg-white border border-neutral-200 text-neutral-700 text-[11px] font-bold hover:bg-neutral-100 cursor-pointer"
                        >-1</button>
                        <span className="text-sm font-black text-neutral-900 min-w-[28px] text-center">{item.stock}</span>
                        <button
                          onClick={() => handleUpdateStock(item, 1)}
                          className="px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-[11px] font-bold hover:bg-emerald-50 cursor-pointer"
                        >+1</button>
                        <button
                          onClick={() => handleUpdateStock(item, 5)}
                          className="px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-[11px] font-bold hover:bg-emerald-50 cursor-pointer"
                        >+5</button>
                      </div>
                    </div>
                  )}

                  {/* Actions & Availability Toggle */}
                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => handleToggleMenuAvailability(item)}
                      className={`px-2.5 py-1.5 rounded-xl font-bold transition-all text-[11px] cursor-pointer ${
                        item.is_available
                          ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {item.is_available ? "✓ Status: Ready" : "✕ Status: Habis"}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setAdminEditingMenu(item);
                          setIsMenuModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors cursor-pointer"
                        title="Edit Menu"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(item.id, item.name)}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                        title="Hapus Menu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =======================================================
            TAB 4: STORE SETTINGS & SECURITY (PIN)
        ======================================================= */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Store Configuration Form */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <Store className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-black text-base text-neutral-900">Pengaturan Toko & WhatsApp</h3>
                  <p className="text-xs text-neutral-400">Atur nomor WhatsApp tujuan dan ongkir default</p>
                </div>
              </div>

              {settingsSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{settingsSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">
                    Nomor WhatsApp Admin Penerima Pesanan *
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5" />
                    <input
                      type="text"
                      required
                      value={waNumber}
                      onChange={(e) => setWaNumber(e.target.value)}
                      placeholder="6281234567890"
                      className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-400 mt-0.5 block">
                    Gunakan format internasional tanpa spasi/tanda hubung (Contoh: 6281234567890)
                  </span>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Nama Brand / Toko</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Ongkir Default (Pengiriman Delivery)</label>
                  <input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Jam Operasional Toko</label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="10:00 - 21:00 WIB"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Status Toko</label>
                  <button
                    type="button"
                    onClick={() => setIsOpenStore(!isOpenStore)}
                    className={`w-full py-3 px-4 rounded-xl font-bold border transition-colors cursor-pointer text-center text-xs flex items-center justify-center gap-2 ${
                      isOpenStore
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-red-50 text-red-800 border-red-300"
                    }`}
                  >
                    {isOpenStore ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Toko Buka (Menerima Pesanan Customer)</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Toko Tutup Sementara</span>
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-black shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                  {isSavingSettings ? "Menyimpan Pengaturan..." : "Simpan Pengaturan Toko"}
                </button>
              </form>
            </div>

            {/* Security & Change PIN Form */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-black text-base text-neutral-900">Keamanan & Ganti PIN Admin</h3>
                  <p className="text-xs text-neutral-400">Amankan akses dashboard admin agar tidak dapat diakses orang lain</p>
                </div>
              </div>

              {pinChangeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{pinChangeSuccess}</span>
                </div>
              )}

              {pinChangeError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{pinChangeError}</span>
                </div>
              )}

              <form onSubmit={handleChangePin} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">PIN Lama *</label>
                  <input
                    type="password"
                    required
                    value={oldPinInput}
                    onChange={(e) => setOldPinInput(e.target.value)}
                    placeholder="Masukkan PIN saat ini"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">PIN Baru (Minimal 4 Angka) *</label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Masukkan PIN baru"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 focus:border-red-500 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl font-black shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                  Perbarui PIN Admin
                </button>
              </form>

              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 text-[11px] text-neutral-500 space-y-1">
                <p className="font-bold text-neutral-800">💡 Informasi Keamanan:</p>
                <p>PIN Admin disimpan dengan aman di perangkat browser Anda. Pastikan selalu logout jika menggunakan perangkat bersama.</p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* =======================================================
          FLOATING BOTTOM PILL NAVIGATION (Custom Design Match)
      ======================================================= */}
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm pointer-events-auto select-none">
        <nav className="bg-neutral-950/95 backdrop-blur-2xl border border-neutral-800/90 shadow-[0_16px_40px_rgba(0,0,0,0.65)] rounded-full p-1.5 flex items-center justify-between gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative transition-all duration-300 ease-out flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-white text-neutral-950 font-black px-4 py-2.5 rounded-full shadow-lg shadow-black/25 gap-2 shrink-0 scale-100"
                    : "text-neutral-400 hover:text-white active:scale-90 p-2.5 sm:px-3 rounded-full hover:bg-neutral-900/60"
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-300 ${isActive ? "text-neutral-950 scale-105" : ""}`} />
                
                {isActive && (
                  <span className="text-xs font-black tracking-tight whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                    {item.shortLabel}
                  </span>
                )}

                {item.count !== null && item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-full leading-tight ${
                      isActive
                        ? "bg-red-600 text-white shadow-2xs"
                        : "absolute top-1 right-1 bg-amber-400 text-neutral-950 shadow-2xs"
                    }`}
                  >
                    {item.count > 99 ? "99+" : item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Menu CRUD Modal */}
      <AdminMenuModal
        isOpen={isMenuModalOpen}
        onClose={() => {
          setIsMenuModalOpen(false);
          setAdminEditingMenu(null);
        }}
        menuItem={adminEditingMenu}
        onSave={async (menu) => {
          await saveMenu(menu);
          await loadAllAdminData();
        }}
      />

      {/* Order Receipt Modal */}
      {selectedOrderForReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="text-center pb-3 border-b border-dashed border-neutral-300">
              <h3 className="font-black text-lg text-neutral-900">Cireng Anu</h3>
              <p className="text-[11px] text-neutral-400">Struk Resmi Pemesanan #{selectedOrderForReceipt.id}</p>
              <p className="text-[11px] text-neutral-400">
                {new Date(selectedOrderForReceipt.created_at).toLocaleString("id-ID")}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Nama Pelanggan:</span>
                <span className="font-bold text-neutral-900">{selectedOrderForReceipt.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">No. WhatsApp:</span>
                <span className="font-bold text-neutral-900">{selectedOrderForReceipt.customer_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Tipe Pesanan:</span>
                <span className="font-bold text-neutral-900 capitalize">{selectedOrderForReceipt.order_type}</span>
              </div>
              {selectedOrderForReceipt.delivery_address && (
                <div className="pt-1 text-neutral-700">
                  <span className="text-neutral-400 block">Alamat Kirim:</span>
                  <p className="font-medium">{selectedOrderForReceipt.delivery_address}</p>
                </div>
              )}
            </div>

            <div className="py-3 border-y border-dashed border-neutral-300 space-y-2">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Item Pesanan</span>
              {selectedOrderForReceipt.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-neutral-900">{it.name} <span className="text-neutral-500 font-medium">x{it.quantity}</span></p>
                    {it.options?.variant && (
                      <p className="text-[10px] text-neutral-400">Varian: {it.options.variant}</p>
                    )}
                    {it.options?.spicyLevel && (
                      <p className="text-[10px] text-neutral-400">Level: {it.options.spicyLevel}</p>
                    )}
                  </div>
                  <span className="font-black text-neutral-800">{formatRupiah(it.itemTotal)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-right text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Subtotal:</span>
                <span className="font-bold">{formatRupiah(selectedOrderForReceipt.subtotal)}</span>
              </div>
              {selectedOrderForReceipt.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Diskon Promo:</span>
                  <span className="font-bold">-{formatRupiah(selectedOrderForReceipt.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-400">Ongkir:</span>
                <span className="font-bold">{formatRupiah(selectedOrderForReceipt.delivery_fee)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-red-600 pt-2 border-t border-neutral-100">
                <span>Total Bayar:</span>
                <span>{formatRupiah(selectedOrderForReceipt.total_amount)}</span>
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>
              <button
                onClick={() => setSelectedOrderForReceipt(null)}
                className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-bold cursor-pointer transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
