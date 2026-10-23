-- Friend requests, friend-only profiles/messages, and durable in-app notifications.
ALTER TABLE public.student_friends
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'accepted',
  ADD COLUMN IF NOT EXISTS responded_at timestamptz;
ALTER TABLE public.student_friends DROP CONSTRAINT IF EXISTS student_friends_status_check;
ALTER TABLE public.student_friends ADD CONSTRAINT student_friends_status_check
  CHECK (status IN ('pending','accepted'));
UPDATE public.student_friends SET status='accepted' WHERE status IS NULL;

ALTER TABLE public.student_social_messages
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- The directory exposes only fields intended for username discovery.
CREATE OR REPLACE VIEW public.student_profile_directory
WITH (security_invoker = false) AS
SELECT user_id, username, display_name, avatar_url
FROM public.student_profiles;
REVOKE ALL ON public.student_profile_directory FROM PUBLIC, anon;
GRANT SELECT ON public.student_profile_directory TO authenticated;

-- Replace broad profile access with self + accepted friends only.
DROP POLICY IF EXISTS "Profiles visible to authenticated users" ON public.student_profiles;
DROP POLICY IF EXISTS "Profiles visible to self and accepted friends" ON public.student_profiles;
CREATE POLICY "Profiles visible to self and accepted friends"
ON public.student_profiles FOR SELECT TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.student_friends f
    WHERE f.status = 'accepted'
      AND ((f.user_id = (SELECT auth.uid()) AND f.friend_id = student_profiles.user_id)
        OR (f.friend_id = (SELECT auth.uid()) AND f.user_id = student_profiles.user_id))
  )
);

-- Requests are inserted by the requester; only the recipient can accept by updating status.
DROP POLICY IF EXISTS "Users add friends to own list" ON public.student_friends;
DROP POLICY IF EXISTS "Users read their friend list" ON public.student_friends;
DROP POLICY IF EXISTS "Users remove friends from own list" ON public.student_friends;
DROP POLICY IF EXISTS "Users update own friend list" ON public.student_friends;
DROP POLICY IF EXISTS "Friend links visible to participants" ON public.student_friends;
DROP POLICY IF EXISTS "Users send friend requests" ON public.student_friends;
DROP POLICY IF EXISTS "Recipients accept incoming friend requests" ON public.student_friends;
DROP POLICY IF EXISTS "Participants remove friendship links" ON public.student_friends;

CREATE POLICY "Friend links visible to participants"
ON public.student_friends FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()) OR friend_id = (SELECT auth.uid()));

CREATE POLICY "Users send friend requests"
ON public.student_friends FOR INSERT TO authenticated
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND friend_id <> (SELECT auth.uid())
  AND status = 'pending'
);

CREATE POLICY "Recipients accept incoming friend requests"
ON public.student_friends FOR UPDATE TO authenticated
USING (friend_id = (SELECT auth.uid()) AND status = 'pending')
WITH CHECK (friend_id = (SELECT auth.uid()) AND status = 'accepted');

CREATE POLICY "Participants remove friendship links"
ON public.student_friends FOR DELETE TO authenticated
USING (user_id = (SELECT auth.uid()) OR friend_id = (SELECT auth.uid()));

-- Restrict which columns a client can update so a recipient cannot rewrite the requester ID.
REVOKE UPDATE ON public.student_friends FROM authenticated;
GRANT UPDATE (status, responded_at) ON public.student_friends TO authenticated;

-- Direct messages require an accepted friendship, not just knowledge of a UUID.
DROP POLICY IF EXISTS "Direct messages visible to participants" ON public.student_social_messages;
DROP POLICY IF EXISTS "Users send direct messages as themselves" ON public.student_social_messages;
DROP POLICY IF EXISTS "Accepted friends read direct messages" ON public.student_social_messages;
DROP POLICY IF EXISTS "Accepted friends send direct messages" ON public.student_social_messages;
DROP POLICY IF EXISTS "Recipients mark direct messages read" ON public.student_social_messages;

