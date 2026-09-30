# System Memory & Knowledge Base (memory.md)

## Project Identification
**AI-Based Detection of Cyber Threats in Unidirectional IP Traffic**  
*Repository Name:* `AI-Based-Detection-of-Cyber-Threats-in-Unidirectional-IP-Traffic`  
*Current System Version:* 2.5.0  
*Active Branch:* `main`

---

## 1. Repository Directory Structure

```
AI-Based-Detection-of-Cyber-Threats-in-Unidirectional-IP-Traffic/
├── backend/                        # FastAPI Backend Application
│   ├── alert_engine.py             # Rule-based alert enrichment & evidence synthesis
│   ├── inference.py                # Serialized model loader & batch/single predictor
│   ├── main.py                     # FastAPI application routes (SSE, /predict, /health)
│   └── schemas.py                  # Pydantic request & response data models
├── data/                           # Flow datasets & holdout evaluation sets
│   ├── holdout_test_set.csv        # Evaluated holdout flows for streaming replay
│   └── UNSW_NB15_training-set_cleaned.csv  # Cleaned UNSW-NB15 benchmark records
├── ml/                             # Machine learning training & replay logic
│   ├── replay.py                   # CSV-backed flow stream generator with scenario pools
│   └── train_model.py              # Stratified training script for RF & XGBoost
├── models/                         # Serialized ML artifacts & benchmark metadata
│   ├── dos_detection_model.pkl     # Trained XGBoost pipeline (preprocessor + estimator)
│   └── feature_metadata.json       # Feature importances, baseline means, comparison metrics
├── src/                            # React 18 / TypeScript frontend application
│   ├── components/                 # SOC dashboard modular components
│   │   ├── AlertDetailDrawer.tsx   # Slide-over XAI feature attribution drawer
│   │   ├── AlertSchemaModal.tsx    # Standardized JSON alert contract modal
│   │   ├── AlertTable.tsx          # Filterable, sortable 50-event alert log table
│   │   ├── ArchitecturePanel.tsx   # Pipeline visualization & optical tap guarantees
│   │   ├── Header.tsx              # Top navigation, scenario, speed & theme toggle button
│   │   ├── KPICards.tsx            # Real-time animated metric counters
│   │   ├── LiveThreatTimeline.tsx  # Chronological scrolling alert event feed
│   │   ├── ThreatDistribution.tsx  # SVG donut breakdown across detection vectors
│   │   ├── ThreatOverview.tsx      # 6x Threat vector classification cards
│   │   └── TrafficAnalytics.tsx    # 3x Live streaming SVG area/line charts
│   ├── context/                    # React Context State Providers
│   │   ├── SOCContext.tsx          # Real-time telemetry, replay state, alert buffer
│   │   └── ThemeContext.tsx        # Single-button Dark/Light theme manager with persistence
│   ├── services/                   # Data layer & network stream adapters
│   │   └── trafficSimulator.ts     # SSE stream consumer with graceful client fallback
│   ├── types/                      # TypeScript definitions & data contracts
│   │   └── alert.ts                # Alert schema, scenario types, metric snapshots
│   ├── App.tsx                     # Main dashboard layout container & provider wrapper
│   ├── index.css                   # Tailwind directives, theme scrollbars & body styles
│   └── main.tsx                    # React root entrypoint
├── Design.md                       # Design specification, color tokens & UI/UX guide
├── index.html                      # HTML entrypoint with Inter/JetBrains fonts & body classes
├── package.json                    # Node dependencies and build scripts
├── postcss.config.js               # PostCSS plugin configuration
├── prd.md                          # Product Requirements Document
├── memory.md                       # This memory and architecture document
├── requirements.txt                # Python backend dependencies
├── tailwind.config.js              # Tailwind CSS configuration with 'soc' dark theme tokens
├── tsconfig.json                   # TypeScript compiler options
└── vite.config.ts                  # Vite build tool and backend API proxy rules
```

---

## 2. Core System Architecture & Guarantees

### 2.1 The Unidirectional Ingestion Paradigm
The system is architected for environments isolated by physical **data diodes** or **unidirectional optical splitters**:
* **Hardware Invariant:** Monitored network traffic enters through receive fibers only; the monitoring node has no transmit path back to the enclave.
* **Passive ML Inference:** Packets/flows are parsed, features are engineered, and models evaluate anomaly scores passively.
* **Zero decryptions, zero reverse pings, zero inline drops.**

