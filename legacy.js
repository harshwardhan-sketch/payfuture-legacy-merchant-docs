/* Legacy (IG) — a complete, self-contained product guide + its API reference, under #/legacy/…
   Everything here is Legacy-only: data from document.paygate10.com (data.js, flow "legacy"),
   commercial specs from the Gaming / Forex / P2P product offering, and the Go-Live Checklist.
   Generic guide pages are reused through relink(), which points their links at this section. */

const LF = 'legacy';
const LG = {};

/* guide page id → Legacy page id */
const TO_LEGACY = {
  'how-it-works': 'how-it-works', 'payin-flows': 'payin-flows', 'payout-flows': 'payout-flows',
  onboarding: 'journey', 'before-you-start': 'stage-1', 'quickstart-payin': 'quickstart-payin', 'quickstart-payout': 'quickstart-payout',
  'build-rules': 'build-rules', hosted: 'hosted', seamless: 'seamless', payouts: 'payouts-guide', 
  callbacks: 'callbacks', refunds: 'refunds', reconciliation: 'reconciliation', testing: 'testing', 'go-live': 'go-live',
  production: 'production', 'after-go-live': 'after-go-live', 'hash-help': 'hash-help', faq: 'faq', support: 'support', choose: 'start',
};
const relink = html => html
  .replace(/#\/guide\/([a-z0-9-]+)/g, (m, id) => TO_LEGACY[id] ? `#/legacy/${TO_LEGACY[id]}` : m)
  .replace(/#\/legacy\/overview\b/g, '#/legacy/start')
  .replace(/#\/(guide|legacy)\/(methods|products|legacy-products)\b/g, '#/methods');
const reuse = id => () => relink(G[id]());

const LEGACY_MARKETS = () => Object.entries(methodMatrix())
  .filter(([, v]) => [...Object.values(v.payin), ...Object.values(v.payout)].some(x => x.flows.has(LF)))
  .map(([c]) => c).sort();
const legacyOnly = o => Object.values(o).filter(x => x.flows.has(LF));

/* ---------- Welcome ---------- */
LG.start = () => `<div class="pf-banner">${fig('payins-hero.webp', 'PayFuture Gateway')}<div class="pf-banner-text"><h1>Legacy · PayFuture Gateway</h1><p>Integration guide and API reference for merchants connecting directly to the PayFuture Gateway (IG).</p></div></div>
<p class="lead">Accept local payments and send payouts across ${LIVE.length} live markets through one endpoint. Built for gaming, forex and P2P merchants.</p>
<h2>Live markets</h2>
${liveFlags()}
<p>Methods, limits, demos and videos for each market are in <a href="#/methods">Payment methods</a>.</p>
<h2>Connection details</h2>
${table(['Setting', 'Value'], [
  ['Production endpoint', `<code>${esc(prodUrl(LF) || '')}</code>`],
  ['Method', '<code>POST</code>, <code>Content-Type: application/json</code>'],
  ['Version header', '<code>api-version: 2.0</code>'],
  ['Test environment', 'LPL — live with small limits (see <a href="#/legacy/journey">Integration journey</a>)'],
  ['Signing', 'HMAC-SHA256 <code>X-Callback-Signature</code> header, or a SHA-256 <code>hash</code> per request. See <a href="#/legacy/signing">Signing &amp; hash calculator</a>'],
])}
<h2>Before you start</h2>
<p>Read <a href="#/legacy/how-it-works">How payments work</a> for the core ideas, then follow the <a href="#/legacy/journey">integration journey</a>. Every page ends with a link to the next one.</p>
<p class="src">Migrating from PG10? See <a href="#/legacy/pg10">PG10 compatibility</a>. Source of the API content: ${ext('https://document.paygate10.com/', 'document.paygate10.com')}.</p>`;

/* ---------- Reused generic pages (relinked to this section) ---------- */
['how-it-works', 'payin-flows', 'build-rules', 'seamless', 'callbacks', 'reconciliation', 'go-live', 'production', 'after-go-live']
  .forEach(id => { LG[id] = reuse(id); });
LG['stage-1'] = reuse('before-you-start');

/* ---------- Legacy-specific pages ---------- */
LG.journey = () => `<h1>Integration journey</h1>
<p class="lead">Every Legacy integration moves through five stages, from kickoff to live processing. Your integration group on Telegram is where both teams track progress.</p>
${table(['Stage', 'What happens', 'Environment', 'You move on when'], [
  ['<a href="#/legacy/stage-1">1. Before you start</a>', 'We exchange details, documents and credentials', '—', 'You have everything in Stage 1, and your first API call works'],
  ['<a href="#/legacy/build-rules">2. Build</a>', 'You connect to the Gateway API', 'LPL', 'Requests and callbacks work end to end'],
  ['<a href="#/legacy/testing">3. Test</a>', 'You run the required test cases', 'LPL: live, real transactions within small limits', 'All test cases pass'],
  ['<a href="#/legacy/go-live">4. Sign-off</a>', 'Both teams review the results and sign off', 'LPL', 'Sign-off is complete'],
  ['<a href="#/legacy/production">5. Production</a>', 'New production credentials and a final check', 'LP: live production', 'First live transactions and callbacks confirmed'],
])}
<div class="grid2">
  <div class="tile"><span class="tag">LPL</span><b>Live Production Limited</b><span>The live system with small per-transaction limits, used for building and testing. Transactions are real — use only the test wallets, accounts or amounts agreed with PayFuture.</span></div>
  <div class="tile"><span class="tag">LP</span><b>Live Production</b><span>Full production, with a <b>new MID and new credentials</b> issued after sign-off. Plan for the switch in your configuration.</span></div>
</div>
<p>Commercial onboarding comes first: ${ext(WEB.contact, 'contact sales')}, complete the compliance review and sign the agreement. Your PayFuture team then opens your integration group and Stage 1 starts.</p>`;

LG['quickstart-payin'] = () => {
  const hostedIdx = recipeIdx(LF, /^Payin · Request Hash · All Hosted/), cbIdx = recipeIdx(LF, /^Payin · Callback Hash/);
  return `<h1>Quickstart: your first pay-in</h1>
<p class="lead">Accept a payment with hosted checkout in five steps — one request, one redirect, one callback.</p>
<h2>1. Have these ready</h2>
<ul><li>An LPL <code>midCode</code> and MID secret for the currency you will charge.</li><li>Your server IP whitelisted.</li><li>An HTTPS <code>notificationUrl</code> and a <code>returnUrl</code> result page.</li></ul>
<h2>2. Compute the hash</h2>
<div class="formula"><span>SHA256(midcode~merchantrefno~amount~currency~midsecret)</span>${hostedIdx >= 0 ? `<a href="#/legacy/signing/${hostedIdx}">Try it →</a>` : ''}</div>
<ul><li>Amount with two decimals: <code>100.00</code>.</li><li>MID secret in lower case.</li><li>A new hash for every request.</li></ul>
${tabs([
  ['Node.js', code(`const crypto = require('crypto');
const mid = '123', ref = 'ORDER-1001', amount = '100.00', currency = 'PKR';
const hash = crypto.createHash('sha256')
  .update([mid, ref, amount, currency, process.env.PF_MID_SECRET.toLowerCase()].join('~'))
  .digest('hex');`, 'js')],
  ['Python', code(`import hashlib, os
mid, ref, amount, currency = "123", "ORDER-1001", "100.00", "PKR"
hash_ = hashlib.sha256("~".join([mid, ref, amount, currency, os.environ["PF_MID_SECRET"].lower()]).encode()).hexdigest()`, 'python')],
])}
<h2>3. Send the request</h2>
${code(`curl -X POST '${prodUrl(LF)}' \\
  -H 'Content-Type: application/json' \\
  -H 'api-version: 2.0' \\
  -d '{
  "requestType": "PAYIN",
  "data": {
    "midCode": "123",
    "integrationType": "PG_H",
    "amount": 100.00,
    "currency": "PKR",
    "country": "PK",
    "merchantRefNo": "ORDER-1001",
    "merchantUrl": {
      "notificationUrl": "https://yourshop.example/pf/notify",
      "returnUrl": "https://yourshop.example/checkout/done"
    },
    "userInfo": { "firstName": "Test", "lastName": "User", "email": "test@example.com", "phone": "03001234567" },
    "riskData": { "user_category": "Default", "device_fingerprint": "abc123" },
    "hash": "<from step 2>"
  }
}'`, 'bash')}
<p>Required <code>userInfo</code> fields vary by country and method — see the examples on the <a href="#/legacy/payin">Payin</a> page and your country pack.</p>
<h2>4. Redirect the customer</h2>
<p>Send the customer to <code>data.checkout_url</code>. They return to your <code>returnUrl</code> when done — <b>the return is not proof of payment</b>.</p>
<h2>5. Handle the callback</h2>
<p>We POST <code>application/x-www-form-urlencoded</code> to your <code>notificationUrl</code>. Verify the hash, update the order, reply HTTP 200.</p>
<div class="formula"><span>SHA256(midcode + transactionid + amount + midsecret) — no separator</span>${cbIdx >= 0 ? `<a href="#/legacy/signing/${cbIdx}">Try it →</a>` : ''}</div>
${code(`app.post('/pf/notify', express.urlencoded({ extended: false }), (req, res) => {
  const { sid, txid, amount, status, Ref1, hash } = req.body;
  const expected = crypto.createHash('sha256')
    .update(sid + txid + amount + process.env.PF_MID_SECRET.toLowerCase()).digest('hex');
  if (expected !== hash) return res.status(400).end();
  markOrder(Ref1, status);            // idempotent: the same callback may arrive twice
  res.sendStatus(200);
});`, 'js')}
<div class="callout ok"><p><b>Done.</b> Next: <a href="#/legacy/seamless">seamless pay-ins</a>, <a href="#/legacy/quickstart-payout">your first payout</a>, or the <a href="#/legacy/testing">test cases</a>.</p></div>`;
};

LG['quickstart-payout'] = () => {
  const btIdx = recipeIdx(LF, /^Payout · Request Hash · Seamless Bank Transfer \(Pakistan\)/);
  return `<h1>Quickstart: your first payout</h1>
<p class="lead">Send a bank transfer payout in Pakistan. Every payout method follows the same pattern — only the beneficiary fields and the hash recipe change.</p>
<h2>1. Check your balance</h2>
<p>Payouts are paid from your balance. Call <a href="#/legacy/balance">GetBalance</a> (hash <code>SHA256(midcode~midsecret)</code>) and check <code>available_instant_payout_balance</code>.</p>
<h2>2. Get the bank code</h2>
<p>Call <a href="#/legacy/op-get-bank-list">GetBankList</a> with <code>transaction_type</code> <code>withdrawal</code>. Use the returned <code>processor_bankcode</code> as <code>bank_code</code>.</p>
<h2>3. Compute the hash</h2>
<div class="formula"><span>SHA256(midcode~account_name~account_number~bank_code~amount~currency~midsecret)</span>${btIdx >= 0 ? `<a href="#/legacy/signing/${btIdx}">Try it →</a>` : ''}</div>
<h2>4. Send the payout</h2>
${code(`{
  "requestType": "PAYOUT",
  "data": {
    "midCode": "123",
    "integrationType": "S",
    "amount": 5000.00,
    "currency": "PKR",
    "country": "PK",
    "merchantRefNo": "PO-1001",
    "merchantUrl": { "notificationUrl": "https://yourshop.example/pf/notify" },
    "paymentMethod": "BT",
    "paymMethodFields": {
      "account_number": "<account number or IBAN>",
      "account_name": "<account holder name>",
      "bank_code": "<processor_bankcode from GetBankList>"
    },
    "hash": "<from step 3>"
  }
}`)}
<p>Use the test accounts agreed for LPL. Whether your method accepts decimals is in your country pack.</p>
<h2>5. Wait for the final status</h2>
<p>The response is usually <code>PENDING</code>. The final result arrives on your <code>notificationUrl</code> with <code>key</code>, <code>payoutid</code>, <code>reference1</code>, <code>amount</code>, <code>status</code>, <code>utrnumber</code> and <code>hash</code> (<code>SHA256(midcode + transactionid + amount + midsecret)</code>, no separator). If it is late, poll <a href="#/legacy/op-get-status">Get Status</a> with <code>transaction_type</code> <code>payout</code>.</p>`;
};

LG.hosted = () => {
  const M = methodMatrix();
  const rows = Object.entries(M).filter(([c]) => LIVE.some(l => l[0] === c)).map(([c, v]) => [`${FLAGS[c] || ''} ${c}`, legacyOnly(v.payin).filter(x => x.mode === 'Hosted').map(x => esc(x.name)).join('<br>')]).filter(r => r[1]);
  return `<h1>Hosted checkout</h1>
<p class="lead">Send one <code>PAYIN</code> with <code>integrationType: "PG_H"</code>; we return a <code>checkout_url</code> where the customer picks a method and pays.</p>
<h2>When to use it</h2><ul><li>The fastest integration.</li><li>No card or wallet details touch your systems.</li><li>We show the methods available in the customer's country.</li></ul>
<h2>Rules</h2>
<ul><li><code>returnUrl</code> is required.</li><li>No <code>paymentMethod</code> / <code>paymMethodFields</code> needed.</li><li>One request hash for every hosted pay-in: <code>SHA256(midcode~merchantrefno~amount~currency~midsecret)</code>.</li><li>The response hash includes the checkout URL: <code>…~txnstatus~amount~checkouturl~midsecret</code>.</li><li>Some responses return <code>checkout_html</code> (for example a QR code) to embed instead of redirecting.</li><li>Create a new link for each attempt; handle expired links.</li></ul>
<h2>Hosted methods by country</h2>
${table(['Country', 'Methods on the hosted page'], rows)}
<p>Field tables and examples: <a href="#/legacy/payin">Payin reference</a>.</p>`;
};

LG['payout-flows'] = () => `<h1>Payout flows</h1>
<p class="lead">A payout sends money from your PayFuture balance to a bank account or wallet. Payouts are always server-to-server: you send the beneficiary details, we validate, check your balance, and pay through the local rail.</p>
${seq(['Your server', 'PayFuture', 'Bank / wallet', 'Beneficiary'], [
  [0, 0, 'Check balance (GetBalance)'],
  [0, 1, 'PAYOUT (S) + beneficiary + hash'],
  [1, 1, 'Validate fields, hash, balance'],
  [1, 0, 'status PENDING', 'res'],
  [1, 2, 'Submit to local rail'],
  [2, 3, 'Credit account / wallet'],
  [2, 1, 'Result + UTR / reference', 'res'],
  [1, 0, 'Callback: APPROVED / DECLINED + utrnumber', 'res'],
], 'Payout sequence')}
<h2>Payout types</h2>
${table(['Type', 'Where', 'Code', 'Beneficiary details'], [
  ['<b>Bank transfer</b>', '🇳🇬 Nigeria · 🇵🇰 Pakistan · 🇪🇬 Egypt · 🇲🇦 Morocco', '<code>BT</code>', 'Account number, account name, bank code (MA: 24-digit account, code starting MOBT)'],
  ['<b>Net banking</b>', '🇮🇳 India', '<code>NB</code>', 'Account number, name, bank name, IFSC, <code>payout_type</code> Individual / Corporate'],
  ['<b>Mobile wallet</b>', '🇵🇰 Easypaisa / JazzCash · 🇪🇬 · 🇲🇦 · 🇧🇩 · 🇵🇭', '<code>EP</code> / <code>JC</code> / <code>MWALLET</code> / <code>WT</code>', 'Wallet number; PK also a 13-digit CNIC in <code>document_id</code>; MA / BD / PH a bank code'],
  ['<b>Bank deposit</b>', '🇵🇰 Pakistan · 🇪🇬 Egypt', '<code>BD</code>', 'Account details as listed for the method'],
])}
<h2>How payouts are funded</h2>
<p>Approved pay-ins settle, net of fees, refunds and chargebacks, into your balance. Payouts draw on <code>available_instant_payout_balance</code>. You can also withdraw your available balance to your settlement account from the back office.</p>
<h2>Statuses you will see</h2>
${table(['Status', 'Meaning', 'Your action'], [
  ['<code>PENDING</code>', 'Accepted, queued for the rail', 'Wait'],
  ['<code>IN-PROCESS</code>', 'With the bank / wallet', 'Wait; do not resend'],
  ['<code>APPROVED</code>', 'Paid — final; <code>utrnumber</code> is the bank reference', 'Mark paid'],
  ['<code>DECLINED</code>', 'Rejected — final; see <code>remark</code> / <code>errorcode</code>', 'Fix the details; send a new payout with a new reference'],
])}
<p>The callback also tells you <code>payoutby</code>: <b>Instant</b> or <b>Batch</b>.</p>
<h2>Common reasons a payout is rejected</h2>
<ul>
<li>Not enough balance — ${ERR(/insufficient wallet balance/i) || 'insufficient balance'}.</li>
<li>Wrong hash — ${ERR(/hash does not match/i)}. Payout recipes include the beneficiary fields.</li>
<li>Amount outside your limits sheet, or decimals where the method doesn't accept them.</li>
<li>Account or wallet number in the wrong format for the country.</li>
</ul>
<h2>Build it</h2>
<div class="grid3">
  <a class="tile" href="#/legacy/quickstart-payout"><span class="tag">Start</span><b>Quickstart: first payout →</b><span>Balance, bank code, payout, callback.</span></a>
  <a class="tile" href="#/legacy/payouts-guide"><span class="tag">Rules</span><b>Payouts &amp; funding →</b><span>Country rules and limits.</span></a>
  <a class="tile" href="#/legacy/payout"><span class="tag">API</span><b>Payout reference →</b><span>Every field and real example.</span></a>
</div>`;

LG['payouts-guide'] = () => `<h1>Payouts &amp; funding</h1>
<p class="lead">Payouts are paid from your PayFuture balance, built up from your settled pay-ins.</p>
<h2>Instant and batch</h2>
<p>The callback's <code>payoutby</code> tells you whether a payout was processed <b>Instant</b> or in a <b>Batch</b>. <code>GetBalance</code> returns <code>available_instant_payout_balance</code> separately from <code>available_balance</code>.</p>
<h2>Country rules</h2>
${table(['Country', 'Method', 'Rules'], [
  ['🇮🇳 India', 'Net banking', 'Account number, name, bank name, IFSC; <code>payout_type</code> Individual / Corporate; branch and address optional'],
  ['🇳🇬 Nigeria', 'Bank transfer', '10-digit account number, bank code, account name'],
  ['🇵🇰 Pakistan', 'Easypaisa / JazzCash', '11-digit wallet number starting 03; 13-digit CNIC in <code>document_id</code>'],
  ['🇵🇰 Pakistan', 'Bank transfer / deposit', 'Account number or IBAN, account name, bank code'],
  ['🇪🇬 Egypt', 'Mobile wallet', '11-digit number starting 010, 011, 012 or 015; account name'],
  ['🇪🇬 Egypt', 'Bank transfer / deposit', 'Account number (up to 24), account name, bank code'],
  ['🇲🇦 Morocco', 'Bank transfer', '24-digit account number; bank code starting MOBT; account name'],
  ['🇲🇦 Morocco', 'Wallet', '10-digit number starting 06 or 07; bank code starting MOW; account name'],
  ['🇵🇭 Philippines', 'Wallet', '11-digit number starting 09; bank code; account name'],
])}
<h2>Limits and settlement</h2>
<p>Payout limits and settlement times per market are in <a href="#/methods">Payment methods → Payouts</a>. Your limits sheet (Stage 1) is authoritative for your MIDs.</p>`;

LG.refunds = () => `<h1>Refunds</h1>
<p class="lead">Refund an approved pay-in with <code>requestType: "REFUND"</code>, referencing the original <code>transaction_id</code>.</p>
${table(['Field', 'Meaning'], [['<code>transaction_id</code>', 'The pay-in to refund'], ['<code>merchant_ref_no</code>', 'Your unique reference for the refund'], ['<code>refund_amount</code>', 'Amount to refund, 2 decimals'], ['<code>hash</code>', '<code>SHA256(midcode~transaction_id~merchant_ref_no~refund_amount~midsecret)</code>']])}
<p>The response returns the refund's own <code>transaction_id</code> and the <code>parent_transaction_id</code>; the final status arrives by callback (hash <code>SHA256(midcode + transactionid + parent_transactionid + amount + midsecret)</code>, no separator). Refund availability varies by country and method — check your country pack.</p>
<p>Full reference: <a href="#/legacy/refund">Refund API</a>.</p>`;

LG.testing = reuse('testing');

LG['hash-help'] = reuse('hash-help');

LG.faq = () => {
  const q = (t, a) => `<details class="faq"><summary>${t}</summary>${a}</details>`;
  return `<h1>FAQ</h1>
${q('I get an HTML page / 403 instead of JSON.', '<p>Your server IP is not whitelisted, so the request is blocked before it reaches the Gateway. Send your public server IPs (test and production) to your integration group.</p>')}
${q('Where do I get my midCode and MID secret?', '<p>PayFuture issues them: LPL credentials in Stage 1, and a new LP MID and credentials after sign-off. Each MID has its own secret.</p>')}
${q('What are LPL and LP?', '<p><b>LPL</b> (Live Production Limited) is the live system with small limits, used for testing with real transactions. <b>LP</b> is full production. See <a href="#/legacy/journey">Integration journey</a>.</p>')}
${q('I get “hash does not match”.', '<p>See <a href="#/legacy/hash-help">Fixing hash errors</a> and check with the <a href="#/legacy/signing">hash calculator</a>. Still stuck: post your pre-hash string with the secret replaced by <code>***</code> in your integration group.</p>')}
${q('Is returnUrl required for seamless?', '<p>Required for all hosted transactions and for seamless bank transfer / bank deposit. We recommend always sending it.</p>')}
${q('I did not receive a callback.', '<p>Check that your <code>notificationUrl</code> is public HTTPS, allows our callback IPs and returns 200. Then call <a href="#/legacy/op-get-status">Get Status</a>.</p>')}
${q('What value goes in transaction_type for GetStatus?', '<p>Lower case: <code>payin</code> or <code>payout</code> — in the request and in the hash.</p>')}
${q('Can I send decimal amounts?', '<p>Send amounts with two decimals (e.g. <code>100.00</code>), but check your country pack: some methods only accept whole amounts.</p>')}
${q('How do I find bank codes for payouts?', '<p>Call <a href="#/legacy/op-get-bank-list">Get Bank List</a> with <code>transaction_type</code> <code>withdrawal</code>; use <code>processor_bankcode</code>.</p>')}
${q('Which statuses are final?', '<p>Only <code>APPROVED</code> and <code>DECLINED</code>. Everything else means “still in progress”.</p>')}
${q('Which time zone do transaction list dates use?', '<p>IST for merchants registered in India, UTC for everyone else.</p>')}
${q('I am migrating from PG10.', '<p>See <a href="#/legacy/pg10">PG10 compatibility</a> for the field-by-field mapping.</p>')}`;
};

LG.support = reuse('support');

/* ---------- navigation for the Legacy section (guide first, then API reference) ---------- */
const LEGACY_GUIDE_NAV = [
  ['Overview', [['start', 'Welcome'], ['how-it-works', 'How payments work']]],
  ['Payment flows', [['payin-flows', 'Pay-in flows'], ['payout-flows', 'Payout flows']]],
  ['Get started', [['journey', 'Integration journey'], ['stage-1', 'Stage 1 · Before you start'], ['quickstart-payin', 'Quickstart: first pay-in'], ['quickstart-payout', 'Quickstart: first payout']]],
  ['Build', [['build-rules', 'Stage 2 · Build rules'], ['hosted', 'Hosted checkout'], ['seamless', 'Seamless'], ['payouts-guide', 'Payouts & funding'], ['signing', 'Signing & hash calculator']]],
  ['Operations', [['callbacks', 'Callbacks'], ['refunds', 'Refunds'], ['reconciliation', 'Balance & reconciliation']]],
  ['Test and go live', [['testing', 'Stage 3 · Test cases'], ['go-live', 'Stage 4 · Sign-off'], ['production', 'Stage 5 · Production'], ['after-go-live', 'After go-live']]],
  ['Troubleshooting', [['hash-help', 'Fixing hash errors'], ['errors', 'Error codes'], ['faq', 'FAQ'], ['support', 'Support']]],
];
const _nav = nav, _resolve = resolve;
nav = function (flow) {
  if (flow !== LF) return _nav(flow);
  const ops = otherOps(LF).map(s => ['op-' + s.id, s.title]);
  return LEGACY_GUIDE_NAV.concat([
    ['API reference · Requests', [['payin', 'Payin'], ['payout', 'Payout'], ['refund', 'Refund']]],
    ['API reference · Utilities', [['balance', 'Get Balance'], ...ops]],
    ['API reference · More', [['pg10', 'PG10 compatibility']]],
  ]);
};
resolve = function (flow, id) {
  if (flow === LF && LG[id]) return () => LG[id]();
  return _resolve(flow, id);
};

/* company pages are not on this site (About PayFuture opens payfuture.net) */
GUIDE_NAV.length = 0;

/* home: route remaining generic guide links to the Legacy guide */
(() => { const h = docsHome; docsHome = () => relink(h()); })();
