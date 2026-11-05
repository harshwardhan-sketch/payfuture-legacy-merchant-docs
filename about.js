/* "About PayFuture" section — content and images taken from www.payfuture.net
   (home, about-us, solutions/*, countries, industries, countries/india), fetched 2026-10-19.
   Images live in assets/site/. Loaded after guide.js: adds pages to G and a nav group. */

const IMG = f => `assets/site/${f}`;
const fig = (f, alt, cls = '') => `<img class="pf-img ${cls}" src="${IMG(f)}" alt="${esc(alt)}" loading="lazy">`;
const banner = (f, title, sub) => `<div class="pf-banner">${fig(f, title)}<div class="pf-banner-text"><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div></div>`;
const media = (f, alt, body, flip = false) => `<div class="pf-media ${flip ? 'flip' : ''}"><div>${body}</div>${fig(f, alt)}</div>`;
const srcLine = (href, label) => `<p class="src">Source: ${ext(href, label)}</p>`;
const feat = items => `<div class="grid3">${items.map(([t, d, icon]) => `<div class="tile">${icon ? `<img class="pf-icon" src="${IMG(icon)}" alt="" loading="lazy">` : ''}<b>${t}</b><span>${d}</span></div>`).join('')}</div>`;

const FLAGS_SITE = [['India', 'india.svg'], ['Pakistan', 'pakistan.svg'], ['Bangladesh', 'bangladesh.svg'], ['Sri Lanka', 'Sri-Lanka-flag-global-reach.svg'], ['Nepal', 'Nepal.svg'],
  ['Philippines', 'Philippines-1.png'], ['Malaysia', 'Malaysia.svg'], ['Egypt', 'egypt.svg'], ['Morocco', 'Morocco-global-reach-flag-1.svg'], ['Nigeria', 'Nigeria-flag.svg'],
  ['Kenya', 'kenya.svg'], ['South Africa', 'sf.svg'], ['Brazil', 'brazil.svg'], ['Argentina', 'argentina.svg'], ['Mexico', 'mexico.svg']];
const LOGOS = [['Ace Money Transfer', 'Ace-Money-Transfer.svg'], ['APA', 'APA.svg'], ['Faster Payments', 'Faster-Payments.svg'], ['Unigox', 'Unigox.svg'], ['Tamatem', 'Tamatem-1.svg'], ['Profee', 'Profee-1.svg'], ['Pagsmile', 'Pagsmile-1.svg']];
const TEAM = [['Manpreet Haer', 'Co-Founder & Chief Executive Officer', 'Manpreet-haer.png'], ['Jon Bowman', 'Chief Technology Officer', 'Jon-Bowman.png'],
  ['Sid Gautam', 'Chief Revenue Officer', 'Sid-2.webp'], ['Saaly Temirkanov', 'Chief Operating Officer', 'Saaly.webp']];
const SOLUTIONS = [
  ['sol-payins', 'Pay-ins', 'Accept payments with 70+ local payment methods across emerging markets.', 'payins-hero.png'],
  ['sol-payouts', 'Payouts', 'Fast, secure, localised payouts to wallets, cards and bank accounts.', 'payouts-banner.webp'],
  ['sol-crossborder', 'Cross-border payments', 'Compliant fund movement, FX and repatriation across complex corridors.', 'crossborder-hero.png'],
  ['sol-stablecoin', 'Stablecoin payments', 'Settle cross-border faster on regulated stablecoin rails.', 'Stablecoin-copy.webp'],
  ['sol-mass', 'Global mass payments', 'Pay thousands of recipients across markets in a single run.', 'mass-hero.jpg'],
  ['sol-optimisation', 'Authorisation optimisation', 'Smart routing and retries for higher approval rates.', 'optimisation-hero.png'],
  ['sol-reporting', 'Reporting & analytics', '24/7 monitoring, real-time dashboards and alerts.', 'real-time-payments-bg.webp'],
];

