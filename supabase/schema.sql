-- Umbre Studio commerce schema v3. Run in Supabase SQL Editor on a fresh project.
create extension if not exists pgcrypto;
create table if not exists public.profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '', phone text not null default '', role text not null default 'customer' check(role in ('customer','admin')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.customer_addresses(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 label text not null default 'Home', recipient_name text not null, phone text not null, address_line1 text not null, address_line2 text not null default '', landmark text not null default '', city text not null, state text not null, pincode text not null, is_default boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.products(id text primary key,slug text unique not null,name text not null,category text not null,description text not null default '',price_inr integer not null check(price_inr>=0),image_url text,colors text[] not null default '{}',dimensions text,weight_kg numeric not null default 1 check(weight_kg>0),length_cm numeric not null default 25 check(length_cm>0),breadth_cm numeric not null default 25 check(breadth_cm>0),height_cm numeric not null default 30 check(height_cm>0),is_active boolean not null default true,inventory_count integer not null default 10 check(inventory_count>=0),created_at timestamptz not null default now());
create table if not exists public.orders(
 id uuid primary key default gen_random_uuid(), order_number text unique not null, user_id uuid references auth.users(id) on delete set null,
 customer_name text not null, customer_email text not null, customer_phone text not null,
 shipping_address text not null, shipping_address2 text not null default '', shipping_landmark text not null default '', shipping_city text not null, shipping_state text not null default '', shipping_pincode text not null,
 currency text not null default 'INR', subtotal_paise integer not null check(subtotal_paise>=0), shipping_paise integer not null default 0 check(shipping_paise>=0), tax_paise integer not null default 0 check(tax_paise>=0), total_paise integer not null check(total_paise>=0),
 status text not null default 'pending_payment' check(status in ('pending_payment','paid','processing','packed','shipped','out_for_delivery','delivered','delivery_issue','return_requested','return_approved','return_in_transit','returned','refund_pending','refunded','cancelled','payment_failed','rto_initiated','rto_delivered')),
 payment_status text not null default 'pending' check(payment_status in ('pending','authorized','paid','failed','refund_pending','partially_refunded','refunded')),
 payment_method text not null default 'razorpay', razorpay_order_id text unique, razorpay_payment_id text unique, payment_verified_at timestamptz,
 shipment_provider text, provider_order_id text, provider_shipment_id text, awb text, courier_name text, tracking_url text, label_url text, manifest_url text, estimated_delivery date, shipped_at timestamptz, delivered_at timestamptz,
 delivery_issue_type text, delivery_issue_note text, internal_note text not null default '', cancelled_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.order_items(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,product_id text not null,product_slug text not null,product_name text not null,color text not null default 'Ivory',unit_price_paise integer not null check(unit_price_paise>=0),quantity integer not null check(quantity between 1 and 10),created_at timestamptz not null default now());
create table if not exists public.order_status_events(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,status text not null,description text not null,source text not null default 'system' check(source in ('system','admin','payment','shipping_provider','customer')),is_customer_visible boolean not null default true,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table if not exists public.shipment_events(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,provider text not null,provider_event_id text,event_code text,event_status text not null,description text not null default '',location text,event_at timestamptz,raw_payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now(),unique(provider,provider_event_id));
create table if not exists public.return_requests(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,user_id uuid references auth.users(id) on delete set null,reason text not null,details text not null default '',status text not null default 'requested' check(status in ('requested','approved','rejected','pickup_scheduled','in_transit','received','refund_pending','refunded','closed')),resolution text not null default 'refund' check(resolution in ('refund','replacement','store_credit')),reverse_awb text,reverse_shipment_id text,admin_note text not null default '',refund_amount_paise integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.delivery_issues(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.orders(id) on delete cascade,reported_by uuid references auth.users(id) on delete set null,issue_type text not null,description text not null,status text not null default 'open' check(status in ('open','investigating','waiting_customer','resolved','closed')),resolution_note text not null default '',created_at timestamptz not null default now(),resolved_at timestamptz);
create table if not exists public.payment_events(id uuid primary key default gen_random_uuid(),razorpay_order_id text,razorpay_payment_id text,event_type text not null,payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table if not exists public.webhook_events(id uuid primary key default gen_random_uuid(),provider text not null,event_id text not null,payload jsonb not null default '{}'::jsonb,processed_at timestamptz,error text,created_at timestamptz not null default now(),unique(provider,event_id));

-- Additive migration support when upgrading the v2 starter database.
alter table public.products add column if not exists weight_kg numeric not null default 1;
alter table public.products add column if not exists length_cm numeric not null default 25;
alter table public.products add column if not exists breadth_cm numeric not null default 25;
alter table public.products add column if not exists height_cm numeric not null default 30;
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists shipping_address2 text not null default '';
alter table public.orders add column if not exists shipping_landmark text not null default '';
alter table public.orders add column if not exists shipping_state text not null default '';
alter table public.orders add column if not exists shipping_paise integer not null default 0;
alter table public.orders add column if not exists tax_paise integer not null default 0;
alter table public.orders add column if not exists total_paise integer;
alter table public.orders add column if not exists payment_status text not null default 'pending';
alter table public.orders add column if not exists payment_method text not null default 'razorpay';
alter table public.orders add column if not exists shipment_provider text;
alter table public.orders add column if not exists provider_order_id text;
alter table public.orders add column if not exists provider_shipment_id text;
alter table public.orders add column if not exists awb text;
alter table public.orders add column if not exists courier_name text;
alter table public.orders add column if not exists tracking_url text;
alter table public.orders add column if not exists label_url text;
alter table public.orders add column if not exists manifest_url text;
alter table public.orders add column if not exists estimated_delivery date;
alter table public.orders add column if not exists shipped_at timestamptz;
alter table public.orders add column if not exists delivered_at timestamptz;
alter table public.orders add column if not exists delivery_issue_type text;
alter table public.orders add column if not exists delivery_issue_note text;
alter table public.orders add column if not exists internal_note text not null default '';
alter table public.orders add column if not exists cancelled_at timestamptz;
update public.orders set total_paise=coalesce(total_paise,subtotal_paise+coalesce(shipping_paise,0)+coalesce(tax_paise,0));
alter table public.orders alter column total_paise set not null;
update public.orders set payment_status='paid' where status in ('paid','processing','packed','shipped','out_for_delivery','delivered','delivery_issue','return_requested','return_approved','return_in_transit','returned','refund_pending','refunded','rto_initiated','rto_delivered') and payment_status='pending';
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check(status in ('pending_payment','paid','processing','packed','shipped','out_for_delivery','delivered','delivery_issue','return_requested','return_approved','return_in_transit','returned','refund_pending','refunded','cancelled','payment_failed','rto_initiated','rto_delivered'));
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders add constraint orders_payment_status_check check(payment_status in ('pending','authorized','paid','failed','refund_pending','partially_refunded','refunded'));
alter table public.return_requests add column if not exists reverse_shipment_id text;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,full_name,phone) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),coalesce(new.raw_user_meta_data->>'phone','')) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;

alter table public.profiles enable row level security; alter table public.customer_addresses enable row level security; alter table public.products enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.order_status_events enable row level security; alter table public.shipment_events enable row level security; alter table public.return_requests enable row level security; alter table public.delivery_issues enable row level security; alter table public.payment_events enable row level security; alter table public.webhook_events enable row level security;
drop policy if exists "Profile self read" on public.profiles; create policy "Profile self read" on public.profiles for select using(id=auth.uid() or public.is_admin());
drop policy if exists "Profile self update" on public.profiles; create policy "Profile self update" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid() and (role='customer' or public.is_admin()));
drop policy if exists "Addresses owner all" on public.customer_addresses; create policy "Addresses owner all" on public.customer_addresses for all using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
drop policy if exists "Public read active products" on public.products; create policy "Public read active products" on public.products for select using(is_active=true or public.is_admin());
drop policy if exists "Orders owner read" on public.orders; create policy "Orders owner read" on public.orders for select using(user_id=auth.uid() or public.is_admin());
drop policy if exists "Order items owner read" on public.order_items; create policy "Order items owner read" on public.order_items for select using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
drop policy if exists "Order events owner read" on public.order_status_events; create policy "Order events owner read" on public.order_status_events for select using(is_customer_visible and exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())) or public.is_admin());
drop policy if exists "Shipment events owner read" on public.shipment_events; create policy "Shipment events owner read" on public.shipment_events for select using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
drop policy if exists "Returns owner read and create" on public.return_requests; create policy "Returns owner read and create" on public.return_requests for select using(user_id=auth.uid() or public.is_admin()); create policy "Returns owner create" on public.return_requests for insert with check(user_id=auth.uid());
drop policy if exists "Issues owner read and create" on public.delivery_issues; create policy "Issues owner read and create" on public.delivery_issues for select using(reported_by=auth.uid() or public.is_admin()); create policy "Issues owner create" on public.delivery_issues for insert with check(reported_by=auth.uid());
-- No customer-facing policies for payment_events or webhook_events. Service-role Edge Functions only.
create index if not exists orders_user_created_idx on public.orders(user_id,created_at desc); create index if not exists orders_status_created_idx on public.orders(status,created_at desc); create index if not exists orders_awb_idx on public.orders(awb); create index if not exists order_items_order_idx on public.order_items(order_id); create index if not exists status_events_order_idx on public.order_status_events(order_id,created_at); create index if not exists shipment_events_order_idx on public.shipment_events(order_id,event_at desc); create index if not exists return_requests_status_idx on public.return_requests(status,created_at desc);
-- After registering your own customer account, promote it manually in SQL Editor:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='YOUR_ADMIN_EMAIL');
drop policy if exists "Admin update delivery issues" on public.delivery_issues; create policy "Admin update delivery issues" on public.delivery_issues for update using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Admin update orders" on public.orders; create policy "Admin update orders" on public.orders for update using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Admin update returns" on public.return_requests; create policy "Admin update returns" on public.return_requests for update using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Admin update products" on public.products; create policy "Admin update products" on public.products for all using(public.is_admin()) with check(public.is_admin());
