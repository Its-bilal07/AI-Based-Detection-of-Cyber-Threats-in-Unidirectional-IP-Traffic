import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  CyberThreatAlert,
  ScenarioType,
  SeverityLevel,
  ThreatClass,
  TrafficMetricsSnapshot,
} from '../types/alert';
import { trafficSimulator } from '../services/trafficSimulator';

interface SOCContextType {
  totalFlows: number;
  threatsDetected: number;
  criticalAlerts: number;
  averageConfidence: number;
  currentThroughput: number;
  detectionLatency: number;

  isReplayRunning: boolean;
  replaySpeed: number;
  currentScenario: ScenarioType;
  startReplay: () => void;
  pauseReplay: () => void;
  resetReplay: () => void;
  setSpeed: (speed: number) => void;
  setScenario: (scenario: ScenarioType) => void;

  alerts: CyberThreatAlert[];
  metricsHistory: TrafficMetricsSnapshot[];
  selectedAlert: CyberThreatAlert | null;
  setSelectedAlert: (alert: CyberThreatAlert | null) => void;

  filterThreatClass: ThreatClass | 'ALL';
  setFilterThreatClass: (cls: ThreatClass | 'ALL') => void;
  filterSeverity: SeverityLevel | 'ALL';
  setFilterSeverity: (sev: SeverityLevel | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  threatCounts: Record<ThreatClass, number>;
  isSchemaModalOpen: boolean;
  setIsSchemaModalOpen: (open: boolean) => void;
}

const SOCContext = createContext<SOCContextType | undefined>(undefined);

const initialThreatCounts: Record<ThreatClass, number> = {
  DDoS_SYN_flood: 98,
  C2_beacon: 64,
  DGA_domain: 56,
  TLS_malware: 42,
  port_scan: 51,
  data_exfil: 36,
};

const createInitialMetricsHistory = (): TrafficMetricsSnapshot[] => {
  const history: TrafficMetricsSnapshot[] = [];
  const now = Date.now();
  for (let i = 25; i >= 0; i--) {
    const pastTime = new Date(now - i * 2500).toISOString();
    history.push({
      timestamp: pastTime,
      flows_per_sec: 1200 + Math.floor(Math.sin(i / 2.5) * 120) + Math.floor(Math.random() * 60),
      inbound_bytes_mbps: 26 + Math.floor(Math.random() * 6),
      outbound_bytes_mbps: 14 + Math.floor(Math.random() * 4),
      detection_rate_per_min: 4 + Math.floor(Math.random() * 3),
    });
  }
  return history;
};

const initialSeedAlerts: CyberThreatAlert[] = [
  {
    id: 'ALT-SEED-1',
    timestamp: new Date(Date.now() - 4000).toISOString(),
    flow_id: 'F-92831',
    threat_class: 'DDoS_SYN_flood',
    severity: 'critical',
    confidence: 0.97,
    src_ip: '10.2.4.18',
    dst_ip: '172.16.5.22',
    src_port: 48921,
    dst_port: 443,
    protocol: 'TCP',
    detection_latency_ms: 64,
    model_decision: 'XGBoost Unidirectional Volumetric Classifier flagged DoS signature',
    detection_reason: 'Abnormal flood of TCP SYN packets without completion, overwhelming state tables',
    evidence: {
      summary: 'SYN rate: 18,420/sec | IP entropy: 1.8 | Dst port: 443',
      top_features: {
        'Source Bitrate (sload)': '185.4 Mbps',
        'Packet Rate (rate)': '14.2k pkts/s',
        'Connection State': 'INT',
        'Source TTL (sttl)': 254,
      },
      feature_breakdown: [
        { name: 'Source Bitrate (sload)', value: '185.4 Mbps', strength: 'VERY HIGH', score: 0.95, baseline: '< 5.2 Mbps' },
        { name: 'Packet Rate (rate)', value: '14.2k pkts/s', strength: 'VERY HIGH', score: 0.93, baseline: '< 500 pkts/s' },
        { name: 'Connection State (state)', value: 'State: INT', strength: 'VERY HIGH', score: 0.94, baseline: 'FIN / CON (Normal Handshake)' },
        { name: 'Source TTL (sttl)', value: 'TTL 254', strength: 'HIGH', score: 0.91, baseline: '31 - 64 (OS Default)' },
      ],
      encrypted_metadata_only: false,
    },
  },
  {
    id: 'ALT-SEED-2',
    timestamp: new Date(Date.now() - 12000).toISOString(),
    flow_id: 'F-87219',
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
        'FFT peak magnitude': '0.94',
      },
      feature_breakdown: [
        { name: 'Beacon Periodicity', value: '60.02 sec', strength: 'VERY HIGH', score: 0.94, baseline: 'Aperiodic / Human' },
        { name: 'Inter-arrival Variance', value: '0.12 sec', strength: 'HIGH', score: 0.89, baseline: '> 15.0 sec' },
        { name: 'Payload Size Consistency', value: '64 bytes fixed', strength: 'HIGH', score: 0.86, baseline: 'Variable' },
      ],
      encrypted_metadata_only: false,
    },
  },
  {
    id: 'ALT-SEED-3',
    timestamp: new Date(Date.now() - 25000).toISOString(),
    flow_id: 'F-74192',
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
    detection_reason: 'Algorithmic domain generation and anomalous query string length exceeding normal entropy',
    evidence: {
      summary: 'Query entropy: 4.92 | Length: 47 | Record: TXT | High n-gram',
      top_features: {
        'Query entropy': 4.92,
        'Average query length': 47,
        'Record type': 'TXT',
        'Domain': 'xk91mfpwqz03vbnla7204918f.xyz',
      },
      feature_breakdown: [
        { name: 'Shannon Entropy', value: '4.92 bits', strength: 'VERY HIGH', score: 0.96, baseline: '2.4 - 3.2 bits' },
        { name: 'Query String Length', value: '47 chars', strength: 'HIGH', score: 0.91, baseline: '12 - 20 chars' },
      ],
      encrypted_metadata_only: false,
    },
  },
  {
    id: 'ALT-SEED-4',
    timestamp: new Date(Date.now() - 38000).toISOString(),
    flow_id: 'F-61204',
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
      top_features: {
        'TLS/QUIC fingerprint': 'Suspicious (CobaltStrike Profile)',
        'JA4 anomaly': 'HIGH (t13d1516h2_...)',
        'Packet-size sequence anomaly': 0.87,
      },
      feature_breakdown: [
        { name: 'JA4 Fingerprint Anomaly', value: 'Score 0.94', strength: 'VERY HIGH', score: 0.94, baseline: 'Known Browser Profile' },
        { name: 'Packet Size Sequence Anomaly', value: '0.87 index', strength: 'HIGH', score: 0.87, baseline: '< 0.20 index' },
      ],
      encrypted_metadata_only: true,
    },
  },
  {
    id: 'ALT-SEED-5',
    timestamp: new Date(Date.now() - 50000).toISOString(),
    flow_id: 'F-52011',
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
      encrypted_metadata_only: false,
    },
  },
  {
    id: 'ALT-SEED-6',
    timestamp: new Date(Date.now() - 65000).toISOString(),
    flow_id: 'F-41890',
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
      encrypted_metadata_only: false,
    },
  },
];

