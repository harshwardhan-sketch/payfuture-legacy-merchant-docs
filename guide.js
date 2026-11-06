/* Guides layer (modelled on the Airwallex docs IA: overview → get started → integration options → methods →
   operations → test & go live → troubleshooting). Company facts come from www.payfuture.net; API facts come
   from data.js (the live IG docs) so guides and API reference cannot drift apart. */

const SITE = 'https://www.payfuture.net';
const WEB = {
  home: SITE + '/', about: SITE + '/about-us/', solutions: SITE + '/solutions/', countries: SITE + '/countries/',
  industries: SITE + '/industries/', partners: SITE + '/industries/partners/', contact: SITE + '/contact/',
  payins: SITE + '/solutions/pay-ins/', payouts: SITE + '/solutions/payouts/', crossborder: SITE + '/solutions/cross-border-payments/',
  mass: SITE + '/solutions/global-mass-payments/', stablecoin: SITE + '/solutions/stablecoin-cross-border-payments/',
  authopt: SITE + '/solutions/authorisation-optimisation/', reporting: SITE + '/solutions/reporting-and-analytics/',
  newsroom: SITE + '/newsroom/', privacy: SITE + '/privacy-policy/', terms: SITE + '/terms-and-conditions/', cookies: SITE + '/cookies/',
};
const ext = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text} ↗</a>`;

/* Product offering pages (payfuture-technologies.github.io/product-offering → coverage.payfuture.net).
   Their spec data (assets/product-data.js) is synced from the product Google Sheet. */
/* No provider, wallet-brand or bank names on this site: the product sheet's rows are renamed to the method
   names the live API docs (document.paygate10.com) use, and markets those docs don't cover are left out. */
const PROVIDER_RE = /fawry|vodafone|orange|etisalat|we ?cash|cashplus|cash plus|mt cash|gcash|maya|nagad|bkash|instapay|ozow|attijari|cih|lbanka|bcp|bank of africa|qr ph/i;
const PD = (() => {
  const raw = typeof PRODUCT_DATA !== 'undefined' ? PRODUCT_DATA : {payinMethods: {}, payinMethodsP2P: {}, payoutSpecsTable: [], collectionsSpecs: {}, remittancePayoutSpecs: {}};
  const LIVE_MARKETS = ['IN', 'PK', 'NG', 'EG', 'MA', 'BD', 'PH'];
  const NAME = {'Fawry': 'Cash voucher', 'QR PH': 'QR', 'UPI QR': 'UPI QR code', 'Wallets': 'Wallet', 'Mobile Wallet': 'Wallet', 'Nagad': 'Wallet', 'bKash': 'Wallet', 'Bank deposit': 'Bank Deposit'};
  const SUB = {'Cash voucher': 'Pay in cash at a retail outlet', 'Wallet': 'Mobile wallet', 'Bank Transfer': 'Direct from local banks', 'QR': 'Scan to pay from a banking or wallet app'};
  const CHANNEL = {'Cash voucher': 'Retail cash network', 'Wallet': 'Local mobile wallets', 'Bank Transfer': 'Local banks', 'QR': 'QR-enabled banking and wallet apps'};
  const clean = (v, fallback) => v && PROVIDER_RE.test(v) ? fallback : v;
  const method = m => {
    const name = NAME[m.name] || m.name, cap = {...(m.cap || {})};
    cap.channels = clean(cap.channels, CHANNEL[name] || 'Local network');
    cap.speed = cap.speed && cap.speed.replace(/\s*via\s+\w+/i, '');
    cap.fieldsRequired = clean(cap.fieldsRequired, 'Mobile number');
    return {name, sub: clean(m.sub, SUB[name] || ''), cap};
  };
  const list = arr => arr.map(method).filter((m, i, a) => a.findIndex(x => x.name === m.name) === i); /* e.g. two wallet brands → one Wallet row */
  const pick = o => Object.fromEntries(Object.entries(o || {}).filter(([cc]) => LIVE_MARKETS.includes(cc)).map(([cc, arr]) => [cc, list(arr)]));
  const PAYOUT = {'Net Banking (Bank Transfer)': 'Net Banking', 'Easypaisa & JazzCash Wallet': 'EasyPaisa / JazzCash wallet'};
  return {...raw, payinMethods: pick(raw.payinMethods), payinMethodsP2P: pick(raw.payinMethodsP2P),
    payoutSpecsTable: (raw.payoutSpecsTable || []).map(r => ({...r, method: PAYOUT[r.method] || (/wallet/i.test(r.method) ? 'Wallet' : r.method)}))};
})();
const ISO = {India: 'IN', Pakistan: 'PK', Egypt: 'EG', Nigeria: 'NG', Morocco: 'MA', Bangladesh: 'BD', Philippines: 'PH', 'South Africa': 'ZA'};
const NAME_OF = Object.fromEntries(Object.entries(ISO).map(([n, c]) => [c, n]));
function specTable(cc, list) {
  return `<table><thead><tr><th>Method</th><th>Channels</th><th>Speed</th><th>Min</th><th>Max</th><th>Settlement</th><th>Integration</th></tr></thead><tbody>${
    list.map(m => { const c = m.cap || {};
      return `<tr><td><b>${esc(m.name)}</b><span class="cond-note">${esc(m.sub || '')}</span></td><td>${esc(c.channels || '—')}</td><td>${esc(c.speed || '—')}</td><td>${esc(c.minTx || '—')}</td><td>${esc(c.maxTx || c.depositLimits || '—')}</td><td>${esc(c.settlement || '—')}</td><td>${esc(c.integrationType || '—')}</td></tr>`; }).join('')
  }</tbody></table>`;
}
const kv = rows => table(['', ''], rows.map(r => [`<b>${esc(r.label)}</b>`, esc(r.value)]));

const GUIDE_NAV = [
  ['Overview', [['about', 'About PayFuture'], ['how-it-works', 'How payments work'], ['choose', 'Choose your integration']]],
  ['Get started', [['onboarding', 'Integration journey'], ['before-you-start', 'Stage 1 · Before you start'], ['quickstart-payin', 'Quickstart: first payin'], ['quickstart-payout', 'Quickstart: first payout']]],
  ['Integration options', [['build-rules', 'Stage 2 · Build rules'], ['hosted', 'Hosted checkout'], ['seamless', 'Seamless (server-to-server)'], ['payouts', 'Payouts & prefunding']]],
  ['Payment methods', [['methods', 'Methods by country']]],
  ['Payment operations', [['callbacks', 'Callbacks & status updates'], ['refunds', 'Refunds'], ['reconciliation', 'Balance & reconciliation']]],
  ['Test and go live', [['testing', 'Stage 3 · Test cases'], ['go-live', 'Stage 4 · Readiness & sign-off'], ['production', 'Stage 5 · Moving to production'], ['after-go-live', 'After go-live']]],
  ['Troubleshooting', [['hash-help', 'Fixing hash errors'], ['faq', 'FAQ'], ['support', 'Support & raising issues']]],
];

/* ---------- facts derived from data.js ---------- */
const FLAGS = {India: '🇮🇳', Pakistan: '🇵🇰', Egypt: '🇪🇬', Nigeria: '🇳🇬', Morocco: '🇲🇦', Bangladesh: '🇧🇩', Philippines: '🇵🇭'};
const CCY = {India: 'INR', Pakistan: 'PKR', Egypt: 'EGP', Nigeria: 'NGN', Morocco: 'MAD', Bangladesh: 'BDT', Philippines: 'PHP'};

function parseReq(raw) { try { const r = JSON.parse(raw); return r.data || r.Data || {}; } catch (_) { return {}; } }
function methodMatrix() {
  const C = {};
  const add = (country, kind, flow, entry) => {
    const c = C[country] ||= {payin: {}, payout: {}};
    const k = entry.mode + '|' + entry.name;
    (c[kind][k] ||= {...entry, flows: new Set()}).flows.add(flow);
  };
  for (const flow of Object.keys(D)) {
    for (const [p, kind] of [['index', 'payin'], ['payout', 'payout']]) {
      for (const ex of page(flow, p).examples || []) {
        const m = ex.title.match(/^(Hosted|Seamless)\s+(.+?)\s*\(([^)]+)\)\s*$/);
        if (!m) continue;
        const d = parseReq(ex.request);
        const code = d.paymentMethod || d.PaymentMethod || '';
        m[3].split(/\s*,\s*/).forEach(country => add(country, kind, flow, {mode: m[1], name: m[2], code, title: ex.title}));
      }
    }
  }
  return C;
}
const COUNTRIES = () => Object.keys(methodMatrix()).sort();
const errorBy = (flow, re) => D[flow].errors.find(e => re.test(e.ErrorMessage || ''));
const recipeIdx = (flow, re) => D[flow].recipes.findIndex(r => re.test(r.label));

/* status lifecycle diagram (theme-aware via CSS classes) */
const LIFECYCLE_SVG = `<svg class="flowsvg" viewBox="0 0 760 190" role="img" aria-label="Transaction status lifecycle">
  <rect class="acc" x="10" y="70" width="130" height="50" rx="10"/><text x="75" y="92" text-anchor="middle">Your request</text><text class="sub" x="75" y="109" text-anchor="middle">PAYIN / PAYOUT</text>
  <rect class="box" x="190" y="70" width="130" height="50" rx="10"/><text x="255" y="92" text-anchor="middle">INITIATED</text><text class="sub" x="255" y="109" text-anchor="middle">created</text>
  <rect class="box" x="370" y="70" width="130" height="50" rx="10"/><text x="435" y="92" text-anchor="middle">PENDING</text><text class="sub" x="435" y="109" text-anchor="middle">with the network</text>
  <rect class="ok" x="560" y="20" width="180" height="50" rx="10"/><text x="650" y="42" text-anchor="middle">APPROVED</text><text class="sub" x="650" y="59" text-anchor="middle">final · callback sent</text>
  <rect class="bad" x="560" y="120" width="180" height="50" rx="10"/><text x="650" y="142" text-anchor="middle">DECLINED</text><text class="sub" x="650" y="159" text-anchor="middle">final · callback sent</text>
  <line x1="140" y1="95" x2="190" y2="95"/><line x1="320" y1="95" x2="370" y2="95"/>
  <path d="M500 88 C530 88 530 45 560 45"/><path d="M500 102 C530 102 530 145 560 145"/>
