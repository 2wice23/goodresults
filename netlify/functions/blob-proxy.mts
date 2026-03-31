// V2 Netlify function — read/write to Netlify Blobs
// No PAT needed — Blobs are natively available in V2 functions

import { getStore } from "@netlify/blobs";
import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { action, store: storeName, key, value, type } = await req.json();

    if (!storeName || !key) {
      return new Response(JSON.stringify({ error: "store and key required" }), { status: 400 });
    }

    const store = getStore({ name: storeName, consistency: "strong" });

    if (action === "set") {
      if (type === "json") {
        await store.setJSON(key, value);
      } else {
        await store.set(key, typeof value === "string" ? value : JSON.stringify(value));
      }
      return new Response(JSON.stringify({ ok: true, action: "set", store: storeName, key }));

    } else if (action === "get") {
      const data = await store.get(key, { type: type || "text" });
      if (data === null) {
        return new Response(JSON.stringify({ error: "Not found", store: storeName, key }), { status: 404 });
      }
      return new Response(JSON.stringify({ ok: true, data }));

    } else if (action === "delete") {
      await store.delete(key);
      return new Response(JSON.stringify({ ok: true, action: "delete", store: storeName, key }));

    } else if (action === "list") {
      const result = await store.list({ prefix: key !== "*" ? key : undefined });
      return new Response(JSON.stringify({ ok: true, blobs: result.blobs }));

    } else {
      return new Response(JSON.stringify({ error: "Unknown action. Use: set, get, delete, list" }), { status: 400 });
    }

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const config: Config = {
  path: "/api/blob"
};
