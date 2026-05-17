
-- Seed cultural_content
INSERT INTO public.cultural_content (title, category, excerpt, body, featured, source) VALUES
('Real del Monte: cuna de la minería novohispana', 'historia', 'Fundado en el siglo XVI alrededor de las vetas de plata de la Sierra de Pachuca.', 'Real del Monte —oficialmente Mineral del Monte— nació como real de minas hacia 1552, cuando los yacimientos de plata de la Veta Vizcaína atrajeron a mineros vascos, andaluces y, más tarde, cornualleses. La huelga minera de 1766 es considerada la primera huelga laboral del continente americano.', true, 'Archivo Histórico Casa Rule'),
('La llegada de los mineros de Cornualles', 'historia', 'En 1824 desembarcaron 130 mineros ingleses que cambiarían el rostro del pueblo.', 'La Compañía de Aventureros de las Minas de Real del Monte trajo desde Cornualles maquinaria de vapor, fútbol, pastes y el cementerio inglés —único en América Latina—. Su legado sigue vivo en la arquitectura, los apellidos y la gastronomía.', true, 'Museo de Sitio Mina de Acosta'),
('El paste: herencia cornuallesa hecha mexicana', 'gastronomia', 'Empanada de masa hojaldrada rellena de papa, carne y poro, símbolo culinario del pueblo.', 'Originalmente "pasty", los mineros ingleses lo llevaban a la mina como almuerzo portátil. Hoy en Real del Monte se preparan más de 50 variedades: el clásico de carne, mole verde, piña, arroz con leche y hasta chocolate. Cada octubre se celebra el Festival Internacional del Paste.', true, 'Festival del Paste'),
('Carnitas estilo Real del Monte', 'gastronomia', 'Cocidas a fuego lento en cazos de cobre con naranja, leche y hierbas serranas.', 'A diferencia de las michoacanas, las carnitas hidalguenses incorporan ingredientes locales y se sirven con salsa borracha y tortillas recién hechas en el mercado municipal.', false, 'Mercado Municipal'),
('La Llorona de la mina', 'mitos', 'Se escucha llorar entre los socavones abandonados de la Mina de Acosta.', 'Cuentan los mineros viejos que en las noches de luna llena se oye el lamento de una mujer que perdió a su esposo en un derrumbe. Aparece vestida de blanco junto al tiro principal y desaparece al alba.', true, 'Tradición oral'),
('El Charro Negro del Hiloche', 'mitos', 'Jinete fantasmal que ofrece riquezas a cambio del alma en los caminos del bosque.', 'En el bosque El Hiloche, viajeros nocturnos juran haber visto a un charro vestido de negro montando un caballo del mismo color. Quien acepta su oferta nunca más vuelve a casa.', false, 'Tradición oral'),
('El tesoro de la Veta Vizcaína', 'mitos', 'Se dice que aún hay onzas de plata escondidas por los mineros del siglo XVIII.', 'Durante la guerra de Independencia, los administradores españoles ocultaron lingotes en pasajes secretos. Buscadores de tesoros aún recorren la sierra siguiendo mapas apócrifos.', false, 'Crónicas locales'),
('"Más vale paste en mano que mole en mesa ajena"', 'dichos', 'Dicho minero que pondera la practicidad por sobre lo aparente.', 'Refrán cotidiano del pueblo, reflejo del pragmatismo heredado de los mineros cornuallesos y mexicanos.', false, 'Tradición oral'),
('"Al que madruga, la veta lo abraza"', 'dichos', 'Versión local del "al que madruga Dios lo ayuda", referida al trabajo minero.', 'Se decía a los aprendices que entraban antes del amanecer a la mina. Aún se usa en la sierra para alabar la disciplina laboral.', false, 'Tradición oral'),
('Mural "Memoria de la Plata" de Casa Rule', 'arte', 'Obra mural que narra 470 años de historia minera en el corazón del centro histórico.', 'Pintado en 2018 por artistas locales, el mural recorre desde la fundación colonial hasta la huelga de 1766 y el arribo cornuallés. Es parada obligada en el recorrido cultural.', true, 'Casa Rule'),
('Banda de Viento "Aires de Real del Monte"', 'arte', 'Agrupación tradicional que ameniza fiestas patronales y desfiles del 16 de septiembre.', 'Heredera de las bandas mineras del siglo XIX, conserva partituras originales de polkas y valses cornualleses adaptados al repertorio mexicano.', false, 'Casa de Cultura')
ON CONFLICT DO NOTHING;

