-- OpenPaws Supabase schema
-- Run this in Supabase SQL Editor before testing checkout/admin.

create extension if not exists "pgcrypto";

create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  tagline text,
  description text,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  discount_price numeric(10,2) check (discount_price is null or discount_price >= 0),
  discount_active boolean default false,
  image text,
  gallery text[] default '{}',
  category text,
  rating numeric(2,1) default 5,
  stock int default 0,
  badges text[] default '{}',
  features text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Admin product fields for projects that created the products table earlier.
alter table public.products add column if not exists discount_price numeric(10,2) check (discount_price is null or discount_price >= 0);
alter table public.products add column if not exists discount_active boolean default false;
alter table public.products add column if not exists gallery text[] default '{}';

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  phone text not null,
  address text not null,
  city text not null,
  notes text,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null,
  created_at timestamptz default now()
);

create table if not exists public.chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_email text,
  message text not null,
  reply text,
  created_at timestamptz default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists chat_logs_user_id_idx on public.chat_logs(user_id);
create index if not exists chat_logs_created_at_idx on public.chat_logs(created_at desc);

-- Starter products for a fresh OpenPaws catalog.
insert into public.products (id, slug, name, tagline, description, price, discount_price, discount_active, compare_at_price, image, gallery, category, rating, stock, badges, features)
values
('cat-teaser-wand-001', 'feather-teaser-wand', 'Feather Teaser Wand', 'Interactive play for active cats', 'A lightweight teaser wand with soft feathers and a flexible string that keeps cats jumping, chasing, and exercising indoors.', 280, 220, true, null, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=1200&auto=format&fit=crop', array['https://images.unsplash.com/photo-1545249390-6bdfa286032f?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=1200&auto=format&fit=crop'], 'Teaser Toys', 4.8, 35, array['Best Seller','Indoor Play'], array['Flexible wand','Soft feather lure','Good for exercise','Suitable for kittens and adult cats']),
('cat-ball-bell-002', 'rolling-bell-ball-set', 'Rolling Bell Ball Set', 'Small balls, big curiosity', 'Colorful rolling balls with a gentle bell sound. Great for solo play and for cats who love chasing moving objects.', 240, 180, true, null, 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop', array['https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=1200&auto=format&fit=crop'], 'Ball Toys', 4.6, 50, array['Budget Pick'], array['Pack of 3','Gentle bell sound','Lightweight','Easy to clean']),
('cat-scratch-mouse-003', 'catnip-mouse-toy', 'Catnip Mouse Toy', 'Soft bite-sized fun', 'A plush mouse toy with catnip scent that encourages pouncing, biting, and relaxed playtime.', 150, null, false, null, 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?q=80&w=1200&auto=format&fit=crop', array['https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?q=80&w=1200&auto=format&fit=crop'], 'Catnip Toys', 4.7, 44, array['Catnip'], array['Soft plush body','Catnip scent','Good for bite play','Easy to carry']),
('cat-tunnel-004', 'foldable-cat-tunnel', 'Foldable Cat Tunnel', 'Hide, run, and surprise', 'A foldable tunnel for cats who love hiding, running, and ambush games. Perfect for apartment play spaces.', 780, 650, true, null, 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1200&auto=format&fit=crop', array['https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1495360010541-f48722b34f7d?q=80&w=1200&auto=format&fit=crop'], 'Activity Toys', 4.9, 15, array['Premium','Foldable'], array['Foldable design','Crinkle texture','Great for multiple cats','Easy storage']),
('cat-fish-005', 'floppy-fish-kicker', 'Floppy Fish Kicker', 'Kicker toy for playful paws', 'A soft fish-shaped kicker toy made for cats who enjoy bunny-kicking, wrestling, and carrying toys around.', 390, 320, true, null, 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=80&w=1200&auto=format&fit=crop', array['https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=1200&auto=format&fit=crop'], 'Kicker Toys', 4.5, 25, array['Soft Toy'], array['Long kicker shape','Soft fabric','Great for wrestling','Lightweight']),
('cat-laser-006', 'mini-laser-pointer', 'Mini Laser Pointer', 'Quick exercise, endless chase', 'A compact laser pointer for short supervised play sessions. Helps energetic cats burn off extra energy.', 280, null, false, null, 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1200&auto=format&fit=crop', array['https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1200&auto=format&fit=crop','https://images.unsplash.com/photo-1494256997604-768d1f608cac?q=80&w=1200&auto=format&fit=crop'], 'Interactive Toys', 4.4, 30, array['Interactive'], array['Compact size','Supervised play','Good for active cats','Easy to carry'])
on conflict (id) do nothing;

-- Product image uploads from the admin API use the service role.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Product images are public" on storage.objects;
create policy "Product images are public" on storage.objects
for select using (bucket_id = 'product-images');

-- RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.chat_logs enable row level security;
alter table public.faqs enable row level security;

-- Public read access for products and FAQs.
drop policy if exists "Products are visible" on public.products;
create policy "Products are visible" on public.products for select using (is_active = true);

drop policy if exists "FAQs are visible" on public.faqs;
create policy "FAQs are visible" on public.faqs for select using (is_active = true);

-- Customers can read their own orders.
drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items" on public.order_items for select using (
  exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Inserts/updates happen through server route using service-role key.
-- Admin dashboard also uses service-role route after email validation.
