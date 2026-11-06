/* PayFuture Developer Docs (Legacy · PayFuture Gateway) — renderer.
   Content comes from data.js (generated from the live docs by tools/build_data.py):
     legacy     -> document.paygate10.com (IG)
   Hand-written API-side pages (signing / hash calculator, PG10) live in this file. */

const D = window.PF_DATA.flows;
const TC = '<span class="tc">TO CONFIRM</span>';
const FLOW_NAME = {legacy: 'Legacy'};

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = s => String(s || '').replace(/<[^>]+>/g, '');
const norm = s => strip(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function hl(src, lang) {
  let h = esc(src);
  if (lang === 'json') {
    h = h.replace(/("(?:[^"\\]|\\.)*")(\s*:)?/g, (m, str, colon) => colon ? `<span class="k">${str}</span>${colon}` : `<span class="s">${str}</span>`)
         .replace(/\b(true|false|null|-?\d+(?:\.\d+)?)\b(?![^<]*>)/g, '<span class="n">$1</span>');
  }
  return h;
}
function code(src, lang = 'json') {
  return `<pre><span class="lang">${lang}</span><button class="copy">Copy</button><code style="all:unset">${hl(String(src).trim(), lang)}</code></pre>`;
}
function pretty(raw) {
  try { return {text: JSON.stringify(JSON.parse(raw), null, 2), lang: 'json'}; }
  catch (_) { return {text: raw, lang: 'json'}; }
}
function fields(rows) {
  return `<table><thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>${
    rows.map(([f, t, r, d]) => `<tr><td><code>${f}</code></td><td>${t}</td><td>${
      r === true ? '<span class="req">Required</span>' : r === false ? '<span class="opt">Optional</span>' : r}</td><td>${d}</td></tr>`).join('')
  }</tbody></table>`;
}
function table(head, rows) {
  return `<table><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${
    rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
const ep = (m, p, extra = '') => `<div class="endpoint"><span class="method ${m.toLowerCase()}">${m}</span><span>${p}</span>${extra}</div>`;
let tabSeq = 0;
function tabs(items) {
  const id = 't' + (++tabSeq);
  return `<div class="tabs" data-tabs="${id}">${items.map((t, i) => `<button class="${i ? '' : 'on'}" data-i="${i}">${t[0]}</button>`).join('')}</div>` +
    items.map((t, i) => `<div class="tabpane ${i ? '' : 'on'}" data-pane="${id}-${i}">${t[1]}</div>`).join('');
}

/* ---------- source data accessors ---------- */
const page = (flow, p) => D[flow].pages[p];
const SKIP_OTHER = new Set(['introduction', 'endpoint', 'request-body', 'response-body']);
const otherOps = flow => page(flow, 'other').sections.filter(s => !SKIP_OTHER.has(s.id));

function endpointInfo(flow, p) {
  const sec = page(flow, p).sections.find(s => s.id === 'endpoint');
  const info = {};
  (sec ? sec.blocks : []).forEach(b => {
    const m = strip(b.html).match(/^\s*([^:]+):\s*(.*)$/);
    if (m) info[m[1].trim().toLowerCase()] = m[2].trim();
  });
  return info;
}
const prodUrl = flow => endpointInfo(flow, 'index')['production url'];
const sourceLink = (flow, path = '') => `<p class="src">Source: <a href="https://${D[flow].source}/${path}" target="_blank" rel="noopener">${D[flow].source}/${path}</a></p>`;

/* ---------- generic block rendering ---------- */
function mandatoryCell(v) {
  const t = strip(v).trim();
  if (/^yes$/i.test(t)) return '<span class="badge yes">Yes</span>';
  if (/^no$/i.test(t)) return '<span class="badge no">No</span>';
  if (/^conditional/i.test(t)) return `<span class="badge cond">Conditional</span><span class="cond-note">${v.replace(/^\s*Conditional\s*/i, '')}</span>`;
  return v || '—';
}
function renderTable(b) {
  const mi = b.head.findIndex(h => /mandatory|required/i.test(h));
  return `<table><thead><tr>${b.head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${
    b.rows.map(r => `<tr>${r.map((c, i) => `<td>${i === 0 && !/<code>/.test(c) && b.head[0] === 'Parameter' ? `<code>${c}</code>` : i === mi ? mandatoryCell(c) : c}</td>`).join('')}</tr>`).join('')
  }</tbody></table>`;
}
const fixLinks = h => String(h)
  .replace(/href="(?:index\.shtml)?#request-signature"/g, 'href="#/legacy/signing/hmac"')
  .replace(/href="(payout|refund|balance|other|error-code)\.shtml[^"]*"/g, (m, p) => `href="#/legacy/${{payout: 'payout', refund: 'refund', balance: 'balance', other: 'op-get-status', 'error-code': 'errors'}[p]}"`);
function renderBlocks(flow, blocks) {
  return blocks.map(b => {
    switch (b.kind) {
      case 'h3': return `<h3>${b.html}</h3>`;
      case 'h4': case 'h5': return `<h4>${b.html}</h4>`;
      case 'p': return `<p>${fixLinks(b.html)}</p>`;
      case 'ul': return `<ul>${b.items.map(i => `<li>${fixLinks(i)}</li>`).join('')}</ul>`;
      case 'table': return renderTable(b);
      case 'pre': {
        const f = strip(b.html).trim();
        if (/^X-Callback-Signature:/i.test(f)) return `<div class="formula"><span>${esc(f)}</span><a href="#/${flow}/signing/hmac">Try it →</a></div>`;
        if (/^SHA256\(/i.test(f)) {
          const idx = D[flow].recipes.findIndex(r => r.formula === f);
          return `<div class="formula"><span>${esc(f)}</span>${idx >= 0 ? `<a href="#/${flow}/signing/${idx}">Try it →</a>` : ''}</div>`;
        }
        return code(strip(b.html), 'text');
      }
    }
    return '';
  }).join('');
}
function renderSection(flow, s, level = 'h2') {
  if (s.id === 'introduction') return `<p class="lead">${s.blocks.map(b => strip(b.html || '')).join(' ')}</p>`;
  if (s.id === 'endpoint') return renderEndpoint(flow, s);
  return `<section id="${s.id}"><${level}>${s.title}</${level}>${renderBlocks(flow, s.blocks)}</section>`;
}
function renderEndpoint(flow, s) {
  const info = {};
  s.blocks.forEach(b => { const m = strip(b.html).match(/^\s*([^:]+):\s*(.*)$/); if (m) info[m[1].trim().toLowerCase()] = m[2].trim(); });
  const url = info['production url'] ?? info['url'];
  const label = info['production url'] !== undefined ? 'Production' : 'Sandbox';
  return `<section id="endpoint"><h2>Endpoint</h2>
    ${ep(info['http method'] || 'POST', url ? esc(url) : `&lt;${label.toLowerCase()} URL&gt; ${TC}`)}
    ${info['content-type'] ? table(['Header', 'Value'], [['<code>Content-Type</code>', `<code>${esc(info['content-type'])}</code>`],
      ...(info['header'] ? [[`<code>${esc(info['header'].split(':')[0].trim())}</code>`, `<code>${esc(info['header'].split(':').slice(1).join(':').trim())}</code>`]] : [])]) : ''}
    ${url ? '' : `<div class="callout warn"><p>The ${label.toLowerCase()} URL is blank on ${D[flow].source}.</p></div>`}</section>`;
}
function examplesBox(list, heading = 'Examples') {
  if (!list || !list.length) return '';
  const id = 'ex' + (++tabSeq);
  return `<section id="examples"><h2>${heading}</h2><div class="ex" data-ex="${id}">
    ${list.length > 1 ? `<select aria-label="Choose example">${list.map((e, i) => `<option value="${i}">${esc(e.title)}</option>`).join('')}</select>` : `<b>${esc(list[0].title)}</b>`}
    ${list.map((e, i) => `<div class="expane" data-i="${i}" style="${i ? 'display:none' : ''}">
      ${e.notes ? `<div class="note">${esc(e.notes.replace(/^\(Notes:\s*|\)$/g, ''))}</div>` : ''}
      ${tabs([['Request', code(pretty(e.request).text)], ['Response — success', code(pretty(e.response).text)],
              ...(e.failResponse ? [['Response — fail', code(pretty(e.failResponse).text)]] : [])])}
    </div>`).join('')}
  </div></section>`;
}
function toc(secs, extra = []) {
  const items = secs.filter(s => s.title && s.id !== 'introduction').map(s => [s.id, s.id === 'endpoint' ? 'Endpoint' : s.title]).concat(extra);
  return `<nav class="toc">${items.map(([id, t]) => `<a href="#" data-jump="${id}">${t}</a>`).join('')}</nav>`;
}

/* ---------- API pages from source ---------- */
const API_PAGES = {payin: ['index', 'Payin', './'], payout: ['payout', 'Payout', 'payout.shtml'], refund: ['refund', 'Refund', 'refund.shtml'], balance: ['balance', 'Get Balance', 'balance.shtml']};
function apiPage(flow, key) {
  const [p, title, path] = API_PAGES[key];
  const d = page(flow, p);
  const intro = d.sections.filter(s => s.id === 'introduction'), rest = d.sections.filter(s => s.id !== 'introduction');
  return `<h1>${title}</h1>${intro.map(s => renderSection(flow, s)).join('')}
    ${toc(rest, d.examples && d.examples.length ? [['examples', 'Examples']] : [])}
    ${rest.map(s => renderSection(flow, s)).join('')}
    ${examplesBox(d.examples)}
    ${sourceLink(flow, path === './' ? '' : path)}`;
}
function opPage(flow, opId) {
  const d = page(flow, 'other');
  const s = d.sections.find(x => x.id === opId);
  const ex = (d.examples || []).filter(e => norm(e.title).startsWith(norm(s.title)));
  const common = d.sections.filter(x => SKIP_OTHER.has(x.id) && x.id !== 'introduction');
  return `<h1>${s.title}</h1>${sourceLink(flow, 'other.shtml')}
    ${renderBlocks(flow, s.blocks)}
    ${examplesBox(ex)}
    <h2>Common to all “Others” requests</h2>
    ${common.map(x => renderSection(flow, x, 'h3')).join('')}`;
}

/* ---------- error codes ---------- */
function errorsPage(flow, q = '') {
  const list = D[flow].errors;
  return `<h1>Error codes</h1>${sourceLink(flow, 'error-code.shtml')}
  <p class="lead">Errors are returned in the response <code>error[]</code> array as <code>{ errorCode, errorMessage }</code>. API v2 uses the codes on the left; the PG10 (v1) equivalents are shown for migrating merchants.</p>
  <input class="errsearch" id="errSearch" type="search" placeholder="Search by code or message, e.g. 11031 or hash" aria-label="Search error codes" value="${esc(q)}">
  <p class="count" id="errCount">${list.length} codes</p>
  <table id="errTable"><thead><tr><th>Code</th><th>Message</th><th>v1 code</th><th>v1 message</th></tr></thead><tbody>${
    list.map(e => `<tr><td><code>${esc(e.ErrorCode)}</code></td><td>${esc(e.ErrorMessage || '')}</td><td>${e.v1ErrorCode ? `<code>${esc(e.v1ErrorCode)}</code>` : '—'}</td><td>${esc(e.v1ErrorMessage || '—')}</td></tr>`).join('')
  }</tbody></table>`;
}

/* ---------- navigation ---------- */
function nav(flow) {
  const ops = otherOps(flow).map(s => ['op-' + s.id, s.title]);
  const groups = [
    ['Get started', [['overview', 'Overview'], ['getting-started', 'Integration steps'], ['signing', 'Signing & hash calculator']]],
    ['Transactions', [['payin', 'Payin'], ['payout', 'Payout'], ['refund', 'Refund']]],
    ['Account & utilities', [['balance', 'Get Balance'], ...ops]],
    ['Reference', [['errors', 'Error codes'], ['pg10', 'PG10 compatibility']]],
  ];
  return groups;
}

/* ---------- hand-written guide pages ---------- */
const P = {};

P.signing = f => {
  const R = D[f].recipes;
  const byPage = {};
  R.forEach((r, i) => (byPage[r.label.split(' · ')[0]] ||= []).push([r, i]));
  const sampleBody = '{"requestType":"GetBalance","data":{"midCode":"MID123"}}';
  return `<h1>Signing &amp; hash calculator</h1>
  <p class="lead">Every request must prove it comes from you. You can sign it in one of two ways. Both use the MID secret you get at onboarding, in lower case.</p>
  <div class="grid2">
    <a class="tile" href="#" data-jump="hmac"><span class="tag">One method for all requests</span><b>Option A · Signature header</b><span>Sign the whole request body with HMAC-SHA256 and send it in the <code>X-Callback-Signature</code> header. The same code works for every request type.</span></a>
    <a class="tile" href="#" data-jump="body-hash"><span class="tag">Per request type</span><b>Option B · Body hash</b><span>Join specific fields with <code>~</code>, add your secret and send the SHA-256 in the <code>hash</code> field. Each request type has its own field order.</span></a>
  </div>
  <div class="callout ok"><p><b>New: <a href="#/playground">Hash playground</a>.</b> Build a hash piece by piece, sign a body with HMAC, and let the hash detective tell you why yours doesn't match.</p></div>
  <div class="callout"><p><b>Callbacks carry a body hash.</b> When PayFuture calls your <code>notificationUrl</code>, check its <a href="#" data-jump="callback-recipes">callback hash</a>, whichever option you use to sign your requests.</p></div>

  <section id="hmac"><h2>Option A · Signature header (HMAC)</h2>
  <div class="formula"><span>X-Callback-Signature: sha256=HEX( HMAC-SHA256( key = midsecret, message = raw request body bytes ) )</span></div>
  <ul>
  <li>Serialise the JSON body first, then sign <b>exactly the bytes you send</b> (UTF-8). Changing spaces or key order after signing breaks the signature.</li>
  <li>The MID secret is used in <b>lower case</b>. The hex digest can be lower or upper case. The <code>sha256=</code> prefix is recommended.</li>
  <li>When the header is valid, the <code>hash</code> field in the body is not needed and is ignored.</li>
  <li>When the header is sent but wrong, the request fails with <a href="#/${f}/errors/11031"><code>11031</code> hash does not match</a>, even if the body <code>hash</code> is right.</li>
  <li>When you don't send the header, the body hash (Option B) is checked as before.</li>
  </ul>
  <h3>Try it</h3>
  <div class="calc" id="hmacCalc">
    <label for="hmacBody">Request body, exactly as you send it</label>
    <textarea id="hmacBody" rows="4" spellcheck="false">${esc(sampleBody)}</textarea>
    <label for="hmacSecret">MID secret</label>
    <input id="hmacSecret" type="password" placeholder="paste a TEST secret only" autocomplete="off">
    <div class="out" id="hmacOut"></div>
  </div>
  ${tabs([
    ['Node.js', code(`const crypto = require('crypto');

const body = JSON.stringify(request);               // serialise once
const signature = crypto.createHmac('sha256', process.env.PF_MID_SECRET.toLowerCase())
  .update(body, 'utf8').digest('hex');

await fetch(url, { method: 'POST', body,             // send the same string
  headers: { 'Content-Type': 'application/json', 'api-version': '2.0',
             'X-Callback-Signature': \`sha256=\${signature}\` } });`, 'js')],
    ['Python', code(`import hmac, hashlib, json, os, requests

body = json.dumps(request, separators=(",", ":")).encode("utf-8")
sig = hmac.new(os.environ["PF_MID_SECRET"].lower().encode(), body, hashlib.sha256).hexdigest()
requests.post(url, data=body, headers={"Content-Type": "application/json", "api-version": "2.0",
                                       "X-Callback-Signature": f"sha256={sig}"})`, 'python')],
    ['PHP', code(`<?php
$body = json_encode($request);
$sig  = hash_hmac('sha256', $body, strtolower($secret));
// send $body unchanged with header  X-Callback-Signature: sha256=$sig`, 'php')],
    ['C#', code(`var body = JsonSerializer.Serialize(request);
var bodyBytes = Encoding.UTF8.GetBytes(body);
var signature = Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(midsecret.ToLowerInvariant()), bodyBytes)).ToLowerInvariant();
var content = new ByteArrayContent(bodyBytes);
content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
content.Headers.Add("X-Callback-Signature", "sha256=" + signature);`, 'csharp')],
  ])}
  </section>

  <section id="body-hash"><h2>Option B · Body hash</h2>
  <ul>
  <li>Join the values with <code>~</code> in the documented order and take the SHA-256 hex digest.</li>
  <li><b>Callback hashes</b> join the values <b>without any separator</b>.</li>
  <li>Amounts are written with 2 decimals, e.g. <code>10.00</code> or <code>15.99</code>.</li>
  <li>The MID secret is used in <b>lower case</b>.</li>
  <li>The order differs per request type and payment method. Always use the recipe for your exact case.</li>
  </ul>
  <h3>Try it</h3>
  <p>Pick a recipe, fill in your values and compare the result with your code. Everything runs in your browser; nothing is sent.</p>
  <div class="calc">
    <label for="calcRecipe">Recipe</label>
    <select id="calcRecipe">${Object.entries(byPage).map(([g, rs]) => `<optgroup label="${esc(g)}">${rs.map(([r, i]) => `<option value="${i}">${esc(r.label.split(' · ').slice(1).join(' · ') || r.label)} — ${esc(r.formula)}</option>`).join('')}</optgroup>`).join('')}</select>
    <div class="grid" id="calcFields"></div>
    <label for="calcSecret">MID secret</label>
    <input id="calcSecret" type="password" placeholder="paste a TEST secret only" autocomplete="off">
    <div class="out" id="calcOut"></div>
  </div>
  <h3>Sample code</h3>
  ${tabs([
    ['Node.js', code(`const crypto = require('crypto');

// values in the documented order, secret last (lower case)
function pfHash(values, secret, sep = '~') {
  return crypto.createHash('sha256').update([...values, secret.toLowerCase()].join(sep), 'utf8').digest('hex');
}

pfHash(['MID123', 'ORD-0001', '100.00', 'PKR'], process.env.PF_MID_SECRET);       // request
pfHash([mid, txid, amount], process.env.PF_MID_SECRET, '');                      // callback`, 'js')],
    ['Python', code(`import hashlib, os

def pf_hash(values, secret, sep="~"):
    return hashlib.sha256(sep.join([*values, secret.lower()]).encode()).hexdigest()

pf_hash(["MID123", "ORD-0001", "100.00", "PKR"], os.environ["PF_MID_SECRET"])`, 'python')],
    ['PHP', code(`<?php
function pf_hash(array $values, string $secret, string $sep = '~'): string {
    $values[] = strtolower($secret);
    return hash('sha256', implode($sep, $values));
}`, 'php')],
    ['Java', code(`String input = String.join("~", "MID123", "ORD-0001", "100.00", "PKR", secret.toLowerCase());
byte[] d = MessageDigest.getInstance("SHA-256").digest(input.getBytes(StandardCharsets.UTF_8));
String hash = HexFormat.of().formatHex(d); // Java 17+`, 'java')],
  ])}
  </section>
  <h2>All body-hash recipes</h2>
  ${Object.entries(byPage).map(([g, rs]) => `<h3>${esc(g)}</h3>${rs.map(([r, i]) => `<h4>${esc(r.label.split(' · ').slice(1).join(' · '))}</h4><div class="formula"${/Callback/.test(r.label) ? ` data-cb` : ''}><span>${esc(r.formula)}</span><a href="#/${f}/signing/${i}">Try it →</a></div>`).join('')}`).join('')}`
    .replace('<div class="formula" data-cb>', '<div class="formula" id="callback-recipes">');
};

P.pg10 = () => `
<h1>PG10 compatibility</h1>
<p class="lead">For merchants moving from the PG10 API. New integrations should use API v2 as documented on these pages.</p>
${table(['PG10 (v1)', 'API v2'], [
  ['Header <code>X-Version</code>', 'Header <code>api-version: 2.0</code>'],
  ['<code>request_type</code>: <code>deposit</code> / <code>withdrawal</code>', '<code>requestType</code>: <code>PAYIN</code> / <code>PAYOUT</code>'],
  ['<code>midcode</code>', '<code>midCode</code>'],
  ['<code>merchant_ref_no</code>', '<code>merchantRefNo</code>'],
  ['<code>checkout_type</code>: <code>Hosted</code> / <code>Seamless</code>', '<code>integrationType</code>: <code>PG_H</code> / <code>S</code>'],
  ['<code>payby</code>', '<code>paymentMethod</code>'],
  ['<code>notification_url</code>, <code>returnurl</code>', '<code>merchantUrl.notificationUrl</code>, <code>merchantUrl.returnUrl</code>'],
  ['<code>custom_field_1</code> … <code>custom_field_6</code>', '<code>customField.customField1</code> … <code>customField5</code>'],
  ['<code>risk_data</code>', '<code>riskData</code>'],
  ['Error codes <code>15xxx</code>', 'Error codes <code>11xxx</code> — mapping in <a href="#/legacy/errors">Error codes</a>'],
])}
<p>Hashing is unchanged in principle (SHA-256 over <code>~</code>-joined fields with the MID secret), but recipes are per method — use the <a href="#/legacy/signing">v2 recipes</a>.</p>`;

/* ---------- landing ---------- */
function landing() { return ''; }

/* ---------- router ---------- */
const app = document.getElementById('app');
function resolve(flow, id) {
  if (API_PAGES[id]) return () => apiPage(flow, id);
  if (id && id.startsWith('op-')) return () => opPage(flow, id.slice(3));
  if (id === 'errors') return arg => errorsPage(flow, arg ? decodeURIComponent(arg) : '');
  return P[id] ? () => P[id](flow) : null;
}
/* phones hide the header tabs, so the slide-out menu repeats them at the top */
const mobileTabs = () => `<div class="mtabs">${[...document.querySelectorAll('#switch a')].map(a => `<a href="${a.getAttribute('href')}" data-tab="${a.dataset.tab}">${a.textContent}</a>`).join('')}<a href="https://www.payfuture.net/" target="_blank" rel="noopener">About PayFuture ↗</a></div>`;
/* Sections: '' = docs home, 'guide' = About PayFuture pages, 'legacy' = Legacy guide + API reference (legacy.js). */
function render() {
  const [, sec, id, arg] = (location.hash || '#/').split('/');
  document.body.classList.remove('menu');
  const setTab = tab => document.querySelectorAll('#switch a, .mtabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  setTab(null);
  /* old links: the playground and the methods/products pages are now their own tabs; company pages live on payfuture.net */
  const MOVED = {'legacy/playground': '#/playground', 'legacy/methods': '#/methods', 'legacy/products': '#/methods'};
  if (MOVED[sec + '/' + id]) { location.replace(MOVED[sec + '/' + id]); return; }
  if (sec === 'guide') { location.replace('#/'); return; }
  /* full-width tool pages without a side menu */
  const SOLO = {playground: ['Hash playground', () => LG.playground()], methods: ['Payment methods', () => PM.page()]};
  if (SOLO[sec]) {
    app.innerHTML = `<div class="layout solo" data-sec="${sec}"><nav class="side">${mobileTabs()}</nav><main>${SOLO[sec][1]()}</main></div>`;
    setTab(sec); document.title = SOLO[sec][0] + ' · PayFuture Docs'; window.scrollTo(0, 0); afterRender(sec); return;
  }
  const isGuide = sec === 'guide' && typeof GUIDE_NAV !== 'undefined';
  if (!isGuide && !D[sec]) {
    app.innerHTML = typeof docsHome === 'function' ? docsHome() : landing();
    document.title = 'PayFuture Developer Docs'; window.scrollTo(0, 0); afterRender('home'); return;
  }
  /* each header tab has its own side menu: the Integration guide never lists API reference pages, and vice versa */
  const tabOf = g => /^API reference/.test(g) ? 'api' : 'docs';
  const all = isGuide ? GUIDE_NAV : nav(sec);
  const inAll = all.flatMap(([g, items]) => items.map(i => [i[0], g])).find(i => i[0] === id);
  const tab = inAll ? tabOf(inAll[1]) : 'docs';
  const groups = isGuide ? all : all.filter(([g]) => tabOf(g) === tab);
  const label = isGuide ? 'About PayFuture' : FLOW_NAME[sec];
  const flat = groups.flatMap(([g, items]) => items.map(i => [...i, g]));
  /* a guide page reachable by link but not listed in the menu still opens (instead of falling back to the first page) */
  const cur = flat.find(i => i[0] === id) || (isGuide && id && G[id] ? [id, id, 'Guides'] : flat[0]);
  const idx = flat.indexOf(cur), prev = flat[idx - 1], next = flat[idx + 1];
  const body = isGuide ? G[cur[0]]() : resolve(sec, cur[0])(arg);
  const pager = `<div class="pager">${prev ? `<a href="#/${sec}/${prev[0]}"><small>Previous</small>${prev[1]}</a>` : '<span></span>'}${next ? `<a href="#/${sec}/${next[0]}" style="text-align:right"><small>Next</small>${next[1]}</a>` : ''}</div>`;
  const label2 = `${cur[1]} · ${label} · PayFuture Docs`;
  /* Same section already on screen: swap only the content, so the left menu keeps its scroll position. */
  setTab(isGuide ? 'about' : tab);
  const layout = app.querySelector('.layout');
  if (layout && layout.dataset.sec === sec + '-' + tab) {
    layout.querySelector('main').innerHTML = `<div class="crumb">${label === cur[2] ? label : `${label} · ${cur[2]}`}</div>${body}${pager}`;
    const side = layout.querySelector('nav.side');
    side.querySelectorAll('a[href^="#/' + sec + '/"]').forEach(a => a.classList.toggle('on', a.getAttribute('href') === `#/${sec}/${cur[0]}`));
    const on = side.querySelector('a.on');
    if (on && (on.offsetTop < side.scrollTop || on.offsetTop > side.scrollTop + side.clientHeight - 40)) side.scrollTop = on.offsetTop - side.clientHeight / 3;
    document.title = label2;
    window.scrollTo(0, 0);
    afterRender(cur[0], arg);
    return;
  }
  const sideTop = isGuide ? '' : `<div class="side-product">${tab === 'api' ? 'API reference' : 'Integration guide'} <small>PayFuture Gateway · IG</small></div>`;
  app.innerHTML = `<div class="layout" data-sec="${sec}-${tab}">
    <nav class="side">${mobileTabs()}${sideTop}<input id="navFilter" type="search" placeholder="Filter this menu" aria-label="Filter the menu by page title">
      ${groups.map(([g, items]) => `<h4>${g.replace(/^API reference · /, '')}</h4>${items.map(([pid, t]) => `<a href="#/${sec}/${pid}" class="${pid === cur[0] ? 'on' : ''}">${t}</a>`).join('')}`).join('')}
    </nav>
    <main><div class="crumb">${label === cur[2] ? label : `${label} · ${cur[2]}`}</div>${body}${pager}</main></div>`;
  setTab(isGuide ? 'about' : tab); /* again, for the menu's own tab row */
  document.title = label2;
  window.scrollTo(0, 0);
  afterRender(cur[0], arg);
}
window.addEventListener('hashchange', render);

/* ---------- error filter: every word must match (code, message or v1 code) ---------- */
function filterErrors() {
  const box = document.getElementById('errSearch'); if (!box) return;
  const words = box.value.toLowerCase().split(/\s+/).filter(Boolean); let n = 0;
  document.querySelectorAll('#errTable tbody tr').forEach(tr => {
    const t = tr.textContent.toLowerCase(), show = words.every(w => t.includes(w));
    tr.style.display = show ? '' : 'none'; n += show;
  });
  const total = document.querySelectorAll('#errTable tbody tr').length;
  document.getElementById('errCount').textContent = n === total ? `${total} codes` : n ? `${n} of ${total} codes` : 'No codes match. Try a code number or one word from the message.';
}

/* ---------- after every render ---------- */
function afterRender(pageId, arg) {
  /* soft fade-in for the new page content */
  const m = document.querySelector('#app main') || document.getElementById('app');
  m.classList.remove('enter'); void m.offsetWidth; m.classList.add('enter');
  /* wrap tables so they fill the frame and scroll sideways on small screens */
  document.querySelectorAll('#app table').forEach(t => { if (!t.parentElement.classList.contains('tw')) { const w = document.createElement('div'); w.className = 'tw'; t.replaceWith(w); w.appendChild(t); } });
  if (pageId === 'signing') initCalc(document.querySelector('.layout')?.dataset.sec.split('-')[0], arg);
  if (pageId === 'errors') filterErrors();
  document.dispatchEvent(new CustomEvent('pf:rendered', {detail: {pageId, arg}}));
}

/* ---------- UI events ---------- */
document.addEventListener('click', e => {
  const c = e.target.closest('.copy');
  if (c) { navigator.clipboard?.writeText(c.parentElement.querySelector('code').innerText); c.textContent = 'Copied'; setTimeout(() => c.textContent = 'Copy', 1200); }
  const tb = e.target.closest('.tabs button');
  if (tb) {
    const id = tb.parentElement.dataset.tabs, i = tb.dataset.i;
    tb.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === tb));
    document.querySelectorAll(`[data-pane^="${id}-"]`).forEach(p => p.classList.toggle('on', p.dataset.pane === `${id}-${i}`));
  }
  const ds = e.target.closest('[data-search]');
  if (ds) { e.preventDefault(); window.openSearch?.(ds.dataset.search); }
  const j = e.target.closest('[data-jump]');
  if (j) { e.preventDefault(); document.getElementById(j.dataset.jump)?.scrollIntoView({behavior: 'smooth', block: 'start'}); }
});
document.addEventListener('change', e => {
  const box = e.target.closest('.ex');
  if (box && e.target.tagName === 'SELECT') box.querySelectorAll('.expane').forEach(p => p.style.display = p.dataset.i === e.target.value ? '' : 'none');
});
document.addEventListener('input', e => {
  if (e.target.id === 'navFilter') {
    const q = e.target.value.toLowerCase().trim(), side = e.target.closest('nav.side'); let any = 0;
    side.querySelectorAll('h4').forEach(h => {
      let n = h.nextElementSibling, shown = 0;
      while (n && n.tagName === 'A') { const ok = n.textContent.toLowerCase().includes(q); n.style.display = ok ? '' : 'none'; shown += ok; n = n.nextElementSibling; }
      h.style.display = shown ? '' : 'none'; any += shown;
    });
    let none = side.querySelector('.side-none');
    if (!none) { none = document.createElement('p'); none.className = 'side-none'; e.target.after(none); }
    none.innerHTML = any ? '' : `No page titles match. <a href="#" data-search="${esc(e.target.value)}">Search all the docs for “${esc(e.target.value)}” →</a>`;
    none.style.display = any ? 'none' : '';
  }
  if (e.target.id === 'errSearch') filterErrors();
});
document.getElementById('menuBtn').onclick = () => document.body.classList.toggle('menu');
document.getElementById('themeBtn').onclick = () => {
  const r = document.documentElement, dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  /* switch colours instantly: no element should animate its colours on a theme change */
  r.classList.add('theme-switching'); r.dataset.theme = dark ? 'light' : 'dark'; void r.offsetWidth;
  setTimeout(() => r.classList.remove('theme-switching'), 0);
  try { localStorage.setItem('pf-theme', r.dataset.theme); } catch (_) {}
};
try { const t = localStorage.getItem('pf-theme'); if (t) document.documentElement.dataset.theme = t; } catch (_) {}

