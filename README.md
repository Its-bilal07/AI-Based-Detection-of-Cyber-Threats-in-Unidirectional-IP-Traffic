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