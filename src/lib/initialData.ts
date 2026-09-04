import { MenuItem, StoreSettings } from "./types";

export const INITIAL_MENUS: MenuItem[] = [
  {
    id: "cimol-kuah-keju",
    name: "CIMOL KUAH KEJU",
    category: "cireng-cimol",
    description: "Cimol isi keju yang lumer dengan kuah keju kental gurih, chilli oil pedas harum, dan topping pilus yang super renyah.",
    unit_info: "Porsi Jumbo Lengkap",
    price: 15000,
    image_url: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80",
    stock: 20,
    rating: 4.9,
    reviews_count: 342,
    is_available: true,
    spicy_levels: ["Level 0: Original Keju", "Level 1: Pedas Sedang (Recommended)", "Level 2: Pedas Nampol", "Level 3: Extra Pedas Gila"],
    extra_toppings: [
      { name: "Ekstra Pilus Cikur Renyah", price: 2000 },
      { name: "Ekstra Chilli Oil Wangi", price: 3000 },
      { name: "Ekstra Kuah Keju Lumer", price: 4000 }
    ]
  },
  {
    id: "cimol-isi-keju",
    name: "CIMOL ISI KEJU",
    category: "cireng-cimol",
    description: "Cimol goreng isi keju yang lumer di mulut saat digigit, ditaburi bumbu pedas dan gurih khas Cireng Anu.",
    unit_info: "Porsi Gurih Nagih",
    price: 10000,
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    stock: 15,
    rating: 4.8,
    reviews_count: 215,
    is_available: true,
    spicy_levels: ["Original Gurih", "Pedas Sedang", "Pedas Manis Gurih", "Pedas Asin Level 3"],
    extra_toppings: [
      { name: "Bumbu Balado Tabur", price: 1000 },
      { name: "Bumbu Jagung Manis", price: 1000 },
      { name: "Dipping Sauce Keju", price: 3000 }
    ]
  },
  {
    id: "pempek",
    name: "PEMPEK",
    category: "pempek",
    description: "Pempek lembut dengan rasa ikan yang gurih sedap, disajikan bersama kuah cuko kental pedas manis asam segar.",
    unit_info: "3 pcs · Rp5k",
    price: 5000,
    image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80",
    stock: 30,
    rating: 4.9,
    reviews_count: 188,
    is_available: true,
    variant_title: "Pilihan Jenis Pempek",
    variant_options: ["Campur (Adaan & Lenjer)", "Full Pempek Adaan", "Full Pempek Lenjer"],
    spicy_levels: ["Cuko Sedang", "Cuko Pedas Nampol"],
    extra_toppings: [
      { name: "Ekstra Potongan Timun Segar", price: 1000 },
      { name: "Ekstra Sambal Cuko 1 Cup", price: 2000 }
    ]
  },
  {
    id: "cireng-isi-ayam",
    name: "CIRENG ISI AYAM",
    category: "cireng-cimol",
    description: "Cireng renyah di luar kenyal di dalam dengan isian ayam suwir gurih pedas melimpah bumbu khas Sunda.",
    unit_info: "4 pcs · Rp5k",
    price: 5000,
    image_url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80",
    stock: 25,
    rating: 5.0,
    reviews_count: 420,
    is_available: true,
    spicy_levels: ["Pedas Gurih", "Extra Pedas Daun Jeruk"],
    extra_toppings: [
      { name: "Bumbu Rujak Cocolan", price: 2000 },
      { name: "Saus Keju Cocolan", price: 3000 }
    ]
  },
  {
    id: "cireng-isi-keju",
    name: "CIRENG ISI KEJU",
    category: "cireng-cimol",
    description: "Cireng goreng renyah kenyal dengan isian keju premium yang lumer gurih saat digigit hangat.",
    unit_info: "4 pcs · Rp5k",
    price: 5000,
    image_url: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80",
    stock: 20,
    rating: 4.9,
    reviews_count: 310,
    is_available: true,
    spicy_levels: ["Original Keju", "Pedas Gurih"],
    extra_toppings: [
      { name: "Bumbu Rujak Cocolan", price: 2000 },
      { name: "Saus Keju Cocolan", price: 3000 }
    ]
  },
  {
    id: "cheese-roll",
    name: "CHEESE ROLL",
    category: "cheese-roll",
    description: "Cheese roll yang digoreng crispy garing keemasan dengan isian keju gurih dan topping lumer tiramisu manis harum.",
    unit_info: "5 pcs · Rp5k",
    price: 5000,
    image_url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80",
    stock: 25,
    rating: 4.8,
    reviews_count: 167,
    is_available: true,
    variant_title: "Pilihan Topping Glaze",
    variant_options: ["Topping Tiramisu", "Topping Cokelat Melted", "Topping Matcha Greentea", "Mix Tiramisu & Cokelat"],
    extra_toppings: [
      { name: "Ekstra Keju Parut Tabur", price: 2000 },
      { name: "Ekstra Saus Tiramisu", price: 2000 }
    ]
  },
  {
    id: "dimsum-goreng-creamy",
    name: "DIMSUM GORENG CREAMY",
    category: "dimsum",
    description: "Dimsum goreng krispi dengan siraman kuah keju creamy gurih, chilli oil aromatik, dan topping pilus yang renyah nagih.",
    unit_info: "Porsi Creamy Lengkap",
    price: 15000,
    image_url: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80",
    stock: 10,
    rating: 4.9,
    reviews_count: 289,
    is_available: true,
    spicy_levels: ["Level 0: Gurih Creamy", "Level 1: Pedas Sedang", "Level 2: Pedas Juara"],
    extra_toppings: [
      { name: "Ekstra Pilus Renyah", price: 2000 },
      { name: "Ekstra Kuah Creamy Cheese", price: 4000 },
      { name: "Ekstra Chilli Oil", price: 3000 }
    ]
  },
  {
    id: "dimsum-kukus",
    name: "DIMSUM KUKUS",
    category: "dimsum",
    description: "Dimsum kukus premium dengan tekstur daging ayam udang yang kenyal dan juicy, disajikan hangat bersama saus sambal dimsum spesial.",
    unit_info: "5 pcs · Rp10k",
    price: 10000,
    image_url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
    stock: 18,
    rating: 4.9,
    reviews_count: 310,
    is_available: true,
    variant_title: "Pilihan Varian Dimsum",
    variant_options: ["Dimsum Ayam Original (5 pcs)", "Dimsum Mozzarella (5 pcs)", "Dimsum Jamur (5 pcs)", "Mix Aneka Varian (5 pcs)"],
    spicy_levels: ["Saus Dimsum Manis Pedas", "Chilli Oil Pedas Gurih"],
    extra_toppings: [
      { name: "Ekstra Saus Dimsum 1 Cup", price: 2000 },
      { name: "Ekstra Chilli Oil 1 Cup", price: 3000 }
    ]
  }
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  whatsapp_number: "6281234567890",
  store_name: "Cireng Anu",
  is_open: true,
  opening_hours: "10:00 - 21:30 WIB",
  store_address: "Pusat Jajanan & Cemilan Gurih Cireng Anu",
  delivery_fee_default: 5000
};

export const PROMO_CODES: { [code: string]: { type: "percent" | "fixed"; value: number; minOrder: number; desc: string } } = {
  "ANUYUMMY": { type: "percent", value: 10, minOrder: 15000, desc: "Diskon 10% minimal order Rp15.000" },
  "DISKON5K": { type: "fixed", value: 5000, minOrder: 25000, desc: "Potongan Rp5.000 minimal order Rp25.000" },
  "GRATISONGKIR": { type: "fixed", value: 5000, minOrder: 30000, desc: "Potongan Ongkir Rp5.000 minimal order Rp30.000" }
};
