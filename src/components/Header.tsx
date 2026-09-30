import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  FileCode2,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { useSOC } from '../context/SOCContext';
import { useTheme } from '../context/ThemeContext';
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

  const { toggleTheme, isDark } = useTheme();

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
    <header className="bg-white dark:bg-soc-surface border-b border-slate-200 dark:border-soc-border sticky top-0 z-40 px-4 lg:px-6 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Product Identity & Operational Status */}
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2.5">
            <div className="flex items-center space-x-2">
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-100/70 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 rounded">
                DEBUGGERS
              </span>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                AI-Based Detection of Cyber Threats in Unidirectional IP Traffic
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-0">
              <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 inline-block animate-pulse"></span>
                Monitoring
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-600 dark:text-slate-400">Read-Only Tap</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
                {Math.round(currentThroughput).toLocaleString()} flows/s
              </span>
            </div>
          </div>
        </div>

        {/* Controls, Theme Button, Scenario Selector & Clock */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Selector */}
          <div className="relative flex items-center">
            <label className="text-xs text-slate-600 dark:text-slate-300 font-medium mr-1.5 flex items-center gap-1">
              <span>Scenario:</span>
            </label>
            <div className="relative">
              <select
                value={currentScenario}
                onChange={(e) => setScenario(e.target.value as ScenarioType)}
                className="appearance-none bg-slate-50 dark:bg-soc-panel border border-slate-300 dark:border-soc-border hover:border-slate-400 dark:hover:border-soc-borderHover text-slate-800 dark:text-slate-200 text-xs rounded-md px-2.5 pr-6 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer font-medium shadow-xs"
              >
                {scenarios.map((sc) => (
                  <option key={sc} value={sc} className="bg-white dark:bg-soc-panel text-slate-800 dark:text-slate-200">
                    {sc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-soc-panel border border-slate-200 dark:border-soc-border rounded-md p-0.5">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeed(spd)}
                className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                  replaySpeed === spd
                    ? 'bg-white dark:bg-soc-card text-blue-700 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 text-xs font-medium transition-colors shadow-xs"
                title="Pause Replay"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={startReplay}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 text-xs font-medium transition-colors shadow-xs"
                title="Start Replay"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Replay</span>
              </button>
            )}

            <button
              onClick={resetReplay}
              className="p-1 rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-soc-card border border-transparent transition-colors"
              title="Reset Counters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Schema Viewer Trigger */}
          <button
            onClick={() => setIsSchemaModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-soc-panel hover:bg-slate-50 dark:hover:bg-soc-cardHover border border-slate-300 dark:border-soc-border text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors shadow-xs"
            title="Inspect Standard Alert Schema"
          >
            <FileCode2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Alert Schema</span>
          </button>

          {/* One Button to Control Dark & Light Mode */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-soc-panel dark:hover:bg-soc-cardHover border border-slate-300 dark:border-soc-border text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Dark and Light Mode"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Real-time Clock */}
          <div className="hidden xl:block pl-3 border-l border-slate-200 dark:border-soc-border font-mono text-xs text-slate-500 dark:text-slate-400">
            {currentTime}
          </div>
        </div>
      </div>
    </header>
  );
};
