# Marketing & SEO Features

This document outlines the marketing and SEO features implemented in Tradyxa Aztryx.

---

## 1. PWA (Progressive Web App) Support

**File:** `client/public/manifest.json`

Users can install Tradyxa as a standalone app on:
- Chrome/Edge desktop (via "Install App" button)
- Android home screen
- iOS Safari (Add to Home Screen)

**Features:**
- Custom app icon (uses favicon.png)
- Standalone display mode (no browser UI)
- Theme color: `#00b3d6` (cyan accent)
- Dark background: `#0b0e14`

---

## 2. SEO Meta Tags

**File:** `client/index.html`

### Open Graph (Facebook, LinkedIn, WhatsApp)
```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://tradyxa-betax.pages.dev/" />
<meta property="og:title" content="Tradyxa Aztryx - Next-Gen Quant Trading Dashboard" />
<meta property="og:description" content="Free stock analysis for NIFTY, BankNifty & 500+ Indian stocks..." />
<meta property="og:image" content="https://tradyxa-betax.pages.dev/og-image.png" />
```

### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Tradyxa Aztryx - Next-Gen Quant Trading Dashboard" />
<meta name="twitter:image" content="https://tradyxa-betax.pages.dev/og-image.png" />
```

---

## 3. JSON-LD Structured Data

**File:** `client/index.html`

Rich Google results with app info:
- Application type: FinanceApplication
- Price: Free (₹0)
- Features list: NIFTY Analysis, 500+ Stocks, AI Signals, etc.
- Organization: Zeta Aztra Technologies

---

## 4. Share Buttons

**File:** `client/src/components/ShareButtons.tsx`

Dashboard header includes:
- **Tweet button** - Shares analysis with pre-filled text
- **WhatsApp button** - Opens WhatsApp with share message

**Example share text:**
> 📊 NIFTY Analysis: BULLISH signal on Tradyxa Aztryx! Check out this free stock analysis dashboard for NIFTY, BankNifty & 500+ Indian stocks.

---

## 5. Static SEO Files

| File | Purpose |
|------|---------|
| `client/public/robots.txt` | Allows all crawlers, points to sitemap |
| `client/public/sitemap.xml` | Lists pages for Google indexing |
| `client/public/og-image.png` | Social media preview image |
| `client/public/favicon.png` | Browser tab icon |
| `client/public/manifest.json` | PWA configuration |

---

## Next Steps (Not Yet Implemented)

- [ ] Google Analytics 4
- [ ] Google Search Console submission
- [ ] Microsoft Clarity (free heatmaps)
- [ ] Email newsletter signup
- [ ] Social media accounts (@TradyxaAztryx)

---

*Last updated: December 2024*
