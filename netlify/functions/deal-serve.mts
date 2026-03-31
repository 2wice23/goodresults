// V2 Netlify function — Public GET endpoint for deal files from Netlify Blobs
// Serves deal data, manifests, and binary files (photos/docs)
// URL patterns:
//   /api/deals/{slug}/data.json      → deal JSON
//   /api/deals/{slug}/manifest.json  → manifest JSON
//   /api/deals/{slug}/list           → list files in deal
//   /api/deals/{slug}/files/{name}   → binary file (photo/doc)

import { getStore } from "@netlify/blobs";
import type { Context, Config } from "@netlify/functions";

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv', txt: 'text/plain'
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: CORS });
  }
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  const url = new URL(req.url);
  // Strip /api/deals/ prefix and parse
  const raw = url.pathname.replace(/^\/api\/deals\/?/, '');
  const parts = raw.split('/').filter(Boolean);
  const slug = parts[0];
  const rest = parts.slice(1).join('/');

  if (!slug) {
    // /api/deals → return full index
    const store = getStore({ name: "deals", consistency: "strong" });
    try {
      const data = await store.get("index", { type: "json" });
      if (!data) return new Response(JSON.stringify({ deals: [] }), { headers: { ...CORS, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify(data), { headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
  }

  const store = getStore({ name: "deals", consistency: "strong" });

  try {
    // /api/deals/{slug}/data.json
    if (rest === 'data.json' || rest === 'data') {
      const data = await store.get(`${slug}/data`, { type: "json" });
      if (!data) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify(data), {
        headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
      });
    }

    // /api/deals/{slug}/manifest.json
    if (rest === 'manifest.json' || rest === 'manifest') {
      const data = await store.get(`${slug}/manifest`, { type: "json" });
      if (!data) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify(data), {
        headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
      });
    }

    // /api/deals/{slug}/list
    if (rest === 'list') {
      const result = await store.list({ prefix: `${slug}/files/` });
      const files = result.blobs.map(b => ({
        name: b.key.replace(`${slug}/files/`, ''),
        key: b.key
      }));
      return new Response(JSON.stringify({ ok: true, files }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      });
    }

    // /api/deals/{slug}/files/{filename}
    if (rest.startsWith('files/')) {
      const filename = rest.replace('files/', '');
      const blob = await store.get(`${slug}/files/${filename}`, { type: "arrayBuffer" });
      if (!blob) return new Response('Not found', { status: 404, headers: CORS });

      const ext = filename.split('.').pop()?.toLowerCase() || '';
      return new Response(blob, {
        headers: {
          ...CORS,
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=86400'
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown path' }), { status: 404, headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
};

export const config: Config = {
  path: "/api/deals/*"
};
