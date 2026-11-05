# PayFuture Developer Docs (Legacy · PayFuture Gateway)

Guides, API reference and tools for merchants integrating directly with the PayFuture Gateway (IG).
A static site with no build step: open `index.html` in a browser, or serve the folder from any static host.

## What's in it

| Tab | Content |
|---|---|
| About PayFuture | Company, solutions, markets, industries (from payfuture.net) |
| Integration guide | Flows, integration journey (5 stages), quickstarts, build rules, methods by country, operations, testing and go-live, troubleshooting |
| API reference | Payin, Payout, Refund, Get Balance, every "Others" request, error codes, PG10 compatibility |

Tools: site-wide search (header button, Ctrl/⌘ K or `/`), signature (HMAC) and body-hash calculators, error-code filter, go-live checklists.

## Files

- `index.html`: page shell
- `styles.css`: design (light and dark, mobile)
- `app.js`: router, API-page renderer, signing page, SHA-256 / HMAC-SHA256 in pure JS
- `guide.js`, `legacy.js`, `home.js`, `about.js`: guide pages, Legacy navigation, home page, company pages
- `search.js`: site-wide search (index built in the browser from every page and every error code)
- `data.js`: **generated** from document.paygate10.com: field tables, hash recipes, examples, error codes
- `assets/`: logo, images, product data from coverage.payfuture.net
- `tools/refresh.sh`: re-imports `data.js` from the live docs
- `REVIEW.md`: **internal, not published** (in `.gitignore`): problems found in the live docs

## Updating the API content

The live docs at document.paygate10.com are the source for the API reference. To pull their latest version:

```sh
sh tools/refresh.sh
```

Then open `index.html`, check the changes, and commit. Needs `curl`, `python3` and Google Chrome.

## Publishing

Any static host works (GitHub Pages, S3/CloudFront, Netlify, nginx). Upload everything except `REVIEW.md` and `tools/`.
Never add secrets, MID secrets, prefunding bank details or internal-only information to the site.
