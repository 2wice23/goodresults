// Netlify serverless function — replaces Google Apps Script for training modules
// Handles: quiz score saves, module update notes, mastery progress lookups
// Storage: GitHub JSON files in training-data/ folder (2wice23/goodresults repo)
// Notifications: Quiz scores with leaderboard trash talk + module update pings to Slack
//
// Env vars used:
//   GitHubToken            — GitHub PAT for reading/writing to repo
//   slack_the_group_chat   — Slack incoming webhook for #the-group-chat

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

  // ── Build Slack message with leaderboard trash talk ──

  // Score commentary
  const scoreComments = [
    [100, 'PERFECT SCORE 🧠 Absolutely disgusting dominance. Everyone else should be worried.'],
    [90, 'Strong. Very strong. That\'s the kind of energy this team needs.'],
    [80, 'Solid work. Not perfect, but definitely respectable.'],
    [70, 'Ehh... it\'s passing. Barely. Maybe crack open the module one more time.'],
    [60, 'That\'s... not great. You might wanna re-read that module, just saying.'],
    [0, 'Yikes. 😬 Did you even read the module or just start clicking randomly?']
  ];
  let commentary = '';
  for (const [threshold, msg] of scoreComments) {
    if (record.scorePct >= threshold) { commentary = msg; break; }
  }

  // Find last place agent from all scores
  const agentStats = {};
  for (const s of scores) {
    const name = (s.agent || '').trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!agentStats[key]) agentStats[key] = { name, modules: {} };
    const mod = s.module;
    if (!agentStats[key].modules[mod]) agentStats[key].modules[mod] = { bestScore: 0 };
    if (s.scorePct > agentStats[key].modules[mod].bestScore) {
      agentStats[key].modules[mod].bestScore = s.scorePct;
    }
  }

  let lastPlace = null, lowestAvg = Infinity, worstScore = Infinity, worstModule = '';
  for (const [key, a] of Object.entries(agentStats)) {
    const mods = Object.entries(a.modules);
    if (!mods.length) continue;
    const avg = mods.reduce((sum, [_, m]) => sum + m.bestScore, 0) / mods.length;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      lastPlace = a.name;
      worstScore = Infinity;
      worstModule = '';
      for (const [n, m] of mods) {
        if (m.bestScore < worstScore) { worstScore = m.bestScore; worstModule = n; }
      }
    }
  }

  const roasts = [
    'When are you gonna step it up? Asking for the whole damn team. 👀',
    'That score is genuinely embarrassing. I\'d be scared to show my face in the office.',
    'The leaderboard is BEGGING you to do literally anything.',
    'At this point even a coin flip would score better. Just saying. 🤯',
    'Everyone else is getting better. You\'re getting... comfortable? 🛏️',
    'You know the modules are FREE to re-take right?? Nobody\'s stopping you.',
    'I\'ve seen better scores from people who accidentally hit submit. 💀',
    'Your score is so low it\'s basically a rounding error.',
    'If effort was a scoreboard you wouldn\'t even be on it.',
    'Bro what the hell is that score. My grandma could do better and she doesn\'t even work here.',
    'That\'s not a score, that\'s a cry for help. 😭',
    'You\'re out here making everyone else look like geniuses by comparison.',
    'At this rate you\'re gonna get bodied by the new hires. Step it up.',
    'This is the kind of score that makes leadership question their hiring decisions. 💀'
  ];
  const roast = roasts[Math.floor(Math.random() * roasts.length)];

  let slackMsg = `<!channel> 🎓 *${record.agent}* just finished *Module ${record.module} — ${record.moduleTitle}*\nScore: ${record.correct}/${record.total} (${record.scorePct}%)\n${commentary}`;

  if (record.scorePct === 100 && (record.correctIndices || []).length >= (record.poolSize || 0) && record.poolSize > 0) {
    slackMsg += '\n:trophy: *MODULE MASTERED*';
  }

  if (lastPlace && lastPlace.toLowerCase() !== record.agent.toLowerCase()) {
    slackMsg += `\n\n📈 Meanwhile... *${lastPlace}* is camping out in LAST PLACE with a ${Math.round(worstScore)}% on Module ${worstModule}. ${roast}`;
  } else if (lastPlace && lastPlace.toLowerCase() === record.agent.toLowerCase()) {
    slackMsg += `\n\n📈 Plot twist... *${record.agent}* IS in last place. ${record.scorePct < 70 ? 'And this score ain\'t helping. 💀' : 'But at least they\'re trying to climb out. Respect... barely.'}`;
  }

  await pingSlack(slackWebhook, slackMsg);
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
  const SLACK_WEBHOOK = process.env.slack_the_group_chat;

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

      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action: ' + action }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error('module-api error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
