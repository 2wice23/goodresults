// Netlify serverless function — public KB reader
// Serves raw markdown content from Good Results knowledge bases
// Allows external AI tools to read KBs even when the GitHub repo is private
//
// GET ?file=chloe-kb        → returns chloe-kb.md content
// GET ?file=analyzer-kb     → returns analyzer-kb.md content
// GET ?file=modules-kb      → returns modules-kb.md content
// GET ?file=sms-kb          → returns sms-kb.md content
// GET ?file=master-kb       → returns master-kb.md content
// GET (no file param)       → returns list of available KBs
//
// Env vars: GitHubToken

const GITHUB_API = 'https://api.github.com';
const REPO = '/repos/2wice23/goodresults/contents';

const ALLOWED_FILES = {
  'chloe-kb':    'chloe-kb.md',
  'analyzer-kb': 'analyzer-kb.md',
  'modules-kb':  'modules-kb.md',
  'sms-kb':      'sms-kb.md',
  'master-kb':   'master-kb.md'
};

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'GET only' };
  }

  const token = process.env.GitHubToken;
  if (!token) {
    return { statusCode: 500, headers, body: 'GitHubToken not configured' };
  }

  const params = event.queryStringParameters || {};
  const fileKey = (params.file || '').toLowerCase().replace(/\.md$/, '');

  // No file param — return available KBs
  if (!fileKey) {
    headers['Content-Type'] = 'application/json';
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        available: Object.keys(ALLOWED_FILES),
        usage: 'GET ?file=chloe-kb',
        base: 'https://goodresults.org/.netlify/functions/kb-reader'
      })
    };
  }

  const fileName = ALLOWED_FILES[fileKey];
  if (!fileName) {
    return {
      statusCode: 400,
      headers,
      body: 'Unknown KB: ' + fileKey + '\nAvailable: ' + Object.keys(ALLOWED_FILES).join(', ')
    };
  }

  try {
    const resp = await fetch(`${GITHUB_API}${REPO}/${fileName}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!resp.ok) {
      return { statusCode: resp.status, headers, body: 'GitHub API error: ' + resp.status };
    }

    const json = await resp.json();
    const content = Buffer.from(json.content, 'base64').toString('utf-8');

    return {
      statusCode: 200,
      headers,
      body: content
    };

  } catch (err) {
    return { statusCode: 500, headers, body: 'Error: ' + err.message };
  }
};
