import React from 'react';
import {
  Flame,
  Network,
  Globe,
  Lock,
  Radar,
  UploadCloud,
  SlidersHorizontal
} from 'lucide-react';
import { useSOC } from '../context/SOCContext';
import { ThreatClass } from '../types/alert';

export const ThreatOverview: React.FC = () => {
  const { threatCounts, filterThreatClass, setFilterThreatClass, currentScenario } = useSOC();

  const threatConfigs = [
    {
      id: 'DDoS_SYN_flood' as ThreatClass,
      title: 'Volumetric / Protocol DDoS',
      icon: Flame,
      severity: 'Critical',
      status: currentScenario === 'DDoS Attack' || currentScenario === 'Mixed Attack' ? 'Attack Detected' : 'Monitoring',
      isHot: currentScenario === 'DDoS Attack' || currentScenario === 'Mixed Attack',
      confidence: '97%',
      evidence: [
        { label: 'SYN rate', value: '18,420/s' },
        { label: 'Src IP entropy', value: '1.8' },
        { label: 'Dst port', value: '443' },
        { label: 'Confidence', value: '97%' },
      ],
    },
    {
      id: 'C2_beacon' as ThreatClass,
      title: 'Botnet C2 Beaconing',
      icon: Network,
      severity: 'Medium',
      status: currentScenario === 'Botnet Beaconing' || currentScenario === 'Mixed Attack' ? 'Beacons Detected' : 'Monitoring',
      isHot: currentScenario === 'Botnet Beaconing' || currentScenario === 'Mixed Attack',
      confidence: '93%',
      evidence: [
        { label: 'Periodicity', value: '60s' },
        { label: 'Repeated dst', value: '185.XX.XX.XX' },
        { label: 'Variance', value: 'Low' },
        { label: 'Confidence', value: '93%' },
      ],
    },
    {
      id: 'DGA_domain' as ThreatClass,
      title: 'DGA / DNS Tunnelling',
      icon: Globe,
      severity: 'High',
      status: currentScenario === 'DGA / DNS Tunnelling' || currentScenario === 'Mixed Attack' ? 'Anomalous Queries' : 'Monitoring',
      isHot: currentScenario === 'DGA / DNS Tunnelling' || currentScenario === 'Mixed Attack',
      confidence: '96%',
      evidence: [
        { label: 'Query entropy', value: '4.92' },
        { label: 'Avg length', value: '47' },
        { label: 'N-gram score', value: 'High' },
        { label: 'Record type', value: 'TXT' },
      ],
    },
    {
      id: 'TLS_malware' as ThreatClass,
      title: 'Encrypted Session Malware',
      icon: Lock,
      severity: 'High',
      status: currentScenario === 'Encrypted Malware' || currentScenario === 'Mixed Attack' ? 'JA4 Anomaly' : 'Monitoring',
      isHot: currentScenario === 'Encrypted Malware' || currentScenario === 'Mixed Attack',
      confidence: '91%',
      encryptedNotice: 'Encrypted traffic analysed via metadata only. No payload decryption.',
      evidence: [
        { label: 'Fingerprint', value: 'Suspicious' },
        { label: 'JA4 anomaly', value: 'High' },
        { label: 'Seq anomaly', value: '0.87' },
        { label: 'Timing', value: 'High' },
      ],
    },
    {
      id: 'port_scan' as ThreatClass,
      title: 'Reconnaissance / Port Scanning',
      icon: Radar,
      severity: 'High',
      status: currentScenario === 'Port Scanning' || currentScenario === 'Mixed Attack' ? 'Fan-Out Detected' : 'Monitoring',
      isHot: currentScenario === 'Port Scanning' || currentScenario === 'Mixed Attack',
      confidence: '98%',
      evidence: [
        { label: 'Dst ports', value: '1,842' },
        { label: 'Target hosts', value: '324' },
        { label: 'Fan-out rate', value: 'High' },
        { label: 'Confidence', value: '98%' },
      ],
    },
    {
      id: 'data_exfil' as ThreatClass,
      title: 'Data Exfiltration',
      icon: UploadCloud,
      severity: 'High',
      status: currentScenario === 'Data Exfiltration' || currentScenario === 'Mixed Attack' ? 'Egress Burst' : 'Monitoring',
      isHot: currentScenario === 'Data Exfiltration' || currentScenario === 'Mixed Attack',
      confidence: '95%',
      evidence: [
        { label: 'Outbound bytes', value: '842 MB' },
        { label: 'Inbound bytes', value: '21 MB' },
        { label: 'Out/In ratio', value: '40.1' },
        { label: 'Duration', value: '18 min' },
      ],
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Threat Classification Vectors (Unidirectional Traffic Models)
          </h2>
        </div>
        {filterThreatClass !== 'ALL' && (
          <button
            onClick={() => setFilterThreatClass('ALL')}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition-colors"
          >
            Clear Filter ({filterThreatClass})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {threatConfigs.map((threat) => {
          const Icon = threat.icon;
          const isSelected = filterThreatClass === threat.id;
          const count = threatCounts[threat.id] || 0;

          return (
            <div
              key={threat.id}
              onClick={() =>
                setFilterThreatClass(isSelected ? 'ALL' : threat.id)
              }
              className={`relative rounded-lg p-4 border transition-colors cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-500 bg-[#161F30] ring-1 ring-slate-400/30'
                  : threat.isHot
                  ? 'border-red-900/60 bg-[#141A26] hover:border-red-800/80'
                  : 'border-slate-800/80 bg-[#0D1117] hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 shrink-0 ${threat.isHot ? 'text-red-400' : 'text-slate-400'}`} />
                    <div>
                      <h3 className="text-sm font-medium text-slate-100 tracking-tight">
                        {threat.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                        <span className={threat.isHot ? 'text-red-300 font-medium' : 'text-slate-400'}>
                          {threat.severity}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-300">{count} alerts</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {threat.isHot ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-950/40 border border-red-900/50 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>
                      {threat.status}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-normal">
                      Baseline
                    </span>
                  )}
                </div>

                {/* Evidence Key-Value List */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/70">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span>Evidence Attribution</span>
                    <span className="font-mono text-slate-300 text-[11px]">Conf: {threat.confidence}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {threat.evidence.map((ev, idx) => (
                      <div key={idx} className="flex justify-between items-baseline py-0.5 border-b border-slate-800/40">
                        <span className="text-slate-400 truncate text-[11px]">{ev.label}</span>
                        <span className="font-mono text-slate-200 text-[11px]">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* TLS Disclaimer */}
                {threat.encryptedNotice && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 leading-snug">
                    {threat.encryptedNotice}
                  </div>
                )}
              </div>

              {/* Click to filter footer */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>{isSelected ? 'Active filter' : 'Filter table'}</span>
                <span className="text-slate-400 hover:text-white transition-colors">→</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