-- Seed places
INSERT INTO public.places (name, category, description, lat, lng, elevation, hours, visit_minutes, featured, status) VALUES
('Mina de Acosta', 'heritage', 'Museo de sitio con un tiro de 400m, malacate original y recorridos guiados por exmineros.', 20.1456, -98.6712, 2680, '10:00-17:00', 90, true, 'public'),
('Panteón Inglés', 'heritage', 'Único cementerio británico en Latinoamérica; 755 tumbas orientadas hacia Cornualles excepto la de Richard Bell.', 20.1389, -98.6741, 2750, '09:00-18:00', 60, true, 'public'),
('Parroquia de la Asunción', 'heritage', 'Templo del siglo XVI con retablos barrocos y reloj inglés de 1734.', 20.1428, -98.6708, 2700, '08:00-20:00', 30, true, 'public'),
('Plaza de la Constitución', 'public', 'Corazón cívico con kiosco porfiriano, puestos de pastes y vista a la Parroquia.', 20.1430, -98.6710, 2690, '24h', 30, false, 'public'),
('Bosque El Hiloche', 'natural', 'Área natural protegida con senderos, miradores y truchas arcoíris.', 20.1512, -98.6633, 2900, '08:00-18:00', 180, true, 'public'),
('Museo de Medicina Laboral', 'heritage', 'Antigua casa del médico minero; instrumental del siglo XIX y archivo de enfermedades del oficio.', 20.1441, -98.6705, 2695, '10:00-17:00', 45, false, 'public'),
('Mirador El Cristo Rey', 'natural', 'Vista panorámica del valle de Pachuca y la sierra envuelta en niebla.', 20.1467, -98.6685, 2820, '24h', 30, true, 'public')
ON CONFLICT DO NOTHING;

-- Seed geo_zones
INSERT INTO public.geo_zones (name, zone_type, description, polygon, center_lat, center_lng, alert_level, fill_color, fill_opacity, active) 
SELECT 'Centro Histórico RDM', 'heritage', 'Polígono patrimonial declarado por INAH en 2004.', 
  '[[-98.6735,20.1410],[-98.6685,20.1410],[-98.6685,20.1450],[-98.6735,20.1450]]'::jsonb,
  20.1430, -98.6710, 'normal', '#C5A572', 0.22, true
WHERE NOT EXISTS (SELECT 1 FROM public.geo_zones WHERE name = 'Centro Histórico RDM');

INSERT INTO public.geo_zones (name, zone_type, description, polygon, center_lat, center_lng, alert_level, fill_color, fill_opacity, active) 
SELECT 'Distrito Minero Veta Vizcaína', 'mining', 'Antiguas vetas y bocaminas con monitoreo de subsidencia.', 
  '[[-98.6760,20.1440],[-98.6700,20.1440],[-98.6700,20.1490],[-98.6760,20.1490]]'::jsonb,
  20.1465, -98.6730, 'caution', '#8B5A3C', 0.28, true
WHERE NOT EXISTS (SELECT 1 FROM public.geo_zones WHERE name = 'Distrito Minero Veta Vizcaína');

INSERT INTO public.geo_zones (name, zone_type, description, polygon, center_lat, center_lng, alert_level, fill_color, fill_opacity, active) 
SELECT 'ANP Bosque El Hiloche', 'natural', 'Área natural protegida con flora endémica.', 
  '[[-98.6680,20.1480],[-98.6580,20.1480],[-98.6580,20.1560],[-98.6680,20.1560]]'::jsonb,
  20.1520, -98.6630, 'normal', '#3F6B43', 0.30, true
WHERE NOT EXISTS (SELECT 1 FROM public.geo_zones WHERE name = 'ANP Bosque El Hiloche');

-- Seed forum_threads (system user_id = nil uuid; admin can repurpose)
INSERT INTO public.forum_threads (title, body, category, user_id, pinned)
SELECT 'Bienvenida a la comunidad RDM-X', 'Comparte tus experiencias, dudas y propuestas para Real del Monte. Este foro es público y moderado.', 'general', '00000000-0000-0000-0000-000000000000'::uuid, true
WHERE NOT EXISTS (SELECT 1 FROM public.forum_threads WHERE title = 'Bienvenida a la comunidad RDM-X');

INSERT INTO public.forum_threads (title, body, category, user_id, pinned)
SELECT 'Recomendaciones de pastes ¿cuál es tu favorito?', 'Cuéntanos qué pastelería te ha conquistado y por qué.', 'gastronomia', '00000000-0000-0000-0000-000000000000'::uuid, false
WHERE NOT EXISTS (SELECT 1 FROM public.forum_threads WHERE title = 'Recomendaciones de pastes ¿cuál es tu favorito?');

INSERT INTO public.forum_threads (title, body, category, user_id, pinned)
SELECT 'Mitos y leyendas que te hayan contado los abuelos', 'Reunamos las historias orales antes de que se pierdan.', 'mitos', '00000000-0000-0000-0000-000000000000'::uuid, false
WHERE NOT EXISTS (SELECT 1 FROM public.forum_threads WHERE title = 'Mitos y leyendas que te hayan contado los abuelos');

-- Realtime publication for geo_zones (idempotent)
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='geo_zones';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.geo_zones';
  END IF;
END $$;

ALTER TABLE public.geo_zones REPLICA IDENTITY FULL;
