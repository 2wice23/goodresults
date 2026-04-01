/* ═══════════════════════════════════════════════════════
   GR UTILS — Shared JavaScript utilities
   Auth guard, fetch wrapper, error logging, toasts,
   storage helpers, auto-refresh, fade-in observer
   ═══════════════════════════════════════════════════════ */

// ─── AUTH GUARD ───
// Call grAuth() at top of any protected page
// Call grAuthOwner() for owner-only pages (Gayden + Joe)
function grAuth() {
  if (sessionStorage.getItem('gr_authed') !== '1') {
    sessionStorage.setItem('gr_redirect', window.location.pathname);
    window.location.href = '/gimmebrain/login.html';
    return false;
  }
  return true;
}
function grAuthOwner() {
  const email = (sessionStorage.getItem('gr_email') || '').toLowerCase();
  const owners = ['gayden@goodresults.org', 'joe@goodresults.org'];
  if (sessionStorage.getItem('gr_authed') !== '1' || !owners.includes(email)) {
    sessionStorage.setItem('gr_brain_bounce', '1');
    window.location.href = '/gimmebrain/login.html';
    return false;
  }
  return true;
}

// ─── SESSION HELPERS ───
const grSession = {
  get email()  { return (sessionStorage.getItem('gr_email') || '').toLowerCase(); },
  get name()   { return sessionStorage.getItem('gr_name') || ''; },
  get agent()  { return sessionStorage.getItem('gr_agent') || ''; },
  get authed() { return sessionStorage.getItem('gr_authed') === '1'; },
  isOwner()    { return ['gayden@goodresults.org','joe@goodresults.org'].includes(this.email); },
};

// ─── STREAK ───
function grStreak() {
  const streak = parseInt(localStorage.getItem('gr_streak') || '0');
  const el = document.getElementById('streak-count');
  if (el) el.textContent = streak > 0 ? streak + '-day streak' : 'Start your streak';
  return streak;
}

// ─── TOAST SYSTEM ───
(function initToasts() {
  if (document.getElementById('gr-toast-container')) return;
  const c = document.createElement('div');
  c.id = 'gr-toast-container';
  c.className = 'gr-toast-container';
  document.body.appendChild(c);
})();

