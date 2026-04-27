-- ============================================
-- TAMV MD-X4/MD-X5 — Sovereign Infrastructure
-- ============================================

-- 1. AI Interaction Log (Horus observability)
CREATE TABLE public.ai_interaction_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  channel TEXT NOT NULL DEFAULT 'realito',
  source_model TEXT NOT NULL DEFAULT 'local',
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  intent TEXT,
  emotion TEXT,
  agents_invoked JSONB DEFAULT '[]'::jsonb,
  cultural_corrections JSONB DEFAULT '[]'::jsonb,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  fallback_used BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ok',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_log_user ON public.ai_interaction_log(user_id);
CREATE INDEX idx_ai_log_created ON public.ai_interaction_log(created_at DESC);
CREATE INDEX idx_ai_log_channel ON public.ai_interaction_log(channel);

ALTER TABLE public.ai_interaction_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own ai logs" ON public.ai_interaction_log FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service inserts ai logs" ON public.ai_interaction_log FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins manage ai logs" ON public.ai_interaction_log FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. ID-NVIDA — Sovereign Identity
CREATE TABLE public.sovereign_identity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  handle TEXT UNIQUE,
  trust_level INTEGER NOT NULL DEFAULT 1,
  public_hash TEXT NOT NULL,
  territorial_anchor TEXT DEFAULT 'real-del-monte-hidalgo',
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sov_id_user ON public.sovereign_identity(user_id);

ALTER TABLE public.sovereign_identity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Identities are publicly viewable" ON public.sovereign_identity FOR SELECT
  USING (true);
CREATE POLICY "Users update own identity" ON public.sovereign_identity FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY "Users insert own identity" ON public.sovereign_identity FOR INSERT
  WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage identities" ON public.sovereign_identity FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER sov_id_updated_at BEFORE UPDATE ON public.sovereign_identity
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create sovereign identity on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_sovereign()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.sovereign_identity (user_id, handle, public_hash, trust_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)) || '-' || substr(NEW.id::text, 1, 4),
    encode(digest(NEW.id::text || 'rdmx-sovereign', 'sha256'), 'hex'),
    1
  ) ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_sovereign ON auth.users;
CREATE TRIGGER on_auth_user_created_sovereign
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_sovereign();

-- 3. Extend BookPI with hash chain (immutable audit ledger MSR)
ALTER TABLE public.bookpi_records
  ADD COLUMN IF NOT EXISTS prev_hash TEXT,
  ADD COLUMN IF NOT EXISTS record_hash TEXT,
  ADD COLUMN IF NOT EXISTS sequence_number BIGSERIAL;
CREATE INDEX IF NOT EXISTS idx_bookpi_seq ON public.bookpi_records(sequence_number);

-- 4. Anubis Security Events
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  source TEXT NOT NULL DEFAULT 'anubis',
  payload JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sec_severity ON public.security_events(severity, created_at DESC);
CREATE INDEX idx_sec_type ON public.security_events(event_type);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read security events" ON public.security_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service inserts security events" ON public.security_events FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins manage security events" ON public.security_events FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Horus / Dekateotl System Metrics
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_key TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  dimensions JSONB DEFAULT '{}'::jsonb,
  bucket TEXT NOT NULL DEFAULT 'realtime',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_metrics_key_time ON public.system_metrics(metric_key, created_at DESC);

ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read metrics" ON public.system_metrics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service inserts metrics" ON public.system_metrics FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins manage metrics" ON public.system_metrics FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. KAOS Signals (Radar Quetzalcóatl + Ojo de Ra)
CREATE TABLE public.kaos_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  signal_type TEXT NOT NULL DEFAULT 'message',
  content_excerpt TEXT,
  signal_score NUMERIC NOT NULL DEFAULT 0.5,
  noise_score NUMERIC NOT NULL DEFAULT 0,
  toxicity_score NUMERIC NOT NULL DEFAULT 0,
  classification TEXT NOT NULL DEFAULT 'neutral',
  routed_to TEXT NOT NULL DEFAULT 'main_feed',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_kaos_class ON public.kaos_signals(classification, created_at DESC);

ALTER TABLE public.kaos_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read kaos" ON public.kaos_signals FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service inserts kaos" ON public.kaos_signals FOR INSERT
  WITH CHECK (true);

-- 7. Digital Twins (versioned)
CREATE TABLE public.digital_twins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  twin_key TEXT NOT NULL UNIQUE,
  zone TEXT NOT NULL DEFAULT 'rdm-centro',
  version INTEGER NOT NULL DEFAULT 1,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_twins_zone ON public.digital_twins(zone);

ALTER TABLE public.digital_twins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Twins are publicly viewable" ON public.digital_twins FOR SELECT
  USING (true);
CREATE POLICY "Admins manage twins" ON public.digital_twins FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER twins_updated_at BEFORE UPDATE ON public.digital_twins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill sovereign identity for existing users
INSERT INTO public.sovereign_identity (user_id, handle, public_hash, trust_level)
SELECT
  u.id,
  COALESCE(p.display_name, split_part(u.email, '@', 1)) || '-' || substr(u.id::text, 1, 4),
  encode(digest(u.id::text || 'rdmx-sovereign', 'sha256'), 'hex'),
  1
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
ON CONFLICT (user_id) DO NOTHING;