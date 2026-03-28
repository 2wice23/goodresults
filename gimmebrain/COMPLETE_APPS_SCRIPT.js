// ============================================================
//  GOOD RESULTS — CALL ANALYZER APPS SCRIPT (COMPLETE)
// ============================================================
//
//  This is the FULL script. Replace everything in your Apps
//  Script editor with this code.
//
//  SETUP:
//  1. Open your Google Sheet (gimmesheetbrain)
//  2. Extensions → Apps Script
//  3. Select ALL existing code → Delete it
//  4. Paste this ENTIRE file
//  5. Set your SLACK_WEBHOOK_URL below
//  6. Click Save
//  7. Deploy → New deployment → Web app
//     - Execute as: Me
//     - Who has access: Anyone
//     - Click Deploy → copy the new URL
//  8. Update APPS_SCRIPT_URL in analyzer.html if the URL changed
//  9. Run setupDailyDigestTrigger() ONE TIME from the editor
//     (Select it from the function dropdown → click Run → authorize)
//
// ============================================================


// ── CONFIG ──────────────────────────────────────────────────

var SLACK_WEBHOOK_URL = 'STORED_IN_NETLIFY_ENV_VARS';
// ↑ Webhook for #the-group-chat — actual URL in Netlify env: SLACK_WEBHOOK_URL

var SLACK_TRAINING_WEBHOOK = 'STORED_IN_NETLIFY_ENV_VARS';
// ↑ Webhook for #hack-the-planet — actual URL in Netlify env: SLACK_TRAINING_WEBHOOK

var TIMEZONE = 'America/Chicago';  // CDT — change if needed

// Sheet tab names — must match exactly what's in your spreadsheet
var SHEET_LEADERBOARD   = 'Leaderboard';
var SHEET_KB_POSITIVE   = 'KB_Positive';
var SHEET_KB_NEGATIVE   = 'KB_Negative';
var SHEET_KB_ADDITIONS  = 'KB_Additions';
var SHEET_CALL_REPORTS  = 'CallReports';
var SHEET_TRAINING      = 'TrainingScores';


// ============================================================
//  WEB APP ENTRY POINTS
// ============================================================

/**
 * Handles all GET requests from the analyzer.
 * Actions: get (leaderboard), getKB, update, addKBBatch
 */
function doGet(e) {
  var action = (e.parameter.action || '').toLowerCase();

  try {
    if (action === 'get') {
      return jsonResponse_(getLeaderboard_());
    }

    if (action === 'getkb') {
      return jsonResponse_(getKB_());
    }

    if (action === 'update') {
      var agent = e.parameter.agent || '';
      var score = parseFloat(e.parameter.score) || 0;
      if (agent) updateLeaderboard_(agent, score);
      return jsonResponse_({ status: 'ok' });
    }

    if (action === 'gettrainingprogress') {
      return jsonResponse_(getTrainingProgress_());
    }

    if (action === 'getmoduleprogress') {
      var tAgent = e.parameter.agent || '';
      var tModule = parseInt(e.parameter.module) || 0;
      return jsonResponse_(getModuleProgress_(tAgent, tModule));
    }

    if (action === 'addkbbatch') {
      var callId    = e.parameter.callid || '';
      var kbAgent   = e.parameter.agent || '';
      var kbScore   = e.parameter.grade || '';
      var callType  = e.parameter.calltype || '';
      var sentiment = e.parameter.sentiment || 'positive';
      var examples  = e.parameter.examples || '[]';
      addKBBatch_(callId, kbAgent, kbScore, callType, sentiment, examples);
      return jsonResponse_({ status: 'ok' });
    }

    return jsonResponse_({ error: 'Unknown action: ' + action });

  } catch (err) {
    return jsonResponse_({ error: err.message });
  }
}

/**
 * Handles all POST requests from the analyzer.
 * Actions: postToSlack, addCallReport, addKnowledge
 */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = (body.action || '').toLowerCase();

    if (action === 'posttoslack') {
      postCallToSlack_(body.report, body.avg);
      return jsonResponse_({ status: 'ok' });
    }

    if (action === 'addcallreport') {
      addCallReport_(body);
      return jsonResponse_({ status: 'ok' });
    }

    if (action === 'addknowledge') {
      addKnowledge_(body);
      return jsonResponse_({ status: 'ok' });
    }

    if (action === 'modulecomplete') {
      saveModuleScore_(body);
      return jsonResponse_({ status: 'ok' });
    }

    return jsonResponse_({ error: 'Unknown action: ' + action });

  } catch (err) {
    return jsonResponse_({ error: err.message });
  }
}


// ============================================================
//  LEADERBOARD
// ============================================================

/**
 * Returns leaderboard data as array of objects.
 * Format: [{ agent_name, total_calls, avg }, ...]
 */
