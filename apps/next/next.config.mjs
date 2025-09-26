/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd().replace('/next', ''),
  },
  images: {
    remotePatterns: [{ hostname: process.env.IMAGE_HOSTNAME || 'localhost' }],
  },
  pageExtensions: ['ts', 'tsx'],
  async redirects() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      return [];
    }

    try {
      const url = new URL('/api/redirections', baseUrl);
      const res = await fetch(url.href);

      if (!res.ok) {
        console.warn(
          `Failed to load redirects from ${url.href}. Status: ${res.status}`
        );
        return [];
      }

      const result = await res.json();
      if (!Array.isArray(result?.data)) {
        return [];
      }

      return result.data
        .filter(
          (item) =>
            typeof item?.source === 'string' &&
            typeof item?.destination === 'string'
        )
        .map(({ source, destination }) => ({
          source: `/:locale${source}`,
          destination: `/:locale${destination}`,
          permanent: false,
        }));
    } catch (error) {
      console.warn('Redirect configuration failed', error);
      return [];
    }
  },
};

export default nextConfig;
