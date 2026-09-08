-- ==========================================================
-- SUPABASE SCHEMA FOR ANU CIRENG APP
-- Jalankan skrip ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/gvxamjytzcggwfwtbkbo/sql
-- ==========================================================

-- 1. Tabel Menus (Katalog Menu & Varian)
CREATE TABLE IF NOT EXISTS public.menus (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit_info TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  badge TEXT,
  rating NUMERIC DEFAULT 4.9,
  reviews_count INTEGER DEFAULT 100,
  is_available BOOLEAN DEFAULT true,
  variant_title TEXT,
  variant_options JSONB,
  spicy_levels JSONB,
  extra_toppings JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

-- Allow Public Read & Write for Ordering Demo
CREATE POLICY "Public Read Menus" ON public.menus FOR SELECT USING (true);
CREATE POLICY "Public Insert/Update Menus" ON public.menus FOR ALL USING (true) WITH CHECK (true);

-- 2. Tabel Orders (Riwayat & Laporan Penjualan)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  order_type TEXT NOT NULL,
  delivery_address TEXT,
  payment_method TEXT NOT NULL,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  delivery_fee NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  promo_code TEXT,
  customer_notes TEXT,
  status TEXT DEFAULT 'Baru',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Public Delete Orders" ON public.orders FOR DELETE USING (true);

-- 3. Inisialisasi Data Menu Awal (Default Seed)
INSERT INTO public.menus (id, name, category, description, unit_info, price, image_url, badge, rating, reviews_count, is_available, spicy_levels, extra_toppings)
VALUES
('cimol-kuah-keju', 'CIMOL KUAH KEJU', 'cireng-cimol', 'Cimol isi keju yang lumer dengan kuah keju, chilli oil dan pilus yang renyah.', 'Porsi Jumbo Lengkap', 15000, 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&auto=format&fit=crop&q=80', '?? Best Seller', 4.9, 342, true, '["Level 0: Original Keju", "Level 1: Pedas Sedang", "Level 2: Pedas Nampol", "Level 3: Extra Pedas Gila"]'::jsonb, '[{"name": "Ekstra Pilus Cikur", "price": 2000}, {"name": "Ekstra Chilli Oil", "price": 3000}, {"name": "Ekstra Kuah Keju", "price": 4000}]'::jsonb),
('cimol-isi-keju', 'CIMOL ISI KEJU', 'cireng-cimol', 'Cimol isi keju yang lumer dengan bumbu pedas dan gurih.', 'Porsi Gurih Nagih', 10000, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', '?? Lumer Parah', 4.8, 215, true, '["Original Gurih", "Pedas Sedang", "Pedas Manis Gurih"]'::jsonb, '[{"name": "Bumbu Balado Tabur", "price": 1000}, {"name": "Dipping Sauce Keju", "price": 3000}]'::jsonb),
('pempek', 'PEMPEK', 'pempek', 'Pempek lembut dengan kuah cuko yang pedas.', '3 pcs � Rp5k', 5000, 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', '?? Kuah Cuko Mantap', 4.9, 188, true, '["Cuko Sedang", "Cuko Pedas Nampol"]'::jsonb, '[{"name": "Ekstra Timun Segar", "price": 1000}, {"name": "Ekstra Sambal Cuko", "price": 2000}]'::jsonb),
('cireng-isi', 'CIRENG ISI', 'cireng-cimol', 'Cireng isi renyah di luar kenyal di dalam dengan isian ayam suwir pedas atau keju lumer.', '4 pcs � Rp5k', 5000, 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80', '? Menu Favorit', 5.0, 420, true, '["Pedas Gurih", "Extra Pedas Daun Jeruk"]'::jsonb, '[{"name": "Bumbu Rujak", "price": 2000}, {"name": "Saus Keju", "price": 3000}]'::jsonb),
('cheese-roll', 'CHEESE ROLL', 'cheese-roll', 'Cheese roll yang renyah dengan topping tiramisu.', '5 pcs � Rp5k', 5000, 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80', '? Crispy & Sweet', 4.8, 167, true, null, '[{"name": "Ekstra Keju Parut", "price": 2000}, {"name": "Ekstra Saus Tiramisu", "price": 2000}]'::jsonb),
('dimsum-goreng-creamy', 'DIMSUM GORENG CREAMY', 'dimsum', 'Dimsum goreng dengan kuah keju yang, chilli oil dan pilus yang renyah.', 'Porsi Creamy Lengkap', 15000, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80', '?? Viral & Lezat', 4.9, 289, true, '["Level 0: Gurih Creamy", "Level 1: Pedas Sedang", "Level 2: Pedas Juara"]'::jsonb, '[{"name": "Ekstra Pilus Renyah", "price": 2000}, {"name": "Ekstra Kuah Creamy Cheese", "price": 4000}]'::jsonb),
('dimsum-kukus', 'DIMSUM KUKUS', 'dimsum', 'Dimsum kukus lembut dengan saus sambal spesial.', '5 pcs � Rp10k', 10000, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80', '?? Hangat & Juicy', 4.9, 310, true, '["Saus Dimsum Manis Pedas", "Chilli Oil Pedas Gurih"]'::jsonb, '[{"name": "Ekstra Saus Dimsum", "price": 2000}, {"name": "Ekstra Chilli Oil", "price": 3000}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
