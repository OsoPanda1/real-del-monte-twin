-- Geo zones (geofencing inspirado en geo-smart-system)
CREATE TABLE public.geo_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL DEFAULT 'heritage',
  description TEXT,
  polygon JSONB NOT NULL DEFAULT '[]'::jsonb,
  center_lat NUMERIC,
  center_lng NUMERIC,
  alert_level TEXT NOT NULL DEFAULT 'normal',
  fill_color TEXT NOT NULL DEFAULT '#C5A572',
  fill_opacity NUMERIC NOT NULL DEFAULT 0.25,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.geo_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Geo zones are publicly viewable"
  ON public.geo_zones FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage geo zones"
  ON public.geo_zones FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_geo_zones_updated_at
BEFORE UPDATE ON public.geo_zones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Visit check-ins (QR + geolocalización)
CREATE TABLE public.visit_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  user_lat NUMERIC NOT NULL,
  user_lng NUMERIC NOT NULL,
  distance_meters NUMERIC,
  qr_token TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.visit_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own checkins"
  ON public.visit_checkins FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users create own checkins"
  ON public.visit_checkins FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage checkins"
  ON public.visit_checkins FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Workshop fields en events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_workshop BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS instructor TEXT,
  ADD COLUMN IF NOT EXISTS materials_url TEXT;

CREATE INDEX IF NOT EXISTS idx_events_is_workshop ON public.events(is_workshop) WHERE is_workshop = true;
CREATE INDEX IF NOT EXISTS idx_visit_checkins_user ON public.visit_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_geo_zones_active ON public.geo_zones(active) WHERE active = true;