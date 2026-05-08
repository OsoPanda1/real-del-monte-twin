-- Enable pgcrypto for digest()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Recreate function with safe fallback and explicit schema for digest
CREATE OR REPLACE FUNCTION public.handle_new_user_sovereign()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.sovereign_identity (user_id, handle, public_hash, trust_level)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)) || '-' || substr(NEW.id::text, 1, 4),
      encode(extensions.digest(NEW.id::text || 'rdmx-sovereign', 'sha256'), 'hex'),
      1
    ) ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'sovereign_identity insert failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

-- Make handle_new_user also resilient
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  BEGIN
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'profile insert failed for %: %', NEW.id, SQLERRM;
  END;
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'turista')
    ON CONFLICT DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'user_roles insert failed for %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$function$;

-- Ensure triggers exist on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_sovereign ON auth.users;
CREATE TRIGGER on_auth_user_created_sovereign
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_sovereign();