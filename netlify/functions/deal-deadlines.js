// Netlify function — Returns upcoming deal deadlines from Close CRM
// Called by Claude scheduled task to create Google Calendar reminders
//
// GET ?days=7  — returns deals with deadlines within N days
// Response: { deadlines: [{ dealName, address, type, date, daysUntil, leadId, oppId }] }

const CLOSE_BASE = 'https://api.close.com/api/v1';
const PIPELINE_ID = 'pipe_1P0GjK0TFer4Yw2rbArK0u';

// Close CRM opportunity custom field IDs
const CF = {
  address:    'cf_NdiIYfY11hv4MI2EccVt1UBe7hc3UcrPFVJn44F9AuT',
  coeDate:    'cf_0maXpCwRBInrLrsfyJOPVZPDTTipRetz10WGJz2ptDO',
  ddEndDate:  'cf_dYuh3zK6om5wx7DazAPdoknMZI1083pJ9Xfon6vdmYf',
  emdDueDate: 'cf_v7RDgaN83GrYYyUPjwry71a2COpLSEhM0Dn7Lbs4Vn7',
  dealId:     'cf_mtdd9aMAiHZ8NfSByhliIPFJ2AEkXMGDRCZabKHEI8T'
};

exports.handler = async (event) => {
  const origin = (event.headers || {}).origin || '';
  const allowedOrigins = ['https://goodresults.org', 'https://www.goodresults.org', 'http://localhost:8888'];
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return { statusCode: 405, headers, body: JSON.stringify({ error: 'GET only' }) };

  const CLOSE_API_KEY = process.env.CloseAPI;
  if (!CLOSE_API_KEY) return { statusCode: 500, headers, body: JSON.stringify({ error: 'CloseAPI not configured' }) };

  const daysAhead = parseInt((event.queryStringParameters || {}).days || '7');

  try {
    const auth = 'Basic ' + Buffer.from(CLOSE_API_KEY + ':').toString('base64');

    // Fetch all open opportunities in our pipeline
    const resp = await fetch(`${CLOSE_BASE}/opportunity/?pipeline_id=${PIPELINE_ID}&status_type=active&_limit=100`, {
      headers: { 'Authorization': auth, 'Accept': 'application/json' }
    });
    const data = await resp.json();
    const opps = data.data || [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + daysAhead);

    const deadlines = [];

    opps.forEach(opp => {
      const address = opp[CF.address] || opp.note || 'Unknown Property';
      const dealId = opp[CF.dealId] || '';
      const dealName = dealId ? `Deal ${dealId} — ${address}` : address;

      // Check each date type
      const dateChecks = [
        { type: 'EMD Due', field: CF.emdDueDate },
        { type: 'Due Diligence Ends', field: CF.ddEndDate },
        { type: 'Closing Date', field: CF.coeDate }
      ];

      dateChecks.forEach(({ type, field }) => {
        const dateStr = opp[field];
        if (!dateStr) return;

        const deadline = new Date(dateStr);
        if (isNaN(deadline.getTime())) return;

        deadline.setHours(0, 0, 0, 0);
        const diffMs = deadline - now;
        const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

        // Include if within range (also include past-due up to -3 days)
        if (daysUntil >= -3 && daysUntil <= daysAhead) {
          deadlines.push({
            dealName,
            address,
            type,
            date: dateStr,
            daysUntil,
            pastDue: daysUntil < 0,
            leadId: opp.lead_id,
            oppId: opp.id
          });
        }
      });
    });

    // Sort by nearest deadline first
    deadlines.sort((a, b) => a.daysUntil - b.daysUntil);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        deadlines,
        checked: now.toISOString(),
        totalActiveDeals: opps.length
      })
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
