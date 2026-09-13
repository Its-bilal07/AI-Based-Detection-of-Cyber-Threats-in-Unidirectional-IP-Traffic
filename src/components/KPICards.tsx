import React from 'react';
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
      valueColor: 'text-white',
      subtext: 'Cumulative unidirectional packets',
      tag: '+1,250/s',
    },
    {
      title: 'Threats Detected',
      value: threatsDetected.toLocaleString(),
      valueColor: 'text-amber-400',
      subtext: 'Flagged by AI/ML ensemble',
      tag: 'Passive Ingest',
    },
    {
      title: 'Critical Alerts',
      value: criticalAlerts.toString(),
      valueColor: 'text-red-400',
      subtext: 'High-urgency attack signatures',
      tag: 'Immediate Attention',
    },
    {
      title: 'Average Confidence',
      value: `${averageConfidence}%`,
      valueColor: 'text-emerald-400',
      subtext: 'Model inference certainty',
      tag: 'Ensemble Score',
    },
    {
      title: 'Current Throughput',
      value: `${currentThroughput.toLocaleString()}`,
      unit: ' flows/s',
      valueColor: 'text-slate-200',
      subtext: 'Optical diode ingress rate',
      tag: 'Line Rate',
    },
    {
      title: 'Detection Latency',
      value: `${detectionLatency}`,
      unit: ' ms',
      valueColor: 'text-slate-200',
      subtext: 'Extraction + inference time',
      tag: 'Real-Time SLA',
    },
  ];

  return (
    <div className="bg-[#0D1117] border border-slate-800/80 rounded-lg p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80 gap-y-3 sm:gap-y-0">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`${idx !== 0 ? 'sm:pl-4 xl:pl-5' : ''} ${
              idx !== cards.length - 1 ? 'sm:pr-4 xl:pr-5' : ''
            } pt-2.5 sm:pt-0 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
                <span>{card.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">{card.tag}</span>
              </div>

              <div className="flex items-baseline space-x-1">
                <span className={`text-2xl font-semibold font-mono tracking-tight ${card.valueColor}`}>
                  {card.value}
                </span>
                {card.unit && (
                  <span className="text-xs font-mono text-slate-400">
                    {card.unit}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 truncate">
              {card.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
