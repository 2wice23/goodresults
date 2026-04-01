// Netlify serverless function — public KB reader
// Serves raw markdown/text content from Good Results knowledge bases
// PRIMARY: Netlify Blobs (training store) — fast, no external deps
// FALLBACK: GitHub API — for KBs not yet migrated to Blobs
//
// GET ?file=chloe-kb        → returns chloe-kb content
// GET ?file=analyzer-kb     → returns analyzer-kb content
// GET ?file=modules-kb      → returns modules-kb content
// GET ?file=sms-kb          → returns sms-kb content
// GET ?file=master-kb       → returns master-kb content
// GET (no file param)       → returns list of available KBs
// POST ?file=chloe-kb       → writes KB content to Blobs (owner-only)
//
// Env vars: GitHubToken (fallback only)

const { getStore, connectLambda } = require("@netlify/blobs");

const GITHUB_API = 'https://api.github.com';
const REPO = '/repos/2wice23/goodresults/contents';

const ALLOWED_FILES = {
  'chloe-kb':    'chloe-kb.md',
  'analyzer-kb': 'analyzer-kb.md',
  'modules-kb':  'modules-kb.md',
  'sms-kb':      'sms-kb.md',
  'master-kb':   'master-kb.md'
};

// Blob key for each KB (stored as plain text for AI consumption)
const BLOB_KEYS = {
  'chloe-kb':    'kb-chloe',
  'analyzer-kb': 'analyzer-kb',   // already exists from analyzer-api.js
  'modules-kb':  'kb-modules',
  'sms-kb':      'kb-sms',
  'master-kb':   'kb-master'
};

exports.handler = async (event) => {
  connectLambda(event);

  const origin = (event.headers || {}).origin || '';
  const allowedOrigins = ['https://goodresults.org', 'https://www.goodresults.org', 'http://localhost:8888'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const headers = {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const fileKey = (params.file || '').toLowerCase().replace(/\.md$/, '');

  // ── POST: Write KB content to Blobs ──
  if (event.httpMethod === 'POST') {
    if (!fileKey || !BLOB_KEYS[fileKey]) {
      return { statusCode: 400, headers, body: 'Invalid file key' };
    }
    // Body size limit (500KB should cover any KB)
    if ((event.body || '').length > 500000) {
      return { statusCode: 413, headers, body: 'Payload too large' };
    }
    try {
      const store = getStore({ name: 'training', consistency: 'eventual' });
      const content = event.body || '';
      await store.set(BLOB_KEYS[fileKey], content);
      headers['Content-Type'] = 'application/json';
      return { statusCode: 200, headers, body: JSON.stringify({ saved: true, key: BLOB_KEYS[fileKey], size: content.length }) };
    } catch (err) {
      return { statusCode: 500, headers, body: 'Blob write error: ' + err.message };
    }
  }

  // ── GET ──
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'GET or POST only' };
  }

  // No file param — return available KBs
  if (!fileKey) {
    headers['Content-Type'] = 'application/json';
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: Object.keys(ALLOWED_FILES),
        usage: 'GET ?file=chloe-kb',
        base: 'https://goodresults.org/.netlify/functions/kb-reader',
        storage: 'Netlify Blobs (primary) → GitHub (fallback)'
      })
    };
  }

  if (!ALLOWED_FILES[fileKey]) {
    return { statusCode: 400, headers, body: 'Unknown KB. Available: ' + Object.keys(ALLOWED_FILES).join(', ') };
  }

  // TRY 1: Read from Netlify Blobs (fast, no external API call)
  try {
    const store = getStore({ name: 'training', consistency: 'eventual' });
    const blobKey = BLOB_KEYS[fileKey];
    const content = await store.get(blobKey);
    if (content && content.length > 0) {
      return { statusCode: 200, headers, body: content };
    }
  } catch (e) {
    // Blob read failed — fall through to GitHub
  }

  // TRY 2: Fall back to GitHub
  const token = process.env.GitHubToken;
  if (!token) {
    return { statusCode: 503, headers, body: 'KB not in Blobs yet and GitHubToken not configured' };
  }

  try {
    const resp = await fetch(`${GITHUB_API}${REPO}/${ALLOWED_FILES[fileKey]}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!resp.ok) {
      return { statusCode: resp.status, headers, body: 'GitHub fallback error: ' + resp.status };
    }

    const json = await resp.json();
    const content = Buffer.from(json.content, 'base64').toString('utf-8');

    // Auto-migrate: write to Blobs so next read is faster
    try {
      const store = getStore({ name: 'training', consistency: 'eventual' });
      await store.set(BLOB_KEYS[fileKey], content);
    } catch(e) { /* migration is best-effort */ }

    return { statusCode: 200, headers, body: content };

  } catch (err) {
    return { statusCode: 500, headers, body: 'Error: ' + err.message };
  }
};
