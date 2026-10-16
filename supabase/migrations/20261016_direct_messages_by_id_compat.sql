-- Keep direct messages by UUID available without requiring a prior friend link.
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
