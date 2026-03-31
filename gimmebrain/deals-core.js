// ============================================================
// deals-core.js — Shared utilities for Deal Dashboard + Deal Generator
// Good Results LLC
// ============================================================

// ── Constants ──

const GITHUB_REPO   = '2wice23/goodresults';
const GITHUB_PROXY  = '/.netlify/functions/github-proxy';
const SITE_BASE     = 'https://www.goodresults.org';
const CLOSE_PROXY   = '/.netlify/functions/close-proxy';
const CLOSE_PIPELINE = 'pipe_1P0GjK0TFer4Yw2rbArK0u';

// Close CRM opportunity custom fields — master map
const CF = {
  address:              'cf_NdiIYfY11hv4MI2EccVt1UBe7hc3UcrPFVJn44F9AuT',
  ask:                  'cf_vjCMz4xV8VVONcfII1tqKNbrw4WhRCU80PmVBYdHvdv',
  arv:                  'cf_I31MKYiLvGaKZIifqfVQxkjMjhpkrImNP1q7DQOQxUZ',
  mao:                  'cf_BKzKEuNx4uGjjJpV78goMM7Duovz630H3Hse3z4mjZC',
  onMarket:             'cf_deI0gLpduQLEzquwHGcsaOcwJfxsLmDOszUCkP7r2yU',
  closingCosts:         'cf_I382twtiVhhsQ57v5x0ZoQ65zESufG7qM6FOQvoTbFp',
  officialOfferPrice:   'cf_geYAfr1h8XVC3x0bzMIEf0Aj6580oaFQ39wdLAJ2Gqe',
  emdAmount:            'cf_SOdFoDCrSlKj3uJlxR1Yv0vP1LrlyGatZVmtgDOqIcj',
  coeDate:              'cf_0maXpCwRBInrLrsfyJOPVZPDTTipRetz10WGJz2ptDO',
  acceptedDate:         'cf_EVnxq4atDCF6u1Ohl13HCad8mAGiK4RijRqhBJrZNzg',
  ddEndDate:            'cf_dYuh3zK6om5wx7DazAPdoknMZI1083pJ9Xfon6vdmYf',
  emdDueDate:           'cf_v7RDgaN83GrYYyUPjwry71a2COpLSEhM0Dn7Lbs4Vn7',
  currentContractPrice: 'cf_lnzdav3LInFjRAbyUATuFShueu7pIaFebA988JE8H91',
  wholesalePrice:       'cf_MDzK5zNGLLLUE9yYYWqubvC3hFzDeKA8m4ta6p8OPhx',
  dealId:               'cf_mtdd9aMAiHZ8NfSByhliIPFJ2AEkXMGDRCZabKHEI8T'
};

// Dispo SMS template IDs
const TEASER_TMPL   = 'smstmpl_5TJvHLXfVDqBV5c5D4a1MZ';
const FOLLOWUP_TMPL = 'smstmpl_3GVufkhASUv2ao47VskWV2';
const NUDGE_TMPL    = 'smstmpl_5gHTK848OX3hK9WP1cbG4A';

// File detection
const IMG_RE = /\.(jpe?g|png|webp|gif)$/i;
const DOC_RE = /\.(pdf|docx?|xlsx?|csv|txt)$/i;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// ── GitHub API (via Netlify proxy) ──

async function ghGet(path) {
  const r = await fetch(GITHUB_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, method: 'GET' })
  });
  return r.json();
}

async function ghPut(path, body) {
  const r = await fetch(GITHUB_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, method: 'PUT', body })
  });
  return r.json();
}

async function ghDelete(path, body) {
  const r = await fetch(GITHUB_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, method: 'DELETE', body })
  });
  return r.json();
}

// Consolidated GitHub API call (used by deal generator for repo-path-based calls)
async function githubAPI(repoPath, method, body) {
  const resp = await fetch(GITHUB_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: '/repos/' + GITHUB_REPO + '/contents/' + repoPath,
      method: method || 'GET',
      body: body || undefined
    })
  });
  const data = await resp.json();
  if (!resp.ok && resp.status !== 404) {
    throw new Error(data.message || 'GitHub API error ' + resp.status);
  }
  return { ok: resp.ok, status: resp.status, data: data };
}

