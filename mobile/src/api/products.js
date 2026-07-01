import config from './config';

export async function fetchProducts() {
  const response = await fetch(`${config.API_URL}/products`);
  if (!response.ok) {
    throw new Error('Unable to load products');
  }
  return response.json();
}
