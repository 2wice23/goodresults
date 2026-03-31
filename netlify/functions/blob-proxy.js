// Netlify serverless function — read/write to Netlify Blobs
// Replaces github-proxy for deal data storage

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { action, store: storeName, key, value, type } = JSON.parse(event.body);

    if (!storeName || !key) {
      return { statusCode: 400, body: JSON.stringify({ error: 'store and key required' }) };
    }

    const store = getStore({ name: storeName, consistency: 'strong' });

    if (action === 'set') {
      if (type === 'json') {
        await store.setJSON(key, value);
      } else {
        await store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, action: 'set', store: storeName, key })
      };

    } else if (action === 'get') {
      const data = await store.get(key, { type: type || 'text' });
      if (data === null) {
        return { statusCode: 404, body: JSON.stringify({ error: 'Not found', store: storeName, key }) };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, data })
      };

    } else if (action === 'delete') {
      await store.delete(key);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, action: 'delete', store: storeName, key })
      };

    } else if (action === 'list') {
      const result = await store.list({ prefix: key !== '*' ? key : undefined });
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, blobs: result.blobs })
      };

    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action. Use: set, get, delete, list' }) };
    }

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
