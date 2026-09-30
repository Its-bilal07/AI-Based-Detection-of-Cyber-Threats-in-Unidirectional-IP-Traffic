import React, { useState } from 'react';
import { X, Copy, Check, Shield } from 'lucide-react';
import { useSOC } from '../context/SOCContext';

export const AlertSchemaModal: React.FC = () => {
  const { isSchemaModalOpen, setIsSchemaModalOpen } = useSOC();
  const [copied, setCopied] = useState<boolean>(false);

  if (!isSchemaModalOpen) return null;

  const schemaDefinition = {
    schema_version: '1.0.0',
    specification: 'Unidirectional IP Traffic Threat Alert Contract',
    required_fields: [
      { field: 'timestamp', type: 'string (ISO 8601 UTC)', desc: 'Event observation timestamp' },
      { field: 'flow_id', type: 'string', desc: '5-tuple + start_time unique hash (e.g. F-92831)' },
      { field: 'threat_class', type: 'enum', desc: 'DDoS_SYN_flood, C2_beacon, DGA_domain, TLS_malware, port_scan, data_exfil' },
      { field: 'severity', type: 'enum', desc: 'low, medium, high, critical' },
      { field: 'confidence', type: 'float (0.0 - 1.0)', desc: 'Ensemble model inference confidence score' },
      { field: 'supporting_evidence', type: 'object (JSON)', desc: 'Key-value features, SHAP values, and empirical metrics' },
      { field: 'src_ip', type: 'string (IPv4/IPv6)', desc: 'Origin host observed on unidirectional tap' },
      { field: 'dst_ip', type: 'string (IPv4/IPv6)', desc: 'Target destination host or subnet' },
      { field: 'dst_port', type: 'integer (0 - 65535)', desc: 'Destination service port' },
      { field: 'protocol', type: 'string', desc: 'Transport layer protocol (TCP, UDP, TLS/QUIC, etc.)' },
    ],
  };

  const sampleJson = {
    timestamp: '2026-09-08T22:56:31.842Z',
    flow_id: 'F-92831',
    threat_class: 'DDoS_SYN_flood',
    severity: 'critical',
    confidence: 0.97,
    supporting_evidence: {
      'SYN packets/sec': '18,420/s',
      'Source IP entropy': 1.8,
      'Flow rate': 'VERY HIGH',
      'Destination concentration': 'HIGH',
      'Destination port': 443
    },
    src_ip: '10.2.4.18',
    dst_ip: '172.16.5.22',
    dst_port: 443,
    protocol: 'TCP'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-soc-panel border border-slate-200 dark:border-soc-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 flex flex-col justify-between shadow-2xl transition-colors duration-200">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-soc-border">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Standardized Alert Schema Contract
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Universal JSON data contract for unidirectional threat classification telemetry
              </p>
            </div>
            <button
              onClick={() => setIsSchemaModalOpen(false)}
              className="p-1.5 rounded-md bg-slate-100 dark:bg-soc-card hover:bg-slate-200 dark:hover:bg-soc-cardHover border border-slate-200 dark:border-soc-border text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick schema summary */}
          <div className="p-3 bg-slate-50 dark:bg-soc-surface rounded-lg border border-slate-200 dark:border-soc-border font-mono text-xs text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] block mb-1.5">
              Required Schema Keys:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border text-slate-800 dark:text-slate-200 font-medium shadow-xs">timestamp</span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border text-slate-800 dark:text-slate-200 font-medium shadow-xs">flow_id</span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border text-slate-800 dark:text-slate-200 font-medium shadow-xs">threat_class</span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border text-slate-800 dark:text-slate-200 font-medium shadow-xs">severity</span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border text-slate-800 dark:text-slate-200 font-medium shadow-xs">confidence</span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border text-slate-800 dark:text-slate-200 font-medium shadow-xs">supporting_evidence</span>
            </div>
          </div>

          {/* Schema Table */}
          <div className="border border-slate-200 dark:border-soc-border rounded-lg overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-50 dark:bg-soc-surface text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-soc-border text-[11px] uppercase font-semibold">
                <tr>
                  <th className="p-2.5">Field</th>
                  <th className="p-2.5">Data Type</th>
                  <th className="p-2.5 font-sans">Specification & Semantics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-soc-border text-slate-700 dark:text-slate-300 bg-white dark:bg-soc-card">
                {schemaDefinition.required_fields.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-soc-cardHover transition-colors">
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{f.field}</td>
                    <td className="p-2.5 text-blue-700 dark:text-blue-400 font-medium">{f.type}</td>
                    <td className="p-2.5 text-slate-600 dark:text-slate-400 text-[11px] font-sans">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sample JSON payload */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Example Ingestion Payload:</span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-soc-card hover:bg-slate-200 dark:hover:bg-soc-cardHover px-2.5 py-1 rounded-md border border-slate-300 dark:border-soc-border transition-colors shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
                <span className="font-sans text-xs">{copied ? 'Copied' : 'Copy Example'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-200 bg-slate-900 dark:bg-soc-bg p-3 rounded-lg border border-slate-800 dark:border-soc-border overflow-x-auto max-h-48 scrollbar-thin">
              {JSON.stringify(sampleJson, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-soc-border mt-4 flex justify-between items-center">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Strict Unidirectional Ingestion Contract (SIEM & Dashboard Ready)</span>
          </div>
          <button
            onClick={() => setIsSchemaModalOpen(false)}
            className="px-4 py-1.5 rounded-md bg-slate-100 dark:bg-soc-card hover:bg-slate-200 dark:hover:bg-soc-cardHover border border-slate-200 dark:border-soc-border text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
