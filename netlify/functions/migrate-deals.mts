// V2 Netlify function — ONE-TIME migration of deal data from GitHub to Netlify Blobs
// Reads deal folders from GitHub repo, stores data + files in Blobs
// Call: POST /api/migrate-deals  (no body needed)
// Delete this function after migration is complete

import { getStore } from "@netlify/blobs";
import type { Context, Config } from "@netlify/functions";

const GITHUB_REPO = '2wice23/goodresults';

async function ghFetch(path: string, token: string) {
  const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'GoodResults-Migration'
    }
  });
  if (!r.ok) return null;
  return r.json();
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
  }

  const token = Netlify.env.get("GitHubToken");
  if (!token) {
    return new Response(JSON.stringify({ error: "GitHubToken env var not set" }), { status: 500 });
  }

  const store = getStore({ name: "deals", consistency: "strong" });
  const log: string[] = [];
  const dealSlugs: string[] = [];

  try {
    // List deal folders
    const items = await ghFetch('deals', token);
    if (!items || !Array.isArray(items)) {
      return new Response(JSON.stringify({ error: "Could not list deals folder", items }), { status: 500 });
    }

    const folders = items.filter((i: any) => i.type === 'dir');
    log.push(`Found ${folders.length} deal folders`);

    for (const folder of folders) {
      const slug = folder.name;
      log.push(`\n--- Processing: ${slug} ---`);

      // Get folder contents
      const files = await ghFetch(`deals/${slug}`, token);
      if (!files || !Array.isArray(files)) {
        log.push(`  SKIP: Could not list folder`);
        continue;
      }

      // Find deal-doc.txt
      const dealDocFile = files.find((f: any) => f.name === 'deal-doc.txt');
      if (dealDocFile) {
        const dealDocRaw = await ghFetch(`deals/${slug}/deal-doc.txt`, token);
        if (dealDocRaw && dealDocRaw.content) {
          const dealData = JSON.parse(atob(dealDocRaw.content.replace(/\n/g, '')));
          await store.setJSON(`${slug}/data`, dealData);
          log.push(`  ✓ deal-doc.txt → ${slug}/data`);
          dealSlugs.push(slug);
        }
      } else {
        log.push(`  SKIP: No deal-doc.txt found`);
        continue;
      }

      // Find manifest.json
      const manifestFile = files.find((f: any) => f.name === 'manifest.json');
      if (manifestFile) {
        const manifestRaw = await ghFetch(`deals/${slug}/manifest.json`, token);
        if (manifestRaw && manifestRaw.content) {
          const manifestData = JSON.parse(atob(manifestRaw.content.replace(/\n/g, '')));
          await store.setJSON(`${slug}/manifest`, manifestData);
          log.push(`  ✓ manifest.json → ${slug}/manifest`);
        }
      }

      // Migrate binary files (photos, docs)
      const SKIP_FILES = ['deal-doc.txt', 'manifest.json', 'index.html'];
      const binaryFiles = files.filter((f: any) => f.type === 'file' && !SKIP_FILES.includes(f.name));

      for (const bf of binaryFiles) {
        try {
          // Fetch raw binary content from GitHub
          const fileData = await ghFetch(`deals/${slug}/${bf.name}`, token);
          if (fileData && fileData.content) {
            // GitHub returns base64-encoded content
            const b64 = fileData.content.replace(/\n/g, '');
            const binaryStr = atob(b64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            await store.set(`${slug}/files/${bf.name}`, bytes);
            log.push(`  ✓ ${bf.name} (${Math.round(bf.size / 1024)}KB) → ${slug}/files/${bf.name}`);
          }
        } catch (e: any) {
          log.push(`  ✗ ${bf.name}: ${e.message}`);
        }
      }
    }

    // Build index
    const indexData = {
      updated: new Date().toISOString(),
      deals: dealSlugs
    };
    await store.setJSON("index", indexData);
    log.push(`\n✓ Index created with ${dealSlugs.length} deals`);
    log.push(`\nMigration complete!`);

    return new Response(JSON.stringify({ ok: true, log }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    log.push(`\nFATAL ERROR: ${err.message}`);
    return new Response(JSON.stringify({ ok: false, error: err.message, log }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/api/migrate-deals"
};
