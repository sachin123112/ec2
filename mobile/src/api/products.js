import config from './config';

export function resolveImageUrl(imageUrl, fallback) {
  if (!imageUrl || typeof imageUrl !== 'string') return fallback;
  if (/^(https?:|data:|file:)/i.test(imageUrl)) return imageUrl;

  const apiOrigin = config.API_URL.replace(/\/api\/v1\/?$/, '');
  return `${apiOrigin}/${imageUrl.replace(/^\/+/, '')}`;
}

export async function fetchProducts() {
  const response = await fetch(`${config.API_URL}/products`);
  if (!response.ok) {
    throw new Error('Unable to load products');
  }
  return response.json();
}