function grToast(type, title, msg, debugInfo) {
  const container = document.getElementById('gr-toast-container');
  if (!container) return;

  const icons = { error: '❌', success: '✅', warn: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `gr-toast toast-${['error','success','warn','info'].includes(type) ? type : 'info'}`;

  // Build toast with textContent (no innerHTML) to prevent XSS
  const icon = document.createElement('span');
  icon.className = 'gr-toast-icon';
  icon.textContent = icons[type] || 'ℹ️';

  const body = document.createElement('div');
  body.className = 'gr-toast-body';

  const titleEl = document.createElement('div');
  titleEl.className = 'gr-toast-title';
  titleEl.textContent = title;
  body.appendChild(titleEl);

  if (msg) {
    const msgEl = document.createElement('div');
    msgEl.className = 'gr-toast-msg';
    msgEl.textContent = msg;
    body.appendChild(msgEl);
  }

  if (debugInfo) {
    const debugStr = typeof debugInfo === 'string' ? debugInfo : JSON.stringify(debugInfo, null, 2);
    const debugEl = document.createElement('div');
    debugEl.className = 'gr-toast-debug';
    debugEl.title = 'Click to copy — paste into Claude for debugging';
    debugEl.textContent = debugStr;
    debugEl.addEventListener('click', () => {
      navigator.clipboard.writeText(debugStr).then(() => grToast('info', 'Copied', 'Debug info copied to clipboard.'));
    });
    body.appendChild(debugEl);
  }

  const closeBtn = document.createElement('button');
  closeBtn.className = 'gr-toast-close';
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => toast.remove());

  toast.appendChild(icon);
  toast.appendChild(body);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  // Auto-log errors
  if (type === 'error' && debugInfo) {
    grLogError({ title, msg, debug: debugInfo, page: window.location.pathname, time: new Date().toISOString() });
  }

  // Auto-dismiss after 8s (errors stay longer at 15s)
  const duration = type === 'error' ? 15000 : 8000;
  setTimeout(() => {
    toast.classList.add('exiting');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── ERROR LOGGING ───
// Logs errors to Netlify Blobs for daily review
async function grLogError(errorObj) {
  try {
    await fetch('/.netlify/functions/error-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...errorObj,
        agent: grSession.agent || 'unknown',
        email: grSession.email || 'unknown',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    });
  } catch(e) {
    // Silently fail — don't toast about toast errors
    console.error('[GR Error Log] Failed to log:', e);
  }
}

// Global error catcher
window.addEventListener('error', (e) => {
  grLogError({
    title: 'Uncaught Error',
    msg: e.message,
    debug: { file: e.filename, line: e.lineno, col: e.colno },
    page: window.location.pathname
  });
});
window.addEventListener('unhandledrejection', (e) => {
  grLogError({
    title: 'Unhandled Promise Rejection',
    msg: String(e.reason),
    page: window.location.pathname
  });
});

// ─── FETCH WRAPPER ───
// grFetch(url, opts) — returns parsed JSON or null on failure
// Automatically shows toasts on error with debug info for Claude
async function grFetch(url, opts = {}) {
  const label = opts._label || url;
  // Strip query params from debug output to avoid leaking tokens/keys
  const safeUrl = url.split('?')[0];
  try {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      const debugInfo = {
        endpoint: safeUrl,
        status: res.status,
        statusText: res.statusText,
        response: body.slice(0, 500),
        method: opts.method || 'GET'
      };
      grToast('error', `Request failed: ${label}`,
        `Server returned ${res.status}. Debug info below — paste into Claude to troubleshoot.`,
        debugInfo
      );
      return null;
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (err) {
    const debugInfo = {
      endpoint: safeUrl,
      error: err.message,
      type: err.name,
      method: opts.method || 'GET'
    };
    grToast('error', `Connection failed: ${label}`,
      `Could not reach the server. Debug info below — paste into Claude to troubleshoot.`,
      debugInfo
    );
    return null;
  }
}

// ─── FADE-IN OBSERVER ───
function grFadeIn() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((x, i) => {
      if (x.isIntersecting) {
        setTimeout(() => x.target.classList.add('visible'), i * 60);
        obs.unobserve(x.target);
      }
    });
  }, { threshold: 0.05 });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// ─── SCROLL PROGRESS BAR ───
function grScrollBar() {
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const bar = document.getElementById('rpbar');
    if (h > 0 && bar) bar.style.width = (window.scrollY / h * 100) + '%';
  }, { passive: true });
}

// ─── AUTO-REFRESH ───
// grAutoRefresh(fn, intervalMs, btnId) — runs fn on interval, adds manual refresh button
function grAutoRefresh(fn, intervalMs = 60000, btnId) {
  let timer = setInterval(fn, intervalMs);
  // Pause when tab is hidden, resume when visible
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearInterval(timer);
    } else {
      fn(); // Refresh immediately on return
      timer = setInterval(fn, intervalMs);
    }
  });
  // Optional manual refresh button
  if (btnId) {
    const btn = document.getElementById(btnId);
    if (btn) btn.addEventListener('click', () => { fn(); grToast('info', 'Refreshed', 'Data updated.'); });
  }
}

// ─── SKELETON LOADER ───
// grSkeleton(el, lines) — fills element with skeleton loading placeholders
function grSkeleton(el, lines = 3) {
  if (typeof el === 'string') el = document.getElementById(el);
  if (!el) return;
  el.innerHTML = Array.from({length: lines}, (_, i) =>
    `<div class="gr-skeleton" style="height:${14 + Math.random()*10}px;width:${60 + Math.random()*35}%;margin-bottom:8px;"></div>`
  ).join('');
}

// ─── USER DISPLAY ───
function grUserDisplay() {
  const el = document.getElementById('user-display');
  if (el) el.textContent = grSession.name || grSession.agent || 'Team Member';
}

// ─── HERO GREETING ───
function grHeroGreeting(heroId, subId, subText) {
  const hero = document.getElementById(heroId || 'hero-greeting');
  const sub = document.getElementById(subId || 'hero-sub');
  const name = grSession.agent;
  if (name && hero) {
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Morning' : hour < 17 ? "What's up" : 'Evening';
    // Safe DOM construction — no innerHTML with user data
    hero.textContent = '';
    hero.appendChild(document.createTextNode(greet + ', '));
    const span = document.createElement('span');
    span.textContent = name + '.';
    hero.appendChild(span);
    if (sub && subText) sub.textContent = subText;
  }
}
