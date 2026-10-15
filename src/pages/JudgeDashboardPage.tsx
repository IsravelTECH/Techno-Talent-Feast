import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  Users,
  Trophy,
  Clock,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  Hash
} from 'lucide-react';
import { Participant } from '../types';

export const JudgeDashboardPage: React.FC = () => {
  const {
    currentUser,
    participants,
    competitions,
    loadParticipantForScoring,
    lookupTeamById,
    navigate
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchedTeam, setSearchedTeam] = useState<Participant | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Quick stats
  const submittedTeams = participants.filter((p) => p.status === 'SUBMITTED');
  const pendingTeams = participants.filter((p) => p.status !== 'SUBMITTED');

  // Handle Find Team action
  const handleFindTeam = (queryOverride?: string) => {
    const term = (queryOverride !== undefined ? queryOverride : searchQuery).trim();
    setHasSearched(true);
    setSearchError(null);

    if (!term) {
      setSearchError('Please enter a valid Team ID (e.g. TTF26-TEAM-001 or TTF-2026-00421).');
      setSearchedTeam(null);
      return;
    }

    const team = lookupTeamById(term);
    if (team) {
      setSearchedTeam(team);
      setSearchError(null);
    } else {
      setSearchedTeam(null);
      setSearchError(`No team found matching "${term}". Please verify the Team ID on the physical badge or table card.`);
    }
  };

  const handleQuickTest = (teamId: string) => {
    setSearchQuery(teamId);
    handleFindTeam(teamId);
  };

  const handleProceedToScoring = (team: Participant) => {
    loadParticipantForScoring(team.id);
    navigate('scoring', { partId: team.id, compId: team.competitionId });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Juror Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] via-[#03A695] to-[#0B2545] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-400/20">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-[#FF8A3D]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official TTF 2026 Juror Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100">
            {currentUser.organization || 'Dubai Tech Jurors Panel'} • Arena Hall A • 100-Point Official Rubric
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="orange"
            size="md"
            icon={<Award className="w-4 h-4" />}
            onClick={() => navigate('judge-completed')}
          >
            View Completed Submissions ({submittedTeams.length})
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Teams Evaluated</span>
          <h3 className="text-3xl font-black text-emerald-600 mt-1">{submittedTeams.length}</h3>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Locked & Synced to Admin</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Awaiting Scoring</span>
          <h3 className="text-3xl font-black text-[#FD5E01] mt-1">{pendingTeams.length}</h3>
          <span className="text-[11px] text-orange-700 font-semibold mt-1 block">Ready at evaluation desks</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Official Rubric</span>
          <h3 className="text-3xl font-black text-slate-900 mt-1">100 Pts</h3>
          <span className="text-[11px] text-[#03A695] font-semibold mt-1 block">5 Criteria (30/25/20/15/10)</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Central Sync</span>
          <h3 className="text-3xl font-black text-[#03A695] mt-1">LIVE</h3>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Instant Admin scoreboard feed</span>
        </div>
      </div>

      {/* PRIMARY SECTION: Enter Team ID Search Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#03A695] shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FD5E01] animate-ping" />
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                Team Evaluation Desk — Enter Team ID
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the unique Team ID or Student ID from the team badge to retrieve details and enter official marks.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#E6F7F5] text-[#03A695] border border-teal-200 text-xs font-bold self-start sm:self-auto">
            Step 1 of 2: Team Lookup
          </span>
        </div>

        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative flex-1">
            <Hash className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Team ID: e.g. TTF26-TEAM-001 or TTF-2026-00421..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFindTeam();
              }}
              className="w-full pl-12 pr-4 py-3.5 bg-[#F7FCFB] border-2 border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#03A695] focus:bg-white transition-all shadow-inner"
            />
          </div>

          <Button
            variant="orange"
            size="lg"
            icon={<Search className="w-5 h-5" />}
            onClick={() => handleFindTeam()}
            className="sm:px-8 py-3.5 text-sm font-extrabold uppercase tracking-wider"
          >
            Find Team
          </Button>
        </div>

        {/* Quick Testing Helper Badges */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-slate-400 font-bold uppercase text-[11px]">Quick Jump Examples:</span>
          <button
            type="button"
            onClick={() => handleQuickTest('TTF26-TEAM-001')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#E6F7F5] hover:text-[#03A695] hover:border-teal-300 border border-slate-200 text-slate-700 font-mono font-bold transition-all"
          >
            TTF26-TEAM-001 (Rescue Hexapod)
          </button>
          <button
            type="button"
            onClick={() => handleQuickTest('TTF26-TEAM-002')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#E6F7F5] hover:text-[#03A695] hover:border-teal-300 border border-slate-200 text-slate-700 font-mono font-bold transition-all"
          >
            TTF26-TEAM-002 (Delivery Robot)
          </button>
          <button
            type="button"
            onClick={() => handleQuickTest('TTF26-TEAM-003')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#E6F7F5] hover:text-[#03A695] hover:border-teal-300 border border-slate-200 text-slate-700 font-mono font-bold transition-all"
          >
            TTF26-TEAM-003 (AI Waste Sorter)
          </button>
          <button
            type="button"
            onClick={() => handleQuickTest('TTF26-TEAM-008')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-[#FD5E01] hover:border-orange-300 border border-slate-200 text-slate-700 font-mono font-bold transition-all"
          >
            TTF26-TEAM-008 (Traffic AI - Pending)
          </button>
        </div>

        {/* Search Error State */}
        {searchError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-700 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">Team Lookup Unsuccessful</p>
              <p className="mt-0.5">{searchError}</p>
            </div>
          </div>
        )}

        {/* Verified Team Information Card */}
        {searchedTeam && (
          <div className="p-6 rounded-3xl bg-[#F7FCFB] border-2 border-emerald-500 shadow-md animate-fade-in space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-start gap-4">
                <UserAvatar name={searchedTeam.name} size="xl" variant="color" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-extrabold text-xs border border-emerald-300">
                      ID: {searchedTeam.teamId || searchedTeam.participantId}
                    </span>
                    <Badge
                      variant={searchedTeam.status === 'SUBMITTED' ? 'success' : 'orange'}
                      size="sm"
                    >
                      {searchedTeam.status === 'SUBMITTED' ? 'MARKS SUBMITTED' : 'READY FOR SCORING'}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-black text-slate-900">
                    {searchedTeam.teamName || searchedTeam.name}
                  </h3>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-[#03A695]" />
                    {searchedTeam.schoolName} ({searchedTeam.city}) • Grade {searchedTeam.grade}
                  </p>
                </div>
              </div>

              {/* Status & CTA Button */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 shrink-0">
                {searchedTeam.status === 'SUBMITTED' ? (
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-bold block">Current Score</span>
                    <span className="text-2xl font-black text-emerald-600">
                      {searchedTeam.finalScore} / 100 PTS
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Submitted at {searchedTeam.submissionTimestamp || '10:45 AM'}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Pending Evaluation (0/100)
                  </span>
                )}

                <Button
                  variant="orange"
                  size="lg"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                  onClick={() => handleProceedToScoring(searchedTeam)}
                  className="font-extrabold shadow-md"
                >
                  {searchedTeam.status === 'SUBMITTED' ? 'EDIT / RE-ENTER MARKS' : 'PROCEED TO MARK ENTRY'}
                </Button>
              </div>
            </div>

            {/* Team Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Competition Category
                </span>
                <p className="font-extrabold text-slate-900 text-sm">{searchedTeam.categoryName}</p>
                <p className="text-slate-500 text-[11px]">Category {searchedTeam.categoryNumber} Track</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Assigned Project
                </span>
                <p className="font-extrabold text-slate-900 text-sm truncate">{searchedTeam.projectTitle}</p>
                <p className="text-slate-500 text-[11px]">Project #{searchedTeam.projectNumber}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Team Members ({searchedTeam.teamMembers?.length || 1})
                </span>
                <p className="font-extrabold text-slate-900 text-sm truncate">
                  {searchedTeam.teamMembers?.map((m) => m.name).join(', ') || searchedTeam.name}
                </p>
                <p className="text-slate-500 text-[11px]">Grand Finale Delegation</p>
              </div>
            </div>

            {/* Project Synopsis */}
            {searchedTeam.projectSummary && (
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Project Description & Technical Scope
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {searchedTeam.projectSummary}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Evaluated Teams Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Recently Evaluated Teams
            </h2>
            <p className="text-xs text-slate-500">
              Evaluations submitted and synced to administration
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('judge-completed')}>
            View All Submissions
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {submittedTeams.map((team) => (
            <div
              key={team.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors cursor-pointer"
              onClick={() => handleProceedToScoring(team)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-black text-xs flex items-center justify-center shrink-0">
                  {team.finalScore}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-slate-900">{team.teamName || team.name}</h4>
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      {team.teamId || team.participantId}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {team.schoolName} • {team.projectTitle}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-mono font-bold text-slate-400">
                  {team.submissionTimestamp || '10:30 AM'}
                </span>
                <Badge variant="success" size="sm">
                  {team.finalScore} / 100 PTS
                </Badge>
                <Button variant="ghost" size="xs">
                  Review Marks →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