function getLeaderboard_() {
  var sheet = getOrCreateSheet_(SHEET_LEADERBOARD, ['agent_name', 'total_calls', 'total_score']);
  var data = sheet.getDataRange().getValues();
  var result = [];

  for (var r = 1; r < data.length; r++) {
    var name = String(data[r][0]).trim();
    var calls = parseInt(data[r][1]) || 0;
    var totalScore = parseFloat(data[r][2]) || 0;
    if (!name || calls === 0) continue;
    result.push({
      agent_name: name,
      total_calls: calls,
      avg: (totalScore / calls).toFixed(1)
    });
  }

  result.sort(function(a, b) { return parseFloat(b.avg) - parseFloat(a.avg); });
  return result;
}

/**
 * Updates an agent's leaderboard entry (adds score to running total).
 */
function updateLeaderboard_(agent, score) {
  var sheet = getOrCreateSheet_(SHEET_LEADERBOARD, ['agent_name', 'total_calls', 'total_score']);
  var data = sheet.getDataRange().getValues();
  var found = false;

  for (var r = 1; r < data.length; r++) {
    if (String(data[r][0]).trim().toLowerCase() === agent.trim().toLowerCase()) {
      var calls = (parseInt(data[r][1]) || 0) + 1;
      var total = (parseFloat(data[r][2]) || 0) + score;
      sheet.getRange(r + 1, 2).setValue(calls);
      sheet.getRange(r + 1, 3).setValue(total);
      found = true;
      break;
    }
  }

  if (!found) {
    sheet.appendRow([agent.trim(), 1, score]);
  }
}


// ============================================================
//  TRAINING MODULE SCORES
// ============================================================

/**
 * Saves a module quiz attempt to the TrainingScores sheet.
 * Body fields: agent, email, module, moduleTitle, score, correct, total, xp, poolSize, correctIndices, date
 */
function saveModuleScore_(body) {
  var sheet = getOrCreateSheet_(SHEET_TRAINING, [
    'timestamp','email','agent_name','module','module_title',
    'score_pct','correct','total','xp','correct_indices','pool_size'
  ]);
  var agent         = String(body.agent || '').trim();
  var email         = String(body.email || '').trim();
  var moduleNum     = parseInt(body.module) || 0;
  var moduleTitle   = String(body.moduleTitle || '');
  var scorePct      = parseFloat(body.score) || 0;
  var correct       = parseInt(body.correct) || 0;
  var total         = parseInt(body.total) || 0;
  var xp            = parseInt(body.xp) || 0;
  var poolSize      = parseInt(body.poolSize) || total;
  var correctIndices = body.correctIndices || [];
  var correctIdxStr = JSON.stringify(correctIndices);

  sheet.appendRow([
    new Date(), email, agent, moduleNum, moduleTitle,
    scorePct, correct, total, xp, correctIdxStr, poolSize
  ]);

  // ── Post to Slack (#the-group-chat) ──
  try {
    postTrainingToSlack_(agent, moduleNum, moduleTitle, scorePct, correct, total, poolSize, correctIndices);
  } catch(err) {
    // Don't fail the save if Slack post fails
    Logger.log('Slack training post error: ' + err.message);
  }
}

/**
 * Posts a training update to #the-group-chat with competitive flair.
 */
