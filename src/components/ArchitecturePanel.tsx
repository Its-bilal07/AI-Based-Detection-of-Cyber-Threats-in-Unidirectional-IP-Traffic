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
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Unidirectional Pipeline Architecture & Passive Ingest Verification
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Strict read-only network monitoring pipeline: zero reverse channel capability
          </p>
        </div>

        {/* One-Way Lock Tag */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 font-mono text-xs font-semibold self-start md:self-auto">
          <Lock className="w-3.5 h-3.5 text-blue-600" />
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
                    ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${step.isKey ? 'text-blue-600' : 'text-slate-500'}`} />
                <span className="text-xs font-semibold text-slate-900 leading-tight line-clamp-2">
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-mono line-clamp-2">
                  {step.desc}
                </span>
              </div>

              {/* Arrow separator (hidden on last step) */}
              {idx < pipelineSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security & Architectural Guarantees */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'No return path', desc: 'Physical data diode / one-way optical tap topology' },
          { label: 'No active probing', desc: 'Zero ICMP/TCP pinging or port probing injected' },
          { label: 'No payload decryption', desc: 'Encrypted flows inspected via passive metadata only' },
          { label: 'No inline blocking', desc: 'Strict observation, classification and intelligence reporting' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-mono font-bold text-slate-800 block">
                {item.label}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
