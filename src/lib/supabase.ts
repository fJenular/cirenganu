import { createClient } from "@supabase/supabase-js";
import { MenuItem, OrderRecord, StoreSettings } from "./types";
import { INITIAL_MENUS, DEFAULT_STORE_SETTINGS } from "./initialData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gvxamjytzcggwfwtbkbo.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_DbMbiZMnxtRFapNmhA5LWg_o9kRXfPV";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LOCAL_STORAGE_MENUS_KEY = "anu_cireng_menus_v2";
const LOCAL_STORAGE_ORDERS_KEY = "anu_cireng_orders_v1";
const LOCAL_STORAGE_DELETED_ORDERS_KEY = "anu_cireng_deleted_order_ids_v1";
const LOCAL_STORAGE_SETTINGS_KEY = "anu_cireng_settings_v1";
const LOCAL_STORAGE_STOCKS_KEY = "anu_cireng_stocks_v2";

// Helper: Get local deleted order IDs (tombstone)
function getLocalDeletedOrderIds(): Set<string> {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_DELETED_ORDERS_KEY);
      if (stored) return new Set(JSON.parse(stored));
    } catch {}
  }
  return new Set();
}

function addLocalDeletedOrderId(id: string) {
  if (typeof window !== "undefined") {
    try {
      const set = getLocalDeletedOrderIds();
      set.add(id);
      localStorage.setItem(LOCAL_STORAGE_DELETED_ORDERS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }
}

// Helper: Get local stock overrides
function getLocalStockMap(): Record<string, number | null> {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_STOCKS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
  }
  return {};
}

function setLocalStock(id: string, stock: number | null) {
  if (typeof window !== "undefined") {
    try {
      const current = getLocalStockMap();
      current[id] = stock;
      localStorage.setItem(LOCAL_STORAGE_STOCKS_KEY, JSON.stringify(current));
    } catch {}
  }
}

// Helper: Seed or get menus
export async function getMenus(): Promise<MenuItem[]> {
  const localStocks = getLocalStockMap();

  try {
    const { data, error } = await supabase
      .from("menus")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      // Check local storage fallback
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(LOCAL_STORAGE_MENUS_KEY);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {
            // parse error
          }
        }
      }
      return INITIAL_MENUS;
    }

    return data.map((item: any) => {
      // Extract stock from metadata in extra_toppings or direct field or local fallback
      const stockMeta = Array.isArray(item.extra_toppings)
        ? item.extra_toppings.find((t: any) => t && t.name === "__meta_stock__")
        : null;

      const cleanToppings = Array.isArray(item.extra_toppings)
        ? item.extra_toppings.filter((t: any) => t && t.name !== "__meta_stock__")
        : undefined;

      let resolvedStock: number | null = null;
      if (item.stock !== undefined && item.stock !== null) {
        resolvedStock = Number(item.stock);
      } else if (stockMeta && stockMeta.price !== undefined) {
        resolvedStock = Number(stockMeta.price);
      } else if (localStocks[item.id] !== undefined) {
        resolvedStock = localStocks[item.id];
      } else {
        const initItem = INITIAL_MENUS.find((m) => m.id === item.id);
        resolvedStock = initItem ? initItem.stock : null;
      }

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description || "",
        unit_info: item.unit_info || "",
        price: Number(item.price),
        image_url: item.image_url || "",
        badge: item.badge || undefined,
        stock: resolvedStock,
        rating: Number(item.rating || 4.9),
        reviews_count: Number(item.reviews_count || 100),
        is_available: item.is_available !== false && (resolvedStock === null || resolvedStock > 0),
        variant_title: item.variant_title || undefined,
        variant_options: Array.isArray(item.variant_options) ? item.variant_options : undefined,
        spicy_levels: Array.isArray(item.spicy_levels) ? item.spicy_levels : undefined,
        extra_toppings: cleanToppings && cleanToppings.length > 0 ? cleanToppings : undefined,
        created_at: item.created_at
      };
    });
  } catch (err) {
    console.warn("Supabase fetch failed, using fallback:", err);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_MENUS_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_MENUS;
  }
}

