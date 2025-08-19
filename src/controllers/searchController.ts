import { Request, Response } from 'express';
import { streamTorreSearch } from '../services/torreService';

/**
 * Handles /api/search SSE streaming.
 * Converts upstream NDJSON objects into Server-Sent Events (event: result, data: JSON).
 */
export async function searchStreamHandler(req: Request, res: Response) {
  // Support POST (body) and GET (query params) for SSE handshake.
  const source: any = req.method === 'GET' ? req.query : req.body;
  const query = source.query;
  const identityType = source.identityType;
  const limit = source.limit ? Number(source.limit) : undefined;
  const meta = source.meta === 'true' || source.meta === true ? true : undefined;
  const torreGrams = source.torreGrams;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing query' });
  }

  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // for proxies (nginx) to avoid buffering
  res.flushHeaders?.();

  let closed = false;
  const heartbeatInterval = setInterval(() => {
    if (closed) return;
    res.write(`event: heartbeat\n`);
    res.write(`data: ${Date.now()}\n\n`);
  }, 25000);

  req.on('close', () => {
    closed = true;
    clearInterval(heartbeatInterval);
  });

  res.write(`event: meta\n`);
  res.write(`data: ${JSON.stringify({ started: Date.now(), query })}\n\n`);

  try {
    let count = 0;
    // eslint-disable-next-line no-console
    console.log('[SSE] stream start', { query, limit });
    await streamTorreSearch({ query, identityType, limit, meta, torreGrams }, result => {
      if (closed) return;
      count++;
      // eslint-disable-next-line no-console
      console.log('[SSE] emit result', count, result.ardaId, result.username);
      res.write(`event: result\n`);
      res.write(`data: ${JSON.stringify(result)}\n\n`);
      // Attempt to flush each object proactively (Express may buffer until highWaterMark)
      (res as any).flush?.();
      res.flushHeaders?.();
    });
    // eslint-disable-next-line no-console
    console.log('[SSE] stream complete', { query });
    if (!closed) {
      res.write(`event: end\n`);
      res.write(`data: {"finished":true}\n\n`);
    }
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error('[SSE] stream error', e);
    if (!closed) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: e.message })}\n\n`);
    }
  } finally {
    // eslint-disable-next-line no-console
    console.log('[SSE] closing connection', { query });
    if (!closed) {
      clearInterval(heartbeatInterval);
      res.end();
    }
  }
}
