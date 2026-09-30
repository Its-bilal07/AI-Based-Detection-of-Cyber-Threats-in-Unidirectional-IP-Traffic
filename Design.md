# Design Specification Document (Design.md)

## Project Title
**AI-Based Detection of Cyber Threats in Unidirectional IP Traffic**  
*System Design & UI/UX Style Guide*  
*Version: 2.5.0*

---

## 1. Design System Philosophy

The user interface is engineered specifically for **High-Consequence Security Operations Centers (SOCs)**, critical infrastructure monitoring stations, and data diode enclaves. The design balances two core objectives:

1. **Information Density & Instant Cognition:** Security analysts must perceive flow rates, attack signatures, and feature attributions within fractions of a second without visual clutter.
2. **Dual-Theme Industrial Aesthetic:** The interface must offer an immersive, high-contrast **Dark SOC Mode** for dimly lit control rooms, and a crisp, clean **Light Enterprise Mode** for corporate reporting and daylight environments—both controlled instantly by a single toggle button.

```
+-----------------------------------------------------------------------------------+
| HEADER: Product Identity | Stream Status | Replay Controls | [Moon/Sun] Theme Toggle |
+-----------------------------------------------------------------------------------+
| ROW 1: 6x Real-time Animated KPI Cards (Flows, Threats, Latency, Throughput)      |
+-----------------------------------------------------------------------------------+
| ROW 2: Threat Vector Classification Matrix (6 Interactive Classifier Cards)        |
+-----------------------------------------------------------------------------------+
| ROW 3: Live Sequential Timeline Feed (Left)  |  Threat Distribution Donut (Right) |
+-----------------------------------------------------------------------------------+
| ROW 4: 3x Streaming SVG Area Charts (Flows/s, In/Out MB/s Exfil, Detection Rate) |
+-----------------------------------------------------------------------------------+
| ROW 5: Searchable, Sortable Alert Telemetry Log Table (Top 50 Buffered Events)    |
+-----------------------------------------------------------------------------------+
| ROW 6: Unidirectional Pipeline Architecture & Optical Tap Physical Guarantees      |
+-----------------------------------------------------------------------------------+
| SLIDE-OVER DRAWER: Explainable AI (XAI) Feature Attribution & Schema Inspector    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Color Architecture & Token System

### 2.1 Dark SOC Theme Palette
Configured in `tailwind.config.js` under the `soc` namespace:

| Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `soc.bg` | `#0B0F19` | Main application canvas background |
| `soc.surface` | `#111827` | Header background, table backgrounds, elevated containers |
| `soc.panel` | `#131C2E` | Slide-over feature attribution drawer, schema modal container |
| `soc.card` | `#151E31` | KPI cards, threat cards, chart containers |
| `soc.cardHover`| `#1A263D` | Interactive card hover states, selected rows |
| `soc.border` | `#1E293B` | Subtle grid lines, card borders, table dividers |
| `soc.borderHover`| `#2E3D56` | Highlighted borders on interactive focus/hover |
| `soc.accent` | `#0284C7` | Primary electric blue indicator, active badges |
| `soc.subtle` | `#334155` | Secondary metadata labels, scrollbar tracks |

### 2.2 Light Enterprise Theme Palette
Constructed using Tailwind CSS standard slate and white scale:

| Token | Utility Class | Semantic Usage |
| :--- | :--- | :--- |
| `Canvas` | `bg-slate-50` (`#F8FAFC`) | Clean, neutral backdrop minimizing eye strain |
| `Card/Surface` | `bg-white` (`#FFFFFF`) | Elevated card panels, top header bar, modal window |
| `Border` | `border-slate-200` (`#E2E8F0`)| Clean card outlines, division rules |
| `Border Hover` | `hover:border-slate-300` | Micro-elevation on pointer hover |
| `Text Primary` | `text-slate-900` (`#0F172A`) | High-contrast headings and numerical metrics |
| `Text Secondary`| `text-slate-600` (`#475569`)| Descriptive labels, table column headers |
| `Text Muted` | `text-slate-500` (`#64748B`)| Timestamps, subtexts, auxiliary units |