</svg>`;

/* ---------- pages ---------- */
const G = {};

G['how-it-works'] = () => `<h1>How payments work</h1>
<p class="lead">Everything you send to PayFuture goes to one endpoint. You tell it what to do with <code>requestType</code>, prove it is you with a signature (a header or a <code>hash</code> field), and we tell you the outcome in the response and in a callback.</p>
${LIFECYCLE_SVG}
<h2>Key concepts</h2>
${table(['Concept', 'What it is'], [
  ['<b>MID</b> · <code>midCode</code>', 'Your merchant account for one product / currency / country. You may have several MIDs.'],
  ['<b>MID secret</b>', 'Issued with each MID. Used only to compute hashes — never sent in a request, never exposed in a browser or app.'],
  ['<code>requestType</code>', 'The operation: <code>PAYIN</code>, <code>PAYOUT</code>, <code>REFUND</code>, <code>GetStatus</code>, <code>GetBalance</code> …'],
  ['<code>integrationType</code>', '<code>PG_H</code> = hosted checkout, <code>S</code> = seamless (you collect the details).'],
  ['<code>merchantRefNo</code>', 'Your unique reference for the transaction. Reusing one is rejected — which makes retries safe.'],
  ['<code>transaction_id</code>', 'PayFuture\'s ID, returned in the response (e.g. <code>INVWED1757498791747</code>). Store it next to your reference.'],
  ['<b>Signature</b>', 'Proves a request is yours. Either sign the whole body with HMAC-SHA256 in the <code>X-Callback-Signature</code> header, or send a <code>hash</code> field: SHA-256 over specific fields + your secret. Responses and callbacks carry a <code>hash</code> too. See <a href="#/legacy/signing">Signing</a>.'],
  ['<code>notificationUrl</code>', 'Your server endpoint that receives the callback with the final status.'],
  ['<code>returnUrl</code>', 'Where the customer is sent back to after a hosted checkout.'],
])}
<h2>A payin, end to end</h2>
<ol class="steps">
<li><b>Your server sends <code>PAYIN</code></b>Signed with your MID secret, to the PayFuture endpoint.</li>
<li><b>PayFuture responds</b><code>success</code>, <code>transaction_id</code>, a provisional <code>status</code> (usually <code>INITIATED</code> or <code>PENDING</code>) and, for hosted, a <code>checkout_url</code>.</li>
<li><b>The customer pays</b>On the hosted page, or by approving in their wallet / bank app (seamless).</li>
<li><b>PayFuture calls your <code>notificationUrl</code></b>With the final <code>APPROVED</code> or <code>DECLINED</code>. Verify the callback hash, update your order, reply HTTP 200.</li>
<li><b>Not sure? Ask</b><code>GetStatus</code> returns the current status at any time.</li>
</ol>
<div class="callout warn"><p><b>Only <code>APPROVED</code> and <code>DECLINED</code> are final.</b> Never fulfil an order on <code>INITIATED</code> or <code>PENDING</code>.</p></div>
<h2>Responses always look the same</h2>
${code(`{
  "success": true,
  "midCode": "123",
  "requestType": "PAYIN",
  "merchantRefNo": "ORDER-1001",
  "error": [],
  "data": { "transaction_id": "INV…", "status": "INITIATED", "hash": "…" }
}`)}
<p>When <code>success</code> is <code>false</code>, read <code>error[]</code> — each entry has an <code>errorCode</code> and <code>errorMessage</code>. See <a href="#/legacy/errors">error codes</a>.</p>`;

G.seamless = () => `<h1>Seamless (server-to-server)</h1>
<p class="lead">Collect the payment details in your own UI and send them with <code>integrationType: "S"</code>, a <code>paymentMethod</code> code and <code>paymMethodFields</code>.</p>
<h2>How it works</h2>
<ol class="steps">
<li><b>Choose the method</b>Use the <code>paymentMethod</code> code for the country — see <a href="#/guide/methods">Methods by country</a>.</li>
<li><b>Send method fields</b>For example a wallet number for Easypaisa / JazzCash, a VPA for UPI, card fields for cards.</li>
<li><b>Use the method's hash recipe</b>Seamless recipes differ per method and country — copy the exact one from the API reference.</li>
<li><b>Complete any verification</b>Some flows return an <code>authMode</code>; continue with <code>VerifyPin</code>, <code>VerifyOtp</code>, <code>VerifyPhone</code> or <code>VerifyAddress</code> (see the Others section of the API reference).</li>
<li><b>Show instructions when needed</b>Bank deposit flows return <code>detailData</code> (account number, name, expiry) for the customer to pay into.</li>
<li><b>Wait for the callback</b>As with hosted, only the callback / <code>GetStatus</code> gives the final status.</li>
</ol>
<div class="callout warn"><p><b>Cards:</b> sending card numbers to your servers puts you in PCI DSS scope. Prefer hosted checkout unless you are PCI compliant.</p></div>`;

G.callbacks = () => {
  const cb = (f, p) => { const s = page(f, p).sections.find(x => x.id === 'callback-body'); return s ? renderBlocks(f, s.blocks) : ''; };
  return `<h1>Callbacks &amp; status updates</h1>
