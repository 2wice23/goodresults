// Netlify serverless function — replaces Google Apps Script for training modules
// Handles: quiz score saves, module update notes, mastery progress lookups
// Storage: GitHub JSON files in training-data/ folder (2wice23/goodresults repo)
// Notifications: Short Slack pings only — full data lives in the Training Board canvas
//
// Env vars used:
//   GitHubToken            — GitHub PAT for reading/writing to repo
//   SLACK_TRAINING_WEBHOOK — Slack incoming webhook for #hack-the-planet (brief pings only)

const GITHUB_API = 'https://api.github.com';
const REPO_PATH = '/repos/2wice23/goodresults/contents';
const CANVAS_URL = 'https://goodresultshomebuyers.slack.com/docs/T0976VBJV6Y/F0AQDUPSAQY';

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
    // SHA conflict — re-read and retry once
    const fresh = await ghRead(token, filePath);
    const merged = Array.isArray(fresh.data) ? fresh.data : [];
    if (Array.isArray(data)) {
      const newEntry = data[data.length - 1];
      merged.push(newEntry);
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

// ── Slack helper — short pings only ─────────────────────────

async function pingSlack(webhook, text) {
  if (!webhook) return;
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  }).catch(() => {}); // Don't fail the save if Slack ping fails
}

// ── Action handlers ─────────────────────────────────────────

async function saveScore(token, body, slackWebhook) {
  const filePath = 'training-data/scores.json';
  const { data, sha } = await ghRead(token, filePath);
  const scores = Array.isArray(data) ? data : [];

  const record = {
    timestamp: body.date || new Date().toISOString(),
    agent: body.agent || 'Unknown',
    email: body.email || '',
    module: parseInt(body.module) || 0,
    moduleTitle: body.moduleTitle || '',
    scorePct: parseFloat(body.score) || 0,
    correct: parseInt(body.correct) || 0,
    total: parseInt(body.total) || 0,
    xp: parseInt(body.xp) || 0,
    poolSize: parseInt(body.poolSize) || 0,
    correctIndices: body.correctIndices || []
  };

  scores.push(record);
  await ghWrite(token, filePath, scores, sha, `Module ${record.module} score: ${record.agent} ${record.scorePct}%`);

  // Brief Slack ping — one line, no data dump
  const emoji = record.scorePct === 100 ? ':100:' : record.scorePct >= 80 ? ':fire:' : record.scorePct >= 60 ? ':dart:' : ':muscle:';
  const mastered = (record.correctIndices || []).length;
  let ping = `${emoji} *${record.agent}* — Module ${record.module} — ${record.scorePct}%`;
  if (record.poolSize > 0 && mastered >= record.poolSize) {
    ping += ' :trophy: *MODULE MASTERED*';
  }
  await pingSlack(slackWebhook, ping);
}

async function saveUpdate(token, body, slackWebhook) {
  const filePath = 'training-data/updates.json';
  const { data, sha } = await ghRead(token, filePath);
  const updates = Array.isArray(data) ? data : [];

  const record = {
    timestamp: body.date || new Date().toISOString(),
    module: parseInt(body.module) || 0,
    moduleTitle: body.moduleTitle || '',
    agent: body.agent || 'Unknown',
    email: body.email || '',
    update: body.update || '',
    status: 'pending'
  };

  updates.push(record);
  await ghWrite(token, filePath, updates, sha, `Module ${record.module} update from ${record.agent}`);

  // Brief Slack ping
  await pingSlack(slackWebhook, `:memo: *${record.agent}* submitted a note for Module ${record.module}: ${record.moduleTitle}`);
}

async function getTrainingProgress(token) {
  const filePath = 'training-data/scores.json';
  const { data } = await ghRead(token, filePath);
  if (!Array.isArray(data)) return [];

  const agents = {};
  for (const s of data) {
    const agent = (s.agent || '').trim();
    if (!agent) continue;
    const key = agent.toLowerCase();
    if (!agents[key]) agents[key] = { name: agent, email: s.email || '', modules: {} };
    const mod = s.module;
    if (!agents[key].modules[mod]) agents[key].modules[mod] = { best_score: 0, mastered: [], pool_size: 0, attempts: 0 };
    const m = agents[key].modules[mod];
    m.attempts++;
    if (s.scorePct > m.best_score) m.best_score = s.scorePct;
    if (s.poolSize > m.pool_size) m.pool_size = s.poolSize;
    for (const idx of (s.correctIndices || [])) {
      if (!m.mastered.includes(idx)) m.mastered.push(idx);
    }
  }
  return Object.values(agents);
}

async function getModuleProgress(token, agent, moduleNum) {
  if (!agent || !moduleNum) return { mastered: [] };

  const filePath = 'training-data/scores.json';
  const { data } = await ghRead(token, filePath);
  if (!Array.isArray(data)) return { mastered: [] };

  const agentLow = agent.trim().toLowerCase();
  const mastered = new Set();

  for (const s of data) {
    if ((s.agent || '').toLowerCase() !== agentLow) continue;
    if (s.module !== moduleNum) continue;
    for (const idx of (s.correctIndices || [])) {
      mastered.add(idx);
    }
  }

  return { mastered: [...mastered] };
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
  const SLACK_WEBHOOK = process.env.slack_webhook_url || process.env.SLACK_WEBHOOK_URL || process.env.slack_the_group_chat;

  if (!GITHUB_TOKEN) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'GitHubToken not configured' }) };
  }

  try {
    // GET — module progress lookup
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      if (params.action === 'getModuleProgress') {
        const result = await getModuleProgress(GITHUB_TOKEN, params.agent, parseInt(params.module));
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      if (params.action === 'gettrainingprogress') {
        const result = await getTrainingProgress(GITHUB_TOKEN);
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown GET action' }) };
    }

    // POST — score saves, module updates
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const action = body.action;

      if (action === 'moduleComplete') {
        await saveScore(GITHUB_TOKEN, body, SLACK_WEBHOOK);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }

      if (action === 'moduleUpdate') {
        await saveUpdate(GITHUB_TOKEN, body, SLACK_WEBHOOK);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }

      if (action === 'notifyScore') {
        // Legacy no-op — moduleComplete already pings Slack
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }

      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action: ' + action }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('module-api error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
