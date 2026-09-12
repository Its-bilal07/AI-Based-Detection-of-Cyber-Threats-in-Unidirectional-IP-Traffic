# AI-Based Detection of Cyber Threats in Unidirectional IP Traffic

> **A modern, real-time Security Operations Center (SOC) intelligence dashboard for passive, read-only AI/ML threat detection across unidirectional network streams.**

[![Ingest Mode](https://img.shields.io/badge/Ingest-Read--Only%20%F0%9F%94%92-blue.svg)](#architecture-guarantees)
[![Return Path](https://img.shields.io/badge/Return%20Path-None%20(Diode)-critical.svg)](#architecture-guarantees)
[![Decryption](https://img.shields.io/badge/Decryption-Metadata%20Only-success.svg)](#architecture-guarantees)
[![Status](https://img.shields.io/badge/Status-Monitoring%20Live-emerald.svg)](#)

---

## 🛡️ Project Overview

In critical infrastructure, national security networks, and high-assurance enclaves (e.g., ICS/SCADA, defense facilities, financial core systems), physical **data diodes** and **unidirectional optical taps** are deployed to guarantee that data flows exclusively in one direction. 

Traditional intrusion detection systems (IDS) and automated response agents fail in these topologies because:
1. They assume a two-way TCP handshake or bidirectional flow visibility.
2. They rely on active remediation (inline packet dropping, connection resets, TCP RST injection, or active port probing).
3. They attempt deep packet inspection (DPI) via invasive TLS man-in-the-middle (MITM) decryption.

**This platform represents a strictly read-only, AI/ML-based network monitoring and threat intelligence system.** It passively analyzes simulated/replayed unidirectional IP traffic and flags advanced cyber threats using empirical statistical features, temporal sequence analysis, and metadata-only inspection.

---

## 🔒 Architectural & Security Guarantees

| Guarantee | Technical Implementation |
| :--- | :--- |
| 🔒 **ONE-WAY / READ-ONLY** | Physical data diode and optical tap compatibility. Egress/ingress only. |
| 🚫 **No return path** | Zero packet transmission capability. No TCP RST, ICMP unreachable, or egress injection. |
| 🚫 **No active probing** | Zero active scanning, traceroutes, or reverse OS/service fingerprinters. |
| 🚫 **No payload decryption** | Encrypted TLS/QUIC sessions are inspected strictly via metadata (JA4, sequence length, timing). |
| 🚫 **No inline blocking** | System operates as passive intelligence: observes, extracts, classifies, and alerts. |

---

## 🧠 Threat Classification Vectors

The detection engine monitors 6 distinct threat classes with specialized ML models:

### 1. Volumetric / Protocol DDoS
* **Detector:** One-Class SVM + Random Forest volumetric spike detector.
* **Evidence:** High SYN rates (e.g. 18,420/s), low source IP entropy (1.8 bits), port concentration on 443, and abnormal packet frequency.

### 2. Botnet C2 Beaconing
* **Detector:** LSTM Recurrent Neural Network + Fast Fourier Transform (FFT) periodicity analyzer.
* **Evidence:** Strict 60-second intervals, destination repetition (e.g. 185.XX.XX.XX), low inter-arrival variance, and fixed payload sizing.

### 3. DGA / DNS Tunnelling
* **Detector:** Character-level CNN + N-Gram NLP anomaly classifier.
* **Evidence:** Shannon entropy > 4.8 bits, query string length > 45 chars, suspicious consonant-to-vowel ratios, and TXT record abuse.

### 4. Encrypted Session Malware
* **Detector:** Passive TLS/QUIC Metadata Autoencoder.
* **Notice:** *“Encrypted traffic analysed using metadata only. No payload decryption.”*
* **Evidence:** JA4 client fingerprint anomaly, packet-size sequence distribution (0.87), inter-arrival timing jitter, and cipher suite restriction.

### 5. Reconnaissance / Port Scanning
* **Detector:** Destination Fan-Out & Graph Neural Network (GNN).
* **Evidence:** Rapid dispersion across 1,800+ destination ports and 300+ hosts, unanswered SYN ratios > 99%.

### 6. Data Exfiltration
* **Detector:** Unidirectional Asymmetry Isolation Forest.
* **Evidence:** Extreme outbound-to-inbound volume asymmetry (40:1 ratio), sustained multi-megabyte egress bursts over prolonged sessions.

---

## 📋 Standardized Alert Schema

All detections emitted by the pipeline adhere to a strict standardized JSON contract:

```json
{
  "timestamp": "2026-09-08T22:56:31.842Z",
  "flow_id": "F-92831",
  "threat_class": "DDoS_SYN_flood",
  "severity": "critical",
  "confidence": 0.97,
  "evidence": {
    "summary": "SYN rate: 18,420/sec | IP entropy: 1.8 | Dst port: 443",
    "top_features": {
      "SYN packets/sec": "18,420/s",
      "Source IP entropy": 1.8,
      "Flow rate": "VERY HIGH",
      "Destination concentration": "HIGH"
    }
  },
  "src_ip": "10.2.4.18",
  "dst_ip": "172.16.5.22",
  "dst_port": 443,
  "protocol": "TCP"
}
```

---

## 🖥️ SOC Dashboard Features

* **Top Navigation Bar:** Live status indicators, read-only lock badge, simulated IP data stream, real-time throughput counter, and UTC clock.
* **KPI Metrics:** Total flows (animated live counter), threats detected, critical alerts, average confidence (94.7%), line throughput, and 180ms detection latency.
* **Threat Overview Cards:** 6 interactive cards with real-time status badges, threat metrics, and one-click filtering.
* **Live Threat Timeline:** Scrolling sequential feed displaying real-time alert events (`Timestamp | Severity | Class | Confidence`).
* **Threat Distribution Donut Chart:** Interactive SVG chart illustrating category proportions and absolute counts.
* **Real-time Traffic Analytics:** 3 streaming line/area charts:
  1. *Flows/sec over time*
  2. *Inbound vs Outbound Bytes* (visualizes 40:1 exfiltration ratio)
  3. *Threat Detection Rate over time*
* **Detailed Alert Table:** Filterable, searchable, sortable table matching the standardized alert schema.
* **Explainable AI (XAI) Side Drawer:** Opens on any alert click to show 5-tuple flow identity, detection reasons, and horizontal feature anomaly bars.
* **Pipeline Architecture Diagram:** Visual one-way dataflow highlighting the physical separation and read-only ingest guarantees.
* **Demo Replay Controls:** Start Replay, Pause, Reset, Replay Speeds (`1x`, `2x`, `5x`, `10x`), and 8 Traffic Scenarios (`Normal Traffic`, `DDoS Attack`, `Botnet Beaconing`, `DGA / DNS Tunnelling`, `Encrypted Malware`, `Port Scanning`, `Data Exfiltration`, `Mixed Attack`).

---

## 🚀 Quickstart & Installation

### Prerequisites
* Node.js v18+ (tested on Node v24.20.0)
* npm v9+

### Setup
```bash
# Clone the repository
git clone https://github.com/Its-bilal07/AI-Based-Detection-of-Cyber-Threats-in-Unidirectional-IP-Traffic.git
cd AI-Based-Detection-of-Cyber-Threats-in-Unidirectional-IP-Traffic

# Install dependencies
npm install

# Run the local SOC dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Technology Stack
* **UI Framework:** React 18, TypeScript, Vite
* **Styling & Theme:** Tailwind CSS, Custom Dark SOC Theme, Glassmorphism
* **Icons:** Lucide React
* **State Management:** Reactive SOC Stream Context & Event Bus
* **Data Layer:** Pluggable `ITrafficStreamService` (Simulated Replay Engine $\rightarrow$ Production WebSocket/SSE compatible)

---

## ⚖️ Hackathon Statement of Compliance

This software is an **observation and intelligence system**. It complies strictly with unidirectional optical tap / data diode requirements. It contains **no features** to alter network packets, inject TCP resets, probe external nodes, execute remote commands, or decrypt TLS traffic.

## Real ML Inference Pipeline

The dashboard now uses replay-based near-real-time inference from the FastAPI service. The replay reads one flow at a time from `data/holdout_test_set.csv`, sends the 15 passive flow features through the serialized preprocessing/model pipeline, and emits model output over Server-Sent Events. No packets are transmitted, probed, blocked, or decrypted.

### Training scope

The first supervised detector filters `attack_cat` to `Normal` and `DoS`, maps them to `0` and `1`, and excludes both `label` and `attack_cat` from features. The source CSV contains 82,332 rows with no missing values; the binary subset contains 37,000 Normal and 4,089 DoS rows. Features are 12 numerical flow fields (`dur`, `spkts`, `sbytes`, `rate`, `sttl`, `sload`, `sloss`, `sinpkt`, `sjit`, `swin`, `smean`, `is_sm_ips_ports`) and 3 categorical fields (`proto`, `service`, `state`). Numerical fields are standardized and categorical fields are one-hot encoded inside the saved pipeline.

The stratified split uses 80% training and 20% test data with `random_state=42`. Random Forest and XGBoost are compared; XGBoost is selected because DoS recall is the primary security metric.

Measured XGBoost test results:

| Metric | Result |
| --- | ---: |
| Accuracy | 98.19% |
| Precision (DoS) | 88.32% |
| Recall (DoS) | 94.25% |
| F1 (DoS) | 91.19% |
| ROC-AUC | 0.9946 |
| Confusion matrix | TN 7,298 / FP 102 / FN 47 / TP 771 |
| Batch inference throughput | 317,749 flows/sec |

The saved artifacts are `models/dos_detection_model.pkl` and `models/feature_metadata.json`. Evidence is derived from model-selected feature importance plus divergence from Normal training baselines; confidence is the model probability and severity is calculated by the backend alert rules.

### API and replay

Start the API with:

```powershell
python -m pip install -r requirements.txt
python ml/train_model.py
python -m uvicorn backend.main:app --reload --port 8000
```

`POST /predict` accepts a `features` object containing the 15 flow fields and returns `Normal` or `DoS`, probability confidence, severity, and evidence. `GET /replay/stream?scenario=Mixed%20Attack&interval_ms=600` emits SSE events consumed by the React dashboard. The frontend adapter is in `src/services/trafficSimulator.ts`; it retains the existing dashboard callback/control contract while replacing client-side random generation with the API stream. Run the dashboard separately:

```powershell
npm install
npm run dev
```

The observed single-flow API smoke test returned Normal confidence `0.9998` and DoS confidence `0.9987`; actual latency varies by machine and request. The replay is a near-real-time demonstration, not live packet capture. Its source is a labeled holdout CSV and its scenario selection intentionally chooses replay pools; it must not be presented as production network telemetry.

### Limitations and roadmap

UNSW-NB15's `DoS` class is a supervised signal for DoS/volumetric/protocol-flood behavior. It is **not equivalent to complete real-world DDoS coverage** and does not by itself cover SYN floods, UDP reflection/amplification, spoofed-source floods, C2 beaconing, DGA/DNS tunneling, TLS/QUIC malware metadata, port scanning, or data exfiltration. Additional datasets and separately validated models can be added behind the same flow schema and replay/API boundary.