export const SOCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalFlows, setTotalFlows] = useState(1284920);
  const [threatsDetected, setThreatsDetected] = useState(347);
  const [criticalAlerts, setCriticalAlerts] = useState(18);
  const [averageConfidence, setAverageConfidence] = useState(94.7);
  const [currentThroughput, setCurrentThroughput] = useState(1250);
  const [detectionLatency, setDetectionLatency] = useState(64);

  const [isReplayRunning, setIsReplayRunning] = useState(true);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>('Mixed Attack');

  const [alerts, setAlerts] = useState<CyberThreatAlert[]>(initialSeedAlerts);
  const [selectedAlert, setSelectedAlert] = useState<CyberThreatAlert | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<TrafficMetricsSnapshot[]>(createInitialMetricsHistory);

  const [filterThreatClass, setFilterThreatClass] = useState<ThreatClass | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false);
  const [threatCounts, setThreatCounts] = useState<Record<ThreatClass, number>>(initialThreatCounts);

  useEffect(() => {
    const unsubscribe = trafficSimulator.subscribe(({ metrics, newAlerts, totalFlowsIncrement }) => {
      setTotalFlows((previous) => previous + totalFlowsIncrement);
      setCurrentThroughput(metrics.flows_per_sec);
      setMetricsHistory((previous) => [...previous, metrics].slice(-30));

      if (newAlerts && newAlerts.length > 0) {
        setThreatsDetected((previous) => previous + newAlerts.length);
        setThreatCounts((previous) => {
          const updated = { ...previous };
          newAlerts.forEach((alert) => {
            if (alert.threat_class in updated) {
              updated[alert.threat_class] += 1;
            }
          });
          return updated;
        });

        const critCount = newAlerts.filter((alert) => alert.severity === 'critical').length;
        if (critCount > 0) {
          setCriticalAlerts((previous) => previous + critCount);
        }

        const latestAlert = newAlerts[newAlerts.length - 1];
        if (latestAlert.detection_latency_ms) {
          setDetectionLatency(Math.round(latestAlert.detection_latency_ms));
        }

        setAverageConfidence((previous) => {
          const target = latestAlert.confidence * 100;
          const updated = (previous * 0.95) + (target * 0.05);
          return parseFloat(updated.toFixed(1));
        });

        setAlerts((previous) => [...newAlerts, ...previous].slice(0, 150));
      }
    });

    trafficSimulator.start();
    setIsReplayRunning(true);

    return () => {
      unsubscribe();
      trafficSimulator.pause();
    };
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
    setTotalFlows(1284920);
    setThreatsDetected(347);
    setCriticalAlerts(18);
    setAverageConfidence(94.7);
    setDetectionLatency(64);
    setAlerts(initialSeedAlerts);
    setMetricsHistory(createInitialMetricsHistory());
    setThreatCounts({ ...initialThreatCounts });
    setIsReplayRunning(false);
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
  if (!context) throw new Error('useSOC must be used within a SOCProvider');
  return context;
};

