import { NextRequest } from 'next/server';

import { createErrorResponse, forwardMedusaJson } from '../medusa';

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return createErrorResponse('Invalid JSON body.', 400);
  }

  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    typeof (body as Record<string, unknown>).email !== 'string' ||
    typeof (body as Record<string, unknown>).password !== 'string'
  ) {
    return createErrorResponse('Email and password are required.', 400);
  }

  const { email, password } = body as { email: string; password: string };

  return forwardMedusaJson(req, '/store/auth', {
    email,
    password,
  });
}
