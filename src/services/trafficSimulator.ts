import { CyberThreatAlert, ScenarioType, TrafficMetricsSnapshot } from '../types/alert';

export type StreamCallback = (data: { metrics: TrafficMetricsSnapshot; newAlerts: CyberThreatAlert[]; totalFlowsIncrement: number }) => void;
interface ReplayEvent { metrics: TrafficMetricsSnapshot; totalFlowsIncrement: number; prediction: CyberThreatAlert; is_alert: boolean; }
const API_BASE_URL = 'http://localhost:8000';

class TrafficReplayService {
  private eventSource: EventSource | null = null;
  private speedMultiplier = 1;
  private currentScenario: ScenarioType = 'Mixed Attack';
  private subscribers = new Set<StreamCallback>();

  public subscribe(cb: StreamCallback): () => void { this.subscribers.add(cb); return () => this.subscribers.delete(cb); }
  public start(): void {
    if (this.eventSource) return;
    const params = new URLSearchParams({ scenario: this.currentScenario, interval_ms: String(Math.max(100, Math.floor(600 / this.speedMultiplier))) });
    this.eventSource = new EventSource(`${API_BASE_URL}/replay/stream?${params}`);
    this.eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data) as ReplayEvent;
      this.subscribers.forEach((subscriber) => subscriber({ metrics: payload.metrics, newAlerts: payload.is_alert ? [payload.prediction] : [], totalFlowsIncrement: payload.totalFlowsIncrement }));
    };
    this.eventSource.onerror = () => this.pause();
  }
  public pause(): void { this.eventSource?.close(); this.eventSource = null; }
  public reset(): void { this.pause(); }
  public setSpeed(multiplier: number): void { this.speedMultiplier = multiplier; if (this.eventSource) { this.pause(); this.start(); } }
  public setScenario(scenario: ScenarioType): void { this.currentScenario = scenario; if (this.eventSource) { this.pause(); this.start(); } }
}

export const trafficSimulator = new TrafficReplayService();
