-- Apply once to a dedicated Supabase project using the SQL editor / Supabase CLI.
-- Never put a service_role key in the website. See docs/DATA_AND_PUBLISHING.md.
begin;

create table if not exists public.portfolio_owners (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portfolio_owners enable row level security;
revoke all on public.portfolio_owners from anon, authenticated;
grant select on public.portfolio_owners to authenticated;
create policy "Owner can read own membership" on public.portfolio_owners
  for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_portfolio_owner()
returns boolean language sql stable security invoker set search_path = ''
as $$ select exists(select 1 from public.portfolio_owners where user_id = (select auth.uid())); $$;
revoke all on function public.is_portfolio_owner() from public, anon;
grant execute on function public.is_portfolio_owner() to authenticated;

-- The renderer uses textContent and its URL allowlist, in addition to these server checks.
create or replace function public.valid_portfolio_document(document jsonb, public_only boolean default false)
returns boolean language plpgsql immutable security invoker set search_path = ''
as $$
declare item jsonb; child jsonb;
begin
  if document->>'schemaVersion' is distinct from '3'
     or jsonb_typeof(document->'profile') is distinct from 'object'
     or length(coalesce(document->'profile'->>'name', '')) = 0
     or jsonb_typeof(document->'records') is distinct from 'array'
     or jsonb_typeof(document->'nodes') is distinct from 'array'
     or jsonb_typeof(document->'edges') is distinct from 'array'
     or octet_length(document::text) > 8388608 then return false; end if;
  if jsonb_array_length(document->'records') > 1000
     or jsonb_array_length(document->'nodes') > 1000
     or jsonb_array_length(document->'edges') > 4000 then return false; end if;
  for item in select value from jsonb_array_elements(document->'records') loop
    if (item->>'id') is null or (item->>'id') !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,99}$'
       or (item->>'title') is null or length(item->>'title') = 0
       or (item->>'status') is null or item->>'status' not in ('published','draft','archived')
       or (public_only and item->>'status' <> 'published')
       or jsonb_typeof(item->'links') is distinct from 'array'
       or jsonb_typeof(item->'media') is distinct from 'array' then return false; end if;
    for child in select value from jsonb_array_elements(item->'links') loop
      if child->>'url' is null or child->>'url' ~* '^[[:space:]]*(javascript|vbscript|data|file|blob):'
        or child->>'url' ~ '^//' then return false; end if;
    end loop;
    for child in select value from jsonb_array_elements(item->'media') loop
      if child->>'url' is null or child->>'url' ~* '^[[:space:]]*(javascript|vbscript|file|blob):'
        or child->>'url' ~* '^data:(?!image/(png|jpeg|webp|gif);base64,)'
        or child->>'url' ~* '[.]svg([?#]|$)' then return false; end if;
    end loop;
  end loop;
  if exists(select 1 from jsonb_array_elements(document->'records') r group by r->>'id' having count(*) > 1)
    or exists(select 1 from jsonb_array_elements(document->'records') r group by r->>'slug' having count(*) > 1)
    or exists(select 1 from jsonb_array_elements(document->'nodes') n group by n->>'id' having count(*) > 1)
    or exists(select 1 from jsonb_array_elements(document->'edges') e group by e->>'id' having count(*) > 1)
    then return false; end if;
  for item in select value from jsonb_array_elements(document->'nodes') loop
    if item->>'id' is null or item->>'contentId' is null
      or not exists(select 1 from jsonb_array_elements(document->'records') r where r->>'id' = item->>'contentId')
      or (item->>'parentId' is not null and not exists(select 1 from jsonb_array_elements(document->'nodes') n where n->>'id' = item->>'parentId'))
      or (public_only and item->>'visible' is distinct from 'true') then return false; end if;
  end loop;
  for item in select value from jsonb_array_elements(document->'edges') loop
    if item->>'source' is null or item->>'target' is null or item->>'source' = item->>'target'
      or not exists(select 1 from jsonb_array_elements(document->'nodes') n where n->>'id' = item->>'source')
      or not exists(select 1 from jsonb_array_elements(document->'nodes') n where n->>'id' = item->>'target') then return false; end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;
revoke all on function public.valid_portfolio_document(jsonb,boolean) from public, anon;
grant execute on function public.valid_portfolio_document(jsonb,boolean) to authenticated;

