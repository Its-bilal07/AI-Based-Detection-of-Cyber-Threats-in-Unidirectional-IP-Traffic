import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  CyberThreatAlert,
  ScenarioType,
  SeverityLevel,
  ThreatClass,
  TrafficMetricsSnapshot,
} from '../types/alert';
import { trafficSimulator } from '../services/trafficSimulator';

interface SOCContextType {
  // KPIs
  totalFlows: number;
  threatsDetected: number;
  criticalAlerts: number;
  averageConfidence: number;
  currentThroughput: number;
  detectionLatency: number;

  // Simulator controls
  isReplayRunning: boolean;
  replaySpeed: number;
  currentScenario: ScenarioType;
  startReplay: () => void;
  pauseReplay: () => void;
  resetReplay: () => void;
  setSpeed: (speed: number) => void;
  setScenario: (scenario: ScenarioType) => void;

  // Stream data
  alerts: CyberThreatAlert[];
  metricsHistory: TrafficMetricsSnapshot[];
  selectedAlert: CyberThreatAlert | null;
  setSelectedAlert: (alert: CyberThreatAlert | null) => void;

  // Filters
  filterThreatClass: ThreatClass | 'ALL';
  setFilterThreatClass: (cls: ThreatClass | 'ALL') => void;
  filterSeverity: SeverityLevel | 'ALL';
  setFilterSeverity: (sev: SeverityLevel | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Threat distribution counts
  threatCounts: Record<ThreatClass, number>;

  // Schema Modal
  isSchemaModalOpen: boolean;
  setIsSchemaModalOpen: (open: boolean) => void;
}

const SOCContext = createContext<SOCContextType | undefined>(undefined);

export const SOCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalFlows, setTotalFlows] = useState<number>(1284921);
  const [threatsDetected, setThreatsDetected] = useState<number>(347);
  const [criticalAlerts, setCriticalAlerts] = useState<number>(18);
  const [averageConfidence, setAverageConfidence] = useState<number>(94.7);
  const [currentThroughput, setCurrentThroughput] = useState<number>(1250);
  const [detectionLatency, setDetectionLatency] = useState<number>(180);

  const [isReplayRunning, setIsReplayRunning] = useState<boolean>(true);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('Mixed Attack');

  const [alerts, setAlerts] = useState<CyberThreatAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<CyberThreatAlert | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<TrafficMetricsSnapshot[]>([]);

  const [filterThreatClass, setFilterThreatClass] = useState<ThreatClass | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);

  const [threatCounts, setThreatCounts] = useState<Record<ThreatClass, number>>({
    DDoS_SYN_flood: 98,
    C2_beacon: 64,
    DGA_domain: 56,
    TLS_malware: 42,
    port_scan: 51,
    data_exfil: 36,
  });

  // Seed initial alerts so the dashboard looks loaded and alive immediately upon mounting
  useEffect(() => {
    // Generate initial history metrics points for the charts
    const initialHistory: TrafficMetricsSnapshot[] = [];
    const now = Date.now();
    for (let i = 25; i >= 0; i--) {
      const pastTime = new Date(now - i * 3000).toISOString();
      initialHistory.push({
        timestamp: pastTime,
        flows_per_sec: 1200 + Math.floor(Math.sin(i / 3) * 150) + Math.floor(Math.random() * 80),
        inbound_bytes_mbps: 26 + Math.floor(Math.random() * 8),
        outbound_bytes_mbps: 14 + Math.floor(Math.random() * 6),
        detection_rate_per_min: 4 + Math.floor(Math.random() * 3),
      });
    }
    setMetricsHistory(initialHistory);

    // Initial seed alerts
    const seedAlerts: CyberThreatAlert[] = [
      {
        id: 'INIT-1',
        timestamp: new Date(now - 1000).toISOString(),
        flow_id: 'F-92831',
        threat_class: 'DDoS_SYN_flood',
        severity: 'critical',
        confidence: 0.97,
        src_ip: '10.2.4.18',
        dst_ip: '172.16.5.22',
        src_port: 48921,
        dst_port: 443,
        protocol: 'TCP',
        detection_latency_ms: 145,
        model_decision: 'Random Forest + One-Class SVM flagged volumetric TCP anomaly',
        detection_reason: 'Abnormal flood of TCP SYN packets without completion, overwhelming state tables',
        evidence: {
          summary: 'SYN rate: 18,420/sec | IP entropy: 1.8 | Dst port: 443',
          top_features: {
            'SYN packets/sec': '18,420/s',
            'Source IP entropy': 1.8,
            'Flow rate': 'VERY HIGH',
            'Destination concentration': 'HIGH',
          },
          feature_breakdown: [
            { name: 'SYN packets/sec', value: '18,420/s', strength: 'VERY HIGH', score: 0.98, baseline: '< 150/s' },
            { name: 'Flow Rate', value: '18.4k flows/s', strength: 'VERY HIGH', score: 0.95, baseline: '< 1.2k flows/s' },
            { name: 'Source IP Entropy', value: '1.80 bits', strength: 'LOW', score: 0.88, baseline: '3.8 - 4.5 bits' },
            { name: 'Dst Port Concentration', value: 'Port 443 (99%)', strength: 'HIGH', score: 0.91, baseline: 'Distributed' },
          ],
        },
      },
      {
        id: 'INIT-2',
        timestamp: new Date(now - 3000).toISOString(),
        flow_id: 'F-92829',
        threat_class: 'port_scan',
        severity: 'high',
        confidence: 0.98,
        src_ip: '192.168.1.105',
        dst_ip: '10.0.0.0/24',
        src_port: 59120,
        dst_port: 0,
        protocol: 'TCP',
        detection_latency_ms: 125,
        model_decision: 'Graph Fan-Out & Destination Dispersal Neural Network',
        detection_reason: 'High-speed horizontal and vertical port scanning pattern across subnets',
        evidence: {
          summary: 'Unique destination ports: 1,842 | Unique hosts: 324 | Fan-out: high',
          top_features: {
            'Unique destination ports': 1842,
            'Unique hosts': 324,
            'Fan-out rate': 'HIGH',
            'TCP SYN/ACK ratio': '100% Unanswered SYN',
          },
          feature_breakdown: [
            { name: 'Unique Destination Ports', value: '1,842 ports', strength: 'VERY HIGH', score: 0.98, baseline: '< 5 ports/min' },
            { name: 'Target Host Fan-Out', value: '324 hosts', strength: 'HIGH', score: 0.92, baseline: 'Single Host' },
            { name: 'Unanswered SYN Ratio', value: '99.7%', strength: 'VERY HIGH', score: 0.97, baseline: '< 2.0%' },
            { name: 'Port Dispersal Velocity', value: '380 ports/sec', strength: 'HIGH', score: 0.90, baseline: '< 10 ports/sec' },
          ],
        },
      },
      {
        id: 'INIT-3',
        timestamp: new Date(now - 6000).toISOString(),
        flow_id: 'F-92826',
        threat_class: 'DGA_domain',
        severity: 'high',
        confidence: 0.96,
        src_ip: '10.0.12.87',
        dst_ip: '1.1.1.1',
        src_port: 54100,
        dst_port: 53,
        protocol: 'UDP',
        detection_latency_ms: 110,
        model_decision: 'Character-level CNN + N-gram NLP Classifier',
        detection_reason: 'Algorithmic domain generation and TXT-based tunnelling anomaly',
        evidence: {
          summary: 'Query entropy: 4.92 | Length: 47 | Record: TXT | High n-gram',
          top_features: {
            'Query entropy': 4.92,
            'Average query length': 47,
            'Suspicious n-gram score': 'HIGH (0.91)',
            'Record type': 'TXT',
          },
          feature_breakdown: [
            { name: 'Shannon Entropy', value: '4.92 bits', strength: 'VERY HIGH', score: 0.96, baseline: '2.4 - 3.2 bits' },
            { name: 'Query String Length', value: '47 chars', strength: 'HIGH', score: 0.91, baseline: '12 - 20 chars' },
            { name: 'DNS Record Type', value: 'TXT Record', strength: 'MEDIUM', score: 0.75, baseline: 'A / AAAA' },
            { name: 'Consonant/Vowel Ratio', value: '8.4 : 1', strength: 'HIGH', score: 0.88, baseline: '1.5 : 1' },
          ],
        },
      },
      {
        id: 'INIT-4',
        timestamp: new Date(now - 9000).toISOString(),
        flow_id: 'F-92822',
        threat_class: 'C2_beacon',
        severity: 'medium',
        confidence: 0.93,
        src_ip: '10.0.4.112',
        dst_ip: '185.220.101.5',
        src_port: 49152,
        dst_port: 8443,
        protocol: 'TCP',
        detection_latency_ms: 180,
        model_decision: 'LSTM Temporal Sequence Detector identified strict periodic heartbeat',
        detection_reason: 'Regular 60-second beacon intervals detected with low inter-arrival variance',
        evidence: {
          summary: 'Periodicity: 60 sec | Dst: 185.XX.XX.XX | Low variance',
          top_features: {
            'Periodicity': '60 sec',
            'Repeated destination': '185.XX.XX.XX',
            'Inter-arrival variance': 'LOW',
            'Confidence': '93%',
          },
          feature_breakdown: [
            { name: 'Beacon Periodicity', value: '60.0 sec', strength: 'VERY HIGH', score: 0.94, baseline: 'Aperiodic' },
            { name: 'Inter-arrival Variance', value: '0.12 sec', strength: 'HIGH', score: 0.89, baseline: '> 15.0 sec' },
            { name: 'Payload Size Consistency', value: '64 bytes fixed', strength: 'HIGH', score: 0.86, baseline: 'Variable' },
            { name: 'Destination Repetition', value: '48 consecutive', strength: 'HIGH', score: 0.92, baseline: '< 5 bursts' },
          ],
        },
      },
      {
        id: 'INIT-5',
        timestamp: new Date(now - 13000).toISOString(),
        flow_id: 'F-92818',
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
            'Flow duration': '18 min',
          },
          feature_breakdown: [
            { name: 'Outbound / Inbound Ratio', value: '40.1 : 1', strength: 'VERY HIGH', score: 0.96, baseline: '1 : 4 (typical client)' },
            { name: 'Total Outbound Volume', value: '842 MB', strength: 'HIGH', score: 0.92, baseline: '< 50 MB / session' },
            { name: 'Continuous Flow Duration', value: '18 min', strength: 'MEDIUM', score: 0.81, baseline: '< 3 min' },
            { name: 'Packet Egress Velocity', value: 'Sustained Full-MTU', strength: 'HIGH', score: 0.88, baseline: 'Sporadic burst' },
          ],
        },
      },
      {
        id: 'INIT-6',
        timestamp: new Date(now - 18000).toISOString(),
        flow_id: 'F-92812',
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
        detection_reason: 'Suspicious JA4 fingerprint & anomalous packet timing sequences (Metadata only)',
        evidence: {
          summary: 'TLS/QUIC fingerprint: suspicious | JA4 anomaly: high | Seq anomaly: 0.87',
          encrypted_metadata_only: true,
          top_features: {
            'TLS/QUIC fingerprint': 'Suspicious',
            'JA4 anomaly': 'HIGH',
            'Packet-size sequence anomaly': 0.87,
            'Timing anomaly': 'HIGH',
          },
          feature_breakdown: [
            { name: 'JA4 Fingerprint Anomaly', value: 'Score 0.94', strength: 'VERY HIGH', score: 0.94, baseline: 'Known Browser Profile' },
            { name: 'Packet Size Sequence Anomaly', value: '0.87 index', strength: 'HIGH', score: 0.87, baseline: '< 0.20 index' },
            { name: 'Inter-Packet Timing Anomaly', value: 'Deviation 4.8σ', strength: 'HIGH', score: 0.89, baseline: '< 1.5σ' },
            { name: 'Cipher Suite Diversity', value: 'Restricted (2 suites)', strength: 'MEDIUM', score: 0.72, baseline: 'Standard 15+ suites' },
          ],
        },
      },
    ];

    setAlerts(seedAlerts);
  }, []);

  // Subscribe to simulator streaming events
  useEffect(() => {
    const unsubscribe = trafficSimulator.subscribe(({ metrics, newAlerts, totalFlowsIncrement }) => {
      setTotalFlows((prev) => prev + totalFlowsIncrement);
      setCurrentThroughput(metrics.flows_per_sec);

      // Append metrics history and slide window (max 30 points)
      setMetricsHistory((prev) => {
        const next = [...prev, metrics];
        if (next.length > 30) {
          return next.slice(next.length - 30);
        }
        return next;
      });

      if (newAlerts.length > 0) {
        setThreatsDetected((prev) => prev + newAlerts.length);

        // Update counts
        setThreatCounts((prev) => {
          const updated = { ...prev };
          newAlerts.forEach((a) => {
            updated[a.threat_class] = (updated[a.threat_class] || 0) + 1;
          });
          return updated;
        });

        // Update critical alerts
        const critCount = newAlerts.filter((a) => a.severity === 'critical').length;
        if (critCount > 0) {
          setCriticalAlerts((prev) => prev + critCount);
        }

        // Update latency and confidence
        const latestAlert = newAlerts[newAlerts.length - 1];
        setDetectionLatency(latestAlert.detection_latency_ms);
        setAverageConfidence((prev) => {
          return parseFloat(((prev * 0.95) + (latestAlert.confidence * 100 * 0.05)).toFixed(1));
        });

        // Prepend to alerts list (max 150 alerts in memory)
        setAlerts((prev) => {
          const combined = [...newAlerts, ...prev];
          if (combined.length > 150) {
            return combined.slice(0, 150);
          }
          return combined;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const startReplay = () => {
    trafficSimulator.start();
    setIsReplayRunning(true);
  };

  const pauseReplay = () => {
    trafficSimulator.pause();
    setIsReplayRunning(false);
  };

  const resetReplay = () => {
    trafficSimulator.reset();
    setTotalFlows(1000000);
    setThreatsDetected(100);
    setCriticalAlerts(5);
  };

  const setSpeed = (speed: number) => {
    setReplaySpeed(speed);
    trafficSimulator.setSpeed(speed);
  };

  const setScenario = (scenario: ScenarioType) => {
    setCurrentScenario(scenario);
    trafficSimulator.setScenario(scenario);
  };

  const value = useMemo(
    () => ({
      totalFlows,
      threatsDetected,
      criticalAlerts,
      averageConfidence,
      currentThroughput,
      detectionLatency,
      isReplayRunning,
      replaySpeed,
      currentScenario,
      startReplay,
      pauseReplay,
      resetReplay,
      setSpeed,
      setScenario,
      alerts,
      metricsHistory,
      selectedAlert,
      setSelectedAlert,
      filterThreatClass,
      setFilterThreatClass,
      filterSeverity,
      setFilterSeverity,
      searchQuery,
      setSearchQuery,
      threatCounts,
      isSchemaModalOpen,
      setIsSchemaModalOpen,
    }),
    [
      totalFlows,
      threatsDetected,
      criticalAlerts,
      averageConfidence,
      currentThroughput,
      detectionLatency,
      isReplayRunning,
      replaySpeed,
      currentScenario,
      alerts,
      metricsHistory,
      selectedAlert,
      filterThreatClass,
      filterSeverity,
      searchQuery,
      threatCounts,
      isSchemaModalOpen,
    ]
  );

  return <SOCContext.Provider value={value}>{children}</SOCContext.Provider>;
};

export const useSOC = (): SOCContextType => {
  const context = useContext(SOCContext);
  if (!context) {
    throw new Error('useSOC must be used within a SOCProvider');
  }
  return context;
};