/* ---------- SHA-256 (pure JS: works offline and on file://) ---------- */
const sha256 = (() => {
  const primes = []; for (let n = 2; primes.length < 64; n++) { let p = true; for (let d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; } if (p) primes.push(n); }
  const frac = x => ((x - Math.floor(x)) * 4294967296) >>> 0;
  const K = primes.map(p => frac(Math.cbrt(p))), H0 = primes.slice(0, 8).map(p => frac(Math.sqrt(p)));
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  return input => {
    const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input, l = bytes.length;
    const buf = new Uint8Array(((l + 9 + 63) >> 6) << 6); buf.set(bytes); buf[l] = 0x80;
    const dv = new DataView(buf.buffer); dv.setUint32(buf.length - 4, (l * 8) >>> 0); dv.setUint32(buf.length - 8, Math.floor(l / 536870912));
    const H = H0.slice(), W = new Uint32Array(64);
    for (let i = 0; i < buf.length; i += 64) {
      for (let t = 0; t < 16; t++) W[t] = dv.getUint32(i + t * 4);
      for (let t = 16; t < 64; t++) { const a = W[t - 15], b = W[t - 2]; W[t] = (W[t - 16] + (rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3)) + W[t - 7] + (rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10))) >>> 0; }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + W[t]) >>> 0;
        const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, j) => H[j] = (H[j] + v) >>> 0);
    }
    const out = new Uint8Array(32); H.forEach((x, j) => new DataView(out.buffer).setUint32(j * 4, x));
    return typeof input === 'string' || !sha256.raw ? [...out].map(b => b.toString(16).padStart(2, '0')).join('') : out;
  };
})();
/* raw-bytes digest, used by HMAC */
const sha256raw = bytes => { sha256.raw = true; try { return sha256(bytes); } finally { sha256.raw = false; } };
/* HMAC-SHA256(key, message) -> hex, both UTF-8 strings */
function hmacSha256(key, msg) {
  const enc = new TextEncoder(); let k = enc.encode(key);
  if (k.length > 64) k = sha256raw(k);
  const pad = v => { const b = new Uint8Array(64); b.set(k); return b.map(x => x ^ v); };
  const cat = (a, b) => { const c = new Uint8Array(a.length + b.length); c.set(a); c.set(b, a.length); return c; };
  const inner = sha256raw(cat(pad(0x36), enc.encode(msg)));
  return [...sha256raw(cat(pad(0x5c), inner))].map(b => b.toString(16).padStart(2, '0')).join('');
}

