"""Parse document.paygate10.com (ig) pages into structured JSON blocks."""
import html, json, re, sys
from html.parser import HTMLParser

SITES = sys.argv[1]          # dir containing ig/ and ige/
PAGES = ['index', 'payout', 'refund', 'balance', 'other', 'error-code', 'sandbox']

INLINE = {'code', 'strong', 'b', 'em', 'i', 'span', 'a', 'br', 'sup', 'sub', 'u'}


class Blocks(HTMLParser):
    """Turns <main> into sections -> [blocks]. Blocks: h3/h4/p/pre/ul/table."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections, self.sec = [], None
        self.in_main = 0
        self.cap = None            # current capture: dict(kind, buf)
        self.table = None
        self.cell = None
        self.list = None
        self.skip = 0              # inside script/style/template/button

    # inline html kept for code/strong/a/br
    def _emit(self, s):
        if self.cell is not None:
            self.cell.append(s)
        elif self.list is not None and self.list[-1] is not None:
            self.list[-1].append(s)
        elif self.cap is not None:
            self.cap['buf'].append(s)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style', 'template', 'button', 'svg'):
            self.skip += 1
            return
        if self.skip:
            return
        if tag == 'main':
            self.in_main += 1
            return
        if not self.in_main:
            return
        if tag == 'section':
            self.sec = {'id': a.get('id', ''), 'title': '', 'blocks': []}
            self.sections.append(self.sec)
        elif tag in ('h2', 'h3', 'h4', 'h5', 'p', 'pre') and self.cell is None and self.list is None:
            self.cap = {'kind': tag, 'buf': []}
        elif tag == 'table':
            self.table = {'kind': 'table', 'head': [], 'rows': []}
        elif tag == 'tr' and self.table is not None:
            self.table['rows'].append([])
        elif tag in ('td', 'th') and self.table is not None:
            self.cell = []
        elif tag in ('ul', 'ol') and self.table is None:
            self.list = [None]
        elif tag == 'li' and self.list is not None:
            self.list.append([])
        elif tag in INLINE:
            if tag == 'br':
                self._emit('<br>')
            elif tag == 'code':
                self._emit('<code>')
            elif tag in ('strong', 'b'):
                self._emit('<b>')
            elif tag == 'a' and a.get('href'):
                self._emit('<a href="%s">' % html.escape(a['href'], quote=True))

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'template', 'button', 'svg'):
            self.skip = max(0, self.skip - 1)
            return
        if self.skip or not self.in_main:
            if tag == 'main':
                self.in_main -= 1
            return
        if tag == 'main':
            self.in_main -= 1
            return
        if tag == 'code':
            self._emit('</code>')
        elif tag in ('strong', 'b'):
            self._emit('</b>')
        elif tag == 'a':
            self._emit('</a>')
        elif tag in ('h2', 'h3', 'h4', 'h5', 'p', 'pre') and self.cap and self.cap['kind'] == tag:
            text = ''.join(self.cap['buf'])
            text = text.strip() if tag == 'pre' else re.sub(r'\s+', ' ', text).strip()
            if text and self.sec is not None:
                if tag == 'h2' and not self.sec['title']:
                    self.sec['title'] = text
                else:
                    self.sec['blocks'].append({'kind': tag, 'html': text})
            self.cap = None
        elif tag in ('td', 'th') and self.cell is not None:
            txt = re.sub(r'\s+', ' ', ''.join(self.cell)).strip()
            if tag == 'th' and self.table['rows'] and not self.table['head'] and len(self.table['rows']) == 1:
                self.table['rows'][-1].append(txt)
            else:
                self.table['rows'][-1].append(txt)
            self.cell = None
        elif tag == 'table' and self.table is not None:
            rows = [r for r in self.table['rows'] if r]
            if rows:
                self.table['head'], self.table['rows'] = rows[0], rows[1:]
            if self.sec is not None:
                self.sec['blocks'].append(self.table)
            self.table = None
        elif tag in ('ul', 'ol') and self.list is not None:
            items = [re.sub(r'\s+', ' ', ''.join(i)).strip() for i in self.list[1:] if i is not None]
            if self.sec is not None and items:
                self.sec['blocks'].append({'kind': 'ul', 'items': items})
            self.list = None

    def handle_data(self, data):
        if self.skip or not self.in_main:
            return
        self._emit(html.escape(data, quote=False))


def parse_examples(raw):
    """examplesData is a JS array literal of {title, notes, request, response}; evaluate safely via a tiny JS->JSON pass."""
    m = re.search(r'(?:const|let|var)\s+examplesData\s*=\s*(\[.*?\n\s*\]);', raw, re.S)
    return m.group(1) if m else None


out = {}
for site in ('ig',):
    out[site] = {}
    for page in PAGES:
        raw = open(f'{SITES}/{site}/{page}.html', encoding='utf-8').read()
        raw = re.sub(r'(?s)<!--.*?-->', '', raw)          # drop commented-out (hidden) content
        p = Blocks()
        p.feed(raw)
        secs = [s for s in p.sections if s['title'] or s['blocks']]
        ex = None
        try:
            ex = json.load(open(f'{SITES}/{site}/{page}.examples.json')).get('examplesData')
        except Exception:
            pass
        out[site][page] = {'sections': secs, 'examples': ex}
json.dump(out, open(f'{SITES}/parsed.json', 'w'), indent=1, ensure_ascii=False)

for site in out:
    for page, d in out[site].items():
        print(site, page, 'sections:', [s['id'] for s in d['sections']], 'examples:', len(d['examples'] or []))