function postTrainingToSlack_(agent, moduleNum, moduleTitle, scorePct, correct, total, poolSize, correctIndices) {
  if (!SLACK_TRAINING_WEBHOOK || SLACK_TRAINING_WEBHOOK === 'PASTE_YOUR_TRAINING_WEBHOOK_HERE') return;

  var masteredCount = correctIndices.length;
  var fullyMastered = (poolSize > 0 && masteredCount >= poolSize);

  // Get standings for competitive context
  var standings = getTrainingStandings_();
  var myStanding = null;
  var rank = 0;
  for (var i = 0; i < standings.length; i++) {
    if (standings[i].name.toLowerCase() === agent.toLowerCase()) {
      myStanding = standings[i];
      rank = i + 1;
      break;
    }
  }

  var blocks = [];

  // ── Score line ──
  var emoji = scorePct === 100 ? ':100:' : scorePct >= 80 ? ':fire:' : scorePct >= 60 ? ':dart:' : ':muscle:';
  var scoreLine = emoji + '  *' + agent + '* just scored *' + scorePct + '%* on Module ' + moduleNum + ': ' + moduleTitle;
  scoreLine += '\n      ' + correct + '/' + total + ' correct this round  ·  ' + masteredCount + '/' + poolSize + ' total questions mastered in this module';
  blocks.push({ type: 'section', text: { type: 'mrkdwn', text: scoreLine } });

  // ── Module mastery celebration ──
  if (fullyMastered) {
    var masteryLine = ':trophy:  *MODULE MASTERED!*  ' + agent + ' just answered every single question correctly in Module ' + moduleNum + ': ' + moduleTitle + '!';
    masteryLine += '\n      That\'s ' + poolSize + '/' + poolSize + ' questions. Locked in. :lock:';
    blocks.push({ type: 'divider' });
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: masteryLine } });
  }

  // ── Competitive context ──
  if (standings.length > 1 && myStanding) {
    var compLine = '';

    if (rank === 1) {
      var second = standings.length > 1 ? standings[1] : null;
      var gap = second ? (myStanding.totalMastered - second.totalMastered) : 0;
      if (gap <= 3 && second) {
        compLine = ':eyes:  ' + agent + ' is #1 but *' + second.name + ' is only ' + gap + ' question' + (gap !== 1 ? 's' : '') + ' behind.* This is tight.';
      } else if (gap > 3 && second) {
        compLine = ':crown:  ' + agent + ' is running the board with *' + myStanding.totalMastered + ' questions mastered.* ' + second.name + ' has ' + second.totalMastered + '. The gap is ' + gap + '.';
      } else {
        compLine = ':crown:  ' + agent + ' leads with *' + myStanding.totalMastered + ' questions mastered.*';
      }
    } else {
      var leader = standings[0];
      var gapToTop = leader.totalMastered - myStanding.totalMastered;
      if (gapToTop <= 5) {
        compLine = ':zap:  ' + agent + ' is *' + gapToTop + ' question' + (gapToTop !== 1 ? 's' : '') + ' behind ' + leader.name + '.* This could flip any quiz.';
      } else if (gapToTop <= 15) {
        compLine = ':chart_with_upwards_trend:  ' + agent + ' is closing in — *' + gapToTop + ' questions behind ' + leader.name + '.* Momentum is building.';
      } else {
        compLine = ':runner:  ' + agent + ' has ' + myStanding.totalMastered + ' questions mastered. ' + leader.name + ' leads with ' + leader.totalMastered + '. Gap: ' + gapToTop + '. Time to grind.';
      }

      // Check if they just passed someone
      if (rank < standings.length) {
        var justPassed = standings[rank]; // person now below them
        if (justPassed && myStanding.totalMastered > justPassed.totalMastered && myStanding.totalMastered - justPassed.totalMastered <= 3) {
          compLine += '\n      :rotating_light: *' + agent + ' just passed ' + justPassed.name + '!* New rank: #' + rank;
        }
      }
    }

    if (compLine) {
      blocks.push({ type: 'divider' });
      blocks.push({ type: 'section', text: { type: 'mrkdwn', text: compLine } });
    }

    // ── Mini standings ──
    var standingsLine = ':bar_chart: *Standings:*  ';
    for (var s = 0; s < Math.min(standings.length, 5); s++) {
      var prefix = s === 0 ? ':first_place_medal: ' : s === 1 ? ':second_place_medal: ' : s === 2 ? ':third_place_medal: ' : '#' + (s + 1) + ' ';
      standingsLine += prefix + standings[s].name + ' (' + standings[s].totalMastered + ')';
      if (s < Math.min(standings.length, 5) - 1) standingsLine += '  ·  ';
    }
    blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: standingsLine }] });
  }

  // Send it
  var payload = { blocks: blocks };
  UrlFetchApp.fetch(SLACK_TRAINING_WEBHOOK, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

/**
 * Returns simplified standings sorted by total mastered (desc).
 * Format: [{name, totalMastered, modulesStarted}]
 */
function getTrainingStandings_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TRAINING);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var agents = {};

  for (var r = 1; r < data.length; r++) {
    var agent = String(data[r][2]).trim();
    if (!agent) continue;
    var modNum = parseInt(data[r][3]) || 0;
    if (!modNum) continue;

    var key = agent.toLowerCase();
    if (!agents[key]) agents[key] = { name: agent, mastered: {}, modulesStarted: {} };

    // Accumulate mastered indices per module
    try {
      var indices = JSON.parse(data[r][9] || '[]');
      if (!agents[key].mastered[modNum]) agents[key].mastered[modNum] = [];
      for (var i = 0; i < indices.length; i++) {
        if (agents[key].mastered[modNum].indexOf(indices[i]) === -1) {
          agents[key].mastered[modNum].push(indices[i]);
        }
      }
      agents[key].modulesStarted[modNum] = true;
    } catch(e) {}
  }

  var result = [];
  for (var k in agents) {
    var a = agents[k];
    var totalMastered = 0;
    for (var m in a.mastered) totalMastered += a.mastered[m].length;
    result.push({
      name: a.name,
      totalMastered: totalMastered,
      modulesStarted: Object.keys(a.modulesStarted).length
    });
  }

  result.sort(function(a, b) { return b.totalMastered - a.totalMastered || b.modulesStarted - a.modulesStarted; });
  return result;
}

