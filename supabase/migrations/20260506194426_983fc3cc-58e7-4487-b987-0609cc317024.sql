
-- 1. Tighten INSERT policies that were WITH CHECK (true)
DROP POLICY IF EXISTS "Service inserts ai logs" ON public.ai_interaction_log;
CREATE POLICY "Authenticated insert ai logs"
  ON public.ai_interaction_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service inserts kaos" ON public.kaos_signals;
CREATE POLICY "Authenticated insert kaos"
  ON public.kaos_signals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service inserts security events" ON public.security_events;
CREATE POLICY "Authenticated insert security events"
  ON public.security_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Service inserts metrics" ON public.system_metrics;
CREATE POLICY "Authenticated insert metrics"
  ON public.system_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Revoke EXECUTE on SECURITY DEFINER functions from public roles.
-- Triggers and RLS expressions will still work (they run as table/policy owner).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_sovereign() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- 3. Add tourism-friendly fields if missing (visit time, opening hours, highlights)
ALTER TABLE public.places
  ADD COLUMN IF NOT EXISTS visit_minutes integer,
  ADD COLUMN IF NOT EXISTS hours text,
  ADD COLUMN IF NOT EXISTS highlights jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

-- 4. Prevent duplicate QR check-ins within 1 hour
CREATE OR REPLACE FUNCTION public.prevent_duplicate_checkin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.visit_checkins
    WHERE user_id = NEW.user_id
      AND target_id = NEW.target_id
      AND target_type = NEW.target_type
      AND created_at > now() - interval '1 hour'
  ) THEN
    RAISE EXCEPTION 'Duplicate check-in: ya registraste una visita en la última hora' USING ERRCODE = 'unique_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_duplicate_checkin_trigger ON public.visit_checkins;
CREATE TRIGGER prevent_duplicate_checkin_trigger
  BEFORE INSERT ON public.visit_checkins
  FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_checkin();
