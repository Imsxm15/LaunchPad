import { useEffect, useMemo, useState } from 'react';
import { getProducts } from './services/medusa.js';

function formatPrice(amount = 0, currency = 'usd') {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
    }).format(amount / 100);
  } catch (error) {
    return `$${(amount / 100).toFixed(2)}`;
  }
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = useMemo(() => {
    return import.meta.env.VITE_MEDUSA_BACKEND_URL ?? '';
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const response = await getProducts({ limit: 8 });

        if (!isMounted) {
          return;
        }

        setProducts(response?.products ?? []);
        setError(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main>
      <header>
        <h1>LaunchPad Storefront</h1>
        <p>
          Browse the latest products served directly from the Medusa backend without maintaining
          local infrastructure.
        </p>
      </header>

      <section className="status">
        {backendUrl ? (
          <span>Connected to: {backendUrl}</span>
        ) : (
          <span className="error">Missing VITE_MEDUSA_BACKEND_URL configuration.</span>
        )}
      </section>

      {isLoading && <p className="status">Loading products…</p>}

      {error && !isLoading && <p className="status error">{error}</p>}

      {!isLoading && !error && products.length === 0 && (
        <p className="status">No products available right now. Please check back soon.</p>
      )}

      {!isLoading && !error && products.length > 0 && (
        <section className="grid" aria-label="Product listing">
          {products.map((product) => {
            const primaryVariant = product.variants?.[0];
            const price = primaryVariant?.prices?.[0];

            return (
              <article className="card" key={product.id}>
                <h2>{product.title}</h2>
                <small>{product.handle}</small>
                {price ? (
                  <strong>{formatPrice(price.amount, price.currency_code)}</strong>
                ) : (
                  <strong>Price unavailable</strong>
                )}
                <button type="button" onClick={() => alert(product.description || 'No description')}>
                  Quick view
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
