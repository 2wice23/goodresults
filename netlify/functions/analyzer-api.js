// Netlify serverless function — replaces dead Google Apps Script for the Call Analyzer
// Handles: leaderboard, KB sync, call reports, Slack notifications, access control
// Storage: Netlify Blobs (training store)
//
// Env vars used:
//   slack_the_group_chat    — Slack incoming webhook for #the-group-chat (call scores)
//   slack_hack_the_planet   — Slack incoming webhook for #hack-the-planet (access requests, tech alerts)

const { getStore, connectLambda } = require("@netlify/blobs");

// ── Blob store helpers ──────────────────────────────────────────

async function blobRead(key) {
  const store = getStore({ name: 'training', consistency: 'eventual' });
  const data = await store.get(key, { type: 'json' });
  return data || null;
}

async function blobWrite(key, data) {
  const store = getStore({ name: 'training', consistency: 'eventual' });
  await store.setJSON(key, data);
}

// ── Slack helper ────────────────────────────────────────────

async function pingSlack(webhook, text) {
  if (!webhook) return;
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  }).catch(() => {});
}

// ── Leaderboard ─────────────────────────────────────────────

async function getLeaderboard() {
  const data = await blobRead('leaderboard');
  return Array.isArray(data) ? data : [];
}

async function updateLeaderboard(agent, score) {
  const board = (await blobRead('leaderboard')) || [];

  const existing = board.find(a => a.agent_name.toLowerCase() === agent.toLowerCase());
  if (existing) {
    existing.total_calls++;
    existing.total_score += parseFloat(score);
    existing.avg = Math.round(existing.total_score / existing.total_calls);
  } else {
    board.push({
      agent_name: agent,
      total_calls: 1,
      total_score: parseFloat(score),
      avg: Math.round(parseFloat(score))
    });
  }

  await blobWrite('leaderboard', board);
  return board;
}

// ── Knowledge Base ──────────────────────────────────────────

async function getKB() {
  const data = await blobRead('analyzer-kb');
  if (!data) return { positive: [], negative: [], reknowledge: [] };
  return data;
}

async function addKBBatch(params) {
  const kb = (await blobRead('analyzer-kb')) || { positive: [], negative: [], reknowledge: [] };

  const examples = JSON.parse(params.examples || '[]');
  const sentiment = params.sentiment || 'positive';
  const bucket = sentiment === 'negative' ? 'negative' : 'positive';

  kb[bucket] = [...examples, ...(kb[bucket] || [])].slice(0, 60);

  await blobWrite('analyzer-kb', kb);
}

async function addKnowledge(body) {
  const kb = (await blobRead('analyzer-kb')) || { positive: [], negative: [], reknowledge: [] };

  const items = body.items || [];
  const tagged = items.map(i =>
    `[RE Knowledge — ${body.agent || 'unknown'} — ${body.call_date || 'recent'}]: ${i}`
  );
  kb.reknowledge = [...tagged, ...(kb.reknowledge || [])].slice(0, 80);

  await blobWrite('analyzer-kb', kb);
}

// ── Call Reports ────────────────────────────────────────────

async function addCallReport(body) {
  const reports = (await blobRead('call-reports')) || [];

  reports.push({
    id: body.id,
    timestamp: body.timestamp,
    agent: body.agent,
    realtor: body.realtor,
    call_type: body.call_type,
    duration: body.duration,
    call_date: body.call_date,
    score: body.score,
    realtor_engagement: body.realtor_engagement,
    summary: body.summary,
    what_worked: body.what_worked,
    what_to_tighten: body.what_to_tighten,
    language_flags: body.language_flags,
    missed_opportunities: body.missed_opportunities,
    positive_moments: body.positive_moments,
    resistance_moments: body.resistance_moments,
    script_moment: body.script_moment,
    on_leaderboard: body.on_leaderboard
  });

  // Keep last 500 reports max
  if (reports.length > 500) reports.splice(0, reports.length - 500);

  await blobWrite('call-reports', reports);
}

// ── Slack post ──────────────────────────────────────────────

