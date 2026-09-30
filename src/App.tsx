import React from 'react';
import { SOCProvider } from './context/SOCContext';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { KPICards } from './components/KPICards';
import { ThreatOverview } from './components/ThreatOverview';
import { LiveThreatTimeline } from './components/LiveThreatTimeline';
import { ThreatDistribution } from './components/ThreatDistribution';
import { TrafficAnalytics } from './components/TrafficAnalytics';
import { AlertTable } from './components/AlertTable';
import { ArchitecturePanel } from './components/ArchitecturePanel';
import { AlertDetailDrawer } from './components/AlertDetailDrawer';
import { AlertSchemaModal } from './components/AlertSchemaModal';

export const DashboardContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-soc-bg text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navigation & SOC Control Bar */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-[1780px] w-full mx-auto p-4 sm:p-5 lg:p-6 space-y-6">
        {/* Row 1: KPI Cards */}
        <KPICards />

        {/* Row 2: Threat Overview Cards */}
        <ThreatOverview />

        {/* Row 3: Live Threat Timeline & Threat Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LiveThreatTimeline />
          <ThreatDistribution />
        </div>

        {/* Row 4: Real-time Traffic Analytics (3 Live Charts) */}
        <TrafficAnalytics />

        {/* Row 5: Detailed Alert Table */}
        <AlertTable />

        {/* Row 6: Unidirectional Architecture & Security Guarantees */}
        <ArchitecturePanel />
      </main>

      {/* Slide-over Explainable AI Drawer & Schema Modal */}
      <AlertDetailDrawer />
      <AlertSchemaModal />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-soc-border bg-white dark:bg-soc-surface py-3.5 px-6 text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs transition-colors duration-200">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Unidirectional IP Traffic Threat Detection Console</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center space-x-3">
          <span>Ingest: Read-Only Tap</span>
          <span>•</span>
          <span>Payload Decryption: None</span>
          <span>•</span>
          <span>Active Probing: Disabled</span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SOCProvider>
        <DashboardContent />
      </SOCProvider>
    </ThemeProvider>
  );
};

export default App;
