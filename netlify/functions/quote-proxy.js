// Netlify serverless function — fetches motivational quotes from external APIs
// Tries quotable.io first, falls back to zenquotes.io

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Try quotable.io first
    let resp = await fetch('https://api.quotable.io/quotes/random?tags=motivational,inspirational,success');

    if (resp.ok) {
      const data = await resp.json();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.content,
          author: data.author,
          source: 'quotable'
        })
      };
    }

    // Fallback to zenquotes.io
    resp = await fetch('https://zenquotes.io/api/random');

    if (resp.ok) {
      const data = await resp.json();
      const quote = data[0];
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: quote.q,
          author: quote.a.replace(', type.fit', ''),
          source: 'zenquotes'
        })
      };
    }

    // If both fail, return a fallback quote
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        source: 'fallback'
      })
    };

  } catch (err) {
    // Return fallback quote on error
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        author: 'Winston Churchill',
        source: 'fallback'
      })
    };
  }
};