export async function saveMenu(menu: MenuItem): Promise<{ success: boolean; data?: MenuItem; error?: string }> {
  try {
    // 1. Save stock locally
    setLocalStock(menu.id, menu.stock);

    // 2. Prepare extra_toppings with embedded stock metadata so stock syncs to Supabase
    const cleanToppings = (menu.extra_toppings || []).filter(
      (t: any) => t && t.name !== "__meta_stock__"
    );

    if (menu.stock !== null && menu.stock !== undefined) {
      cleanToppings.push({ name: "__meta_stock__", price: Number(menu.stock) });
    }

    // 3. Payload strictly contains columns existing in Supabase menus table (avoids PGRST204 error)
    const payload: any = {
      id: menu.id,
      name: menu.name,
      category: menu.category,
      description: menu.description,
      unit_info: menu.unit_info,
      price: menu.price,
      image_url: menu.image_url,
      badge: menu.badge || null,
      rating: menu.rating || 4.9,
      reviews_count: menu.reviews_count || 50,
      is_available: menu.is_available && (menu.stock === null || menu.stock > 0),
      variant_title: menu.variant_title || null,
      variant_options: menu.variant_options || null,
      spicy_levels: menu.spicy_levels || null,
      extra_toppings: cleanToppings.length > 0 ? cleanToppings : null
    };

    const { data, error } = await supabase
      .from("menus")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Supabase upsert warning:", error);
    }

    // 4. Always update local cache
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_MENUS_KEY);
      const list: MenuItem[] = stored ? JSON.parse(stored) : [...INITIAL_MENUS];
      const index = list.findIndex((m) => m.id === menu.id);
      if (index >= 0) {
        list[index] = menu;
      } else {
        list.push(menu);
      }
      localStorage.setItem(LOCAL_STORAGE_MENUS_KEY, JSON.stringify(list));
    }

    return { success: true, data: menu };
  } catch (err: any) {
    console.error("Failed to save menu:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteMenu(menuId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("menus").delete().eq("id", menuId);
    if (error) {
      console.warn("Supabase delete error:", error);
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_MENUS_KEY);
      const list: MenuItem[] = stored ? JSON.parse(stored) : [...INITIAL_MENUS];
      const filtered = list.filter((m) => m.id !== menuId);
      localStorage.setItem(LOCAL_STORAGE_MENUS_KEY, JSON.stringify(filtered));
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Order Management
export async function createOrder(order: OrderRecord): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("orders").insert({
      id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      order_type: order.order_type,
      delivery_address: order.delivery_address || null,
      payment_method: order.payment_method,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount,
      delivery_fee: order.delivery_fee,
      total_amount: order.total_amount,
      promo_code: order.promo_code || null,
      customer_notes: order.customer_notes || null,
      status: order.status || "Baru",
      payment_proof_url: order.payment_proof_url || null,
      payment_status: order.payment_status || "Menunggu",
      created_at: order.created_at
    });

    if (error) {
      console.warn("Supabase insert order error, saving locally:", error);
    }

    // Save to local storage
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      const list: OrderRecord[] = stored ? JSON.parse(stored) : [];
      list.unshift(order);
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(list));
    }

    return { success: true };
  } catch (err: any) {
    console.error("Order creation error:", err);
    return { success: false, error: err.message };
  }
}

