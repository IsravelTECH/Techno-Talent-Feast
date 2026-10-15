import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
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
  Clock
} from 'lucide-react';

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
    participants.filter(p => p.status === 'SUBMITTED' || p.status === 'EVALUATED').length;
  const pendingEvaluationsCount = dashboardStats?.pendingEvaluations ?? 
    Math.max(0, totalTeamsCount - completedEvaluationsCount);
  const scoringPercentage = dashboardStats?.scoringProgress ?? 
    (totalTeamsCount > 0 ? Math.round((completedEvaluationsCount / totalTeamsCount) * 100) : 0);
  const totalSchoolsCount = dashboardStats?.totalSchools ?? (schools.length > 0 ? schools.length : 6);
  const totalJudgesCount = dashboardStats?.totalJudges ?? (judges.length > 0 ? judges.length : 8);
  const totalProjectsCount = allProjects.length > 0 ? allProjects.length : 24;
  const totalCategoriesCount = competitions.length > 0 ? competitions.length : 6;

  // Dynamic School Performance Leaderboard
  const dynamicSchools = useMemo(() => {
    return schools.map((school) => {
      const schoolTeams = participants.filter(
        p => p.schoolId === school.id || p.schoolName?.toLowerCase() === school.name?.toLowerCase()
      );
      const evaluatedTeams = schoolTeams.filter(p => (p.finalScore || 0) > 0);
      const dynamicAvg = evaluatedTeams.length > 0
        ? Math.round(evaluatedTeams.reduce((sum, t) => sum + (t.finalScore || 0), 0) / evaluatedTeams.length)
        : school.averageScore || 0;

      return {
        ...school,
        totalParticipants: schoolTeams.length || school.totalParticipants,
        averageScore: dynamicAvg
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
        participantName: p.name,
        schoolName: p.schoolName,
        score: p.finalScore || 0,
        competitionName: p.categoryName || 'Innovation Challenge'
      }));
    }

    return leaderboard.slice(0, 3);
  }, [participants, leaderboard]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Banner & Status */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F7F5] border border-teal-200 flex items-center justify-center text-[#03A695] shrink-0 shadow-xs">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                {greeting}, {currentUser?.name || 'Administrator'}
              </h1>
              <Badge variant="live" dot>
                LIVE EVENT
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 flex-wrap">
              <span className="font-bold text-[#03A695]">{selectedEvent?.name || 'Techno Talent Feast 2026'}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {dynamicLiveDate}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-medium">{selectedEvent?.venue || 'EIBFS Dubai'}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 text-[#03A695] ${isLoadingData ? 'animate-spin' : ''}`} />}
            onClick={() => refreshData()}
            className="cursor-pointer font-bold shadow-xs hover:border-teal-300"
          >
            <span>{isLoadingData ? 'Syncing...' : 'Sync Live Data'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<FolderKanban className="w-4 h-4" />}
            onClick={() => navigate('projects')}
            className="cursor-pointer shadow-xs"
          >
            <span>Projects ({totalProjectsCount})</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Award className="w-4 h-4" />}
            onClick={() => navigate('assignments')}
            className="cursor-pointer shadow-xs"
          >
            <span>Judge Assignments</span>
          </Button>
        </div>
      </div>

      {/* Core Administration Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          onClick={() => navigate('projects')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#03A695] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F5] text-[#03A695] flex items-center justify-center font-black group-hover:bg-[#03A695] group-hover:text-white transition-colors">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#03A695] transition-colors">
                {totalProjectsCount} Championship Projects
              </h4>
              <p className="text-[11px] text-slate-500">
                {totalCategoriesCount} Categories • Full Engineering Rubrics
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#03A695] group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => navigate('assignments')}
          className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#FD5E01] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FD5E01] flex items-center justify-center font-black group-hover:bg-[#FD5E01] group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#FD5E01] transition-colors">
                {totalJudgesCount} Jurors Assigned
              </h4>
              <p className="text-[11px] text-slate-500">
                {assignments.length} Matchings • Conflict-Free Arena Allocation
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#FD5E01] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Primary KPI Stat Cards (All White Backgrounds) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Participants"
          value={totalTeamsCount.toLocaleString()}
          subtitle="Verified Finalist Teams"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: `${completedEvaluationsCount} Scored`, isPositive: true }}
          onClick={() => navigate('participants')}
        />
        <StatCard
          title="Schools"
          value={totalSchoolsCount.toLocaleString()}
          subtitle="Participating Delegations"
          icon={<Building2 className="w-5 h-5" />}
          onClick={() => navigate('schools')}
        />
        {/* Project Card: Clean White Background matching all cards */}
        <StatCard
          title={`Projects (${totalProjectsCount})`}
          value={totalProjectsCount.toString()}
          subtitle={`${totalCategoriesCount} Categories Spectrum`}
          icon={<FolderKanban className="w-5 h-5 text-[#03A695]" />}
          highlight={false}
          onClick={() => navigate('projects')}
        />
        <StatCard
          title="Active Judges"
          value={totalJudgesCount.toLocaleString()}
          subtitle={`${assignments.length} Arena Matchings`}
          icon={<Award className="w-5 h-5 text-[#FD5E01]" />}
          onClick={() => navigate('assignments')}
        />
        <StatCard
          title="Scoring Progress"
          value={`${scoringPercentage}%`}
          subtitle={`${completedEvaluationsCount}/${totalTeamsCount} Evaluations`}
          icon={<Activity className="w-5 h-5 text-[#03A695]" />}
          onClick={() => navigate('competitions')}
        />
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Competition Overview & Progress */}
        <div className="lg:col-span-8 space-y-6">
          {/* Competitions Progress Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#03A695]" />
                  <span>Live Competition Progress</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluation progress across active competition categories
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('competitions')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                View All {competitions.length}
              </Button>
            </div>

            <div className="space-y-4">
              {competitions.slice(0, 5).map((comp) => {
                // Compute category team progress dynamically
                const catTeams = participants.filter(
                  p => String(p.category) === String(comp.id) || 
                       String(p.category) === String(comp.categoryNumber) || 
                       p.categoryName?.toLowerCase() === comp.name?.toLowerCase() ||
                       p.category === comp.name
                );
                const total = catTeams.length > 0 ? catTeams.length : (comp.registeredCount || 1);
                const completed = catTeams.length > 0 
                  ? catTeams.filter(p => p.status === 'SUBMITTED' || p.status === 'EVALUATED').length 
                  : (comp.completedCount || 0);
                const percentage = Math.min(100, Math.round((completed / total) * 100));

                return (
                  <div
                    key={comp.id}
                    onClick={() => navigate('competitions', { compId: comp.id })}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-teal-200 bg-[#F7FCFB]/60 hover:bg-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#E6F7F5] text-[#03A695] flex items-center justify-center font-bold text-xs group-hover:bg-[#03A695] group-hover:text-white transition-colors">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#03A695] transition-colors">
                            {comp.name}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            {comp.category || comp.name} • {comp.venueHall}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900">
                          {completed}/{total}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1 font-semibold">
                          ({percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-[#03A695] to-[#FD5E01] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* School Performance Leaderboard */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#FD5E01]" />
                  <span>Top Performing Schools</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregate score averages and podium medal tallies
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

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">School Name</th>
                    <th className="pb-3 text-center">Participants</th>
                    <th className="pb-3 text-center">Medals (G/S/B)</th>
                    <th className="pb-3 text-right pr-2">Average Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {dynamicSchools.slice(0, 4).map((school, index) => (
                    <tr
                      key={school.id}
                      onClick={() => navigate('schools', { schoolId: school.id })}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pl-2">
                        <span
                          className={`w-6 h-6 rounded-lg inline-flex items-center justify-center font-black text-xs ${
                            index === 0
                              ? 'bg-amber-100 text-amber-800'
                              : index === 1
                              ? 'bg-slate-200 text-slate-700'
                              : index === 2
                              ? 'bg-orange-100 text-orange-800'
                              : 'text-slate-500'
                          }`}
                        >
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        {school.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {school.city}, {school.state}
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-600 font-semibold">
                        {school.totalParticipants}
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center gap-1 font-bold">
                          <span className="text-amber-500">🥇{school.goldMedals || 0}</span>
                          <span className="text-slate-400">🥈{school.silverMedals || 0}</span>
                          <span className="text-amber-700">🥉{school.bronzeMedals || 0}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2 font-black text-[#03A695] text-sm">
                        {school.averageScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Live Scoring Activity & Leaderboard Podium */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Scoring Activity Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FD5E01] animate-ping" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Live Scoring Feed
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Realtime</span>
            </div>

            <div className="space-y-3.5">
              {scoringActivities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7FCFB] border border-slate-100/80 hover:border-teal-200 transition-all text-xs"
                >
                  <UserAvatar name={act.judgeName} size="sm" variant="color" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium leading-tight">
                      <strong className="text-slate-900 font-bold">{act.judgeName}</strong>{' '}
                      {act.action}{' '}
                      <strong className="text-[#03A695] font-bold">{act.participantName}</strong>
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[11px]">
                      <span className="text-slate-500 font-semibold">{act.competitionName}</span>
                      {act.score && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                          {act.score}/100
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {act.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4 text-xs font-bold"
              onClick={() => navigate('results')}
            >
              View All Evaluation Records →
            </Button>
          </div>

          {/* Top Leaderboard Podium Preview (Clean White Card Layout) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-[#FD5E01]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Leaderboard Podium
                </h3>
              </div>
              <Badge variant="orange" size="sm">
                Top Ranks
              </Badge>
            </div>

            <div className="space-y-3">
              {dynamicPodium.slice(0, 3).map((item, idx) => (
                <div
                  key={item.participantId}
                  onClick={() => navigate('participant-detail', { partId: item.participantId })}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[#F7FCFB] hover:bg-[#E6F7F5] border border-slate-100/80 hover:border-teal-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800 border border-slate-300'
                          : 'bg-orange-100 text-orange-900 border border-orange-300'
                      }`}
                    >
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#03A695] transition-colors leading-tight">
                        {item.participantName}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                        {item.schoolName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
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
