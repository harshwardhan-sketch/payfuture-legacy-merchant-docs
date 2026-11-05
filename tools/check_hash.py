"""Check which documented formula produces a merchant's request hash.

Usage:
  python3 tools/check_hash.py request.json        # or pipe the JSON on stdin
The MID secret is read with a hidden prompt (or from PF_MID_SECRET). It is never printed.

Paste the request exactly as logged by the gateway (Grafana: LogType API-MerchantRequestReceived, "Request (v2)").
Every SHA256 request recipe from both live docs (data.js) is tried, with common variations
(amount as sent / 2 decimals / 1 decimal; secret as-is / lower-case), and the matches are reported.
"""
import getpass
import hashlib
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ALIASES = {'merchantref': 'merchantrefno', 'transactionid': 'transaction_id', 'account_holder_name': 'account_name'}
SECRET_TOKENS = {'midsecret', 'rcode'}


def load_recipes():
    text = (ROOT / 'data.js').read_text()
    data = json.loads(text[text.index('{'):text.rindex('}') + 1])
    out = []
    for flow, d in data['flows'].items():
        for r in d['recipes']:
            if 'Response' in r['label'] or 'Callback' in r['label']:
                continue
            out.append((f"{'IG' if flow == 'legacy' else 'IGE'} · {r['label']}", r['formula']))
    return out


def flatten(obj, out=None):
    """Lower-cased key -> value for every scalar in the request (nested objects included)."""
    out = {} if out is None else out
    for k, v in (obj or {}).items():
        if isinstance(v, dict):
            flatten(v, out)
        elif v is not None:
            out.setdefault(k.lower(), v)
    return out


def amount_variants(v):
    s = str(v)
    try:
        f = float(v)
    except (TypeError, ValueError):
        return [s]
    return list(dict.fromkeys([s, f'{f:.2f}', f'{f:.1f}', str(int(f)) if f.is_integer() else s]))


def main():
    raw = Path(sys.argv[1]).read_text() if len(sys.argv) > 1 else sys.stdin.read()
    m = re.search(r'\{.*\}', raw, re.S)
    req = json.loads(m.group(0))
    data = req.get('data') or req.get('Data') or req
    fields = flatten(data)
    sent = str(fields.get('hash', '')).lower()
    if not sent:
        sys.exit('No "hash" field found in the request.')

    secret = os.environ.get('PF_MID_SECRET') or getpass.getpass('MID secret (hidden): ')
    if not secret:
        sys.exit('No secret given.')

    print(f"Request: {req.get('requestType') or req.get('RequestType')} · midCode {fields.get('midcode')} · "
          f"method {fields.get('paymentmethod')} · {fields.get('currency')} · amount sent {fields.get('amount')!r}")
    print(f'Hash sent: {sent[:8]}…{sent[-8:]}\n')

    tried = matches = 0
    for label, formula in load_recipes():
        tokens = [t.strip() for t in formula[formula.index('(') + 1:formula.rindex(')')].split('~')]
        resolved = []
        for t in tokens:
            key = ALIASES.get(t.lower(), t.lower())
            if t.lower() in SECRET_TOKENS:
                resolved.append(None)
            elif key in fields:
                resolved.append((key, fields[key]))
            else:
                break
        else:
            amt_opts = amount_variants(fields.get('amount', ''))
            for amt in amt_opts:
                for sec_label, sec in (('secret lower-case', secret.lower()), ('secret as-is', secret)):
                    vals = [sec if r is None else (amt if r[0] == 'amount' else str(r[1])) for r in resolved]
                    h = hashlib.sha256('~'.join(vals).encode()).hexdigest()
                    tried += 1
                    if h == sent:
                        matches += 1
                        shown = '~'.join('<secret>' if r is None else (amt if r[0] == 'amount' else r[0]) for r in resolved)
                        print(f'MATCH  {label}\n       {formula}\n       amount written as "{amt}", {sec_label}\n       signed: {shown}\n')
    print(f'{tried} combinations tried, {matches} match.')
    if not matches:
        print('No documented formula reproduces this hash with this secret. Likely causes: wrong secret for this MID/environment, '
              'a field value differs from what was hashed (e.g. hash reused from another request), or an undocumented formula.')


if __name__ == '__main__':
    main()
