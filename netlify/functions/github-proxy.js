// Netlify serverless function — proxies authenticated requests to GitHub API
// GITHUB_TOKEN is stored in Netlify Environment Variables, never in source code

const GITHUB_BASE = 'https://api.github.com';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GITHUB_TOKEN not configured in Netlify env vars' }) };
  }

  try {
    const { path, method, body } = JSON.parse(event.body);

    // Only allow requests to our own repo
    if (!path || !path.startsWith('/repos/2wice23/goodresults/')) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Only requests to 2wice23/goodresults allowed' }) };
    }

    const url = GITHUB_BASE + path;
    const fetchMethod = (method || 'GET').toUpperCase();

    const headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': 'Bearer ' + GITHUB_TOKEN,
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const fetchOpts = { method: fetchMethod, headers };
    if (body && (fetchMethod === 'PUT' || fetchMethod === 'POST' || fetchMethod === 'PATCH')) {
      fetchOpts.body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
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
