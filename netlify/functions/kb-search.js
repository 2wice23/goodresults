// Netlify serverless function — fetches ALL Good Results knowledge bases from
// GitHub and returns ranked search results with context snippets.
// Searches: modules-kb, analyzer-kb, chloe-kb, sms-kb (skips master-kb to
// avoid duplicates since master is a merge of the others).
// Caches all KBs in memory for 5 min so repeated searches are instant.
//
// POST { query: "earnest money" }
// Returns { results: [ { heading, brain, breadcrumb, snippet, score }, ... ] }
//
// POST { action: "question", question: "...", agent: "Dan", email: "..." }
// Sends the question to #questions-and-answers in Slack, tagging Joe & Gayden
//
// Env vars: GitHubToken, slack_the_group_chat (fallback), slack_questions_answers

const GITHUB_API = 'https://api.github.com';
const REPO = '/repos/2wice23/goodresults/contents';
const CACHE_TTL = 5 * 60 * 1000; // 5 min

// Each "brain" — the individual KBs that make up Good Results knowledge
const BRAINS = [
  { file: 'modules-kb.md',  label: 'Academy',       icon: '🎓', color: '#FF5C1A' },
  { file: 'analyzer-kb.md', label: 'Call Analyzer',  icon: '🎙', color: '#22C55E' },
  { file: 'chloe-kb.md',    label: 'Chloe (Voice)',  icon: '🤖', color: '#60A5FA' },
  { file: 'sms-kb.md',      label: 'SMS Playbook',   icon: '💬', color: '#F59E0B' }
];

let cache = {}; // { [file]: { text, ts } }

async function fetchFile(token, file) {
  const cached = cache[file];
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.text;

  const resp = await fetch(`${GITHUB_API}${REPO}/${file}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  if (!resp.ok) {
    console.error(`Failed to fetch ${file}: ${resp.status}`);
    return null;
  }
  const json = await resp.json();
  const text = Buffer.from(json.content, 'base64').toString('utf-8');
  cache[file] = { text, ts: Date.now() };
  return text;
}

// Parse a KB into sections by heading hierarchy
function parseSections(text, brain) {
  const lines = text.split('\n');
  const sections = [];
  let currentH2 = '';
  let currentH3 = '';
  let currentH4 = '';
  let sectionLines = [];

  function flush() {
    if (sectionLines.length > 0) {
      const content = sectionLines.join('\n').trim();
      if (content.length > 0) {
        sections.push({
          h2: currentH2,
          h3: currentH3,
          h4: currentH4,
          heading: currentH4 || currentH3 || currentH2 || 'General',
          text: content,
          brain: brain.label,
          brainIcon: brain.icon,
          brainColor: brain.color
        });
      }
    }
    sectionLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      flush();
      currentH2 = line.replace(/^##\s+/, '');
      currentH3 = '';
      currentH4 = '';
    } else if (line.startsWith('### ') && !line.startsWith('#### ')) {
      flush();
      currentH3 = line.replace(/^###\s+/, '');
      currentH4 = '';
    } else if (line.startsWith('#### ')) {
      flush();
      currentH4 = line.replace(/^####\s+/, '');
    } else {
      sectionLines.push(line);
    }
  }
  flush();
  return sections;
}

function search(allSections, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);
  if (terms.length === 0) return [];

  const scored = [];

  for (const sec of allSections) {
    const blob = `${sec.heading} ${sec.h2} ${sec.h3} ${sec.h4} ${sec.text}`.toLowerCase();
    let score = 0;

    // Full phrase match — big bonus
    if (blob.includes(query.toLowerCase())) score += 10;

    // Per-term scoring
    for (const term of terms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Heading match worth more
      const headingBlob = `${sec.heading} ${sec.h2} ${sec.h3} ${sec.h4}`.toLowerCase();
      if (headingBlob.includes(term)) score += 5;
      // Count occurrences in body (capped)
      const count = (blob.match(new RegExp(escaped, 'gi')) || []).length;
      score += Math.min(count, 6);
    }

    if (score > 0) {
      // Build a context snippet around the first match
      const lowerText = sec.text.toLowerCase();
      const idx = lowerText.indexOf(terms[0]);
      let snippet = '';
      if (idx >= 0) {
        const start = Math.max(0, idx - 80);
        const end = Math.min(sec.text.length, idx + 220);
        snippet = (start > 0 ? '...' : '') + sec.text.slice(start, end).trim() + (end < sec.text.length ? '...' : '');
      } else {
        snippet = sec.text.slice(0, 280).trim() + (sec.text.length > 280 ? '...' : '');
      }

      scored.push({
        heading: sec.heading,
        brain: sec.brain,
        brainIcon: sec.brainIcon,
        brainColor: sec.brainColor,
        breadcrumb: [sec.h2, sec.h3, sec.h4].filter(Boolean).join(' → '),
        snippet: snippet.replace(/\n{2,}/g, '\n'),
        score
      });
    }
  }

  // Sort by score desc, take top 25
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 25);
}

// ── Slack: send question to #questions-and-answers ─────────────────
// Tags Joe (U0AB93T37S5) and Gayden (U0976VBKCVA)
async function sendQuestion(webhook, body) {
  const agent = body.agent || 'Someone';
  const question = (body.question || '').trim();
  const searchedFor = (body.searchedFor || '').trim();

  if (!question) throw new Error('Question is empty');

  let text = `:question: *KB Search Question* from *${agent}*\n\n> ${question}`;
  if (searchedFor) text += `\n\n_Searched for:_ \`${searchedFor}\``;
  text += `\n\ncc <@U0AB93T37S5> <@U0976VBKCVA>`;

  const resp = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!resp.ok) throw new Error(`Slack POST failed: ${resp.status}`);
}

exports.handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: cors, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'POST only' }) };

  const token = process.env.GitHubToken;
  if (!token) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'GitHubToken not configured' }) };

  try {
    const body = JSON.parse(event.body);

    // ── Route: submit a question to Slack ──
    if (body.action === 'question') {
      const webhook = process.env.slack_questions_answers || process.env.slack_the_group_chat;
      if (!webhook) return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Slack webhook not configured' }) };
      await sendQuestion(webhook, body);
      return { statusCode: 200, headers: cors, body: JSON.stringify({ ok: true }) };
    }

    // ── Route: search KBs (default) ──
    const query = body.query;
    if (!query || query.trim().length < 2) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Query too short' }) };
    }

    // Fetch all KBs in parallel
    const fetches = BRAINS.map(b => fetchFile(token, b.file).then(text => ({ brain: b, text })));
    const results = await Promise.all(fetches);

    // Parse all into sections
    let allSections = [];
    for (const { brain, text } of results) {
      if (text) {
        allSections = allSections.concat(parseSections(text, brain));
      }
    }

    const searchResults = search(allSections, query.trim());

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({
        results: searchResults,
        total: searchResults.length,
        brains: BRAINS.map(b => b.label)
      })
    };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: err.message }) };
  }
};
