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
    { label: 'Read-Only Ingest', icon: Lock, desc: 'Optical tap / Data diode isolation', isKey: true },
    { label: 'Flow / Metadata Extraction', icon: Terminal, desc: '5-tuple, inter-arrival & header stats' },
    { label: 'Feature Engineering', icon: Database, desc: 'Entropy, FFT, JA4, n-grams' },
    { label: 'AI/ML Detection Engine', icon: Cpu, desc: 'RF, LSTM, Autoencoder ensemble' },
    { label: 'Threat Classification + Confidence', icon: ShieldCheck, desc: '6 threat classes with 0-1 scores' },
    { label: 'Alert Schema', icon: FileCode, desc: 'Standardized JSON data contract' },
    { label: 'Dashboard', icon: Activity, desc: 'Real-time SOC intelligence view' },
  ];

  return (
    <div className="bg-[#0E1526]/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Unidirectional Pipeline Architecture & Passive Ingest Verification
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict read-only network monitoring pipeline: zero reverse channel capability
          </p>
        </div>

        {/* Prominent One-Way Lock Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold shadow-inner">
          <Lock className="w-4 h-4 text-blue-400" />
          <span>🔒 ONE-WAY / READ-ONLY INGEST</span>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 relative">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="flex flex-col items-center text-center relative group">
              <div
                className={`w-full p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  step.isKey
                    ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 shadow-lg shadow-blue-900/20'
                    : 'bg-[#090D18] border-slate-800 hover:border-cyan-500/40 text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg mb-2 ${step.isKey ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-cyan-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-tight line-clamp-2">
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-mono line-clamp-2">
                  {step.desc}
                </span>
              </div>

              {/* Arrow separator (hidden on last step) */}
              {idx < pipelineSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security & Architectural Guarantees */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'No return path', desc: 'Physical data diode / one-way optical tap topology' },
          { label: 'No active probing', desc: 'Zero ICMP/TCP pinging or port probing injected' },
          { label: 'No payload decryption', desc: 'Encrypted flows inspected via passive metadata only' },
          { label: 'No inline blocking', desc: 'Strict observation, classification and intelligence reporting' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-[#090D18] border border-slate-800/80"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-mono font-bold text-slate-200 block">
                {item.label}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