/* ---------- pages ---------- */
G.about = () => `${banner('about-hero.jpg', 'The future of payments is now', 'Leading payment solutions for emerging markets')}
<p class="lead">At PayFuture, we’re transforming the landscape of digital payments for online merchants, SMEs, and enterprises across emerging markets. With our innovative technology and deep understanding of local markets, we bridge the gap between global businesses and high-growth economies, enabling seamless, secure, and efficient payment solutions.</p>
<h2>PayFuture by numbers</h2>
<div class="grid3">
  <div class="tile"><span class="stat">250+</span><span>merchants onboarded</span></div>
  <div class="tile"><span class="stat">120+</span><span>employees from over 20 different nationalities</span></div>
  <div class="tile"><span class="stat">4+</span><span>locations worldwide. Headquartered in London</span></div>
</div>
<h2>Trusted by businesses that move money at scale</h2>
<div class="pf-logos">${LOGOS.map(([n, f]) => `<img src="${IMG(f)}" alt="${n}" title="${n}" loading="lazy">`).join('')}</div>
<div class="grid2">
  <div class="tile"><span class="tag">Mission</span><b>Empowering global expansion</b><span>We empower global expansion and exponential growth by offering payment solutions and a comprehensive suite of tools and insights for success in emerging markets. We remove traditional entry barriers for online businesses by providing local pay-ins, pay-outs, and cross-border settlements.</span></div>
  <div class="tile"><span class="tag">Vision</span><b>Commerce without barriers</b><span>We envision a future where geographical and financial barriers no longer prevent businesses from connecting with consumers worldwide. We aim to become the foremost enabler of global commerce in emerging markets, fostering economic growth, financial inclusion, and connectivity worldwide.</span></div>
</div>
<h2>Why emerging markets need a specialist</h2>
${media('emerging-markets.webp', 'Challenges in emerging markets', `<p>PayFuture operates only in emerging markets. We have the technology, experience and expertise to help businesses thrive as they grow in these markets. The challenges are real:</p>
<ul><li>Governments frequently update policies and regulations, affecting businesses' ability to operate efficiently.</li>
<li>Local entities are often required, including local directors, shareholders, and verified office premises.</li>
<li>Tax complexities, filings, and local compliance requirements.</li>
<li>Political stability has a huge impact on the way business is conducted.</li></ul>`)}
<h3>The PayFuture solution</h3>
${feat([
  ['Local payment methods', 'The most popular local payment methods in each region, so businesses can maximise approval rates.'],
  ['One API', 'Connect with PayFuture with just one API, saving time while accessing the most local payment methods in emerging markets.'],
  ['End-to-end market entry', 'Deep market expertise and local partners who manage local entities\' setup and ongoing maintenance — the complex tasks of entering a new market.'],
])}
<h2>A team of innovators</h2>
<p>Our team comprises industry veterans with deep expertise in fintech, payments, and global banking. Together, they bring decades of experience, driving PayFuture’s vision forward and ensuring the highest standards of service for our clients.</p>
<div class="pf-team">${TEAM.map(([n, r, f]) => `<div class="tile">${fig(f, n, 'pf-avatar')}<b>${n}</b><span>${r}</span></div>`).join('')}</div>
${srcLine(WEB.about, 'payfuture.net/about-us')}`;