<p class="lead">PayFuture tells your server about the final status by calling the <code>notificationUrl</code> you sent in the request.</p>
<h2>Rules for your callback endpoint</h2>
<ul>
<li>Accept <code>POST</code> with <code>Content-Type: application/x-www-form-urlencoded</code>.</li>
<li><b>Verify the hash</b> before trusting anything: <code>SHA256(midcode + transactionid + amount + midsecret)</code>, values concatenated with <b>no separator</b> (refunds also include the parent transaction ID).</li>
<li>Reply <b>HTTP 200</b> once you have stored the update.</li>
<li>Be idempotent — if we don't get your acknowledgement we retry, so the same callback may arrive more than once.</li>
<li>If a callback has not arrived in your expected window, poll <a href="#/legacy/op-get-status">Get Status</a>.</li>
</ul>
<h2>Callback fields</h2>
${tabs([['Payin', cb('legacy', 'index')], ['Payout', cb('legacy', 'payout')], ['Refund', cb('legacy', 'refund')]])}`;
};

G.reconciliation = () => `<h1>Balance &amp; reconciliation</h1>
<h2>Balance</h2>
<p><code>GetBalance</code> returns <code>available_balance</code>, <code>running_balance</code>, <code>available_instant_payout_balance</code> and <code>currency</code> for the MID. Hash: <code>SHA256(midcode~midsecret)</code>.</p>
<h2>Transaction list</h2>
<p><code>GetTransactionList</code> pages through deposits, withdrawals, refunds or chargebacks for a date range — use it for daily reconciliation instead of calling <code>GetStatus</code> per transaction.</p>
<ul><li>Up to 100 records per call (<code>skip</code> / <code>take</code>).</li><li>Dates are read as <b>IST for merchants registered in India</b> and UTC for everyone else.</li><li>Filter by status, transaction ID, your reference or payment method.</li><li>Signature: <code>SHA256(midcode~midsecret)</code> — it does not cover the filters.</li></ul>
<p>Reference: <a href="#/legacy/op-get-transaction-list">Get Transaction List</a> · ${ext(WEB.reporting, 'Reporting & analytics')}</p>`;

G['hash-help'] = () => `<h1>Fixing hash errors</h1>
<p class="lead">“hash does not match” is the most common integration error. It almost always comes from one of the causes below.</p>
<div class="callout ok"><p><b>Fastest fix:</b> paste your hash into the <a href="#/playground">hash playground</a>. Its hash detective tries every cause below and tells you which one it is.</p></div>
${table(['Cause', 'How to spot it', 'Fix'], [
  ['<b>Wrong recipe</b>', 'You used the hosted recipe for a seamless request, or another method\'s recipe.', 'Recipes differ per request type, mode, method and country. Copy the exact one from your platform\'s API reference.'],
  ['<b>Fields in the wrong order</b>', 'Same fields, different order.', 'Follow the recipe order exactly — e.g. some recipes place <code>midsecret</code> in the middle.'],
  ['<b>Amount format</b>', 'You sent <code>10</code> or <code>10.0</code>.', 'Use two decimals in the hash: <code>10.00</code>. (Pakistan payouts: whole amounts in the request.)'],
  ['<b>Secret case</b>', 'Secret contains capitals.', 'Use the MID secret in lower case.'],
  ['<b>Separator</b>', 'Used <code>|</code>, spaces or nothing.', 'Requests and responses join with <code>~</code>. Callbacks concatenate with <b>no separator</b>.'],
  ['<b>Hash reused</b>', 'The same hash value appears on different requests.', 'Compute the hash for each request from that request\'s own values.'],
  ['<b>Value mismatch</b>', 'Hashed one value, sent another (trimmed name, different account).', 'Build the hash from exactly the strings you put in the JSON.'],
  ['<b>Wrong secret</b>', 'Nothing matches.', 'Test and production MIDs have different secrets; each MID has its own.'],
])}
<h2>Using the signature header?</h2>
<p>If you sign with <code>X-Callback-Signature</code> (HMAC), a wrong header gives <code>11031</code> even when the body <code>hash</code> is right. Check these:</p>
${table(['Cause', 'Fix'], [
  ['<b>Body changed after signing</b>', 'Serialise the JSON once, sign that string and send the same string. Don\'t let your HTTP library re-serialise it (spaces and key order matter).'],
  ['<b>Wrong key</b>', 'The key is your MID secret in lower case.'],
  ['<b>Wrong algorithm</b>', 'HMAC-SHA256 with the secret as the key, not SHA-256 of body + secret.'],
  ['<b>Header format</b>', 'Send <code>X-Callback-Signature: sha256=&lt;hex&gt;</code>.'],
])}
<h2>Check your hash in seconds</h2>
<div class="grid2"><a class="tile" href="#/legacy/signing"><b>Hash calculator →</b><span>Every recipe, computed in your browser.</span></a><a class="tile" href="#/legacy/errors"><b>Error codes →</b><span>Search for 11031 and related codes.</span></a></div>
<p>Use a <b>test</b> secret only. Nothing you type is sent anywhere.</p>
<h2>Still stuck?</h2>
<p>Post your <b>pre-hash string with the secret removed</b> in your integration group, e.g. <code>123~REF001~100.00~PKR~***</code>, together with the request and the error. That is the fastest way for us to spot the difference. Never post the secret itself. See <a href="#/guide/support">How to raise an issue</a>.</p>`;

/* ==========================================================================
   Integration journey — from "PayFuture Integration & Go-Live Checklist"
   (the five stages, LPL / LP, contacts, test cases, raising issues).
   These definitions replace the earlier generic onboarding/testing/go-live/support pages.
   ========================================================================== */

/* tickable checklists, remembered per browser */
function checklist(key, items) {
  return `<ul class="check ticks">${items.map((t, i) => `<li><label><input type="checkbox" data-ck="${key}-${i}"> <span>${t}</span></label></li>`).join('')}</ul>`;
}
function restoreTicks() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('pf-ticks') || '{}'); } catch (_) {}
  document.querySelectorAll('[data-ck]').forEach(cb => { cb.checked = !!saved[cb.dataset.ck]; });
}
document.addEventListener('change', e => {
  const cb = e.target.closest && e.target.closest('[data-ck]');
  if (!cb) return;
  try {
    const saved = JSON.parse(localStorage.getItem('pf-ticks') || '{}');
    saved[cb.dataset.ck] = cb.checked;
    localStorage.setItem('pf-ticks', JSON.stringify(saved));
  } catch (_) {}
});
window.addEventListener('hashchange', () => setTimeout(restoreTicks, 0));
window.addEventListener('DOMContentLoaded', () => setTimeout(restoreTicks, 0));

const doneWhen = t => `<div class="callout ok"><p><b>Done when:</b> ${t}</p></div>`;
const SUPPORT = [
  ['Tech Integration Support', 'API questions, testing', '<a href="https://t.me/TechIntegration_Support" target="_blank" rel="noopener">@TechIntegration_Support</a> (Telegram)', 'Mon–Fri, 03:30–21:30 CET'],
  ['Customer Success', 'Accounts, back office, everything else', '<a href="https://t.me/PFMSupportVA_bot" target="_blank" rel="noopener">@PFMSupportVA_bot</a> (Telegram)', 'Mon–Fri, 08:00–20:00 CET'],
  ['Account manager', 'Commercials, priorities', 'Named in your integration group', '—'],
  ['Integration owner', 'Your day-to-day integration contact', 'Named in your integration group', '—'],
];

G['before-you-start'] = () => `<h1>Stage 1 · Before you start</h1>
<p class="lead">We exchange details, documents and credentials. Tick items off as you go — your ticks are saved in this browser.</p>
<h2>Your integration details</h2>
${table(['Field', 'Why we ask'], [
  ['Company name', 'Your account and MIDs'],
  ['Countries and currencies', 'Which MIDs and rails to set up'],
  ['Payment methods (deposits / payouts)', 'Your country and method pack'],
  ['Integration type', 'Hosted checkout or seamless (server-to-server)'],
  ['Expected monthly volume and typical transaction size', 'Capacity and limits'],
  ['Largest single transaction you expect', 'Some payment rails have minimum or maximum amounts'],
  ['Technical contact (name, Telegram)', 'Shares request and response logs during testing'],
  ['Operations / finance contact', 'Back office, balances and reconciliation'],
  ['Target dates to start testing and to go live', 'Planning on both sides'],
])}
<h2>What we need from you</h2>
${checklist('s1-need', [
  'Signed agreement.',
  'Your integration details (the table above), including the largest single transaction you expect.',
  'Your <b>server IP addresses</b>, for both production and test. We whitelist these before you start; requests from other IPs are blocked.',
  'Your <b>callback (notification) URL</b>.',
  'Confirmation that your server allows our callback IP addresses (we send them to you).',
  'A technical contact who can share request and response logs during testing.',
  'Before production: a test login for your website, so our QA team can check the payment journey end to end. Please send it privately, not in the group chat.',
])}
<h2>What you will receive from us</h2>
${checklist('s1-get', [
  'The link to the <b>current API documentation</b>, and the <code>api-version</code> to use. Please use only this version.',
  'Your <b>country and method pack</b>: required and optional fields per request, phone and wallet number formats, whether decimal amounts are supported, the transaction statuses and the error-code reference.',
  'The <b>hash (signature) formula</b> for each request you will use, with a worked example — deposit, payout, status check, balance and callbacks.',
  'The <b>callback format</b>: field names, how to verify the signature, and the acknowledgement your server must return.',
  'Your <b>limits sheet</b>: minimum and maximum amounts per method, for LPL and LP, and any per-beneficiary rules.',
  'The <b>bank or wallet code list</b> for your countries, or a working bank-list request.',
  '<b>PayFuture\'s IP addresses</b> to whitelist on your side.',
  'Your <b>LPL credentials</b>, with a list showing which MID is for which payment method.',
  '<b>Back-office logins</b> with 2FA set-up steps. Confirm you can log in and see transactions and balances.',
  'For payouts: a <b>test balance</b> on your LPL payout MID.',
  'For wallet methods: <b>test wallet or account numbers</b>, where available.',
])}
${doneWhen('you have every item above, and your first API request receives a response (not a timeout or a blocked page).')}`;

G['build-rules'] = () => `<h1>Stage 2 · Build rules</h1>
<p class="lead">These rules prevent the integration errors we see most often. Check each one before you start testing.</p>
<h2>Requests</h2>
${checklist('s2-req', [
  'Send every request to the endpoint and <code>api-version</code> given in your documentation link.',
  'Use uppercase ISO codes for country (<code>PK</code>, <code>EG</code>, <code>IN</code>) and currency (<code>PKR</code>, <code>EGP</code>, <code>INR</code>).',
  'Send IDs such as <code>midCode</code> as strings.',
  'Send <b>only the fields listed for your method</b>. Extra or misspelled fields can make a request fail. Field names are case-sensitive.',
  'Use the <code>paymentMethod</code> value for your MID, as given in your MID list.',
  'Format phone and wallet numbers exactly as your country pack says.',
  'Send amounts with two decimal places (e.g. <code>100.00</code>), and check whether your method accepts decimals.',
  'Use a unique <code>merchantRefNo</code> for every transaction.',
  'Use the correct <code>integrationType</code> for each request (hosted or seamless).',
])}
<h2>Hash (signature)</h2>
${checklist('s2-hash', [
  'Choose how you sign: the <code>X-Callback-Signature</code> header (HMAC of the whole body, same for every request) or the body <code>hash</code>. See <a href="#/legacy/signing">Signing</a>.',
  'If you use the body hash, build it with the formula for that exact request type — deposit, payout, status check, balance and callbacks each use different fields.',
  'Use the same amount format in the hash as in the request (e.g. <code>100.00</code>).',
  'For status checks, send <code>transaction_type</code> in lowercase (<code>payin</code> / <code>payout</code>).',
  'If you get “hash does not match”, share the <b>pre-hash string with the secret removed</b> in your integration group — the fastest way for us to help. See <a href="#/guide/hash-help">Fixing hash errors</a>.',
])}
<h2>Callbacks</h2>
${checklist('s2-cb', [
  'Your callback URL accepts the documented callback format, from PayFuture\'s IP addresses.',
  'Your server verifies the callback signature, using the callback formula.',
  'Your server returns the documented acknowledgement. Otherwise we retry the callback.',
  'Your system handles every status: <code>PENDING</code>, <code>IN-PROCESS</code>, <code>APPROVED</code> and <code>DECLINED</code>. Only <code>APPROVED</code> and <code>DECLINED</code> are final.',
  'If a callback doesn\'t arrive, use the status-check request before treating a transaction as failed.',
])}
<h2>Payouts</h2>
${checklist('s2-po', [
  'Check your payout balance before sending payouts (balance request or back office).',
  'Respect the per-beneficiary and daily limits in your limits sheet.',
])}
<h2>Hosted checkout</h2>
${checklist('s2-hosted', [
  'Set a <code>returnUrl</code>, and show the customer a clear result page.',
  'Create a new payment link for each attempt. Don\'t reuse old links.',
])}
${doneWhen('a deposit (and a payout, if applicable) completes end to end, and you receive and verify the callback.')}`;

G.testing = () => {
  const T = [
    ['Deposit approved (once for each payment method)', 'Deposits', 'Status APPROVED; callback received and signature verified'],
    ['Deposit declined or cancelled by the customer', 'Deposits', 'Status DECLINED with a reason; callback received'],
    ['Deposit left unpaid until it expires', 'Deposits', 'Final status and callback received'],
    ['Payout approved (once for each payment method)', 'Payouts', 'Status APPROVED; callback verified; balance reduced'],
    ['Payout to an invalid account', 'Payouts', 'Status DECLINED with a reason'],
    ['Payout in process', 'Payouts', 'IN-PROCESS handled; final callback received'],
    ['Status check for a deposit and a payout', 'All', 'Correct status returned'],
    ['Balance check', 'Payouts', 'Correct balance and currency'],
    ['Amount below the minimum and above the maximum', 'All', 'Request rejected with the limit error'],
    ['Amount with decimals (e.g. 100.67)', 'All', 'Processed exactly, or rejected, as your method pack says'],
    ['Repeated <code>merchantRefNo</code>', 'All', 'Request rejected as a duplicate'],
    ['Hosted page, return to your site, and an expired link', 'Hosted', 'Page loads; customer returns to your result page; expired link is handled'],
    ['Callback received a second time', 'All', 'Your system doesn\'t credit or pay twice'],
    ['INR payout type and amount rules (Individual / Corporate)', 'INR payouts', 'Each payout is accepted or rejected as your limits sheet says'],
  ];
  return `<h1>Stage 3 · Test cases</h1>
