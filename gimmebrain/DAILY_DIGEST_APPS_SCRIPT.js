// ============================================================
// DAILY DIGEST — ADD THIS TO YOUR EXISTING APPS SCRIPT
// ============================================================
//
// INSTRUCTIONS:
// 1. Open your Google Sheet (gimmesheetbrain)
// 2. Go to Extensions → Apps Script
// 3. Paste ALL of this code at the BOTTOM of your existing script
//    (do NOT delete anything that's already there)
// 4. Update SLACK_WEBHOOK_URL below if it's not already set
//    as a global variable in your existing script
// 5. Click Save
// 6. Run setupDailyDigestTrigger() ONE TIME from the editor
//    (Select it from the dropdown → click Run)
// 7. Authorize when prompted — that's it, it runs every day at 9 AM
//
// ============================================================

// ── CONFIG ──────────────────────────────────────────────────
// If your existing script already has SLACK_WEBHOOK_URL defined,
// DELETE or comment out this line:
var DIGEST_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL_HERE';
// Otherwise, paste your Slack incoming webhook URL above.
// To get one: https://api.slack.com/messaging/webhooks
//
// If you already have a variable like SLACK_WEBHOOK or
// SLACK_WEBHOOK_URL in your script, just change the references
// below from DIGEST_WEBHOOK_URL to your existing variable name.
// ────────────────────────────────────────────────────────────


/**
 * SETUP — Run this ONE TIME from the Apps Script editor.
 * It creates a daily trigger that fires sendDailyDigest() at 9 AM.
 */
function setupDailyDigestTrigger() {
  // Remove any existing digest triggers to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDailyDigest') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Create new daily trigger at 9 AM in your timezone
  ScriptApp.newTrigger('sendDailyDigest')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .nearMinute(0)
    .inTimezone('America/Chicago')  // CDT — change if needed
    .create();

  Logger.log('Daily digest trigger created for 9:00 AM CT');
}


/**
 * MAIN — Builds and posts the daily digest to Slack.
 * Called automatically by the trigger, or run manually anytime.
 */