// Push or update a file on GitHub (handles SHA lookup automatically)
async function ghPushFile(filePath, contentBase64, commitMsg) {
  let sha = null;
  try {
    const existing = await githubAPI(filePath, 'GET');
    if (existing.ok) sha = existing.data.sha;
  } catch(e) {}
  const body = { message: commitMsg, content: contentBase64 };
  if (sha) body.sha = sha;
  const result = await githubAPI(filePath, 'PUT', body);
  if (!result.ok) throw new Error(result.data.message || 'Push failed');
  return result;
}

// ── Close CRM API (via Netlify proxy) ──

async function closeAPI(path, method, body) {
  const resp = await fetch(CLOSE_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, method, body })
  });
  if (!resp.ok) {
    const text = await resp.text();
    // Detect non-deployed proxy (returns HTML instead of JSON)
    if (text.startsWith('<!') || text.startsWith('<html')) {
      throw new Error('Close proxy not deployed — check Netlify functions');
    }
    throw new Error('Close API ' + path + ' failed (' + resp.status + '): ' + text.substring(0, 200));
  }
  return resp.json();
}

// ── Formatting Utilities ──

function fmt$(n) {
  if (n == null || n === '') return '—';
  return '$' + Number(n).toLocaleString();
}

function parseDollar(str) {
  if (!str && str !== 0) return null;
  const n = Number(String(str).replace(/[^0-9.]/g, ''));
  return isNaN(n) || n === 0 ? null : n;
}

function toCents(str) {
  const n = parseDollar(str);
  return n ? Math.round(n * 100) : null;
}

// ── Date Utilities ──

// Add days to a date string, returns YYYY-MM-DD
function addDaysToDate(dateStr, days) {
  if (!dateStr || days == null) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + Number(days));
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

// Format date string to "Month Day, Year"
function fmtDateLong(s) {
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return s;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return months[parseInt(m[1],10)-1] + ' ' + parseInt(m[2],10) + ', ' + m[3];
}

// Convert date to ISO format (YYYY-MM-DD) for Close CRM
function toISO(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return d.toISOString().split('T')[0];
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const now = new Date(); now.setHours(0,0,0,0); d.setHours(0,0,0,0);
  return Math.round((d - now) / 86400000);
}

function dateClass(days) {
  if (days === null) return '';
  if (days < 0) return 'dim';
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'warn';
  return '';
}

function dateLabel(days) {
  if (days === null) return '';
  if (days < 0) return Math.abs(days) + 'd ago';
  if (days === 0) return 'TODAY';
  if (days === 1) return 'Tomorrow';
  return days + 'd';
}

// ── File Utilities ──

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function docIcon(name) {
  const ext = (name.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['doc','docx'].includes(ext)) return '📝';
  if (['xls','xlsx','csv'].includes(ext)) return '📊';
  if (['txt'].includes(ext)) return '📃';
  return '📎';
}

function isImageFile(name) {
  return IMG_RE.test(name);
}

// ── Deal ID Auto-Numbering ──
// Format: MMYYYY### (3-digit, starting at 007)

async function autoAssignDealId() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const prefix = mm + yyyy;

  try {
    const result = await githubAPI('deals', 'GET');
    if (!result.ok) throw new Error('Could not list deals');

    const folders = (result.data || []).filter(f => f.type === 'dir');
    let maxNum = 6; // Start before 007

    folders.forEach(f => {
      if (f.name.startsWith(prefix)) {
        const n = parseInt(f.name.slice(prefix.length), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      }
    });

    return prefix + String(maxNum + 1).padStart(3, '0');
  } catch(e) {
    const ts = Date.now().toString().slice(-3);
    return prefix + ts;
  }
}

// ── DOM Helpers ──

function getVal(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const t = el.textContent.trim();
  return (t === 'N/A' || t === '—' || t === '') ? null : t;
}