/**
 * Returns training progress for all agents.
 * Format: [{name, email, modules: {1: {best_score, mastered, pool_size, attempts}, ...}}]
 */
function getTrainingProgress_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TRAINING);
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data    = sheet.getDataRange().getValues();
  var agents  = {};

  for (var r = 1; r < data.length; r++) {
    var email     = String(data[r][1]).trim();
    var agent     = String(data[r][2]).trim();
    var modNum    = parseInt(data[r][3]) || 0;
    var scorePct  = parseFloat(data[r][5]) || 0;
    var poolSize  = parseInt(data[r][10]) || 0;
    if (!agent || !modNum) continue;

    var masteredList = [];
    try { masteredList = JSON.parse(data[r][9] || '[]'); } catch(e) {}

    var key = agent.toLowerCase();
    if (!agents[key]) agents[key] = { name: agent, email: email, modules: {} };
    if (!agents[key].modules[modNum]) {
      agents[key].modules[modNum] = { best_score: 0, mastered: [], pool_size: 0, attempts: 0 };
    }

    var mod = agents[key].modules[modNum];
    mod.attempts++;
    if (scorePct > mod.best_score) mod.best_score = scorePct;
    if (poolSize > mod.pool_size) mod.pool_size = poolSize;

    // Union: accumulate all correctly-answered pool indices across all attempts
    for (var i = 0; i < masteredList.length; i++) {
      if (mod.mastered.indexOf(masteredList[i]) === -1) {
        mod.mastered.push(masteredList[i]);
      }
    }
  }

  return Object.values(agents);
}

/**
 * Returns which QUIZ_POOL indices a given agent has already mastered for a module.
 * Format: { mastered: [0, 2, 5, ...] }
 */
function getModuleProgress_(agent, moduleNum) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TRAINING);
  if (!sheet || sheet.getLastRow() <= 1 || !agent || !moduleNum) return { mastered: [] };

  var data     = sheet.getDataRange().getValues();
  var mastered = [];
  var agentLow = agent.trim().toLowerCase();

  for (var r = 1; r < data.length; r++) {
    var rowAgent  = String(data[r][2]).trim().toLowerCase();
    var rowModule = parseInt(data[r][3]) || 0;
    if (rowAgent !== agentLow || rowModule !== moduleNum) continue;

    try {
      var indices = JSON.parse(data[r][9] || '[]');
      for (var i = 0; i < indices.length; i++) {
        if (mastered.indexOf(indices[i]) === -1) mastered.push(indices[i]);
      }
    } catch(e) {}
  }

  return { mastered: mastered };
}


// ============================================================
//  KNOWLEDGE BASE
// ============================================================

/**
 * Returns all KB data for the analyzer to sync.
 * Format: { positive: [...], negative: [...], reknowledge: [...] }
 */
function getKB_() {
  var result = { positive: [], negative: [], reknowledge: [] };

  // KB_Positive
  var posSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_KB_POSITIVE);
  if (posSheet && posSheet.getLastRow() > 1) {
    var posData = posSheet.getDataRange().getValues();
    var posHeaders = posData[0];
    var exCol = findCol_(posHeaders, ['examples', 'example', 'text']);
    for (var r = 1; r < posData.length; r++) {
      var val = exCol >= 0 ? posData[r][exCol] : posData[r][posData[0].length - 1];
      if (!val) continue;
      try {
        var parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          for (var i = 0; i < parsed.length; i++) {
            if (parsed[i]) result.positive.push(String(parsed[i]));
          }
          continue;
        }
      } catch(e) {}
      result.positive.push(String(val));
    }
  }

  // KB_Negative
  var negSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_KB_NEGATIVE);
  if (negSheet && negSheet.getLastRow() > 1) {
    var negData = negSheet.getDataRange().getValues();
    var negHeaders = negData[0];
    var negExCol = findCol_(negHeaders, ['examples', 'example', 'text']);
    for (var r2 = 1; r2 < negData.length; r2++) {
      var val2 = negExCol >= 0 ? negData[r2][negExCol] : negData[r2][negData[0].length - 1];
      if (!val2) continue;
      try {
        var parsed2 = JSON.parse(val2);
        if (Array.isArray(parsed2)) {
          for (var i2 = 0; i2 < parsed2.length; i2++) {
            if (parsed2[i2]) result.negative.push(String(parsed2[i2]));
          }
          continue;
        }
      } catch(e) {}
      result.negative.push(String(val2));
    }
  }

  // KB_Additions (field knowledge / reknowledge)
  var addSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_KB_ADDITIONS);
  if (addSheet && addSheet.getLastRow() > 1) {
    var addData = addSheet.getDataRange().getValues();
    var addHeaders = addData[0];
    var addKnCol = findCol_(addHeaders, ['knowledge', 'items', 'insight', 'text']);
    for (var r3 = 1; r3 < addData.length; r3++) {
      var val3 = addKnCol >= 0 ? addData[r3][addKnCol] : addData[r3][addData[0].length - 1];
      if (!val3) continue;
      try {
        var parsed3 = JSON.parse(val3);
        if (Array.isArray(parsed3)) {
          for (var i3 = 0; i3 < parsed3.length; i3++) {
            if (parsed3[i3]) result.reknowledge.push(String(parsed3[i3]));
          }
          continue;
        }
      } catch(e) {}
      result.reknowledge.push(String(val3));
    }
  }

  // Cap at reasonable sizes
  result.positive = result.positive.slice(0, 60);
  result.negative = result.negative.slice(0, 60);
  result.reknowledge = result.reknowledge.slice(0, 80);

  return result;
}

