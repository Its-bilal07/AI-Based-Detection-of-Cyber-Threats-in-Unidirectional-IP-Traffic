import {
  CyberThreatAlert,
  ScenarioType,
  TrafficMetricsSnapshot,
} from '../types/alert';

export type StreamCallback = (data: {
  metrics: TrafficMetricsSnapshot;
  newAlerts: CyberThreatAlert[];
  totalFlowsIncrement: number;
}) => void;

class TrafficSimulator {
  private isRunning: boolean = true;
  private speedMultiplier: number = 1;
  private currentScenario: ScenarioType = 'Mixed Attack';
  private timerId: any = null;
  private subscribers: Set<StreamCallback> = new Set();
  private flowCounter: number = 1284920;
  private alertSequence: number = 347;

  constructor() {
    this.start();
  }

  public subscribe(cb: StreamCallback): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  public start(): void {
    if (this.timerId) return;
    this.isRunning = true;
    this.scheduleNextTick();
  }

  public pause(): void {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public reset(): void {
    this.flowCounter = 1000000;
    this.alertSequence = 100;
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
    if (this.isRunning) {
      this.pause();
      this.start();
    }
  }

  public setScenario(scenario: ScenarioType): void {
    this.currentScenario = scenario;
  }

  public getStatus(): { isRunning: boolean; speed: number; scenario: ScenarioType } {
    return {
      isRunning: this.isRunning,
      speed: this.speedMultiplier,
      scenario: this.currentScenario,
    };
  }

  private scheduleNextTick(): void {
    if (!this.isRunning) return;
    // Base tick interval 1000ms divided by speed multiplier (min 150ms to prevent throttle)
    const interval = Math.max(200, Math.floor(1000 / this.speedMultiplier));
    this.timerId = setTimeout(() => {
      this.tick();
      this.scheduleNextTick();
    }, interval);
  }

  private tick(): void {
    const now = new Date();
    const timestampIso = now.toISOString();

    let baseFlows = 1250;
    let inBytes = 28.4;
    let outBytes = 14.2;
    let detectionRate = 4;
    const newAlerts: CyberThreatAlert[] = [];

    // Apply scenario dynamics
    switch (this.currentScenario) {
      case 'Normal Traffic':
        baseFlows = 1100 + Math.floor(Math.random() * 200);
        inBytes = 20 + Math.random() * 5;
        outBytes = 12 + Math.random() * 3;
        detectionRate = 0.2;
        // rare low severity alert
        if (Math.random() < 0.15) {
          newAlerts.push(this.createPortScanAlert(true));
        }
        break;

      case 'DDoS Attack':
        baseFlows = 18400 + Math.floor(Math.random() * 3000);
        inBytes = 140.5 + Math.random() * 40;
        outBytes = 8.1 + Math.random() * 2;
        detectionRate = 24;
        newAlerts.push(this.createDDoSAlert());
        if (Math.random() < 0.4) {
          newAlerts.push(this.createDDoSAlert());
        }
        break;

      case 'Botnet Beaconing':
        baseFlows = 1290 + Math.floor(Math.random() * 150);
        inBytes = 22 + Math.random() * 4;
        outBytes = 18 + Math.random() * 4;
        detectionRate = 6;
        if (Math.random() < 0.85) {
          newAlerts.push(this.createC2BeaconAlert());
        }
        break;

      case 'DGA / DNS Tunnelling':
        baseFlows = 1420 + Math.floor(Math.random() * 200);
        inBytes = 24 + Math.random() * 6;
        outBytes = 35 + Math.random() * 10;
        detectionRate = 9;
        if (Math.random() < 0.85) {
          newAlerts.push(this.createDGAAlert());
        }
        break;

      case 'Encrypted Malware':
        baseFlows = 1230 + Math.floor(Math.random() * 180);
        inBytes = 30 + Math.random() * 5;
        outBytes = 26 + Math.random() * 7;
        detectionRate = 5;
        if (Math.random() < 0.8) {
          newAlerts.push(this.createEncryptedMalwareAlert());
        }
        break;

      case 'Port Scanning':
        baseFlows = 2800 + Math.floor(Math.random() * 600);
        inBytes = 45 + Math.random() * 10;
        outBytes = 15 + Math.random() * 3;
        detectionRate = 12;
        newAlerts.push(this.createPortScanAlert(false));
        break;

      case 'Data Exfiltration':
        baseFlows = 1350 + Math.floor(Math.random() * 250);
        inBytes = 21.4 + Math.random() * 3;
        outBytes = 842.0 + Math.random() * 85; // Massive outbound surge!
        detectionRate = 8;
        if (Math.random() < 0.9) {
          newAlerts.push(this.createDataExfilAlert());
        }
        break;

      case 'Mixed Attack':
      default:
        baseFlows = 1250 + Math.floor(Math.random() * 400);
        inBytes = 32 + Math.random() * 12;
        outBytes = 28 + Math.random() * 16;
        detectionRate = 7;
        // Randomly rotate attack classes
        const roll = Math.random();
        if (roll < 0.25) newAlerts.push(this.createDDoSAlert());
        else if (roll < 0.45) newAlerts.push(this.createC2BeaconAlert());
        else if (roll < 0.65) newAlerts.push(this.createDGAAlert());
        else if (roll < 0.8) newAlerts.push(this.createEncryptedMalwareAlert());
        else if (roll < 0.92) newAlerts.push(this.createPortScanAlert(false));
        else newAlerts.push(this.createDataExfilAlert());
        break;
    }

    const totalFlowsIncrement = Math.floor(baseFlows / 2);
    this.flowCounter += totalFlowsIncrement;

    const metrics: TrafficMetricsSnapshot = {
      timestamp: timestampIso,
      flows_per_sec: baseFlows,
      inbound_bytes_mbps: parseFloat(inBytes.toFixed(1)),
      outbound_bytes_mbps: parseFloat(outBytes.toFixed(1)),
      detection_rate_per_min: detectionRate,
    };

    // Notify all subscribers
    this.subscribers.forEach((cb) =>
      cb({
        metrics,
        newAlerts,
        totalFlowsIncrement,
      })
    );
  }

  // --- Alert Generators strictly adhering to specified prompt metrics ---

  private createDDoSAlert(): CyberThreatAlert {
    this.alertSequence++;
    const flowId = `F-${89000 + Math.floor(Math.random() * 9999)}`;
    const randomOctet = 10 + Math.floor(Math.random() * 200);

    return {
      id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      flow_id: flowId,
      threat_class: 'DDoS_SYN_flood',
      severity: 'critical',
      confidence: 0.97,
      src_ip: `198.51.${randomOctet}.${10 + Math.floor(Math.random() * 80)}`,
      dst_ip: '172.16.5.22',
      src_port: 30000 + Math.floor(Math.random() * 30000),
      dst_port: 443,
      protocol: 'TCP',
      detection_latency_ms: 145 + Math.floor(Math.random() * 50),
      model_decision: 'Ensemble Random Forest + One-Class SVM flagged volumetric TCP anomaly',
      detection_reason: 'Abnormal flood of TCP SYN packets without completion, overwhelming state tables',
      evidence: {
        summary: 'SYN rate: 18,420/sec | IP entropy: 1.8 | Dst port: 443',
        top_features: {
          'SYN packets/sec': '18,420/s',
          'Source IP entropy': 1.8,
          'Flow rate': 'VERY HIGH',
          'Destination concentration': 'HIGH',
          'TCP flags ratio': 'SYN: 99.8%',
        },
        feature_breakdown: [
          { name: 'SYN packets/sec', value: '18,420/s', strength: 'VERY HIGH', score: 0.98, baseline: '< 150/s' },
          { name: 'Flow Rate', value: '18.4k flows/s', strength: 'VERY HIGH', score: 0.95, baseline: '< 1.2k flows/s' },
          { name: 'Source IP Entropy', value: '1.80 bits', strength: 'LOW', score: 0.88, baseline: '3.8 - 4.5 bits' },
          { name: 'Dst Port Concentration', value: 'Port 443 (99%)', strength: 'HIGH', score: 0.91, baseline: 'Distributed' },
        ],
      },
    };
  }

  private createC2BeaconAlert(): CyberThreatAlert {
    this.alertSequence++;
    const flowId = `F-${70000 + Math.floor(Math.random() * 9999)}`;
    const c2Ips = ['185.220.101.5', '185.141.25.18', '194.26.29.112', '185.244.25.80'];
    const chosenC2 = c2Ips[Math.floor(Math.random() * c2Ips.length)];

    return {
      id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      flow_id: flowId,
      threat_class: 'C2_beacon',
      severity: 'medium',
      confidence: 0.93,
      src_ip: '10.0.4.112',
      dst_ip: chosenC2,
      src_port: 49152 + Math.floor(Math.random() * 5000),
      dst_port: 8443,
      protocol: 'TCP',
      detection_latency_ms: 180 + Math.floor(Math.random() * 40),
      model_decision: 'LSTM Temporal Sequence Detector identified strict periodic heartbeat',
      detection_reason: 'Regular 60-second beacon intervals detected with low inter-arrival variance',
      evidence: {
        summary: 'Periodicity: 60 sec | Dst: 185.XX.XX.XX | Low variance',
        top_features: {
          'Periodicity': '60.02 sec',
          'Repeated destination': chosenC2.replace(/\.\d+\.\d+$/, '.XX.XX'),
          'Inter-arrival variance': 'LOW (0.12s)',
          'FFT peak magnitude': '0.94',
        },
        feature_breakdown: [
          { name: 'Beacon Periodicity', value: '60.02 sec', strength: 'VERY HIGH', score: 0.94, baseline: 'Aperiodic / Human' },
          { name: 'Inter-arrival Variance', value: '0.12 sec', strength: 'HIGH', score: 0.89, baseline: '> 15.0 sec' },
          { name: 'Payload Size Consistency', value: '64 bytes fixed', strength: 'HIGH', score: 0.86, baseline: 'Variable' },
          { name: 'Destination Repetition', value: '48 consecutive', strength: 'HIGH', score: 0.92, baseline: '< 5 bursts' },
        ],
      },
    };
  }

  private createDGAAlert(): CyberThreatAlert {
    this.alertSequence++;
    const flowId = `F-${60000 + Math.floor(Math.random() * 9999)}`;
    const dgaDomains = [
      'xk91mfpwqz03vbnla7204918f.xyz',
      'qq89azvmlq039487bcdae.top',
      'hzk39a8204klqmzp1893c.biz',
      'qwk920485710bcmanz913.cc',
    ];
    const queriedDomain = dgaDomains[Math.floor(Math.random() * dgaDomains.length)];

    return {
      id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      flow_id: flowId,
      threat_class: 'DGA_domain',
      severity: 'high',
      confidence: 0.96,
      src_ip: '10.0.12.87',
      dst_ip: '1.1.1.1',
      src_port: 54100 + Math.floor(Math.random() * 1000),
      dst_port: 53,
      protocol: 'UDP',
      detection_latency_ms: 110 + Math.floor(Math.random() * 30),
      model_decision: 'Character-level CNN + N-gram NLP Classifier detected high entropy domain',
      detection_reason: 'Algorithmic domain generation and TXT-based tunnelling anomaly',
      evidence: {
        summary: `Query entropy: 4.92 | Length: 47 | Record: TXT | High n-gram`,
        top_features: {
          'Query entropy': 4.92,
          'Average query length': 47,
          'Suspicious n-gram score': 'HIGH (0.91)',
          'Record type': 'TXT',
          'Domain': queriedDomain,
        },
        feature_breakdown: [
          { name: 'Shannon Entropy', value: '4.92 bits', strength: 'VERY HIGH', score: 0.96, baseline: '2.4 - 3.2 bits' },
          { name: 'Query String Length', value: '47 chars', strength: 'HIGH', score: 0.91, baseline: '12 - 20 chars' },
          { name: 'DNS Record Type', value: 'TXT Record', strength: 'MEDIUM', score: 0.75, baseline: 'A / AAAA' },
          { name: 'Consonant/Vowel Ratio', value: '8.4 : 1', strength: 'HIGH', score: 0.88, baseline: '1.5 : 1' },
        ],
      },
    };
  }

  private createEncryptedMalwareAlert(): CyberThreatAlert {
    this.alertSequence++;
    const flowId = `F-${50000 + Math.floor(Math.random() * 9999)}`;

    return {
      id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      flow_id: flowId,
      threat_class: 'TLS_malware',
      severity: 'high',
      confidence: 0.91,
      src_ip: '10.0.8.44',
      dst_ip: '45.33.32.156',
      src_port: 48210 + Math.floor(Math.random() * 2000),
      dst_port: 443,
      protocol: 'TLS/QUIC',
      detection_latency_ms: 195 + Math.floor(Math.random() * 45),
      model_decision: 'Passive TLS Metadata & Packet-Length Sequence Autoencoder anomaly',
      detection_reason: 'Suspicious JA4 fingerprint & anomalous packet timing sequences',
      evidence: {
        summary: 'TLS/QUIC fingerprint: suspicious | JA4 anomaly: high | Seq anomaly: 0.87',
        encrypted_metadata_only: true,
        top_features: {
          'TLS/QUIC fingerprint': 'Suspicious (CobaltStrike Profile)',
          'JA4 anomaly': 'HIGH (t13d1516h2_...)',
          'Packet-size sequence anomaly': 0.87,
          'Timing anomaly': 'HIGH',
          'Inspection mode': 'METADATA ONLY (Zero Decryption)',
        },
        feature_breakdown: [
          { name: 'JA4 Fingerprint Anomaly', value: 'Score 0.94', strength: 'VERY HIGH', score: 0.94, baseline: 'Known Browser Profile' },
          { name: 'Packet Size Sequence Anomaly', value: '0.87 index', strength: 'HIGH', score: 0.87, baseline: '< 0.20 index' },
          { name: 'Inter-Packet Timing Anomaly', value: 'Deviation 4.8σ', strength: 'HIGH', score: 0.89, baseline: '< 1.5σ' },
          { name: 'Cipher Suite Diversity', value: 'Restricted (2 suites)', strength: 'MEDIUM', score: 0.72, baseline: 'Standard 15+ suites' },
        ],
      },
    };
  }

  private createPortScanAlert(benignNoise: boolean = false): CyberThreatAlert {
    this.alertSequence++;
    const flowId = `F-${40000 + Math.floor(Math.random() * 9999)}`;
    const portCount = benignNoise ? 42 : 1842;
    const hostCount = benignNoise ? 12 : 324;
    const conf = benignNoise ? 0.65 : 0.98;

    return {
      id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      flow_id: flowId,
      threat_class: 'port_scan',
      severity: benignNoise ? 'low' : 'high',
      confidence: conf,
      src_ip: '192.168.1.105',
      dst_ip: '10.0.0.0/24',
      src_port: 59120,
      dst_port: 0, // indicates scanning multiple ports
      protocol: 'TCP',
      detection_latency_ms: 125 + Math.floor(Math.random() * 30),
      model_decision: 'Graph Fan-Out & Destination Dispersal Graph Neural Network',
      detection_reason: 'High-speed horizontal and vertical port scanning pattern across subnets',
      evidence: {
        summary: `Unique ports: ${portCount} | Unique hosts: ${hostCount} | Fan-out: high`,
        top_features: {
          'Unique destination ports': portCount,
          'Unique hosts': hostCount,
          'Fan-out rate': benignNoise ? 'MODERATE' : 'HIGH (420 pkts/s)',
          'TCP SYN/ACK ratio': '100% Unanswered SYN',
        },
        feature_breakdown: [
          { name: 'Unique Destination Ports', value: `${portCount} ports`, strength: 'VERY HIGH', score: 0.98, baseline: '< 5 ports/min' },
          { name: 'Target Host Fan-Out', value: `${hostCount} hosts`, strength: 'HIGH', score: 0.92, baseline: 'Single Host' },
          { name: 'Unanswered SYN Ratio', value: '99.7%', strength: 'VERY HIGH', score: 0.97, baseline: '< 2.0%' },
          { name: 'Port Dispersal Velocity', value: '380 ports/sec', strength: 'HIGH', score: 0.90, baseline: '< 10 ports/sec' },
        ],
      },
    };
  }

  private createDataExfilAlert(): CyberThreatAlert {
    this.alertSequence++;
    const flowId = `F-${30000 + Math.floor(Math.random() * 9999)}`;

    return {
      id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      flow_id: flowId,
      threat_class: 'data_exfil',
      severity: 'high',
      confidence: 0.95,
      src_ip: '10.0.2.19',
      dst_ip: '142.250.190.46',
      src_port: 52140,
      dst_port: 443,
      protocol: 'TCP',
      detection_latency_ms: 160 + Math.floor(Math.random() * 40),
      model_decision: 'Unidirectional Flow Asymmetry Isolation Forest',
      detection_reason: 'Extreme outbound-to-inbound volume asymmetry sustained over duration',
      evidence: {
        summary: 'Outbound: 842 MB | Inbound: 21 MB | Ratio: 40.1 | Duration: 18 min',
        top_features: {
          'Outbound bytes': '842 MB',
          'Inbound bytes': '21 MB',
          'Outbound/Inbound ratio': 40.1,
          'Flow duration': '18 min',
          'Data upload rate': '3.2 MB/s burst',
        },
        feature_breakdown: [
          { name: 'Outbound / Inbound Ratio', value: '40.1 : 1', strength: 'VERY HIGH', score: 0.96, baseline: '1 : 4 (typical client)' },
          { name: 'Total Outbound Volume', value: '842 MB', strength: 'HIGH', score: 0.92, baseline: '< 50 MB / session' },
          { name: 'Continuous Flow Duration', value: '18 min', strength: 'MEDIUM', score: 0.81, baseline: '< 3 min' },
          { name: 'Packet Egress Velocity', value: 'Sustained Full-MTU', strength: 'HIGH', score: 0.88, baseline: 'Sporadic burst' },
        ],
      },
    };
  }
}

// Export singleton instance
export const trafficSimulator = new TrafficSimulator();
