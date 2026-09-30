import React from 'react';
import {
  Flame,
  Network,
  Globe,
  Lock,
  Radar,
  UploadCloud,
  SlidersHorizontal,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useSOC } from '../context/SOCContext';
import { ThreatClass } from '../types/alert';

export const ThreatOverview: React.FC = () => {
  const { threatCounts, filterThreatClass, setFilterThreatClass, currentScenario } = useSOC();

  const isDDoSActive = currentScenario === 'DDoS Attack' || currentScenario === 'Mixed Attack';

  const threatConfigs = [
    {
      id: 'DDoS_SYN_flood' as ThreatClass,
      title: 'Volumetric / Protocol DDoS',
      icon: Flame,
      severity: 'Critical',
      isValidated: true,
      statusBadge: isDDoSActive ? 'Attack Detected' : 'Monitoring Baseline',
      isHot: isDDoSActive,
      confidence: '97%',
      alertCount: threatCounts['DDoS_SYN_flood'] || 0,
      evidence: [
        { label: 'SYN packet rate', value: isDDoSActive ? '18,420/s' : 'Baseline (120/s)' },
        { label: 'Src IP entropy', value: isDDoSActive ? '1.8 (Abnormal)' : '4.6 (Normal)' },
        { label: 'Dst port focus', value: '443 (HTTPS)' },
        { label: 'Model confidence', value: '97% (RF Ensemble)' },
      ],
    },
    {
      id: 'C2_beacon' as ThreatClass,
      title: 'Botnet C2 Beaconing',
      icon: Network,
      severity: 'Medium',
      isValidated: false,
      statusBadge: 'Roadmap Detector',
      isHot: false,
      plannedMethod: 'Periodic interval analysis and low-jitter variance evaluation across unidirectional flows.',
    },
    {
      id: 'DGA_domain' as ThreatClass,
      title: 'DGA / DNS Tunnelling',
      icon: Globe,
      severity: 'High',
      isValidated: false,
      statusBadge: 'Roadmap Detector',
      isHot: false,
      plannedMethod: 'Character n-gram distribution, high-entropy query inspection, and anomalous TXT record analysis.',
    },
    {
      id: 'TLS_malware' as ThreatClass,
      title: 'Encrypted Session Malware',
      icon: Lock,
      severity: 'High',
      isValidated: false,
      statusBadge: 'Roadmap Detector',
      isHot: false,
      plannedMethod: 'Passive TLS metadata profiling and JA4 fingerprint anomalies without payload decryption.',
    },
    {
      id: 'port_scan' as ThreatClass,
      title: 'Reconnaissance / Port Scanning',
      icon: Radar,
      severity: 'High',
      isValidated: false,
      statusBadge: 'Roadmap Detector',
      isHot: false,
      plannedMethod: 'Horizontal and vertical destination port fan-out rate and SYN/FIN sweep detection.',
    },
    {
      id: 'data_exfil' as ThreatClass,
      title: 'Data Exfiltration',
      icon: UploadCloud,
      severity: 'High',
      isValidated: false,
      statusBadge: 'Roadmap Detector',
      isHot: false,
      plannedMethod: 'Directional volumetric flow asymmetry and cumulative egress-to-ingress ratio tracking.',
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Threat Classification Vectors (Unidirectional Traffic Models)
          </h2>
        </div>
        {filterThreatClass !== 'ALL' && (
          <button
            onClick={() => setFilterThreatClass('ALL')}
            className="text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800 transition-colors font-medium"
          >
            Clear Filter ({filterThreatClass})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {threatConfigs.map((threat) => {
          const Icon = threat.icon;
          const isSelected = filterThreatClass === threat.id;

          return (
            <div
              key={threat.id}
              onClick={() => setFilterThreatClass(isSelected ? 'ALL' : threat.id)}
              className={`relative rounded-lg p-4 border transition-all cursor-pointer flex flex-col justify-between shadow-xs ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : threat.isHot
                  ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/30 dark:bg-rose-950/20 hover:border-rose-400 dark:hover:border-rose-700'
                  : 'border-slate-200 dark:border-soc-border bg-white dark:bg-soc-card hover:border-slate-300 dark:hover:border-soc-borderHover'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-1.5 rounded-md ${
                        threat.isHot
                          ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400'
                          : threat.isValidated
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                        {threat.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className={threat.isHot ? 'text-rose-700 dark:text-rose-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
                          {threat.severity} Severity
                        </span>
                        <span>•</span>
                        {threat.isValidated ? (
                          <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">{threat.alertCount} alerts</span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 italic">Planned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Implementation Status Badge */}
                  {threat.isValidated ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      VALIDATED IN PROTOTYPE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-slate-400" />
                      PLANNED DETECTOR
                    </span>
                  )}
                </div>

                {/* Evidence or Specification Section */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-soc-border">
                  {threat.isValidated ? (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-1.5 font-medium">
                        <span>Feature Attribution</span>
                        <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] font-semibold">
                          Confidence: {threat.confidence}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        {threat.evidence?.map((ev, idx) => (
                          <div key={idx} className="flex justify-between items-baseline py-0.5 border-b border-slate-100 dark:border-soc-border/60">
                            <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">{ev.label}</span>
                            <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] font-medium">{ev.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                        Architecture Specification
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                        {threat.plannedMethod}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-soc-border flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium">{isSelected ? 'Active Filter' : 'Filter Telemetry'}</span>
                <span className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-semibold">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