### 2.3 Semantic Severity & Threat Palette

| State / Vector | Light Class | Dark Class | Color Hex |
| :--- | :--- | :--- | :--- |
| **Critical / DDoS** | `bg-rose-50 text-rose-700` | `dark:bg-rose-950/60 dark:text-rose-300` | `#EF4444` |
| **High / DGA & Scan** | `bg-orange-50 text-orange-700`| `dark:bg-orange-950/60 dark:text-orange-300`| `#F97316` |
| **Medium / C2** | `bg-amber-50 text-amber-700` | `dark:bg-amber-950/60 dark:text-amber-300` | `#F59E0B` |
| **Normal / Healthy** | `bg-emerald-50 text-emerald-700`| `dark:bg-emerald-950/60 dark:text-emerald-300`| `#10B981` |
| **Active Telemetry** | `bg-blue-50 text-blue-700` | `dark:bg-blue-950/60 dark:text-blue-300` | `#2563EB` |
| **Exfiltration Egress**| `text-emerald-600` | `dark:text-emerald-400` | `#059669` |

---

## 3. Typography System

The interface pairs a geometric sans-serif for human readability with a high-legibility monospace font for network telemetry:

### 3.1 Primary Font: `Inter` (sans-serif)
* Loaded via Google Fonts: `300`, `400`, `500`, `600`, `700`, `800`.
* Usage: Headings, button labels, natural language explanations, card titles, and guarantee badges.

### 3.2 Monospace Font: `JetBrains Mono` (monospace)
* Loaded via Google Fonts: `400`, `500`, `600`, `700`.
* Usage: IP addresses (`src_ip`, `dst_ip`), port numbers, flow IDs (`F-92831`), timestamps (ISO 8601 UTC), throughput rates (`flows/s`), and JSON schema previews.

### 3.3 Typography Scale
* `text-[10px]` / `leading-none`: Status pill labels, unit prefixes, pipeline step captions.
* `text-[11px]` / `leading-tight`: Subtexts, table timestamps, secondary card metadata.
* `text-xs` (12px): Standard body text, button labels, table cell content.
* `text-sm` (14px): Section subheaders, alert threat titles.
* `text-base` (16px): Modal headers, drawer title banner.
* `text-2xl` (24px): Primary KPI counter metrics, donut center readout.

---

## 4. Theme Engine Architecture (One Button Control)

The theme system is managed by `ThemeContext.tsx`:

```typescript
// src/context/ThemeContext.tsx
export type Theme = 'light' | 'dark';

// Initial state resolves from localStorage with fallback to system/dark mode
const [theme, setThemeState] = useState<Theme>(() => {
  const saved = localStorage.getItem('soc_dashboard_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return 'dark'; // High-tech SOC default
});
```

### 4.1 DOM Synchronization & Tailwind Integration
1. When `theme === 'dark'`, the `dark` class is attached directly to the `<html>` root (`document.documentElement.classList.add('dark')`).
2. Tailwind's `darkMode: 'class'` selector automatically cascades across all nested child components using the `dark:...` variant.
3. When `theme === 'light'`, the `dark` class is removed, falling back instantly to light utility classes.
4. Preference is immediately written to `localStorage.setItem('soc_dashboard_theme', theme)`.

### 4.2 Header Toggle Button Design
Located in `Header.tsx` between the schema button and the clock:
* **Light Mode Active:** Displays a Moon icon with label `"Dark"`, inviting the user to toggle into dark SOC mode.
* **Dark Mode Active:** Displays an illuminated Sun icon with label `"Light"`, inviting the user to toggle into enterprise light mode.
* Smooth CSS color transitions (`transition-colors duration-200`) prevent jarring flashes.

---

## 5. Component Breakdown & Layout Specifications

