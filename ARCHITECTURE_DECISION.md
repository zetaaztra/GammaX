# Architecture Decision: JSON vs SQLite

## Current Architecture (Static + Serverless)
**Stack**: GitHub Actions (Data) → JSON Files → Cloudflare Pages (Frontend)

### ✅ Why JSON Files?
1.  **Zero Cost**: Hosted for free on Cloudflare Pages / GitHub Pages.
2.  **Static Serving**: Each ticker is just a URL (`/data/ticker/RELIANCE.NS.json`). The browser fetches exactly what it needs.
3.  **Cache Friendly**: CDNs cache these files aggressively.
4.  **Simple**: No database server to maintain, secure, or pay for.

### ❌ Why NOT SQLite (for this setup)?
1.  **Browser Incompatibility**: Browsers can't "query" a remote SQLite file. They would have to download the **entire** database (200MB+) just to show one stock.
2.  **No Backend**: Cloudflare Pages is static. It doesn't run a Node.js/Python server that could query SQLite for you.
3.  **Complexity**: You'd need to set up a separate VPS (DigitalOcean/AWS) to run a backend API, costing money and maintenance.

## Recommendation
**Stick with JSONs.** The crash is likely a data format issue, not a storage issue. We will fix the data structure.
