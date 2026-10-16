-- Extend the existing Student Guide social schema rather than creating parallel chat tables.
alter table public.student_profiles add column if not exists username text;
alter table public.student_profiles add column if not exists avatar_url text;
update public.student_profiles
set username='student_'||replace(left(user_id::text,8),'-','')
where username is null or btrim(username)='';
create unique index if not exists student_profiles_username_unique_idx
  on public.student_profiles (lower(username));
alter table public.student_profiles alter column username set not null;
alter table public.student_profiles drop constraint if exists student_profiles_username_format;
alter table public.student_profiles add constraint student_profiles_username_format
  check (username ~ '^[a-z0-9_]{3,24}$');
alter table public.student_profiles drop constraint if exists student_profiles_display_name_length;
alter table public.student_profiles add constraint student_profiles_display_name_length
  check (char_length(display_name) between 1 and 50);
create table if not exists public.student_friends (
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id,friend_id),
  constraint student_friend_not_self check (user_id <> friend_id)
);
create index if not exists student_friends_friend_id_idx on public.student_friends(friend_id);
alter table public.student_friends enable row level security;
drop policy if exists "Users read their friend list" on public.student_friends;
create policy "Users read their friend list" on public.student_friends for select to authenticated
using (user_id=auth.uid() or friend_id=auth.uid());
drop policy if exists "Users add friends to own list" on public.student_friends;
create policy "Users add friends to own list" on public.student_friends for insert to authenticated
with check (user_id=auth.uid() and friend_id<>auth.uid());
drop policy if exists "Users remove friends from own list" on public.student_friends;
create policy "Users remove friends from own list" on public.student_friends for delete to authenticated
using (user_id=auth.uid());
create or replace function public.student_guide_create_profile()
returns trigger language plpgsql security definer set search_path=public
as $$
declare requested_username text; requested_name text;
begin
 requested_username:=lower(coalesce(new.raw_user_meta_data->>'username',''));
 requested_name:=left(coalesce(nullif(btrim(new.raw_user_meta_data->>'display_name'),''),'طالب'),40);
 if requested_username !~ '^[a-z0-9_]{3,24}$' then
   requested_username:='student_'||replace(left(new.id::text,8),'-','');
 end if;
 insert into public.student_profiles(user_id,username,display_name)
 values(new.id,requested_username,requested_name)
 on conflict (user_id) do nothing;
 return new;
end;
$$;
revoke all on function public.student_guide_create_profile() from public,anon,authenticated;
drop trigger if exists on_auth_user_created_student_profile on auth.users;
create trigger on_auth_user_created_student_profile after insert on auth.users
for each row execute procedure public.student_guide_create_profile();
insert into public.student_profiles(user_id,username,display_name)
select u.id,
       case when lower(coalesce(u.raw_user_meta_data->>'username','')) ~ '^[a-z0-9_]{3,24}$'
            then lower(u.raw_user_meta_data->>'username')
            else 'student_'||replace(left(u.id::text,8),'-','') end,
       left(coalesce(nullif(btrim(u.raw_user_meta_data->>'display_name'),''),'طالب'),50)
from auth.users u
on conflict (user_id) do nothing;
grant select,insert,update on public.student_profiles to authenticated;
grant select,insert,update,delete on public.student_friends to authenticated;
drop policy if exists "Users update own friend list" on public.student_friends;
create policy "Users update own friend list" on public.student_friends for update to authenticated
using (user_id=auth.uid()) with check (user_id=auth.uid());
grant select,insert on public.student_social_messages to authenticated;
drop policy if exists "Users send messages as themselves" on public.student_social_messages;
create policy "Users send messages as themselves" on public.student_social_messages for insert to authenticated
with check (
 auth.uid()=sender_id and (
  (channel='public' and recipient_id is null and group_id is null) or
  (channel='direct' and recipient_id is not null and recipient_id<>auth.uid() and group_id is null) or
  (channel='group' and group_id is not null and recipient_id is null and exists(
    select 1 from public.student_chat_group_members m where m.group_id=student_social_messages.group_id and m.user_id=auth.uid()
  ))
 )
);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('profile-avatars','profile-avatars',true,3145728,array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true,file_size_limit=3145728,allowed_mime_types=array['image/png','image/jpeg','image/webp'];
drop policy if exists "profile avatars are publicly readable" on storage.objects;
create policy "profile avatars are publicly readable" on storage.objects for select using (bucket_id='profile-avatars');
drop policy if exists "users upload their own profile avatar" on storage.objects;
create policy "users upload their own profile avatar" on storage.objects for insert to authenticated with check (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "users update their own profile avatar" on storage.objects;
create policy "users update their own profile avatar" on storage.objects for update to authenticated using (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check (bucket_id='profile-avatars' and (storage.foldername(name))[1]=auth.uid()::text);
