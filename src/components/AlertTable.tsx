import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  Layers,
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

  // Filter alerts
  const filtered = alerts.filter((a) => {
    const matchesThreat =
      filterThreatClass === 'ALL' || a.threat_class === filterThreatClass;
    const matchesSev =
      filterSeverity === 'ALL' || a.severity === filterSeverity;
    const matchesSearch =
      searchQuery.trim() === '' ||
      a.src_ip.includes(searchQuery) ||
      a.dst_ip.includes(searchQuery) ||
      a.flow_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.threat_class.toLowerCase().includes(searchQuery.toLowerCase());
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
    <div className="bg-[#0E1526]/90 border border-slate-800 rounded-xl p-4 flex flex-col shadow-xl">
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Live Alert Telemetry Log
            </h3>
            <p className="text-[10px] text-slate-400">
              Unidirectional detection stream matching standardized schema
            </p>
          </div>
        </div>

        {/* Search & Active Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search IP, Flow ID, Class..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500 w-48 sm:w-60"
            />
          </div>

          {(filterThreatClass !== 'ALL' || filterSeverity !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setFilterThreatClass('ALL');
                setFilterSeverity('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-cyan-950/40 border border-cyan-800"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] text-slate-400 font-semibold uppercase tracking-wider bg-[#090D18]/80">
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-slate-200"
                onClick={() => {
                  setSortField('timestamp');
                  setSortAsc(!sortAsc);
                }}
              >
                <div className="flex items-center gap-1">
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3">Flow ID</th>
              <th className="py-2.5 px-3">Source IP</th>
              <th className="py-2.5 px-3">Destination IP</th>
              <th className="py-2.5 px-3">Threat Class</th>
              <th className="py-2.5 px-3">Severity</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-slate-200"
                onClick={() => {
                  setSortField('confidence');
                  setSortAsc(!sortAsc);
                }}
              >
                <div className="flex items-center gap-1">
                  <span>Confidence</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3">Evidence</th>
              <th className="py-2.5 px-2 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
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
                    className="hover:bg-[#131C31] transition-colors cursor-pointer group"
                  >
                    {/* Timestamp */}
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {formattedTime}
                    </td>

                    {/* Flow ID */}
                    <td className="py-2.5 px-3 text-cyan-400 font-semibold whitespace-nowrap">
                      {alert.flow_id}
                    </td>

                    {/* Source IP */}
                    <td className="py-2.5 px-3 text-slate-200 whitespace-nowrap">
                      {alert.src_ip}
                    </td>

                    {/* Destination IP */}
                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                      {alert.dst_ip}:{alert.dst_port}
                    </td>

                    {/* Threat Class */}
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-white group-hover:text-cyan-300">
                      {getThreatLabel(alert.threat_class)}
                    </td>

                    {/* Severity */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getSeverityBadge(
                          alert.severity
                        )}`}
                      >
                        {alert.severity}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="py-2.5 px-3 whitespace-nowrap text-cyan-400 font-bold">
                      {confPct}%
                    </td>

                    {/* Evidence */}
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs">
                      {alert.evidence.summary}
                    </td>

                    {/* Inspect Arrow */}
                    <td className="py-2.5 px-2 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 inline-block transition-transform group-hover:translate-x-0.5" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-2 text-[11px] font-mono text-slate-400">
        <span>Showing top 50 buffered detections (Click row to inspect AI reasoning)</span>
        <span className="text-cyan-400">{sorted.length} total matched alerts</span>
      </div>
    </div>
  );
};