CREATE POLICY "Accepted friends read direct messages"
ON public.student_social_messages FOR SELECT TO authenticated
USING (
  channel = 'direct'
  AND ((sender_id = (SELECT auth.uid()) AND recipient_id IS NOT NULL)
    OR recipient_id = (SELECT auth.uid()))
  AND EXISTS (
    SELECT 1 FROM public.student_friends f
    WHERE f.status = 'accepted'
      AND ((f.user_id = student_social_messages.sender_id AND f.friend_id = student_social_messages.recipient_id)
        OR (f.friend_id = student_social_messages.sender_id AND f.user_id = student_social_messages.recipient_id))
  )
);

CREATE POLICY "Accepted friends send direct messages"
ON public.student_social_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = (SELECT auth.uid())
  AND channel = 'direct'
  AND recipient_id IS NOT NULL
  AND recipient_id <> (SELECT auth.uid())
  AND group_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.student_friends f
    WHERE f.status = 'accepted'
      AND ((f.user_id = sender_id AND f.friend_id = recipient_id)
        OR (f.friend_id = sender_id AND f.user_id = recipient_id))
  )
);

CREATE POLICY "Recipients mark direct messages read"
ON public.student_social_messages FOR UPDATE TO authenticated
USING (channel = 'direct' AND recipient_id = (SELECT auth.uid()))
WITH CHECK (channel = 'direct' AND recipient_id = (SELECT auth.uid()));
REVOKE UPDATE ON public.student_social_messages FROM authenticated;
GRANT UPDATE (read_at) ON public.student_social_messages TO authenticated;

-- Durable in-app notifications; message text itself is never copied into this table.
CREATE TABLE IF NOT EXISTS public.student_notifications (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('friend_request','message')),
  reference_id bigint,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);
CREATE INDEX IF NOT EXISTS student_notifications_user_unread_idx
  ON public.student_notifications (user_id, created_at DESC) WHERE read_at IS NULL;
ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own notifications" ON public.student_notifications;
DROP POLICY IF EXISTS "Users mark own notifications read" ON public.student_notifications;
CREATE POLICY "Users read own notifications"
ON public.student_notifications FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Users mark own notifications read"
ON public.student_notifications FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));
REVOKE INSERT, DELETE, UPDATE ON public.student_notifications FROM authenticated;
GRANT UPDATE (read_at) ON public.student_notifications TO authenticated;

CREATE OR REPLACE FUNCTION public.student_guide_notify_social_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'student_friends' THEN
    IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
      INSERT INTO public.student_notifications(user_id, actor_id, kind)
      VALUES (NEW.friend_id, NEW.user_id, 'friend_request');
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
      INSERT INTO public.student_notifications(user_id, actor_id, kind)
      VALUES (NEW.user_id, NEW.friend_id, 'friend_request');
    END IF;
  ELSIF TG_TABLE_NAME = 'student_social_messages' THEN
    IF NEW.channel = 'direct' AND NEW.recipient_id IS NOT NULL THEN
      INSERT INTO public.student_notifications(user_id, actor_id, kind, reference_id)
      VALUES (NEW.recipient_id, NEW.sender_id, 'message', NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.student_guide_notify_social_event() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS student_friend_request_notification ON public.student_friends;
CREATE TRIGGER student_friend_request_notification
AFTER INSERT OR UPDATE OF status ON public.student_friends
FOR EACH ROW EXECUTE FUNCTION public.student_guide_notify_social_event();

DROP TRIGGER IF EXISTS student_direct_message_notification ON public.student_social_messages;
CREATE TRIGGER student_direct_message_notification
AFTER INSERT ON public.student_social_messages
FOR EACH ROW EXECUTE FUNCTION public.student_guide_notify_social_event();

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.student_friends;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.student_notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
