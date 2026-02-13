import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Proxies /api/* to the Python backend at /python-api/* (same origin).
 * Vercel routes /python-api/* to the Python serverless function, so no loop.
 */
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
  maxDuration: 60,
};

function getBackendBase(req: NextApiRequest): string {
  const host = req.headers.host || process.env.VERCEL_URL || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function proxy(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const path = (req.query.path as string[])?.join('/') || '';
  const base = getBackendBase(req);
  let url = `${base}/python-api/${path}`;
  // Bypass Vercel Deployment Protection for server-side proxy request
  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (bypass) {
    url += (url.includes('?') ? '&' : '?') + 'x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=' + encodeURIComponent(bypass);
  }

  try {
    const headers: Record<string, string> = {};
    for (const k of ['authorization', 'content-type', 'content-length']) {
      const v = req.headers[k];
      if (typeof v === 'string') headers[k] = v;
    }

    const init: RequestInit = { method: req.method, headers };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const raw = await getRawBody(req);
      init.body = new Uint8Array(raw);
    }

    const response = await fetch(url, init);

    res.status(response.status);
    response.headers.forEach((v, k) => {
      if (k.toLowerCase() !== 'transfer-encoding') res.setHeader(k, v);
    });
    const body = await response.text();
    res.send(body);
  } catch (err: any) {
    console.error('Proxy error:', err.message);
    res.status(502).json({
      error: 'Bad Gateway',
      message: 'Could not reach the API. Is the backend running?',
    });
  }
}