export async function uploadPaymentProof(orderId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `proofs/${orderId}_${Date.now()}.${ext}`;

  try {
    const { data, error } = await supabase.storage
      .from('payment-proofs')
      .upload(filePath, file, { upsert: true });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);
      return publicUrlData.publicUrl;
    }
  } catch (e) {
    console.warn("Storage upload failed, falling back to data URL:", e);
  }

  // Fallback: convert file to base64 Data URL if Supabase storage bucket isn't set up yet
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function updateOrderPaymentProof(orderId: string, proofUrl: string): Promise<boolean> {
  try {
    await supabase.from("orders").update({
      payment_proof_url: proofUrl,
      payment_status: "Menunggu"
    }).eq("id", orderId);

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (stored) {
        const list: OrderRecord[] = JSON.parse(stored);
        const idx = list.findIndex((o) => o.id === orderId);
        if (idx >= 0) {
          list[idx].payment_proof_url = proofUrl;
          list[idx].payment_status = "Menunggu";
          localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(list));
        }
      }
    }
    return true;
  } catch (err) {
    console.error("Failed to update payment proof:", err);
    return false;
  }
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: OrderRecord["payment_status"]
): Promise<boolean> {
  try {
    await supabase.from("orders").update({ payment_status: paymentStatus }).eq("id", orderId);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (stored) {
        const list: OrderRecord[] = JSON.parse(stored);
        const idx = list.findIndex((o) => o.id === orderId);
        if (idx >= 0) {
          list[idx].payment_status = paymentStatus;
          localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(list));
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function getOrders(): Promise<OrderRecord[]> {
  const deletedSet = getLocalDeletedOrderIds();

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .neq("status", "Dihapus")
      .neq("status", "Deleted")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
        if (stored) {
          const list: OrderRecord[] = JSON.parse(stored);
          return list.filter((o) => o.status !== "Dihapus" && (o.status as string) !== "Deleted" && !deletedSet.has(o.id));
        }
      }
      return [];
    }

    // Filter out any orders marked as deleted in DB or tracked locally in tombstone
    const cleanList = data.filter(
      (o: any) => o.status !== "Dihapus" && (o.status as string) !== "Deleted" && !deletedSet.has(o.id)
    );

    // Sync clean list back to local storage
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(cleanList));
    }

    return cleanList;
  } catch {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (stored) {
        const list: OrderRecord[] = JSON.parse(stored);
        return list.filter((o) => o.status !== "Dihapus" && (o.status as string) !== "Deleted" && !deletedSet.has(o.id));
      }
    }
    return [];
  }
}

export async function updateOrderStatus(orderId: string, status: OrderRecord["status"]): Promise<boolean> {
  try {
    await supabase.from("orders").update({ status }).eq("id", orderId);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (stored) {
        const list: OrderRecord[] = JSON.parse(stored);
        const idx = list.findIndex((o) => o.id === orderId);
        if (idx >= 0) {
          list[idx].status = status;
          localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(list));
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    // 1. Mark in tombstone set so it is never revived locally
    addLocalDeletedOrderId(orderId);

    // 2. Remove immediately from local storage cache
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (stored) {
        const list: OrderRecord[] = JSON.parse(stored);
        const filtered = list.filter((o) => o.id !== orderId);
        localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(filtered));
      }
    }

    // 3. Update status in Supabase to 'Dihapus' (guaranteed to succeed with UPDATE RLS policy)
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "Dihapus" })
      .eq("id", orderId);

    if (updateError) {
      console.warn("Supabase mark order deleted warning:", updateError);
    }

    // 4. Also perform hard delete in Supabase (in case DELETE RLS policy is enabled)
    const { error: deleteError } = await supabase.from("orders").delete().eq("id", orderId);
    if (deleteError) {
      console.warn("Supabase hard delete order warning:", deleteError);
    }

    return true;
  } catch (err) {
    console.error("Failed to delete order:", err);
    return false;
  }
}

export async function uploadMenuImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `menu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

  // 1. Try Supabase Storage 'menu-images' bucket
  try {
    const { data, error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file, { upsert: true });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(fileName);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (e) {
    console.warn("Storage upload to menu-images failed, trying fallback bucket:", e);
  }

  // 2. Try 'payment-proofs' bucket as fallback
  try {
    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .upload(`menus/${fileName}`, file, { upsert: true });

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(`menus/${fileName}`);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (e) {
    console.warn("Storage upload to fallback bucket failed:", e);
  }

  // 3. Fallback: Compress and read as base64 Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.85));
            return;
          }
          resolve(result);
        };
        img.onerror = () => resolve(result);
        img.src = result;
      } else {
        resolve(result);
      }
    };
    reader.onerror = () => resolve("/logo.jpg");
    reader.readAsDataURL(file);
  });
}

// Store Settings
export async function getStoreSettings(): Promise<StoreSettings> {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }
  }
  return DEFAULT_STORE_SETTINGS;
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  }
}
