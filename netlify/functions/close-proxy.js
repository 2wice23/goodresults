// Netlify serverless function — proxies requests to Close CRM API
// This avoids CORS issues (Close API doesn't allow browser-origin requests)

const CLOSE_API_KEY = 'api_6T6bDNyIxa6cyQpLki4WUc.0kYjWH5q6PRy01Rak4jHf8';
const CLOSE_BASE   = 'https://api.close.com/api/v1';

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
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
    if (body && (fetchMethod === 'PUT' || fetchMethod === 'POST')) {
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