G.solutions = () => `${banner('main-banner0002.webp', 'Reach billions in emerging markets', 'Business and enterprise payment solutions across high-growth markets')}
<p class="lead">PayFuture provides business and enterprise payment solutions that help companies accept local payment methods, manage online payments, and support international and cross-border transactions across high-growth markets.</p>
<p>Our strength lies in localising payment experiences. Through our <b>Emerging Market Entry Methodology (EMEM)</b>, we remove the common roadblocks of pay-ins, payouts, and cross-border fund repatriation, making market entry faster and more efficient. With a single integration, the PayFuture gateway lets merchants accept and settle payments using the most trusted local methods — from mobile wallets to cash-based options.</p>
<div class="pf-cards">${SOLUTIONS.map(([id, t, d, img]) => `<a class="pf-card" href="#/guide/${id}">${fig(img, t)}<div><b>${t} →</b><span>${d}</span></div></a>`).join('')}</div>
<h2>One API, every flow</h2>
${feat([
  ['Local experience', 'Reach customers in emerging markets with local payment methods they know and trust — improving the customer experience with every transaction.'],
  ['A single payments API', 'Integrate once for payment acceptance, cross-border remittance, local payouts and cross-border profit repatriation across multiple markets.'],
  ['Optimised processing', 'Higher approval rates, fewer failed transactions, and risk management built for enterprise-scale operations — with a global support team available around the clock.'],
])}
<h3>Settlements</h3>
<p>With PayFuture, businesses can manage cross-border settlements with fast, secure and cost-effective onshore and offshore settlement, receiving funds in their preferred currency.</p>
${srcLine(WEB.solutions, 'payfuture.net/solutions')}`;

G['sol-payins'] = () => `${banner('payins-hero.png', 'Accept payments globally with local payment methods')}
<p class="lead">Accept payments online across emerging markets using trusted local payment methods. Improve approval rates and deliver seamless checkout experiences with PayFuture’s payment processing infrastructure.</p>
${media('Payin-infographic_.webp', 'Built for businesses expanding into emerging markets', `<h2>Built for businesses expanding into emerging markets</h2><p>Reaching customers in emerging markets means going beyond cards. PayFuture connects you to <b>2.5bn+ potential shoppers</b> through the most local payment methods — helping you offer trusted, region-specific checkout experiences that drive conversions, reduce drop-offs, and increase approval rates.</p>`)}
<h2>Grow globally with local payment experiences</h2>
${feat([
  ['Localised payment methods', 'Let customers pay with the methods they use every day — no matter the region.'],
  ['Multi-currency acceptance', 'Accept local currencies and settle in your preferred currency.'],
  ['EMI-licensed compliance', 'Trust a platform built to meet regulatory standards across the markets you operate in.'],
])}
<h2>Why businesses choose PayFuture for pay-ins</h2>
<p>Expanding into new markets shouldn’t come with unnecessary complexity. With PayFuture you gain a partner built for scale, speed, and local relevance: <b>higher approval rates</b>, <b>faster expansion</b>, <b>local checkout pages</b> and <b>operational efficiency</b>.</p>
<ul><li>Fast onboarding and responsive support, all through a single API</li><li>70+ local payment methods across emerging markets</li><li>Built-in fraud prevention</li></ul>
<div class="callout"><p><b>Build it:</b> <a href="#/guide/hosted">Hosted checkout</a> · <a href="#/guide/seamless">Seamless</a> · <a href="#/guide/methods">Methods by country</a> · <a href="#/guide/quickstart-payin">Quickstart</a></p></div>
${srcLine(WEB.payins, 'payfuture.net/solutions/pay-ins')}`;

G['sol-payouts'] = () => `${banner('payouts-banner.webp', 'Effortless global payouts for your business')}
<p class="lead">Fast, secure, and localised payouts designed specifically for businesses operating in emerging markets.</p>
${media('Businesses-Expanding.webp', 'Payouts made for emerging markets', `<h2>Payouts made for emerging markets</h2><p>PayFuture simplifies the complexity of global disbursements. Our solution ensures fast, reliable payouts, enabling you to strengthen relationships with your customers and expand your business faster.</p>`)}
<h2>Built for secure, scalable, and seamless payouts</h2>
${feat([
  ['Localised payout options', 'The most popular local methods like mobile wallets and bank transfers, for convenience and higher acceptance.'],
  ['Fraud prevention', 'Transaction security and regulatory compliance through KYC procedures and advanced fraud monitoring.'],
  ['Flexible settlement options', 'Pay out in multiple local currencies while settling internationally in USD or other major currencies.'],
  ['Fast, reliable transfers', 'Disburse funds directly to beneficiaries’ cards, wallets or bank accounts, on time.'],
  ['Reconciliation dashboard', 'Track and manage payouts across regions with customisable dashboards and detailed reporting.'],
  ['We grow with you', 'Scale your business with the flexibility to adapt as you enter new markets.'],
])}
<div class="callout"><p><b>Build it:</b> <a href="#/guide/payouts">Payouts &amp; prefunding</a> · <a href="#/guide/quickstart-payout">Quickstart: first payout</a></p></div>
${srcLine(WEB.payouts, 'payfuture.net/solutions/payouts')}`;