/**
 * Adds KB examples (positive or negative) from the analyzer.
 */
function addKBBatch_(callId, agent, score, callType, sentiment, examplesJson) {
  var sheetName = sentiment === 'negative' ? SHEET_KB_NEGATIVE : SHEET_KB_POSITIVE;
  var sheet = getOrCreateSheet_(sheetName, ['timestamp', 'callid', 'agent', 'score', 'calltype', 'sentiment', 'examples']);

  sheet.appendRow([
    new Date().toISOString(),
    callId,
    agent,
    score,
    callType,
    sentiment,
    examplesJson
  ]);
}


// ============================================================
//  CALL REPORTS
// ============================================================

/**
 * Stores a full call report from the analyzer.
 */
function addCallReport_(body) {
  var sheet = getOrCreateSheet_(SHEET_CALL_REPORTS, [
    'timestamp', 'id', 'agent', 'realtor', 'call_type', 'duration',
    'call_date', 'score', 'realtor_engagement', 'summary',
    'what_worked', 'what_to_tighten', 'language_flags',
    'missed_opportunities', 'positive_moments', 'resistance_moments',
    'script_moment', 'on_leaderboard'
  ]);

  sheet.appendRow([
    body.timestamp || new Date().toISOString(),
    body.id || '',
    body.agent || '',
    body.realtor || '',
    body.call_type || '',
    body.duration || '',
    body.call_date || '',
    body.score || 0,
    body.realtor_engagement || 0,
    body.summary || '',
    body.what_worked || '',
    body.what_to_tighten || '',
    body.language_flags || '',
    body.missed_opportunities || '',
    body.positive_moments || '',
    body.resistance_moments || '',
    body.script_moment || '',
    body.on_leaderboard || 'yes'
  ]);
}


// ============================================================
//  EXTRACTED KNOWLEDGE
// ============================================================

/**
 * Stores extracted real estate knowledge from a call.
 */
function addKnowledge_(body) {
  var sheet = getOrCreateSheet_(SHEET_KB_ADDITIONS, [
    'timestamp', 'agent', 'call_date', 'call_type', 'knowledge'
  ]);

  var items = body.items || [];
  if (!Array.isArray(items) || items.length === 0) return;

  sheet.appendRow([
    new Date().toISOString(),
    body.agent || '',
    body.call_date || '',
    body.call_type || '',
    JSON.stringify(items)
  ]);
}


// ============================================================
//  SLACK — INDIVIDUAL CALL POSTS
// ============================================================

/**
 * Posts an individual call report to Slack immediately after analysis.
 */
