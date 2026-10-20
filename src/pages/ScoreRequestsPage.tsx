import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  FileEdit,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Search,
  Filter,
  ShieldAlert,
  Award,
  Users,
  Building2,
  Calendar,
  MessageSquare,
  Lock,
  Unlock,
  Check,
  Scale,
  Sparkles,
  School as SchoolIcon,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { getNormalizedTeamMembers } from '../utils/studentUtils';

export const ScoreRequestsPage: React.FC = () => {
  const { participants, respondToScoreEditRequest, navigate } = useApp();

  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'>('ALL');
  const [filterTieOnly, setFilterTieOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestTeam, setSelectedRequestTeam] = useState<any | null>(null);
  const [responseAction, setResponseAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [responseRemarks, setResponseRemarks] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  // Extract all teams that have ever had a score edit request
  const teamsWithRequests = useMemo(() => {
    return participants.filter((p) => {
      return p.scoreEditRequest && p.scoreEditRequest.status && p.scoreEditRequest.status !== 'NONE';
    });
  }, [participants]);

  const filteredRequests = useMemo(() => {
    return teamsWithRequests.filter((team) => {
      const status = team.scoreEditRequest?.status || 'NONE';
      const matchesStatus = filterStatus === 'ALL' || status === filterStatus;
      
      const isTieResolution = team.tieBreakNotice?.active || /tie/i.test(team.scoreEditRequest?.reason || '');
      if (filterTieOnly && !isTieResolution) return false;

      const q = searchQuery.toLowerCase();
      const uniqueId = (team.teamId || team.participantId || '').toLowerCase();
      const school = (team.schoolName || '').toLowerCase();
      const members = getNormalizedTeamMembers(team).map((m) => m.name.toLowerCase()).join(' ');
      const judge = (team.scoreEditRequest?.requestedByJudgeName || team.evaluatedByJudgeName || '').toLowerCase();
      const reason = (team.scoreEditRequest?.reason || '').toLowerCase();

      const matchesSearch =
        !q ||
        uniqueId.includes(q) ||
        school.includes(q) ||
        members.includes(q) ||
        judge.includes(q) ||
        reason.includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [teamsWithRequests, filterStatus, filterTieOnly, searchQuery]);

  const pendingCount = teamsWithRequests.filter((t) => t.scoreEditRequest?.status === 'PENDING').length;
  const approvedCount = teamsWithRequests.filter((t) => t.scoreEditRequest?.status === 'APPROVED').length;
  const completedCount = teamsWithRequests.filter((t) => t.scoreEditRequest?.status === 'COMPLETED').length;
  const tieResolutionsCount = teamsWithRequests.filter(
    (t) => t.tieBreakNotice?.active || /tie/i.test(t.scoreEditRequest?.reason || '')
  ).length;

  const handleOpenActionModal = (team: any, action: 'APPROVE' | 'REJECT') => {
    setSelectedRequestTeam(team);
    setResponseAction(action);
    const isTie = team.tieBreakNotice?.active || /tie/i.test(team.scoreEditRequest?.reason || '');
    setResponseRemarks(
      action === 'APPROVE'
        ? isTie
          ? 'Approved for official tie-break score recalibration.'
          : 'Approved for one-time score recalibration.'
        : 'Score remains certified in accordance with official competition rubrics.'
    );
  };

  const handleConfirmResponse = async () => {
    if (!selectedRequestTeam) return;
    setIsResponding(true);

    try {
      await respondToScoreEditRequest(
        selectedRequestTeam.teamId || selectedRequestTeam.participantId,
        responseAction,
        responseRemarks
      );
      setSelectedRequestTeam(null);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in font-sans pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#03A695] to-[#0B2545] text-white flex items-center justify-center shrink-0 shadow-md">
            <FileEdit className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                Score Edit Requests Desk
              </h1>
              {pendingCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                  {pendingCount} Pending Review
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                  All Up-To-Date
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Manage score edit requests submitted by competition Jurors. When approved, the Juror is granted single-use
              permission to recalibrate marks, which automatically re-locks upon submission.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => navigate('tie-breaks')}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-300"
          >
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>Category Tie Alerts</span>
          </button>
          <button
            onClick={() => navigate('results')}
            className="px-3.5 py-2 rounded-xl bg-[#03A695] hover:bg-[#007A6E] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Official Standings</span>
          </button>
        </div>
      </div>

      {/* 2. Responsive KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Pending */}
        <div
          onClick={() => {
            setFilterStatus('PENDING');
            setFilterTieOnly(false);
          }}
          className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs ${
            filterStatus === 'PENDING' ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Approval
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {pendingCount}
          </div>
        </div>

        {/* Card 2: Approved / Unlocked */}
        <div
          onClick={() => {
            setFilterStatus('APPROVED');
            setFilterTieOnly(false);
          }}
          className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs ${
            filterStatus === 'APPROVED' ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Unlocked for Edit
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Unlock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {approvedCount}
          </div>
        </div>

        {/* Card 3: Completed */}
        <div
          onClick={() => {
            setFilterStatus('COMPLETED');
            setFilterTieOnly(false);
          }}
          className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs ${
            filterStatus === 'COMPLETED' ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Re-Evaluated
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {completedCount}
          </div>
        </div>

        {/* Card 4: Tie-Break Resolutions */}
        <div
          onClick={() => setFilterTieOnly(!filterTieOnly)}
          className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-xs ${
            filterTieOnly ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Tie Resolutions
            </span>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {tieResolutionsCount}
          </div>
        </div>
      </div>

      {/* 3. Filters and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Unique ID, student name, school, juror, reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03A695]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setFilterStatus(st);
                setFilterTieOnly(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterStatus === st && !filterTieOnly
                  ? 'bg-[#0B2545] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'All' : st}
            </button>
          ))}
          <button
            onClick={() => setFilterTieOnly(!filterTieOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
              filterTieOnly
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Scale className="w-3 h-3" />
            <span>Ties Only</span>
          </button>
        </div>
      </div>

      {/* 4. Requests List: Responsive (Desktop Table + Mobile Cards) */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-800">No Score Edit Requests Found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {filterStatus === 'PENDING'
              ? 'All juror mark adjustment requests have been reviewed and addressed.'
              : 'No finalist teams match the selected filter parameters.'}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold">
                    <th className="py-3.5 px-4 min-w-[150px]">Unique Finalist ID</th>
                    <th className="py-3.5 px-4 min-w-[180px]">Student(s) Roster</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Requesting Juror</th>
                    <th className="py-3.5 px-4 text-center min-w-[130px]">Score</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Reason & Type</th>
                    <th className="py-3.5 px-4 text-center min-w-[110px]">Status</th>
                    <th className="py-3.5 px-4 text-right min-w-[120px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((team) => {
                    const req = team.scoreEditRequest;
                    const members = getNormalizedTeamMembers(team);
                    const isPending = req?.status === 'PENDING';
                    const isApproved = req?.status === 'APPROVED';
                    const isCompleted = req?.status === 'COMPLETED';
                    const isRejected = req?.status === 'REJECTED';
                    const isTie = team.tieBreakNotice?.active || /tie/i.test(req?.reason || '');

                    return (
                      <tr key={team.id || team.teamId} className="hover:bg-slate-50/70 transition-colors">
                        {/* 1. Unique ID & School */}
                        <td className="py-4 px-4 align-top">
                          <span className="font-mono font-black text-sm text-[#03A695] block">
                            {team.teamId || team.participantId}
                          </span>
                          <span className="font-bold text-slate-800 text-xs block mt-0.5">
                            {team.schoolName}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {team.categoryName} • P{team.categoryNumber || 1}-0{team.projectNumber || 1}
                          </span>
                        </td>

                        {/* 2. Student(s) Roster - ONLY Student Names */}
                        <td className="py-4 px-4 align-top min-w-[170px]">
                          <div className="space-y-1.5">
                            {members.map((m, idx) => {
                              const cleanName = m.name.replace(/\s*\([^)]*\)/g, '').trim() || m.name;
                              return (
                                <div key={idx} className="flex items-center gap-1.5 text-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#03A695] shrink-0" />
                                  <span className="font-bold text-slate-900 leading-snug">
                                    {cleanName}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        {/* 3. Requesting Juror */}
                        <td className="py-4 px-4 align-top min-w-[160px]">
                          <span className="font-bold text-slate-900 block text-xs">
                            {req?.requestedByJudgeName || team.evaluatedByJudgeName || 'Juror'}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{req?.requestedAt || 'Recent'}</span>
                          </span>
                        </td>

                        {/* 4. Current Score - Premium Non-wrapping Badge */}
                        <td className="py-4 px-4 align-top text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                            <span className="font-mono font-black text-base text-[#0B2545]">
                              {team.finalScore || 0}
                            </span>
                            <span className="font-mono text-xs font-semibold text-slate-400">
                              / 100
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-wider text-[#03A695] bg-[#E6F7F5] px-1.5 py-0.5 rounded border border-teal-200">
                              PTS
                            </span>
                          </div>
                        </td>

                        {/* 5. Reason & Tie Badge */}
                        <td className="py-4 px-4 align-top max-w-xs">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <p className="font-medium text-slate-800 italic">
                              "{req?.reason || 'Score recalibration requested'}"
                            </p>
                            {isTie && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                                <Scale className="w-2.5 h-2.5" /> Tie-Break Resolution
                              </span>
                            )}
                            {req?.reviewRemarks && (
                              <p className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-slate-500">
                                <strong>Admin Note:</strong> {req.reviewRemarks}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* 6. Status */}
                        <td className="py-4 px-4 align-top text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                              isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : isApproved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isCompleted
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-red-100 text-red-800 border border-red-300'
                            }`}
                          >
                            {isPending && <Clock className="w-3 h-3 animate-pulse text-amber-600" />}
                            {isApproved && <Unlock className="w-3 h-3 text-emerald-600" />}
                            {isCompleted && <CheckCircle2 className="w-3 h-3 text-blue-600" />}
                            {isRejected && <XCircle className="w-3 h-3 text-red-600" />}
                            <span>{req?.status}</span>
                          </span>
                        </td>

                        {/* 7. Action */}
                        <td className="py-4 px-4 align-top text-right">
                          {isPending ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenActionModal(team, 'APPROVE')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleOpenActionModal(team, 'REJECT')}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              Processed ({req?.reviewedAt || 'Today'})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View (< 768px) */}
          <div className="md:hidden space-y-4">
            {filteredRequests.map((team) => {
              const req = team.scoreEditRequest;
              const members = getNormalizedTeamMembers(team);
              const isPending = req?.status === 'PENDING';
              const isApproved = req?.status === 'APPROVED';
              const isCompleted = req?.status === 'COMPLETED';
              const isRejected = req?.status === 'REJECTED';
              const isTie = team.tieBreakNotice?.active || /tie/i.test(req?.reason || '');

              return (
                <div
                  key={team.id || team.teamId}
                  className={`bg-white rounded-2xl p-4 border shadow-xs space-y-3 ${
                    isPending ? 'border-amber-300 ring-1 ring-amber-300/40' : 'border-slate-200'
                  }`}
                >
                  {/* Card Header: Unique ID & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-sm text-[#03A695]">
                      {team.teamId || team.participantId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                        isPending
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isCompleted
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {req?.status}
                    </span>
                  </div>

                  {/* School & Category with Score Badge */}
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{team.schoolName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {team.categoryName} • P{team.categoryNumber || 1}-0{team.projectNumber || 1}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/90 text-xs shrink-0 shadow-2xs">
                      <span className="font-mono font-black text-slate-900">{team.finalScore || 0}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">/ 100</span>
                      <span className="text-[8px] font-black uppercase tracking-wider text-[#03A695] bg-[#E6F7F5] px-1 py-0.5 rounded border border-teal-200">
                        PTS
                      </span>
                    </div>
                  </div>

                  {/* Student Finalists - ONLY Names */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Student Finalist{members.length > 1 ? 's' : ''}:
                    </span>
                    <div className="font-bold text-slate-800 leading-relaxed">
                      {members.map((m) => m.name.replace(/\s*\([^)]*\)/g, '').trim()).join(', ')}
                    </div>
                  </div>

                  {/* Reason & Juror */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Juror: <strong>{req?.requestedByJudgeName || team.evaluatedByJudgeName}</strong></span>
                      <span>{req?.requestedAt}</span>
                    </div>
                    <div className="italic text-slate-800 font-medium">
                      "{req?.reason}"
                    </div>
                    {isTie && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">
                        <Scale className="w-2.5 h-2.5" /> Tie-Break Resolution
                      </span>
                    )}
                  </div>

                  {/* Mobile Actions */}
                  {isPending && (
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenActionModal(team, 'APPROVE')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept (Unlock 1 Edit)</span>
                      </button>
                      <button
                        onClick={() => handleOpenActionModal(team, 'REJECT')}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 5. Modal for Reviewing and Approving/Rejecting */}
      {selectedRequestTeam && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequestTeam(null)}
          title={
            responseAction === 'APPROVE'
              ? 'Accept Mark Edit Request'
              : 'Decline Mark Edit Request'
          }
        >
          <div className="space-y-4">
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                responseAction === 'APPROVE'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-red-50 border-red-200 text-red-950'
              }`}
            >
              {responseAction === 'APPROVE' ? (
                <Unlock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs leading-relaxed">
                {responseAction === 'APPROVE' ? (
                  <>
                    <span className="font-bold">Grant 1-Time Edit: </span>
                    Approving this request will immediately unlock Team{' '}
                    <strong className="font-mono">{selectedRequestTeam.teamId || selectedRequestTeam.participantId}</strong>{' '}
                    for Juror{' '}
                    <strong>{selectedRequestTeam.scoreEditRequest?.requestedByJudgeName || selectedRequestTeam.evaluatedByJudgeName}</strong>{' '}
                    to modify marks. Upon re-submission, marks will re-lock automatically.
                  </>
                ) : (
                  <>
                    <span className="font-bold">Maintain Certified Marks: </span>
                    Declining will keep the official score locked at{' '}
                    <strong>{selectedRequestTeam.finalScore} / 100</strong> and notify the Juror.
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Team & Juror Reason
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div>
                  <span className="text-slate-500 font-semibold">Unique ID: </span>
                  <span className="font-mono font-black text-slate-900">
                    {selectedRequestTeam.teamId || selectedRequestTeam.participantId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Student(s): </span>
                  <span className="font-bold text-slate-900">
                    {getNormalizedTeamMembers(selectedRequestTeam).map((m) => m.name).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Juror Request Reason: </span>
                  <span className="font-medium italic text-slate-800">
                    "{selectedRequestTeam.scoreEditRequest?.reason}"
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Administrative Remarks
              </label>
              <textarea
                value={responseRemarks}
                onChange={(e) => setResponseRemarks(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]"
                placeholder="Official note to juror..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRequestTeam(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResponse}
                disabled={isResponding}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  responseAction === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isResponding ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm {responseAction === 'APPROVE' ? 'Approval' : 'Rejection'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
