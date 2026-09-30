# Product Requirements Document (PRD)

## Project Title
**AI-Based Detection of Cyber Threats in Unidirectional IP Traffic**  
*Project Codename: DEBUGGERS SOC Intelligence Platform*  
*Version: 2.5.0*  
*Document Status: Approved / Living Specification*

---

## 1. Executive Summary

In national security enclaves, critical infrastructure (ICS/SCADA), defense command systems, and core financial settlement backbones, physical **data diodes** and **unidirectional optical taps** are mandated to ensure information can flow strictly in one direction.

Traditional Network Intrusion Detection Systems (NIDS), Next-Generation Firewalls (NGFW), and Endpoint Detection and Response (EDR) agents fail within these topologies because they:
1. Require bidirectional flow tracking (e.g., matching TCP SYN with SYN-ACK).
2. Attempt active inline remediation (e.g., injecting TCP RST, emitting ICMP unreachable, or dropping inline packets).
3. Require intrusive TLS Man-in-the-Middle (MITM) decryption proxies to inspect encrypted payloads.

The **AI-Based Detection of Cyber Threats in Unidirectional IP Traffic** platform provides a strictly passive, read-only Security Operations Center (SOC) intelligence dashboard and streaming machine learning engine. It analyzes unidirectional IP streams in near-real-time without transmitting a single packet, attempting reverse probing, or decrypting ciphertext payloads.

---

## 2. Problem Statement & Operational Context

| Constraint | Traditional Security Systems | Unidirectional AI Threat Detection System |
| :--- | :--- | :--- |
| **Network Topology** | Assumes bidirectional TCP/IP handshakes | Strictly unidirectional (Egress-only or Ingress-only tap) |
| **Active Intervention** | Inline packet dropping, TCP reset injection | Zero packet transmission (physically enforced by optical diode) |
| **Reconnaissance** | Active reverse pinging, Nmap port scanning | Completely silent; zero active probing |
| **Encrypted Traffic** | MITM certificate substitution & decryption | Passive metadata only (JA4 fingerprints, packet length sequences, inter-arrival timing) |
| **Alert Standard** | Proprietary vendor syslog / SNMP | Universal Standardized JSON Alert Contract |

---

## 3. User Personas & Target Audience

### 3.1 Tier 1/2 SOC Analyst (Primary User)
* **Goal:** Continuously monitor real-time threat telemetry, filter alerts by severity/vector, drill down into anomalies, and inspect Explainable AI (XAI) feature attributions.
* **Pain Point:** High alert volume and lack of context regarding why an AI model flagged a flow.
* **Solution:** Intuitive KPI ribbon, live timeline, donut distribution, 50-event telemetry log, and slide-over feature attribution drawer.

### 3.2 High-Assurance Enclave Security Engineer
* **Goal:** Verify that monitoring tools do not violate optical data diode compliance or leak data backward across isolation boundaries.
* **Pain Point:** Traditional agents attempting reverse discovery or active connection termination.
* **Solution:** Architectural guarantees panel clearly documenting physical read-only ingress, zero return paths, and zero decryption.

### 3.3 Security Data Scientist / ML Engineer
* **Goal:** Benchmark supervised and unsupervised models (XGBoost, Random Forest, Isolation Forest, LSTM) on unidirectional feature sets.
* **Pain Point:** Lack of standardized feature extraction schemas for one-way flows.
* **Solution:** 15-feature passive extraction pipeline with live inference endpoints and model performance metadata (`/models/metadata`).

---

## 4. Architectural & Security Guarantees

The platform enforces five foundational security guarantees:

1. 🔒 **Strictly Read-Only / Passive Ingest:** System receives data solely via optical tap or data diode receive fibers.
2. 🚫 **Zero Return Path:** No network interface card (NIC) transmit pin is connected; zero bytes can be sent back to the monitored network.
3. 🚫 **Zero Active Probing:** No ping sweeps, traceroutes, ARP broadcasts, or OS fingerprinting.
4. 🚫 **Zero Payload Decryption:** TLS 1.3 and QUIC sessions are analyzed purely via observable flow metadata (packet sizes, timing, directionality, JA4 signatures).
5. 🚫 **Zero Inline Blocking:** System serves as an observation, intelligence, and early warning instrument.

---

## 5. Threat Classification Vectors

The detection engine defines six distinct threat classes tailored to unidirectional flow dynamics:

