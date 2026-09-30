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
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Threat Classification Vectors (Unidirectional Traffic Models)
          </h2>
        </div>
        {filterThreatClass !== 'ALL' && (
          <button
            onClick={() => setFilterThreatClass('ALL')}
            className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition-colors font-medium"
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
                  ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500'
                  : threat.isHot
                  ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-1.5 rounded-md ${
                        threat.isHot
                          ? 'bg-rose-100 text-rose-700'
                          : threat.isValidated
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                        {threat.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span className={threat.isHot ? 'text-rose-700 font-semibold' : 'text-slate-600'}>
                          {threat.severity} Severity
                        </span>
                        <span>•</span>
                        {threat.isValidated ? (
                          <span className="font-mono text-slate-800 font-medium">{threat.alertCount} alerts</span>
                        ) : (
                          <span className="text-slate-500 italic">Planned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Implementation Status Badge */}
                  {threat.isValidated ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      VALIDATED IN PROTOTYPE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                      <Clock className="w-3 h-3 text-slate-400" />
                      PLANNED DETECTOR
                    </span>
                  )}
                </div>

                {/* Evidence or Specification Section */}
                <div className="mt-3 pt-2.5 border-t border-slate-100">
                  {threat.isValidated ? (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
                        <span>Feature Attribution</span>
                        <span className="font-mono text-slate-800 text-[11px] font-semibold">
                          Confidence: {threat.confidence}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        {threat.evidence?.map((ev, idx) => (
                          <div key={idx} className="flex justify-between items-baseline py-0.5 border-b border-slate-100">
                            <span className="text-slate-500 truncate text-[11px]">{ev.label}</span>
                            <span className="font-mono text-slate-800 text-[11px] font-medium">{ev.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                        Architecture Specification
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                        {threat.plannedMethod}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">{isSelected ? 'Active Filter' : 'Filter Telemetry'}</span>
                <span className="text-slate-400 group-hover:text-blue-600 font-semibold">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

