```markdown
# VYUHOX_UI_UX_SPECIFICATION.md

**CONFIDENTIAL & PROPRIETARY**  
**TO:** Executive Leadership & Engineering Board, VYUHOX  
**FROM:** AGENT 6: UI/UX and Experience Architecture  
**DATE:** October 2023  
**SUBJECT:** Comprehensive Enterprise UI/UX Specifications & Design System Implementation Blueprint

---

## 1. Enterprise Blue Design System Token Specifications

To reflect VYUHOX’s market-leading stability, high-performance computing capability, and enterprise security posture, all screen architectures adhere strictly to the **Enterprise Blue** design token system. 

### Color Palette Architecture
*   **Surface Base (`--vyu-slate-900`):** `#0A0F1D` — Primary application background, creating deep contrast for data-dense telemetry and orchestration modules.
*   **Surface Elevated (`--vyu-slate-800`):** `#111827` — Component cards, modal backdrops, and active table rows.
*   **Surface Border (`--vyu-slate-700`):** `#1E293B` — Structural dividers, input borders, and card outlines.
*   **Primary Interactive (`--vyu-sapphire-600`):** `#0284C7` — Primary buttons, active states, focus rings, and primary data visualization axes.
*   **Primary Hover (`--vyu-sapphire-500`):** `#0EA5E9` — Interactive hover states for primary buttons and links.
*   **Accent Glow (`--vyu-cyan-400`):** `#38BDF8` — Live status badges, success indicators, progress tracks, and high-priority telemetry highlights.
*   **Semantic Text Primary (`--vyu-text-100`):** `#F8FAFC` — High-readability headings and critical table cell data.
*   **Semantic Text Muted (`--vyu-text-400`):** `#94A3B8` — Secondary metadata, timestamps, and inactive navigation items.
*   **Semantic Error (`--vyu-error-500`):** `#EF4444` — Bounce rate alerts, system error boundaries, and circuit-breaker triggers.
*   **Semantic Success (`--vyu-success-500`):** `#10B981` — Verified enrichment badges, healthy inbox rotation scores, and active campaign states.

### Typography Scale & Hierarchy
*   **Font Family:** Inter, system-ui, -apple-system, sans-serif.
*   **Display / Page Title:** 24px / 32px Line Height, Semi-Bold (`font-weight: 600`), Tracking: `-0.025em`.
*   **Section Header:** 18px / 24px Line Height, Semi-Bold (`font-weight: 600`), Tracking: `-0.015em`.
*   **Card Header / Table Data:** 14px / 20px Line Height, Medium (`font-weight: 500`).
*   **Body / Form Label:** 13px / 18px Line Height, Regular (`font-weight: 400`).
*   **Microcopy / Badge:** 11px / 16px Line Height, Medium (`font-weight: 500`), Uppercase tracking.

---

## 2. Navigation & Clean HTML5 Routing

VYUHOX uses modern HTML5 History API routing (`pushState`). **Hashtag URLs (`/#/`) are strictly prohibited** to preserve clean enterprise bookmarking, deep-linking security, and predictable SPA navigation flows.

### Global App Shell Layout
```
┌────────────────────────────────────────────────────────────────────────┐
│ TOP NAV: Workspace Selector │ Global Search (Cmd+K) │ User Profile     │
├──────────┬─────────────────────────────────────────────────────────────┤
│ SIDEBAR  │ [Breadcrumb: Campaigns / Q4 Enterprise Push / Orchestration]│
│          ├─────────────────────────────────────────────────────────────┤
│ ⌂ Home   │                                                             │
│ ⚡ Lead  │                                                             │
│ ✉ Seq    │                     MAIN VIEWPORT                           │
│ 🎙 Voice │               (Fluid Grid / Data Tables)                    │
│ ⚙ Settings│                                                            │
│          │                                                             │
└──────────┴─────────────────────────────────────────────────────────────┘
```

*   **Primary Sidebar:** Fixed width (`240px`), background `#0A0F1D`, border-right `1px solid #1E293B`. Houses persistent routing items with active indicator left-borders (`2px solid #38BDF8`).
*   **Top Navigation Bar:** Height `64px`, containing the Workspace Context Switcher, global `Cmd + K` Command Palette trigger, System Status Indicator (Real-time Webhook & Enrichment API latency), and User Avatar dropdown.

