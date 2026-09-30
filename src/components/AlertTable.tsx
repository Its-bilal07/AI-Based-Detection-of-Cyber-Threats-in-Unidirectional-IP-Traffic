import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { useSOC } from '../context/SOCContext';

export const AlertTable: React.FC = () => {
  const {
    alerts,
    setSelectedAlert,
    filterThreatClass,
    setFilterThreatClass,
    filterSeverity,
    setFilterSeverity,
    searchQuery,
    setSearchQuery,
  } = useSOC();

  const [sortField, setSortField] = useState<'timestamp' | 'confidence'>('timestamp');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

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

  // Filter alerts
  const filtered = alerts.filter((a) => {
    const matchesThreat =
      filterThreatClass === 'ALL' || a.threat_class === filterThreatClass;
    const matchesSev =
      filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesSearch =
      searchQuery.trim() === '' ||
      (a.src_ip || '').includes(searchQuery) ||
      (a.dst_ip || '').includes(searchQuery) ||
      (a.flow_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.threat_class || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesThreat && matchesSev && matchesSearch;
  });

  // Sort alerts
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'confidence') {
      return sortAsc ? a.confidence - b.confidence : b.confidence - a.confidence;
    }
    // timestamp
    return sortAsc
      ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="bg-white dark:bg-soc-card border border-slate-200 dark:border-soc-border rounded-lg p-4 shadow-xs flex flex-col transition-colors duration-200">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-soc-border">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Live Alert Telemetry Log
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Unidirectional detection stream matching standardized schema
          </p>
        </div>

        {/* Search & Active Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search IP, Flow ID, Class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 dark:bg-soc-surface border border-slate-300 dark:border-soc-border hover:border-slate-400 dark:hover:border-soc-borderHover text-slate-800 dark:text-slate-200 text-xs font-mono rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500 w-48 sm:w-64 shadow-xs"
            />
          </div>

          {(filterThreatClass !== 'ALL' || filterSeverity !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setFilterThreatClass('ALL');
                setFilterSeverity('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-md bg-slate-100 dark:bg-soc-surface hover:bg-slate-200 dark:hover:bg-soc-panel border border-slate-200 dark:border-soc-border transition-colors font-medium shadow-xs"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-soc-border text-[11px] text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider bg-slate-50 dark:bg-soc-surface/60">
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                onClick={() => {
                  setSortField('timestamp');
                  setSortAsc(!sortAsc);
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3">Flow ID</th>
              <th className="py-2.5 px-3">Source IP</th>
              <th className="py-2.5 px-3">Destination IP</th>
              <th className="py-2.5 px-3">Threat Class</th>
              <th className="py-2.5 px-3">Severity</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white select-none"
                onClick={() => {
                  setSortField('confidence');
                  setSortAsc(!sortAsc);
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span>Confidence</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3">Evidence Summary</th>
              <th className="py-2.5 px-2 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-soc-border/60 font-mono">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs font-sans">
                  No alerts currently match the query filters.
                </td>
              </tr>
            ) : (
              sorted.slice(0, 50).map((alert) => {
                const formattedTime = alert.timestamp.replace('T', ' ').substring(0, 19);
                const confPct = Math.round(alert.confidence * 100);

                return (
                  <tr
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-colors cursor-pointer group"
                  >
                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {formattedTime}
                    </td>

                    {/* Flow ID */}
                    <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap text-[11px]">
                      {alert.flow_id}
                    </td>

                    {/* Source IP */}
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap text-[11px]">
                      {alert.src_ip}
                    </td>

                    {/* Destination IP */}
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap text-[11px]">
                      {alert.dst_ip}:{alert.dst_port}
                    </td>

                    {/* Threat Class */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-sans font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {getThreatLabel(alert.threat_class)}
                    </td>

                    {/* Severity */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded border ${getSeverityBadge(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-900 dark:text-white font-bold text-[11px]">
                      {confPct}%
                    </td>

                    {/* Evidence */}
                    <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-xs font-sans text-xs">
                      {alert.evidence?.summary || 'N/A'}
                    </td>

                    {/* Inspect Arrow */}
                    <td className="py-2.5 px-2 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 inline-block transition-transform group-hover:translate-x-0.5" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-soc-border mt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <span>Showing top 50 buffered detections (Click row to inspect AI reasoning)</span>
        <span className="text-slate-700 dark:text-slate-300 font-semibold">{sorted.length} total matched alerts</span>
      </div>
    </div>
  );
};