G['sol-crossborder'] = () => `${banner('crossborder-hero.png', 'Cross-border payment solutions for global businesses')}
<p class="lead">Our cross-border payments solution enables businesses to enter and scale in emerging markets by supporting compliant cross-border fund movement in local markets. Built for reliable execution, PayFuture supports seamless commercial flows across high-growth regions.</p>
<h2>The challenges merchants face when scaling internationally</h2>
<ul><li>Many traditional providers struggle with local compliance in emerging markets</li><li>Regulatory complexity and settlement delays</li><li>Limited liquidity and unpredictable operational timelines</li></ul>
${media('Smarter-way.webp', 'A smarter way to move money across borders', `<h2>A smarter way to move money across borders</h2><p>Whether you are entering your first new market or expanding across multiple regions, PayFuture supports every stage of cross-border fund movement. We help businesses navigate regulatory requirements, execute compliant international transfers, and move capital reliably across complex corridors.</p><p>Transfer and repatriate funds efficiently, manage currency conversion, and scale across emerging markets while maintaining regulatory alignment.</p>`)}
<h2>How it works</h2>
<ol class="steps">
<li><b>Talk to our specialists</b>Discuss your expansion plans, target markets, and settlement requirements. We assess your use case and outline how PayFuture can support your growth.</li>
<li><b>Get a bespoke proposal</b>Pricing based on your volumes, markets, and commercial model — no off-the-shelf packages.</li>
<li><b>Go live</b>Access emerging markets through a cross-border setup that supports money movement into the country, regulatory requirements, and scalable operations — without managing multiple providers.</li>
</ol>
<h2>Who it’s for</h2>
<div class="pf-cards">${[
  ['Financial-services.webp', 'Financial services', 'Banks, remittance companies, PSPs and digital-first institutions scale compliant cross-border money movement without managing multiple providers.'],
  ['Global-businesses.webp', 'Global enterprises', 'Unified infrastructure for cross-border operations and settlement — helping finance teams manage FX exposure, liquidity and regulatory complexity.'],
  ['Platform-businesses.webp', 'Platform businesses', 'Manage commercial flows across operating regions, with compliant international transfers and capital repatriation.'],
  ['Global-merchants.webp', 'Global merchants', 'Transfer revenue from international markets into destination currencies efficiently and compliantly.'],
  ['bottom-image.webp', 'Remittance', 'Cross-border fund movement between the EU and selected emerging markets — funding local payout corridors and repatriation where required.'],
].map(([f, t, d]) => `<div class="pf-card">${fig(f, t)}<div><b>${t}</b><span>${d}</span></div></div>`).join('')}</div>
${srcLine(WEB.crossborder, 'payfuture.net/solutions/cross-border-payments')}`;

