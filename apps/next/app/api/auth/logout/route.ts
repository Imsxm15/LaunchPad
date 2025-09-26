import { NextRequest } from 'next/server';

import { forwardMedusaRequest } from '../medusa';

export async function POST(req: NextRequest) {
  return forwardMedusaRequest(req, '/store/auth/logout', {
    method: 'POST',
  });
}