### 5.1 Volumetric / Protocol DDoS (`DDoS_SYN_flood`)
* **Status:** **Validated in Prototype** (Trained on UNSW-NB15 holdout set using XGBoost / Random Forest).
* **Detection Mechanism:** Supervised classification over 15 numerical and categorical flow parameters.
* **Empirical Evidence:** Extreme SYN packet rates (>15,000/s), source IP Shannon entropy collapse (<2.0 bits), single-port destination concentration (e.g. 443, 53).

### 5.2 Botnet C2 Beaconing (`C2_beacon`)
* **Status:** Architecture Specification / Roadmap Model.
* **Detection Mechanism:** Fast Fourier Transform (FFT) spectral density analysis and LSTM recurrent sequence modeling.
* **Empirical Evidence:** Strict recurring periodicity (e.g., exactly 60.0s interval), negligible inter-arrival jitter (<0.05), recurring destination IP repetition, and static payload sizing.

### 5.3 DGA / DNS Tunnelling (`DGA_domain`)
* **Status:** Architecture Specification / Roadmap Model.
* **Detection Mechanism:** Character n-gram distribution classifier and Shannon entropy evaluation of DNS queries.
* **Empirical Evidence:** Domain string entropy > 4.8 bits, abnormal consonant-to-vowel ratios, subdomain length > 45 characters, anomalous TXT query frequencies.

### 5.4 Encrypted Session Malware (`TLS_malware`)
* **Status:** Architecture Specification / Roadmap Model.
* **Detection Mechanism:** Passive TLS Client Hello metadata autoencoder and JA4/JA3 fingerprint matching.
* **Empirical Evidence:** Rare cipher suite combinations, packet length sequence anomaly score > 0.85, anomalous timing distributions during initial handshakes.

### 5.5 Reconnaissance / Port Scanning (`port_scan`)
* **Status:** Architecture Specification / Roadmap Model.
* **Detection Mechanism:** Horizontal and vertical fan-out graph neural network (GNN) and destination dispersion tracker.
* **Empirical Evidence:** Unidirectional sweep over >1,000 destination ports or subnets with >99% unanswered SYN flow ratio.

### 5.6 Data Exfiltration (`data_exfil`)
* **Status:** Architecture Specification / Roadmap Model.
* **Detection Mechanism:** Unidirectional volumetric asymmetry isolation forest.
* **Empirical Evidence:** Extreme outbound-to-inbound volume ratio (>40:1), sustained multi-megabyte egress bursts over single long-lived sessions.

---

## 6. Functional Requirements

### 6.1 Unified Theme Management (Dark & Light Mode)
* **Single Button Control:** The dashboard header must feature a single, high-visibility toggle button (Moon icon for dark mode activation, Sun icon for light mode activation) that toggles between dark and light modes with zero page refresh.
* **Persistent Preference:** The selected theme must automatically persist across browser reloads via `localStorage` (`soc_dashboard_theme`).
* **Design Standards:** 
  * Dark mode must utilize the custom SOC palette (`soc-bg: #0B0F19`, `soc-surface: #111827`, `soc-panel: #131C2E`, `soc-card: #151E31`).
  * Light mode must provide crisp enterprise contrast with slate and neutral scales (`bg-slate-50`, `bg-white`, slate borders).
  * All charts, modals, drawers, tables, badges, and scrollbars must dynamically switch styling without layout shift.

### 6.2 Top Navigation & Control Header
* Display product identity, DEBUGGERS badge, real-time UTC clock, and active line throughput counter.
* Scenario selector dropdown with 8 operational modes:
  * `Mixed Attack`, `DDoS Attack`, `Botnet Beaconing`, `DGA / DNS Tunnelling`, `Encrypted Malware`, `Port Scanning`, `Data Exfiltration`, `Normal Traffic`.
* Speed multiplier selector (`1x`, `2x`, `5x`, `10x`).
* Replay controls (`Start Replay`, `Pause`, `Reset Counters`).
* Direct launcher for the Standardized Alert Schema Modal.

### 6.3 KPI Metrics Ribbon
Display 6 real-time animated KPI counters:
1. **Total Flows:** Cumulative unidirectional packets monitored.
2. **Threats Detected:** Total anomalous flow events flagged.
3. **Critical Alerts:** Count of high-urgency signatures requiring immediate triage.
4. **Average Confidence:** Weighted ensemble certainty score (%).
5. **Current Throughput:** Ingress flow rate (flows/sec).
6. **Detection Latency:** Pipeline extraction and inference time (ms).

