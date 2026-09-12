import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CyberThreatAlert, ScenarioType, SeverityLevel, ThreatClass, TrafficMetricsSnapshot } from '../types/alert';
import { trafficSimulator } from '../services/trafficSimulator';

interface SOCContextType {
  totalFlows: number; threatsDetected: number; criticalAlerts: number; averageConfidence: number; currentThroughput: number; detectionLatency: number;
  isReplayRunning: boolean; replaySpeed: number; currentScenario: ScenarioType; startReplay: () => void; pauseReplay: () => void; resetReplay: () => void; setSpeed: (speed: number) => void; setScenario: (scenario: ScenarioType) => void;
  alerts: CyberThreatAlert[]; metricsHistory: TrafficMetricsSnapshot[]; selectedAlert: CyberThreatAlert | null; setSelectedAlert: (alert: CyberThreatAlert | null) => void;
  filterThreatClass: ThreatClass | 'ALL'; setFilterThreatClass: (cls: ThreatClass | 'ALL') => void; filterSeverity: SeverityLevel | 'ALL'; setFilterSeverity: (sev: SeverityLevel | 'ALL') => void; searchQuery: string; setSearchQuery: (q: string) => void;
  threatCounts: Record<ThreatClass, number>; isSchemaModalOpen: boolean; setIsSchemaModalOpen: (open: boolean) => void;
}

const SOCContext = createContext<SOCContextType | undefined>(undefined);
const emptyThreatCounts: Record<ThreatClass, number> = { DDoS_SYN_flood: 0, C2_beacon: 0, DGA_domain: 0, TLS_malware: 0, port_scan: 0, data_exfil: 0 };

export const SOCProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalFlows, setTotalFlows] = useState(0); const [threatsDetected, setThreatsDetected] = useState(0); const [criticalAlerts, setCriticalAlerts] = useState(0); const [averageConfidence, setAverageConfidence] = useState(0); const [currentThroughput, setCurrentThroughput] = useState(0); const [detectionLatency, setDetectionLatency] = useState(0);
  const [isReplayRunning, setIsReplayRunning] = useState(false); const [replaySpeed, setReplaySpeed] = useState(1); const [currentScenario, setCurrentScenario] = useState<ScenarioType>('Mixed Attack');
  const [alerts, setAlerts] = useState<CyberThreatAlert[]>([]); const [selectedAlert, setSelectedAlert] = useState<CyberThreatAlert | null>(null); const [metricsHistory, setMetricsHistory] = useState<TrafficMetricsSnapshot[]>([]);
  const [filterThreatClass, setFilterThreatClass] = useState<ThreatClass | 'ALL'>('ALL'); const [filterSeverity, setFilterSeverity] = useState<SeverityLevel | 'ALL'>('ALL'); const [searchQuery, setSearchQuery] = useState(''); const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false); const [threatCounts, setThreatCounts] = useState(emptyThreatCounts);

  useEffect(() => {
    const unsubscribe = trafficSimulator.subscribe(({ metrics, newAlerts, totalFlowsIncrement }) => {
      setTotalFlows((previous) => previous + totalFlowsIncrement); setCurrentThroughput(metrics.flows_per_sec); setMetricsHistory((previous) => [...previous, metrics].slice(-30));
      if (newAlerts.length === 0) return;
      setThreatsDetected((previous) => previous + newAlerts.length); setThreatCounts((previous) => { const updated = { ...previous }; newAlerts.forEach((alert) => { if (alert.threat_class in updated) updated[alert.threat_class] += 1; }); return updated; });
      setCriticalAlerts((previous) => previous + newAlerts.filter((alert) => alert.severity === 'critical').length); const latestAlert = newAlerts[newAlerts.length - 1]; setDetectionLatency(latestAlert.detection_latency_ms); setAverageConfidence((previous) => previous === 0 ? latestAlert.confidence * 100 : (previous * 0.95) + (latestAlert.confidence * 100 * 0.05)); setAlerts((previous) => [...newAlerts, ...previous].slice(0, 150));
    });
    trafficSimulator.start(); setIsReplayRunning(true); return () => { unsubscribe(); trafficSimulator.pause(); };
  }, []);

  const startReplay = () => { trafficSimulator.start(); setIsReplayRunning(true); }; const pauseReplay = () => { trafficSimulator.pause(); setIsReplayRunning(false); };
  const resetReplay = () => { trafficSimulator.reset(); setTotalFlows(0); setThreatsDetected(0); setCriticalAlerts(0); setAverageConfidence(0); setDetectionLatency(0); setAlerts([]); setMetricsHistory([]); setThreatCounts({ ...emptyThreatCounts }); setIsReplayRunning(false); };
  const setSpeed = (speed: number) => { setReplaySpeed(speed); trafficSimulator.setSpeed(speed); }; const setScenario = (scenario: ScenarioType) => { setCurrentScenario(scenario); trafficSimulator.setScenario(scenario); };
  const value = useMemo(() => ({ totalFlows, threatsDetected, criticalAlerts, averageConfidence, currentThroughput, detectionLatency, isReplayRunning, replaySpeed, currentScenario, startReplay, pauseReplay, resetReplay, setSpeed, setScenario, alerts, metricsHistory, selectedAlert, setSelectedAlert, filterThreatClass, setFilterThreatClass, filterSeverity, setFilterSeverity, searchQuery, setSearchQuery, threatCounts, isSchemaModalOpen, setIsSchemaModalOpen }), [totalFlows, threatsDetected, criticalAlerts, averageConfidence, currentThroughput, detectionLatency, isReplayRunning, replaySpeed, currentScenario, alerts, metricsHistory, selectedAlert, filterThreatClass, filterSeverity, searchQuery, threatCounts, isSchemaModalOpen]);
  return <SOCContext.Provider value={value}>{children}</SOCContext.Provider>;
};

export const useSOC = (): SOCContextType => { const context = useContext(SOCContext); if (!context) throw new Error('useSOC must be used within a SOCProvider'); return context; };