### 2.2 Machine Learning Inference Pipeline
* **Model Pipeline:** Trained on the UNSW-NB15 DoS/Volumetric benchmark using a stratified 80/20 split (`random_state=42`).
* **Algorithm Selected:** **XGBoost Classifier** (chosen over Random Forest due to higher DoS recall of 94.25% vs 93.03%).
* **15 Passive Flow Features:**
  * Numerical (12): `dur`, `spkts`, `sbytes`, `rate`, `sttl`, `sload`, `sloss`, `sinpkt`, `sjit`, `swin`, `smean`, `is_sm_ips_ports`.
  * Categorical (3): `proto`, `service`, `state`.
* **Preprocessing:** Standardized scaling for numerical features and one-hot encoding for categorical values serialized directly within `models/dos_detection_model.pkl`.
* **Throughput & Latency:** 
  * Batch inference throughput: **317,749 flows/sec**.
  * Average single-flow inference latency: **0.011 ms**.

---

## 3. Dual-Theme Engine (One-Button Control)

### 3.1 Implementation Architecture
* **Context Provider:** `src/context/ThemeContext.tsx`
* **Theme Modes:** `'dark'` and `'light'`
* **Persistence:** Stored in `localStorage` under key `soc_dashboard_theme`.
* **DOM Mechanism:** Sets or removes the `dark` class on `document.documentElement` (`<html>`).
* **Tailwind Binding:** `darkMode: 'class'` configured in `tailwind.config.js`.

### 3.2 Component Theming Summary
All components utilize dual-mode classes ensuring complete theme adaptability:
* **Backgrounds:** `bg-white dark:bg-soc-card`, `bg-slate-50 dark:bg-soc-surface`, canvas `bg-slate-50 dark:bg-soc-bg`.
* **Borders:** `border-slate-200 dark:border-soc-border`, hover `hover:border-slate-300 dark:hover:border-soc-borderHover`.
* **Typography:** `text-slate-900 dark:text-white`, `text-slate-600 dark:text-slate-300`, `text-slate-500 dark:text-slate-400`.
* **Code / Pre Blocks:** `bg-slate-900 dark:bg-soc-bg text-slate-200 border-slate-800 dark:border-soc-border`.
* **Interactive Toggle Button:** Located in `Header.tsx` (`#theme-toggle-btn`), toggling icon and label between Sun (Light) and Moon (Dark).

---

## 4. Communication & Networking Architecture

### 4.1 Frontend Proxy (Vite)
In `vite.config.ts`, Vite dev server (port 3000) proxies backend endpoints to FastAPI (port 8000):
```typescript
proxy: {
  '/replay': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/predict': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
  '/models': { target: 'http://127.0.0.1:8000', changeOrigin: true },
}
```

### 4.2 Streaming Telemetry via Server-Sent Events (SSE)
* Endpoint: `GET /replay/stream?scenario={scenario}&interval_ms={interval}`
* Protocol: Text-based SSE emitting JSON events containing:
  * `metrics`: Throughput, ingress MB/s, egress MB/s, latency.
  * `prediction`: Structured standardized alert with feature attributions.
  * `is_alert`: Boolean flag signaling whether the event crossed the anomaly threshold.
* Client Adaptation: `src/services/trafficSimulator.ts` consumes SSE stream; automatically activates internal synthetic generator if backend is temporarily disconnected or unreachable.

---

## 5. Operations & Execution Guide

### 5.1 Environment Prerequisites
* Node.js v18+ (tested on Node v24.20.0) & npm v9+
* Python 3.10+ (tested on Python 3.14.0)

### 5.2 Launch Commands
Both services run simultaneously:

```powershell
# 1. Start FastAPI Backend (Port 8000)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 2. Start Frontend Vite Dev Server (Port 3000)
npm run dev

# 3. Production Build Validation
npm run build
```

### 5.3 Active Endpoints
* **SOC Frontend Dashboard:** `http://localhost:3000`
* **FastAPI Backend Health:** `http://127.0.0.1:8000/health`
* **Interactive API Documentation:** `http://127.0.0.1:8000/docs`
* **Model Performance Metadata:** `http://127.0.0.1:8000/models/metadata`

---

## 6. Project Changelog & Evolution

* **v1.0.0:** Initial mock SOC dashboard prototype with simulated data generator.
* **v2.0.0:** Addition of UNSW-NB15 trained XGBoost pipeline, FastAPI SSE replay server, and 5-tuple flow evidence synthesizer.
* **v2.5.0:**
  * Implemented unified `ThemeContext` enabling seamless Dark SOC and Light Enterprise themes.
  * Added single-button theme toggle in top navigation header with `localStorage` persistence.
  * Updated all 10 visual components with comprehensive Tailwind `dark:` variants and high-contrast color tokens.
  * Created `prd.md`, `Design.md`, and `memory.md` specification documents.
