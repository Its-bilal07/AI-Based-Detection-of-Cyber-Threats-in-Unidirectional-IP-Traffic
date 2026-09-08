import React from 'react';
import { SOCProvider } from './context/SOCContext';
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
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col font-sans bg-cyber-grid">
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
      <footer className="border-t border-slate-800/80 bg-[#0E1526]/80 py-4 px-6 text-center text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>AI-Based Threat Detection System | Unidirectional IP Traffic Inspection</span>
        </div>
        <div>
          <span>Ingest: 🔒 READ-ONLY | Decryption: NONE | Active Probing: DISABLED</span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SOCProvider>
      <DashboardContent />
    </SOCProvider>
  );
};

export default App;