function sendDailyDigest() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── Gather data ──
  var leaderboard = getLeaderboardData_(ss);
  var recentCalls = getRecentCallReports_(ss, 24);
  var kbLearnings = getRecentKBLearnings_(ss, 24);
  var kbAdditions = getRecentKBAdditions_(ss, 24);

  // ── Build the Slack message ──
  var today = Utilities.formatDate(new Date(), 'America/Chicago', 'MMMM d, yyyy');
  var dayOfWeek = Utilities.formatDate(new Date(), 'America/Chicago', 'EEEE');

  var msg = '';

  // ── HEADER ──
  msg += ':trophy: *GOOD RESULTS — MORNING BRIEFING*\n';
  msg += dayOfWeek + ', ' + today + '\n';
  msg += '<!channel>\n\n';

  // ── MOTIVATIONAL QUOTE ──
  msg += '_"' + getDailyQuote_() + '"_\n\n';

  // ── LEADERBOARD ──
  msg += ':bar_chart: *CALL ANALYZER LEADERBOARD*\n';
  if (leaderboard.length === 0) {
    msg += 'No scores yet — be the first to submit a call today.\n';
  } else {
    for (var i = 0; i < leaderboard.length; i++) {
      var agent = leaderboard[i];
      msg += '#' + (i + 1) + ' ' + agent.name;
      msg += ' · ' + agent.calls + ' calls analyzed';
      msg += ' · avg ' + agent.avg + '/100\n';
    }
  }
  msg += 'Submit your calls at goodresults.org/gimmebrain/analyzer\n\n';

  // ── WHAT WE LEARNED YESTERDAY (THE NEW PART) ──
  msg += ':brain: *WHAT WE LEARNED YESTERDAY*\n';

  var hasLearnings = false;

  if (kbLearnings.positive.length > 0) {
    msg += '\n:white_check_mark: *What\'s Landing With Realtors:*\n';
    // Show up to 5 most recent positive patterns
    var posToShow = kbLearnings.positive.slice(0, 5);
    for (var p = 0; p < posToShow.length; p++) {
      msg += '• ' + posToShow[p] + '\n';
    }
    if (kbLearnings.positive.length > 5) {
      msg += '_...and ' + (kbLearnings.positive.length - 5) + ' more positive patterns learned_\n';
    }
    hasLearnings = true;
  }

  if (kbLearnings.negative.length > 0) {
    msg += '\n:warning: *What\'s Killing Engagement:*\n';
    // Show up to 5 most recent negative patterns
    var negToShow = kbLearnings.negative.slice(0, 5);
    for (var n = 0; n < negToShow.length; n++) {
      msg += '• ' + negToShow[n] + '\n';
    }
    if (kbLearnings.negative.length > 5) {
      msg += '_...and ' + (kbLearnings.negative.length - 5) + ' more patterns flagged_\n';
    }
    hasLearnings = true;
  }

  if (kbAdditions.length > 0) {
    msg += '\n:mag: *Field Intelligence:*\n';
    // Show up to 3 field insights
    var insToShow = kbAdditions.slice(0, 3);
    for (var k = 0; k < insToShow.length; k++) {
      msg += '• ' + insToShow[k] + '\n';
    }
    if (kbAdditions.length > 3) {
      msg += '_...and ' + (kbAdditions.length - 3) + ' more field insights captured_\n';
    }
    hasLearnings = true;
  }

  if (!hasLearnings) {
    msg += '_No new patterns learned yesterday. Analyze more calls to grow the KB._\n';
  }

  // KB totals
  var kbTotals = getKBTotals_(ss);
  msg += '\n:books: *KB Health:* ' + kbTotals.positive + ' positive patterns · ';
  msg += kbTotals.negative + ' negative flags · ';
  msg += kbTotals.additions + ' field insights\n\n';

  // ── YESTERDAY'S ANALYZED CALLS ──
  msg += ':telephone_receiver: *YESTERDAY\'S ANALYZED CALLS*\n';
  if (recentCalls.length === 0) {
    msg += '_No calls analyzed yesterday._\n';
  } else {
    // Group by agent
    var byAgent = {};
    for (var c = 0; c < recentCalls.length; c++) {
      var call = recentCalls[c];
      if (!byAgent[call.agent]) {
        byAgent[call.agent] = { calls: [], totalScore: 0 };
      }
      byAgent[call.agent].calls.push(call);
      byAgent[call.agent].totalScore += call.score;
    }

    var agentSummaries = [];
    for (var agentName in byAgent) {
      var data = byAgent[agentName];
      var avgScore = Math.round(data.totalScore / data.calls.length);
      agentSummaries.push({
        name: agentName,
        count: data.calls.length,
        avg: avgScore
      });
    }

    // Sort by count descending
    agentSummaries.sort(function(a, b) { return b.count - a.count; });

    for (var s = 0; s < agentSummaries.length; s++) {
      var a = agentSummaries[s];
      var emoji = a.avg >= 85 ? ':star:' : a.avg >= 70 ? ':white_check_mark:' : a.avg >= 50 ? ':large_blue_circle:' : ':red_circle:';
      msg += a.name + ': ' + a.count + ' call' + (a.count !== 1 ? 's' : '') + ' analyzed · avg ' + a.avg + '/100 ' + emoji + '\n';
    }

    // Top coaching moment from yesterday
    var bestMoment = getBestCoachingMoment_(recentCalls);
    if (bestMoment) {
      msg += '\n:bulb: *Top Coaching Moment:*\n';
      msg += '_' + bestMoment.agent + ' (' + bestMoment.callType + '):_ ' + bestMoment.moment + '\n';
    }
  }

  msg += '\nLet\'s get after it today :muscle:';

  // ── POST TO SLACK ──
  postDigestToSlack_(msg);
}


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Gets leaderboard data sorted by average score descending.
 * Adjust the sheet name if yours is different.
 */
function getLeaderboardData_(ss) {
  // Try common sheet names for leaderboard data
  var sheetNames = ['Leaderboard', 'leaderboard', 'Sheet1'];
  var sheet = null;

  for (var i = 0; i < sheetNames.length; i++) {
    sheet = ss.getSheetByName(sheetNames[i]);
    if (sheet) break;
  }

  if (!sheet) {
    // If no dedicated leaderboard sheet, build from call reports
    return buildLeaderboardFromCallReports_(ss);
  }

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var agents = [];
  // Assumes columns: agent_name, total_calls, avg_score (adjust indices if different)
  for (var r = 1; r < data.length; r++) {
    var name = data[r][0];
    var calls = parseInt(data[r][1]) || 0;
    var avg = parseFloat(data[r][2]) || 0;
    if (name && calls > 0) {
      agents.push({ name: name, calls: calls, avg: Math.round(avg) });
    }
  }

  agents.sort(function(a, b) { return b.avg - a.avg; });
  return agents;
}

