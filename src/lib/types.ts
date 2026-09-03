export interface MenuItem {
  id: string;
  name: string;
  category: 'cireng-cimol' | 'pempek' | 'cheese-roll' | 'dimsum' | 'snack' | 'siap-makan' | 'frozen';
  description: string;
  unit_info: string; // e.g. "3 pcs", "4 pcs · Rp5k", "Porsi Kenyang"
  price: number;
  image_url: string;
  badge?: string; // "Best Seller", "Favorit", "Crispy", "Pedas Gurih"
  stock: number | null; // null = unlimited, 0 = habis, >0 = sisa stok
  rating: number;
  reviews_count: number;
  is_available: boolean;
  variant_title?: string;
  variant_options?: string[]; // e.g. ["Isi Ayam", "Isi Keju", "Mix"]
  spicy_levels?: string[];
  extra_toppings?: { name: string; price: number }[];
  created_at?: string;
}

export interface CartItemOption {
  variant?: string;
  spicyLevel?: string;
  extraToppings?: string[];
  extraToppingsTotal?: number;
}

export interface CartItem {
  id: string; // unique item id in cart (combination of menu id and options)
  menuId: string;
  name: string;
  price: number;
  unit_info: string;
  image_url: string;
  quantity: number;
  options?: CartItemOption;
  itemTotal: number;
  itemNotes?: string;
}

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  orderType: 'delivery' | 'takeaway' | 'dine_in';
  address?: string;
  notes?: string;
  paymentMethod: 'qris' | 'transfer' | 'cash';
}

export interface OrderRecord {
  id: string;
  customer_name: string;
  customer_phone: string;
  order_type: string;
  delivery_address?: string;
  payment_method: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total_amount: number;
  promo_code?: string;
  customer_notes?: string;
  status: 'Baru' | 'Diproses' | 'Selesai' | 'Dibatalkan';
  created_at: string;
}

export interface StoreSettings {
  whatsapp_number: string;
  store_name: string;
  is_open: boolean;
  opening_hours: string;
  store_address: string;
  delivery_fee_default: number;
}