G['sol-stablecoin'] = () => `${banner('Stablecoin-copy.webp', 'Stablecoin cross-border payments for emerging markets. At scale.')}
<p class="lead">PayFuture is the stablecoin payments infrastructure for global businesses and payment platforms that need to settle cross-border transactions faster in emerging markets — without rebuilding their operations from scratch.</p>
<h2>The real cost of fragmented cross-border payments</h2>
<p>Traditional cross-border payments rely on correspondent banking networks, multiple intermediaries, and settlement windows of two to five business days. In high-growth emerging markets, that’s not a delay — it’s a deal-breaker. Goods and services cross borders in hours; B2B payments should too.</p>
<div class="grid3">
  <div class="tile"><span class="stat">$3B+</span><span>stablecoin payment volume in 2026</span></div>
  <div class="tile"><span class="stat">Regulated</span><span>in key global markets</span></div>
  <div class="tile"><span class="stat">Growing</span><span>emerging market corridors</span></div>
</div>
<p>Our wallets are on-chain, our volume is blockchain-transparent, and our global licences mean the infrastructure you build on is built to last.</p>
<h2>Four steps, in and out of emerging markets</h2>
<ol class="steps">
<li><b>On-ramp</b>Fiat converts into stablecoin through our compliant, regulated infrastructure, with full KYC/AML alignment.</li>
<li><b>Move</b>Funds move across stablecoin payment rails, alongside existing banking infrastructure.</li>
<li><b>Off-ramp</b>Stablecoin converts into local currency at the destination, backed by deep local liquidity pools — no waiting for a correspondent bank to open.</li>
<li><b>Deliver</b>Funds reach the end recipient quickly — often near-instantly — with full visibility, on-chain and auditable.</li>
</ol>
${table(['Without regulated stablecoin infrastructure', 'With PayFuture'], [
  ['Opaque fees and unpredictable FX costs', 'Transparent pricing with consistent FX outcomes'],
  ['Settlement delays of 2–5 business days', 'Near-instant stablecoin settlement'],
  ['Dependence on correspondent banking', 'Direct stablecoin rails, fewer intermediaries'],
  ['Compliance gaps in new corridors', 'Globally regulated infrastructure'],
  ['No visibility into fund movement', 'Blockchain-transparent, on-chain confirmation'],
])}
${fig('Stablecoin-hero-image-3.png', 'Speed, compliance, and control across every corridor', 'pf-wide')}
${srcLine(WEB.stablecoin, 'payfuture.net/solutions/stablecoin-cross-border-payments')}`;

G['sol-mass'] = () => `${banner('mass-hero.jpg', 'Global mass payments for high-volume disbursements')}
<p class="lead">Send payments to thousands of recipients across multiple markets in a single execution — compliantly, efficiently, and without operational friction.</p>
<p>Global mass payments consolidate disbursements to many recipients, countries and currencies into one structured batch — reducing time, cost and manual effort. Businesses rely on them for vendor settlements, partner commissions, supplier payments, affiliate payouts and workforce disbursements.</p>
<h2>Who uses it</h2>
${feat([
  ['Marketplaces & platforms', 'Settle sellers, vendors and merchants across multiple markets simultaneously.'],
  ['Gig & on-demand', 'Disburse earnings, tips and incentives to contractors and freelancers globally.'],
  ['Affiliate & partner networks', 'Monthly commission and reward payouts across regions.'],
  ['E-commerce & retail', 'Supplier and logistics partner settlements across corridors.'],
  ['Financial services & fintech', 'High-volume client disbursements, refunds and treasury flows.'],
  ['SaaS & B2B services', 'Revenue share, rebates and platform payouts.'],
])}
<h2>How PayFuture supports it</h2>
<ul><li><b>Batch execution</b> to thousands of recipients across corridors from a single platform.</li><li><b>Multi-currency</b> with clear FX fees and defined conversion pathways.</li><li><b>Compliance</b> across recipient jurisdictions — documentation, KYC and local frameworks.</li><li><b>Real-time tracking</b> of settled, pending and failed payments.</li><li><b>API integration</b> with your ERP, marketplace or financial stack.</li></ul>
<h2>Three steps</h2>
<ol class="steps"><li><b>Upload</b>Recipient list, amounts, currencies and documentation, through the platform or API.</li><li><b>Validate</b>Check payment details, confirm FX rates and review compliance flags.</li><li><b>Execute</b>PayFuture processes the batch across corridors and reports settlement status for the whole run.</li></ol>
${srcLine(WEB.mass, 'payfuture.net/solutions/global-mass-payments')}`;