### 5.1 Top Navigation & Control Header (`Header.tsx`)
* **Height:** Compact `py-2.5 px-4 lg:px-6` sticky top banner (`z-40`).
* **Elements:**
  * Shield Alert brand badge with `"DEBUGGERS"` tag.
  * Live pulsing emerald status indicator (`Monitoring`).
  * Optical tap ingest mode tag (`Read-Only Tap`).
  * Live line throughput counter (`X,XXX flows/s`).
  * Scenario dropdown selector (8 scenarios).
  * Simulation speed pills (`1x`, `2x`, `5x`, `10x`).
  * Replay control buttons (`Start Replay` / `Pause` / `Reset`).
  * Alert Schema trigger modal button.
  * Single-button Dark/Light theme toggle (`#theme-toggle-btn`).
  * Real-time ticking UTC clock.

### 5.2 KPI Metrics Ribbon (`KPICards.tsx`)
* Container: Responsive 6-column grid with subtle borders and dividers.
* Cards: Total Flows, Threats Detected, Critical Alerts, Average Confidence, Current Throughput, Detection Latency.
* Typography: Bold monospace numbers (`text-2xl font-bold font-mono tracking-tight`).

### 5.3 Threat Classification Vectors (`ThreatOverview.tsx`)
* Layout: 3x2 responsive card matrix (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
* Visual distinction between validated prototype models (`VALIDATED IN PROTOTYPE` with green check) and planned roadmap models (`PLANNED DETECTOR` with clock icon).
* Interactive filter: Clicking toggles filter state across the entire SOC context.

### 5.4 Live Threat Timeline & Distribution (`LiveThreatTimeline.tsx` & `ThreatDistribution.tsx`)
* **Height:** Fixed `h-[340px]` matching elevation.
* **Timeline:** Scrolling feed with timestamp, severity badge, threat category, IP direction, confidence score, and drill-down chevron.
* **Donut Chart:** SVG vector donut with animated hover slices, category legend, absolute alert counts, and percentage shares.

### 5.5 Streaming Traffic Analytics (`TrafficAnalytics.tsx`)
* 3 real-time SVG charts built with dynamic cubic/linear paths:
  1. *Flows/sec Over Time:* Blue gradient fill showing line traffic density.
  2. *Inbound vs Outbound Bytes:* Comparative dual-path chart displaying the 40:1 exfiltration asymmetry ratio.
  3. *Threat Detection Rate:* Red gradient fill highlighting burst attack anomalies.

### 5.6 Live Alert Telemetry Log Table (`AlertTable.tsx`)
* 9-column technical data grid matching the standardized alert schema.
* Live search input supporting IP prefixes, Flow IDs, and threat names.
* Column sorting on Timestamp and Model Confidence.
* Clickable rows with hover micro-elevation triggering the Explainable AI drawer.

### 5.7 Explainable AI (XAI) Drawer (`AlertDetailDrawer.tsx`)
* Fixed slide-over panel on the right viewport margin (`max-w-xl z-50`).
* Darkened backdrop overlay with `backdrop-blur-xs`.
* 5-tuple flow identity card.
* Model decision reasoning.
* Anomaly divergence horizontal progress bars (Very High, High, Medium, Low).
* Copyable standardized alert JSON payload with syntax styling.

### 5.8 Architecture & Data Diode Verification Panel (`ArchitecturePanel.tsx`)
* 8-step unidirectional pipeline visualization:
  `Simulated Traffic` $\rightarrow$ `Read-Only Ingest` $\rightarrow$ `Flow Extraction` $\rightarrow$ `Feature Engineering` $\rightarrow$ `ML Detection` $\rightarrow$ `Threat Classification` $\rightarrow$ `Alert Schema` $\rightarrow$ `SOC Dashboard`.
* 4 hardware-enforced guarantee badges: *No return path, No active probing, No payload decryption, No inline blocking*.

---

## 6. Micro-Interactions & Animation Guidelines

* **Transitions:** Standardized to `transition-colors duration-200` or `transition-all duration-150`.
* **Hover States:** Light mode elevates with `hover:bg-slate-100 hover:border-slate-300`; Dark mode elevates with `dark:hover:bg-soc-cardHover dark:hover:border-soc-borderHover`.
* **Modal / Drawer Transitions:** Tailwind `animate-in fade-in duration-200` with ease-out curve.
* **Pulsing Status Dots:** `animate-pulse` on active monitoring indicators.
