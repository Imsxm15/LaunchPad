import { NextRequest, NextResponse } from 'next/server';

import { getMedusaBaseUrl } from '@/lib/medusa/config';

export function buildMedusaUrl(path: string): string {
  const baseUrl = getMedusaBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function createNextResponseFromMedusa(response: Response) {
  const rawBody = await response.text();
  let data: unknown = {};

  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = { message: rawBody };
    }
  }

  const nextResponse = NextResponse.json(data, { status: response.status });
  const setCookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : response.headers.get('set-cookie')
      ? [response.headers.get('set-cookie') as string]
      : [];

  for (const cookie of setCookies) {
    nextResponse.headers.append('set-cookie', cookie);
  }

  return nextResponse;
}

export function createErrorResponse(message: string, status = 500) {
  return NextResponse.json({ message }, { status });
}

export async function forwardMedusaRequest(
  req: NextRequest,
  path: string,
  init: RequestInit = {}
) {
  try {
    const headers = new Headers(init.headers ?? {});
    headers.set('accept', 'application/json');

    if (init.body && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      headers.set('cookie', cookieHeader);
    }

    const response = await fetch(buildMedusaUrl(path), {
      ...init,
      headers,
      redirect: 'manual',
    });

    return await createNextResponseFromMedusa(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error contacting Medusa';
    return createErrorResponse(message, 500);
  }
}

export async function forwardMedusaJson(
  req: NextRequest,
  path: string,
  body: Record<string, unknown>,
  init: RequestInit = {}
) {
  return forwardMedusaRequest(req, path, {
    ...init,
    body: JSON.stringify(body),
    method: init.method ?? 'POST',
  });
}
