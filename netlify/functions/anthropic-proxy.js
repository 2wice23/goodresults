// Netlify serverless function — proxies requests to Anthropic Messages API
// ANTHROPIC_API_KEY is stored in Netlify Environment Variables, never in source code

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const ANTHROPIC_API_KEY = process.env.AnthropicAPI;
  if (!ANTHROPIC_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'AnthropicAPI not configured in Netlify env vars' }) };
  }

  try {
    const { model, max_tokens, system, messages } = JSON.parse(event.body);

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model, max_tokens, system, messages })
    });

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
