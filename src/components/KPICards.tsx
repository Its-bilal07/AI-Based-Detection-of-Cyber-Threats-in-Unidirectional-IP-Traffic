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

  // Formatter helpers
  const formatConfidence = (val: number): string => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toFixed(2);
  };

  const formatLatency = (val: number): string => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    return Number(val).toFixed(2);
  };

  const formatInteger = (val: number): string => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    return Math.round(val).toLocaleString();
  };

  const cards = [
    {
      title: 'Total Flows',
      value: formatInteger(totalFlows),
      valueColor: 'text-slate-900',
      subtext: 'Cumulative unidirectional packets',
      tag: 'Read-Only Tap',
      tagColor: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    {
      title: 'Threats Detected',
      value: formatInteger(threatsDetected),
      valueColor: 'text-amber-600',
      subtext: 'Flagged anomalous flow events',
      tag: 'Passive Ingest',
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: 'Critical Alerts',
      value: formatInteger(criticalAlerts),
      valueColor: 'text-rose-600',
      subtext: 'High-urgency attack signatures',
      tag: 'Critical Severity',
      tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    {
      title: 'Average Confidence',
      value: `${typeof averageConfidence === 'number' ? averageConfidence.toFixed(1) : averageConfidence}%`,
      valueColor: 'text-emerald-400',
      subtext: 'Model inference certainty',
      tag: 'Ensemble Score',
    },
    {
      title: 'Current Throughput',
      value: formatInteger(currentThroughput),
      unit: ' flows/s',
      valueColor: 'text-slate-900',
      subtext: 'Ingress traffic rate',
      tag: 'Flow Rate',
      tagColor: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    {
      title: 'Detection Latency',
      value: `${typeof detectionLatency === 'number' ? Math.round(detectionLatency) : detectionLatency}`,
      unit: ' ms',
      valueColor: 'text-slate-900',
      subtext: 'Extraction + inference time',
      tag: 'Inference Latency',
      tagColor: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 gap-y-3 sm:gap-y-0">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`${idx !== 0 ? 'sm:pl-4 xl:pl-5' : ''} ${
              idx !== cards.length - 1 ? 'sm:pr-4 xl:pr-5' : ''
            } pt-2.5 sm:pt-0 flex flex-col justify-between min-w-0 overflow-hidden`}
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1 gap-1.5 min-w-0">
                <span className="truncate" title={card.title}>{card.title}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border shrink-0 whitespace-nowrap ${card.tagColor}`}>
                  {card.tag}
                </span>
              </div>

              <div className="flex items-baseline space-x-1 mt-1 min-w-0 overflow-hidden">
                <span className={`text-2xl font-bold font-mono tracking-tight whitespace-nowrap truncate ${card.valueColor}`} title={card.value}>
                  {card.value}
                </span>
                {card.unit && (
                  <span className="text-xs font-mono text-slate-500 shrink-0 whitespace-nowrap">
                    {card.unit}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2 truncate" title={card.subtext}>
              {card.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
