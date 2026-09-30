import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  FileCode2,
  ChevronDown
} from 'lucide-react';
import { useSOC } from '../context/SOCContext';
import { ScenarioType } from '../types/alert';

export const Header: React.FC = () => {
  const {
    currentThroughput,
    isReplayRunning,
    replaySpeed,
    currentScenario,
    startReplay,
    pauseReplay,
    resetReplay,
    setSpeed,
    setScenario,
    setIsSchemaModalOpen,
  } = useSOC();

  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const scenarios: ScenarioType[] = [
    'Mixed Attack',
    'DDoS Attack',
    'Botnet Beaconing',
    'DGA / DNS Tunnelling',
    'Encrypted Malware',
    'Port Scanning',
    'Data Exfiltration',
    'Normal Traffic',
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 lg:px-6 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Product Identity & Operational Status */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-md bg-blue-50 border border-blue-100 text-blue-600 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2.5">
            <div className="flex items-center space-x-2">
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-100/70 text-blue-700 border border-blue-200/80 rounded">
                DEBUGGERS
              </span>
              <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
                AI-Based Detection of Cyber Threats in Unidirectional IP Traffic
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5 sm:mt-0">
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                Monitoring
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600">Read-Only Tap</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-800 font-medium">{Math.round(currentThroughput).toLocaleString()} flows/s</span>
            </div>
          </div>
        </div>

        {/* Replay Controls, Scenario Selector & Clock */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Selector */}
          <div className="relative flex items-center">
            <label className="text-xs text-slate-600 font-medium mr-1.5 flex items-center gap-1">
              <span>Scenario:</span>
            </label>
            <div className="relative">
              <select
                value={currentScenario}
                onChange={(e) => setScenario(e.target.value as ScenarioType)}
                className="appearance-none bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs rounded-md px-2.5 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer font-medium shadow-xs"
              >
                {scenarios.map((sc) => (
                  <option key={sc} value={sc} className="bg-white text-slate-800">
                    {sc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-md p-0.5">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  replaySpeed === spd
                    ? 'bg-white text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Simulate at ${spd}x speed`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Start / Pause / Reset Controls */}
          <div className="flex items-center space-x-1">
            {isReplayRunning ? (
              <button
                onClick={pauseReplay}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-medium transition-colors shadow-xs"
                title="Pause Replay"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startReplay}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-medium transition-colors shadow-xs"
                title="Start Replay"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Replay</span>
              </button>
            )}

            <button
              onClick={resetReplay}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent transition-colors"
              title="Reset Counters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Schema Viewer Trigger */}
          <button
            onClick={() => setIsSchemaModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors shadow-xs"
            title="Inspect Standard Alert Schema"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Alert Schema</span>
          </button>

          {/* Real-time Clock */}
          <div className="hidden xl:block pl-3 border-l border-slate-200 font-mono text-xs text-slate-500">
            {currentTime}
          </div>
        </div>
      </div>
    </header>
  );
};
