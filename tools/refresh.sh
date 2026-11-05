#!/bin/sh
# Re-import the Legacy API content from document.paygate10.com into data.js (and REVIEW.md).
# Needs: curl, python3, Google Chrome (used headless to read the examples, which live in page scripts).
# Usage: sh tools/refresh.sh
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
WORK=$(mktemp -d)
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$WORK/ig"
cd "$WORK/ig"
for p in index payout refund balance other error-code sandbox; do
  f="$p.shtml"; [ "$p" = index ] && f=""
  curl -sfL -m 30 -o "$p.html" "https://document.paygate10.com/$f"
done
curl -sfL -m 30 -o ErrorCodeList.json https://document.paygate10.com/src/ErrorCodeList.json
for p in index payout refund balance other; do
  python3 "$ROOT/tools/extract_examples.py" "$p.html" "$p.ex.html"
  "$CHROME" --headless=new --disable-gpu --dump-dom "file://$WORK/ig/$p.ex.html" 2>/dev/null \
    | python3 "$ROOT/tools/extract_examples.py" --read > "$p.examples.json"
done
cd "$ROOT"
python3 tools/parse_sites.py "$WORK" | tail -7
python3 tools/build_data.py "$WORK"
rm -rf "$WORK"
echo "Done. Open index.html to check, then commit."