create table if not exists public.portfolio_public (
  id text primary key check (id = 'portfolio'),
  snapshot jsonb not null check (public.valid_portfolio_document(snapshot, true)),
  updated_at timestamptz not null default now()
);
create table if not exists public.portfolio_drafts (
  id text primary key check (id = 'portfolio'),
  snapshot jsonb not null check (public.valid_portfolio_document(snapshot)),
  updated_at timestamptz not null default now()
);
create table if not exists public.portfolio_versions (
  id uuid primary key default gen_random_uuid(),
  snapshot jsonb not null check (public.valid_portfolio_document(snapshot)),
  label text not null default 'Published portfolio',
  created_at timestamptz not null default now()
);
alter table public.portfolio_public enable row level security;
alter table public.portfolio_drafts enable row level security;
alter table public.portfolio_versions enable row level security;
revoke all on public.portfolio_public, public.portfolio_drafts, public.portfolio_versions from anon, authenticated;
grant select on public.portfolio_public to anon, authenticated;
grant insert, update on public.portfolio_public to authenticated;
grant select, insert, update on public.portfolio_drafts to authenticated;
grant select, insert, delete on public.portfolio_versions to authenticated;
create policy "Anyone can read publication" on public.portfolio_public for select to anon, authenticated using (true);
create policy "Only owner can insert publication" on public.portfolio_public for insert to authenticated with check ((select public.is_portfolio_owner()));
create policy "Only owner can update publication" on public.portfolio_public for update to authenticated
  using ((select public.is_portfolio_owner())) with check ((select public.is_portfolio_owner()));
create policy "Only owner can read draft" on public.portfolio_drafts for select to authenticated using ((select public.is_portfolio_owner()));
create policy "Only owner can insert draft" on public.portfolio_drafts for insert to authenticated with check ((select public.is_portfolio_owner()));
create policy "Only owner can update draft" on public.portfolio_drafts for update to authenticated
  using ((select public.is_portfolio_owner())) with check ((select public.is_portfolio_owner()));
create policy "Only owner can read versions" on public.portfolio_versions for select to authenticated using ((select public.is_portfolio_owner()));
create policy "Only owner can insert versions" on public.portfolio_versions for insert to authenticated with check ((select public.is_portfolio_owner()));
create policy "Only owner can prune versions" on public.portfolio_versions for delete to authenticated using ((select public.is_portfolio_owner()));

-- One database transaction: draft, version history, and public pointer move together.
create or replace function public.publish_portfolio(draft_document jsonb, public_document jsonb)
returns void language plpgsql security invoker set search_path = ''
as $$
begin
  if not public.is_portfolio_owner() then raise exception 'Owner authorization required' using errcode = '42501'; end if;
  if not public.valid_portfolio_document(draft_document) or not public.valid_portfolio_document(public_document, true)
    then raise exception 'Invalid portfolio document'; end if;
  insert into public.portfolio_drafts(id,snapshot,updated_at) values ('portfolio',draft_document,now())
    on conflict(id) do update set snapshot=excluded.snapshot, updated_at=excluded.updated_at;
  insert into public.portfolio_versions(snapshot,label) values (draft_document,'Published ' || to_char(now() at time zone 'UTC','YYYY-MM-DD HH24:MI:SS') || ' UTC');
  insert into public.portfolio_public(id,snapshot,updated_at) values ('portfolio',public_document,now())
    on conflict(id) do update set snapshot=excluded.snapshot, updated_at=excluded.updated_at;
  delete from public.portfolio_versions where id in
    (select id from public.portfolio_versions order by created_at desc, id desc offset 30);
end;
$$;
revoke all on function public.publish_portfolio(jsonb,jsonb) from public, anon;
grant execute on function public.publish_portfolio(jsonb,jsonb) to authenticated;

-- Uploaded assets are intended for public portfolio use. Never upload confidential media.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-media','portfolio-media',true,20971520,
  array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','application/pdf'])
on conflict(id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;
create policy "Owner can read own media metadata" on storage.objects for select to authenticated
  using (bucket_id='portfolio-media' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_owner()));
create policy "Owner can upload media" on storage.objects for insert to authenticated
  with check (bucket_id='portfolio-media' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_owner()));
create policy "Owner can replace own media" on storage.objects for update to authenticated
  using (bucket_id='portfolio-media' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_owner()))
  with check (bucket_id='portfolio-media' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_owner()));
create policy "Owner can remove own media" on storage.objects for delete to authenticated
  using (bucket_id='portfolio-media' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.is_portfolio_owner()));
commit;
