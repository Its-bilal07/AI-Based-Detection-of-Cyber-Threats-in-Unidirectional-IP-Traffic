import React, { useState } from 'react';
import { X, FileCode2, Copy, Check, Shield } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B1120] border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono">
                  Standardized Alert Schema
                </h3>
                <p className="text-xs text-slate-400">
                  Universal JSON contract for unidirectional threat classification
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSchemaModalOpen(false)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick schema summary pill */}
          <div className="p-3 bg-[#090D18] rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
            <span className="text-cyan-400 font-semibold block mb-1">
              Core Field Requirements:
            </span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">timestamp</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">flow_id</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">threat_class</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">severity</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">confidence</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">supporting_evidence</span>
            </div>
          </div>

          {/* Schema Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#0E1526] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Field</th>
                  <th className="p-2.5">Data Type</th>
                  <th className="p-2.5">Specification & Semantics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 bg-[#090D18]">
                {schemaDefinition.required_fields.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/60">
                    <td className="p-2.5 font-bold text-cyan-400">{f.field}</td>
                    <td className="p-2.5 text-purple-300">{f.type}</td>
                    <td className="p-2.5 text-slate-400 text-[11px]">{f.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sample JSON payload */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 font-semibold">Example Output Payload:</span>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Example'}</span>
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-300 bg-[#070B14] p-3 rounded-xl border border-slate-800 overflow-x-auto max-h-48 scrollbar-thin">
              {JSON.stringify(sampleJson, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-4 flex justify-between items-center">
          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strict Unidirectional Ingestion Contract (SIEM & Dashboard Ready)</span>
          </div>
          <button
            onClick={() => setIsSchemaModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs font-mono transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
