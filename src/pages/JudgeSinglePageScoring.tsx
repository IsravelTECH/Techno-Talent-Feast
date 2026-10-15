import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TechnoLogo } from '../components/common/TechnoLogo';
import { UserAvatar } from '../components/common/UserAvatar';
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
  Loader2
} from 'lucide-react';
import { Participant } from '../types';
import api from '../services/api';

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
    loginAs,
    logout
  } = useApp();

  // Search state
  const [teamIdInput, setTeamIdInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTeam, setActiveTeam] = useState<Participant | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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
    if (!/^\d+$/.test(val)) return;

    const num = parseInt(val, 10);
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
    <div className="min-h-screen bg-[#F7FCFB] flex flex-col font-sans text-[#0B2545] antialiased selection:bg-[#03A695] selection:text-white">
      {/* A. Compact Header */}
      <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-40 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Logo & Event Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#03A695] to-[#0B2545] flex items-center justify-center text-white font-extrabold text-xs sm:text-sm shadow-xs shrink-0 select-none">
              <span className="text-[#FD5E01]">T</span>T
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-extrabold text-[#0B2545] tracking-tight truncate leading-tight">
                Techno Talent Feast 2026
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-[#5B6B7C] tracking-normal leading-none mt-0.5">
                Judge Scoring Portal
              </p>
            </div>
          </div>

          {/* Authenticated Judge Info & Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Judge Identity Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-[#E6F7F5] border border-teal-200 text-xs">
              <UserAvatar name={currentUser?.name || 'Official Juror'} size="xs" />
              <span className="font-bold text-[#0B2545] max-w-[100px] sm:max-w-none truncate text-[11px] sm:text-xs">
                {currentUser?.name || 'Official Juror'}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold text-[#03A695] uppercase">
                • Juror
              </span>
            </div>

            {/* Switch to Admin Mode */}
            <button
              onClick={() => loginAs('admin')}
              className="text-[11px] sm:text-xs font-semibold text-[#03A695] hover:text-[#008C7E] bg-[#F7FCFB] hover:bg-[#E6F7F5] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#D8EBE7] hover:border-teal-300 transition-colors cursor-pointer"
              title="Switch to Administration to review reflected marks"
            >
              Switch to Admin
            </button>

            {/* Logout Action */}
            <button
              onClick={logout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Log Out"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Single Page Content */}
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 max-w-3xl w-full mx-auto space-y-6">
        {/* B. Page Introduction */}
        <div className="text-center space-y-1 sm:space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E6F7F5] border border-teal-200 text-[#03A695] text-[11px] font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            Grand Finale Evaluation
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] tracking-tight">
            Team Evaluation
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6B7C] max-w-md mx-auto">
            Enter a team ID, evaluate the project, and submit the score.
          </p>
        </div>

        {/* C. Team ID Search Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-sm space-y-3.5">
          <div>
            <label
              htmlFor="team-id-input"
              className="block text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-1.5"
            >
              Team ID
            </label>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="team-id-input"
                  type="text"
                  placeholder="Enter team ID"
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
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
            <span className="text-[11px] font-semibold text-[#5B6B7C]">Samples:</span>
            {['TTF26-TEAM-001', 'TTF26-TEAM-002', 'TTF26-TEAM-003', 'TTF26-TEAM-008'].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => handleQuickSelect(id)}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] hover:bg-[#E6F7F5] hover:text-[#03A695] hover:border-teal-300 border border-[#CBD5E1] text-[#5B6B7C] font-mono text-[11px] font-semibold transition-all cursor-pointer"
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

            {/* Information Grid: Responsive 1 col on mobile, 2-3 col on tablet/desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#5B6B7C] uppercase tracking-wider block">
                  Team ID
                </span>
                <span className="font-mono font-extrabold text-sm text-[#03A695] mt-0.5 block">
                  {activeTeam.teamId || activeTeam.participantId}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#5B6B7C] uppercase tracking-wider block">
                  School Name
                </span>
                <span className="font-bold text-[#172B4D] text-xs sm:text-sm mt-0.5 block break-words">
                  {activeTeam.schoolName}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Team Name
                </span>
                <span className="font-bold text-[#172B4D] text-xs sm:text-sm mt-0.5 block break-words">
                  {activeTeam.teamName || activeTeam.name}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Competition Category
                </span>
                <span className="font-semibold text-[#172B4D] text-xs mt-0.5 block">
                  {activeTeam.categoryName} (Grade {activeTeam.grade})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] sm:col-span-2">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Selected Project (1 of 4)
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[10px] font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                    P{activeTeam.categoryNumber || 1}-0{activeTeam.projectNumber || 1}
                  </span>
                  <span className="font-bold text-[#172B4D] text-xs break-words">
                    {activeTeam.projectTitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Previously Scored Notice Banner */}
            {activeTeam.status === 'SUBMITTED' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Notice:</strong> This team was already scored:{' '}
                  <strong className="text-amber-950 font-mono">
                    {activeTeam.finalScore} / 100 PTS
                  </strong>{' '}
                  on {activeTeam.submissionTimestamp || 'earlier today'} by{' '}
                  {activeTeam.evaluatedByJudgeName || 'Juror'}. Submitting new marks will update the official record.
                </p>
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

                      {/* Right: Numeric Score Input & Max Suffix */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
                        <input
                          type="number"
                          min="0"
                          max={criterion.maxMarks}
                          placeholder={`0 - ${criterion.maxMarks}`}
                          value={val}
                          onChange={(e) =>
                            handleScoreChange(criterion.id, e.target.value, criterion.maxMarks)
                          }
                          aria-label={`Score for ${criterion.name}`}
                          className={`w-28 sm:w-32 h-11 text-center font-bold font-mono text-base rounded-xl bg-white border-2 focus:outline-none transition-all ${
                            isInvalid
                              ? 'border-red-400 text-red-600 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                              : val !== ''
                              ? 'border-[#03A695] text-[#0B2545] focus:border-[#008C7E] focus:ring-2 focus:ring-teal-100'
                              : 'border-[#CBD5E1] text-[#0B2545] focus:border-[#03A695] focus:ring-2 focus:ring-teal-100'
                          }`}
                        />
                        <span className="text-xs font-bold text-[#5B6B7C] font-mono w-10 shrink-0 select-none">
                          / {criterion.maxMarks}
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
      </main>

      {/* Clean Minimal Footer */}
      <footer className="py-4 text-center text-[11px] text-[#64748B] border-t border-[#E2E8F0] bg-white">
        TECHNO TALENT FEAST 2026 • Official Juror Scoring System
      </footer>
    </div>
  );
};
