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
    <header className="bg-[#0D1117] border-b border-slate-800/80 sticky top-0 z-40 px-4 lg:px-6 py-2.5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Product Identity & Operational Status */}
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-slate-300 shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-3">
            <h1 className="text-sm font-semibold text-slate-100 tracking-tight">
              AI Threat Detection Console
            </h1>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
                Monitoring
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Read-Only Tap</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-300">{currentThroughput.toLocaleString()} flows/s</span>
            </div>
          </div>
        </div>

        {/* Replay Controls, Scenario Selector & Clock */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Selector */}
          <div className="relative flex items-center">
            <label className="text-xs text-slate-400 mr-2 flex items-center gap-1">
              <span>Scenario:</span>
            </label>
            <div className="relative">
              <select
                value={currentScenario}
                onChange={(e) => setScenario(e.target.value as ScenarioType)}
                className="appearance-none bg-slate-800/90 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs rounded px-2.5 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors cursor-pointer"
              >
                {scenarios.map((sc) => (
                  <option key={sc} value={sc} className="bg-slate-900 text-slate-200">
                    {sc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded p-0.5">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  replaySpeed === spd
                    ? 'bg-slate-700 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
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
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-medium transition-colors"
                title="Pause Replay"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startReplay}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-medium transition-colors"
                title="Start Replay"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Replay</span>
              </button>
            )}

            <button
              onClick={resetReplay}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              title="Reset Counters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Schema Viewer Trigger */}
          <button
            onClick={() => setIsSchemaModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
            title="Inspect Standard Alert Schema"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Alert Schema</span>
          </button>

          {/* Real-time Clock */}
          <div className="hidden xl:block pl-3 border-l border-slate-800 font-mono text-xs text-slate-400">
            {currentTime}
          </div>
        </div>
      </div>
    </header>
  );
};
