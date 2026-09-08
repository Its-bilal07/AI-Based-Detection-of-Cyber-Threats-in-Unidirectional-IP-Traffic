import React from 'react';
import {
  Flame,
  Network,
  Globe,
  Lock,
  Radar,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Info,
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
      severity: 'CRITICAL',
      status: currentScenario === 'DDoS Attack' || currentScenario === 'Mixed Attack' ? 'ATTACK DETECTED' : 'NORMAL / MONITORING',
      isHot: currentScenario === 'DDoS Attack' || currentScenario === 'Mixed Attack',
      confidence: '97%',
      accentColor: 'border-red-500/40 bg-red-950/20 text-red-400',
      badgeColor: 'bg-red-500/20 text-red-300 border-red-500/50',
      statusColor: 'text-red-400 bg-red-500/10 border-red-500/30',
      evidence: [
        { label: 'SYN rate', value: '18,420/sec' },
        { label: 'Source IP entropy', value: '1.8' },
        { label: 'Destination port', value: '443' },
        { label: 'Model Confidence', value: '97%' },
      ],
    },
    {
      id: 'C2_beacon' as ThreatClass,
      title: 'Botnet C2 Beaconing',
      icon: Network,
      severity: 'MEDIUM',
      status: currentScenario === 'Botnet Beaconing' || currentScenario === 'Mixed Attack' ? 'BEACONS DETECTED' : 'NORMAL / MONITORING',
      isHot: currentScenario === 'Botnet Beaconing' || currentScenario === 'Mixed Attack',
      confidence: '93%',
      accentColor: 'border-amber-500/40 bg-amber-950/20 text-amber-400',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      evidence: [
        { label: 'Periodicity', value: '60 sec' },
        { label: 'Repeated destination', value: '185.XX.XX.XX' },
        { label: 'Inter-arrival variance', value: 'low' },
        { label: 'Model Confidence', value: '93%' },
      ],
    },
    {
      id: 'DGA_domain' as ThreatClass,
      title: 'DGA / DNS Tunnelling',
      icon: Globe,
      severity: 'HIGH',
      status: currentScenario === 'DGA / DNS Tunnelling' || currentScenario === 'Mixed Attack' ? 'ANOMALOUS QUERIES' : 'NORMAL / MONITORING',
      isHot: currentScenario === 'DGA / DNS Tunnelling' || currentScenario === 'Mixed Attack',
      confidence: '96%',
      accentColor: 'border-purple-500/40 bg-purple-950/20 text-purple-400',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      statusColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      evidence: [
        { label: 'Query entropy', value: '4.92' },
        { label: 'Average query length', value: '47' },
        { label: 'Suspicious n-gram score', value: 'high' },
        { label: 'Record type', value: 'TXT' },
      ],
    },
    {
      id: 'TLS_malware' as ThreatClass,
      title: 'Encrypted Session Malware',
      icon: Lock,
      severity: 'HIGH',
      status: currentScenario === 'Encrypted Malware' || currentScenario === 'Mixed Attack' ? 'JA4 ANOMALY' : 'NORMAL / MONITORING',
      isHot: currentScenario === 'Encrypted Malware' || currentScenario === 'Mixed Attack',
      confidence: '91%',
      accentColor: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      statusColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      encryptedNotice: 'Encrypted traffic analysed using metadata only. No payload decryption.',
      evidence: [
        { label: 'TLS/QUIC fingerprint', value: 'suspicious' },
        { label: 'JA4 anomaly', value: 'high' },
        { label: 'Packet-size sequence anomaly', value: '0.87' },
        { label: 'Timing anomaly', value: 'high' },
      ],
    },
    {
      id: 'port_scan' as ThreatClass,
      title: 'Reconnaissance / Port Scanning',
      icon: Radar,
      severity: 'HIGH',
      status: currentScenario === 'Port Scanning' || currentScenario === 'Mixed Attack' ? 'FAN-OUT DETECTED' : 'NORMAL / MONITORING',
      isHot: currentScenario === 'Port Scanning' || currentScenario === 'Mixed Attack',
      confidence: '98%',
      accentColor: 'border-blue-500/40 bg-blue-950/20 text-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      statusColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      evidence: [
        { label: 'Unique destination ports', value: '1,842' },
        { label: 'Unique hosts', value: '324' },
        { label: 'Fan-out rate', value: 'high' },
        { label: 'Model Confidence', value: '98%' },
      ],
    },
    {
      id: 'data_exfil' as ThreatClass,
      title: 'Data Exfiltration',
      icon: UploadCloud,
      severity: 'HIGH',
      status: currentScenario === 'Data Exfiltration' || currentScenario === 'Mixed Attack' ? 'EGRESS BURST' : 'NORMAL / MONITORING',
      isHot: currentScenario === 'Data Exfiltration' || currentScenario === 'Mixed Attack',
      confidence: '95%',
      accentColor: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      evidence: [
        { label: 'Outbound bytes', value: '842 MB' },
        { label: 'Inbound bytes', value: '21 MB' },
        { label: 'Outbound/Inbound ratio', value: '40.1' },
        { label: 'Flow duration', value: '18 min' },
      ],
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Threat Classification Vectors (Unidirectional Traffic Models)
          </h2>
        </div>
        {filterThreatClass !== 'ALL' && (
          <button
            onClick={() => setFilterThreatClass('ALL')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-800"
          >
            Clear Filter ({filterThreatClass})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
              className={`relative bg-[#0E1526]/90 rounded-xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-500/30 bg-[#131C31]'
                  : threat.isHot
                  ? 'border-slate-700 hover:border-slate-600 hover:bg-[#131C31]'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <div className={`p-2 rounded-lg ${threat.accentColor} border`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {threat.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${threat.badgeColor}`}>
                          {threat.severity}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {count} alerts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${
                      threat.isHot ? threat.statusColor : 'text-slate-400 bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    {threat.isHot ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3" />
                    )}
                    {threat.status}
                  </span>
                </div>

                {/* Evidence Metrics Box */}
                <div className="bg-[#090D18] rounded-lg p-2.5 border border-slate-800/80 my-2.5 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Evidence Attribution</span>
                    <span className="text-cyan-400 font-semibold">Conf: {threat.confidence}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    {threat.evidence.map((ev, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] border-b border-slate-800/50 pb-0.5">
                        <span className="text-slate-400 truncate max-w-[90px]">{ev.label}:</span>
                        <span className="font-mono font-medium text-slate-200">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mandatory Encrypted Notice for TLS Malware */}
                {threat.encryptedNotice && (
                  <div className="mt-2 p-2 rounded bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-[11px] flex items-center gap-1.5 font-medium leading-tight">
                    <Info className="w-4 h-4 shrink-0 text-cyan-400" />
                    <span>{threat.encryptedNotice}</span>
                  </div>
                )}
              </div>

              {/* Click-to-filter hint footer */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>{isSelected ? 'Filtered in Alert Table' : 'Click to filter table & stream'}</span>
                <span className="text-cyan-400 font-semibold">{isSelected ? 'Active' : 'Filter →'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