/* recipe "SHA256(a~b~midsecret~c)" -> {tokens, sep}; callback recipes are space-listed and joined without separator */
function parseRecipe(formula) {
  const inner = formula.replace(/^SHA256\(/i, '').replace(/\)\s*$/, '');
  return inner.includes('~') ? {tokens: inner.split('~').map(s => s.trim()), sep: '~'} : {tokens: inner.split(/\s+/), sep: ''};
}
const isSecret = t => /^(midsecret|rcode)$/i.test(t);
const SAMPLE = {midcode: 'MID123', merchantrefno: 'ORD-0001', merchantref: 'ORD-0001', merchant_ref_no: 'ORD-0001', amount: '100.00', currency: 'PKR', country: 'PK',
  transactionid: 'INVABC1757498791747', transaction_id: 'INVABC1757498791747', txnstatus: 'APPROVED', transaction_type: 'payin', wallet_number: '03001234567'};
function initCalc(flow, preset) {
  const sel = document.getElementById('calcRecipe'); if (!sel) return;
  const box = document.getElementById('calcFields'), sec = document.getElementById('calcSecret'), out = document.getElementById('calcOut');
  if (preset === 'hmac') document.getElementById('hmac')?.scrollIntoView({block: 'start'});
  else if (preset && D[flow].recipes[preset]) { sel.value = preset; sel.closest('.calc').scrollIntoView({block: 'center'}); }
  const hb = document.getElementById('hmacBody'), hs = document.getElementById('hmacSecret'), ho = document.getElementById('hmacOut');
  const hcalc = () => {
    const secret = hs.value.toLowerCase(), body = hb.value;
    let note = '';
    try { JSON.parse(body); } catch (_) { note = '<div class="warnline"><span>check:</span> this is not valid JSON</div>'; }
    ho.innerHTML = `<div><span>bytes signed:</span> ${new TextEncoder().encode(body).length}</div><div><span>header:</span> ${secret ? 'X-Callback-Signature: sha256=' + hmacSha256(secret, body) : 'enter a test secret'}</div>${note}`;
  };
  if (hb) { hb.oninput = hcalc; hs.oninput = hcalc; hcalc(); }
  const recipe = () => parseRecipe(D[flow].recipes[sel.value].formula);
  const draw = () => {
    box.innerHTML = recipe().tokens.filter(t => !isSecret(t)).map(t => `<div><label>${esc(t)}</label><input data-k="${esc(t)}" value="${esc(SAMPLE[t.toLowerCase()] || '')}"></div>`).join('');
    calc();
  };
  const calc = () => {
    const r = recipe(), inputs = [...box.querySelectorAll('input')]; let k = 0;
    const secret = sec.value.toLowerCase();
    const vals = r.tokens.map(t => isSecret(t) ? secret : (inputs[k++]?.value ?? ''));
    const shown = r.tokens.map((t, i) => isSecret(t) ? (secret ? '•'.repeat(Math.min(secret.length, 8)) : '<midsecret>') : vals[i]).join(r.sep);
    out.innerHTML = `<div><span>string to sign:</span> ${esc(shown)}</div><div><span>sha256:</span> ${secret ? sha256(vals.join(r.sep)) : 'enter a test secret'}</div>${r.sep ? '' : '<div><span>note:</span> callback hash — values joined without separator</div>'}`;
  };
  sel.onchange = draw; box.oninput = calc; sec.oninput = calc; draw();
}

window.addEventListener('DOMContentLoaded', render);
