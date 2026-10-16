-- Replace the public community feed with friend-only posts and direct conversations.
drop policy if exists "Achievements visible to authenticated users" on public.student_achievement_posts;
drop policy if exists "Achievements visible to friends only" on public.student_achievement_posts;
create policy "Achievements visible to friends only"
on public.student_achievement_posts
for select to authenticated
using (
  user_id = (select auth.uid())
  or exists (
    select 1
    from public.student_friends f
    where (f.user_id = (select auth.uid()) and f.friend_id = student_achievement_posts.user_id)
       or (f.friend_id = (select auth.uid()) and f.user_id = student_achievement_posts.user_id)
  )
);

drop policy if exists "Public messages visible to authenticated users" on public.student_social_messages;
drop policy if exists "Direct messages visible to participants" on public.student_social_messages;
create policy "Direct messages visible to participants"
on public.student_social_messages
for select to authenticated
using (
  channel = 'direct'
  and ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id)
);

drop policy if exists "Users send messages as themselves" on public.student_social_messages;
create policy "Users send direct messages as themselves"
on public.student_social_messages
for insert to authenticated
with check (
  (select auth.uid()) = sender_id
  and channel = 'direct'
  and recipient_id is not null
  and recipient_id <> (select auth.uid())
  and group_id is null
);

create index if not exists student_friends_user_friend_idx
  on public.student_friends(user_id, friend_id);
create index if not exists student_achievement_posts_created_at_idx
  on public.student_achievement_posts(created_at desc);
