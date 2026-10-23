DROP VIEW IF EXISTS public.student_profile_directory;
CREATE TABLE IF NOT EXISTS public.student_profile_directory (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 username text NOT NULL,
 display_name text NOT NULL DEFAULT 'طالب',
 avatar_url text,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS student_profile_directory_username_unique_idx ON public.student_profile_directory (lower(username));
ALTER TABLE public.student_profile_directory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users search public profile fields" ON public.student_profile_directory;
CREATE POLICY "Authenticated users search public profile fields" ON public.student_profile_directory FOR SELECT TO authenticated USING (true);
REVOKE ALL ON public.student_profile_directory FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.student_profile_directory TO authenticated;
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION private.sync_student_profile_directory()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
 IF TG_OP='DELETE' THEN
  DELETE FROM public.student_profile_directory WHERE user_id=OLD.user_id;
  RETURN OLD;
 END IF;
 INSERT INTO public.student_profile_directory(user_id,username,display_name,avatar_url,updated_at)
 VALUES (NEW.user_id,NEW.username,NEW.display_name,NEW.avatar_url,now())
 ON CONFLICT (user_id) DO UPDATE SET username=EXCLUDED.username,display_name=EXCLUDED.display_name,avatar_url=EXCLUDED.avatar_url,updated_at=now();
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION private.sync_student_profile_directory() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS student_profiles_directory_sync ON public.student_profiles;
CREATE TRIGGER student_profiles_directory_sync AFTER INSERT OR UPDATE OR DELETE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION private.sync_student_profile_directory();
INSERT INTO public.student_profile_directory(user_id,username,display_name,avatar_url,updated_at)
SELECT user_id,username,display_name,avatar_url,now() FROM public.student_profiles
ON CONFLICT (user_id) DO UPDATE SET username=EXCLUDED.username,display_name=EXCLUDED.display_name,avatar_url=EXCLUDED.avatar_url,updated_at=now();