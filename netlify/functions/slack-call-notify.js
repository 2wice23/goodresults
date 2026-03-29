// Netlify serverless function — posts call analysis notification to Slack
// Slack webhook URL stored in Netlify env var: SLACK_WEBHOOK_URL

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' }
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const WEBHOOK = process.env.SLACK_WEBHOOK_URL;
  if (!WEBHOOK) {
    return { statusCode: 500, body: JSON.stringify({ error: 'SLACK_WEBHOOK_URL not configured' }) };
  }

  try {
    const { agent_name, realtor_name, score, call_type, takeaway } = JSON.parse(event.body);
    const s = parseInt(score) || 0;
    const emoji = s >= 85 ? ':star:' : s >= 70 ? ':white_check_mark:' : s >= 50 ? ':large_blue_circle:' : ':red_circle:';
    const callLabel = call_type ? ` ${call_type}` : ' call';

    let msg = `<!everyone> ${emoji} *${agent_name || 'Unknown'}* scored *${s}/100* on a${callLabel} with ${realtor_name || 'a realtor'}`;
    if (takeaway) {
      msg += `\n:bulb: *Tip for the team:* ${takeaway}`;
    }

    const resp = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msg })
    });

    if (!resp.ok) {
      const errBody = await resp.text();
      return { statusCode: resp.status, body: JSON.stringify({ error: errBody }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ status: 'ok' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
