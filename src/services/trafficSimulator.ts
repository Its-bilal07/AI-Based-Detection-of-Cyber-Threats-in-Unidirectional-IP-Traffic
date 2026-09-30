import { CyberThreatAlert, ScenarioType, TrafficMetricsSnapshot } from '../types/alert';

export type StreamCallback = (data: {
  metrics: TrafficMetricsSnapshot;
  newAlerts: CyberThreatAlert[];
  totalFlowsIncrement: number;
}) => void;

interface ReplayEvent {
  metrics: TrafficMetricsSnapshot;
  totalFlowsIncrement: number;
  prediction: CyberThreatAlert;
  is_alert: boolean;
}

class TrafficReplayService {
  private eventSource: EventSource | null = null;
  private speedMultiplier = 1;
  private currentScenario: ScenarioType = 'Mixed Attack';
  private subscribers = new Set<StreamCallback>();
  private isRunning = false;
  private reconnectTimer: any = null;
  private fallbackTimer: any = null;
  private fallbackCounter = 1284920;
  private fallbackAlertSeq = 350;

  public subscribe(cb: StreamCallback): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  public start(): void {
    this.isRunning = true;
    this.connect();
  }

  public pause(): void {
    this.isRunning = false;
    this.cleanupEventSource();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  public reset(): void {
    this.pause();
    this.fallbackCounter = 1000000;
    this.fallbackAlertSeq = 100;
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
    if (this.isRunning) {
      this.connect();
    }
  }

  public setScenario(scenario: ScenarioType): void {
    this.currentScenario = scenario;
    if (this.isRunning) {
      this.connect();
    }
  }

  public getStatus(): { isRunning: boolean; speed: number; scenario: ScenarioType } {
    return {
      isRunning: this.isRunning,
      speed: this.speedMultiplier,
      scenario: this.currentScenario,
    };
  }

  private connect(): void {
    this.cleanupEventSource();
    if (!this.isRunning) return;

    const intervalMs = Math.max(100, Math.floor(600 / this.speedMultiplier));
    const params = new URLSearchParams({
      scenario: this.currentScenario,
      interval_ms: String(intervalMs),
    });

    const streamUrl = `/replay/stream?${params.toString()}`;

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        if (this.fallbackTimer) {
          clearTimeout(this.fallbackTimer);
          this.fallbackTimer = null;
        }
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data) as ReplayEvent;
          if (payload && payload.metrics && payload.prediction) {
            this.broadcast({
              metrics: payload.metrics,
              newAlerts: payload.is_alert ? [payload.prediction] : [],
              totalFlowsIncrement: payload.totalFlowsIncrement || 625,
            });
          }
        } catch {
          // ignore non-JSON frames
        }
      };

      this.eventSource.onerror = () => {
        this.cleanupEventSource();
        if (this.isRunning) {
          this.scheduleFallbackTick();
          if (!this.reconnectTimer) {
            this.reconnectTimer = setTimeout(() => {
              this.reconnectTimer = null;
              this.connect();
            }, 3000);
          }
        }
      };
    } catch {
      this.scheduleFallbackTick();
    }
  }

  private cleanupEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private broadcast(data: { metrics: TrafficMetricsSnapshot; newAlerts: CyberThreatAlert[]; totalFlowsIncrement: number }): void {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(data);
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    });
  }

  private scheduleFallbackTick(): void {
    if (!this.isRunning || this.eventSource) return;
    if (this.fallbackTimer) clearTimeout(this.fallbackTimer);

    const interval = Math.max(250, Math.floor(800 / this.speedMultiplier));
    this.fallbackTimer = setTimeout(() => {
      this.runFallbackTick();
      if (this.isRunning && !this.eventSource) {
        this.scheduleFallbackTick();
      }
    }, interval);
  }

  private runFallbackTick(): void {
    const now = new Date().toISOString();
    this.fallbackCounter += 625;
    const isThreat = Math.random() < (this.currentScenario === 'Normal Traffic' ? 0.0 : 0.4);

    let baseFlows = 1250;
    let inBytes = 28.4;
    let outBytes = 14.2;
    let detectionRate = 0.5;

    if (this.currentScenario === 'DDoS Attack') {
      baseFlows = 18400 + Math.floor(Math.random() * 2000);
      inBytes = 145.0 + Math.random() * 20;
      outBytes = 8.1;
      detectionRate = 24;
    } else if (this.currentScenario === 'Port Scanning') {
      baseFlows = 3100 + Math.floor(Math.random() * 400);
      inBytes = 48.0;
      outBytes = 15.2;
      detectionRate = 12;
    } else if (this.currentScenario === 'Data Exfiltration') {
      baseFlows = 1600;
      inBytes = 21.0;
      outBytes = 135.0;
      detectionRate = 8;
    }

    const metrics: TrafficMetricsSnapshot = {
      timestamp: now,
      flows_per_sec: baseFlows,
      inbound_bytes_mbps: round(inBytes, 1),
      outbound_bytes_mbps: round(outBytes, 1),
      detection_rate_per_min: isThreat ? detectionRate : 0.5,
    };

    const newAlerts: CyberThreatAlert[] = [];
    if (isThreat) {
      newAlerts.push(this.generateFallbackAlert(this.currentScenario));
    }

    this.broadcast({
      metrics,
      newAlerts,
      totalFlowsIncrement: Math.floor(baseFlows / 2),
    });
  }

  private generateFallbackAlert(scenario: ScenarioType): CyberThreatAlert {
    this.fallbackAlertSeq++;
    const now = new Date().toISOString();
    const flowId = `F-${this.fallbackAlertSeq}`;

    if (scenario === 'Botnet Beaconing') {
      return {
        id: `ALT-${Date.now()}-${flowId}`,
        timestamp: now,
        flow_id: flowId,
        threat_class: 'C2_beacon',
        severity: 'medium',
        confidence: 0.93,
        src_ip: '10.0.4.52',
        dst_ip: '185.220.101.44',
        src_port: 49821,
        dst_port: 443,
        protocol: 'TCP',
        detection_latency_ms: 135,
        model_decision: 'LSTM Recurrent Neural Network + FFT Periodicity Analyzer',
        detection_reason: 'Strict 60-second periodic intervals and fixed payload size matching Botnet C2 telemetry',
        evidence: {
          summary: 'Periodicity: 60 sec | Dst: 185.XX.XX.XX | Inter-arrival var: low',
          top_features: {
            'Periodicity': '60.02 sec',
            'Repeated destination': '185.220.101.XX',
            'Inter-arrival variance': 'LOW (0.12s)',
          },
          feature_breakdown: [
            { name: 'Beacon Periodicity', value: '60.02 sec', strength: 'VERY HIGH', score: 0.94, baseline: 'Aperiodic / Human' },
            { name: 'Inter-arrival Variance', value: '0.12 sec', strength: 'HIGH', score: 0.89, baseline: '> 15.0 sec' },
          ],
        },
      };
    }

    if (scenario === 'DGA / DNS Tunnelling') {
      return {
        id: `ALT-${Date.now()}-${flowId}`,
        timestamp: now,
        flow_id: flowId,
        threat_class: 'DGA_domain',
        severity: 'high',
        confidence: 0.96,
        src_ip: '10.0.12.87',
        dst_ip: '1.1.1.1',
        src_port: 54120,
        dst_port: 53,
        protocol: 'UDP',
        detection_latency_ms: 110,
        model_decision: 'Character-level CNN + N-Gram NLP Anomaly Classifier',
        detection_reason: 'Algorithmic domain generation and anomalous query string length',
        evidence: {
          summary: 'Query entropy: 4.92 | Length: 47 | Record: TXT | High n-gram',
          top_features: {
            'Query entropy': 4.92,
            'Average query length': 47,
            'Record type': 'TXT',
          },
          feature_breakdown: [
            { name: 'Shannon Entropy', value: '4.92 bits', strength: 'VERY HIGH', score: 0.96, baseline: '2.4 - 3.2 bits' },
            { name: 'Query String Length', value: '47 chars', strength: 'HIGH', score: 0.91, baseline: '12 - 20 chars' },
          ],
        },
      };
    }

    if (scenario === 'Encrypted Malware') {
      return {
        id: `ALT-${Date.now()}-${flowId}`,
        timestamp: now,
        flow_id: flowId,
        threat_class: 'TLS_malware',
        severity: 'high',
        confidence: 0.91,
        src_ip: '10.0.8.44',
        dst_ip: '45.33.32.156',
        src_port: 48210,
        dst_port: 443,
        protocol: 'TLS/QUIC',
        detection_latency_ms: 195,
        model_decision: 'Passive TLS Metadata & Packet-Length Sequence Autoencoder',
        detection_reason: 'Suspicious JA4 fingerprint & anomalous packet timing sequences with zero payload decryption',
        evidence: {
          summary: 'TLS/QUIC fingerprint: suspicious | JA4 anomaly: high | Seq anomaly: 0.87',
          encrypted_metadata_only: true,
          top_features: {
            'TLS/QUIC fingerprint': 'Suspicious (CobaltStrike Profile)',
            'JA4 anomaly': 'HIGH (t13d1516h2_...)',
            'Packet-size sequence anomaly': 0.87,
          },
          feature_breakdown: [
            { name: 'JA4 Fingerprint Anomaly', value: 'Score 0.94', strength: 'VERY HIGH', score: 0.94, baseline: 'Known Browser Profile' },
            { name: 'Packet Size Sequence Anomaly', value: '0.87 index', strength: 'HIGH', score: 0.87, baseline: '< 0.20 index' },
          ],
        },
      };
    }

    if (scenario === 'Port Scanning') {
      return {
        id: `ALT-${Date.now()}-${flowId}`,
        timestamp: now,
        flow_id: flowId,
        threat_class: 'port_scan',
        severity: 'high',
        confidence: 0.98,
        src_ip: '192.168.1.105',
        dst_ip: '10.0.0.0/24',
        src_port: 59120,
        dst_port: 0,
        protocol: 'TCP',
        detection_latency_ms: 125,
        model_decision: 'Destination Fan-Out & Graph Neural Network (GNN)',
        detection_reason: 'Rapid horizontal and vertical port scanning pattern across subnets',
        evidence: {
          summary: 'Unique ports: 1,842 | Unique hosts: 324 | Fan-out: high',
          top_features: {
            'Unique destination ports': 1842,
            'Unique hosts': 324,
            'Fan-out rate': 'HIGH',
          },
          feature_breakdown: [
            { name: 'Unique Destination Ports', value: '1,842 ports', strength: 'VERY HIGH', score: 0.98, baseline: '< 5 ports/min' },
            { name: 'Target Host Fan-Out', value: '324 hosts', strength: 'HIGH', score: 0.92, baseline: 'Single Host' },
          ],
        },
      };
    }

    if (scenario === 'Data Exfiltration') {
      return {
        id: `ALT-${Date.now()}-${flowId}`,
        timestamp: now,
        flow_id: flowId,
        threat_class: 'data_exfil',
        severity: 'high',
        confidence: 0.95,
        src_ip: '10.0.2.19',
        dst_ip: '142.250.190.46',
        src_port: 52140,
        dst_port: 443,
        protocol: 'TCP',
        detection_latency_ms: 160,
        model_decision: 'Unidirectional Flow Asymmetry Isolation Forest',
        detection_reason: 'Extreme outbound-to-inbound volume asymmetry sustained over duration',
        evidence: {
          summary: 'Outbound: 842 MB | Inbound: 21 MB | Ratio: 40.1 | Duration: 18 min',
          top_features: {
            'Outbound bytes': '842 MB',
            'Inbound bytes': '21 MB',
            'Outbound/Inbound ratio': 40.1,
          },
          feature_breakdown: [
            { name: 'Outbound / Inbound Ratio', value: '40.1 : 1', strength: 'VERY HIGH', score: 0.96, baseline: '1 : 4 (typical client)' },
            { name: 'Total Outbound Volume', value: '842 MB', strength: 'HIGH', score: 0.92, baseline: '< 50 MB / session' },
          ],
        },
      };
    }

    // Default: Volumetric DDoS
    return {
      id: `ALT-${Date.now()}-${flowId}`,
      timestamp: now,
      flow_id: flowId,
      threat_class: 'DDoS_SYN_flood',
      severity: 'critical',
      confidence: 0.98,
      src_ip: '198.51.100.45',
      dst_ip: '172.16.5.22',
      src_port: 44321,
      dst_port: 443,
      protocol: 'TCP',
      detection_latency_ms: 64,
      model_decision: 'XGBoost Unidirectional Volumetric Classifier flagged DoS signature',
      detection_reason: 'Abnormal packet transmission rate, high source load, and truncated connection state',
      evidence: {
        summary: 'SYN rate: 18,420/sec | IP entropy: 1.8 | Dst port: 443',
        top_features: {
          'Source Bitrate (sload)': '185.4 Mbps',
          'Packet Rate (rate)': '14.2k pkts/s',
          'Connection State': 'INT',
        },
        feature_breakdown: [
          { name: 'Source Bitrate (sload)', value: '185.4 Mbps', strength: 'VERY HIGH', score: 0.95, baseline: '< 5.2 Mbps' },
          { name: 'Packet Rate (rate)', value: '14.2k pkts/s', strength: 'VERY HIGH', score: 0.93, baseline: '< 500 pkts/s' },
        ],
      },
    };
  }
}

function round(val: number, precision: number): number {
  const factor = Math.pow(10, precision);
  return Math.round(val * factor) / factor;
}

export const trafficSimulator = new TrafficReplayService();
