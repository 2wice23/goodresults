// Netlify serverless function — replaces dead Google Apps Script for the Call Analyzer
// Handles: leaderboard, KB sync, call reports, Slack notifications, access control
// Storage: GitHub JSON files in training-data/ folder (2wice23/goodresults repo)
//
// Env vars used:
//   GitHubToken       — GitHub PAT for reading/writing to repo
//   SLACK_WEBHOOK_URL — Slack incoming webhook for #the-group-chat

const GITHUB_API = 'https://api.github.com';
const REPO_PATH = '/repos/2wice23/goodresults/contents';

// ── GitHub helpers ──────────────────────────────────────────

async function ghRead(token, filePath) {
  const resp = await fetch(`${GITHUB_API}${REPO_PATH}/${filePath}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (resp.status === 404) return { data: null, sha: null };
  if (!resp.ok) throw new Error(`GitHub GET ${filePath}: ${resp.status}`);
  const json = await resp.json();
  const decoded = Buffer.from(json.content, 'base64').toString('utf-8');
  return { data: JSON.parse(decoded), sha: json.sha };
}

async function ghWrite(token, filePath, data, sha, message) {
  const encoded = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const body = { message, content: encoded };
  if (sha) body.sha = sha;

  const resp = await fetch(`${GITHUB_API}${REPO_PATH}/${filePath}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (resp.status === 409) {
    const fresh = await ghRead(token, filePath);
    let merged = fresh.data;
    if (Array.isArray(fresh.data) && Array.isArray(data)) {
      const lastEntry = data[data.length - 1];
      merged = [...fresh.data, lastEntry];
    } else if (typeof fresh.data === 'object' && typeof data === 'object') {
      merged = { ...fresh.data, ...data };
    }
    const encoded2 = Buffer.from(JSON.stringify(merged, null, 2)).toString('base64');
    const retry = await fetch(`${GITHUB_API}${REPO_PATH}/${filePath}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, content: encoded2, sha: fresh.sha })
    });
    if (!retry.ok) throw new Error(`GitHub PUT retry ${filePath}: ${retry.status}`);
    return;
  }

  if (!resp.ok) throw new Error(`GitHub PUT ${filePath}: ${resp.status}`);
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

async function getLeaderboard(token) {
  const { data } = await ghRead(token, 'training-data/leaderboard.json');
  return Array.isArray(data) ? data : [];
}

async function updateLeaderboard(token, agent, score) {
  const filePath = 'training-data/leaderboard.json';
  const { data, sha } = await ghRead(token, filePath);
  const board = Array.isArray(data) ? data : [];

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

  await ghWrite(token, filePath, board, sha, `Leaderboard: ${agent} ${score}`);
  return board;
}

// ── Knowledge Base ──────────────────────────────────────────

async function getKB(token) {
  const { data } = await ghRead(token, 'training-data/analyzer-kb.json');
  if (!data) return { positive: [], negative: [], reknowledge: [] };
  return data;
}

async function addKBBatch(token, params) {
  const filePath = 'training-data/analyzer-kb.json';
  const { data, sha } = await ghRead(token, filePath);
  const kb = data || { positive: [], negative: [], reknowledge: [] };

  const examples = JSON.parse(params.examples || '[]');
  const sentiment = params.sentiment || 'positive';
  const bucket = sentiment === 'negative' ? 'negative' : 'positive';

  kb[bucket] = [...examples, ...(kb[bucket] || [])].slice(0, 60);

  await ghWrite(token, filePath, kb, sha, `KB ${sentiment}: ${params.agent || 'unknown'}`);
}

async function addKnowledge(token, body) {
  const filePath = 'training-data/analyzer-kb.json';
  const { data, sha } = await ghRead(token, filePath);
  const kb = data || { positive: [], negative: [], reknowledge: [] };

  const items = body.items || [];
  const tagged = items.map(i =>
    `[RE Knowledge — ${body.agent || 'unknown'} — ${body.call_date || 'recent'}]: ${i}`
  );
  kb.reknowledge = [...tagged, ...(kb.reknowledge || [])].slice(0, 80);

  await ghWrite(token, filePath, kb, sha, `Knowledge: ${body.agent || 'unknown'}`);
}

// ── Call Reports ────────────────────────────────────────────

async function addCallReport(token, body) {
  const filePath = 'training-data/call-reports.json';
  const { data, sha } = await ghRead(token, filePath);
  const reports = Array.isArray(data) ? data : [];

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

  await ghWrite(token, filePath, reports, sha, `Call report: ${body.agent} — ${body.score}`);
}

// ── Slack post ──────────────────────────────────────────────

async function postToSlack(webhook, body) {
  const report = body.report || {};
  const score = body.avg || '?';
  const agent = report.agent_name || 'Unknown';
  const emoji = parseFloat(score) >= 80 ? ':fire:' : parseFloat(score) >= 60 ? ':dart:' : ':muscle:';

  const text = `${emoji} *${agent}* — Call Score: ${score}/100\n${report.summary || ''}`;
  await pingSlack(webhook, text);
}

// ── Access Control (for login.html) ─────────────────────────

async function checkAccess(token, email) {
  const { data } = await ghRead(token, 'training-data/access-list.json');
  const list = data || { approved: [], pending: [] };

  if (list.approved.some(e => e.toLowerCase() === email.toLowerCase())) {
    return { allowed: true };
  }
  if (list.pending.some(e => e.email && e.email.toLowerCase() === email.toLowerCase())) {
    return { allowed: false, pending: true };
  }
  return { allowed: false };
}

async function requestAccess(token, body, slackWebhook) {
  const filePath = 'training-data/access-list.json';
  const { data, sha } = await ghRead(token, filePath);
  const list = data || { approved: [], pending: [] };

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

  await ghWrite(token, filePath, list, sha, `Access request: ${email}`);
  await pingSlack(slackWebhook, `:key: *Access request* — ${body.name || email} (${email}) wants GimmeBrain access`);
  return { status: 'sent' };
}

// ── Daily Stats (for scheduled call-target tracker) ────────

async function getDailyStats(token) {
  const { data: reports } = await ghRead(token, 'training-data/call-reports.json');
  const { data: board } = await ghRead(token, 'training-data/leaderboard.json');
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

  // Count today's calls per agent
  const todayCounts = {};
  const weekCounts = {};
  const weekScores = {};

  allReports.forEach(r => {
    const rDate = (r.timestamp || r.call_date || '').slice(0, 10);
    const agent = r.agent || 'Unknown';
    if (rDate === todayStr) {
      todayCounts[agent] = (todayCounts[agent] || 0) + 1;
    }
    if (rDate >= mondayStr && rDate <= todayStr) {
      weekCounts[agent] = (weekCounts[agent] || 0) + 1;
      const score = parseFloat(r.score) || 0;
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
    const scores = weekScores[name] || [];
    const weekAvg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    return {
      agent: name,
      today_calls: todayCounts[name] || 0,
      week_calls: weekCounts[name] || 0,
      week_avg_score: weekAvg,
      all_time_avg: (leaderboard.find(a => a.agent_name === name) || {}).avg || null
    };
  });

  return { date: todayStr, week_start: mondayStr, stats };
}

// ── Main handler ────────────────────────────────────────────

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const GITHUB_TOKEN = process.env.GitHubToken;
  const SLACK_WEBHOOK = process.env.slack_webhook_url || process.env.SLACK_WEBHOOK_URL;

  if (!GITHUB_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'GitHubToken not configured' }) };
  }

  try {
    const params = event.queryStringParameters || {};
    const action = params.action || '';

    // ── GET ──
    if (event.httpMethod === 'GET') {
      if (action === 'get') {
        const board = await getLeaderboard(GITHUB_TOKEN);
        return { statusCode: 200, headers, body: JSON.stringify(board) };
      }
      if (action === 'update') {
        await updateLeaderboard(GITHUB_TOKEN, params.agent, params.score);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (action === 'getKB') {
        const kb = await getKB(GITHUB_TOKEN);
        return { statusCode: 200, headers, body: JSON.stringify(kb) };
      }
      if (action === 'addKBBatch') {
        await addKBBatch(GITHUB_TOKEN, params);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (action === 'dailyStats') {
        const stats = await getDailyStats(GITHUB_TOKEN);
        return { statusCode: 200, headers, body: JSON.stringify(stats) };
      }
      if (action === 'checkAccess') {
        const result = await checkAccess(GITHUB_TOKEN, params.email);
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown GET action: ' + action }) };
    }

    // ── POST ──
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const postAction = body.action || action;

      if (postAction === 'addKnowledge') {
        await addKnowledge(GITHUB_TOKEN, body);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (postAction === 'postToSlack') {
        await postToSlack(SLACK_WEBHOOK, body);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (postAction === 'addCallReport') {
        await addCallReport(GITHUB_TOKEN, body);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }
      if (postAction === 'requestAccess') {
        const result = await requestAccess(GITHUB_TOKEN, body, SLACK_WEBHOOK);
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action: ' + postAction }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('analyzer-api error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