/**
 * Fallback: build leaderboard from CallReports sheet
 */
function buildLeaderboardFromCallReports_(ss) {
  var sheet = ss.getSheetByName('CallReports') || ss.getSheetByName('Call Reports');
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var agentCol = findCol_(headers, ['agent', 'agent_name']);
  var scoreCol = findCol_(headers, ['score', 'overall_score']);
  if (agentCol === -1 || scoreCol === -1) return [];

  var byAgent = {};
  for (var r = 1; r < data.length; r++) {
    var name = String(data[r][agentCol]).trim();
    var score = parseFloat(data[r][scoreCol]) || 0;
    if (!name) continue;
    if (!byAgent[name]) byAgent[name] = { total: 0, count: 0 };
    byAgent[name].total += score;
    byAgent[name].count++;
  }

  var agents = [];
  for (var n in byAgent) {
    agents.push({
      name: n,
      calls: byAgent[n].count,
      avg: Math.round(byAgent[n].total / byAgent[n].count)
    });
  }

  agents.sort(function(a, b) { return b.avg - a.avg; });
  return agents;
}

/**
 * Gets call reports from the last N hours.
 */
function getRecentCallReports_(ss, hours) {
  var sheet = ss.getSheetByName('CallReports') || ss.getSheetByName('Call Reports');
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var tsCol = findCol_(headers, ['timestamp', 'date', 'created']);
  var agentCol = findCol_(headers, ['agent', 'agent_name']);
  var scoreCol = findCol_(headers, ['score', 'overall_score']);
  var typeCol = findCol_(headers, ['call_type', 'calltype', 'type']);
  var summaryCol = findCol_(headers, ['summary']);
  var scriptCol = findCol_(headers, ['script_moment', 'recommended_script_moment']);
  var engCol = findCol_(headers, ['realtor_engagement']);

  var cutoff = new Date().getTime() - (hours * 60 * 60 * 1000);
  var recent = [];

  for (var r = 1; r < data.length; r++) {
    var ts = data[r][tsCol >= 0 ? tsCol : 0];
    var rowDate;

    if (ts instanceof Date) {
      rowDate = ts;
    } else {
      rowDate = new Date(ts);
    }

    if (isNaN(rowDate.getTime()) || rowDate.getTime() < cutoff) continue;

    recent.push({
      agent: agentCol >= 0 ? String(data[r][agentCol]).trim() : 'Unknown',
      score: scoreCol >= 0 ? (parseFloat(data[r][scoreCol]) || 0) : 0,
      callType: typeCol >= 0 ? String(data[r][typeCol]).trim() : '',
      summary: summaryCol >= 0 ? String(data[r][summaryCol]).trim() : '',
      scriptMoment: scriptCol >= 0 ? String(data[r][scriptCol]).trim() : '',
      engagement: engCol >= 0 ? (parseFloat(data[r][engCol]) || 0) : 0
    });
  }

  return recent;
}

/**
 * Gets KB learnings (positive + negative) from the last N hours.
 */
