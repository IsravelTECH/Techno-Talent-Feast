import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ManagerDemoBar } from './components/common/ManagerDemoBar';

// Pages
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserRolesPage } from './pages/UserRolesPage';
import { EventsPage, EventDetailPage } from './pages/EventsPage';
import { ParticipantsPage, ParticipantDetailPage } from './pages/ParticipantsPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { CompetitionsPage, CompetitionDetailPage } from './pages/CompetitionsPage';
import { RubricBuilderPage } from './pages/RubricBuilderPage';
import { JudgesPage, JudgeDashboardPage } from './pages/JudgesPage';
import { ScoringPanelPage } from './pages/ScoringPanelPage';
import { LiveLeaderboardPage } from './pages/LiveLeaderboardPage';
import { PublicLiveScoreboardPage } from './pages/PublicLiveScoreboardPage';
import { ResultsPage } from './pages/ResultsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { currentPage } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Standalone Login Page
  if (currentPage === 'login') {
    return <LoginPage />;
  }

  // 2. Standalone Public Stadium /live Scoreboard
  if (currentPage === 'live') {
    return (
      <div className="min-h-screen bg-[#07132B]">
        <ManagerDemoBar />
        <PublicLiveScoreboardPage />
      </div>
    );
  }

  // 3. Main Application with Sidebar + Header + Page Layout
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboardPage />;
      case 'roles':
        return <UserRolesPage />;
      case 'events':
        return <EventsPage />;
      case 'event-detail':
        return <EventDetailPage />;
      case 'participants':
        return <ParticipantsPage />;
      case 'participant-detail':
        return <ParticipantDetailPage />;
      case 'schools':
        return <SchoolsPage />;
      case 'competitions':
        return <CompetitionsPage />;
      case 'competition-detail':
        return <CompetitionDetailPage />;
      case 'rubrics':
        return <RubricBuilderPage />;
      case 'judges':
        return <JudgesPage />;
      case 'judge-dashboard':
        return <JudgeDashboardPage />;
      case 'scoring':
        return <ScoringPanelPage />;
      case 'leaderboard':
        return <LiveLeaderboardPage />;
      case 'results':
        return <ResultsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <AdminDashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FCFB] flex flex-col selection:bg-[#03A695] selection:text-white">
      {/* Manager Walkthrough Bar */}
      <ManagerDemoBar />

      <div className="flex-1 flex flex-row relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Workspace Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderCurrentPage()}
          </main>

          {/* Footer */}
          <footer className="py-4 px-6 border-t border-[#D8EBE7] bg-white text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-700">
              TECHNO TALENT FEAST 2026 — Powered by TechnoSchool
            </span>
            <span>
              Championship Scoring Engine & Live Leaderboard Platform
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
};
