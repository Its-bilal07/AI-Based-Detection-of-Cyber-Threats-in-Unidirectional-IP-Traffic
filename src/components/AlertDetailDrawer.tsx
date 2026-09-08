import React, { useEffect } from 'react';
import {
  X,
  ShieldAlert,
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
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'low':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
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
      <div className="w-full max-w-xl bg-[#0B1120] border-l border-slate-800 h-full overflow-y-auto shadow-2xl p-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${getSeverityBadge(
                      selectedAlert.severity
                    )}`}
                  >
                    {selectedAlert.severity}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">
                    {selectedAlert.flow_id}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {selectedAlert.threat_class.replace(/_/g, ' ')}
                </h2>
              </div>
            </div>

            <button
              onClick={() => setSelectedAlert(null)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 font-mono">
            <div className="bg-[#0E1526] p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block">
                Confidence
              </span>
              <span className="text-lg font-bold text-cyan-400">
                {Math.round(selectedAlert.confidence * 100)}%
              </span>
            </div>
            <div className="bg-[#0E1526] p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block">
                Latency
              </span>
              <span className="text-lg font-bold text-white">
                {selectedAlert.detection_latency_ms} ms
              </span>
            </div>
            <div className="bg-[#0E1526] p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] uppercase text-slate-400 block">
                Protocol
              </span>
              <span className="text-lg font-bold text-purple-400">
                {selectedAlert.protocol}
              </span>
            </div>
          </div>

          {/* Flow 5-Tuple Network Identity */}
          <div className="bg-[#0E1526] p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
              <Fingerprint className="w-4 h-4 text-cyan-400" />
              <span>Flow Identification (5-Tuple)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-400 block text-[11px]">Source Endpoint:</span>
                <span className="text-slate-100 font-semibold">
                  {selectedAlert.src_ip}:{selectedAlert.src_port}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Destination Endpoint:</span>
                <span className="text-slate-100 font-semibold">
                  {selectedAlert.dst_ip}:{selectedAlert.dst_port}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">ISO 8601 Timestamp:</span>
                <span className="text-slate-200">{selectedAlert.timestamp}</span>
              </div>
            </div>
          </div>

          {/* AI Detection Reason & Model Decision */}
          <div className="bg-[#0E1526] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300 font-semibold uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Model Decision & Reason</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {selectedAlert.detection_reason}
            </p>
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400 font-semibold">Model Pipeline: </span>
              {selectedAlert.model_decision}
            </div>
          </div>

          {/* “Why was this threat detected?” Section */}
          <div className="bg-[#0E1526] p-4 rounded-xl border border-cyan-500/30 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-300">
                  Why was this threat detected?
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Anomaly Strength
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Model feature attribution and divergence from empirical baseline:
            </p>

            {/* Horizontal Anomaly Bars */}
            <div className="space-y-2.5 pt-1">
              {selectedAlert.evidence.feature_breakdown.map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-medium">{feat.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">
                        ({feat.value})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          feat.strength === 'VERY HIGH'
                            ? 'text-red-400 bg-red-950/60'
                            : feat.strength === 'HIGH'
                            ? 'text-orange-400 bg-orange-950/60'
                            : feat.strength === 'MEDIUM'
                            ? 'text-amber-400 bg-amber-950/60'
                            : 'text-blue-400 bg-blue-950/60'
                        }`}
                      >
                        {feat.strength}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        feat.strength === 'VERY HIGH'
                          ? 'bg-red-500'
                          : feat.strength === 'HIGH'
                          ? 'bg-orange-500'
                          : feat.strength === 'MEDIUM'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.round(feat.score * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Baseline: {feat.baseline}</span>
                    <span>Divergence: {(feat.score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Encrypted Traffic Notice if Applicable */}
          {selectedAlert.evidence.encrypted_metadata_only && (
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/50 text-cyan-300 text-xs flex items-center gap-2">
              <Info className="w-5 h-5 shrink-0 text-cyan-400" />
              <span>
                <strong>Encrypted Session Notice:</strong> Encrypted traffic analysed using metadata only. No payload decryption.
              </span>
            </div>
          )}

          {/* Raw Standard Alert Schema JSON */}
          <div className="bg-[#090D18] p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                Standard Alert JSON Payload
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="text-[10px] font-mono text-slate-300 bg-black/40 p-2.5 rounded overflow-x-auto max-h-40 scrollbar-thin">
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
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Passive Telemetry (No Return Path)
          </span>
          <button
            onClick={() => setSelectedAlert(null)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
