const MEDUSA_BACKEND_URL = (import.meta.env.VITE_MEDUSA_BACKEND_URL || '').replace(/\/$/, '');

function buildUrl(path = '', query = {}) {
  if (!MEDUSA_BACKEND_URL) {
    throw new Error('Medusa backend URL is not configured.');
  }

  const url = new URL(path.startsWith('/') ? path.slice(1) : path, `${MEDUSA_BACKEND_URL}/`);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
    } else {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

async function fetchJson(url, init) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Medusa request failed (${response.status}): ${message}`);
  }

  return response.json();
}

export async function getProducts(options = {}) {
  const { limit = 10, offset = 0, q, collection_id, category_id } = options;

  const url = buildUrl('/store/products', {
    limit,
    offset,
    q,
    collection_id,
    category_id,
  });

  return fetchJson(url);
}

export async function getProduct(idOrHandle) {
  if (!idOrHandle) {
    throw new Error('A product id or handle must be provided.');
  }

  const url = buildUrl(`/store/products/${idOrHandle}`);
  return fetchJson(url);
}
