// Netlify serverless function — proxies requests to Google Apps Script endpoints
// No authentication required — these are public endpoints

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { scriptId, action, cachebust } = JSON.parse(event.body);

    if (!scriptId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'scriptId is required' }) };
    }

    if (!action) {
      return { statusCode: 400, body: JSON.stringify({ error: 'action is required' }) };
    }

    const url = `https://script.google.com/macros/s/${scriptId}/exec?action=${action}&cachebust=${cachebust || Date.now()}`;

    const resp = await fetch(url);
    const data = await resp.text();

    // Try to parse as JSON, fall back to text
    let body;
    try {
      body = JSON.stringify(JSON.parse(data));
    } catch {
      body = JSON.stringify({ raw: data });
    }

    return {
      statusCode: resp.status,
      headers: { 'Content-Type': 'application/json' },
      body: body
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
