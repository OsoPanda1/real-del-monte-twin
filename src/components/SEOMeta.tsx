import { useEffect } from 'react';

interface SEOMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'business' | 'event' | 'place';
  jsonLd?: Record<string, any>;
  publishedTime?: string;
  author?: string;
}

const DEFAULT_META = {
  title: 'RDM Digital - Real del Monte | Pueblo Mágico',
  description: 'Explora Real del Monte, Hidalgo: historia, cultura, ecoturismo, gastronomía y más. Descubre los mejores lugares, eventos y rutas turísticas.',
  image: '/og-image.jpg',
  siteName: 'RDM Digital',
  siteUrl: 'https://real-del-monte.com',
};

export function SEOMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  jsonLd,
  publishedTime,
  author,
}: SEOMetaProps) {
  const fullTitle = title ? `${title} | ${DEFAULT_META.siteName}` : DEFAULT_META.title;
  const metaDescription = description || DEFAULT_META.description;
  const metaImage = image || DEFAULT_META.image;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : DEFAULT_META.siteUrl);

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper function to get or create meta element
    const getOrCreateMeta = (name: string, isProperty = false): HTMLMetaElement => {
      const selector = isProperty 
        ? `meta[property="${name}"]` 
        : `meta[name="${name}"]`;
      
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (isProperty) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      return element;
    };

    // Set basic meta tags
    const descriptionMeta = getOrCreateMeta('description');
    descriptionMeta.content = metaDescription;

    // Open Graph tags
    const ogTitle = getOrCreateMeta('og:title', true);
    ogTitle.content = fullTitle;

    const ogDescription = getOrCreateMeta('og:description', true);
    ogDescription.content = metaDescription;

    const ogImage = getOrCreateMeta('og:image', true);
    ogImage.content = metaImage;

    const ogType = getOrCreateMeta('og:type', true);
    ogType.content = type;

    const ogUrl = getOrCreateMeta('og:url', true);
    ogUrl.content = canonicalUrl;

    const ogSiteName = getOrCreateMeta('og:site_name', true);
    ogSiteName.content = DEFAULT_META.siteName;

    // Twitter Card tags
    const twitterCard = getOrCreateMeta('twitter:card');
    twitterCard.content = 'summary_large_image';

    const twitterTitle = getOrCreateMeta('twitter:title');
    twitterTitle.content = fullTitle;

    const twitterDescription = getOrCreateMeta('twitter:description');
    twitterDescription.content = metaDescription;

    const twitterImage = getOrCreateMeta('twitter:image');
    twitterImage.content = metaImage;

    // Article specific tags
    if (type === 'article') {
      if (publishedTime) {
        const ogPublishedTime = getOrCreateMeta('article:published_time', true);
        ogPublishedTime.content = publishedTime;
      }
      if (author) {
        const ogAuthor = getOrCreateMeta('article:author', true);
        ogAuthor.content = author;
      }
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // JSON-LD structured data
    const defaultJsonLd: Record<string, any> = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: DEFAULT_META.siteName,
      description: metaDescription,
      url: canonicalUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${canonicalUrl}/buscar?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      publisher: {
        '@type': 'Organization',
        name: DEFAULT_META.siteName,
        logo: {
          '@type': 'ImageObject',
          url: metaImage,
        },
      },
    };

    // Merge with custom JSON-LD if provided
    const finalJsonLd = jsonLd ? { ...defaultJsonLd, ...jsonLd } : defaultJsonLd;

    let scriptEl = document.querySelector('script[id="schema-org-jsonld"]') as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'schema-org-jsonld';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(finalJsonLd);

    // Cleanup is handled by React - we don't remove elements on unmount in SPA
  }, [fullTitle, metaDescription, metaImage, canonicalUrl, type, jsonLd, publishedTime, author]);

  return null;
}

// Page-specific SEO configurations
export const PAGE_SEO = {
  home: {
    title: 'RDM Digital - Descubre Real del Monte',
    description: 'Tu guía completa para explorar Real del Monte, Hidalgo. Historia, cultura, ecoturismo, gastronomía, eventos y más.',
  },
  lugares: {
    title: 'Lugares Turísticos - Real del Monte',
    description: 'Descubre los lugares más Hermosos de Real del Monte: Mina de Acosta, Panteón Inglés, miradores y más.',
  },
  directorio: {
    title: 'Directorio de Negocios - RDM Digital',
    description: 'Encuentra restaurantes, hoteles, tiendas y servicios en Real del Monte. Apoya los negocios locales.',
  },
  eventos: {
    title: 'Eventos y Actividades - Real del Monte',
    description: 'Consulta los próximos eventos, festivales y actividades en Real del Monte.',
  },
  comunidad: {
    title: 'Comunidad - Comparte tu Experiencia',
    description: 'Comparte tus fotos, historias y experiencias en Real del Monte con nuestra comunidad de viajeros.',
  },
  historia: {
    title: 'Historia de Real del Monte',
    description: 'Descubre la rica historia de Real del Monte, desde la época colonial hasta nuestros días.',
  },
  cultura: {
    title: 'Cultura y Tradiciones - Real del Monte',
    description: 'Explora la cultura y tradiciones del Pueblo Mágico de Real del Monte, Hidalgo.',
  },
  rutas: {
    title: 'Rutas Turísticas - Explora Real del Monte',
    description: 'Descubre las mejores rutas de senderismo y caminatas en Real del Monte.',
  },
  gastronomia: {
    title: 'Gastronomía - Sabores de Real del Monte',
    description: 'Descubre la gastronomía de Real del Monte: el tradicional paste, carnitas y más.',
  },
  ecoturismo: {
    title: 'Ecoturismo - Naturaleza en Real del Monte',
    description: 'Explora la naturaleza de Real del Monte: bosques, miradores y rutas de aventura.',
  },
  arte: {
    title: 'Arte y Artesanías - Real del Monte',
    description: 'Descubre el arte local y las artesanías tradicionales de Real del Monte.',
  },
  mapa: {
    title: 'Mapa Interactivo - Real del Monte',
    description: 'Explora Real del Monte con nuestro mapa interactivo. Encuentra lugares, negocios y rutas.',
  },
  auth: {
    title: 'Iniciar Sesión - RDM Digital',
    description: 'Inicia sesión o regístrate en RDM Digital para guardar tus lugares favoritos y más.',
  },
  reglamento: {
    title: 'Reglamento - Normas de la Comunidad',
    description: 'Normas y políticas de la comunidad RDM Digital. Participación respetuosa.',
  },
  apoyanews: {
    title: 'Apoya RDM Digital',
    description: 'Apoya el desarrollo de la plataforma turística de Real del Monte con tu donación.',
  },
};

export default SEOMeta;
