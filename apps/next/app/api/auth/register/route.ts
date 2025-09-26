import { NextRequest, NextResponse } from 'next/server';

import {
  buildMedusaUrl,
  createErrorResponse,
  createNextResponseFromMedusa,
} from '../medusa';

const ALLOWED_FIELDS = new Set(['email', 'password', 'first_name', 'last_name', 'phone']);

type RegisterBody = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
};

function sanitizeBody(body: Record<string, unknown>): RegisterBody | null {
  const output: Partial<RegisterBody> = {};

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED_FIELDS.has(key)) {
      continue;
    }

    if (['email', 'password', 'first_name', 'last_name', 'phone'].includes(key)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (typeof value !== 'string') {
        return null;
      }

      (output as Record<string, string>)[key] = value.trim();
    }
  }

  if (!output.email || !output.password) {
    return null;
  }

  return output as RegisterBody;
}

export async function POST(req: NextRequest) {
  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return createErrorResponse('Invalid JSON body.', 400);
  }

  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return createErrorResponse('Invalid request body.', 400);
  }

  const body = sanitizeBody(rawBody as Record<string, unknown>);

  if (!body) {
    return createErrorResponse('Email and password are required.', 400);
  }

  try {
    const registerResponse = await fetch(buildMedusaUrl('/store/customers'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'manual',
    });

    if (!registerResponse.ok) {
      const raw = await registerResponse.text();
      let data: unknown = {};

      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = { message: raw };
        }
      }

      return NextResponse.json(data ?? {}, { status: registerResponse.status });
    }

    const loginResponse = await fetch(buildMedusaUrl('/store/auth'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
      }),
      redirect: 'manual',
    });

    return await createNextResponseFromMedusa(loginResponse);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unexpected error contacting Medusa';
    return createErrorResponse(message, 500);
  }
}
