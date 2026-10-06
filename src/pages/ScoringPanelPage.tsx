import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
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
  User,
  Building2,
  Clock,
  Radio,
  ArrowRight
} from 'lucide-react';

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
    submitEvaluation,
    resetActiveScore,
    isDraftSaved,
    navigate,
    loadParticipantForScoring
  } = useApp();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const activeComp =
    competitions.find((c) => c.id === selectedCompetitionId) || competitions[0];
  const participant =
    participants.find((p) => p.id === selectedParticipantId) || participants[0];
  const rubric = rubrics[activeComp.rubricId] || rubrics['rub-robotics'];

  // Total Score Calculation
  const totalScore = Object.values(activeCriterionScores).reduce((a, b) => a + Number(b || 0), 0);
  const maxScore = rubric.maxScore || 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Criteria completed count
  const completedCriteriaCount = Object.values(activeCriterionScores).filter((s) => s > 0).length;
  const totalCriteriaCount = rubric.criteria.length;

  const handleScoreStep = (criterionId: string, delta: number, maxMarks: number) => {
    const current = activeCriterionScores[criterionId] || 0;
    const nextVal = Math.min(Math.max(0, current + delta), maxMarks);
    setCriterionScore(criterionId, nextVal);
  };

  const handleDirectScoreChange = (criterionId: string, val: string, maxMarks: number) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) {
      setCriterionScore(criterionId, 0);
    } else {
      setCriterionScore(criterionId, Math.min(Math.max(0, num), maxMarks));
    }
  };

  const getGradeAssessment = (pct: number) => {
    if (pct >= 90) return { label: 'Outstanding (Gold Standard)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (pct >= 80) return { label: 'Excellent (Silver Standard)', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (pct >= 70) return { label: 'Very Good (Bronze Standard)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (pct >= 60) return { label: 'Satisfactory (Pass)', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    return { label: 'Needs Improvement', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const gradeInfo = getGradeAssessment(percentage);

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-6">
      {/* Top Header Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EAF3FF] border border-blue-200 flex items-center justify-center text-[#0057B8] shrink-0 font-bold">
            <FileCheck2 className="w-6 h-6 text-[#0057B8]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {activeComp.name} Evaluation Desk
              </h1>
              <Badge variant="live" dot>
                LIVE SCORING
              </Badge>
              <Badge variant="primary">
                Queue: 12 of 48
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluator: <strong>{currentUser.name}</strong> • Realtime scoring synchronized with admin & leaderboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick participant selector */}
          <select
            value={participant.id}
            onChange={(e) => loadParticipantForScoring(e.target.value)}
            className="px-3 py-1.5 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.schoolName.split(' ')[0]}) - {p.participantId}
              </option>
            ))}
          </select>

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

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Participant Profile Dossier */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="relative inline-block">
                <img
                  src={participant.photo}
                  alt={participant.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-200 ring-4 ring-blue-50 shadow-md mx-auto"
                />
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <h2 className="text-lg font-black text-slate-900 mt-3 leading-tight">
                {participant.name}
              </h2>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-[11px] font-mono font-bold mt-1">
                {participant.participantId}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#F36C21] shrink-0" />
                <span className="font-semibold text-slate-800">{participant.schoolName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#0057B8] shrink-0" />
                <span>Grade {participant.grade} • {participant.teamName || 'Solo Project'}</span>
              </div>
            </div>

            {/* Project Synopsis */}
            <div className="p-3.5 rounded-2xl bg-[#F6F9FD] border border-slate-100 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Project Showcase
              </span>
              <p className="font-bold text-slate-900 leading-snug">
                {participant.projectTitle}
              </p>
              <p className="text-slate-600 mt-1.5 text-[11px] leading-relaxed line-clamp-3">
                {participant.projectSummary}
              </p>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Interactive Rubric Scoring Rows */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {rubric.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input scores for each criterion below. Totals calculate instantly.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-extrabold">
                {completedCriteriaCount}/{totalCriteriaCount} Done
              </span>
            </div>

            {/* Criteria scoring rows */}
            <div className="space-y-3.5">
              {rubric.criteria.map((crit, index) => {
                const score = activeCriterionScores[crit.id] || 0;
                const pctOfCrit = Math.round((score / crit.maxMarks) * 100);

                return (
                  <div
                    key={crit.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      score > 0
                        ? 'bg-[#F6F9FD] border-blue-200 shadow-2xs'
                        : 'bg-white border-slate-200/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-[#EAF3FF] text-[#0057B8] font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-900">
                            {crit.name}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 pl-8 leading-relaxed">
                          {crit.description}
                        </p>
                      </div>

                      {/* Interactive Controls */}
                      <div className="flex items-center gap-2.5 shrink-0 pl-8 sm:pl-0">
                        {/* Steppers */}
                        <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleScoreStep(crit.id, -1, crit.maxMarks)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                            title="Decrease 1 point"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            value={score}
                            min={0}
                            max={crit.maxMarks}
                            onChange={(e) =>
                              handleDirectScoreChange(crit.id, e.target.value, crit.maxMarks)
                            }
                            className="w-12 text-center font-black text-sm text-[#0057B8] bg-transparent focus:outline-none"
                          />

                          <button
                            type="button"
                            onClick={() => handleScoreStep(crit.id, 1, crit.maxMarks)}
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                            title="Increase 1 point"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-xs font-bold text-slate-400">
                          / {crit.maxMarks}
                        </span>
                      </div>
                    </div>

                    {/* Quick Preset Pills */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] pl-8">
                      <span className="text-slate-400 font-semibold">Quick Presets:</span>
                      <div className="flex items-center gap-1.5">
                        {[10, 15, 17, 18, 19, 20].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCriterionScore(crit.id, Math.min(preset, crit.maxMarks))}
                            className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                              score === preset
                                ? 'bg-[#0057B8] text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* General Comments Box */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#0057B8]" />
                <span>Judge Remarks / Constructive Feedback</span>
              </label>
              <textarea
                rows={3}
                value={activeScoreComments}
                onChange={(e) => setActiveComments(e.target.value)}
                placeholder="Add qualitative feedback on prototype reliability, presentation, and design innovation..."
                className="w-full p-3 bg-[#F6F9FD] border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#0057B8] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Score Summary & Submission Actions */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-6 rounded-3xl border-2 border-blue-200/80 shadow-card space-y-5">
            <div className="text-center pb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Summary
              </span>

              {/* Big Score Display */}
              <div className="mt-2">
                <span className="text-5xl font-black text-slate-900 tracking-tight">
                  {totalScore}
                </span>
                <span className="text-xl font-black text-slate-400 ml-1">
                  / {maxScore}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#EAF3FF] text-[#0057B8] text-sm font-black">
                  {percentage}%
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${gradeInfo.color}`}>
                  {gradeInfo.label}
                </span>
              </div>
            </div>

            {/* Criteria Completion Progress */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 font-semibold">
                <span>Criteria Graded</span>
                <span className="text-slate-900 font-bold">
                  {completedCriteriaCount} / {totalCriteriaCount}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#0057B8] to-[#16A34A] rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedCriteriaCount / totalCriteriaCount) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Submission Safety Notice */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Submitting will immediately record official marks and update the live stadium leaderboard.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Button
                variant="orange"
                size="lg"
                className="w-full py-3 text-sm font-extrabold shadow-md"
                icon={<Send className="w-4 h-4" />}
                onClick={() => setShowConfirmModal(true)}
              >
                SUBMIT SCORE ({totalScore}/{maxScore})
              </Button>

              <Button
                variant="secondary"
                size="md"
                className="w-full text-xs font-bold"
                icon={<Save className="w-3.5 h-3.5" />}
                onClick={saveEvaluationDraft}
              >
                {isDraftSaved ? 'Draft Saved ✓' : 'Save Draft Locally'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit Official Evaluation?"
        subtitle="Confirm evaluation score locking for Techno Talent Feast"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#EAF3FF] border border-blue-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              Candidate Score
            </span>
            <p className="text-3xl font-black text-[#0057B8] mt-0.5">
              {totalScore} / {maxScore} ({percentage}%)
            </p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {participant.name} ({participant.schoolName})
            </p>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Once submitted, this evaluation will be locked and reflected in real-time on the Admin command console and public live leaderboard.
          </p>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="orange"
              size="sm"
              onClick={() => {
                setShowConfirmModal(false);
                submitEvaluation();
              }}
            >
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
