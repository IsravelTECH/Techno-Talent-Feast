import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Pages
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { UserRolesPage } from './pages/UserRolesPage';
import { EventsPage, EventDetailPage } from './pages/EventsPage';
import { ParticipantsPage, ParticipantDetailPage } from './pages/ParticipantsPage';
import { SchoolsPage } from './pages/SchoolsPage';
import { CompetitionsPage, CompetitionDetailPage } from './pages/CompetitionsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RubricBuilderPage } from './pages/RubricBuilderPage';
import { JudgeAssignmentPage } from './pages/JudgeAssignmentPage';
import { JudgeDashboardPage } from './pages/JudgeDashboardPage';
import { JudgeAssignmentsPage } from './pages/JudgeAssignmentsPage';
import { ScoringPanelPage } from './pages/ScoringPanelPage';
import { JudgeCompletedPage } from './pages/JudgeCompletedPage';
import { LiveLeaderboardPage } from './pages/LiveLeaderboardPage';
import { ResultsPage } from './pages/ResultsPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { JudgeSinglePageScoring } from './pages/JudgeSinglePageScoring';

export const App: React.FC = () => {
  const { currentPage, currentRole } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 1. Standalone Login Page
  if (currentPage === 'login') {
    return <LoginPage />;
  }

  // 2. Standalone Single-Page Judge Portal (Only Admin and Judge: strictly 1 page for Judge)
  if (currentRole === 'judge') {
    return <JudgeSinglePageScoring />;
  }

  // 3. Main Administration Workspace with Sidebar + Header + Page Layout
  const renderCurrentPage = () => {
    switch (currentPage) {
      // Administration Pages
      case 'dashboard':
        return <AdminDashboardPage />;
      case 'events':
        return <EventsPage />;
      case 'event-detail':
        return <EventDetailPage />;
      case 'schools':
        return <SchoolsPage />;
      case 'participants':
        return <ParticipantsPage />;
      case 'participant-detail':
        return <ParticipantDetailPage />;
      case 'categories':
      case 'competitions':
        return <CompetitionsPage />;
      case 'competition-detail':
        return <CompetitionDetailPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'assignments':
        return <JudgeAssignmentPage />;
      case 'results':
        return <ResultsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <ProfilePage />;
      case 'rubrics':
        return <RubricBuilderPage />;
      case 'roles':
        return <UserRolesPage />;

      // Redirect removed Admin pages and obsolete live route to fallback Admin Dashboard
      case 'live':
      case 'event-overview':
      case 'finalists':
      case 'judges':
      case 'scoring-monitor':
      case 'live-control':
      case 'score-review':
      case 'announcements':
      case 'activity-log':
        return <AdminDashboardPage />;

      // Judge Pages
      case 'judge-dashboard':
        return <JudgeDashboardPage />;
      case 'judge-assignments':
        return <JudgeAssignmentsPage />;
      case 'scoring':
        return <ScoringPanelPage />;
      case 'judge-completed':
        return <JudgeCompletedPage />;
      case 'leaderboard':
        return <LiveLeaderboardPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <ProfilePage />;

      default:
        return <AdminDashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FCFB] flex flex-col selection:bg-[#03A695] selection:text-white">
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
          <footer className="py-4 px-6 border-t border-[#E2E8F0] bg-white text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-slate-700">
              TECHNO TALENT FEAST 2026 — Powered by TechnoSchool
            </span>
            <span>
              Dubai Grand Finale (4 Nov 2026 at EIBFS) • 2-Role Event Management & Scoring Engine
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
};
