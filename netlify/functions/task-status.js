// Netlify function — Task status reader/writer
// GET: Returns all task definitions + run history from task-log.json on GitHub
// POST: Logs a new run for a specific task (called by scheduled functions after they execute)
//
// POST body: { task: "kb-health-check", status: "success"|"error", details: "..." }
// Env vars: GitHubToken

const GITHUB_API = 'https://api.github.com';
const REPO = '/repos/2wice23/goodresults/contents';
const LOG_FILE = '/task-log.json';
const MAX_RUNS = 30; // keep last 30 runs per task

async function getTaskLog(token) {
  const res = await fetch(`${GITHUB_API}${REPO}${LOG_FILE}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!res.ok) return { data: null, sha: null };
  const json = await res.json();
  const content = Buffer.from(json.content, 'base64').toString('utf-8');
  return { data: JSON.parse(content), sha: json.sha };
}

async function updateTaskLog(token, data, sha) {
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  const res = await fetch(`${GITHUB_API}${REPO}${LOG_FILE}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update task log (automated)',
      content,
      sha
    })
  });
  return res.ok;
}

exports.handler = async function(event) {
  const token = process.env.GitHubToken;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'No GitHub token configured' }) };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // GET — return all task data
  if (event.httpMethod === 'GET') {
    const { data } = await getTaskLog(token);
    if (!data) {
      return { statusCode: 200, headers, body: JSON.stringify({ tasks: {} }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  }

  // POST — log a task run
  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
    }

    const { task, status, details } = body;
    if (!task || !status) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing task or status' }) };
    }

    const { data, sha } = await getTaskLog(token);
    if (!data || !sha) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Could not read task log' }) };
    }

    if (!data.tasks[task]) {
      return { statusCode: 404, headers, body: JSON.stringify({ error: `Unknown task: ${task}` }) };
    }

    // Add the new run entry
    const run = {
      timestamp: new Date().toISOString(),
      status,
      details: details || ''
    };

    data.tasks[task].runs.unshift(run); // newest first
    data.tasks[task].runs = data.tasks[task].runs.slice(0, MAX_RUNS); // cap history

    const updated = await updateTaskLog(token, data, sha);
    if (!updated) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to update task log' }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, run }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
