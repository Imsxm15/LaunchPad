import { NextRequest } from 'next/server';

import { forwardMedusaRequest } from '../medusa';

export async function GET(req: NextRequest) {
  return forwardMedusaRequest(req, '/store/auth', {
    method: 'GET',
  });
}
