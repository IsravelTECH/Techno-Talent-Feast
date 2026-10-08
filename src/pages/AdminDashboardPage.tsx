import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Users,
  Building2,
  UserCheck,
  FileCheck,
  Trophy,
  Activity,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Radio,
  ExternalLink,
  ChevronRight,
  Clock,
  Medal,
  Award,
  Layers,
  FolderKanban
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const {
    currentUser,
    selectedEvent,
    competitions,
    schools,
    leaderboard,
    scoringActivities,
    navigate,
    triggerManagerScenario
  } = useApp();

  const totalCompleted = competitions.reduce((acc, c) => acc + c.completedCount, 0);
  const totalPending = competitions.reduce((acc, c) => acc + c.pendingCount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Banner & Status */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] border border-blue-200 flex items-center justify-center text-[#0057B8] shrink-0 shadow-xs">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                Good Morning, {currentUser.name}
              </h1>
              <Badge variant="live" dot>
                LIVE EVENT
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              <strong className="text-[#0057B8]">{selectedEvent.name}</strong> — {selectedEvent.venue} ({selectedEvent.city})
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="orange"
            size="sm"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={triggerManagerScenario}
          >
            Launch Scoring Demo (92%)
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<FolderKanban className="w-4 h-4" />}
            onClick={() => navigate('projects')}
          >
            Projects (24)
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<UserCheck className="w-4 h-4" />}
            onClick={() => navigate('judges')}
          >
            Judges Roster
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Award className="w-4 h-4" />}
            onClick={() => navigate('assignments')}
          >
            Judge Assignments
          </Button>
        </div>
      </div>

      {/* Core Administration Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => navigate('projects')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#0057B8] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0057B8] flex items-center justify-center font-black group-hover:bg-[#0057B8] group-hover:text-white transition-colors">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#0057B8] transition-colors">
                24 Championship Projects
              </h4>
              <p className="text-[11px] text-slate-500">
                4 Projects / Category • Full Specifications
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0057B8] group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => navigate('judges')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#0057B8] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#03A695] flex items-center justify-center font-black group-hover:bg-[#03A695] group-hover:text-white transition-colors">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#03A695] transition-colors">
                Judges & Jurors Roster
              </h4>
              <p className="text-[11px] text-slate-500">
                36 Certified Evaluators • Track Allocations
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#03A695] group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => navigate('assignments')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#F36C21] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F36C21] flex items-center justify-center font-black group-hover:bg-[#F36C21] group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#F36C21] transition-colors">
                Judge & Finalist Assignments
              </h4>
              <p className="text-[11px] text-slate-500">
                6-Step Wizard • Conflict-Free Matching
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#F36C21] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Participants"
          value="1,440"
          subtitle="Grades 1-12 Spectrum"
          icon={<Users className="w-5 h-5" />}
          trend={{ value: "576 Finalists", isPositive: true }}
          onClick={() => navigate('finalists')}
        />
        <StatCard
          title="Schools"
          value="48"
          subtitle="UAE Delegations"
          icon={<Building2 className="w-5 h-5" />}
          onClick={() => navigate('schools')}
        />
        <StatCard
          title="Projects (24)"
          value="24"
          subtitle="4 / Category"
          icon={<FolderKanban className="w-5 h-5 text-[#0057B8]" />}
          highlight={true}
          onClick={() => navigate('projects')}
        />
        <StatCard
          title="Judges Roster"
          value="36"
          subtitle="Arena Jurors"
          icon={<UserCheck className="w-5 h-5 text-[#03A695]" />}
          onClick={() => navigate('judges')}
        />
        <StatCard
          title="Judge Assignments"
          value="576"
          subtitle="Conflict-Free"
          icon={<Award className="w-5 h-5 text-[#F36C21]" />}
          onClick={() => navigate('assignments')}
        />
        <StatCard
          title="Categories (6)"
          value="6"
          subtitle="100-Pt Rubrics"
          icon={<Trophy className="w-5 h-5 text-purple-600" />}
          onClick={() => navigate('categories')}
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
                  <Activity className="w-4 h-4 text-[#0057B8]" />
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
                View All 12
              </Button>
            </div>

            <div className="space-y-4">
              {competitions.slice(0, 5).map((comp) => {
                const total = comp.registeredCount;
                const completed = comp.completedCount;
                const percentage = Math.round((completed / total) * 100);

                return (
                  <div
                    key={comp.id}
                    onClick={() => navigate('competitions', { compId: comp.id })}
                    className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 bg-[#F6F9FD]/60 hover:bg-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#EAF3FF] text-[#0057B8] flex items-center justify-center font-bold text-xs group-hover:bg-[#0057B8] group-hover:text-white transition-colors">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0057B8] transition-colors">
                            {comp.name}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            {comp.category} • {comp.venueHall}
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
                        className="h-full bg-gradient-to-r from-[#0057B8] to-[#F36C21] rounded-full transition-all duration-500"
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
                  <Building2 className="w-4 h-4 text-[#F36C21]" />
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
                  {schools.slice(0, 4).map((school, index) => (
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
                          #{school.rank}
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
                          <span className="text-amber-500">🥇{school.goldMedals}</span>
                          <span className="text-slate-400">🥈{school.silverMedals}</span>
                          <span className="text-amber-700">🥉{school.bronzeMedals}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right pr-2 font-black text-[#0057B8] text-sm">
                        {school.averageScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Live Scoring Activity & Leaderboard Preview */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Scoring Activity Feed */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F36C21] animate-ping" />
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
                  className="flex items-start gap-3 p-3 rounded-2xl bg-[#F6F9FD] border border-slate-100/80 hover:border-blue-200 transition-all text-xs"
                >
                  <img
                    src={act.judgeAvatar}
                    alt={act.judgeName}
                    className="w-8 h-8 rounded-xl object-cover shrink-0 border border-blue-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium leading-tight">
                      <strong className="text-slate-900 font-bold">{act.judgeName}</strong>{' '}
                      {act.action}{' '}
                      <strong className="text-[#0057B8] font-bold">{act.participantName}</strong>
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
              onClick={() => navigate('scoring')}
            >
              Open Active Scoring Desk →
            </Button>
          </div>

          {/* Top Leaderboard Podium Preview */}
          <div className="bg-gradient-to-br from-[#003B7A] to-[#0057B8] text-white p-6 rounded-3xl shadow-xl border border-blue-600 relative overflow-hidden">
            {/* Background sparkle */}
            <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-4">
              <div className="flex items-center gap-2">
                <Medal className="w-5 h-5 text-[#F36C21]" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Leaderboard Podium
                </h3>
              </div>
              <Badge variant="orange" size="sm">
                Top Ranks
              </Badge>
            </div>

            <div className="space-y-3">
              {leaderboard.slice(0, 3).map((item, idx) => (
                <div
                  key={item.participantId}
                  onClick={() => navigate('participant-detail', { partId: item.participantId })}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/10 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-900'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-900'
                          : 'bg-[#F36C21] text-white'
                      }`}
                    >
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {item.participantName}
                      </h4>
                      <p className="text-[10px] text-blue-200 truncate max-w-[130px]">
                        {item.schoolName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-white">
                      {item.score}%
                    </span>
                    <span className="text-[10px] text-blue-200 block font-semibold">
                      {item.competitionName.split(' ')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('leaderboard')}
              className="w-full mt-4 py-2.5 px-4 bg-white hover:bg-blue-50 text-[#003B7A] font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
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