function postCallToSlack_(report, score) {
  if (!SLACK_WEBHOOK_URL || SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') return;
  if (!report) return;

  var s = parseInt(score) || 0;
  var emoji = s >= 85 ? ':star:' : s >= 70 ? ':white_check_mark:' : s >= 50 ? ':large_blue_circle:' : ':red_circle:';

  var msg = emoji + ' *Call Analyzed* — ' + (report.agent_name || 'Unknown') + ' → ' + (report.realtor_name || 'Unknown Realtor') + '\n';
  msg += '*Score: ' + s + '/100* · ' + (report.call_type || '') + ' · ' + (report.duration || '') + '\n';
  msg += (report.summary || '') + '\n';

  // What worked
  if (report.what_worked && report.what_worked.length > 0) {
    var worked = Array.isArray(report.what_worked) ? report.what_worked : [report.what_worked];
    msg += '\n:white_check_mark: *What Worked:*\n';
    for (var w = 0; w < Math.min(worked.length, 3); w++) {
      msg += '• ' + worked[w] + '\n';
    }
  }

  // What to tighten
  if (report.what_to_tighten && report.what_to_tighten.length > 0) {
    var tighten = Array.isArray(report.what_to_tighten) ? report.what_to_tighten : [report.what_to_tighten];
    msg += '\n:arrow_right: *What to Tighten:*\n';
    for (var t = 0; t < Math.min(tighten.length, 3); t++) {
      msg += '• ' + tighten[t] + '\n';
    }
  }

  // Language flags
  if (report.language_flags && report.language_flags.length > 0) {
    var flags = Array.isArray(report.language_flags) ? report.language_flags : [report.language_flags];
    if (flags.length > 0 && flags[0]) {
      msg += '\n:warning: *Language Flags:* ' + flags.join(', ') + '\n';
    }
  }

  // Coaching moment
  if (report.recommended_script_moment) {
    msg += '\n:bulb: *Coaching Moment:* _' + report.recommended_script_moment + '_\n';
  }

  // Engagement
  if (report.realtor_engagement) {
    var eng = report.realtor_engagement;
    var engScore = typeof eng === 'object' ? (eng.score || 0) : (parseInt(eng) || 0);
    var engEmoji = engScore >= 85 ? ':fire:' : engScore >= 70 ? ':thumbsup:' : engScore >= 50 ? ':neutral_face:' : ':cold_face:';
    msg += '\n' + engEmoji + ' *Realtor Engagement: ' + engScore + '/100*';
    if (typeof eng === 'object' && eng.note) {
      msg += ' — ' + eng.note;
    }
    msg += '\n';
  }

  msg += '\n_Analyzed at goodresults.org/gimmebrain/analyzer_';

  postToSlack_(msg);
}


// ============================================================
//  DAILY DIGEST
// ============================================================

/**
 * SETUP — Run this ONE TIME from the Apps Script editor.
 * Creates a daily trigger that fires sendDailyDigest() at 9 AM.
 */
function setupDailyDigestTrigger() {
  // Remove any existing digest triggers to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendDailyDigest') {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  ScriptApp.newTrigger('sendDailyDigest')
    .timeBased()
    .everyDays(1)
    .atHour(9)
    .nearMinute(0)
    .inTimezone(TIMEZONE)
    .create();

  Logger.log('Daily digest trigger created for 9:00 AM ' + TIMEZONE);
}

/**
 * MAIN DIGEST — Builds and posts the daily morning briefing to Slack.
 * Runs automatically at 9 AM, or call testDailyDigest() to test manually.
 */
function sendDailyDigest() {
  if (!SLACK_WEBHOOK_URL || SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    Logger.log('ERROR: Set SLACK_WEBHOOK_URL before running the digest.');
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Gather data
  var leaderboard  = getLeaderboard_();
  var recentCalls  = getRecentCallReports_(ss, 24);
  var kbLearnings  = getRecentKBLearnings_(ss, 24);
  var kbAdditions  = getRecentKBAdditions_(ss, 24);
  var kbTotals     = getKBTotals_(ss);

  var today     = Utilities.formatDate(new Date(), TIMEZONE, 'MMMM d, yyyy');
  var dayOfWeek = Utilities.formatDate(new Date(), TIMEZONE, 'EEEE');

  var msg = '';

  // ── HEADER ──
  msg += ':trophy: *GOOD RESULTS — MORNING BRIEFING*\n';
  msg += dayOfWeek + ', ' + today + '\n';
  msg += '<!channel>\n\n';
  msg += '_"' + getDailyQuote_() + '"_\n\n';

  // ── LEADERBOARD ──
  msg += ':bar_chart: *CALL ANALYZER LEADERBOARD*\n';
  if (leaderboard.length === 0) {
    msg += 'No scores yet — be the first to submit a call.\n';
  } else {
    for (var i = 0; i < leaderboard.length; i++) {
      var a = leaderboard[i];
      var lbEmoji = i === 0 ? ':first_place_medal:' : i === 1 ? ':second_place_medal:' : i === 2 ? ':third_place_medal:' : '#' + (i + 1);
      msg += lbEmoji + ' ' + a.agent_name + ' · ' + a.total_calls + ' calls · avg ' + Math.round(parseFloat(a.avg)) + '/100\n';
    }
  }
  msg += '_Submit your calls at goodresults.org/gimmebrain/analyzer_\n\n';

  // ── WHAT WE LEARNED YESTERDAY ──
  msg += ':brain: *WHAT WE LEARNED YESTERDAY*\n';
  var hasLearnings = false;

  if (kbLearnings.positive.length > 0) {
    msg += '\n:white_check_mark: *What\'s Landing With Realtors:*\n';
    var posShow = kbLearnings.positive.slice(0, 5);
    for (var p = 0; p < posShow.length; p++) {
      msg += '• ' + cleanKBForSlack_(posShow[p]) + '\n';
    }
    if (kbLearnings.positive.length > 5) {
      msg += '_...and ' + (kbLearnings.positive.length - 5) + ' more positive patterns_\n';
    }
    hasLearnings = true;
  }

  if (kbLearnings.negative.length > 0) {
    msg += '\n:warning: *What\'s Killing Engagement:*\n';
    var negShow = kbLearnings.negative.slice(0, 5);
    for (var n = 0; n < negShow.length; n++) {
      msg += '• ' + cleanKBForSlack_(negShow[n]) + '\n';
    }
    if (kbLearnings.negative.length > 5) {
      msg += '_...and ' + (kbLearnings.negative.length - 5) + ' more patterns flagged_\n';
    }
    hasLearnings = true;
  }

  if (kbAdditions.length > 0) {
    msg += '\n:mag: *Field Intelligence:*\n';
    var insShow = kbAdditions.slice(0, 3);
    for (var k = 0; k < insShow.length; k++) {
      msg += '• ' + insShow[k] + '\n';
    }
    if (kbAdditions.length > 3) {
      msg += '_...and ' + (kbAdditions.length - 3) + ' more field insights_\n';
    }
    hasLearnings = true;
  }

  if (!hasLearnings) {
    msg += '_No new patterns learned yesterday. Analyze more calls to grow the KB._\n';
  }

  msg += '\n:books: *KB Health:* ' + kbTotals.positive + ' positive · ' + kbTotals.negative + ' negative · ' + kbTotals.additions + ' field insights\n\n';

  // ── YESTERDAY'S ANALYZED CALLS ──
  msg += ':telephone_receiver: *YESTERDAY\'S ANALYZED CALLS*\n';
  if (recentCalls.length === 0) {
    msg += '_No calls analyzed yesterday._\n';
  } else {
    var byAgent = {};
    for (var c = 0; c < recentCalls.length; c++) {
      var call = recentCalls[c];
      if (!byAgent[call.agent]) byAgent[call.agent] = { calls: [], totalScore: 0 };
      byAgent[call.agent].calls.push(call);
      byAgent[call.agent].totalScore += call.score;
    }

    var summaries = [];
    for (var agentName in byAgent) {
      var d = byAgent[agentName];
      summaries.push({
        name: agentName,
        count: d.calls.length,
        avg: Math.round(d.totalScore / d.calls.length)
      });
    }
    summaries.sort(function(a, b) { return b.count - a.count; });

    for (var s = 0; s < summaries.length; s++) {
      var ag = summaries[s];
      var cEmoji = ag.avg >= 85 ? ':star:' : ag.avg >= 70 ? ':white_check_mark:' : ag.avg >= 50 ? ':large_blue_circle:' : ':red_circle:';
      msg += ag.name + ': ' + ag.count + ' call' + (ag.count !== 1 ? 's' : '') + ' analyzed · avg ' + ag.avg + '/100 ' + cEmoji + '\n';
    }

    // Top coaching moment from lowest-scoring call
    var bestMoment = null;
    var lowestScore = 999;
    for (var m = 0; m < recentCalls.length; m++) {
      if (recentCalls[m].scriptMoment && recentCalls[m].score < lowestScore) {
        lowestScore = recentCalls[m].score;
        bestMoment = recentCalls[m];
      }
    }
    if (bestMoment) {
      msg += '\n:bulb: *Top Coaching Moment:*\n';
      msg += '_' + bestMoment.agent + ' (' + bestMoment.callType + '):_ ' + bestMoment.scriptMoment + '\n';
    }
  }

  msg += '\nLet\'s get after it today :muscle:';

  postToSlack_(msg);
  Logger.log('Daily digest posted to Slack');
}

/**
 * Run this manually to test the digest without waiting for 9 AM.
 */
function testDailyDigest() {
  sendDailyDigest();
}


// ============================================================
//  DIGEST HELPER FUNCTIONS
// ============================================================

/**
 * Gets call reports from the last N hours.
 */
function getRecentCallReports_(ss, hours) {
  var sheet = ss.getSheetByName(SHEET_CALL_REPORTS);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var tsCol      = findCol_(headers, ['timestamp', 'date']);
  var agentCol   = findCol_(headers, ['agent', 'agent_name']);
  var scoreCol   = findCol_(headers, ['score', 'overall_score']);
  var typeCol    = findCol_(headers, ['call_type', 'calltype']);
  var scriptCol  = findCol_(headers, ['script_moment']);
  var engCol     = findCol_(headers, ['realtor_engagement']);

  var cutoff = new Date().getTime() - (hours * 60 * 60 * 1000);
  var recent = [];

  for (var r = 1; r < data.length; r++) {
    var ts = data[r][tsCol >= 0 ? tsCol : 0];
    var rowDate = ts instanceof Date ? ts : new Date(ts);
    if (isNaN(rowDate.getTime()) || rowDate.getTime() < cutoff) continue;

    recent.push({
      agent:        agentCol >= 0 ? String(data[r][agentCol]).trim() : 'Unknown',
      score:        scoreCol >= 0 ? (parseFloat(data[r][scoreCol]) || 0) : 0,
      callType:     typeCol >= 0 ? String(data[r][typeCol]).trim() : '',
      scriptMoment: scriptCol >= 0 ? String(data[r][scriptCol]).trim() : '',
      engagement:   engCol >= 0 ? (parseFloat(data[r][engCol]) || 0) : 0
    });
  }

  return recent;
}

/**
 * Gets KB positive + negative entries from the last N hours.
 */
function getRecentKBLearnings_(ss, hours) {
  var cutoff = new Date().getTime() - (hours * 60 * 60 * 1000);
  var result = { positive: [], negative: [] };

  var sheets = [
    { name: SHEET_KB_POSITIVE, target: 'positive' },
    { name: SHEET_KB_NEGATIVE, target: 'negative' }
  ];

  for (var s = 0; s < sheets.length; s++) {
    var sheet = ss.getSheetByName(sheets[s].name);
    if (!sheet || sheet.getLastRow() < 2) continue;

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var tsCol = findCol_(headers, ['timestamp', 'date', 'created']);
    var exCol = findCol_(headers, ['examples', 'example', 'text']);

    for (var r = 1; r < data.length; r++) {
      var ts = data[r][tsCol >= 0 ? tsCol : 0];
      var rowDate = ts instanceof Date ? ts : new Date(ts);
      if (isNaN(rowDate.getTime()) || rowDate.getTime() < cutoff) continue;

      var val = exCol >= 0 ? data[r][exCol] : data[r][data[0].length - 1];
      if (!val) continue;

      try {
        var parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          for (var i = 0; i < parsed.length; i++) {
            if (parsed[i]) result[sheets[s].target].push(String(parsed[i]));
          }
          continue;
        }
      } catch(e) {}
      result[sheets[s].target].push(String(val));
    }
  }

  return result;
}

/**
 * Gets field knowledge additions from the last N hours.
 */
function getRecentKBAdditions_(ss, hours) {
  var sheet = ss.getSheetByName(SHEET_KB_ADDITIONS);
  if (!sheet || sheet.getLastRow() < 2) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var tsCol = findCol_(headers, ['timestamp', 'date', 'created']);
  var knCol = findCol_(headers, ['knowledge', 'items', 'insight', 'text']);

  var cutoff = new Date().getTime() - (hours * 60 * 60 * 1000);
  var results = [];

  for (var r = 1; r < data.length; r++) {
    var ts = data[r][tsCol >= 0 ? tsCol : 0];
    var rowDate = ts instanceof Date ? ts : new Date(ts);
    if (isNaN(rowDate.getTime()) || rowDate.getTime() < cutoff) continue;

    var val = knCol >= 0 ? data[r][knCol] : data[r][data[0].length - 1];
    if (!val) continue;

    try {
      var parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        for (var i = 0; i < parsed.length; i++) {
          if (parsed[i] && String(parsed[i]).trim()) results.push(String(parsed[i]).trim());
        }
        continue;
      }
    } catch(e) {}
    results.push(String(val).trim());
  }

  return results;
}

