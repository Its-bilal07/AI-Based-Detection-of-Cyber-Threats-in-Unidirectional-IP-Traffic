import React, { useState } from 'react';
import { useSOC } from '../context/SOCContext';
import { ThreatClass } from '../types/alert';

export const ThreatDistribution: React.FC = () => {
  const { threatCounts, filterThreatClass, setFilterThreatClass } = useSOC();
  const [hoveredClass, setHoveredClass] = useState<ThreatClass | null>(null);

  const categories = [
    { id: 'DDoS_SYN_flood' as ThreatClass, name: 'DDoS', color: '#EF4444' },
    { id: 'C2_beacon' as ThreatClass, name: 'C2 Beaconing', color: '#F59E0B' },
    { id: 'DGA_domain' as ThreatClass, name: 'DGA / DNS Tunnelling', color: '#A855F7' },
    { id: 'TLS_malware' as ThreatClass, name: 'Encrypted Malware', color: '#38BDF8' },
    { id: 'port_scan' as ThreatClass, name: 'Reconnaissance', color: '#3B82F6' },
    { id: 'data_exfil' as ThreatClass, name: 'Data Exfiltration', color: '#10B981' },
  ];

  const totalAlerts = categories.reduce(
    (sum, cat) => sum + (threatCounts[cat.id] || 0),
    0
  );

  // Compute SVG Donut segments
  let cumulativeAngle = 0;
  const radius = 64;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  const slices = categories.map((cat) => {
    const count = threatCounts[cat.id] || 0;
    const fraction = totalAlerts > 0 ? count / totalAlerts : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -cumulativeAngle * circumference;
    cumulativeAngle += fraction;

    return {
      ...cat,
      count,
      percentage: (fraction * 100).toFixed(1),
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col h-[340px]">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Threat Distribution
          </h3>
          <p className="text-[11px] text-slate-500">
            Breakdown across detection vectors
          </p>
        </div>
        <span className="text-xs font-mono text-slate-800 font-semibold">
          {totalAlerts} Total Alerts
        </span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-4 pt-2">
        {/* SVG Donut Chart */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />
            {slices.map((slice) => {
              const isHighlighted =
                hoveredClass === slice.id || filterThreatClass === slice.id;
              return (
                <circle
                  key={slice.id}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHighlighted ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredClass(slice.id)}
                  onMouseLeave={() => setHoveredClass(null)}
                  onClick={() =>
                    setFilterThreatClass(
                      filterThreatClass === slice.id ? 'ALL' : slice.id
                    )
                  }
                />
              );
            })}
          </svg>

          {/* Center Label */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {hoveredClass
                ? `${slices.find((s) => s.id === hoveredClass)?.percentage}%`
                : totalAlerts}
            </span>
            <span className="text-[10px] uppercase text-slate-500 font-semibold">
              {hoveredClass
                ? slices.find((s) => s.id === hoveredClass)?.name
                : 'Total'}
            </span>
          </div>
        </div>

        {/* Categories Legend with Counts */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 w-full">
          {slices.map((cat) => {
            const isSelected = filterThreatClass === cat.id;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => setHoveredClass(cat.id)}
                onMouseLeave={() => setHoveredClass(null)}
                onClick={() =>
                  setFilterThreatClass(isSelected ? 'ALL' : cat.id)
                }
                className={`flex items-center justify-between py-1.5 px-2 rounded-md transition-colors cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900 font-medium border border-blue-200'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                <div className="flex items-center space-x-1.5 font-mono text-xs ml-2 shrink-0">
                  <span className="font-semibold text-slate-900">{cat.count}</span>
                  <span className="text-[11px] text-slate-500">
                    ({cat.percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
