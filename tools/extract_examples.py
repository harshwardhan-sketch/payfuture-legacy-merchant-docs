"""Helper for refresh.sh.
  extract_examples.py page.html out.html  -> writes a tiny page that evaluates the page's examplesData array
  extract_examples.py --read              -> reads Chrome's --dump-dom of that page from stdin, prints the JSON
"""
import html, json, re, sys

if sys.argv[1] == '--read':
    t = sys.stdin.read()
    m = re.search(r'<pre id="o">(.*?)</pre>', t, re.S)
    print(html.unescape(m.group(1)) if m else '{"examplesData": []}')
else:
    raw = open(sys.argv[1], encoding='utf-8').read()
    m = re.search(r'(?:const|let|var)\s+examplesData\s*=\s*(\[.*?\n\s*\]);', raw, re.S)
    arr = m.group(1) if m else '[]'
    open(sys.argv[2], 'w', encoding='utf-8').write(
        '<html><body><pre id=o></pre><script>const examplesData=' + arr +
        ';document.getElementById("o").textContent=JSON.stringify({examplesData});</script></body></html>')