---

## 3. Onboarding & Empty States (First-Time User Setup Experience)

To eliminate the historical high-drop-off rate during initial setup, the 7-step legacy wizard has been re-engineered into an accelerated 3-step activation sequence guaranteeing time-to-value under 10 minutes.

### Screen 1: Accelerated TTV Onboarding Flow (`/onboarding/activate`)
*   **Layout:** Centered modal container (`600px` max-width) over a blurred app shell background (`backdrop-filter: blur(8px)`).
*   **Progress Stepper:** 3 distinct nodes linked by a `#1E293B` track. Active node glows with `#38BDF8`.
*   **Step 1 Content (Domain & Email Sync):** 
    *   *Headline:* "Connect Your Outbound Engine"
    *   *Action:* Two primary OAuth cards (Google Workspace, Microsoft 365) featuring instant authorization triggers. Eliminates manual SMTP configuration forms entirely.
*   **Step 2 Content (ICP Definition via AI Prompt):**
    *   *Headline:* "Define Your Ideal Customer Profile"
    *   *Action:* Natural language input bar: *"Find Series B VP of Sales in fintech companies using Salesforce"*. Below the input, an instant preview loading skeleton translates the prompt into dynamic filter parameters.
*   **Step 3 Content (Launch First Campaign):**
    *   *Headline:* "Deploy Your First Autonomous Sequence"
    *   *Action:* Pre-populated default template preview card with 1-click execution: *"Launch Q4 Outbound Genesis"*.

### Zero Dead-End Empty States
When a user navigates to an unpopulated module (e.g., Lead Scraper with 0 lists), display the **Actionable Empty State Component**:
*   **Visual Container:** Dashed border (`1px dashed #1E293B`), background `#111827`, border-radius `8px`, padding `48px`.
*   **Content:** Centered vector telemetry icon (`#0284C7`), bold title (*"No Lead Lists Initialized"*), descriptive subcopy (*"Ingest your first target account file or query our multi-vendor enrichment database to begin."*), and dual CTA stack:
    *   Primary: `[ Generate with AI Prompt ]` (`background: #0284C7`)
    *   Secondary: `[ Import CSV / Map Data ]` (`background: transparent`, border `1px solid #1E293B`)

---

## 4. User Journey Improvements (Screen-by-Screen Progression)

```
[Landing / Auth] ──> [Onboarding 3-Step Wizard] ──> [Unified Dashboard]
                                                          │
          ┌───────────────────────────────────────────────┴───────────────────────────────┐
          ▼                                               ▼                               ▼
[Waterfall Enrichment View]                     [Inbox Pool Rotation Panel]           [Voice Agent Studio]
```

### Journey Step Details
1.  **Authentication & Entry:** Direct routing to `/dashboard` for active accounts, or `/onboarding/activate` for fresh tenants.
2.  **Primary Dashboard View (`/dashboard`):** Real-time telemetry cards tracking Waterfall Enrichment validity rates, Active Inbox Pool Health, and Active Voice Conversion metrics.
3.  **Module Execution:** Users seamlessly transition between the Waterfall Enrichment UI, Automated Inbox Manager, and Voice Agent Canvas via the persistent navigation sidebar without page reloads.

---

## 5. Screen-Level Changes & Component Specifications

### 5.1 Waterfall Data Enrichment Cascade UI (`/data/enrichment`)
*   **Layout:** Split-screen layout. Left panel (`320px`) houses the sequential waterfall rule builder; right panel (`flex-1`) displays the real-time processing stream and result validation grid.
*   **Cards:** Modular provider step cards (`Provider A: Clearbit` $\rightarrow$ `Provider B: Apollo` $\rightarrow$ `Provider C: Kaspr`). Each card features an inline credit cost indicator and success rate toggle.
*   **Tables:** High-density data grid (`font-size: 13px`, row height `40px`). Cells containing validated emails display a solid `#10B981` status pill (*"98% Valid"*). Failed enrichments automatically trigger the downstream fallback provider with zero UI thread blocking, rendering a pulsing cyan loading indicator (`#38BDF8`).