function getRecentKBLearnings_(ss, hours) {
  var cutoff = new Date().getTime() - (hours * 60 * 60 * 1000);
  var result = { positive: [], negative: [] };

  // KB_Positive
  var posSheet = ss.getSheetByName('KB_Positive');
  if (posSheet) {
    var posData = posSheet.getDataRange().getValues();
    var posHeaders = posData.length > 0 ? posData[0] : [];
    var posTsCol = findCol_(posHeaders, ['timestamp', 'date', 'created']);
    var posExCol = findCol_(posHeaders, ['examples', 'example', 'pattern', 'text']);
    var posAgentCol = findCol_(posHeaders, ['agent', 'agent_name']);

    for (var r = 1; r < posData.length; r++) {
      var ts = posData[r][posTsCol >= 0 ? posTsCol : 0];
      var rowDate = ts instanceof Date ? ts : new Date(ts);
      if (isNaN(rowDate.getTime()) || rowDate.getTime() < cutoff) continue;

      var example = posExCol >= 0 ? String(posData[r][posExCol]).trim() : '';
      var agent = posAgentCol >= 0 ? String(posData[r][posAgentCol]).trim() : '';

      if (example) {
        // Try to parse JSON array of examples
        try {
          var parsed = JSON.parse(example);
          if (Array.isArray(parsed)) {
            parsed.forEach(function(ex) { result.positive.push(cleanKBExample_(ex)); });
            continue;
          }
        } catch(e) {}
        // Not JSON, use as-is
        var display = example;
        if (agent) display = agent + ': ' + example;
        result.positive.push(cleanKBExample_(display));
      }
    }
  }

  // KB_Negative
  var negSheet = ss.getSheetByName('KB_Negative');
  if (negSheet) {
    var negData = negSheet.getDataRange().getValues();
    var negHeaders = negData.length > 0 ? negData[0] : [];
    var negTsCol = findCol_(negHeaders, ['timestamp', 'date', 'created']);
    var negExCol = findCol_(negHeaders, ['examples', 'example', 'pattern', 'text']);
    var negAgentCol = findCol_(negHeaders, ['agent', 'agent_name']);

    for (var r2 = 1; r2 < negData.length; r2++) {
      var ts2 = negData[r2][negTsCol >= 0 ? negTsCol : 0];
      var rowDate2 = ts2 instanceof Date ? ts2 : new Date(ts2);
      if (isNaN(rowDate2.getTime()) || rowDate2.getTime() < cutoff) continue;

      var example2 = negExCol >= 0 ? String(negData[r2][negExCol]).trim() : '';
      var agent2 = negAgentCol >= 0 ? String(negData[r2][negAgentCol]).trim() : '';

      if (example2) {
        try {
          var parsed2 = JSON.parse(example2);
          if (Array.isArray(parsed2)) {
            parsed2.forEach(function(ex) { result.negative.push(cleanKBExample_(ex)); });
            continue;
          }
        } catch(e) {}
        var display2 = example2;
        if (agent2) display2 = agent2 + ': ' + example2;
        result.negative.push(cleanKBExample_(display2));
      }
    }
  }

  return result;
}

/**
 * Gets field knowledge additions from the last N hours.
 */
function getRecentKBAdditions_(ss, hours) {
  var sheet = ss.getSheetByName('KB_Additions');
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var tsCol = findCol_(headers, ['timestamp', 'date', 'created']);
  var knowledgeCol = findCol_(headers, ['knowledge', 'insight', 'text', 'content']);
  var agentCol = findCol_(headers, ['agent', 'agent_name']);

  var cutoff = new Date().getTime() - (hours * 60 * 60 * 1000);
  var results = [];

  for (var r = 1; r < data.length; r++) {
    var ts = data[r][tsCol >= 0 ? tsCol : 0];
    var rowDate = ts instanceof Date ? ts : new Date(ts);
    if (isNaN(rowDate.getTime()) || rowDate.getTime() < cutoff) continue;

    var knowledge = knowledgeCol >= 0 ? String(data[r][knowledgeCol]).trim() : '';
    if (!knowledge) continue;

    // Try to parse JSON array
    try {
      var parsed = JSON.parse(knowledge);
      if (Array.isArray(parsed)) {
        parsed.forEach(function(item) {
          if (item && String(item).trim()) results.push(String(item).trim());
        });
        continue;
      }
    } catch(e) {}

    results.push(knowledge);
  }

  return results;
}

/**
 * Gets total counts of all KB entries.
 */
function getKBTotals_(ss) {
  var totals = { positive: 0, negative: 0, additions: 0 };

  var posSheet = ss.getSheetByName('KB_Positive');
  if (posSheet) totals.positive = Math.max(0, posSheet.getLastRow() - 1);

  var negSheet = ss.getSheetByName('KB_Negative');
  if (negSheet) totals.negative = Math.max(0, negSheet.getLastRow() - 1);

  var addSheet = ss.getSheetByName('KB_Additions');
  if (addSheet) totals.additions = Math.max(0, addSheet.getLastRow() - 1);

  return totals;
}

/**
 * Finds the best coaching moment from recent calls.
 */
function getBestCoachingMoment_(calls) {
  // Pick the coaching moment from the lowest-scoring call (most impactful)
  var best = null;
  var lowestScore = 999;

  for (var i = 0; i < calls.length; i++) {
    if (calls[i].scriptMoment && calls[i].score < lowestScore) {
      lowestScore = calls[i].score;
      best = {
        agent: calls[i].agent,
        callType: calls[i].callType,
        moment: calls[i].scriptMoment
      };
    }
  }

  return best;
}