/**
 * Gets total row counts across KB sheets.
 */
function getKBTotals_(ss) {
  var totals = { positive: 0, negative: 0, additions: 0 };

  var pos = ss.getSheetByName(SHEET_KB_POSITIVE);
  if (pos) totals.positive = Math.max(0, pos.getLastRow() - 1);

  var neg = ss.getSheetByName(SHEET_KB_NEGATIVE);
  if (neg) totals.negative = Math.max(0, neg.getLastRow() - 1);

  var add = ss.getSheetByName(SHEET_KB_ADDITIONS);
  if (add) totals.additions = Math.max(0, add.getLastRow() - 1);

  return totals;
}

/**
 * Cleans a KB example for Slack display.
 * Strips the [Agent — CallType — Score X/100]: prefix.
 */
function cleanKBForSlack_(text) {
  var str = String(text).trim();
  var match = str.match(/^\[([^\]]+)\]:\s*(.+)$/);
  if (match) {
    var parts = match[1].split('—').map(function(s) { return s.trim(); });
    return parts[0] + ': ' + match[2];
  }
  return str;
}


// ============================================================
//  SHARED UTILITIES
// ============================================================

/**
 * Returns a JSON ContentService response.
 */
function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Gets a sheet by name, or creates it with headers if it doesn't exist.
 */
function getOrCreateSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }
  }
  return sheet;
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
 * Posts a message to Slack via webhook.
 */
function postToSlack_(message) {
  if (!SLACK_WEBHOOK_URL || SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
    Logger.log('Slack webhook not configured. Message:\n' + message);
    return;
  }

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      text: message,
      unfurl_links: false,
      unfurl_media: false
    }),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
    Logger.log('Slack post: ' + response.getResponseCode());
  } catch(e) {
    Logger.log('Slack post failed: ' + e.message);
  }
}

/**
 * Motivational quotes that rotate daily.
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

  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return quotes[dayOfYear % quotes.length];
}
