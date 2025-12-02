# Tradyxa Aztryx Design Guidelines

## Design Approach
**System Selected**: Custom Financial Analytics System inspired by Bloomberg Terminal and TradingView
**Justification**: Professional financial dashboard requiring dense information display, rapid data scanning, and precision interaction patterns optimized for quantitative analysis.

## Core Design Principles
1. **Information Density First**: Maximize data visibility without clutter
2. **Scan-Optimized Hierarchy**: Enable rapid metric comparison across tiles
3. **Precision Interaction**: Clear states, immediate feedback, no ambiguity
4. **Professional Credibility**: Restrained, data-focused aesthetic avoiding consumer-grade playfulness

---

## Typography System

### Font Families
- **Primary UI**: Inter Variable (400, 500, 600, 700)
- **Data/Metrics**: JetBrains Mono (400, 500) for tabular numerics, code, JSON

### Type Scale
- **Hero Metrics** (Verdict tile direction/points): text-4xl md:text-5xl, font-bold, JetBrains Mono
- **Tile Headers**: text-lg font-semibold, Inter
- **Primary Metrics**: text-2xl md:text-3xl font-bold, JetBrains Mono
- **Secondary Metrics**: text-base font-medium, JetBrains Mono
- **Labels/Captions**: text-sm font-medium, Inter
- **Body Text** (modals, inspector): text-base leading-relaxed, Inter
- **Help Text**: text-xs text-muted, Inter

### Critical Typography Rules
- All numeric values use JetBrains Mono for alignment and scannability
- Metric labels use Inter for readability
- Modal headers: text-xl font-semibold
- Confidence percentages, error ranges: tabular-nums class always

---

## Layout System

### Spacing Primitives
**Core Units**: Tailwind 2, 4, 6, 8, 12 (avoid arbitrary spacing)
- **Component padding**: p-4 (tiles), p-6 (modals)
- **Tile gaps**: gap-4 (mobile), gap-6 (desktop)
- **Section spacing**: mb-8, mt-12
- **Inline spacing**: space-x-2 (badges), space-y-4 (stacked content)

### Grid Architecture
```
Desktop (1280px+):
- Left Rail: w-72 fixed
- Center Grid: flex-1 grid grid-cols-3 gap-6
- Right Inspector: w-96 slide-in overlay

Tablet (768-1279px):
- Left Rail: w-64 fixed or collapsible
- Center Grid: grid-cols-2 gap-4

Mobile (<768px):
- Stacked layout, grid-cols-1 gap-4
- Left rail becomes slide-out drawer
```

### Container Constraints
- Max width for center content: max-w-7xl
- Tile minimum height: min-h-64 (prevents squished charts)
- Inspector panel: fixed height with internal scroll

---

## Component Library

### Tiles (NumericCard, Gauge, Charts)
**Structure**:
- Card container: rounded-lg border shadow-sm p-4
- Header row: flex justify-between items-center mb-4
  - Left: Title (text-lg font-semibold) + data quality badge
  - Right: Help icon button (w-6 h-6)
- Content area: flex-1 (chart/metric display)
- Footer (if needed): text-xs text-muted mt-4 pt-4 border-t

**States**:
- Loading: skeleton shimmer with pulse animation
- Error: border-danger with icon + message
- Low Data: border-amber with warning badge
- Interactive hover: border-accent transition-colors

### Verdict Tile (Prominent)
- **Size**: col-span-2 md:col-span-3 (full-width spotlight)
- **Layout**: Centered vertical stack with generous py-8
- **Direction Display**: Hero typography (text-5xl) with icon
- **Confidence Bar**: w-full h-2 rounded-full progress bar below points
- **Explanation**: max-w-2xl mx-auto text-center mb-6
- **Contributors Waterfall**: Horizontal bar chart with labels

### Modals
**Base Pattern** (all modals):
- Overlay: fixed inset-0 backdrop-blur-sm
- Dialog: max-w-2xl mx-auto mt-20 rounded-xl shadow-2xl p-6
- Header: text-xl font-semibold mb-4
- Body: max-h-96 overflow-y-auto space-y-4
- Footer: flex justify-end gap-3 mt-6 pt-4 border-t

**Disclaimer Modal**:
- No close button (blocking)
- Buttons: "I Understand" (primary), "Learn More" (secondary)
- Text: leading-relaxed text-base

**Cookie Consent**:
- Toggle switches for each consent category
- Three-button layout: Accept All | Reject All | Save Choices
- Links row: text-xs with external icon

**Explain Modal** (per-tile):
- Tile icon + name in header
- Threshold legend: grid grid-cols-3 gap-2 (green/amber/red)
- Example actions: bulleted list with arrow icons
- Mini-chart thumbnail: h-32 w-full

### Navigation & Controls

**Left Rail**:
- Ticker selector: Combobox with search, max-h-64 dropdown
- Autocomplete list: text-sm with ticker + company name
- Timeframe buttons: button group with active state
- Notional input: numeric input with currency prefix

**Refresh Button**:
- Position: fixed top-4 right-4 (floats above content)
- Size: h-10 px-4
- Icon + "Refresh" label
- Loading: spinner replaces icon, button disabled

**Theme Toggle**:
- Icon-only button (sun/moon)
- Position: Left rail header or top-right cluster
- Smooth transition on theme change (duration-200)

**How to Use Tile**:
- Collapsible: max-h-16 collapsed, max-h-96 expanded
- Caret icon rotates on state change
- Steps: numbered list (1-6) with short descriptions
- Learn More links inline

### Inspector Panel (Right Drawer)
- Slide-in animation from right (translate-x-0)
- Close button: top-right absolute
- Tabs: JSON | Actions | Explain (if multi-view)
- JSON view: JetBrains Mono, syntax highlighting via classes
- Scroll container: overflow-y-auto

---

## Data Visualization Standards

### Charts (Recharts/D3)
- **Axis labels**: text-xs JetBrains Mono
- **Gridlines**: opacity-20 stroke-1
- **Tooltips**: backdrop-blur rounded-lg p-2 text-sm
- **Legend**: text-xs Inter, horizontal below chart
- **Hover states**: cursor-crosshair on chart areas

### Badges & Indicators
- **Data Quality**: 
  - GOOD: rounded-full px-2 py-1 text-xs font-medium
  - LOW: border dashed with warning icon
  - INSUFFICIENT: with alert icon
- **Confidence**: Progress bar with percentage label
- **Direction Icons**: Arrow up/down with rotation

---

## Accessibility Patterns

- All interactive elements: min-h-10 touch target
- Focus rings: ring-2 ring-accent ring-offset-2
- Skip links: sr-only focus:not-sr-only
- ARIA labels on icon-only buttons
- Keyboard navigation: Tab order follows visual hierarchy
- Error announcements: aria-live="polite"
- Reduced motion: Disable Framer Motion, use instant transitions

---

## Animation Budget (Minimal)
- Theme transitions: 200ms ease
- Modal overlays: 150ms fade + scale
- Inspector slide: 300ms ease-out
- Tile hover: 100ms border-color transition
- **No**: Particle effects, scroll-triggered animations, complex entrance choreography
- Respect prefers-reduced-motion: all animations off

---

## Responsive Breakpoints
- Mobile: < 640px (single column, drawer navigation)
- Tablet: 640-1024px (2-column grid, persistent rail)
- Desktop: 1024px+ (3-column grid, inspector overlay)
- Wide: 1536px+ (maintain max-w-7xl center constraint)