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
- `guide.js`, `legacy.js`, `home.js`: guide pages, Legacy navigation (Integration guide and API reference each get their own side menu), home page. Company content is not copied here: the header's "About PayFuture" link opens payfuture.net
- `methods.js`: Payment methods tab (`#/methods`): Gaming / Forex / P2P → pay-ins, payouts, settlements → country → method, with specs, live demo and end-to-end videos. Replaces coverage.payfuture.net/checkout-demos.html (being sunset). Live markets follow Confluence "Legacy: Live Countries Summary" (PMA 1638170625)
- `demos/`: checkout demos copied from github.com/payfuture-technologies/product-offering (commit 3433522). They show provider brands (approved) and include that repo's Mixpanel tracking
- `search.js`: site-wide search (index built in the browser from every page and every error code)
- `playground.js`: Hash playground (body hash builder, HMAC signature header, hash detective), using the recipes in `data.js`. It has its own header tab and route, `#/playground` (old `#/legacy/playground` links redirect)
- `motion.js`: light animations (reading progress, back to top, cards easing in, stats count-up); all off when the visitor prefers reduced motion
- `data.js`: **generated** from document.paygate10.com: field tables, hash recipes, examples, error codes
- `assets/`: logo, images, product data (`assets/product-data.js`, copied from the product-offering repo's data.js). `guide.js` renames its rows to the method names used on document.paygate10.com and drops provider, wallet-brand and bank names (`PROVIDER_RE`); never show provider names on the site. Photos are WebP, at most 1400px wide; keep new ones small (under ~250 KB)
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
