// Netlify serverless function — replaces Google Apps Script for training modules
// Handles: quiz score saves, module update notes, mastery progress lookups
// Storage: Netlify Blobs (training store)
// Notifications: Quiz scores with leaderboard trash talk + module update pings to Slack
//
// Env vars used:
//   slack_the_group_chat   — Slack incoming webhook for #the-group-chat (team scores, trash talk)
//   slack_questions_answers — Slack incoming webhook for #questions-and-answers (module update notes)

const { getStore, connectLambda } = require("@netlify/blobs");

const CANVAS_URL = 'https://goodresultshomebuyers.slack.com/docs/T0976VBJV6Y/F0AQDUPSAQY';

// ── Blob store helpers ──────────────────────────────────────────
// Note: connectLambda(event) must be called before these in the handler

async function blobRead(key) {
  const store = getStore({ name: 'training', consistency: 'eventual' });
  const data = await store.get(key, { type: 'json' });
  return data || null;
}

async function blobWrite(key, data) {
  const store = getStore({ name: 'training', consistency: 'eventual' });
  await store.setJSON(key, data);
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

async function saveScore(body, slackWebhook) {
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
    correctIndices: body.correctIndices || [],
    wrongAnswers: body.wrongAnswers || []
  };

  // ── Write score with retry to guard against eventual-consistency races ──
  // Each score also gets its own individual blob key as a backup
  const scoreKey = `score-${Date.now()}-${record.agent.toLowerCase().replace(/\s+/g,'-')}`;
  await blobWrite(scoreKey, record);

  for (let attempt = 0; attempt < 3; attempt++) {
    const scores = (await blobRead('scores')) || [];
    scores.push(record);
    await blobWrite('scores', scores);
    // Brief pause then verify the write stuck
    await new Promise(r => setTimeout(r, 300));
    const verify = (await blobRead('scores')) || [];
    const found = verify.some(s =>
      s.timestamp === record.timestamp &&
      (s.agent || '').toLowerCase() === record.agent.toLowerCase() &&
      s.module === record.module
    );
    if (found) break;
    console.warn(`Score write verify failed for ${record.agent} mod ${record.module}, attempt ${attempt + 1}`);
  }

  // ── Save wrong answers to separate blob for remediation tracking ──
  if (record.wrongAnswers.length > 0) {
    try {
      const wrongs = (await blobRead('wrong-answers')) || [];
      for (const wa of record.wrongAnswers) {
        wrongs.push({
          timestamp: record.timestamp,
          agent: record.agent,
          module: record.module,
          moduleTitle: record.moduleTitle,
          poolIdx: wa.poolIdx,
          question: wa.question,
          pickedText: wa.pickedText,
          correctText: wa.correctText
        });
      }
      await blobWrite('wrong-answers', wrongs);
    } catch (e) { /* Don't fail the score save if wrong-answer tracking fails */ }
  }

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

async function saveUpdate(body, slackWebhook) {
  const updates = (await blobRead('updates')) || [];

  const record = {
    timestamp: body.date || new Date().toISOString(),
    module: parseInt(body.module) || 0,
    moduleTitle: body.moduleTitle || '',
    agent: body.agent || 'Unknown',
    email: body.email || '',
    update: body.text || body.update || '',
    status: 'pending'
  };

  updates.push(record);
  await blobWrite('updates', updates);

  // Clean Q&A ping — no fluff
  await pingSlack(slackWebhook, `*${record.agent}* — Module ${record.module} (${record.moduleTitle}) note:\n> ${record.update}`);
}

async function getTrainingProgress() {
  const mainScores = await blobRead('scores');
  const data = Array.isArray(mainScores) ? mainScores : [];

  // Also check for individual score backup keys
  try {
    const store = getStore({ name: 'training', consistency: 'eventual' });
    const { blobs } = await store.list({ prefix: 'score-' });
    if (blobs && blobs.length > 0) {
      // Build a set of existing score signatures to avoid duplicates
      const existing = new Set(data.map(s => `${s.timestamp}|${(s.agent||'').toLowerCase()}|${s.module}`));
      for (const blob of blobs) {
        try {
          const record = await store.get(blob.key, { type: 'json' });
          if (record && record.agent) {
            const sig = `${record.timestamp}|${record.agent.toLowerCase()}|${record.module}`;
            if (!existing.has(sig)) {
              data.push(record);
              existing.add(sig);
            }
          }
        } catch (e) { /* skip unreadable backup keys */ }
      }
    }
  } catch (e) { /* If list fails, just use main scores array */ }

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

async function getModuleProgress(agent, moduleNum) {
  if (!agent || !moduleNum) return { mastered: [] };

  const data = await blobRead('scores');
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

  const SLACK_GROUP_CHAT = process.env.slack_the_group_chat;
  const SLACK_QA = process.env.slack_questions_answers || SLACK_GROUP_CHAT;

  // Initialize Blobs for Lambda-compat functions
  connectLambda(event);

  try {
    // GET — module progress lookup
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {};
      if (params.action === 'getModuleProgress') {
        const result = await getModuleProgress(params.agent, parseInt(params.module));
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      if (params.action === 'gettrainingprogress') {
        const result = await getTrainingProgress();
        return { statusCode: 200, headers, body: JSON.stringify(result) };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown GET action' }) };
    }

    // POST — score saves, module updates
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body);
      const action = body.action;

      if (action === 'moduleComplete') {
        await saveScore(body, body.silent ? null : SLACK_GROUP_CHAT);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
      }

      if (action === 'backfillScores') {
        // Bulk inject score records without Slack notifications
        const records = body.records || [];
        const scores = (await blobRead('scores')) || [];
        for (const r of records) {
          scores.push({
            timestamp: r.date || new Date().toISOString(),
            agent: r.agent || 'Unknown',
            email: r.email || '',
            module: parseInt(r.module) || 0,
            moduleTitle: r.moduleTitle || '',
            scorePct: parseFloat(r.score) || 0,
            correct: parseInt(r.correct) || 0,
            total: parseInt(r.total) || 0,
            xp: parseInt(r.xp) || 0,
            poolSize: parseInt(r.poolSize) || 0,
            correctIndices: r.correctIndices || [],
            wrongAnswers: r.wrongAnswers || []
          });
        }
        await blobWrite('scores', scores);
        return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', injected: records.length }) };
      }

      if (action === 'moduleUpdate') {
        await saveUpdate(body, SLACK_QA);
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
