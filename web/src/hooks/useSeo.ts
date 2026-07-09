import { useEffect } from "react";

const SITE = "https://thecolab-ai.github.io/the-for-good-project";
const DEFAULT_IMAGE = `${SITE}/og.png`;
const SUFFIX = " · The For Good Project";

type SeoOptions = {
  title?: string;
  description?: string;
  /** app-relative path, e.g. "/findings/foo" — becomes the canonical + og:url */
  path?: string;
  image?: string;
  type?: "website" | "article";
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Per-route SEO — updates the document head client-side so JS-executing
 * crawlers (Google) index each page with its own title, description, canonical
 * and social tags. (For non-JS crawlers / social scrapers, prerendering the
 * routes at build time is the follow-up that ships this in the raw HTML.)
 */
export function useSeo({ title, description, path, image, type = "website" }: SeoOptions) {
  const fullTitle = title ? (title.includes("For Good") ? title : title + SUFFIX) : undefined;
  const url = path ? SITE + (path.startsWith("/") ? path : "/" + path) : undefined;
  const img = image || DEFAULT_IMAGE;

  useEffect(() => {
    if (fullTitle) document.title = fullTitle;
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
    if (fullTitle) {
      setMeta("property", "og:title", fullTitle);
      setMeta("name", "twitter:title", fullTitle);
    }
    if (url) {
      setCanonical(url);
      setMeta("property", "og:url", url);
    }
    setMeta("property", "og:type", type);
    setMeta("property", "og:image", img);
    setMeta("name", "twitter:image", img);
    setMeta("name", "twitter:card", "summary_large_image");
  }, [fullTitle, description, url, img, type]);
}
