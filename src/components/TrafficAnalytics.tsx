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
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Flows/sec Over Time
            </h3>
            <p className="text-[11px] text-slate-500">
              Instantaneous ingress flow rate
            </p>
          </div>
          <span className="text-sm font-mono font-bold text-blue-700">
            {Math.round(latest.flows_per_sec).toLocaleString()} /s
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
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Grid horizontal lines */}
            <line x1="0" y1="25" x2="280" y2="25" stroke="#F1F5F9" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="280" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="280" y2="75" stroke="#F1F5F9" strokeDasharray="3 3" />

            {flowsArea && <path d={flowsArea} fill="url(#flowsGrad)" />}
            {flowsLine && (
              <path
                d={flowsLine}
                fill="none"
                stroke="#2563EB"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2.5 border-t border-slate-100">
          <span>T - 60s</span>
          <span className="text-slate-500 font-medium">Line Rate Tracking</span>
          <span>Live (Now)</span>
        </div>
      </div>

      {/* 2. Inbound vs Outbound Bytes */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Inbound vs Outbound Bytes
            </h3>
            <p className="text-[11px] text-slate-500">
              Directional volume & exfiltration index
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-blue-700 font-semibold">IN {Number(latest.inbound_bytes_mbps).toFixed(1)} MB/s</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold">OUT {Number(latest.outbound_bytes_mbps).toFixed(1)} MB/s</span>
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
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="50" x2="280" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />

            {inArea && <path d={inArea} fill="url(#inGrad)" />}
            {outArea && <path d={outArea} fill="url(#outGrad)" />}
            {inLine && (
              <path
                d={inLine}
                fill="none"
                stroke="#2563EB"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
            )}
            {outLine && (
              <path
                d={outLine}
                fill="none"
                stroke="#059669"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2.5 border-t border-slate-100">
          <span className="flex items-center gap-1.5 text-blue-700 font-medium">
            <span className="w-2.5 h-0.5 bg-blue-600 inline-block rounded-full"></span> Ingress
          </span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <span className="w-2.5 h-0.5 bg-emerald-600 inline-block rounded-full"></span> Egress (Exfil)
          </span>
          <span className="text-slate-600 font-semibold">Ratio {(latest.outbound_bytes_mbps / (latest.inbound_bytes_mbps || 1)).toFixed(2)}:1</span>
        </div>
      </div>

      {/* 3. Threat Detection Rate over time */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Threat Detection Rate
            </h3>
            <p className="text-[11px] text-slate-500">
              Classified anomalies per minute
            </p>
          </div>
          <span className="text-sm font-mono font-bold text-rose-600">
            {Math.round(latest.detection_rate_per_min)} alerts/min
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
                <stop offset="0%" stopColor="#DC2626" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#DC2626" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="25" x2="280" y2="25" stroke="#F1F5F9" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="280" y2="50" stroke="#F1F5F9" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="280" y2="75" stroke="#F1F5F9" strokeDasharray="3 3" />

            {rateArea && <path d={rateArea} fill="url(#rateGrad)" />}
            {rateLine && (
              <path
                d={rateLine}
                fill="none"
                stroke="#DC2626"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2.5 border-t border-slate-100">
          <span>T - 60s</span>
          <span className="text-slate-500 font-medium">Model Inference Window</span>
          <span>Live</span>
        </div>
      </div>
    </div>
  );
};
