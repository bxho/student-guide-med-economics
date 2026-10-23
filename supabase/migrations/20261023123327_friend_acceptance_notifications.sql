ALTER TABLE public.student_notifications DROP CONSTRAINT IF EXISTS student_notifications_kind_check;
ALTER TABLE public.student_notifications ADD CONSTRAINT student_notifications_kind_check CHECK (kind IN ('friend_request','friend_accepted','message'));
CREATE OR REPLACE FUNCTION public.student_guide_notify_social_event()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF TG_TABLE_NAME='student_friends' THEN
  IF TG_OP='INSERT' AND NEW.status='pending' THEN
   INSERT INTO public.student_notifications(user_id,actor_id,kind) VALUES (NEW.friend_id,NEW.user_id,'friend_request');
  ELSIF TG_OP='UPDATE' AND OLD.status='pending' AND NEW.status='accepted' THEN
   INSERT INTO public.student_notifications(user_id,actor_id,kind) VALUES (NEW.user_id,NEW.friend_id,'friend_accepted');
  END IF;
 ELSIF TG_TABLE_NAME='student_social_messages' AND NEW.channel='direct' AND NEW.recipient_id IS NOT NULL THEN
  INSERT INTO public.student_notifications(user_id,actor_id,kind,reference_id) VALUES (NEW.recipient_id,NEW.sender_id,'message',NEW.id);
 END IF;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.student_guide_notify_social_event() FROM PUBLIC, anon, authenticated;