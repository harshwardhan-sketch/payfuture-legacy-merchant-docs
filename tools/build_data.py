"""Build data.js for the demo docs site from the parsed live docs.

Inputs (made by parse_sites.py from document.paygate10.com = ig):
  <src>/parsed.json, <src>/ig/ErrorCodeList.json
Outputs:
  data.js     window.PF_DATA consumed by index.html
  REVIEW.md   problems found in the live docs, for the docs owner
"""
import json
import re
import sys
from pathlib import Path

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent
SITE_OF = {'legacy': 'ig'}  # Enterprise (ige) removed from the site on 2026-10-26
HOST_OF = {'ig': 'document.paygate10.com'}
PAGE_TITLE = {'index': 'Payin', 'payout': 'Payout', 'refund': 'Refund', 'balance': 'Get Balance', 'other': 'Others'}

parsed = json.loads((SRC / 'parsed.json').read_text())


def load_errors(site):
    text = (SRC / site / 'ErrorCodeList.json').read_text()
    # same comment stripping the live site does before JSON.parse
    text = re.sub(r'\\"|"(?:\\"|[^"])*"|(//.*|/\*[\s\S]*?\*/)', lambda m: '' if m.group(1) else m.group(0), text)
    return json.loads(text)


def strip(s):
    return re.sub(r'<[^>]+>', '', s or '')


def norm(s):
    return re.sub(r'[^a-z0-9]+', ' ', s.lower()).strip()


issues = {'ig': [], 'both': []}


def issue(site, page, msg):
    issues[site].append(f'**{PAGE_TITLE.get(page, page)}**: {msg}')


def check_examples(site, page, examples):
    for ex in examples or []:
        title = ex.get('title')
        for part in ('request', 'response', 'failResponse'):
            raw = ex.get(part)
            if raw is None:
                continue
            try:
                obj = json.loads(raw)
            except ValueError:
                issue(site, page, f'example "{title}" — {part} is not valid JSON')
                continue
            top = list(obj) if isinstance(obj, dict) else []
            if any(k[:1].isupper() for k in top):
                issue(site, page, f'example "{title}" — {part} uses PascalCase keys ({", ".join(top[:3])}…); API v2 uses camelCase')
            if 'request_type' in top or 'midcode' in top:
                issue(site, page, f'example "{title}" — {part} is in the old PG10 (v1) format')
            data = obj.get('data') or obj.get('Data') or {}
            h = isinstance(data, dict) and (data.get('hash') or data.get('Hash'))
            if isinstance(h, str) and len(h) != 64 and part != 'failResponse':
                issue(site, page, f'example "{title}" — {part} hash is {len(h)} characters; a SHA-256 hex hash is 64')
            for e in obj.get('error') or []:
                code = str(e.get('errorCode', ''))
                if code.startswith('15') and obj.get('requestType'):
                    issue(site, page, f'example "{title}" — v2 {part} returns v1 error code {code} ("{e.get("errorMessage")}")')


def hash_recipes(site):
    """All SHA256(...) formulas on a site, labelled by page / h3 / h4."""
    out = []
    for page in PAGE_TITLE:
        h3 = h4 = op = ''
        for sec in parsed[site][page]['sections']:
            if page == 'other' and sec['id'] not in ('introduction', 'endpoint', 'request-body', 'response-body'):
                op = sec['title']
            h3 = h4 = ''  # headings reset per section
            for b in sec['blocks']:
                if b['kind'] == 'h3':
                    h3, h4 = strip(b['html']), ''
                elif b['kind'] == 'h4':
                    h4 = strip(b['html'])
                elif b['kind'] == 'pre' and strip(b['html']).strip().upper().startswith('SHA256('):
                    kind = h3 if 'Hash' in h3 or 'Signature' in h3 else 'Request Hash'
                    label = ' · '.join(x for x in (op or PAGE_TITLE[page], kind, h4 if h4 != 'Instructions:' else '') if x)
                    out.append({'page': page, 'label': label, 'formula': strip(b['html']).strip()})
    return out


def check_site(site):
    for page, d in parsed[site].items():
        for sec in d['sections']:
            for b in sec['blocks']:
                if b['kind'] == 'p' and re.match(r'^(<b>)?\s*(Production )?URL:?\s*(</b>)?\s*(<code>\s*</code>)?\s*$', b['html']):
                    issue(site, page, f'{"sandbox" if page == "sandbox" else "production"} URL is blank')
        check_examples(site, page, d['examples'])


for s in SITE_OF.values():
    check_site(s)

errors = {s: load_errors(s) for s in SITE_OF.values()}

# Found by hand while writing the guides (not detectable by the checks above).
issues['both'] += [
    '**Get Status `transaction_type` casing** — the example sends `"PAYIN"`, the hash instructions say lower case.',
    '**Get Transaction List `transaction_type`** — table allows deposit / withdrawal / refund / chargeback, but the deposit example sends `"payin"`.',
    '**returnUrl** — documented as hosted + seamless bank transfer/deposit only, but Slack (2026-08-21) reports a seamless method rejecting requests without it.',
]

data = {
    'flows': {
        flow: {
            'site': site,
            'source': HOST_OF[site],
            'pages': parsed[site],
            'recipes': hash_recipes(site),
            'errors': errors[site],
        } for flow, site in SITE_OF.items()
    }
}
(OUT / 'data.js').write_text('/* Generated by tools/build_data.py from the live docs. Do not edit by hand. */\nwindow.PF_DATA = '
                             + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')

lines = ['# Review notes: live merchant docs', '',
         'Generated by `tools/build_data.py` while importing document.paygate10.com (IG / Legacy). Each item is a problem in the **live** docs that the demo '
         'currently reproduces as-is. Fix it at the source, or decide the correct value, before publishing.', '']
for key, head in (('ig', 'IG — document.paygate10.com'), ('both', 'Found while writing the guides')):
    lines += [f'## {head}', ''] + [f'- {m}' for m in dict.fromkeys(issues[key])] + ['']
(OUT / 'REVIEW.md').write_text('\n'.join(lines))

print('data.js', (OUT / 'data.js').stat().st_size, 'bytes')
for k, v in issues.items():
    print(k, len(set(v)), 'issues')
