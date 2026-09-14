import React from 'react';
import { useSOC } from '../context/SOCContext';

export const TrafficAnalytics: React.FC = () => {
  const { metricsHistory, currentThroughput } = useSOC();

  // Helper to build SVG path from data array
  const createAreaPath = (
    data: number[],
    width: number,
    height: number,
    minVal: number,
    maxVal: number
  ): { linePath: string; areaPath: string } => {
    if (data.length < 2) {
      return { linePath: '', areaPath: '' };
    }
    const range = maxVal - minVal || 1;
    const stepX = width / (data.length - 1);

    const points = data.map((val, idx) => {
      const x = idx * stepX;
      // Invert Y because SVG 0 is top
      const y = height - ((val - minVal) / range) * (height - 16) - 8;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const linePath = `M ${points.join(' L ')}`;
    const areaPath = `M ${points[0]} L ${points.join(' L ')} L ${width},${height} L 0,${height} Z`;

    return { linePath, areaPath };
  };

  // Chart 1: Flows/sec over time
  const flowsData = metricsHistory.map((m) => m.flows_per_sec);
  const maxFlows = Math.max(...flowsData, 1500);
  const minFlows = Math.max(0, Math.min(...flowsData, 800) - 200);
  const { linePath: flowsLine, areaPath: flowsArea } = createAreaPath(
    flowsData,
    280,
    100,
    minFlows,
    maxFlows
  );

  // Chart 2: Inbound vs Outbound Bytes (MB/s)
  const inBytesData = metricsHistory.map((m) => m.inbound_bytes_mbps);
  const outBytesData = metricsHistory.map((m) => m.outbound_bytes_mbps);
  const maxBytes = Math.max(...inBytesData, ...outBytesData, 40);
  const minBytes = 0;
  const { linePath: inLine, areaPath: inArea } = createAreaPath(
    inBytesData,
    280,
    100,
    minBytes,
    maxBytes
  );
  const { linePath: outLine, areaPath: outArea } = createAreaPath(
    outBytesData,
    280,
    100,
    minBytes,
    maxBytes
  );

  // Chart 3: Threat Detection Rate (alerts/min) over time
  const rateData = metricsHistory.map((m) => m.detection_rate_per_min);
  const maxRate = Math.max(...rateData, 10);
  const minRate = 0;
  const { linePath: rateLine, areaPath: rateArea } = createAreaPath(
    rateData,
    280,
    100,
    minRate,
    maxRate
  );

  const latest = metricsHistory[metricsHistory.length - 1] || {
    flows_per_sec: currentThroughput,
    inbound_bytes_mbps: 28.4,
    outbound_bytes_mbps: 14.2,
    detection_rate_per_min: 5,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Flows/sec over time */}
      <div className="bg-[#0D1117] border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Flows/sec Over Time
            </h3>
            <p className="text-[11px] text-slate-400">
              Instantaneous ingress flow rate
            </p>
          </div>
          <span className="text-sm font-mono font-semibold text-slate-200">
            {latest.flows_per_sec.toLocaleString()} /s
          </span>
        </div>

        {/* SVG Chart Area */}
        <div className="h-28 w-full mt-3 relative flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 280 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="flowsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid horizontal lines */}
            <line x1="0" y1="25" x2="280" y2="25" stroke="#1E293B" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="280" y2="50" stroke="#1E293B" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="280" y2="75" stroke="#1E293B" strokeDasharray="3 3" />

            {flowsArea && <path d={flowsArea} fill="url(#flowsGrad)" />}
            {flowsLine && (
              <path
                d={flowsLine}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2.5 border-t border-slate-800/80">
          <span>T - 60s</span>
          <span className="text-slate-400 font-normal">Line Rate Tracking</span>
          <span>Live (Now)</span>
        </div>
      </div>

      {/* 2. Inbound vs Outbound Bytes */}
      <div className="bg-[#0D1117] border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Inbound vs Outbound Bytes
            </h3>
            <p className="text-[11px] text-slate-400">
              Directional volume & exfiltration index
            </p>
          </div>
          <div className="flex items-center space-x-2.5 text-xs font-mono">
            <span className="text-sky-400 font-medium">IN {latest.inbound_bytes_mbps} MB/s</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-medium">OUT {latest.outbound_bytes_mbps} MB/s</span>
          </div>
        </div>

        {/* SVG Comparative Chart */}
        <div className="h-28 w-full mt-3 relative flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 280 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="50" x2="280" y2="50" stroke="#1E293B" strokeDasharray="3 3" />

            {inArea && <path d={inArea} fill="url(#inGrad)" />}
            {outArea && <path d={outArea} fill="url(#outGrad)" />}
            {inLine && (
              <path
                d={inLine}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            )}
            {outLine && (
              <path
                d={outLine}
                fill="none"
                stroke="#10B981"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2.5 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="w-2.5 h-0.5 bg-sky-400 inline-block rounded-full"></span> Ingress
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block rounded-full"></span> Egress (Exfil)
          </span>
          <span className="text-slate-400">Ratio {(latest.outbound_bytes_mbps / (latest.inbound_bytes_mbps || 1)).toFixed(1)}:1</span>
        </div>
      </div>

      {/* 3. Threat Detection Rate over time */}
      <div className="bg-[#0D1117] border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Threat Detection Rate
            </h3>
            <p className="text-[11px] text-slate-400">
              Classified anomalies per minute
            </p>
          </div>
          <span className="text-sm font-mono font-semibold text-rose-400">
            {latest.detection_rate_per_min} alerts/min
          </span>
        </div>

        {/* SVG Chart */}
        <div className="h-28 w-full mt-3 relative flex items-center justify-center">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 280 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="25" x2="280" y2="25" stroke="#1E293B" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="280" y2="50" stroke="#1E293B" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="280" y2="75" stroke="#1E293B" strokeDasharray="3 3" />

            {rateArea && <path d={rateArea} fill="url(#rateGrad)" />}
            {rateLine && (
              <path
                d={rateLine}
                fill="none"
                stroke="#F43F5E"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2.5 border-t border-slate-800/80">
          <span>T - 60s</span>
          <span className="text-slate-400 font-normal">Model Inference Window</span>
          <span>Live</span>
        </div>
      </div>
    </div>
  );
};
