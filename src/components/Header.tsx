import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Lock,
  Radio,
  FileCode2,
  Sliders,
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
    <header className="bg-[#0E1526]/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-6 py-3 shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Project Branding & SOC Status Indicators */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg shadow-inner">
            <ShieldAlert className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AI Threat Detection
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  v2.4-SOC
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              AI-Based Detection of Cyber Threats in Unidirectional IP Traffic
            </p>
          </div>

          {/* Operational Badges */}
          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-slate-800">
            {/* Status indicator: ● Monitoring */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>● Monitoring</span>
            </div>

            {/* Data source: Simulated IP Traffic */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulated IP Traffic</span>
            </div>

            {/* Ingest mode: READ-ONLY */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold tracking-wider">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>READ-ONLY</span>
            </div>

            {/* Throughput: 1,250 flows/sec */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold">
              <span>{currentThroughput.toLocaleString()} flows/sec</span>
            </div>
          </div>
        </div>

        {/* Replay Controls, Scenario Selector & Clock */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Scenario Selector */}
          <div className="relative flex items-center">
            <label className="text-xs text-slate-400 mr-2 font-mono flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Scenario:</span>
            </label>
            <div className="relative">
              <select
                value={currentScenario}
                onChange={(e) => setScenario(e.target.value as ScenarioType)}
                className="appearance-none bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-200 text-xs font-mono rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors cursor-pointer"
              >
                {scenarios.map((sc) => (
                  <option key={sc} value={sc} className="bg-slate-900 text-slate-200">
                    {sc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  replaySpeed === spd
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Simulate at ${spd}x speed`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Start / Pause / Reset Controls */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
            {isReplayRunning ? (
              <button
                onClick={pauseReplay}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors"
                title="Pause Replay"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startReplay}
                className="flex items-center space-x-1 px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium transition-colors"
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
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-colors"
            title="Inspect Standard Alert Schema"
          >
            <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Alert Schema</span>
          </button>

          {/* Real-time Clock */}
          <div className="hidden xl:block pl-2 border-l border-slate-800 font-mono text-xs text-slate-400">
            {currentTime}
          </div>
        </div>
      </div>
    </header>
  );
};