### 5.2 Automated Inbox Pool Rotation Dashboard (`/infrastructure/inboxes`)
*   **Layout:** Grid-based telemetry dashboard displaying domain clusters.
*   **Cards:** Domain Health Cards. Each card features:
    *   Domain URL and associated sending accounts.
    *   Real-time health score progress bar (Color-coded: Green for $\ge 98\%$, Red for $< 85\%$).
    *   Automated Circuit Breaker status badge: *"Active"* (Green) or *"Tripped / Throttled"* (Red).
*   **Modals:** Domain Pool Configuration Modal allowing administrators to set max daily sending limits per inbox and automated rotation intervals based on bounce thresholds.

### 5.3 Voice Agent Configuration & Call Steering Studio (`/voice/studio`)
*   **Layout:** 3-column operational workspace.
    *   *Left Column (260px):* Conversation State Tree & Intent Routing rules.
    *   *Center Column (flex-1):* Visual Node Canvas for real-time LLM prompt injection and objection-handling pathways.
    *   *Right Column (320px):* Live Audio Sandbox Testing Panel & Latency Diagnostics (Sub-500ms streaming metrics).
*   **Forms:** Clean, un-cluttered input groups with inline validation. Sliders for voice synthesis temperature and latency threshold guards.

---

## 6. Responsive Layout Specifications

| Breakpoint | Viewport Width | Layout Adjustments & Behavioral Changes |
| :--- | :--- | :--- |
| **Desktop (L/XL)** | $\ge 1280px$ | Full 3-column workspaces visible. Persistent sidebar (`240px`), expanded telemetry grids, multi-panel data inspection active. |
| **Tablet (MD)** | $768px - 1279px$ | Sidebar collapses into an icon-only rail (`64px width`). Multi-column split views stack vertically (Primary content full width, inspector panels converted to slide-over drawers). |
| **Mobile (SM)** | $< 768px$ | Sidebar hidden behind a hamburger menu overlay. Tables convert to stacked mobile card layouts. Primary action CTAs fixed to bottom viewport bar (`position: sticky`, `bottom: 0`, height `64px`). |

---

## 7. Accessibility (WCAG 2.1 AA Compliance)

*   **Color Contrast Ratios:** 
    *   Primary text (`#F8FAFC`) against Slate Base (`#0A0F1D`) exceeds **14.2:1 contrast ratio** (Exceeds WCAG AAA requirement).
    *   Interactive Sapphire (`#0284C7`) and Cyan (`#38BDF8`) elements tested against dark backgrounds to ensure $\ge 4.5:1$ contrast for standard text and $\ge 3:1$ for UI controls.
*   **Keyboard Navigation & Focus Management:** 
    *   All interactive elements (buttons, inputs, table rows, modal close triggers) feature visible focus states: `outline: 2px solid #38BDF8; outline-offset: 2px;`.
    *   Modals trap keyboard focus (`Tab` / `Shift + Tab`) upon opening and restore focus to the triggering element upon closure.
*   **ARIA Landmarks & Screen Reader Attributes:**
    *   Main layout regions explicitly marked with `<nav>`, `<main>`, `<aside>`, and `<header>` HTML5 semantic tags.
    *   Dynamic background enrichment jobs and webhook dispatch queues utilize `role="status"` and `aria-live="polite"` to announce background progress changes without interrupting user workflows.
    *   Icon-only buttons explicitly tagged with `aria-label` attributes (e.g., `aria-label="Close configuration modal"`).

---

## 8. Usability Friction Elimination

*   **Zero Unnecessary Clicks:** Eliminated multi-modal configuration confirmations. Campaign saves and filter updates commit on blur or via instantaneous auto-save state indicators (*"Changes saved"* microcopy in top navigation).
*   **Optimistic UI Updates:** Toggle switches (e.g., Campaign activation, Inbox Pool rotation overrides) instantly reflect state changes locally while asynchronous queue requests process in the background. If an API failure occurs, the UI reverts gracefully with an inline toast notification and recovery retry action.
*   **Command Palette (`Cmd + K`):** Global shortcut invoked anywhere in the application, opening a modal search overlay to instantly jump to any campaign, lead list, voice agent, or system setting without traversing nested menu hierarchies.

---
*End of UI/UX Specification. Ready for Engineering Board Hand-off and Front-End Implementation.*
```