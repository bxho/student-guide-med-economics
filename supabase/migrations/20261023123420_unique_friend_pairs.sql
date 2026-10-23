CREATE UNIQUE INDEX IF NOT EXISTS student_friends_unordered_pair_unique_idx ON public.student_friends (LEAST(user_id, friend_id), GREATEST(user_id, friend_id));
CREATE INDEX IF NOT EXISTS student_achievement_posts_user_id_idx ON public.student_achievement_posts(user_id);
CREATE INDEX IF NOT EXISTS student_chat_groups_owner_id_idx ON public.student_chat_groups(owner_id);
CREATE INDEX IF NOT EXISTS student_notifications_actor_id_idx ON public.student_notifications(actor_id);
CREATE INDEX IF NOT EXISTS student_social_messages_recipient_id_idx ON public.student_social_messages(recipient_id);
