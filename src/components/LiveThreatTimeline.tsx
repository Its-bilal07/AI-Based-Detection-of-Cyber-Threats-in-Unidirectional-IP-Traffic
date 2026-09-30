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
        return 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60';
      case 'high':
        return 'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/60';
      case 'medium':
        return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60';
      case 'low':
      default:
        return 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700';
    }
  };

  const filteredAlerts = alerts.filter(
    (a) => filterSeverity === 'ALL' || a.severity === filterSeverity
  );

  return (
    <div className="bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border rounded-lg p-4 shadow-xs flex flex-col h-[340px] transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-soc-border">
        <div>
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Live Detection Stream
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                  ? 'bg-slate-800 dark:bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-soc-cardHover'
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
        className="flex-1 overflow-y-auto space-y-0.5 pt-2 pr-1 scrollbar-thin divide-y divide-slate-100 dark:divide-soc-border/60"
      >
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
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
                className="group flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-blue-50/40 dark:hover:bg-blue-950/30 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-slate-400 dark:text-slate-500 text-[11px] shrink-0">{timeFormatted}</span>
                  <span
                    className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded shrink-0 ${getSeverityBadge(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate max-w-[130px] sm:max-w-none">
                    {getThreatLabel(alert.threat_class)}
                  </span>
                  <span className="hidden xl:inline font-mono text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[150px]">
                    {alert.src_ip} → {alert.dst_ip}
                  </span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-[11px]">{confPct}%</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2.5 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between items-center border-t border-slate-100 dark:border-soc-border mt-1">
        <span>Click any event to inspect attribution</span>
        <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{filteredAlerts.length} events</span>
      </div>
    </div>
  );
};
