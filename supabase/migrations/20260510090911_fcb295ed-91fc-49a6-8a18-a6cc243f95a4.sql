
-- ============ GAMIFICATION ============
CREATE TABLE public.user_points (
  user_id UUID PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "points public read" ON public.user_points FOR SELECT USING (true);
CREATE POLICY "user manage own points" ON public.user_points FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin manage points" ON public.user_points FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges public read" ON public.badges FOR SELECT USING (true);
CREATE POLICY "admin manage badges" ON public.badges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user badges public read" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "user insert own badges" ON public.user_badges FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "admin manage user badges" ON public.user_badges FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user read own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "user update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "authenticated insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "admin manage notifications" ON public.notifications FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============ MERCHANT SUBSCRIPTIONS ============
CREATE TABLE public.merchant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  business_id UUID,
  plan TEXT NOT NULL DEFAULT 'monthly',
  status TEXT NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL DEFAULT 29900,
  currency TEXT NOT NULL DEFAULT 'MXN',
  current_period_end TIMESTAMPTZ,
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.merchant_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user read own subscription" ON public.merchant_subscriptions FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "user insert own subscription" ON public.merchant_subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "user update own subscription" ON public.merchant_subscriptions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "admin manage subscriptions" ON public.merchant_subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Helper function: check active merchant
CREATE OR REPLACE FUNCTION public.merchant_is_active(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchant_subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND (current_period_end IS NULL OR current_period_end > now())
  )
$$;
REVOKE EXECUTE ON FUNCTION public.merchant_is_active(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merchant_is_active(uuid) TO authenticated, anon;

-- Update businesses RLS: only show paid merchants
DROP POLICY IF EXISTS "Public businesses are viewable" ON public.businesses;
CREATE POLICY "Active paid businesses are viewable"
ON public.businesses FOR SELECT
USING (
  (status = 'public' AND public.merchant_is_active(owner_id))
  OR owner_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- ============ NEWS / OFFERS ============
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  cover_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  author_id UUID,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "news public read" ON public.news FOR SELECT USING (published = true OR author_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "comerciante admin write news" ON public.news FOR INSERT WITH CHECK (has_role(auth.uid(), 'comerciante'::app_role) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "author admin update news" ON public.news FOR UPDATE USING (author_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "author admin delete news" ON public.news FOR DELETE USING (author_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  discount_percent INTEGER,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offers public read active paid" ON public.offers FOR SELECT
USING ((active = true AND public.merchant_is_active(owner_id)) OR owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "comerciante write offers" ON public.offers FOR INSERT WITH CHECK ((has_role(auth.uid(), 'comerciante'::app_role) AND owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner admin update offers" ON public.offers FOR UPDATE USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner admin delete offers" ON public.offers FOR DELETE USING (owner_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- ============ FORUMS ============
CREATE TABLE public.forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  body TEXT,
  pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "threads public read" ON public.forum_threads FOR SELECT USING (true);
CREATE POLICY "auth create threads" ON public.forum_threads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner admin update threads" ON public.forum_threads FOR UPDATE USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner admin delete threads" ON public.forum_threads FOR DELETE USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.forum_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "auth create posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "owner admin update posts" ON public.forum_posts FOR UPDATE USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "owner admin delete posts" ON public.forum_posts FOR DELETE USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- ============ CULTURAL CONTENT ============
CREATE TABLE public.cultural_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'historia',
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  cover_url TEXT,
  source TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cultural_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cultural public read" ON public.cultural_content FOR SELECT USING (true);
CREATE POLICY "admin manage cultural" ON public.cultural_content FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('business-photos', 'business-photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('news-covers', 'news-covers', true) ON CONFLICT DO NOTHING;

CREATE POLICY "avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "user upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "biz photos public read" ON storage.objects FOR SELECT USING (bucket_id = 'business-photos');
CREATE POLICY "user upload biz photo" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'business-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user update biz photo" ON storage.objects FOR UPDATE USING (bucket_id = 'business-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "user delete biz photo" ON storage.objects FOR DELETE USING (bucket_id = 'business-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "news covers public read" ON storage.objects FOR SELECT USING (bucket_id = 'news-covers');
CREATE POLICY "auth upload news cover" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'news-covers');

-- ============ TRIGGERS ============
CREATE TRIGGER trg_user_points_updated BEFORE UPDATE ON public.user_points FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_merchant_sub_updated BEFORE UPDATE ON public.merchant_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_forum_threads_updated BEFORE UPDATE ON public.forum_threads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create user_points on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_points()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_points (user_id, points, level) VALUES (NEW.id, 0, 1) ON CONFLICT DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'user_points init failed: %', SQLERRM;
  RETURN NEW;
END $$;

-- Seed badges
INSERT INTO public.badges (code, name, description, icon, points) VALUES
  ('first_visit', 'Primer Paso', 'Completa tu primer check-in', '🥾', 25),
  ('explorer_5', 'Explorador', 'Visita 5 lugares distintos', '🗺️', 100),
  ('cultural_3', 'Conocedor', 'Lee 3 artículos culturales', '📚', 50),
  ('forum_first', 'Voz Soberana', 'Crea tu primer hilo en el foro', '💬', 30),
  ('merchant_active', 'Comerciante Verificado', 'Suscripción activa', '🏪', 200)
ON CONFLICT (code) DO NOTHING;

-- Seed cultural content
INSERT INTO public.cultural_content (category, title, excerpt, body, featured) VALUES
  ('historia', 'Real del Monte: La Cuna de la Plata', 'Fundado en el siglo XVI, este pueblo mágico vio nacer la huelga obrera más antigua de América.', 'En 1766 los mineros de Real del Monte protagonizaron la primera huelga del continente americano. La riqueza de plata atrajo a ingleses de Cornualles que dejaron su huella eterna en la arquitectura, el panteón inglés y... el paste.', true),
  ('gastronomia', 'El Paste: Herencia de Cornualles', 'Empanada de masa hojaldrada rellena originalmente de papa, carne y poro.', 'Llegó con los mineros ingleses en 1825 como almuerzo portátil de mina. Hoy es patrimonio cultural inmaterial de Hidalgo, con decenas de variantes dulces y saladas.', true),
  ('mitos', 'La Llorona del Tiro', 'Se dice que en las noches de luna nueva se escucha el lamento de una mujer entre los túneles abandonados.', 'Los mineros cuentan que perdió a sus hijos en un derrumbe de 1801 y desde entonces vaga por las galerías de la Mina de Acosta buscándolos.', false),
  ('arte', 'El Panteón Inglés', 'Único cementerio británico fuera del Reino Unido con tumbas orientadas hacia Inglaterra.', 'Construido en 1851 para los mineros de Cornualles, alberga 755 tumbas. La única que mira a México es la de Richard Bell, payaso del circo Chiarini.', true),
  ('leyendas', 'El Tesoro de la Mina Dolores', 'Un cargamento de plata desapareció durante la Revolución y nunca se encontró.', 'Los abuelos juran que en las noches frías se ve una luz azul flotando sobre el socavón, señalando el escondite del oro perdido.', false)
ON CONFLICT DO NOTHING;
