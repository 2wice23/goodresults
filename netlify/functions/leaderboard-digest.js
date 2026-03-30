// Netlify Scheduled Function — Weekly Leaderboard Digest
// Runs every Monday at 8:00 AM PT (15:00 UTC)
// Pulls Academy training progress and posts a team summary to Slack.
//
// Configure in netlify.toml:
//   [functions."leaderboard-digest"]
//   schedule = "0 15 * * 1"
//
// Env vars: slack_the_group_chat

const MODULE_API = 'https://goodresults.org/.netlify/functions/module-api';
const TASK_STATUS = 'https://goodresults.org/.netlify/functions/task-status';

const MODULE_TITLES = {
  1:'Pipeline & CRM', 2:'Realtor Outreach', 3:'The Offer Process',
  4:'Post-Contract SOP', 5:'SMS Playbook', 6:'Buy Box & Markets',
  7:'Comps & Analysis', 8:'Closing & Escrow', 9:'NV vs TX Contracts',
  10:'Investor Vocabulary', 11:'Due Diligence', 12:'Foreclosures'
};

async function logTaskRun(status, details) {
  try {
    await fetch(TASK_STATUS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: 'leaderboard-digest', status, details })
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
  const slackUrl = process.env.slack_the_group_chat;

  try {
    // Fetch training progress from module-api
    const res = await fetch(`${MODULE_API}?action=gettrainingprogress`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      await logTaskRun('success', 'No training data found — no agents have scores yet.');
      return { statusCode: 200 };
    }

    // Build per-agent summaries
    const summaries = data.map(agent => {
      let totalMastered = 0, totalPossible = 0, modulesComplete = 0, modulesStarted = 0;
      for (let m = 1; m <= 12; m++) {
        const mod = agent.modules[m] || agent.modules[String(m)];
        if (mod) {
          modulesStarted++;
          const mastered = (mod.mastered || []).length;
          const pool = mod.pool_size || 0;
          totalMastered += mastered;
          totalPossible += pool;
          if (pool > 0 && mastered >= pool) modulesComplete++;
        }
      }
      const pct = totalPossible > 0 ? Math.round(totalMastered / totalPossible * 100) : 0;
      return { name: agent.name, totalMastered, totalPossible, modulesComplete, modulesStarted, pct };
    }).sort((a, b) => b.totalMastered - a.totalMastered);

    // Format the Slack message
    const medals = ['🥇', '🥈', '🥉'];
    let lines = summaries.map((a, i) => {
      const medal = i < 3 ? medals[i] : '  ';
      const bar = a.pct >= 80 ? '🟢' : a.pct >= 40 ? '🟠' : a.pct > 0 ? '🔴' : '⚪';
      return `${medal} *${a.name}* — ${bar} ${a.pct}% mastered (${a.modulesComplete}/${a.modulesStarted} modules complete, ${a.totalMastered} questions)`;
    });

    // Find anyone who has not started
    const started = new Set(data.map(a => a.name.toLowerCase()));
    const roster = ['Gayden', 'Joe', 'Kayden', 'Dan', 'Franklin', 'Anthony'];
    const notStarted = roster.filter(n => !started.has(n.toLowerCase()));
    if (notStarted.length > 0) {
      lines.push(`\n⚠️ *Not started yet:* ${notStarted.join(', ')}`);
    }

    const message = `📊 *Weekly Academy Leaderboard — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}*\n\n` +
      lines.join('\n') +
      `\n\n_Train daily. Analyze every call. Stay sharp._`;

    await postToSlack(slackUrl, message);
    await logTaskRun('success', `Posted digest for ${summaries.length} agents. Leader: ${summaries[0]?.name || 'N/A'} at ${summaries[0]?.pct || 0}%.`);

  } catch (e) {
    await logTaskRun('error', `Failed: ${e.message}`);
    await postToSlack(slackUrl, `🚨 *Leaderboard Digest Failed*\n\nError: ${e.message}\n\n<@U0976VBKCVA> check the function logs.`);
  }

  return { statusCode: 200 };
};
