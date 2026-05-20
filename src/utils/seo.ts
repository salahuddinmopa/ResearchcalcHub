import { useEffect } from 'react';

const siteName = 'ResearchCalcHub';
const defaultImage = '/favicon.svg';

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

export function useSEO(title: string, description: string) {
  useEffect(() => {
    const cleanDescription = description.slice(0, 160);
    const canonicalUrl = window.location.origin + window.location.pathname;

    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description', content: cleanDescription });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: cleanDescription });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: siteName });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: window.location.origin + defaultImage });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: cleanDescription });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: window.location.origin + defaultImage });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
  }, [title, description]);
}
