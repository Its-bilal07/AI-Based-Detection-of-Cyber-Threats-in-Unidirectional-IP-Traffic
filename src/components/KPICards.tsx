import React from 'react';
import {
  Activity,
  ShieldAlert,
  AlertOctagon,
  Percent,
  Zap,
  Clock
} from 'lucide-react';
import { useSOC } from '../context/SOCContext';

export const KPICards: React.FC = () => {
  const {
    totalFlows,
    threatsDetected,
    criticalAlerts,
    averageConfidence,
    currentThroughput,
    detectionLatency,
  } = useSOC();

  const cards = [
    {
      title: 'Total Flows',
      value: totalFlows.toLocaleString(),
      subtext: 'Cumulative unidirectional packets',
      icon: Activity,
      color: 'cyan',
      glow: 'glow-cyan',
      accentBorder: 'border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      tag: '+1,250/s',
      tagColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
    },
    {
      title: 'Threats Detected',
      value: threatsDetected.toLocaleString(),
      subtext: 'Flagged by AI/ML ensemble',
      icon: ShieldAlert,
      color: 'amber',
      glow: 'glow-amber',
      accentBorder: 'border-amber-500/30',
      iconBg: 'bg-amber-500/10 text-amber-400',
      tag: 'Passive Ingest',
      tagColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
    },
    {
      title: 'Critical Alerts',
      value: criticalAlerts.toString(),
      subtext: 'High-urgency attack signatures',
      icon: AlertOctagon,
      color: 'red',
      glow: 'glow-red',
      accentBorder: 'border-red-500/30',
      iconBg: 'bg-red-500/10 text-red-400',
      tag: 'Immediate Attention',
      tagColor: 'text-red-400 bg-red-950/60 border-red-800/60',
    },
    {
      title: 'Average Confidence',
      value: `${averageConfidence}%`,
      subtext: 'Model inference certainty',
      icon: Percent,
      color: 'emerald',
      glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.18)]',
      accentBorder: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      tag: 'Ensemble Score',
      tagColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    },
    {
      title: 'Current Throughput',
      value: `${currentThroughput.toLocaleString()}`,
      unit: ' flows/s',
      subtext: 'Optical diode ingress rate',
      icon: Zap,
      color: 'purple',
      glow: 'glow-purple',
      accentBorder: 'border-purple-500/30',
      iconBg: 'bg-purple-500/10 text-purple-400',
      tag: 'Line Rate',
      tagColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
    },
    {
      title: 'Detection Latency',
      value: `${detectionLatency}`,
      unit: ' ms',
      subtext: 'Extraction + inference time',
      icon: Clock,
      color: 'blue',
      glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.18)]',
      accentBorder: 'border-blue-500/30',
      iconBg: 'bg-blue-500/10 text-blue-400',
      tag: 'Real-Time SLA',
      tagColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative bg-[#0E1526]/80 hover:bg-[#131C31] backdrop-blur-md rounded-xl p-4 border ${card.accentBorder} ${card.glow} transition-all duration-300 group`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.iconBg} transition-transform group-hover:scale-110 duration-200`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold font-mono text-white tracking-tight">
                {card.value}
              </span>
              {card.unit && (
                <span className="text-xs font-mono font-medium text-slate-400">
                  {card.unit}
                </span>
              )}
            </div>

            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                {card.subtext}
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${card.tagColor}`}>
                {card.tag}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
