// Error logging endpoint — stores errors in Netlify Blobs for daily review
// GET: returns recent errors (last 50)
// POST: logs a new error
// DELETE: clears all errors (manual cleanup)

const { getStore, connectLambda } = require("@netlify/blobs");

const STORE = 'training';
const KEY = 'error-log';
const MAX_ERRORS = 200; // Keep last 200 errors

async function getErrors() {
  const store = getStore({ name: STORE, consistency: 'eventual' });
  const data = await store.get(KEY, { type: 'json' });
  return data || { errors: [] };
}

async function saveErrors(data) {
  const store = getStore({ name: STORE, consistency: 'eventual' });
  await store.setJSON(KEY, data);
}

exports.handler = async function(event) {
  connectLambda(event);

  // Restrict CORS to our domain only
  const origin = (event.headers || {}).origin || (event.headers || {}).Origin || '';
  const allowedOrigins = ['https://goodresults.org', 'https://www.goodresults.org', 'http://localhost:8888'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    // GET — retrieve errors for review
    if (event.httpMethod === 'GET') {
      const data = await getErrors();
      const since = event.queryStringParameters?.since;
      let errors = data.errors || [];

      if (since) {
        const sinceDate = new Date(since);
        errors = errors.filter(e => new Date(e.timestamp) > sinceDate);
      }

      // Summary stats
      const now = new Date();
      const today = errors.filter(e => {
        const d = new Date(e.timestamp);
        return d.toDateString() === now.toDateString();
      });
      const byPage = {};
      const byTitle = {};
      today.forEach(e => {
        byPage[e.page] = (byPage[e.page] || 0) + 1;
        byTitle[e.title] = (byTitle[e.title] || 0) + 1;
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          total: errors.length,
          today: today.length,
          byPage,
          byTitle,
          errors: errors.slice(-50) // Last 50
        })
      };
    }

    // POST — log a new error
    if (event.httpMethod === 'POST') {
      // Reject oversized payloads (max 5KB)
      if ((event.body || '').length > 5000) {
        return { statusCode: 413, headers, body: JSON.stringify({ error: 'Payload too large' }) };
      }
      const error = JSON.parse(event.body || '{}');
      error.timestamp = error.timestamp || new Date().toISOString();
      error.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

      const data = await getErrors();
      data.errors.push(error);

      // Trim to max
      if (data.errors.length > MAX_ERRORS) {
        data.errors = data.errors.slice(-MAX_ERRORS);
      }

      await saveErrors(data);
      return { statusCode: 200, headers, body: JSON.stringify({ logged: true, id: error.id }) };
    }

    // DELETE — clear all errors
    if (event.httpMethod === 'DELETE') {
      await saveErrors({ errors: [], clearedAt: new Date().toISOString() });
      return { statusCode: 200, headers, body: JSON.stringify({ cleared: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Error log failed', detail: err.message })
    };
  }
};
