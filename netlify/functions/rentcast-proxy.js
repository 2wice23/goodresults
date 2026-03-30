// Netlify serverless function — proxies requests to RentCast API
// RENTCAST_KEY is stored in Netlify Environment Variables, never in source code
//
// POST { address, city, state, zipCode }
// Returns the RentCast property data
//
// Env vars: RentCastKey

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };
  }

  const RENTCAST_KEY = process.env.RentCastKey;
  if (!RENTCAST_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'RentCastKey not configured in Netlify env vars' }) };
  }

  try {
    const { address, city, state, zipCode } = JSON.parse(event.body);

    if (!address) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Address is required' }) };
    }

    const params = new URLSearchParams();
    params.set('address', address);
    if (city) params.set('city', city);
    if (state) params.set('state', state);
    if (zipCode) params.set('zipCode', zipCode);

    const resp = await fetch('https://api.rentcast.io/v1/properties?' + params.toString(), {
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': RENTCAST_KEY
      }
    });

    const data = await resp.text();

    return {
      statusCode: resp.status,
      headers,
      body: data
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