<p class="lead">Run each test that applies to your integration on LPL, within your test limits. Record the transaction ID and result, then post them in your integration group — we check each result on our side.</p>
<table><thead><tr><th>#</th><th>Test</th><th>Applies to</th><th>Expected result</th><th>Passed</th></tr></thead><tbody>${
  T.map((r, i) => `<tr><td>${i + 1}</td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td><input type="checkbox" data-ck="s3-${i}" aria-label="Test ${i + 1} passed"></td></tr>`).join('')
}</tbody></table>
<p>Error codes you should see: duplicate reference <code>${(errorBy('legacy', /duplicate merchantRefNo/i) || {}).ErrorCode || '—'}</code>, wrong hash <code>${(errorBy('legacy', /hash does not match/i) || {}).ErrorCode || '—'}</code> — full list in <a href="#/legacy/errors">Error codes</a>.</p>
${doneWhen('every test that applies shows a pass, and every question you raised has been answered.')}`;
};

G['go-live'] = () => `<h1>Stage 4 · Go-live readiness &amp; sign-off</h1>
${checklist('s4', [
  'All applicable test cases in <a href="#/guide/testing">Stage 3</a> have passed.',
  'Our QA team has completed an end-to-end check of the payment journey on your website.',
  'Your finance team can reconcile transactions from the back-office reports — balances, payouts and, if applicable, prefunding.',
  'Your payment page shows the correct method names and payment instructions for customers.',
  'Your team knows how to view transactions and balances in the back office, and <a href="#/guide/support">how to raise an issue</a>.',
  'Any open questions are answered or have an agreed date.',
])}
<h2>Sign-off</h2>
<p>Both teams sign off before production credentials are issued:</p>
${table(['Party', 'Signs off'], [
  ['Merchant — technical', 'Integration and test results'],
  ['Merchant — business / operations', 'Payment journey, reconciliation'],
  ['PayFuture — Tech Integration', 'Test results verified on our side'],
  ['PayFuture — Customer Success', 'Accounts and back office ready'],
  ['PayFuture — Account manager', 'Commercial readiness'],
])}`;

G.production = () => `<h1>Stage 5 · Moving to production</h1>
${checklist('s5', [
  'You receive your <b>LP MID and new credentials</b> through a secure channel. Confirm you have received every part.',
  'Your production server IPs are whitelisted for the LP MID.',
  'Your configuration uses the LP MID, the secret and the endpoint. LPL credentials are kept for testing only.',
  'You can log in to the production back office and see the LP MID and its balance.',
  'For payouts: your production payout balance is funded and shows in the back office.',
  'A small live deposit (and a payout, if applicable) has run on the LP MID.',
  'The <b>first live callback</b> arrived and its signature verified.',
  'You told us in your integration group when you started sending production traffic.',
])}
${doneWhen('your first live transactions and callbacks are confirmed on the LP MID.')}`;

G['after-go-live'] = () => `<h1>After go-live</h1>
<ul>
<li>For the first <b>90 days</b>, we monitor your approval rate and processing times, and contact you if we see a problem.</li>
<li>We notify you in advance, in your integration group, of any change that affects you: payment methods, limits, API fields, endpoints or credentials.</li>
<li>Keep your callback endpoint and IP whitelist up to date. Tell us before you change your server IPs or callback URL.</li>
<li>Contact us before rotating credentials or adding new countries or methods.</li>
</ul>
<p>Day-to-day: reconcile with <a href="#/guide/reconciliation">balance &amp; transaction list</a>, and use <a href="#/guide/support">Support &amp; raising issues</a> when something looks wrong.</p>`;

G.support = () => `<h1>Support &amp; raising issues</h1>
<h2>Who to contact</h2>
${table(['Team', 'For', 'Contact', 'Hours'], SUPPORT)}
<p>Your <b>integration group</b> on Telegram is the main channel during integration — both teams see the same status there.</p>
<h2>How to raise an issue</h2>
<p>Post in your integration group with these details, so we can find the transaction and answer the first time:</p>
${table(['Include', 'Example'], [
  ['Environment and MID', 'LP, MID 123'],
  ['PayFuture transaction ID, or your <code>merchantRefNo</code>', 'INV… / your reference'],
  ['Date and time, with time zone', '2026-10-19 14:05 UTC'],
  ['What you expected, and what happened', '“Expected APPROVED callback, received none”'],
  ['Request and response (<b>remove your MID secret</b>)', 'JSON'],
  ['Error code and message, if any', '<code>11031 hash does not match</code>'],
  ['For hash errors: your pre-hash string with the secret removed', '<code>123~REF001~100.00~PKR~***</code>'],
])}
<div class="callout warn"><p>Please don't post passwords, MID secrets or customers' personal data in the group. Our team will never ask for your passwords in chat.</p></div>
<h2>PayFuture website</h2>
<p>${ext(WEB.home, 'payfuture.net')} · ${ext(WEB.about, 'About')} · ${ext(WEB.solutions, 'Solutions')} · ${ext(WEB.countries, 'Countries')} · ${ext(WEB.industries, 'Industries')} · ${ext(WEB.newsroom, 'Newsroom')}</p>
<p>${ext(WEB.terms, 'Terms and conditions')} · ${ext(WEB.privacy, 'Privacy policy')} · ${ext(WEB.cookies, 'Cookies')}</p>`;

/* ==========================================================================
   Products — from the PayFuture product offering pages (coverage.payfuture.net)
   ========================================================================== */
const stageRow = stages => `<ol class="steps">${stages.map(([t, d]) => `<li><b>${t}</b>${d}</li>`).join('')}</ol>`;

G['legacy-products'] = () => {
  const ccs = Object.keys(PD.payinMethods);
  const p2p = PD.payinMethodsP2P || {};
  return `<h1>Legacy: Gaming, Forex &amp; P2P</h1>
