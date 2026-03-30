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

    // Format the Slack message with hype and trash talk
    const medals = ['🥇', '🥈', '🥉'];
    const leader = summaries[0];
    const lastPlace = summaries.length > 1 ? summaries[summaries.length - 1] : null;

    // Hype lines for the leader
    const leaderHype = [
      'Running this team right now. Absolutely dominant.',
      'Setting the standard. Everyone else is playing catch-up.',
      'ON TOP and not slowing down. This is what effort looks like.',
      'The rest of the team should be taking notes.',
      'Built different. That\'s all there is to say.',
      'Carrying this leaderboard on their back like it\'s nothing.'
    ];

    // Roast lines for last place
    const lastRoasts = [
      'Genuinely embarrassing. The modules are RIGHT THERE.',
      'At this point I think they forgot the Academy exists.',
      'If this was a race they\'d still be tying their shoes.',
      'Everyone else is getting better and they\'re just... existing.',
      'I\'ve seen more effort from people on vacation.',
      'This is the kind of performance that makes you wonder if they even want to be here.',
      'The leaderboard is literally BEGGING them to do something. Anything.',
      'Their score is so low it\'s pulling the team average down by itself.',
      'If coasting was a skill they\'d finally be number one at something.',
      'The new hires are going to pass them at this rate. Tragic.'
    ];

    let lines = summaries.map((a, i) => {
      const medal = i < 3 ? medals[i] : '  ';
      const bar = a.pct >= 80 ? '🟢' : a.pct >= 40 ? '🟠' : a.pct > 0 ? '🔴' : '⚪';
      return `${medal} *${a.name}* — ${bar} ${a.pct}% mastered | ${a.modulesComplete} modules complete | ${a.totalMastered} questions locked in`;
    });

    // Hype the leader
    if (leader && leader.pct > 0) {
      const hype = leaderHype[Math.floor(Math.random() * leaderHype.length)];
      lines.unshift(`🔥 *${leader.name}* is ON TOP this week at ${leader.pct}% mastery. ${hype}\n`);
    }

    // Roast last place
    if (lastPlace && lastPlace !== leader && summaries.length > 2) {
      const roast = lastRoasts[Math.floor(Math.random() * lastRoasts.length)];
      lines.push(`\n💀 And in LAST PLACE... *${lastPlace.name}* with a pathetic ${lastPlace.pct}% mastery. ${roast}`);
    }

    // Find anyone who has not started
    const started = new Set(data.map(a => a.name.toLowerCase()));
    const roster = ['Gayden', 'Joe', 'Kayden', 'Dan', 'Franklin', 'Anthony'];
    const notStarted = roster.filter(n => !started.has(n.toLowerCase()));
    if (notStarted.length > 0) {
      lines.push(`\n🚫 *Haven't even started:* ${notStarted.join(', ')} — what's the excuse?`);
    }

    const message = `<!channel> 📊 *WEEKLY ACADEMY LEADERBOARD — ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}*\n\n` +
      lines.join('\n') +
      `\n\n_The scoreboard doesn't lie. Put in the work or get left behind._`;

    await postToSlack(slackUrl, message);
    await logTaskRun('success', `Posted digest for ${summaries.length} agents. Leader: ${summaries[0]?.name || 'N/A'} at ${summaries[0]?.pct || 0}%.`);

  } catch (e) {
    await logTaskRun('error', `Failed: ${e.message}`);
    await postToSlack(slackUrl, `🚨 *Leaderboard Digest Failed*\n\nError: ${e.message}\n\n<@U0976VBKCVA> check the function logs.`);
  }

  return { statusCode: 200 };
};