G['sol-optimisation'] = () => `${banner('optimisation-hero.png', 'Optimise every transaction for higher approvals')}
<p class="lead">Boost approval rates and reduce lost revenue with data-driven authorisation strategies designed for emerging markets.</p>
<p>Authorisation failures are a key source of revenue leakage. PayFuture combines intelligent routing, smart retry logic, adaptive authentication and real-time monitoring to recover more transactions — and convert more customers.</p>
<h2>Strategies that power higher approval rates</h2>
${feat([
  ['Intelligent routing', 'Route transactions to the processors or banks most likely to approve, based on card type, issuer and region.'],
  ['Checkout recovery', 'Real-time tools that re-engage customers before they abandon checkout.'],
  ['Fewer false declines', 'Fraud models that preserve approval rates while keeping risk low.'],
])}
<h2>Built for emerging markets</h2>
<p>Where card infrastructure varies, one failed transaction can mean lost business. Dynamic routing, adapting to local payment behaviours, and real-time monitoring of approval patterns help more transactions succeed the first time — with merchant-specific optimisation, a single API, data-driven insights and market-specific checkout pages.</p>
${srcLine(WEB.authopt, 'payfuture.net/solutions/authorisation-optimisation')}`;

G['sol-reporting'] = () => `${banner('real-time-payments-bg.webp', 'Smarter payment decisions with real-time insights')}
<p class="lead">Full visibility into your payment performance with real-time analytics and reporting — to act faster, reduce costs and drive profitability.</p>
${media('eporting-and-analytics-img.webp', '24/7 transaction monitoring', `<h2>24/7 transaction monitoring</h2><p>PayFuture’s expert monitoring team tracks transaction traffic in real time, 24/7, 365 days a year, to ensure seamless processing and rapid response to any issues. Even during peak periods, we optimise payment flows to reduce declines, prevent drop-offs and maximise conversion.</p>`)}
<h2>Stay informed with real-time insights</h2>
${feat([
  ['Transaction analytics', 'Analyse individual transactions and spot trends across merchants and processors.'],
  ['Settlement & reconciliation data', 'Transaction, payout, reconciliation and settlement data in one interface.'],
  ['Processor management', 'Automate load balancing and prioritise processors from a single dashboard.'],
  ['Alerts', 'WhatsApp, Slack or Telegram notifications for no transactions, high decline rates or approval delays.'],
  ['Mobile dashboard', 'Approval ratios, statuses and performance metrics — anytime, anywhere.'],
  ['Reports & KPIs', 'Dashboards, charts and exportable reports to track performance.'],
])}
<div class="callout"><p><b>Via the API:</b> <a href="#/guide/reconciliation">Balance &amp; reconciliation</a> (GetBalance, GetTransactionList).</p></div>
${srcLine(WEB.reporting, 'payfuture.net/solutions/reporting-and-analytics')}`;

