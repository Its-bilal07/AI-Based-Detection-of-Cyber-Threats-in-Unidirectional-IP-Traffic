import React, { useEffect } from 'react';
import {
  X,
  Cpu,
  Fingerprint,
  Info,
  CheckCircle2,
  AlertOctagon,
  Copy,
  Check
} from 'lucide-react';
import { useSOC } from '../context/SOCContext';

export const AlertDetailDrawer: React.FC = () => {
  const { selectedAlert, setSelectedAlert } = useSOC();
  const [copied, setCopied] = React.useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAlert(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedAlert]);

  if (!selectedAlert) return null;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/50';
      case 'high':
        return 'text-orange-400 bg-orange-950/40 border-orange-800/50';
      case 'medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/50';
      case 'low':
      default:
        return 'text-slate-400 bg-slate-800/60 border-slate-700/50';
    }
  };

  const handleCopyJson = () => {
    const jsonPayload = {
      timestamp: selectedAlert.timestamp,
      flow_id: selectedAlert.flow_id,
      threat_class: selectedAlert.threat_class,
      confidence: selectedAlert.confidence,
      severity: selectedAlert.severity,
      evidence: selectedAlert.evidence,
      src_ip: selectedAlert.src_ip,
      dst_ip: selectedAlert.dst_ip,
      dst_port: selectedAlert.dst_port,
      protocol: selectedAlert.protocol,
    };
    navigator.clipboard.writeText(JSON.stringify(jsonPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div
        className="flex-1 cursor-pointer"
        onClick={() => setSelectedAlert(null)}
      />

      {/* Slide-over Panel */}
      <div className="w-full max-w-xl bg-[#0D1117] border-l border-slate-800/80 h-full overflow-y-auto p-6 flex flex-col justify-between">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-mono uppercase font-medium px-1.5 py-0.5 rounded border ${getSeverityBadge(
                    selectedAlert.severity
                  )}`}
                >
                  {selectedAlert.severity}
                </span>
                <span className="text-xs font-mono text-slate-300 font-medium">
                  {selectedAlert.flow_id}
                </span>
              </div>
              <h2 className="text-base font-semibold text-white mt-1.5">
                {selectedAlert.threat_class.replace(/_/g, ' ')}
              </h2>
            </div>

            <button
              onClick={() => setSelectedAlert(null)}
              className="p-1.5 rounded-md bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            <div className="bg-[#090D18] p-3 rounded-lg border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-500 block">
                Confidence
              </span>
              <span className="text-base font-semibold text-slate-200">
                {Math.round(selectedAlert.confidence * 100)}%
              </span>
            </div>
            <div className="bg-[#090D18] p-3 rounded-lg border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-500 block">
                Latency
              </span>
              <span className="text-base font-semibold text-slate-200">
                {selectedAlert.detection_latency_ms} ms
              </span>
            </div>
            <div className="bg-[#090D18] p-3 rounded-lg border border-slate-800/80">
              <span className="text-[10px] uppercase text-slate-500 block">
                Protocol
              </span>
              <span className="text-base font-semibold text-slate-200">
                {selectedAlert.protocol}
              </span>
            </div>
          </div>

          {/* Flow 5-Tuple Network Identity */}
          <div className="bg-[#090D18] p-4 rounded-lg border border-slate-800/80 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
              <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
              <span>Flow Identification (5-Tuple)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-500 block text-[11px]">Source Endpoint:</span>
                <span className="text-slate-200 font-medium">
                  {selectedAlert.src_ip}:{selectedAlert.src_port}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Destination Endpoint:</span>
                <span className="text-slate-200 font-medium">
                  {selectedAlert.dst_ip}:{selectedAlert.dst_port}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-[11px]">ISO 8601 Timestamp:</span>
                <span className="text-slate-300">{selectedAlert.timestamp}</span>
              </div>
            </div>
          </div>

          {/* AI Detection Reason & Model Decision */}
          <div className="bg-[#090D18] p-4 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              <span>Model Decision & Reason</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedAlert.detection_reason}
            </p>
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="text-slate-300 font-medium">Model Pipeline: </span>
              {selectedAlert.model_decision}
            </div>
          </div>

          {/* “Why was this threat detected?” Section */}
          <div className="bg-[#090D18] p-4 rounded-lg border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Feature Attribution & Anomaly Strength
                </h3>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              Model feature attribution and divergence from empirical baseline:
            </p>

            {/* Horizontal Anomaly Bars */}
            <div className="space-y-2.5 pt-1">
              {(selectedAlert.evidence?.feature_breakdown || []).map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-sans text-xs">{feat.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500">
                        ({feat.value})
                      </span>
                      <span
                        className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                          feat.strength === 'VERY HIGH'
                            ? 'text-rose-400 bg-rose-950/40 border-rose-800/50'
                            : feat.strength === 'HIGH'
                            ? 'text-orange-400 bg-orange-950/40 border-orange-800/50'
                            : feat.strength === 'MEDIUM'
                            ? 'text-amber-400 bg-amber-950/40 border-amber-800/50'
                            : 'text-slate-400 bg-slate-800/50 border-slate-700/50'
                        }`}
                      >
                        {feat.strength}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full ${
                        feat.strength === 'VERY HIGH'
                          ? 'bg-rose-500'
                          : feat.strength === 'HIGH'
                          ? 'bg-orange-500'
                          : feat.strength === 'MEDIUM'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                      }`}
                      style={{ width: `${Math.round(feat.score * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Baseline: {feat.baseline}</span>
                    <span>Divergence: {(feat.score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Encrypted Traffic Notice if Applicable */}
          {selectedAlert.evidence.encrypted_metadata_only && (
            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-slate-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-sky-400" />
              <span>
                <strong className="text-slate-200">Encrypted Session Notice:</strong> Encrypted traffic analyzed using passive metadata only. No payload decryption.
              </span>
            </div>
          )}

          {/* Raw Standard Alert Schema JSON */}
          <div className="bg-[#090D18] p-3 rounded-lg border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                Standard Alert JSON Payload
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1 text-xs font-mono text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 px-2 py-1 rounded border border-slate-700/60 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-black/40 p-2.5 rounded border border-slate-800/60 overflow-x-auto max-h-40 scrollbar-thin">
              {JSON.stringify(
                {
                  timestamp: selectedAlert.timestamp,
                  flow_id: selectedAlert.flow_id,
                  threat_class: selectedAlert.threat_class,
                  confidence: selectedAlert.confidence,
                  severity: selectedAlert.severity,
                  evidence: selectedAlert.evidence.top_features,
                  src_ip: selectedAlert.src_ip,
                  dst_ip: selectedAlert.dst_ip,
                  dst_port: selectedAlert.dst_port,
                  protocol: selectedAlert.protocol,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>

        {/* Read-Only Safeguard Footer */}
        <div className="pt-4 border-t border-slate-800/80 mt-5 flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
            Passive Ingest (Zero Reverse Path)
          </span>
          <button
            onClick={() => setSelectedAlert(null)}
            className="px-3 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 text-slate-200 transition-colors font-sans text-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
