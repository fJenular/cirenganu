"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ChevronRight,
  Lock,
  Sparkles
} from "lucide-react";
import DesktopPhoneFrame from "@/components/DesktopPhoneFrame";
import Header from "@/components/Header";
import MenuCard from "@/components/MenuCard";
import CategoryTabs, { OrderVariant } from "@/components/CategoryTabs";
import ProductDetailModal from "@/components/ProductDetailModal";
import CartDrawer from "@/components/CartDrawer";
import SplashLoader from "@/components/SplashLoader";
import WelcomeScreen from "@/components/WelcomeScreen";
import { MenuGridSkeleton } from "@/components/LoadingSkeleton";
import { MenuItem, CartItem, StoreSettings } from "@/lib/types";
import { formatRupiah } from "@/lib/whatsapp";
import { getMenus, getStoreSettings } from "@/lib/supabase";
import { INITIAL_MENUS, DEFAULT_STORE_SETTINGS } from "@/lib/initialData";

export default function Home() {
  const router = useRouter();

  // Splash & Onboarding State
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "order">("welcome");

  // Menu & Data State
  const [menus, setMenus] = useState<MenuItem[]>(INITIAL_MENUS);
  const [isLoadingMenus, setIsLoadingMenus] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  // Variant tab: siap-makan (default) or frozen
  const [activeVariant, setActiveVariant] = useState<OrderVariant>("siap-makan");

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  const menuSectionRef = useRef<HTMLDivElement>(null);

  // Load Initial Data
  const loadData = async () => {
    setIsLoadingMenus(true);
    try {
      const [fetchedMenus, fetchedSettings] = await Promise.all([
        getMenus(),
        getStoreSettings()
      ]);
      if (fetchedMenus && fetchedMenus.length > 0) {
        setMenus(fetchedMenus);
      }
      if (fetchedSettings) {
        setStoreSettings(fetchedSettings);
      }
    } catch (err) {
      console.warn("Using fallback initial data:", err);
    } finally {
      setIsLoadingMenus(false);
    }
  };

  useEffect(() => {
    loadData();
    try {
      const savedCart = localStorage.getItem("anu_cireng_active_cart");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      const hasOnboarded = localStorage.getItem("cireng_anu_has_onboarded");
      const searchParams = new URLSearchParams(window.location.search);
      if (hasOnboarded === "true" || searchParams.get("screen") === "order") {
        setCurrentScreen("order");
        setShowSplash(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("anu_cireng_active_cart", JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  // Cart Operations
  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === item.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += item.quantity;
        updated[existingIdx].itemTotal = updated[existingIdx].price * updated[existingIdx].quantity;
        return updated;
      }
      return [...prev, item];
    });
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty, itemTotal: i.price * qty } : i))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCart = () => setCartItems([]);

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, curr) => acc + curr.itemTotal, 0);

  // Both tabs show ALL menus (same list) — variant is just an order preference
  const displayedMenus = menus;

  return (
    <>
      {showSplash && (
        <SplashLoader onFinish={() => setShowSplash(false)} minDuration={1600} />
      )}

      <DesktopPhoneFrame>
        {currentScreen === "welcome" ? (
          <WelcomeScreen
            onStartOrder={() => {
              try {
                localStorage.setItem("cireng_anu_has_onboarded", "true");
              } catch {}
              setCurrentScreen("order");
            }}
          />
        ) : (
          <div className="min-h-full flex flex-col bg-[#F7F7F8] pb-28 animate-in fade-in duration-300">

            {/* App Header */}
            <div ref={menuSectionRef} className="bg-white">
              <Header />
            </div>

            {/* Sticky Variant Tabs */}
            <div className="sticky top-0 z-20">
              <CategoryTabs
                activeVariant={activeVariant}
                onSelectVariant={setActiveVariant}
              />
            </div>

            {/* Menu count label */}
            <div className="px-4 pt-3 pb-1">
              <p className="text-[11px] text-neutral-400 font-medium">
                {isLoadingMenus ? "Memuat menu..." : `${displayedMenus.length} menu tersedia`}
              </p>
            </div>

            {/* Menu Grid */}
            <div className="px-4 pb-4">
              {isLoadingMenus ? (
                <MenuGridSkeleton count={6} />
              ) : displayedMenus.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-neutral-200/80 my-2 shadow-xs">
                  <p className="text-sm font-bold text-neutral-700">Menu belum tersedia</p>
                  <p className="text-xs text-neutral-400 mt-1">Coba lagi beberapa saat</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {displayedMenus.map((item, idx) => {
                    const itemCartQty = cartItems
                      .filter((c) => c.menuId === item.id)
                      .reduce((sum, curr) => sum + curr.quantity, 0);

                    return (
                      <MenuCard
                        key={item.id}
                        item={item}
                        index={idx}
                        cartQuantity={itemCartQty}
                        onSelect={(m) => setSelectedMenuItem(m)}
                        onQuickAdd={(m) => {
                          handleAddToCart({
                            id: `${m.id}-default`,
                            menuId: m.id,
                            name: m.name,
                            price: m.price,
                            unit_info: m.unit_info,
                            image_url: m.image_url,
                            quantity: 1,
                            itemTotal: m.price
                          });
                        }}
                        onUpdateQuantity={(delta) => {
                          const existing = cartItems.find((c) => c.menuId === item.id);
                          if (existing) {
                            const newQty = existing.quantity + delta;
                            if (newQty <= 0) {
                              handleRemoveItem(existing.id);
                            } else {
                              handleUpdateQuantity(existing.id, newQty);
                            }
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 px-5 py-6 text-center text-neutral-400 text-[11px] space-y-2 border-t border-neutral-100 bg-white">
              <div className="flex items-center justify-center gap-2">
                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-red-500">
                  <Image src="/logo.jpg" alt="Logo" fill sizes="20px" className="object-cover" />
                </div>
                <span className="font-bold text-neutral-800">Cireng Anu - Pesan Makanan Online</span>
              </div>
              <p className="max-w-xs mx-auto text-[10px] text-neutral-400 leading-relaxed">
                Camilan khas lezat &amp; gurih • Fresh &amp; hangat langsung diantar ke lokasimu.
              </p>
              <div className="pt-2 flex items-center justify-center gap-4 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("welcome")}
                  className="text-neutral-500 hover:text-neutral-800 font-bold transition-colors cursor-pointer"
                >
                  Welcome Screen
                </button>
                <span>•</span>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-neutral-400 hover:text-neutral-700 font-medium transition-colors"
                >
                  <Lock className="w-3 h-3 text-neutral-400" />
                  <span>Portal Admin</span>
                </Link>
              </div>
            </div>

          </div>
        )}

        {/* Cart Bottom Sheet */}
        {currentScreen === "order" && !isCartOpen && (
          <div
            className={`fixed bottom-0 left-0 right-0 z-40 md:absolute transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              cartItems.length > 0
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0 pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent -top-8 pointer-events-none" />
            <div className="relative bg-white border-t border-neutral-100 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] px-4 pt-2.5 pb-4">
              {/* Clickable Pill Handle */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="w-full flex justify-center py-1 cursor-pointer group"
                aria-label="Buka Keranjang"
              >
                <div className="w-12 h-1.5 bg-neutral-300 group-hover:bg-red-400 rounded-full transition-colors" />
              </button>

              <div className="flex items-center justify-between gap-3 mt-1">
                {/* Clickable Cart Icon & Info — Opens Cart List with Slide-Up */}
                <div
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group select-none hover:opacity-90 active:scale-[0.99] transition-all"
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative w-11 h-11 shrink-0 group-hover:scale-105 active:scale-95 transition-transform">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md shadow-red-200">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <span
                      key={totalCartCount}
                      className="absolute -top-1 -right-1 bg-amber-400 text-neutral-900 text-[10px] font-black min-w-[20px] h-[20px] rounded-full flex items-center justify-center shadow border-2 border-white px-1 animate-pop-in"
                    >
                      {totalCartCount}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1 group-hover:text-neutral-600 transition-colors">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Ketuk untuk atur keranjang</span>
                    </p>
                    <p
                      key={totalCartPrice}
                      className="text-sm font-black text-neutral-900 leading-none mt-0.5 group-hover:text-red-600 transition-colors inline-block animate-pop-in"
                    >
                      {formatRupiah(totalCartPrice)}
                    </p>
                  </div>
                </div>

                {/* CTA Button — Directs to /checkout */}
                <button
                  type="button"
                  onClick={() => router.push("/checkout")}
                  className="relative overflow-hidden shrink-0 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-[0.96] text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md shadow-red-600/30 hover:shadow-red-600/45 flex items-center gap-1.5 transition-all cursor-pointer group"
                >
                  {/* Subtle shimmer beam on CTA */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
                  </div>

                  <span className="relative z-10 font-black tracking-wide">Buat Pesanan</span>
                  <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-0.5 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        )}

        <ProductDetailModal
          item={selectedMenuItem}
          onClose={() => setSelectedMenuItem(null)}
          onAddToCart={handleAddToCart}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
        />
      </DesktopPhoneFrame>
    </>
  );
}
