export function getMedusaBaseUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_MEDUSA_URL ?? 'http://localhost:9000';

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}
