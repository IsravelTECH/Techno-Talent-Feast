import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  FileCheck2,
  Trophy,
  Save,
  Send,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  MessageSquare,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  Search,
  CheckSquare,
  Square,
  Hash,
  Award,
  Users,
  Eye
} from 'lucide-react';
import { Participant } from '../types';

export const ScoringPanelPage: React.FC = () => {
  const {
    currentUser,
    selectedCompetitionId,
    selectedParticipantId,
    competitions,
    participants,
    rubrics,
    activeCriterionScores,
    activeScoreComments,
    setCriterionScore,
    setActiveComments,
    saveEvaluationDraft,
    submitTeamEvaluation,
    resetActiveScore,
    isDraftSaved,
    navigate,
    loadParticipantForScoring,
    lookupTeamById
  } = useApp();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [teamSearchInput, setTeamSearchInput] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    teamId: string;
    teamName: string;
    totalScore: number;
    percentage: number;
    timestamp: string;
  } | null>(null);

  // 7 Official Defense Questions from TTF 2026 specifications
  const [activeDefenseChecks, setActiveDefenseChecks] = useState<Record<string, boolean>>({
    q1: true,
    q2: true,
    q3: true,
    q4: true,
    q5: true,
    q6: true,
    q7: true
  });

  // Current active team
  const participant =
    participants.find((p) => p.id === selectedParticipantId) ||
    participants.find((p) => p.id === 'part-01') ||
    participants[0];

  const activeComp =
    competitions.find((c) => c.id === participant.competitionId) ||
    competitions.find((c) => c.categoryNumber === participant.categoryNumber) ||
    competitions[0];

  const rubric =
    rubrics[activeComp.rubricId] ||
    rubrics['rub-ttf-cat6'] ||
    Object.values(rubrics)[0];

  // Official TTF 2026 5 criteria definitions
  const criteriaList = [
    {
      id: 'crit-tech',
      name: 'Technical Execution & Functionality',
      maxMarks: 30,
      description: 'Prototype operation, reliability, hardware/software integration, code structure, and technical complexity.',
      focus: 'Does the system execute its core functions cleanly without fatal errors?'
    },
    {
      id: 'crit-innov',
      name: 'Innovation & Problem Solving',
      maxMarks: 25,
      description: 'Originality of concept, problem significance, creative approach, and UAE environmental alignment.',
      focus: 'Does the solution demonstrate novel thinking and genuine utility?'
    },
    {
      id: 'crit-design',
      name: 'Design & User Experience',
      maxMarks: 20,
      description: 'UI/UX layout, aesthetics, wireframe cleanliness, hardware neatness, and intuitive operation.',
      focus: 'Is the interface polished, accessible, and ergonomically designed?'
    },
    {
      id: 'crit-demo',
      name: 'Live Demonstration & Student Defense',
      maxMarks: 15,
      description: 'Clarity of student explanation, mastery of technical concepts, poise, and defense question responses.',
      focus: 'Can the students articulate and defend their code and engineering decisions?'
    },
    {
      id: 'crit-doc',
      name: 'Documentation & Compliance',
      maxMarks: 10,
      description: 'Project deck, compliance with category tools, safety standards, and adherence to TTF 2026 rules.',
      focus: 'Are submission deliverables complete and strictly compliant with regulations?'
    }
  ];

  // Total Score Calculation (capped at 100)
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      criteriaList.reduce((acc, c) => acc + (Number(activeCriterionScores[c.id]) || 0), 0)
    )
  );

  const percentage = Math.round((totalScore / 100) * 100);

  // Grade Assessment
  const getGradeAssessment = (pct: number) => {
    if (pct >= 95) return { label: 'Rank 1 Gold Standard (Winner)', color: 'text-amber-600 bg-amber-50 border-amber-300' };
    if (pct >= 90) return { label: 'Rank 2 Silver Standard (1st Runner-Up)', color: 'text-[#03A695] bg-[#E6F7F5] border-teal-300' };
    if (pct >= 80) return { label: 'Rank 3 Bronze Standard (2nd Runner-Up)', color: 'text-emerald-600 bg-emerald-50 border-emerald-300' };
    if (pct >= 70) return { label: 'Competent Pass', color: 'text-slate-700 bg-slate-50 border-slate-300' };
    return { label: 'Needs Improvement', color: 'text-red-600 bg-red-50 border-red-300' };
  };

  const gradeInfo = getGradeAssessment(percentage);

  // Step score adjustments
  const handleScoreStep = (criterionId: string, delta: number, maxMarks: number) => {
    const current = Number(activeCriterionScores[criterionId] || 0);
    const nextVal = Math.min(Math.max(0, current + delta), maxMarks);
    setCriterionScore(criterionId, nextVal);
  };

  // Direct score changes with strict numeric validation
  const handleDirectScoreChange = (criterionId: string, val: string, maxMarks: number) => {
    if (val === '') {
      setCriterionScore(criterionId, 0);
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setCriterionScore(criterionId, 0);
    } else {
      setCriterionScore(criterionId, Math.min(Math.max(0, num), maxMarks));
    }
  };

  // Toggle defense questions
  const toggleDefenseCheck = (key: string) => {
    setActiveDefenseChecks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Switch team search
  const handleSearchSwitch = () => {
    if (!teamSearchInput.trim()) return;
    const found = lookupTeamById(teamSearchInput.trim());
    if (found) {
      loadParticipantForScoring(found.id);
      setSearchError(null);
      setTeamSearchInput('');
      setSubmissionReceipt(null);
    } else {
      setSearchError(`No team found with ID "${teamSearchInput}".`);
    }
  };

  // Final submission execution
  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    const result = submitTeamEvaluation({
      participantId: participant.id,
      scores: activeCriterionScores,
      remarks: activeScoreComments,
      defenseChecks: activeDefenseChecks
    });

    if (result.success) {
      setSubmissionReceipt({
        teamId: participant.teamId || participant.participantId,
        teamName: participant.teamName || participant.name,
        totalScore: result.totalScore,
        percentage: result.percentage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  };

  // 7 Official Defense Questions
  const officialDefenseQuestions = [
    { id: 'q1', q: 'What real-world problem are you solving?' },
    { id: 'q2', q: 'How does your technology prototype / code work?' },
    { id: 'q3', q: 'Why did your team choose this specific project?' },
    { id: 'q4', q: 'What programming languages / hardware did you use?' },
    { id: 'q5', q: 'What technical difficulties did you face & overcome?' },
    { id: 'q6', q: 'How does this project address sustainability / Dubai urban needs?' },
    { id: 'q7', q: 'How did your team verify compliance with official TTF guidelines?' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-6">
      {/* Top Search & Switch Desk Bar */}
      <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#E6F7F5] border border-teal-200 flex items-center justify-center text-[#03A695] shrink-0 font-bold shadow-xs">
            <FileCheck2 className="w-6 h-6 text-[#03A695]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Team Marks Entry & Scoring Desk
              </h1>
              <Badge variant="live" dot>
                OFFICIAL 100-PT SYSTEM
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Juror: <strong className="text-slate-900">{currentUser.name}</strong> • Immediate Sync to Administration
            </p>
          </div>
        </div>

        {/* Quick Team Search / Switcher Input */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Switch Team ID (e.g. TTF26-TEAM-002)..."
              value={teamSearchInput}
              onChange={(e) => {
                setTeamSearchInput(e.target.value);
                setSearchError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSwitch();
              }}
              className="pl-9 pr-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#03A695] w-56 sm:w-64"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchSwitch}
            className="text-xs font-bold"
          >
            Switch Team
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={resetActiveScore}
          >
            Reset
          </Button>
        </div>
      </div>

      {searchError && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Submission Success Receipt Card */}
      {submissionReceipt && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500 to-[#03A695] text-white shadow-xl animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              Submission Recorded & Locked
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Official Marks Transmitted to Administration!
            </h2>
            <p className="text-xs sm:text-sm text-blue-100">
              Team: <strong className="text-white">{submissionReceipt.teamName}</strong> ({submissionReceipt.teamId}) • Score:{' '}
              <strong className="text-emerald-200 text-lg">{submissionReceipt.totalScore} / 100</strong> ({submissionReceipt.percentage}%) at {submissionReceipt.timestamp}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="md"
              icon={<Award className="w-4 h-4" />}
              onClick={() => navigate('judge-completed')}
            >
              View All Submissions
            </Button>
            <Button
              variant="orange"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => navigate('judge-dashboard')}
            >
              Score Next Team
            </Button>
          </div>
        </div>
      )}

      {/* Verified Team Summary Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-4">
            <UserAvatar name={participant.name} size="xl" variant="color" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] font-mono font-extrabold text-xs border border-teal-200">
                  Team ID: {participant.teamId || participant.participantId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                  Category {participant.categoryNumber}: {participant.categoryName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                  Grade {participant.grade}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {participant.teamName || participant.name}
              </h2>
              <p className="text-xs text-slate-600 flex items-center gap-2 font-medium">
                <Building2 className="w-3.5 h-3.5 text-[#03A695]" />
                {participant.schoolName} ({participant.city}) • Project: <strong className="text-slate-900">{participant.projectTitle}</strong>
              </p>
            </div>
          </div>

          {/* Existing Status Indicator */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-1.5 shrink-0">
            {participant.status === 'SUBMITTED' ? (
              <div className="text-right p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Previously Submitted
                </span>
                <span className="text-xl font-black text-emerald-700">
                  {participant.finalScore} / 100 PTS
                </span>
                <span className="text-[11px] text-emerald-600 block">
                  by {participant.evaluatedByJudgeName || 'Juror'} ({participant.submissionTimestamp || '10:30 AM'})
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                Status: Pending Live Scoring
              </span>
            )}
          </div>
        </div>

        {/* Team Members Roster */}
        {participant.teamMembers && participant.teamMembers.length > 0 && (
          <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-bold uppercase text-[11px] flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Team Members:
            </span>
            {participant.teamMembers.map((m, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-[#F7FCFB] border border-slate-200 text-slate-700 font-medium"
              >
                {m.name} {m.role ? `(${m.role})` : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Total Score Bar */}
      <div className="sticky top-2 z-30 bg-white p-4 sm:p-5 rounded-3xl border-2 border-[#03A695] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#03A695] to-[#0B2545] text-white flex flex-col items-center justify-center shrink-0 shadow-md">
            <span className="text-xl font-black leading-none">{totalScore}</span>
            <span className="text-[9px] font-bold uppercase text-blue-200">/ 100</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Live Total Score
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${gradeInfo.color}`}>
                {gradeInfo.label}
              </span>
            </div>
            <div className="w-48 sm:w-64 h-2 bg-slate-100 rounded-full mt-2 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-[#03A695] to-[#FD5E01] transition-all duration-300 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="md"
            icon={<Save className="w-4 h-4" />}
            onClick={saveEvaluationDraft}
          >
            {isDraftSaved ? 'Draft Saved' : 'Save Draft'}
          </Button>

          <Button
            variant="orange"
            size="lg"
            icon={<Send className="w-5 h-5" />}
            iconPosition="right"
            onClick={() => setShowConfirmModal(true)}
            className="font-extrabold uppercase shadow-md px-6"
          >
            Submit Marks ({totalScore}/100)
          </Button>
        </div>
      </div>

      {/* 5 OFFICIAL CRITERIA CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
            Official 100-Point Evaluation Rubric
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            5 Criteria • Numeric Inputs with Strict Upper Bounds
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {criteriaList.map((crit, index) => {
            const currentScore = Number(activeCriterionScores[crit.id] || 0);
            const critPercentage = Math.round((currentScore / crit.maxMarks) * 100);

            return (
              <div
                key={crit.id}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-card hover:border-teal-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-[#E6F7F5] text-[#03A695] text-xs font-black flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h4 className="text-base font-black text-slate-900">{crit.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold">
                        Max: {crit.maxMarks} Pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {crit.description}
                    </p>
                    <p className="text-[11px] text-[#03A695] italic font-semibold pt-0.5">
                      Juror Focus: {crit.focus}
                    </p>
                  </div>

                  {/* Interactive Score Stepper & Numeric Input */}
                  <div className="flex items-center gap-2 self-end sm:self-center bg-[#F7FCFB] p-2 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleScoreStep(crit.id, -1, crit.maxMarks)}
                      disabled={currentScore <= 0}
                      className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 disabled:opacity-40 transition-all font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 px-1">
                      <input
                        type="number"
                        min="0"
                        max={crit.maxMarks}
                        value={currentScore}
                        onChange={(e) => handleDirectScoreChange(crit.id, e.target.value, crit.maxMarks)}
                        className="w-16 text-center font-black text-xl text-slate-900 bg-white border border-slate-300 rounded-xl py-1.5 focus:outline-none focus:border-[#03A695]"
                      />
                      <span className="text-xs font-bold text-slate-400">/ {crit.maxMarks}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleScoreStep(crit.id, 1, crit.maxMarks)}
                      disabled={currentScore >= crit.maxMarks}
                      className="w-9 h-9 rounded-xl bg-[#03A695] text-white flex items-center justify-center hover:bg-[#0B2545] active:scale-95 disabled:opacity-40 transition-all font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#03A695] transition-all duration-200 rounded-full"
                    style={{ width: `${critPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7 OFFICIAL STUDENT DEFENSE QUESTIONS */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Official Live Defense Questions (TTF 2026 Checklist)
            </h3>
            <p className="text-xs text-slate-500">
              Verify student mastery, problem-solving authenticity, and sustainability alignment
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {Object.values(activeDefenseChecks).filter(Boolean).length} / 7 Checked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {officialDefenseQuestions.map((q, idx) => {
            const isChecked = !!activeDefenseChecks[q.id];
            return (
              <div
                key={q.id}
                onClick={() => toggleDefenseCheck(q.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isChecked
                    ? 'bg-[#E6F7F5]/40 border-teal-200 text-slate-900'
                    : 'bg-slate-50/60 border-slate-200 text-slate-500'
                }`}
              >
                <div className="mt-0.5 text-[#03A695]">
                  {isChecked ? <CheckSquare className="w-5 h-5 text-[#03A695]" /> : <Square className="w-5 h-5 text-slate-400" />}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#03A695] block">
                    Question #{idx + 1}
                  </span>
                  <p className="text-xs font-semibold leading-relaxed mt-0.5">{q.q}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* JUROR REMARKS & QUALITATIVE FEEDBACK */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#03A695]" />
          <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
            Juror Technical Remarks & Commendations
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Provide constructive feedback on technical execution, prototyping ingenuity, and defense demeanor.
        </p>
        <textarea
          rows={4}
          value={activeScoreComments}
          onChange={(e) => setActiveComments(e.target.value)}
          placeholder="Enter qualitative comments, specific strengths, and areas for refinement..."
          className="w-full p-4 bg-[#F7FCFB] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-[#03A695] leading-relaxed resize-y"
        />
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate('judge-dashboard')}
        >
          ← Return to Dashboard
        </Button>

        <Button
          variant="orange"
          size="lg"
          icon={<Send className="w-5 h-5" />}
          iconPosition="right"
          onClick={() => setShowConfirmModal(true)}
          className="font-extrabold uppercase shadow-lg px-8 text-sm"
        >
          Submit Final Evaluation ({totalScore}/100)
        </Button>
      </div>

      {/* FINAL SUBMISSION CONFIRMATION MODAL */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Official Evaluation Submission"
        subtitle="TTF 2026 Grand Finale Scoring Transmittal"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F7FCFB] border border-slate-200 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Team Details</span>
              <span className="font-mono font-bold text-[#03A695]">
                {participant.teamId || participant.participantId}
              </span>
            </div>
            <p className="font-extrabold text-slate-900 text-sm">
              {participant.teamName || participant.name}
            </p>
            <p className="text-slate-600 font-medium">
              {participant.schoolName} • {participant.competitionName}
            </p>
          </div>

          {/* Breakdown Preview */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <span className="text-slate-400 font-bold uppercase text-[10px] block">
              100-Point Score Breakdown
            </span>
            <div className="space-y-1.5">
              {criteriaList.map((c) => (
                <div key={c.id} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">{c.name}</span>
                  <span className="font-bold text-slate-900">
                    {activeCriterionScores[c.id] || 0} / {c.maxMarks}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="font-black text-slate-900 uppercase">Total Official Score</span>
              <span className="font-black text-lg text-[#03A695]">{totalScore} / 100 PTS</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <p className="text-[11px] leading-relaxed">
              Submitting will lock this score in the central TTF 2026 system and immediately update the administration leaderboard.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel & Review
            </Button>
            <Button
              variant="orange"
              size="md"
              icon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleConfirmSubmit}
              className="font-extrabold"
            >
              Confirm & Submit to Admin
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
