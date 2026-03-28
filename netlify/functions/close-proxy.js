// Netlify serverless function — proxies requests to Close CRM API
// Keys are stored in Netlify Environment Variables, never in source code

const CLOSE_BASE = 'https://api.close.com/api/v1';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const CLOSE_API_KEY = process.env.CloseAPI;
  if (!CLOSE_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'CloseAPI not configured in Netlify env vars' }) };
  }

  try {
    const { action, path, method, body } = JSON.parse(event.body);

    // Whitelist allowed paths to prevent abuse
    const allowed = ['/lead/', '/opportunity/'];
    const isAllowed = allowed.some(prefix => path.startsWith(prefix));
    if (!isAllowed) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Path not allowed: ' + path }) };
    }

    const url = CLOSE_BASE + path;
    const fetchMethod = (method || 'GET').toUpperCase();

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(CLOSE_API_KEY + ':').toString('base64')
    };

    const fetchOpts = { method: fetchMethod, headers };
    if (body && (fetchMethod === 'PUT' || fetchMethod === 'POST' || fetchMethod === 'PATCH')) {
      fetchOpts.body = JSON.stringify(body);
    }

    const resp = await fetch(url, fetchOpts);
    const data = await resp.text();

    return {
      statusCode: resp.status,
      headers: { 'Content-Type': 'application/json' },
      body: data
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