G.markets = () => `${banner('countries-banner.webp', 'Unlock opportunities in emerging markets with confidence', 'Regions where 85% of the world’s population resides')}
<p class="lead">PayFuture focuses on high-population, underbanked regions where governments are driving financial inclusion and reducing cash dependency. By bridging the gap between global merchants and local markets, we fuel rapid growth in online payments.</p>
<div class="grid4">
  <div class="tile"><b>In &amp; out</b><span>On-ramp and off-ramp</span></div>
  <div class="tile"><b>One integration</b><span>Single API, many markets</span></div>
  <div class="tile"><b>Stablecoin optional</b><span>Fiat or stablecoin rails</span></div>
  <div class="tile"><b>Regulated</b><span>Compliant by design</span></div>
</div>
<h2>Our global reach</h2>
<div class="pf-flags">${FLAGS_SITE.map(([n, f]) => { const live = ISO[n] && (typeof methodMatrix === 'function') && methodMatrix()[n]; return `<div class="pf-flag">${fig(f, n)}<span>${n}</span>${live ? '<em>API docs</em>' : ''}</div>`; }).join('')}</div>
<p class="src">“API docs” = markets with published API documentation on this site. See <a href="#/guide/methods">Methods by country</a>.</p>
<h2>Cross-border payments, both directions</h2>
${feat([
  ['Collections', 'Collect funds across emerging markets through local rails — the on-ramp into your cross-border flows.'],
  ['Mass payouts', 'Pay suppliers, partners and people across regions — the off-ramp to the last mile.'],
  ['Settlement & FX', 'Convert and settle across currencies and corridors — with transparency built in.'],
])}
<h2>Live corridors</h2>
<div class="grid2">
  <div class="tile"><div class="pf-corridor">${fig('Chinese-flag-1.png', 'China')}<span>→</span>${fig('India-flag.png', 'India')}</div><b>China → India</b><span>Supplier settlements, treasury transfers and B2B payments.</span></div>
  <div class="tile"><div class="pf-corridor">${fig('USA-flag.png', 'USA')}<span>→</span>${fig('India-flag.png', 'India')}</div><b>USA → India</b><span>Vendor, supplier and treasury payments.</span></div>
</div>
<h2>Market spotlight: India</h2>
${media('payment-upi.svg', 'UPI', `<p>One of the world’s fastest-growing digital economies, with widespread UPI adoption and a mobile-first population. In March 2025 alone, UPI processed over 18.3 billion transactions worth more than ₹27.1 trillion (about USD 325 billion).</p>
<ul><li><b>UPI</b> — India’s real-time mobile payment system and its most popular payment method.</li><li><b>Net banking</b> — access to 70+ banks in India for deposits and payouts.</li><li><b>Cross-border</b> — compliant fund movement out of India, with an RBI-authorised Payment Aggregator – Cross Border (PA-CB) partner.</li></ul>`)}
${srcLine(WEB.countries, 'payfuture.net/countries')} ${srcLine(WEB.home.replace(/\/$/, '') + '/countries/india/', 'payfuture.net/countries/india')}`;

G.industries = () => `<h1>Industries &amp; partners</h1>
<p class="lead">PayFuture supports businesses across e-commerce, platforms, travel and regulated industries that need reliable online and international payment solutions in emerging markets.</p>
<div class="pf-cards">${[
  ['em-img01.png', 'E-learning'], ['em-img02.png', 'Streaming'], ['Travel.png', 'Travel'], ['video-gaming.png', 'Video gaming'], ['Remittance.png', 'Remittance providers'],
].map(([f, t]) => `<div class="pf-card">${fig(f, t)}<div><b>${t}</b></div></div>`).join('')}</div>
<p>We also work with money transfer and remittance providers, regulated video streaming providers, shared economy platforms and subscription businesses.</p>
<h2>Channel partners</h2>
<p>We collaborate with industry partners to extend our reach and enhance payment solutions.</p>
<div class="grid4">${[
  ['ic__001.svg', 'Payment gateways'], ['ic__002.svg', 'Licensed payment processors'], ['ic__003.svg', 'Acquirers'], ['ic__004.svg', 'Referral partners and agents'],
].map(([f, t]) => `<div class="tile"><img class="pf-icon" src="${IMG(f)}" alt="" loading="lazy"><b>${t}</b></div>`).join('')}</div>
${srcLine(WEB.industries, 'payfuture.net/industries')}`;

/* nav: an "About PayFuture" group first, solutions as their own group */
(() => {
  const ov = GUIDE_NAV.find(g => g[0] === 'Overview');
  if (ov) ov[1] = ov[1].filter(([id]) => id !== 'about');
  GUIDE_NAV.unshift(
    ['About PayFuture', [['about', 'Who we are'], ['solutions', 'Solutions overview'], ['markets', 'Markets & corridors'], ['industries', 'Industries & partners']]],
    ['Solutions', SOLUTIONS.map(([id, t]) => [id, t])],
  );
})();
