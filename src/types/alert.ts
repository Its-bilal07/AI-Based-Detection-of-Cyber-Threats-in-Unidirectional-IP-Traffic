export type ThreatClass =
  | 'DDoS_SYN_flood'
  | 'C2_beacon'
  | 'DGA_domain'
  | 'TLS_malware'
  | 'port_scan'
  | 'data_exfil';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ProtocolType = 'TCP' | 'UDP' | 'ICMP' | 'TLS/QUIC' | 'DNS' | 'GRE';

export interface AnomalyFeature {
  name: string;
  value: string | number;
  strength: 'NORMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';
  score: number; // 0.0 - 1.0 for bar width
  baseline: string;
}

export interface AlertEvidence {
  summary: string;
  top_features: Record<string, string | number>;
  feature_breakdown: AnomalyFeature[];
  encrypted_metadata_only?: boolean;
}

export interface CyberThreatAlert {
  id: string;
  timestamp: string; // ISO 8601
  flow_id: string;
  threat_class: ThreatClass;
  severity: SeverityLevel;
  confidence: number; // 0.0 - 1.0
  evidence: AlertEvidence;
  src_ip: string;
  dst_ip: string;
  src_port: number;
  dst_port: number;
  protocol: ProtocolType;
  detection_latency_ms: number;
  model_decision: string;
  detection_reason: string;
}

export type ScenarioType =
  | 'Normal Traffic'
  | 'DDoS Attack'
  | 'Botnet Beaconing'
  | 'DGA / DNS Tunnelling'
  | 'Encrypted Malware'
  | 'Port Scanning'
  | 'Data Exfiltration'
  | 'Mixed Attack';

export interface TrafficMetricsSnapshot {
  timestamp: string;
  flows_per_sec: number;
  inbound_bytes_mbps: number;
  outbound_bytes_mbps: number;
  detection_rate_per_min: number;
}

export interface ThreatCategorySummary {
  threat_class: ThreatClass;
  name: string;
  alertCount: number;
  color: string;
  icon: string;
}
