import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Sparkles, ChevronRight, ChevronDown, UserCheck, Award, Eye, ShieldCheck } from 'lucide-react';

export const ManagerDemoBar: React.FC = () => {
  const {
    currentPage,
    currentRole,
    navigate,
    loginAs,
    triggerManagerScenario,
    scoringScenarioRun
  } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);

  if (currentPage === 'login') return null;

  const demoSteps = [
    { label: 'Admin Dashboard', page: 'dashboard', role: 'admin' as const },
    { label: 'User Roles & Events', page: 'roles', role: 'admin' as const },
    { label: 'Events 2026', page: 'events', role: 'admin' as const },
    { label: 'Competitions', page: 'competitions', role: 'admin' as const },
    { label: 'Rubric Builder', page: 'rubrics', role: 'admin' as const },
    { label: 'Judges Roster', page: 'judges', role: 'admin' as const },
    { label: 'Judge Scoring (Live)', page: 'scoring', role: 'judge' as const },
    { label: 'Live Leaderboard', page: 'leaderboard', role: 'admin' as const },
    { label: 'Public Display (/live)', page: 'live', role: 'viewer' as const },
    { label: 'Official Results', page: 'results', role: 'admin' as const }
  ];

  return (
    <div className="bg-[#0B2545] text-white border-b border-teal-900/60 text-xs select-none sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Indicator & Quick Scenario Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#03A695]/20 border border-[#03A695]/40 text-[11px] font-bold tracking-wide text-teal-300">
            <span className="w-2 h-2 rounded-full bg-[#FD5E01] animate-ping" />
            <span>MANAGER PRESENTATION SUITE</span>
          </div>

          <button
            onClick={triggerManagerScenario}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FD5E01] to-[#FF7A00] text-white font-bold hover:brightness-110 shadow-sm transition-transform active:scale-95 cursor-pointer"
            title="Loads the required test scenario: Arun Kumar, Robotics: 18,19,17,20,18 = 92%"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Test Scenario (Arun 92%)</span>
          </button>
        </div>

        {/* Center: Walkthrough Steps */}
        {isExpanded && (
          <div className="hidden lg:flex items-center gap-1 bg-[#022B3A]/80 p-1 rounded-xl border border-teal-900/40 overflow-x-auto">
            {demoSteps.map((step, idx) => {
              const isActive = currentPage === step.page;
              return (
                <button
                  key={step.page}
                  onClick={() => {
                    if (currentRole !== step.role) {
                      loginAs(step.role);
                    }
                    navigate(step.page);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-[#03A695] text-white font-bold shadow-xs'
                      : 'text-teal-200 hover:text-white hover:bg-[#0B2545]'
                  }`}
                >
                  <span className="opacity-60 text-[9px]">{idx + 1}.</span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Role Switcher & Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#022B3A] p-0.5 rounded-xl border border-teal-800/40">
            <button
              onClick={() => loginAs('admin')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-white text-[#0B2545] shadow-xs font-bold'
                  : 'text-teal-200 hover:text-white'
              }`}
              title="Switch to Super Admin view"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => loginAs('judge')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                currentRole === 'judge'
                  ? 'bg-[#FD5E01] text-white shadow-xs font-bold'
                  : 'text-teal-200 hover:text-white'
              }`}
              title="Switch to Judge Priya view"
            >
              <UserCheck className="w-3 h-3" />
              <span>Judge</span>
            </button>
            <button
              onClick={() => loginAs('viewer')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                currentRole === 'viewer'
                  ? 'bg-emerald-500 text-white shadow-xs font-bold'
                  : 'text-teal-200 hover:text-white'
              }`}
              title="Switch to Public LED Arena display"
            >
              <Eye className="w-3 h-3" />
              <span>/live</span>
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-teal-300 hover:text-white p-1 rounded hover:bg-teal-900/40 hidden lg:block"
            title={isExpanded ? 'Collapse Demo Bar' : 'Expand Demo Bar'}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
