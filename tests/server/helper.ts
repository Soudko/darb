import http from 'node:http';
import { Socket } from 'node:net';
import type { Express } from 'express';

// A small stand-in for supertest that never opens a port (some sandboxes forbid it).
export interface Reply { status: number; body: any; text: string }

export function call(app: Express, method: 'GET' | 'POST', url: string, json?: unknown): Promise<Reply> {
  return new Promise((resolve, reject) => {
    const payload = json === undefined ? '' : JSON.stringify(json);
    const req = new http.IncomingMessage(new Socket());
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost', 'content-type': 'application/json', 'content-length': String(Buffer.byteLength(payload)) };
    const res = new http.ServerResponse(req);
    const chunks: Buffer[] = [];
    (res as any).write = (c: any) => { if (c) chunks.push(Buffer.from(c)); return true; };
    (res as any).end = (c?: any) => {
      if (c && typeof c !== 'function') chunks.push(Buffer.from(c));
      const text = Buffer.concat(chunks).toString('utf8');
      let body: any;
      try { body = JSON.parse(text); } catch { body = undefined; }
      resolve({ status: res.statusCode, body, text });
      return res;
    };
    try { app(req as any, res as any); } catch (e) { reject(e); }
    if (payload) req.push(payload);
    req.push(null);
  });
}