<p class="lead">Collect payments from your end users, pay funds out to your end users, and settle your own fee.</p>
${stageRow([
  ['Accept', 'Accept payments across emerging markets using local payment methods your customers already trust.'],
  ['Disburse', 'Send fast, secure, localised payouts to customers, sellers, partners and vendors.'],
  ['Settle', 'Once a pay-in is approved, fees, refunds and chargebacks are deducted to calculate the net settlement amount, reflected in your available balance in near real time. You request a transfer to your settlement account from the back office. Currently available for INR (T+5), PKR (T+1) and NGN (T+3).'],
])}
<h2>Pay-in methods by country</h2>
<p>Commercial specs per method.</p>
${ccs.map(cc => `<div class="country"><h3>${FLAGS[NAME_OF[cc]] || ''} ${NAME_OF[cc] || cc}</h3>${specTable(cc, PD.payinMethods[cc])}
  ${p2p[cc] ? `<h4>P2P merchants</h4>${specTable(cc, p2p[cc])}<p class="src">P2P fees: ${p2p[cc].map(m => `${esc(m.name)} — ${esc((m.cap || {}).fees || '—')}`).join(' · ')}</p>` : ''}</div>`).join('')}
<h2>Payouts</h2>
${table(['Market', 'Method', 'Integration', 'Min', 'Max', 'Settlement', 'Fields required'], (PD.payoutSpecsTable || []).map(r => [r.market, esc(r.method), r.integration, r.min, r.max, r.settlement, esc(r.fieldsRequired)]))}
<p>Build it: <a href="#/guide/hosted">Hosted checkout</a> · <a href="#/guide/seamless">Seamless</a> · <a href="#/legacy/overview">Legacy API reference</a></p>`;
};

