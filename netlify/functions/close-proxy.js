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

    // Validate path is a string and normalize to prevent traversal attacks
    if (typeof path !== 'string' || path.length > 200) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid path' }) };
    }
    // Strip query params, resolve '..' traversals, and enforce strict prefix match
    const cleanPath = path.split('?')[0].replace(/\/\.+\//g, '/');
    const allowed = ['/lead/', '/opportunity/', '/sms_template/', '/sequence/', '/email_template/'];
    const isAllowed = allowed.some(prefix => cleanPath.startsWith(prefix) && !cleanPath.includes('..'));
    if (!isAllowed) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Path not allowed' }) };
    }

    const url = CLOSE_BASE + cleanPath;
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
