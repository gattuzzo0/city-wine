-- citywine retail catalog, paid orders, Stripe idempotency.
-- Decrement stock only from fulfill_stripe_checkout (webhook).
-- Rollback: drop schema citywine cascade; delete from storage.buckets where id = 'citywine-catalog';
-- PostgREST: expose extra schema "citywine" in API settings.

create schema if not exists citywine;

create type citywine.product_kind as enum ('wine', 'beer', 'glass');
create type citywine.fulfillment_method as enum ('pickup', 'delivery');
create type citywine.shop_order_status as enum ('paid');

create table citywine.catalog_products (
  id text primary key,
  kind citywine.product_kind not null,
  name text not null,
  price_pesos integer not null check (price_pesos >= 0),
  stock integer not null check (stock >= 0),
  active boolean not null default true,
  image_path text,
  locale jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table citywine.shop_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_checkout_session_id text not null unique,
  stripe_event_id text not null unique,
  customer_email text,
  fulfillment citywine.fulfillment_method not null,
  fulfillment_date date not null,
  shipping_pesos integer not null check (shipping_pesos >= 0),
  subtotal_pesos integer not null check (subtotal_pesos >= 0),
  total_pesos integer not null check (total_pesos >= 0),
  shipping_address jsonb,
  status citywine.shop_order_status not null default 'paid',
  created_at timestamptz not null default now()
);

create table citywine.shop_order_lines (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references citywine.shop_orders (id) on delete cascade,
  product_id text not null,
  name_snapshot text not null,
  quantity integer not null check (quantity >= 1),
  unit_price_pesos integer not null check (unit_price_pesos >= 0)
);

create table citywine.stripe_events (
  event_id text primary key,
  created_at timestamptz not null default now()
);

create index idx_citywine_catalog_products_kind on citywine.catalog_products (kind);
create index idx_citywine_shop_orders_created_at on citywine.shop_orders (created_at desc);
create index idx_citywine_shop_order_lines_order_id on citywine.shop_order_lines (order_id);

alter table citywine.catalog_products enable row level security;
alter table citywine.catalog_products force row level security;
alter table citywine.shop_orders enable row level security;
alter table citywine.shop_orders force row level security;
alter table citywine.shop_order_lines enable row level security;
alter table citywine.shop_order_lines force row level security;
alter table citywine.stripe_events enable row level security;
alter table citywine.stripe_events force row level security;

grant usage on schema citywine to service_role;
grant all on all tables in schema citywine to service_role;
grant all on all sequences in schema citywine to service_role;

create or replace function citywine.fulfill_stripe_checkout(
  p_event_id text,
  p_session_id text,
  p_email text,
  p_fulfillment citywine.fulfillment_method,
  p_fulfillment_date date,
  p_shipping_pesos integer,
  p_subtotal_pesos integer,
  p_total_pesos integer,
  p_shipping_address jsonb,
  p_lines jsonb
) returns uuid
language plpgsql
security definer
set search_path = citywine
as $$
declare
  v_order_id uuid;
  v_line jsonb;
  v_pid text;
  v_qty integer;
  v_price integer;
  v_name text;
  v_updated integer;
begin
  if p_event_id is null or p_session_id is null then
    raise exception 'Faltan identificadores de Stripe';
  end if;
  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) < 1 then
    raise exception 'Pedido sin líneas';
  end if;

  insert into citywine.stripe_events (event_id) values (p_event_id);

  insert into citywine.shop_orders (
    stripe_checkout_session_id,
    stripe_event_id,
    customer_email,
    fulfillment,
    fulfillment_date,
    shipping_pesos,
    subtotal_pesos,
    total_pesos,
    shipping_address,
    status
  ) values (
    p_session_id,
    p_event_id,
    p_email,
    p_fulfillment,
    p_fulfillment_date,
    p_shipping_pesos,
    p_subtotal_pesos,
    p_total_pesos,
    p_shipping_address,
    'paid'
  ) returning id into v_order_id;

  for v_line in select value from jsonb_array_elements(p_lines)
  loop
    v_pid := v_line->>'productId';
    v_qty := (v_line->>'qty')::integer;
    v_price := (v_line->>'unitPricePesos')::integer;
    v_name := coalesce(v_line->>'name', v_pid);
    if v_pid is null or v_qty is null or v_qty < 1 or v_price is null then
      raise exception 'Línea de pedido inválida';
    end if;

    update citywine.catalog_products
      set stock = stock - v_qty, updated_at = now()
      where id = v_pid and stock >= v_qty;
    get diagnostics v_updated = row_count;
    if v_updated <> 1 then
      raise exception 'No hay suficiente inventario para %', v_pid;
    end if;

    insert into citywine.shop_order_lines (order_id, product_id, name_snapshot, quantity, unit_price_pesos)
    values (v_order_id, v_pid, v_name, v_qty, v_price);
  end loop;

  return v_order_id;
exception
  when unique_violation then
    select id into v_order_id from citywine.shop_orders where stripe_event_id = p_event_id or stripe_checkout_session_id = p_session_id limit 1;
    return v_order_id;
end;
$$;

revoke all on function citywine.fulfill_stripe_checkout(text, text, text, citywine.fulfillment_method, date, integer, integer, integer, jsonb, jsonb) from public;
grant execute on function citywine.fulfill_stripe_checkout(text, text, text, citywine.fulfillment_method, date, integer, integer, integer, jsonb, jsonb) to service_role;