### 6.4 Threat Classification Vectors Grid
* 6 interactive cards detailing each detection vector.
* Visual status badge (`VALIDATED IN PROTOTYPE` vs `PLANNED DETECTOR`).
* Interactive filter: clicking any card filters the entire dashboard (timeline and telemetry table) to that specific threat class.

### 6.5 Live Threat Timeline & Distribution
* **Timeline Feed:** Chronological, auto-scrolling stream displaying timestamp, severity pill, threat class, source/destination IPs, and confidence score. Includes severity filter tabs (`ALL`, `CRITICAL`, `HIGH`, `MEDIUM`).
* **Threat Distribution Donut:** Interactive SVG donut chart rendering proportionate slices with hover tooltips, center count readout, and category legend.

### 6.6 Real-Time Traffic Analytics (3 Streaming Charts)
* **Flows/sec Over Time:** Line/area SVG chart illustrating instantaneous throughput variations.
* **Inbound vs Outbound Bytes:** Dual-series SVG chart demonstrating ingress volume vs exfiltration egress spikes (visualizing the 40:1 asymmetry).
* **Threat Detection Rate:** Real-time chart displaying anomalies detected per minute.

### 6.7 Live Alert Telemetry Log Table
* Comprehensive, tabular view of the latest 50 buffered detection events.
* Full-text search over Source IP, Destination IP, Flow ID, and Threat Class.
* Column sorting on Timestamp and Confidence Score.
* Clicking any row opens the Explainable AI (XAI) slide-over drawer.

### 6.8 Explainable AI (XAI) Slide-Over Drawer
* Opens smoothly upon alert selection; supports `Esc` key dismissal.
* Displays 5-tuple flow identification (`src_ip:src_port`, `dst_ip:dst_port`, `protocol`, `timestamp`).
* Displays natural language model decision reasoning.
* Renders horizontal feature anomaly bars with divergence percentages and baseline comparisons.
* Displays syntax-highlighted standardized alert JSON payload with one-click clipboard copying.

### 6.9 Alert Schema Modal
* Accessible from header button.
* Outlines field definitions, data types, and contractual semantics.
* Displays sample JSON payload conforming to the standardized ingestion format.

---

## 7. Machine Learning & Backend Specifications

### 7.1 Dataset & Feature Pipeline
* **Source Dataset:** UNSW-NB15 Network Benchmark (Holdout test set: 8,200+ flows; binary classification subset: 41,089 flows).
* **Input Features (15 Fields):**
  * 12 Numerical: `dur`, `spkts`, `sbytes`, `rate`, `sttl`, `sload`, `sloss`, `sinpkt`, `sjit`, `swin`, `smean`, `is_sm_ips_ports`.
  * 3 Categorical: `proto`, `service`, `state`.
* **Preprocessing:** `StandardScaler` for numerical fields, `OneHotEncoder(handle_unknown='ignore')` for categorical fields.

### 7.2 Model Performance Targets & Measured Results

| Metric | Target Requirement | Measured XGBoost Result |
| :--- | :--- | :--- |
| **Accuracy** | $\ge 96.0\%$ | **98.19%** |
| **Recall (DoS / Threat)** | $\ge 90.0\%$ | **94.25%** |
| **Precision (DoS / Threat)** | $\ge 85.0\%$ | **88.32%** |
| **F1 Score** | $\ge 88.0\%$ | **91.19%** |
| **ROC-AUC** | $\ge 0.98$ | **0.9946** |
| **Batch Inference Throughput** | $\ge 100,000\text{ flows/s}$ | **317,749 flows/s** |
| **Per-Flow Inference Latency** | $\le 0.1\text{ ms}$ | **0.011 ms** |

---

## 8. Non-Functional Requirements (NFRs)

* **Performance:** Frontend render cycle at 60 FPS; streaming buffer capped at 250 items to prevent DOM bloat.
* **Accessibility:** WCAG 2.1 AA color contrast compliance in both Dark and Light themes.
* **Cross-Browser Support:** Chromium, Firefox, WebKit (Safari), and Microsoft Edge.
* **Zero Runtime Dependencies Outside Project:** Standalone operation via Vite local bundling and FastAPI service.
