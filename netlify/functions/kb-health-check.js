// Netlify Scheduled Function — KB Health Check
// Runs daily at 9:00 AM PT (16:00 UTC)
// Verifies all 4 knowledge bases are accessible on GitHub and have content.
// Logs results to task-status and posts to Slack if anything is wrong.
//
// Configure in netlify.toml:
//   [functions."kb-health-check"]
//   schedule = "0 16 * * *"
//
// Env vars: GitHubToken, slack_the_group_chat

const GITHUB_API = 'https://api.github.com';
const REPO = '/repos/2wice23/goodresults/contents';

const KBS = [
  { file: 'modules-kb.md', name: 'Academy Modules', emoji: '🎓' },
  { file: 'analyzer-kb.md', name: 'Call Analyzer', emoji: '🎙' },
  { file: 'chloe-kb.md', name: 'Chloe Voice Agent', emoji: '🤖' },
  { file: 'sms-kb.md', name: 'SMS Playbook', emoji: '💬' }
];

async function checkKB(token, file) {
  try {
    const res = await fetch(`${GITHUB_API}${REPO}/${file}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}`, size: 0 };
    const json = await res.json();
    const size = json.size || 0;
    if (size < 100) return { ok: false, error: 'File is empty or nearly empty', size };
    return { ok: true, size };
  } catch (e) {
    return { ok: false, error: e.message, size: 0 };
  }
}

async function logTaskRun(status, details) {
  try {
    await fetch(`https://goodresults.org/.netlify/functions/task-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'kb-health-check', status, details })
    });
  } catch (e) {
    console.error('Failed to log task run:', e.message);
  }
}

async function postToSlack(webhookUrl, message) {
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    });
  } catch (e) {
    console.error('Slack post failed:', e.message);
  }
}

exports.handler = async function(event) {
  const token = process.env.GitHubToken;
  const slackUrl = process.env.slack_the_group_chat;

  if (!token) {
    console.error('No GitHubToken configured');
    return { statusCode: 500 };
  }

  // Check all KBs in parallel
  const results = await Promise.all(
    KBS.map(async (kb) => {
      const check = await checkKB(token, kb.file);
      return { ...kb, ...check };
    })
  );

  const healthy = results.filter(r => r.ok);
  const broken = results.filter(r => !r.ok);
  const allHealthy = broken.length === 0;

  // Build status details
  const details = results.map(r => {
    const sizeKB = (r.size / 1024).toFixed(1);
    return r.ok
      ? `${r.emoji} ${r.name}: OK (${sizeKB} KB)`
      : `${r.emoji} ${r.name}: FAILED — ${r.error}`;
  }).join(' | ');

  // Log the run
  await logTaskRun(allHealthy ? 'success' : 'error', details);

  // Post to Slack only if something is wrong, or on Mondays for a health summary
  const today = new Date();
  const isMonday = today.getUTCDay() === 1;

  if (!allHealthy) {
    const brokenList = broken.map(r => `  ${r.emoji} *${r.name}* (${r.file}): ${r.error}`).join('\n');
    await postToSlack(slackUrl,
      `🚨 *KB Health Check — Issues Found*\n\n` +
      `${broken.length} of ${KBS.length} knowledge bases have problems:\n` +
      `${brokenList}\n\n` +
      `${healthy.length} healthy: ${healthy.map(r => r.name).join(', ')}\n\n` +
      `<@U0AB93T37S5> <@U0976VBKCVA> — check the GitHub repo.`
    );
  } else if (isMonday) {
    const summary = results.map(r => `  ${r.emoji} ${r.name}: ${(r.size/1024).toFixed(1)} KB`).join('\n');
    await postToSlack(slackUrl,
      `✅ *Weekly KB Health Check — All Clear*\n\n` +
      `All ${KBS.length} knowledge bases are healthy:\n${summary}`
    );
  }

  return { statusCode: 200 };
};