insert into citywine.catalog_products (id, kind, name, price_pesos, stock, active, image_path, locale) values
(
  'nebbiolo-casa', 'wine', 'Nebbiolo de la Casa', 780, 24, true, '/images/city-wine/nebbiolo-casa.png',
  $json${"type":"Tinto","mood":"Sofisticada","region":"Valle de Guadalupe","notes":{"es":"Cereza negra · cacao · tierra húmeda","en":"Black cherry · cacao · damp earth"},"description":{"es":"Elegante y con carácter. Un tinto que llega con calma y se queda en la mesa.","en":"Elegant, with character. A red that arrives calmly and stays at the table."},"profile":{"elegancia":8,"frescura":3,"calidez":7,"celebración":6,"gastronomía":8,"sofisticación":8,"versatilidad":5,"accesibilidad":5,"sutileza":4,"equilibrio":7,"intensidad":7,"cuerpo":8,"acidez":5,"ligereza":3,"premium":7,"memorable":7,"suavidad":6}}$json$::jsonb
),
(
  'blanco-altura', 'wine', 'Blanco de Altura', 460, 24, true, '/images/city-wine/blanco-altura.png',
  $json${"type":"Blanco","mood":"Relajada","region":"Querétaro","notes":{"es":"Pera · flores blancas · mineral","en":"Pear · white flowers · mineral"},"description":{"es":"Fresco, mineral y ligero. Acompaña sin imponer, con una acidez que abre el apetito.","en":"Fresh, mineral and light. It accompanies without imposing, with an acidity that opens the appetite."},"profile":{"elegancia":6,"frescura":9,"calidez":2,"celebración":5,"gastronomía":6,"sofisticación":5,"versatilidad":9,"accesibilidad":9,"sutileza":8,"equilibrio":8,"intensidad":3,"cuerpo":3,"acidez":8,"ligereza":9,"premium":5,"memorable":5,"suavidad":7}}$json$::jsonb
),
(
  'rose-medianoche', 'wine', 'Rosé de Medianoche', 520, 24, true, '/images/city-wine/rose-medianoche.png',
  $json${"type":"Rosado","mood":"Celebración","region":"Ensenada","notes":{"es":"Fresa silvestre · cítricos · sal marina","en":"Wild strawberry · citrus · sea salt"},"description":{"es":"Festivo y accesible. Un rosado que anima la mesa sin pedir solemnidad.","en":"Festive and approachable. A rosé that lifts the table without asking for ceremony."},"profile":{"elegancia":6,"frescura":8,"calidez":4,"celebración":9,"gastronomía":5,"sofisticación":5,"versatilidad":9,"accesibilidad":8,"sutileza":6,"equilibrio":7,"intensidad":4,"cuerpo":4,"acidez":7,"ligereza":8,"premium":5,"memorable":6,"suavidad":7}}$json$::jsonb
),
(
  'reserva-sierra', 'wine', 'Reserva de la Sierra', 1180, 24, true, '/images/city-wine/reserva-sierra.png',
  $json${"type":"Tinto","mood":"Aventurera","region":"Coahuila","notes":{"es":"Ciruela · especias · vainilla","en":"Plum · spice · vanilla"},"description":{"es":"Estructurado, premium y memorable. Para mesas donde el vino también es protagonista.","en":"Structured, premium and memorable. For tables where the wine is also the lead."},"profile":{"elegancia":9,"frescura":2,"calidez":6,"celebración":7,"gastronomía":9,"sofisticación":9,"versatilidad":5,"accesibilidad":4,"sutileza":2,"equilibrio":6,"intensidad":9,"cuerpo":9,"acidez":4,"ligereza":2,"premium":9,"memorable":9,"suavidad":5}}$json$::jsonb
),
(
  'beer-cauce-ambar', 'beer', 'Cauce Ámbar', 95, 24, true, '/images/city-wine/beer-cauce-ambar.png',
  $json${"brewery":"Cervecería Wendlandt","style":"Amber Ale · 5.2%"}$json$::jsonb
),
(
  'beer-lagrimas-negras', 'beer', 'Lágrimas Negras', 125, 24, true, '/images/city-wine/beer-lagrimas-negras.png',
  $json${"brewery":"Fauna","style":"Oatmeal Stout · 6.0%"}$json$::jsonb
),
(
  'beer-bruma', 'beer', 'Bruma', 110, 24, true, '/images/city-wine/beer-bruma.png',
  $json${"brewery":"Insurgente","style":"West Coast IPA · 6.5%"}$json$::jsonb
),
(
  'glass-copa-sommelier', 'glass', 'Copa Sommelier', 680, 24, true, '/images/city-wine/glass-copa-sommelier.png',
  $json${"name":{"es":"Copa Sommelier","en":"Sommelier glass"},"detail":{"es":"Cristal fino · para tintos","en":"Fine crystal · for reds"}}$json$::jsonb
),
(
  'glass-decantador-noche', 'glass', 'Decantador Noche', 1240, 24, true, '/images/city-wine/glass-decantador-noche.png',
  $json${"name":{"es":"Decantador Noche","en":"Night decanter"},"detail":{"es":"Vidrio soplado · 1.5 L","en":"Blown glass · 1.5 L"}}$json$::jsonb
),
(
  'glass-vaso-facetado', 'glass', 'Vaso Facetado', 740, 24, true, '/images/city-wine/glass-vaso-facetado.png',
  $json${"name":{"es":"Vaso Facetado","en":"Faceted tumbler"},"detail":{"es":"Cristal tallado · set de 2","en":"Cut crystal · set of 2"}}$json$::jsonb
);

insert into storage.buckets (id, name, public)
values ('citywine-catalog', 'citywine-catalog', true)
on conflict (id) do nothing;

drop policy if exists "citywine catalog public read" on storage.objects;
create policy "citywine catalog public read"
on storage.objects for select
using (bucket_id = 'citywine-catalog');
