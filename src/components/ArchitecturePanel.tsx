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
    <div className="bg-[#0D1117] border border-slate-800/80 rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            Unidirectional Pipeline Architecture & Passive Ingest Verification
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Strict read-only network monitoring pipeline: zero reverse channel capability
          </p>
        </div>

        {/* One-Way Lock Tag */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/70 border border-slate-700/60 text-slate-300 font-mono text-xs self-start md:self-auto">
          <Lock className="w-3.5 h-3.5 text-sky-400" />
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
                    ? 'bg-sky-950/20 border-sky-800/60 text-sky-200'
                    : 'bg-[#090D18] border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${step.isKey ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="text-xs font-medium leading-tight line-clamp-2">
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-mono line-clamp-2">
                  {step.desc}
                </span>
              </div>

              {/* Arrow separator (hidden on last step) */}
              {idx < pipelineSteps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Security & Architectural Guarantees */}
      <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
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
            <CheckCircle className="w-4 h-4 text-emerald-400/90 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-mono font-semibold text-slate-200 block">
                {item.label}
              </span>
              <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