async function postToSlack(webhook, body) {
  const report = body.report || {};
  const score = parseFloat(body.avg || 0);
  const agent = report.agent_name || 'Unknown';

  let hype = '';
  if (score >= 90) {
    const lines = [
      'ELITE performance. That is how you run a call.',
      'Absolutely COOKING right now. The realtors don\'t stand a chance.',
      'This is what a closer sounds like. Take notes, everyone.',
      'DOMINANT. Keep this energy and deals will follow.'
    ];
    hype = lines[Math.floor(Math.random() * lines.length)];
  } else if (score >= 75) {
    const lines = [
      'Solid call. Tighten up a few things and that\'s a 90+.',
      'Good work. Not elite yet, but the effort is showing.',
      'Getting better. Keep pushing and the top spot is yours.'
    ];
    hype = lines[Math.floor(Math.random() * lines.length)];
  } else if (score >= 60) {
    const lines = [
      'Average. You know you can do better than that.',
      'Mediocre. Go re-read the playbook and come back stronger.',
      'That score says "I didn\'t prepare." Prove me wrong next call.'
    ];
    hype = lines[Math.floor(Math.random() * lines.length)];
  } else {
    const lines = [
      'Rough one. That call needs to be analyzed and learned from IMMEDIATELY.',
      'Yikes. Go listen to that recording and figure out where it fell apart.',
      'That score is a wake-up call. Literally.',
      'Not going to sugarcoat it — that was bad. Time to lock in.'
    ];
    hype = lines[Math.floor(Math.random() * lines.length)];
  }

  const emoji = score >= 90 ? '🔥' : score >= 75 ? '🎯' : score >= 60 ? '😐' : '💀';
  const text = `<!channel> ${emoji} *${agent}* just dropped a *${Math.round(score)}/100* on a call.\n${hype}${report.summary ? '\n\n> ' + report.summary : ''}`;
  await pingSlack(webhook, text);
}

// ── Access Control (for login.html) ─────────────────────────

async function checkAccess(email) {
  const data = await blobRead('access-list');
  const list = data || { approved: [], pending: [] };

  if (list.approved.some(e => e.toLowerCase() === email.toLowerCase())) {
    return { allowed: true };
  }
  if (list.pending.some(e => e.email && e.email.toLowerCase() === email.toLowerCase())) {
    return { allowed: false, pending: true };
  }
  return { allowed: false };
}

async function requestAccess(body, slackWebhook) {
  const list = (await blobRead('access-list')) || { approved: [], pending: [] };

  const email = (body.email || '').toLowerCase();

  if (list.approved.some(e => e.toLowerCase() === email)) {
    return { status: 'approved' };
  }
  if (list.pending.some(e => e.email && e.email.toLowerCase() === email)) {
    return { status: 'pending' };
  }

  list.pending.push({
    email: email,
    name: body.name || '',
    requested: new Date().toISOString()
  });

  await blobWrite('access-list', list);
  await pingSlack(slackWebhook, `*AUTH REQUEST* — \`requestAccess\` triggered at ${new Date().toISOString()}\nUser: \`${body.name || email}\` | Email: \`${email}\`\nEndpoint: \`POST /netlify/functions/analyzer-api\`\nPending entry written to Netlify Blobs (training store).\nApprove by adding email to the \`approved[]\` array in the blob store.`);
  return { status: 'sent' };
}

// ── Daily Stats (for scheduled call-target tracker) ────────

