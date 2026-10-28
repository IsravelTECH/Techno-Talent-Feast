import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TechnoLogo } from '../components/common/TechnoLogo';
import { UserAvatar } from '../components/common/UserAvatar';
import { Modal } from '../components/common/Modal';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Hash,
  LogOut,
  Send,
  ShieldCheck,
  Award,
  RotateCcw,
  Loader2,
  Lock,
  Unlock,
  Clock,
  MessageSquare,
  Users,
  Scale
} from 'lucide-react';
import { Participant } from '../types';
import api from '../services/api';
import { getNormalizedTeamMembers } from '../utils/studentUtils';

interface CriterionItem {
  id: string;
  name: string;
  maxMarks: number;
}

const OFFICIAL_CRITERIA: CriterionItem[] = [
  { id: 'crit-tech', name: 'Technical Execution & Functionality', maxMarks: 30 },
  { id: 'crit-innov', name: 'Innovation & Problem Solving', maxMarks: 25 },
  { id: 'crit-design', name: 'Design & User Experience', maxMarks: 20 },
  { id: 'crit-demo', name: 'Live Demonstration & Student Defense', maxMarks: 15 },
  { id: 'crit-doc', name: 'Documentation & Compliance', maxMarks: 10 }
];

export const JudgeSinglePageScoring: React.FC = () => {
  const {
    currentUser,
    participants,
    lookupTeamById,
    submitTeamEvaluation,
    requestScoreEdit,
    logout
  } = useApp();

  // Search state
  const [teamIdInput, setTeamIdInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<Participant | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Score edit request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Mark entry state: string values to allow fluid numeric entry
  const [criterionScores, setCriterionScores] = useState<Record<string, string>>({
    'crit-tech': '',
    'crit-innov': '',
    'crit-design': '',
    'crit-demo': '',
    'crit-doc': ''
  });

  // Submission feedback state
  const [submitSuccess, setSubmitSuccess] = useState<{
    teamId: string;
    teamName: string;
    score: number;
    timestamp: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep activeTeam state in sync with updated participant (e.g. when Admin accepts an edit request)
  useEffect(() => {
    if (activeTeam) {
      const updated = participants.find(
        (p) =>
          p.id === activeTeam.id ||
          p.teamId === activeTeam.teamId ||
          p.participantId === activeTeam.participantId
      );
      if (
        updated &&
        (updated.oneTimeEditAllowed !== activeTeam.oneTimeEditAllowed ||
          updated.scoreEditRequest?.status !== activeTeam.scoreEditRequest?.status ||
          updated.status !== activeTeam.status)
      ) {
        setActiveTeam(updated);
      }
    }
  }, [participants, activeTeam]);

  // Score locking & request states
  const isPreviouslyScored =
    activeTeam !== null &&
    (activeTeam.status === 'SUBMITTED' ||
      activeTeam.isScoreLocked === true ||
      (activeTeam.finalScore !== undefined && activeTeam.finalScore > 0));

  const isOneTimeEditAllowed = activeTeam?.oneTimeEditAllowed === true;
  const isLocked = isPreviouslyScored && !isOneTimeEditAllowed;
  const editRequestStatus = activeTeam?.scoreEditRequest?.status || 'NONE';
  const isRequestPending = editRequestStatus === 'PENDING';

  // Helper to match judge IDs across format variations (e.g. JDG-01, jud-01, jdg-1)
  const areJudgeIdsMatching = (idA?: string | null, idB?: string | null): boolean => {
    if (!idA || !idB) return false;
    const cleanA = idA.trim().toLowerCase();
    const cleanB = idB.trim().toLowerCase();
    if (cleanA === cleanB) return true;
    const digitsA = cleanA.replace(/\D/g, '');
    const digitsB = cleanB.replace(/\D/g, '');
    if (digitsA && digitsB && parseInt(digitsA, 10) === parseInt(digitsB, 10)) {
      return true;
    }
    return false;
  };

  // Check if a team's tie-break notice is targeted strictly to the currently logged in juror
  const isNoticeForCurrentJudge = (team: Participant | null): boolean => {
    if (!team || !team.tieBreakNotice?.active || !currentUser) return false;

    const noticeTargetJudgeId = team.tieBreakNotice.targetJudgeId || '';
    const noticeTargetJudgeName = (team.tieBreakNotice.targetJudgeName || '').trim().toLowerCase();
    const currentJudgeId = currentUser.judgeId || '';
    const currentUserId = currentUser.id || '';
    const currentUserName = (currentUser.name || '').trim().toLowerCase();

    // 1. Direct match on explicit targetJudgeId if specified
    if (noticeTargetJudgeId) {
      if (areJudgeIdsMatching(noticeTargetJudgeId, currentJudgeId)) return true;
      if (areJudgeIdsMatching(noticeTargetJudgeId, currentUserId)) return true;
      return false; // Notice is specifically targeted to a different judge
    }

    // 2. Direct match on explicit targetJudgeName if specified
    if (noticeTargetJudgeName && currentUserName) {
      if (noticeTargetJudgeName === currentUserName) return true;
      return false; // Notice is specifically targeted to a different judge name
    }

    // 3. Fallback: match team's evaluatedBy / assigned judge
    const teamJudgeId = team.evaluatedByJudgeId || team.assignedJudgeId;
    if (teamJudgeId) {
      if (areJudgeIdsMatching(teamJudgeId, currentJudgeId)) return true;
      if (areJudgeIdsMatching(teamJudgeId, currentUserId)) return true;
      return false;
    }

    const teamJudgeName = (team.evaluatedByJudgeName || team.assignedJudgeName || '').trim().toLowerCase();
    if (teamJudgeName && currentUserName) {
      return teamJudgeName === currentUserName;
    }

    return false;
  };

  // Identify teams with active tie break notices targeted ONLY to the currently logged in juror
  const tieAlertTeams = React.useMemo(() => {
    return participants.filter((p) => isNoticeForCurrentJudge(p));
  }, [participants, currentUser]);

  // Handler for sending edit request to administration
  const handleSendEditRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !requestReason.trim()) {
      setRequestError('Please provide a reason for requesting a mark change.');
      return;
    }

    setIsSendingRequest(true);
    setRequestError(null);

    try {
      const res = await requestScoreEdit(
        activeTeam.teamId || activeTeam.participantId,
        requestReason.trim()
      );

      if (res.success) {
        setIsRequestModalOpen(false);
        setRequestReason('');
        // Sync local activeTeam state
        setActiveTeam((prev) =>
          prev
            ? {
                ...prev,
                scoreEditRequest: {
                  id: `req-${Date.now()}`,
                  status: 'PENDING',
                  reason: requestReason.trim(),
                  requestedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              }
            : null
        );
      } else {
        setRequestError(res.message || 'Failed to submit edit request.');
      }
    } catch (err: any) {
      setRequestError(err?.message || 'Error communicating with server.');
    } finally {
      setIsSendingRequest(false);
    }
  };

  // A. Find Team Handler
  const handleFindTeam = (queryOverride?: string) => {
    const query = (queryOverride !== undefined ? queryOverride : teamIdInput).trim();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!query) {
      setSearchError('Please enter a valid Team ID.');
      setActiveTeam(null);
      return;
    }

    setIsSearching(true);

    const applyFoundTeam = (team: Participant) => {
      setActiveTeam(team);
      setSearchError(null);

      // If team has existing submitted scores, pre-populate them
      if (team.criterionScores && Object.keys(team.criterionScores).length > 0) {
        setCriterionScores({
          'crit-tech': String(team.criterionScores['crit-tech'] ?? ''),
          'crit-innov': String(team.criterionScores['crit-innov'] ?? ''),
          'crit-design': String(team.criterionScores['crit-design'] ?? ''),
          'crit-demo': String(team.criterionScores['crit-demo'] ?? ''),
          'crit-doc': String(team.criterionScores['crit-doc'] ?? '')
        });
      } else {
        setCriterionScores({
          'crit-tech': '',
          'crit-innov': '',
          'crit-design': '',
          'crit-demo': '',
          'crit-doc': ''
        });
      }
    };

    // 1. Try local memory state lookup
    const localTeam = lookupTeamById(query);
    if (localTeam) {
      setIsSearching(false);
      applyFoundTeam(localTeam);
      return;
    }

    // 2. Query MongoDB Atlas backend
    api.lookupTeam(query)
      .then((res) => {
        setIsSearching(false);
        if (res.team) {
          applyFoundTeam(res.team);
        } else {
          setSearchError(`Team ID "${query}" not found. Please verify the ID on the team credential or table badge.`);
          setActiveTeam(null);
        }
      })
      .catch((err) => {
        setIsSearching(false);
        setSearchError(`Team ID "${query}" not found. Please verify the ID on the team credential or table badge.`);
        setActiveTeam(null);
      });
  };

  // Quick test shortcut
  const handleQuickSelect = (id: string) => {
    setTeamIdInput(id);
    handleFindTeam(id);
  };

  // Criterion input change with strict bounds validation
  const handleScoreChange = (criterionId: string, val: string, maxMarks: number) => {
    setSubmitSuccess(null);
    setSubmitError(null);

    // Allow empty string when clearing
    if (val === '') {
      setCriterionScores((prev) => ({ ...prev, [criterionId]: '' }));
      return;
    }

    // Only allow digits
    const cleaned = val.replace(/\D/g, '');
    if (cleaned === '') {
      setCriterionScores((prev) => ({ ...prev, [criterionId]: '' }));
      return;
    }

    const num = parseInt(cleaned, 10);
    // Reject negative or above max
    if (num < 0 || num > maxMarks) return;

    setCriterionScores((prev) => ({ ...prev, [criterionId]: String(num) }));
  };

  // Calculate live total score
  const totalScore = OFFICIAL_CRITERIA.reduce((acc, c) => {
    const val = criterionScores[c.id];
    return acc + (val !== '' && !isNaN(Number(val)) ? Number(val) : 0);
  }, 0);

  // Validate if mark entry is complete
  const isAllCriteriaFilled =
    activeTeam !== null &&
    OFFICIAL_CRITERIA.every((c) => {
      const val = criterionScores[c.id];
      if (val === '') return false;
      const num = Number(val);
      return !isNaN(num) && num >= 0 && num <= c.maxMarks;
    });

  const filledCount = OFFICIAL_CRITERIA.filter((c) => criterionScores[c.id] !== '').length;

  // D. Submit Marks Handler
  const handleSubmitMarks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !isAllCriteriaFilled) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const numericScores: Record<string, number> = {};
      OFFICIAL_CRITERIA.forEach((c) => {
        numericScores[c.id] = Number(criterionScores[c.id] || 0);
      });

      const result = submitTeamEvaluation({
        participantId: activeTeam.id,
        scores: numericScores,
        remarks: `Evaluated by ${currentUser?.name || 'Official Juror'}`
      });

      if (result.success) {
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSubmitSuccess({
          teamId: activeTeam.teamId || activeTeam.participantId,
          teamName: activeTeam.teamName || activeTeam.name,
          score: result.totalScore,
          timestamp: nowTime
        });

        // Re-sync active team with updated status
        const updated = participants.find((p) => p.id === activeTeam.id);
        if (updated) setActiveTeam(updated);
      } else {
        setSubmitError('Failed to record evaluation. Please try again.');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Error saving marks to system.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to score next team
  const handleScoreNextTeam = () => {
    setTeamIdInput('');
    setActiveTeam(null);
    setSearchError(null);
    setSubmitSuccess(null);
    setSubmitError(null);
    setCriterionScores({
      'crit-tech': '',
      'crit-innov': '',
      'crit-design': '',
      'crit-demo': '',
      'crit-doc': ''
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E6F7F5] border border-teal-200 text-[#03A695] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            Grand Finale Evaluation Desk
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Team Scoring & Evaluation
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6B7C] mt-1">
            Look up a finalist team ID, evaluate multi-criteria rubrics, and record final scores directly into Atlas.
          </p>
        </div>
      </div>

        {/* Tie Alert Quick Notification for Juror */}
        {tieAlertTeams.length > 0 && (
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 text-xs shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
              <span className="font-black text-amber-900 uppercase tracking-wider text-xs">
                Administration Tie-Break Alert ({tieAlertTeams.length} Team{tieAlertTeams.length > 1 ? 's' : ''})
              </span>
            </div>
            <p className="text-amber-800 text-[11px] mb-3">
              Administration has flagged tied scores in your category. Please load the team below, request a score edit, and recalibrate criteria to resolve the tie:
            </p>
            <div className="flex flex-wrap gap-2">
              {tieAlertTeams.map((team) => {
                const uId = team.teamId || team.participantId;
                return (
                  <button
                    key={uId}
                    type="button"
                    onClick={() => {
                      setTeamIdInput(uId);
                      handleFindTeam(uId);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs hover:from-amber-600 hover:to-orange-600 shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  >
                    <span>{uId}</span>
                    <span className="text-[10px] opacity-90">({team.finalScore} pts • Cat {team.categoryNumber})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* C. Team ID Search Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3.5">
          <div>
            <label
              htmlFor="team-id-input"
              className="block text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-1.5"
            >
              Unique ID
            </label>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="team-id-input"
                  type="text"
                  placeholder="Enter unique ID (e.g. TTF26-TEAM-001)"
                  value={teamIdInput}
                  onChange={(e) => {
                    setTeamIdInput(e.target.value);
                    setSearchError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFindTeam();
                    }
                  }}
                  className="w-full h-11 sm:h-12 pl-10 pr-4 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-sm font-semibold text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695] focus:bg-white transition-all"
                />
              </div>

              <button
                type="button"
                onClick={() => handleFindTeam()}
                disabled={isSearching}
                className="h-11 sm:h-12 px-6 sm:w-36 bg-[#03A695] hover:bg-[#008C7E] active:bg-[#007A6E] text-white font-bold text-sm rounded-xl transition-all shadow-xs hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find Team</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Helper Badges for Registered Teams */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 text-xs">
            <span className="text-[11px] font-semibold text-[#5B6B7C] shrink-0">Samples:</span>
            {['TTF26-TEAM-001', 'TTF26-TEAM-002', 'TTF26-TEAM-003', 'TTF26-TEAM-008'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => handleQuickSelect(id)}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F7F5] hover:text-[#03A695] hover:border-teal-300 border border-[#CBD5E1] text-[#5B6B7C] font-mono text-[11px] font-semibold transition-all cursor-pointer shrink-0"
              >
                {id}
              </button>
            ))}
          </div>

          {/* Search Validation Feedback */}
          {searchError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Team Lookup Failed</p>
                <p className="mt-0.5 text-[11px] text-red-700 leading-normal">{searchError}</p>
              </div>
            </div>
          )}
        </div>

        {/* D. Team Details Card */}
        {activeTeam && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] border-l-4 border-l-[#03A695] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#03A695]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Team Details</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                  activeTeam.status === 'SUBMITTED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {activeTeam.status === 'SUBMITTED' ? 'Previously Scored' : 'Ready for Scoring'}
              </span>
            </div>

            {/* Information Grid: Responsive Balanced 2-Column Metadata + Full Roster */}
            <div className="space-y-3">
              {/* Row 1: Team & School Info in 2 clean columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. Unique Finalist ID & Category */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold text-[#5B6B7C] uppercase tracking-wider">
                        Unique Finalist ID
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-teal-50 text-[#03A695] border border-teal-200">
                        Category {activeTeam.categoryNumber || 1}
                      </span>
                    </div>
                    <div className="font-mono font-black text-sm sm:text-base text-[#03A695]">
                      {activeTeam.teamId || activeTeam.participantId}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-slate-700 font-semibold text-xs">
                    {activeTeam.categoryName} <span className="text-slate-400 font-normal">• Grade {activeTeam.grade}</span>
                  </div>
                </div>

                {/* 2. School Name & Selected Project */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#5B6B7C] uppercase tracking-wider block mb-1">
                      School & Institution
                    </span>
                    <div className="font-bold text-[#172B4D] text-xs sm:text-sm truncate">
                      {activeTeam.schoolName}
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-black text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 shrink-0">
                        P{activeTeam.categoryNumber || 1}-0{activeTeam.projectNumber || 1}
                      </span>
                      <span className="font-bold text-[#172B4D] text-xs truncate">
                        {activeTeam.projectTitle}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Full Width Student Finalists Roster */}
              {(() => {
                const students = getNormalizedTeamMembers(activeTeam);
                return (
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-[10px] font-bold text-[#5B6B7C] uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#FD5E01]" />
                        {students.length > 1 ? `Student Finalists (${students.length})` : 'Student Finalist'}
                      </span>
                      {activeTeam.teamName && (
                        <span className="text-[10px] font-bold text-[#03A695] bg-[#E6F7F5] px-2 py-0.5 rounded-md border border-teal-200 truncate max-w-[150px]">
                          Team: {activeTeam.teamName}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {students.map((st, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 p-2 sm:p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#03A695] to-[#0B2545] text-white text-[11px] font-black flex items-center justify-center shrink-0">
                              {st.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-xs text-[#0B2545] truncate">
                              {st.name.replace(/\s*\([^)]*\)/g, '').trim()}
                            </span>
                          </div>
                          {st.grade && (
                            <span className="text-[9px] font-mono font-medium text-slate-400 shrink-0">
                              Gr {st.grade}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Administration Tie-Break Notice for Active Team (Only visible to targeted Juror) */}
            {activeTeam.tieBreakNotice?.active && isNoticeForCurrentJudge(activeTeam) && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/20 border-2 border-amber-500/60 text-xs text-amber-950 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                    <span className="font-black text-xs uppercase tracking-wider text-amber-900">
                      Administration Tie-Break Notice
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                    Recalibration Notice
                  </span>
                </div>
                <div className="bg-white/90 p-3 rounded-lg border border-amber-300 text-xs space-y-1">
                  <p className="font-bold text-slate-800">
                    Official Message from {activeTeam.tieBreakNotice.notifiedBy || 'Administration'}:
                  </p>
                  <p className="text-slate-700 italic">
                    "{activeTeam.tieBreakNotice.adminMessage || 'Tied final score detected with another finalist. Please request score edit to re-evaluate criteria.'}"
                  </p>
                  {activeTeam.tieBreakNotice.notifiedAt && (
                    <p className="text-[10px] text-slate-500 pt-0.5">
                      Received at {activeTeam.tieBreakNotice.notifiedAt}
                    </p>
                  )}
                </div>
                {!isOneTimeEditAllowed && !isRequestPending && (
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setRequestReason(
                          `Tie-break score recalibration requested by Administration (Tied score: ${activeTeam.finalScore || activeTeam.tieBreakNotice?.tiedScore} pts in Category ${activeTeam.categoryNumber || 1}).`
                        );
                        setRequestError(null);
                        setIsRequestModalOpen(true);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Mark Edit (Tie-Break)</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Score Locking & Status Banners */}
            {isLocked && !isRequestPending && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                      Marks Submitted & Locked (Read-Only)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                    Official Record
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Official evaluation score:{' '}
                  <strong className="text-slate-900 font-mono text-xs">
                    {activeTeam.finalScore} / 100 PTS
                  </strong>{' '}
                  recorded on {activeTeam.submissionTimestamp || 'today'} by{' '}
                  {activeTeam.evaluatedByJudgeName || 'Juror'}. In accordance with Grand Finale regulations, marks are locked once submitted.
                </p>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Need to change or adjust submitted marks?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRequestReason('');
                      setRequestError(null);
                      setIsRequestModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-[#0B2545] hover:bg-[#172B4D] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.99]"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#FD5E01]" />
                    <span>Request Mark Edit from Administration</span>
                  </button>
                </div>
              </div>
            )}

            {isRequestPending && (
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse shrink-0" />
                  <span className="font-bold text-xs uppercase tracking-wider text-amber-900">
                    Mark Edit Request Pending Administration Approval
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  You requested permission to adjust marks for this team.
                  <span className="block mt-1 font-medium italic">
                    Reason: "{activeTeam.scoreEditRequest?.reason}"
                  </span>
                </p>
                <p className="text-[10px] text-amber-700">
                  Administration has been notified. As soon as accepted, this page will unlock for a one-time mark modification.
                </p>
              </div>
            )}

            {isOneTimeEditAllowed && (
              <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-xs text-emerald-950 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                      Administration Approved One-Time Score Edit
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                    1 Edit Granted
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Administration has approved your request. You can now modify the 5 criterion marks and click "Update & Submit Final Marks". Once submitted, marks will re-lock immediately.
                </p>
                {activeTeam.scoreEditRequest?.reviewRemarks && (
                  <p className="text-[10px] text-emerald-700 italic">
                    Administration Note: "{activeTeam.scoreEditRequest.reviewRemarks}"
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* E, F, G. Scoring Rubric, Total Score Summary, and Submit Button */}
        {activeTeam && (
          <form onSubmit={handleSubmitMarks} className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-5">
              <div className="border-b border-[#E2E8F0] pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B4D]">
                  Official Scoring Rubric (100 Points)
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Enter numeric scores for each criterion. Values cannot exceed criterion maximum.
                </p>
              </div>

              {/* 5 Official Criteria Rows */}
              <div className="space-y-3">
                {OFFICIAL_CRITERIA.map((criterion, idx) => {
                  const val = criterionScores[criterion.id];
                  const numVal = Number(val);
                  const isInvalid = val !== '' && (numVal < 0 || numVal > criterion.maxMarks);
                  const isFilled = val !== '' && !isInvalid;

                  return (
                    <div
                      key={criterion.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isInvalid
                          ? 'bg-red-50/40 border-red-300'
                          : isFilled
                          ? 'bg-[#E6F7F5]/40 border-teal-200'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-slate-300'
                      }`}
                    >
                      {/* Left: Criterion Index, Name & Maximum Label */}
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <span className="w-6 h-6 rounded-lg bg-white border border-[#CBD5E1] text-[#03A695] font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-[#0B2545] text-xs sm:text-sm leading-snug break-words">
                            {criterion.name}
                          </p>
                          <p className="text-[11px] text-[#5B6B7C] font-medium mt-0.5">
                            Maximum: <span className="font-semibold text-slate-700">{criterion.maxMarks} marks</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Fixed Numeric Score Input (No Wheel Auto-Scroll, No Spin Buttons) & Max Suffix */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={3}
                          autoComplete="off"
                          autoCorrect="off"
                          spellCheck={false}
                          placeholder={`0 - ${criterion.maxMarks}`}
                          value={val}
                          disabled={isLocked}
                          onWheel={(e) => {
                            e.currentTarget.blur();
                            e.preventDefault();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) =>
                            handleScoreChange(criterion.id, e.target.value, criterion.maxMarks)
                          }
                          aria-label={`Score for ${criterion.name}`}
                          className={`w-28 sm:w-32 h-12 text-center font-bold font-mono text-lg rounded-xl border-2 transition-all select-none overflow-hidden shrink-0 ${
                            isLocked
                              ? 'bg-slate-100 border-slate-300 text-slate-500 cursor-not-allowed select-none'
                              : isInvalid
                              ? 'bg-white border-red-400 text-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                              : val !== ''
                              ? 'bg-white border-[#03A695] text-[#0B2545] focus:border-[#008C7E] focus:ring-2 focus:ring-teal-100'
                              : 'bg-white border-[#CBD5E1] text-[#0B2545] focus:border-[#03A695] focus:ring-2 focus:ring-teal-100'
                          }`}
                        />
                        <span className="text-xs font-bold text-[#5B6B7C] font-mono w-10 shrink-0 select-none flex items-center gap-1">
                          <span>/ {criterion.maxMarks}</span>
                          {isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* F. Total Score Summary */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0B2545] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-teal-200 uppercase tracking-wider block">
                    TOTAL SCORE
                  </span>
                  <span className="text-xs text-teal-100 font-medium">
                    {isAllCriteriaFilled
                      ? 'All 5 evaluation criteria entered'
                      : `Progress: ${filledCount} of 5 criteria entered`}
                  </span>
                </div>

                <div className="text-left sm:text-right self-end sm:self-center">
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-white">
                    Total Score: <span className="text-[#FD5E01]">{totalScore}</span> / 100
                  </div>
                </div>
              </div>
            </div>

            {/* G. Submit Marks Button & Feedback Area */}
            <div className="space-y-3.5">
              {/* Submission Error Message */}
              {submitError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-900">Submission Error</p>
                    <p className="mt-0.5 text-[11px] text-red-700">{submitError}</p>
                  </div>
                </div>
              )}

              {/* Submission Success Message */}
              {submitSuccess && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 space-y-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-sm text-emerald-950">
                        Marks Successfully Submitted!
                      </p>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Team <strong className="font-mono">{submitSuccess.teamId}</strong> ({submitSuccess.teamName}) received an official total of{' '}
                        <strong className="font-mono text-emerald-950 text-sm">
                          {submitSuccess.score} / 100
                        </strong>{' '}
                        at {submitSuccess.timestamp}.
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        The Central Administration scoreboard and leaderboards have been updated in real time.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200 flex justify-end">
                    <button
                      type="button"
                      onClick={handleScoreNextTeam}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Enter Next Team ID →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Main Submit Button & Secondary Reset Action */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {isLocked ? (
                  <div className="w-full sm:flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <div className="flex-1 h-12 sm:h-13 px-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-500 text-xs font-bold flex items-center justify-center gap-2 select-none">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Marks Locked</span>
                    </div>
                    {!isRequestPending && (
                      <button
                        type="button"
                        onClick={() => {
                          setRequestReason('');
                          setRequestError(null);
                          setIsRequestModalOpen(true);
                        }}
                        className="h-12 sm:h-13 px-5 bg-[#0B2545] hover:bg-[#172B4D] active:bg-[#071629] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
                      >
                        <RotateCcw className="w-4 h-4 text-[#FD5E01]" />
                        <span>Request Mark Edit from Administration</span>
                      </button>
                    )}
                  </div>
                ) : isOneTimeEditAllowed ? (
                  <button
                    type="submit"
                    disabled={!isAllCriteriaFilled || isSubmitting}
                    className={`w-full sm:flex-1 h-12 sm:h-13 px-6 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                      isAllCriteriaFilled && !isSubmitting
                        ? 'bg-[#FD5E01] hover:bg-[#E05300] active:bg-[#CC4B00] text-white hover:shadow active:scale-[0.99]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Final Marks...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Update & Submit Final Marks (One-Time Edit)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!isAllCriteriaFilled || isSubmitting}
                    className={`w-full sm:flex-1 h-12 sm:h-13 px-6 rounded-xl font-bold text-sm uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                      isAllCriteriaFilled && !isSubmitting
                        ? 'bg-[#03A695] hover:bg-[#008C7E] active:bg-[#007A6E] text-white hover:shadow active:scale-[0.99]'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting Marks...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>
                          {isAllCriteriaFilled
                            ? `Submit Marks (${totalScore} / 100)`
                            : 'Complete All 5 Criteria to Submit'}
                        </span>
                      </>
                    )}
                  </button>
                )}

                {activeTeam && (
                  <button
                    type="button"
                    onClick={handleScoreNextTeam}
                    className="w-full sm:w-auto h-12 sm:h-13 px-5 rounded-xl border border-[#CBD5E1] text-[#64748B] hover:text-[#172B4D] hover:bg-slate-100 font-bold text-xs uppercase tracking-wide transition-colors cursor-pointer shrink-0"
                  >
                    Clear / New Team
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

      {/* Edit Request Modal Dialog */}
      {isRequestModalOpen && activeTeam && (
        <Modal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          title="Request Mark Edit from Administration"
          subtitle={`Unique ID: ${activeTeam.teamId || activeTeam.participantId} • Currently Scored: ${activeTeam.finalScore || 0}/100`}
        >
          <form onSubmit={handleSendEditRequest} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <p className="font-semibold">Important Note for Jurors:</p>
              <p className="mt-0.5 text-[11px] text-amber-800">
                To maintain championship integrity, once marks are submitted they are locked. If you need to revise a score, Administration will review your request and unlock this team for a one-time recalibration.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B2545] uppercase tracking-wider mb-1.5">
                Reason for Score Adjustment *
              </label>
              <textarea
                rows={3}
                required
                value={requestReason}
                onChange={(e) => {
                  setRequestReason(e.target.value);
                  setRequestError(null);
                }}
                placeholder="e.g., Student defense clarification revealed additional technical details; adjust Criterion 2..."
                className="w-full p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-medium text-[#0B2545] focus:outline-none focus:border-[#03A695] focus:bg-white transition-all"
              />
            </div>

            {/* Quick Reason Suggestions */}
            <div>
              <span className="text-[10px] font-bold text-[#5B6B7C] uppercase tracking-wider block mb-1.5">
                Quick Suggestions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Clarification provided during live defense',
                  'Scoring typo / miskeyed criterion value',
                  'Re-evaluated student demonstration',
                  'Juror panel calibration consensus'
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setRequestReason(sug)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-[#E6F7F5] hover:text-[#03A695] rounded-lg text-[10px] font-semibold text-slate-600 transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {requestError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{requestError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSendingRequest || !requestReason.trim()}
                className="px-5 py-2 rounded-xl bg-[#03A695] hover:bg-[#008C7E] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isSendingRequest ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Request to Administration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
