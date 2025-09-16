-- Create table to store player edits
create table if not exists public.player_edits (
  id uuid primary key default gen_random_uuid(),
  player_id integer not null,
  name text,
  age integer,
  base_price bigint,
  batting_style text,
  bowling_style text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.player_edits enable row level security;

-- Create policies for public access (no auth required for this demo)
create policy "Allow public read access" on public.player_edits for select using (true);
create policy "Allow public insert access" on public.player_edits for insert with check (true);
create policy "Allow public update access" on public.player_edits for update using (true);
create policy "Allow public delete access" on public.player_edits for delete using (true);
