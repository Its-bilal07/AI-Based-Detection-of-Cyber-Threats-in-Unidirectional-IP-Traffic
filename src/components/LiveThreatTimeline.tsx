import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
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
        return 'text-red-400 bg-red-950/50';
      case 'high':
        return 'text-orange-400 bg-orange-950/50';
      case 'medium':
        return 'text-amber-400 bg-amber-950/50';
      case 'low':
      default:
        return 'text-slate-400 bg-slate-800';
    }
  };

  const filteredAlerts = alerts.filter(
    (a) => filterSeverity === 'ALL' || a.severity === filterSeverity
  );

  return (
    <div className="bg-[#0D1117] border border-slate-800/80 rounded-lg p-4 flex flex-col h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Live Detection Stream
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time sequential threat events
          </p>
        </div>

        {/* Severity filter selector */}
        <div className="flex items-center space-x-1 text-xs">
          {(['ALL', 'critical', 'high', 'medium'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded transition-colors text-[11px] ${
                filterSeverity === sev
                  ? 'bg-slate-700 text-white font-medium'
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
        className="flex-1 overflow-y-auto space-y-0.5 pt-2 pr-1 scrollbar-thin divide-y divide-slate-800/30"
      >
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
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
                className="group flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-800/50 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-slate-400 text-[11px] shrink-0">{timeFormatted}</span>
                  <span
                    className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded shrink-0 ${getSeverityBadge(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-slate-200 font-medium group-hover:text-white transition-colors truncate max-w-[130px] sm:max-w-none">
                    {getThreatLabel(alert.threat_class)}
                  </span>
                  <span className="hidden xl:inline font-mono text-slate-400 text-[11px] truncate max-w-[150px]">
                    {alert.src_ip} → {alert.dst_ip}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono text-slate-300 text-[11px]">{confPct}%</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2.5 text-[11px] text-slate-400 flex justify-between items-center border-t border-slate-800/80 mt-1">
        <span>Click any event to inspect attribution</span>
        <span className="font-mono text-slate-300">{filteredAlerts.length} events</span>
      </div>
    </div>
  );
};
