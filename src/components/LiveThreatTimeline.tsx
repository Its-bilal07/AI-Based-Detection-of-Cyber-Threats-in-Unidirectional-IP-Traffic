import React, { useRef } from 'react';
import { Radio, ChevronRight, Filter } from 'lucide-react';
import { useSOC } from '../context/SOCContext';
import { CyberThreatAlert } from '../types/alert';

export const LiveThreatTimeline: React.FC = () => {
  const { alerts, setSelectedAlert, filterSeverity, setFilterSeverity } = useSOC();
  const scrollRef = useRef<HTMLDivElement>(null);

  const getThreatLabel = (cls: string): string => {
    switch (cls) {
      case 'DDoS_SYN_flood': return 'DDoS';
      case 'C2_beacon': return 'C2 Beaconing';
      case 'DGA_domain': return 'DGA DNS';
      case 'TLS_malware': return 'Encrypted Malware';
      case 'port_scan': return 'Port Scanning';
      case 'data_exfil': return 'Data Exfiltration';
      default: return cls;
    }
  };

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

  const filteredAlerts = alerts.filter(
    (a) => filterSeverity === 'ALL' || a.severity === filterSeverity
  );

  return (
    <div className="bg-[#0E1526]/90 border border-slate-800 rounded-xl p-4 flex flex-col h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Threat Timeline
            </h3>
            <p className="text-[10px] text-slate-400">
              Real-time sequential detection stream
            </p>
          </div>
        </div>

        {/* Severity filter selector */}
        <div className="flex items-center space-x-1">
          <Filter className="w-3 h-3 text-slate-500" />
          {(['ALL', 'critical', 'high', 'medium'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Scrolling Events Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1 scrollbar-thin"
      >
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
            No events match current filter.
          </div>
        ) : (
          filteredAlerts.map((alert: CyberThreatAlert) => {
            const timeFormatted = alert.timestamp.substring(11, 19);
            const confPct = Math.round(alert.confidence * 100);

            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className="group flex items-center justify-between p-2 rounded-lg bg-[#090D18] hover:bg-[#131C31] border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center space-x-2.5 font-mono text-xs">
                  {/* Timestamp */}
                  <span className="text-slate-400 font-medium">{timeFormatted}</span>
                  <span className="text-slate-600">|</span>

                  {/* Severity Badge */}
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getSeverityBadge(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-slate-600">|</span>

                  {/* Threat Tag */}
                  <span className="text-slate-200 font-semibold group-hover:text-cyan-300 transition-colors">
                    {getThreatLabel(alert.threat_class)}
                  </span>
                  <span className="text-slate-600">|</span>

                  {/* Confidence */}
                  <span className="text-cyan-400 font-bold">{confPct}%</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="hidden xl:inline text-[11px] text-slate-400 truncate max-w-[140px]">
                    {alert.src_ip} → {alert.dst_ip}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2 text-[10px] font-mono text-slate-400 flex justify-between items-center border-t border-slate-800/60 mt-1">
        <span>Click any event to open Explainable AI panel</span>
        <span className="text-cyan-400">{filteredAlerts.length} buffered events</span>
      </div>
    </div>
  );
};
