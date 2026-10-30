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
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { JudgeSinglePageScoring } from './pages/JudgeSinglePageScoring';
import { ScoreRequestsPage } from './pages/ScoreRequestsPage';
import { TieBreaksPage } from './pages/TieBreaksPage';

export const App: React.FC = () => {
  const { currentPage, currentRole, currentUser } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // 1. Standalone Login Page (Default landing page for unauthenticated visitors)
  if (!currentUser || currentPage === 'login') {
    return <LoginPage />;
  }

  // 2. Main Workspace Layout with Sidebar + Header + Dynamic Page Content
  const renderCurrentPage = () => {
    // Strict RBAC Enforcement: Judges can NEVER mount or view Admin components under any circumstances
    if (currentRole === 'judge') {
      if (currentPage === 'profile') {
        return <ProfilePage />;
      }
      return <JudgeSinglePageScoring />;
    }

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
      case 'settings':
        return <ProfilePage />;
      case 'rubrics':
        return <RubricBuilderPage />;
      case 'roles':
        return <UserRolesPage />;
      case 'score-requests':
        return <ScoreRequestsPage />;
      case 'tie-breaks':
        return <TieBreaksPage />;

      // Redirect removed Admin pages and obsolete live route to fallback Admin Dashboard
      case 'reports':
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

      // Judge Navigation Pages
      case 'scoring':
      case 'judge-dashboard':
        return <JudgeSinglePageScoring />;
      case 'judge-assignments':
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
    <div className="h-screen w-screen overflow-hidden bg-[#F7FCFB] flex selection:bg-[#03A695] selection:text-white">
      {/* Sidebar - Fixed to left viewport, never scrolls up with main content */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Content Area - Independent Vertical Scrolling Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          {renderCurrentPage()}
        </main>

        {/* Footer */}
        <footer className="py-4 px-4 sm:px-6 border-t border-[#E2E8F0] bg-white text-center text-[11px] sm:text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 shrink-0">
          <span className="font-semibold text-slate-700">
            TECHNO TALENT FEST 2026 — Powered by TechnoSchool
          </span>
          <span className="text-slate-400 sm:text-slate-500">
            Dubai Grand Finale (4 Nov 2026 at EIBFS) • 2-Role Event Management & Scoring Engine
          </span>
        </footer>
      </div>
    </div>
  );
};
