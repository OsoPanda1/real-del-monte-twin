
-- Role enum
CREATE TYPE public.app_role AS ENUM ('turista', 'comerciante', 'admin');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'turista',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Places
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  category TEXT NOT NULL DEFAULT 'heritage',
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'public',
  elevation NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;

-- Businesses
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'commerce',
  description TEXT,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  phone TEXT,
  hours TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location TEXT,
  category TEXT NOT NULL DEFAULT 'festival',
  organizer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Routes
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  waypoints JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT DEFAULT 'moderate',
  duration_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- BookPI records (Isabella cognitive pipeline audit)
CREATE TABLE public.bookpi_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  clean_text TEXT NOT NULL,
  intent TEXT,
  emotion TEXT,
  route_plan JSONB,
  agent_trace JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookpi_records ENABLE ROW LEVEL SECURITY;

-- Conversations (Realito chat messages)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  text TEXT NOT NULL,
  emotion TEXT,
  agent_trace JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_places_updated_at BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'turista');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS POLICIES

-- user_roles: users can read own, admins can read all
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- profiles: public read, own update
CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- places: public read, admin write
CREATE POLICY "Public places are viewable" ON public.places FOR SELECT USING (status = 'public' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage places" ON public.places FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update places" ON public.places FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete places" ON public.places FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- businesses: public read, owner + admin write
CREATE POLICY "Public businesses are viewable" ON public.businesses FOR SELECT USING (status = 'public' OR owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Comerciantes can create businesses" ON public.businesses FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'comerciante') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners and admins can update businesses" ON public.businesses FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners and admins can delete businesses" ON public.businesses FOR DELETE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- events: public read, organizer + admin write
CREATE POLICY "Events are publicly viewable" ON public.events FOR SELECT USING (true);
CREATE POLICY "Comerciantes and admins can create events" ON public.events FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'comerciante') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Organizers and admins can update events" ON public.events FOR UPDATE USING (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Organizers and admins can delete events" ON public.events FOR DELETE USING (organizer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- routes: public read, admin write
CREATE POLICY "Routes are publicly viewable" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Admins can manage routes" ON public.routes FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update routes" ON public.routes FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete routes" ON public.routes FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- bookpi_records: own read, own insert, admin all
CREATE POLICY "Users can read own bookpi" ON public.bookpi_records FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own bookpi" ON public.bookpi_records FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage bookpi" ON public.bookpi_records FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- conversations: own read/insert, admin all
CREATE POLICY "Users can read own conversations" ON public.conversations FOR SELECT USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own conversations" ON public.conversations FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Admins can manage conversations" ON public.conversations FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
