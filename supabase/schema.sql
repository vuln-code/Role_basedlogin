-- AccessFlow: secure role-based profile schema for Supabase PostgreSQL.
-- Run this entire file in the Supabase SQL Editor as the project owner.

begin;

do $$
begin
  create type public.app_role as enum ('ADMIN', 'MANAGER', 'USER');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'New user' check (char_length(full_name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 320),
  role public.app_role not null default 'USER',
  manager_id uuid null references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint profiles_manager_not_self check (manager_id is null or manager_id <> id)
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_manager_id_idx on public.profiles (manager_id);

comment on table public.profiles is 'Application profiles. Passwords and authentication secrets never belong here.';
comment on column public.profiles.role is 'Trusted application role; ordinary browser clients cannot update it.';
comment on column public.profiles.manager_id is 'Optional manager relationship assigned only through trusted administration.';

-- Trigger-owned profile creation. Role is deliberately hard-coded to USER and
-- never read from user metadata, preventing sign-up metadata privilege elevation.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_name text;
begin
  safe_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');

  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    left(coalesce(safe_name, split_part(coalesce(new.email, 'New user'), '@', 1), 'New user'), 120),
    left(coalesce(new.email, new.id::text || '@unavailable.local'), 320),
    'USER'::public.app_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = case
          when public.profiles.full_name = 'New user' then excluded.full_name
          else public.profiles.full_name
        end;

  return new;
end;
$$;

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Existing Auth users created before this schema receive a safe USER profile.
insert into public.profiles (id, full_name, email, role, created_at)
select
  users.id,
  left(coalesce(nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(users.email, 'New user'), '@', 1), 'New user'), 120),
  left(coalesce(users.email, users.id::text || '@unavailable.local'), 320),
  'USER'::public.app_role,
  coalesce(users.created_at, now())
from auth.users as users
on conflict (id) do nothing;

-- SECURITY DEFINER avoids recursive profiles policies. The function has no
-- caller-controlled identifier, uses a fixed empty search_path, and returns only
-- the caller's own role.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select profiles.role
  from public.profiles as profiles
  where profiles.id = auth.uid()
  limit 1;
$$;

revoke all on function private.current_app_role() from public, anon;
grant execute on function private.current_app_role() to authenticated;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_authorized on public.profiles;
create policy profiles_select_authorized
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or private.current_app_role() = 'ADMIN'::public.app_role
  or (
    private.current_app_role() = 'MANAGER'::public.app_role
    and manager_id = auth.uid()
  )
);

-- Table privileges and RLS are separate gates. Browser clients get SELECT only.
revoke all privileges on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;

commit;
