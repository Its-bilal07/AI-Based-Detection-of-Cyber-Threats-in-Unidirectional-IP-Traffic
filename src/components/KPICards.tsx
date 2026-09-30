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

  const formatInteger = (val: number): string => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    return Math.round(val).toLocaleString();
  };

  const cards = [
    {
      title: 'Total Flows',
      value: formatInteger(totalFlows),
      valueColor: 'text-slate-900 dark:text-white',
      subtext: 'Cumulative unidirectional packets',
      tag: 'Read-Only Tap',
      tagColor: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
    {
      title: 'Threats Detected',
      value: formatInteger(threatsDetected),
      valueColor: 'text-amber-600 dark:text-amber-400',
      subtext: 'Flagged anomalous flow events',
      tag: 'Passive Ingest',
      tagColor: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    },
    {
      title: 'Critical Alerts',
      value: formatInteger(criticalAlerts),
      valueColor: 'text-rose-600 dark:text-rose-400',
      subtext: 'High-urgency attack signatures',
      tag: 'Critical Severity',
      tagColor: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    },
    {
      title: 'Average Confidence',
      value: `${typeof averageConfidence === 'number' ? averageConfidence.toFixed(1) : averageConfidence}%`,
      valueColor: 'text-emerald-600 dark:text-emerald-400',
      subtext: 'Model inference certainty',
      tag: 'Ensemble Score',
      tagColor: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    },
    {
      title: 'Current Throughput',
      value: formatInteger(currentThroughput),
      unit: ' flows/s',
      valueColor: 'text-slate-900 dark:text-white',
      subtext: 'Ingress traffic rate',
      tag: 'Flow Rate',
      tagColor: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
    {
      title: 'Detection Latency',
      value: `${typeof detectionLatency === 'number' ? Math.round(detectionLatency) : detectionLatency}`,
      unit: ' ms',
      valueColor: 'text-slate-900 dark:text-white',
      subtext: 'Extraction + inference time',
      tag: 'Inference Latency',
      tagColor: 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    },
  ];

  return (
    <div className="bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border rounded-lg p-4 shadow-xs transition-colors duration-200">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-soc-border gap-y-3 sm:gap-y-0">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={`${idx !== 0 ? 'sm:pl-4 xl:pl-5' : ''} ${
              idx !== cards.length - 1 ? 'sm:pr-4 xl:pr-5' : ''
            } pt-2.5 sm:pt-0 flex flex-col justify-between min-w-0 overflow-hidden`}
          >
            <div className="min-w-0">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 gap-1.5 min-w-0">
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
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
                    {card.unit}
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate" title={card.subtext}>
              {card.subtext}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