async function getDailyStats() {
  const reports = await blobRead('call-reports');
  const board = await blobRead('leaderboard');
  const allReports = Array.isArray(reports) ? reports : [];
  const leaderboard = Array.isArray(board) ? board : [];

  // Get current date in Pacific time
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const todayStr = now.toISOString().slice(0, 10);
  const dayOfWeek = now.getDay(); // 0=Sun
  // Monday of this week
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  const mondayStr = monday.toISOString().slice(0, 10);

  // Count today's and week's calls per agent
  const todayCounts = {};
  const todayScores = {};
  const weekCounts = {};
  const weekScores = {};

  allReports.forEach(r => {
    const rDate = (r.timestamp || r.call_date || '').slice(0, 10);
    const agent = r.agent || 'Unknown';
    const score = parseFloat(r.score) || 0;
    if (rDate === todayStr) {
      todayCounts[agent] = (todayCounts[agent] || 0) + 1;
      if (!todayScores[agent]) todayScores[agent] = [];
      todayScores[agent].push(score);
    }
    if (rDate >= mondayStr && rDate <= todayStr) {
      weekCounts[agent] = (weekCounts[agent] || 0) + 1;
      if (!weekScores[agent]) weekScores[agent] = [];
      weekScores[agent].push(score);
    }
  });

  // Build per-agent summary
  const agents = [...new Set([
    ...Object.keys(todayCounts),
    ...Object.keys(weekCounts),
    ...leaderboard.map(a => a.agent_name)
  ])];

  const stats = agents.map(name => {
    const tScores = todayScores[name] || [];
    const wScores = weekScores[name] || [];
    const todayAvg = tScores.length > 0 ? Math.round(tScores.reduce((a, b) => a + b, 0) / tScores.length) : null;
    const weekAvg = wScores.length > 0 ? Math.round(wScores.reduce((a, b) => a + b, 0) / wScores.length) : null;
    return {
      agent: name,
      today_calls: todayCounts[name] || 0,
      today_avg: todayAvg,
      week_calls: weekCounts[name] || 0,
      week_avg_score: weekAvg,
      all_time_avg: (leaderboard.find(a => a.agent_name === name) || {}).avg || null
    };
  });

  return { date: todayStr, week_start: mondayStr, stats };
}

// ── Main handler ────────────────────────────────────────────

exports.handler = async (event) => {
  // Restrict CORS to our domain only (prevents cross-origin data theft)
  const origin = (event.headers || {}).origin || (event.headers || {}).Origin || '';
  const allowedOrigins = ['https://goodresults.org', 'https://www.goodresults.org', 'http://localhost:8888'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Initialize Blobs for Lambda-compat functions
  connectLambda(event);

  const SLACK_GROUP_CHAT = process.env.slack_the_group_chat;
  const SLACK_TECH = process.env.slack_hack_the_planet || SLACK_GROUP_CHAT;

  try {
    const params = event.queryStringParameters || {};
    const action = params.action || '';

    // ── GET ──
    if (event.httpMethod === 'GET') {
      if (action === 'get') {
        const board = await getLeaderboard();
        return { statusCode: 200, headers, body: JSON.stringify(board) };
      }
      if (action === 'update') {
        await updateLeaderboard(params.agent, params.score);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (action === 'getKB') {
        const kb = await getKB();
        return { statusCode: 200, headers, body: JSON.stringify(kb) };
      }
      if (action === 'addKBBatch') {
        await addKBBatch(params);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (action === 'dailyStats') {
        const stats = await getDailyStats();
        return { statusCode: 200, headers, body: JSON.stringify(stats) };
      }
      if (action === 'checkAccess') {
        const result = await checkAccess(params.email);
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      if (action === 'getNotes') {
        const key = params.key || 'dashboard-notes';
        try {
          const data = await blobRead(key);
          return { statusCode: 200, headers, body: JSON.stringify({ notes: data || [] }) };
        } catch(e) {
          return { statusCode: 200, headers, body: JSON.stringify({ notes: [] }) };
        }
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown GET action' }) };
    }

    // ── POST ──
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const postAction = body.action || action;

      if (postAction === 'addKnowledge') {
        await addKnowledge(body);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (postAction === 'postToSlack') {
        await postToSlack(SLACK_GROUP_CHAT, body);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (postAction === 'addCallReport') {
        await addCallReport(body);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (postAction === 'requestAccess') {
        const result = await requestAccess(body, SLACK_TECH);
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      if (postAction === 'saveNote') {
        const key = body.key || 'dashboard-notes';
        let notes = (await blobRead(key)) || [];
        notes.unshift(body.note);
        await blobWrite(key, notes);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (postAction === 'deleteNote') {
        const key = body.key || 'dashboard-notes';
        let notes = (await blobRead(key)) || [];
        const idx = body.index;
        if (idx >= 0 && idx < notes.length) {
          notes.splice(idx, 1);
          await blobWrite(key, notes);
        }
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('analyzer-api error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
