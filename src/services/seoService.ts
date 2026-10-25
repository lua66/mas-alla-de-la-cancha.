/**
 * SEO & Structured Metadata Service
 * Synchronizes document title, meta descriptions, OpenGraph, Twitter cards,
 * canonical links, and Schema.org JSON-LD structured data dynamically.
 */

export interface PageSeoConfig {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  publishedTime?: string;
  authorName?: string;
  keywords?: string;
}

export const updatePageSeo = (config: PageSeoConfig) => {
  // 1. Update Title
  document.title = config.title;

  // 2. Helper to set or create meta tag
  const setMeta = (nameAttr: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${nameAttr}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(nameAttr, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // 3. Core Meta Description & Keywords
  setMeta('name', 'description', config.description);
  if (config.keywords) {
    setMeta('name', 'keywords', config.keywords);
  }

  // 4. OpenGraph tags
  setMeta('property', 'og:title', config.title);
  setMeta('property', 'og:description', config.description);
  setMeta('property', 'og:type', config.ogType || 'website');
  
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pizarraycriterio.com';
  const fullCanonicalUrl = `${origin}${config.canonicalPath.startsWith('/') ? config.canonicalPath : `/${config.canonicalPath}`}`;
  setMeta('property', 'og:url', fullCanonicalUrl);

  if (config.ogImage) {
    const fullImageUrl = config.ogImage.startsWith('http') ? config.ogImage : `${origin}${config.ogImage}`;
    setMeta('property', 'og:image', fullImageUrl);
    setMeta('property', 'og:image:secure_url', fullImageUrl);
  }

  // 5. Twitter / X Cards
  setMeta('name', 'twitter:title', config.title);
  setMeta('name', 'twitter:description', config.description);
  if (config.ogImage) {
    const fullImageUrl = config.ogImage.startsWith('http') ? config.ogImage : `${origin}${config.ogImage}`;
    setMeta('name', 'twitter:image', fullImageUrl);
  }

  // 6. Canonical Link
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', fullCanonicalUrl);
};
