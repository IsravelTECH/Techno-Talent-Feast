import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  Users,
  Building2,
  Trophy,
  Activity,
  ArrowRight,
  ChevronRight,
  Medal,
  Award,
  FolderKanban,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  Layers,
  MapPin,
  ExternalLink,
  Scale
} from 'lucide-react';

function formatRelativeTime(dateStrOrTimestamp?: string): string {
  if (!dateStrOrTimestamp) return 'Just now';
  const parsed = new Date(dateStrOrTimestamp);
  if (isNaN(parsed.getTime())) {
    return dateStrOrTimestamp;
  }
  const now = Date.now();
  const diffSec = Math.floor((now - parsed.getTime()) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    selectedEvent,
    competitions,
    schools,
    participants,
    judges,
    assignments,
    projects: allProjects,
    dashboardStats,
    leaderboard,
    scoringActivities,
    navigate,
    refreshData,
    isLoadingData
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  // Background Live Sync Heartbeat: keeps admin view fresh every 20 seconds silently
  useEffect(() => {
    refreshData({ silent: true });
    const interval = setInterval(() => {
      refreshData({ silent: true });
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic Time-aware Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Dynamic Live Calendar Date
  const dynamicLiveDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());
  }, []);

  // Live Dynamic Statistics from MongoDB Atlas & App Context
  const totalTeamsCount = dashboardStats?.totalTeams ?? (participants.length > 0 ? participants.length : 8);
  const completedEvaluationsCount = dashboardStats?.completedEvaluations ?? 
    participants.filter(p => p.status === 'SUBMITTED' || p.status === 'EVALUATED' || (p.finalScore || 0) > 0).length;
  const pendingEvaluationsCount = dashboardStats?.pendingEvaluations ?? 
    Math.max(0, totalTeamsCount - completedEvaluationsCount);
  const scoringPercentage = dashboardStats?.scoringProgress ?? 
    (totalTeamsCount > 0 ? Math.round((completedEvaluationsCount / totalTeamsCount) * 100) : 0);
  const totalSchoolsCount = dashboardStats?.totalSchools ?? (schools.length > 0 ? schools.length : 6);
  const totalJudgesCount = dashboardStats?.totalJudges ?? (judges.length > 0 ? judges.length : 8);
  const totalProjectsCount = allProjects.length > 0 ? allProjects.length : 24;
  const totalCategoriesCount = competitions.length > 0 ? competitions.length : 6;

  // Accurate students headcount
  const totalStudentsCount = useMemo(() => {
    return participants.reduce((sum, p) => {
      if (p.teamSize && p.teamSize > 0) return sum + p.teamSize;
      const count = p.teamMembers?.length || 0;
      return sum + (count > 0 ? count + 1 : 1);
    }, 0);
  }, [participants]);

  // Dynamic 6-Category Competition Progress across championship categories
  const dynamicCompetitionProgress = useMemo(() => {
    return competitions.map((comp) => {
      // Find all participants matching this category dynamically
      const catTeams = participants.filter((p) => {
        const matchesNum = comp.categoryNumber && p.categoryNumber === comp.categoryNumber;
        const matchesCompId = comp.id && (p.competitionId === comp.id || p.category === comp.id);
        const matchesName = comp.name && (
          (p.categoryName && p.categoryName.toLowerCase() === comp.name.toLowerCase()) ||
          (p.category && p.category.toLowerCase() === comp.name.toLowerCase())
        );
        return Boolean(matchesNum || matchesCompId || matchesName);
      });

      const total = catTeams.length > 0 ? catTeams.length : (comp.registeredCount || 0);
      const evaluatedTeams = catTeams.filter(
        (p) => p.status === 'SUBMITTED' || p.status === 'EVALUATED' || (p.finalScore && p.finalScore > 0)
      );
      const completed = evaluatedTeams.length > 0 ? evaluatedTeams.length : (comp.completedCount || 0);
      const pending = Math.max(0, total - completed);
      const percentage = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

      // Dynamic Category Average Score from live evaluations
      const categoryAvg = evaluatedTeams.length > 0
        ? Math.round(evaluatedTeams.reduce((sum, t) => sum + (t.finalScore || 0), 0) / evaluatedTeams.length)
        : null;

      // Dynamic Assigned Judges Count
      const assignedJudges = judges.filter((j) =>
        j.assignedCategories?.includes(comp.categoryNumber) ||
        assignments.some((a) => a.judgeId === j.id && a.categoryNumber === comp.categoryNumber)
      );

      const status: 'COMPLETED' | 'IN_PROGRESS' | 'AWAITING' =
        percentage === 100 && total > 0 ? 'COMPLETED' : percentage > 0 ? 'IN_PROGRESS' : 'AWAITING';

      return {
        ...comp,
        total,
        completed,
        pending,
        percentage,
        categoryAvg,
        assignedJudgesCount: assignedJudges.length || 2,
        status
      };
    });
  }, [competitions, participants, judges, assignments]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (categoryFilter === 'COMPLETED') {
      return dynamicCompetitionProgress.filter((c) => c.status === 'COMPLETED');
    }
    if (categoryFilter === 'IN_PROGRESS') {
      return dynamicCompetitionProgress.filter((c) => c.status === 'IN_PROGRESS');
    }
    return dynamicCompetitionProgress;
  }, [dynamicCompetitionProgress, categoryFilter]);

  // Real-time dynamic scoring feed synthesized from MongoDB activities & live evaluated participants
  const dynamicScoringActivities = useMemo(() => {
    const combined: Array<{
      id: string;
      judgeName: string;
      judgeAvatar?: string;
      action: string;
      participantName: string;
      participantId?: string;
      teamId?: string;
      categoryNumber?: number;
      competitionName: string;
      score?: number;
      percentage?: number;
      timestamp: string;
      timeAgo: string;
      createdAt?: string;
    }> = [];

    const seenKeys = new Set<string>();

    // 1. Add records from backend scoringActivities
    if (scoringActivities && scoringActivities.length > 0) {
      scoringActivities.forEach((act) => {
        const idKey = act.teamId || act.participantId || `${act.judgeName}-${act.participantName}`;
        if (!seenKeys.has(idKey)) {
          seenKeys.add(idKey);
          combined.push({
            ...act,
            timeAgo: act.createdAt ? formatRelativeTime(act.createdAt) : (act.timeAgo || act.timestamp || 'Just now')
          });
        }
      });
    }

    // 2. Synthesize entries from evaluated participants not yet in the activity collection
    const evaluatedParticipants = participants.filter(
      (p) => (p.finalScore && p.finalScore > 0) || p.status === 'SUBMITTED' || p.status === 'EVALUATED'
    );

    evaluatedParticipants.forEach((p) => {
      const matchId = p.teamId || p.participantId || p.id;
      if (!seenKeys.has(matchId)) {
        seenKeys.add(matchId);
        const judgeName = p.evaluatedByJudgeName || 'Official Juror';
        combined.push({
          id: `eval-${p.id}`,
          judgeName: judgeName,
          judgeAvatar: '',
          action: 'submitted marks for',
          participantName: p.teamName || p.name,
          participantId: p.id,
          teamId: p.teamId || p.participantId,
          categoryNumber: p.categoryNumber,
          competitionName: p.categoryName || p.competitionName || `Category ${p.categoryNumber}`,
          score: p.finalScore,
          percentage: p.percentage || p.finalScore,
          timestamp: p.evaluatedTimestamp || p.submissionTimestamp || 'Recent',
          timeAgo: p.evaluatedTimestamp ? formatRelativeTime(p.evaluatedTimestamp) : 'Recent',
          createdAt: p.evaluatedTimestamp || p.submissionTimestamp
        });
      }
    });

    return combined.slice(0, 7);
  }, [scoringActivities, participants]);

  // Dynamic School Performance Leaderboard with computed medals
  const dynamicSchools = useMemo(() => {
    return schools.map((school) => {
      const schoolTeams = participants.filter(
        p => p.schoolId === school.id || p.schoolName?.toLowerCase() === school.name?.toLowerCase()
      );
      const evaluatedTeams = schoolTeams.filter(p => (p.finalScore || 0) > 0);
      const dynamicAvg = evaluatedTeams.length > 0
        ? Math.round(evaluatedTeams.reduce((sum, t) => sum + (t.finalScore || 0), 0) / evaluatedTeams.length)
        : school.averageScore || 0;

      const goldMedals = evaluatedTeams.filter((t) => (t.finalScore || 0) >= 95).length;
      const silverMedals = evaluatedTeams.filter((t) => (t.finalScore || 0) >= 90 && (t.finalScore || 0) < 95).length;
      const bronzeMedals = evaluatedTeams.filter((t) => (t.finalScore || 0) >= 85 && (t.finalScore || 0) < 90).length;

      return {
        ...school,
        totalParticipants: schoolTeams.length || school.totalParticipants,
        totalStudentsCount: schoolTeams.reduce((acc, t) => acc + (t.teamSize || 2), 0),
        averageScore: dynamicAvg,
        goldMedals: goldMedals || school.goldMedals || 0,
        silverMedals: silverMedals || school.silverMedals || 0,
        bronzeMedals: bronzeMedals || school.bronzeMedals || 0
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  }, [schools, participants]);

  // Dynamic Top 3 Leaderboard Podium from Evaluated Teams
  const dynamicPodium = useMemo(() => {
    const evaluated = participants
      .filter(p => (p.finalScore || 0) > 0)
      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

    if (evaluated.length >= 3) {
      return evaluated.slice(0, 3).map((p) => ({
        participantId: p.id,
        participantName: p.teamName || p.name,
        schoolName: p.schoolName,
        score: p.finalScore || 0,
        competitionName: p.categoryName || 'Innovation Challenge'
      }));
    }

    return leaderboard.slice(0, 3);
  }, [participants, leaderboard]);

  // Real-time calculation of tied teams count
  const tiedTeamsCount = useMemo(() => {
    const map = new Map<string, number>();
    participants.forEach((p) => {
      const isSub = p.status === 'SUBMITTED' || p.isScoreLocked;
      if (isSub && typeof p.finalScore === 'number' && p.finalScore > 0) {
        const k = `${p.categoryNumber || 1}_${p.finalScore}`;
        map.set(k, (map.get(k) || 0) + 1);
      }
    });
    let count = 0;
    map.forEach((cnt) => {
      if (cnt >= 2) count += cnt;
    });
    return count;
  }, [participants]);

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* 1. EXECUTIVE LIVE HERO BANNER */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#03A695] to-[#0B2545] text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight truncate">
                {greeting}, {currentUser?.name || 'Administrator'}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Event
              </span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 text-xs text-slate-600 flex-wrap">
              <span className="font-extrabold text-[#03A695] truncate">{selectedEvent?.name || 'Techno Talent Fest 2026'}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-slate-500 font-medium shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {dynamicLiveDate}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium truncate">{selectedEvent?.venue || 'EIBFS Dubai'}</span>
            </div>
          </div>
        </div>

        {/* Live Controls: Sync & Official Standings */}
        <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto shrink-0">
          <button
            onClick={() => refreshData()}
            className="px-3.5 py-2 rounded-xl bg-[#F7FCFB] hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 hover:text-[#03A695] text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            title="Refresh Live Cloud Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#03A695] ${isLoadingData ? 'animate-spin' : ''}`} />
            <span>{isLoadingData ? 'Syncing...' : 'Live Sync'}</span>
          </button>

          <button
            onClick={() => navigate('results')}
            className="px-3.5 py-2 rounded-xl bg-[#03A695] hover:bg-[#007A6E] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Standings</span>
          </button>
        </div>
      </div>

      {/* Sleek Tie Alert Pill (Only shown if ties exist) */}
      {tiedTeamsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/80 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                  Same-Category Tie Alert
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono font-black text-[10px]">
                  {tiedTeamsCount} Finalists Tied
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5">
                Identical marks detected across competition categories. Administrative action available to review and notify Jurors.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('tie-breaks')}
            className="px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#172B4D] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 self-stretch sm:self-auto justify-center cursor-pointer active:scale-95"
          >
            <span>Review & Resolve Ties ({tiedTeamsCount})</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FD5E01]" />
          </button>
        </div>
      )}

      {/* 2. BALANCED 4-CARD RESPONSIVE KPI STRIP (2x2 on Mobile, 4x1 on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {/* Card 1: Finalist Teams */}
        <div
          onClick={() => navigate('participants')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 truncate">
              Finalist Teams
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-50 text-[#03A695] flex items-center justify-center shrink-0 border border-teal-100 group-hover:bg-[#03A695] group-hover:text-white transition-colors">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              {totalTeamsCount} Teams
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 truncate">
              {totalStudentsCount} Students Enrolled
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#03A695]">
            <span>View Roster</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Enrolled Schools */}
        <div
          onClick={() => navigate('schools')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 truncate">
              Enrolled Schools
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              {totalSchoolsCount} Schools
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 truncate">
              100% Institutional Attendance
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600">
            <span>Manage Schools</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Arenas & Projects */}
        <div
          onClick={() => navigate('projects')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 truncate">
              Arenas & Projects
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FolderKanban className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              {totalCategoriesCount} Categories
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 truncate">
              {totalProjectsCount} Championship Entries
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-600">
            <span>Engineering Rubrics</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Evaluation Progress */}
        <div
          onClick={() => navigate('competitions')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 truncate">
              Scoring Progress
            </span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-orange-50 text-[#FD5E01] flex items-center justify-center shrink-0 border border-orange-100 group-hover:bg-[#FD5E01] group-hover:text-white transition-colors">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
              {scoringPercentage}% Scored
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1 truncate">
              {completedEvaluationsCount}/{totalTeamsCount} Evaluated • {pendingEvaluationsCount} Pending
            </p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#FD5E01]">
            <span>Live Monitor</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTION SHORTCUT CHIPS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
        <button
          onClick={() => navigate('competitions')}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-[#03A695]" />
          <span>All Arenas ({totalCategoriesCount})</span>
        </button>

        <button
          onClick={() => navigate('assignments')}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Award className="w-3.5 h-3.5 text-[#FD5E01]" />
          <span>Juror Roster ({totalJudgesCount})</span>
        </button>

        <button
          onClick={() => navigate('projects')}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
          <span>Rubrics Builder</span>
        </button>

        <button
          onClick={() => navigate('results')}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Medal className="w-3.5 h-3.5 text-amber-500" />
          <span>Results & Standings</span>
        </button>
      </div>

      {/* 4. MAIN 2-COLUMN WORKSPACE (7 Cols / 5 Cols on Desktop • Stacked on Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT COLUMN: 7 Columns on LG */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          {/* SECTION A: LIVE COMPETITION ARENAS (6 Tracks) */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#03A695]" />
                    <span>Live Competition Arenas</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#03A695] border border-teal-200">
                    6 Championship Tracks
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live juror evaluations, score averages, and arena completion progress
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  All ({dynamicCompetitionProgress.length})
                </button>
                <button
                  onClick={() => setCategoryFilter('IN_PROGRESS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === 'IN_PROGRESS'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Live
                </button>
                <button
                  onClick={() => setCategoryFilter('COMPLETED')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === 'COMPLETED'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Done
                </button>
              </div>
            </div>

            {/* Arenas Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredCategories.map((comp) => {
                return (
                  <div
                    key={comp.id}
                    onClick={() => navigate('competitions', { compId: comp.id })}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-teal-300 bg-white hover:bg-slate-50/50 transition-all cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#03A695]/10 to-[#0B2545]/10 text-[#03A695] border border-teal-200 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-[#03A695] group-hover:text-white transition-colors">
                            #{comp.categoryNumber || 1}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#03A695] transition-colors truncate">
                              {comp.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                              <span>{comp.venueHall || 'Arena Stage'}</span>
                              <span className="text-slate-300">•</span>
                              <span className="font-semibold text-slate-600">{comp.assignedJudgesCount} Jurors</span>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {comp.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Done
                            </span>
                          ) : comp.status === 'IN_PROGRESS' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              Evaluating
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Scheduled
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Progress Stats */}
                      <div className="flex items-center justify-between text-xs mt-3 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-medium">Evaluations:</span>
                          <span className="font-black text-slate-900">
                            {comp.completed}/{comp.total}
                          </span>
                          <span className="text-[11px] font-bold text-[#03A695]">
                            ({comp.percentage}%)
                          </span>
                        </div>
                        {comp.categoryAvg !== null && (
                          <span className="text-[11px] font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            Avg: <span className="text-[#03A695]">{comp.categoryAvg}%</span>
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#03A695] to-[#FD5E01] rounded-full transition-all duration-500"
                          style={{ width: `${comp.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION B: INSTITUTIONAL DELEGATION STANDINGS (Responsive Card-based showcase) */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#FD5E01]" />
                  <span>Institutional Standings</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Podium rankings, delegation averages, and medals breakdown
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('schools')}
                icon={<ChevronRight className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                Full Standings
              </Button>
            </div>

            {/* School Standings Cards (Replaces rigid table with responsive mobile & desktop cards) */}
            <div className="space-y-3">
              {dynamicSchools.slice(0, 4).map((school, index) => {
                const isLeader = index === 0;

                return (
                  <div
                    key={school.id}
                    onClick={() => navigate('schools', { schoolId: school.id })}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                      isLeader
                        ? 'bg-gradient-to-r from-amber-500/5 via-white to-amber-500/10 border-amber-300 shadow-xs hover:border-amber-400'
                        : 'bg-[#F7FCFB]/60 hover:bg-white border-slate-200/80 hover:border-teal-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Medallion */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${
                          index === 0
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : index === 1
                            ? 'bg-slate-200 text-slate-800 border-slate-300'
                            : index === 2
                            ? 'bg-orange-100 text-orange-900 border-orange-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#03A695] transition-colors truncate">
                            {school.name}
                          </h4>
                          {isLeader && (
                            <span className="hidden sm:inline-block px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
                              Tournament Leader
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#FD5E01] shrink-0" />
                          <span className="truncate">{school.city}, {school.state || 'UAE'}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-[10px] text-slate-400 font-semibold">{school.code}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stats & Medals Pill */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Medals */}
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          🥇 {school.goldMedals || 0}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          🥈 {school.silverMedals || 0}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200">
                          🥉 {school.bronzeMedals || 0}
                        </span>
                      </div>

                      {/* Average Score */}
                      <div className="text-right pl-2 sm:border-l border-slate-100">
                        <span className="text-sm sm:text-base font-black text-[#03A695]">
                          {school.averageScore}%
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Avg Score
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 5 Columns on LG */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          {/* SECTION C: REAL-TIME JUROR SCORING STREAM */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FD5E01] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FD5E01]" />
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Live Scoring Feed
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                <Zap className="w-3 h-3 text-[#03A695]" />
                Live Stream
              </span>
            </div>

            {dynamicScoringActivities.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-[#F7FCFB] border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Awaiting Juror Evaluations</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Live marks will stream here instantly as judges submit scores.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dynamicScoringActivities.map((act) => {
                  const scoreVal = act.score ?? act.percentage ?? 0;
                  const isTopTier = scoreVal >= 90;
                  const isMidTier = scoreVal >= 75;

                  return (
                    <div
                      key={act.id}
                      onClick={() => {
                        if (act.participantId) {
                          navigate('participant-detail', { partId: act.participantId });
                        } else {
                          navigate('results');
                        }
                      }}
                      className="p-3 rounded-2xl bg-[#F7FCFB] border border-slate-100/90 hover:border-teal-300 hover:bg-white hover:shadow-xs transition-all text-xs cursor-pointer group"
                    >
                      <div className="flex items-start gap-2.5">
                        <UserAvatar name={act.judgeName} size="sm" variant="color" />
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 font-medium leading-tight truncate">
                            <strong className="text-slate-900 font-bold">{act.judgeName}</strong>
                            <span className="text-slate-400 mx-1">scored</span>
                            <strong className="text-[#03A695] font-bold group-hover:underline">
                              {act.participantName}
                            </strong>
                          </p>

                          <div className="flex items-center justify-between mt-1.5 gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {act.teamId && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold shrink-0">
                                  {act.teamId}
                                </span>
                              )}
                              <span className="text-[11px] text-slate-500 font-semibold truncate">
                                {act.competitionName}
                              </span>
                            </div>

                            {scoreVal > 0 && (
                              <span
                                className={`px-2 py-0.5 rounded-full font-black text-[11px] shrink-0 border ${
                                  isTopTier
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isMidTier
                                    ? 'bg-teal-50 text-teal-700 border-teal-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {scoreVal}/100
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1.5">
                            <Clock className="w-3 h-3 text-slate-300" />
                            <span>{act.timeAgo}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 text-xs font-bold hover:border-teal-300 hover:text-[#03A695]"
              onClick={() => navigate('results')}
            >
              View Official Scoresheet & Standings →
            </Button>
          </div>

          {/* SECTION D: CHAMPIONSHIP PODIUM HIGHLIGHTS */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-[#FD5E01]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Podium Highlights
                </h3>
              </div>
              <Badge variant="orange" size="sm">
                Top Finalists
              </Badge>
            </div>

            <div className="space-y-2.5">
              {dynamicPodium.slice(0, 3).map((item, idx) => (
                <div
                  key={item.participantId}
                  onClick={() => navigate('participant-detail', { partId: item.participantId })}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F7FCFB] hover:bg-[#E6F7F5] border border-slate-100/80 hover:border-teal-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : 'bg-orange-100 text-orange-900 border border-orange-300'
                      }`}
                    >
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#03A695] transition-colors leading-tight truncate">
                        {item.participantName}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {item.schoolName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-[#03A695]">
                      {item.score}%
                    </span>
                    <span className="text-[10px] text-slate-400 block font-semibold truncate max-w-[90px]">
                      {item.competitionName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('results')}
              className="w-full mt-4 py-2.5 px-4 bg-[#E6F7F5] hover:bg-[#03A695] text-[#03A695] hover:text-white font-extrabold text-xs rounded-xl border border-teal-200 shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>VIEW FULL LEADERBOARD</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