/**
 * Cleans up a KB example string for display in Slack.
 * Removes the [Agent — CallType — Score X/100]: prefix if present.
 */
function cleanKBExample_(text) {
  var str = String(text).trim();
  // Remove bracketed prefix like [Dan VanMatre — COLD OPEN — Score 82/100]:
  var match = str.match(/^\[([^\]]+)\]:\s*(.+)$/);
  if (match) {
    var meta = match[1];
    var content = match[2];
    // Extract just agent name from meta
    var parts = meta.split('—').map(function(s) { return s.trim(); });
    var agentName = parts[0] || '';
    return agentName + ': ' + content;
  }
  return str;
}

/**
 * Finds a column index by trying multiple possible header names.
 */
function findCol_(headers, possibleNames) {
  for (var h = 0; h < headers.length; h++) {
    var header = String(headers[h]).toLowerCase().trim();
    for (var n = 0; n < possibleNames.length; n++) {
      if (header === possibleNames[n].toLowerCase()) return h;
    }
  }
  return -1;
}

/**
 * Returns a motivational quote for the day.
 */
function getDailyQuote_() {
  var quotes = [
    "The secret of getting ahead is getting started. — Mark Twain",
    "Every call is a chance to get 1% better. — Good Results",
    "Success is the sum of small efforts repeated day in and day out. — Robert Collier",
    "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
    "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
    "Discipline is choosing between what you want now and what you want most. — Abraham Lincoln",
    "Don't count the days, make the days count. — Muhammad Ali",
    "What you do today can improve all your tomorrows. — Ralph Marston",
    "Hard work beats talent when talent doesn't work hard. — Tim Notke",
    "The only way to do great work is to love what you do. — Steve Jobs",
    "It's not about being the best. It's about being better than you were yesterday. — Good Results",
    "The difference between ordinary and extraordinary is that little extra. — Jimmy Johnson",
    "Winners are not people who never fail, but people who never quit. — Edwin Louis Cole",
    "Your competition is not other people. It's your procrastination and your ego. — Good Results",
    "Be so good they can't ignore you. — Steve Martin",
    "The harder you work for something, the greater you'll feel when you achieve it. — Good Results",
    "Don't wish it were easier. Wish you were better. — Jim Rohn",
    "Results happen over time, not overnight. Work hard, stay consistent, and be patient. — Good Results",
    "Obsessed is a word the lazy use to describe the dedicated. — Grant Cardone",
    "Outwork everyone. Out-prepare everyone. Then go make the call. — Good Results",
    "You miss 100% of the shots you don't take. — Wayne Gretzky",
    "Small daily improvements over time lead to stunning results. — Robin Sharma",
    "The grind is where champions are made. — Good Results",
    "Pressure is a privilege. — Billie Jean King",
    "One call can change everything. Make it count. — Good Results",
    "Fortune favors the bold. — Latin Proverb",
    "The best salespeople are the best listeners. — Good Results",
    "There are no shortcuts to any place worth going. — Beverly Sills",
    "You are only one call away from your next deal. — Good Results",
    "Action is the foundational key to all success. — Pablo Picasso",
    "Stay hungry, stay foolish. — Steve Jobs"
  ];

  // Use day of year to cycle through quotes
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start;
  var dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return quotes[dayOfYear % quotes.length];
}

/**
 * Posts the digest message to Slack via webhook.
 *
 * NOTE: If your existing script already has a Slack posting function,
 * you can replace this with a call to that function instead.
 */
function postDigestToSlack_(message) {
  // Use whichever webhook variable you have — update this line if needed
  var webhookUrl = typeof SLACK_WEBHOOK_URL !== 'undefined' ? SLACK_WEBHOOK_URL : DIGEST_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    Logger.log('ERROR: No Slack webhook URL configured. Set DIGEST_WEBHOOK_URL or SLACK_WEBHOOK_URL.');
    Logger.log('Message that would have been sent:\n' + message);
    return;
  }

  var payload = {
    text: message,
    unfurl_links: false,
    unfurl_media: false
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(webhookUrl, options);
    Logger.log('Slack digest posted: ' + response.getResponseCode());
  } catch(e) {
    Logger.log('Slack digest failed: ' + e.message);
  }
}


/**
 * MANUAL TEST — Run this from the editor to test without waiting for 9 AM.
 * It sends the digest right now.
 */
function testDailyDigest() {
  sendDailyDigest();
}
