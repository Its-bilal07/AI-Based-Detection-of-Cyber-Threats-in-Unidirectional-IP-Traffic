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
        return 'text-rose-700 bg-rose-50 border border-rose-200';
      case 'high':
        return 'text-orange-700 bg-orange-50 border border-orange-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border border-amber-200';
      case 'low':
      default:
        return 'text-slate-600 bg-slate-100 border border-slate-200';
    }
  };

  const filteredAlerts = alerts.filter(
    (a) => filterSeverity === 'ALL' || a.severity === filterSeverity
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col h-[340px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Live Detection Stream
          </h3>
          <p className="text-[11px] text-slate-500">
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
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
        className="flex-1 overflow-y-auto space-y-0.5 pt-2 pr-1 scrollbar-thin divide-y divide-slate-100"
      >
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
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
                className="group flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-blue-50/40 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-slate-400 text-[11px] shrink-0">{timeFormatted}</span>
                  <span
                    className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded shrink-0 ${getSeverityBadge(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-slate-800 font-semibold group-hover:text-blue-600 transition-colors truncate max-w-[130px] sm:max-w-none">
                    {getThreatLabel(alert.threat_class)}
                  </span>
                  <span className="hidden xl:inline font-mono text-slate-500 text-[11px] truncate max-w-[150px]">
                    {alert.src_ip} → {alert.dst_ip}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono text-slate-700 font-semibold text-[11px]">{confPct}%</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2.5 text-[11px] text-slate-500 flex justify-between items-center border-t border-slate-100 mt-1">
        <span>Click any event to inspect attribution</span>
        <span className="font-mono text-slate-700 font-semibold">{filteredAlerts.length} events</span>
      </div>
    </div>
  );
};
