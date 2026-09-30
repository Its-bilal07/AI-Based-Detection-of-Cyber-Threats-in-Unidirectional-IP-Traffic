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
        return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60';
      case 'high':
        return 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800/60';
      case 'medium':
        return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60';
      case 'low':
      default:
        return 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div
        className="flex-1 cursor-pointer"
        onClick={() => setSelectedAlert(null)}
      />

      {/* Slide-over Panel */}
      <div className="w-full max-w-xl bg-white dark:bg-soc-panel border-l border-slate-200 dark:border-soc-border h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl transition-colors duration-200">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-soc-border">
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`text-[10px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded border ${getSeverityBadge(
                    selectedAlert.severity
                  )}`}
                >
                  {selectedAlert.severity}
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">
                  {selectedAlert.flow_id}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                {selectedAlert.threat_class.replace(/_/g, ' ')}
              </h2>
            </div>

            <button
              onClick={() => setSelectedAlert(null)}
              className="p-1.5 rounded-md bg-slate-100 dark:bg-soc-card hover:bg-slate-200 dark:hover:bg-soc-cardHover border border-slate-200 dark:border-soc-border text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            <div className="bg-slate-50 dark:bg-soc-surface p-3 rounded-lg border border-slate-200 dark:border-soc-border">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                Confidence
              </span>
              <span className="text-base font-bold text-blue-700 dark:text-blue-400">
                {Math.round(selectedAlert.confidence * 100)}%
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-soc-surface p-3 rounded-lg border border-slate-200 dark:border-soc-border">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                Latency
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                {selectedAlert.detection_latency_ms} ms
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-soc-surface p-3 rounded-lg border border-slate-200 dark:border-soc-border">
              <span className="text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold block">
                Protocol
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                {selectedAlert.protocol}
              </span>
            </div>
          </div>

          {/* Flow 5-Tuple Network Identity */}
          <div className="bg-slate-50 dark:bg-soc-surface p-4 rounded-lg border border-slate-200 dark:border-soc-border space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
              <Fingerprint className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Flow Identification (5-Tuple)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Source Endpoint:</span>
                <span className="text-slate-900 dark:text-white font-semibold">
                  {selectedAlert.src_ip}:{selectedAlert.src_port}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Destination Endpoint:</span>
                <span className="text-slate-900 dark:text-white font-semibold">
                  {selectedAlert.dst_ip}:{selectedAlert.dst_port}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">ISO 8601 Timestamp:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedAlert.timestamp}</span>
              </div>
            </div>
          </div>

          {/* AI Detection Reason & Model Decision */}
          <div className="bg-slate-50 dark:bg-soc-surface p-4 rounded-lg border border-slate-200 dark:border-soc-border space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Model Decision & Reason</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {selectedAlert.detection_reason}
            </p>
            <div className="p-2.5 rounded-md bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border text-[11px] font-mono text-slate-600 dark:text-slate-300">
              <span className="text-slate-800 dark:text-white font-semibold">Model Pipeline: </span>
              {selectedAlert.model_decision}
            </div>
          </div>

          {/* Feature Attribution Section */}
          <div className="bg-slate-50 dark:bg-soc-surface p-4 rounded-lg border border-slate-200 dark:border-soc-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Feature Attribution & Anomaly Strength
                </h3>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              Model feature attribution and divergence from empirical baseline:
            </p>

            {/* Horizontal Anomaly Bars */}
            <div className="space-y-2.5 pt-1">
              {(selectedAlert.evidence?.feature_breakdown || []).map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-800 dark:text-slate-200 font-sans font-medium text-xs">{feat.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        ({feat.value})
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${
                          feat.strength === 'VERY HIGH'
                            ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/60'
                            : feat.strength === 'HIGH'
                            ? 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800/60'
                            : feat.strength === 'MEDIUM'
                            ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/60'
                            : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {feat.strength}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full ${
                        feat.strength === 'VERY HIGH'
                          ? 'bg-rose-500'
                          : feat.strength === 'HIGH'
                          ? 'bg-orange-500'
                          : feat.strength === 'MEDIUM'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.round(feat.score * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    <span>Baseline: {feat.baseline}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Divergence: {(feat.score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Encrypted Traffic Notice if Applicable */}
          {selectedAlert.evidence?.encrypted_metadata_only && (
            <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <strong className="text-blue-950 dark:text-white font-semibold">Encrypted Session Notice:</strong> Encrypted traffic analyzed using passive metadata only. No payload decryption.
              </span>
            </div>
          )}

          {/* Raw Standard Alert Schema JSON */}
          <div className="bg-slate-50 dark:bg-soc-surface p-3 rounded-lg border border-slate-200 dark:border-soc-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold uppercase">
                Standard Alert JSON Payload
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1 text-xs font-mono text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-soc-card hover:bg-slate-100 dark:hover:bg-soc-cardHover px-2 py-1 rounded-md border border-slate-300 dark:border-soc-border transition-colors shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-200 bg-slate-900 dark:bg-soc-bg p-3 rounded-md border border-slate-800 dark:border-soc-border overflow-x-auto max-h-40 scrollbar-thin">
              {JSON.stringify(
                {
                  timestamp: selectedAlert.timestamp,
                  flow_id: selectedAlert.flow_id,
                  threat_class: selectedAlert.threat_class,
                  confidence: selectedAlert.confidence,
                  severity: selectedAlert.severity,
                  evidence: selectedAlert.evidence?.top_features,
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
        <div className="pt-4 border-t border-slate-100 dark:border-soc-border mt-5 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Passive Ingest (Zero Reverse Path)
          </span>
          <button
            onClick={() => setSelectedAlert(null)}
            className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-soc-card border border-slate-200 dark:border-soc-border hover:bg-slate-200 dark:hover:bg-soc-cardHover text-slate-800 dark:text-slate-200 transition-colors font-sans text-xs font-medium"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
