import React from 'react';
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  Terminal,
  Activity,
  CheckCircle,
  FileCode
} from 'lucide-react';

export const ArchitecturePanel: React.FC = () => {
  const pipelineSteps = [
    { label: 'Simulated IP Traffic', icon: Activity, desc: 'Replayed unidirectional packet stream' },
    { label: 'Read-Only Ingest', icon: Lock, desc: 'Passive optical tap / Data diode isolation', isKey: true },
    { label: 'Flow / Metadata Extraction', icon: Terminal, desc: '5-tuple, inter-arrival & header stats' },
    { label: 'Feature Engineering', icon: Database, desc: 'Statistical entropy, rates & metadata' },
    { label: 'AI/ML Detection Engine', icon: Cpu, desc: 'Prototype RF model + Planned roadmap' },
    { label: 'Threat Classification', icon: ShieldCheck, desc: 'Validated DDoS + Planned vectors' },
    { label: 'Alert Schema', icon: FileCode, desc: 'Standardized JSON data contract' },
    { label: 'Dashboard', icon: Activity, desc: 'Real-time SOC intelligence view' },
  ];

  return (
    <div className="bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border rounded-lg p-4 shadow-xs transition-colors duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-soc-border">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Unidirectional Pipeline Architecture & Passive Ingest Verification
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Strict read-only network monitoring pipeline: zero reverse channel capability
          </p>
        </div>

        {/* One-Way Lock Tag */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold self-start md:self-auto">
          <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>ONE-WAY / READ-ONLY INGEST</span>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 relative">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex flex-col items-center text-center relative group">
              <div
                className={`w-full p-2.5 rounded-lg border flex flex-col items-center justify-center transition-colors min-h-[110px] ${
                  step.isKey
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 shadow-2xs'
                    : 'bg-slate-50 dark:bg-soc-surface border-slate-200 dark:border-soc-border text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-soc-borderHover'
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${step.isKey ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight line-clamp-2">
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono line-clamp-2">
                  {step.desc}
                </span>
              </div>

              {/* Arrow separator (hidden on last step) */}
              {idx < pipelineSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-600">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security & Architectural Guarantees */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-soc-border grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'No return path', desc: 'Physical data diode / one-way optical tap topology' },
          { label: 'No active probing', desc: 'Zero ICMP/TCP pinging or port probing injected' },
          { label: 'No payload decryption', desc: 'Encrypted flows inspected via passive metadata only' },
          { label: 'No inline blocking', desc: 'Strict observation, classification and intelligence reporting' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-soc-surface border border-slate-200 dark:border-soc-border"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 block">
                {item.label}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
