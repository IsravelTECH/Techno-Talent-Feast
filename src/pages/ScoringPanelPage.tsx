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
  Users,
  Building2,
  Clock,
  Radio,
  ArrowRight,
  Layers,
  HelpCircle,
  CheckSquare
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
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('cat-6');
  const [activeDefenseChecks, setActiveDefenseChecks] = useState<Record<string, boolean>>({
    'q1': true,
    'q2': true,
    'q3': true,
    'q4': true,
    'q5': false,
    'q6': true,
    'q7': true
  });

  const activeComp =
    competitions.find((c) => c.id === selectedCompetitionId) || competitions[0];
  const participant =
    participants.find((p) => p.id === selectedParticipantId) || participants[0];
  const rubric = rubrics[activeComp.rubricId] || rubrics['rub-ttf-cat6'] || Object.values(rubrics)[0];

  // Total Score Calculation
  const totalScore = Object.values(activeCriterionScores).reduce((a, b) => a + Number(b || 0), 0);
  const maxScore = rubric.maxScore || 100;
  const percentage = Math.round((totalScore / maxScore) * 100);

  // Filter participants by active category
  const categoryParticipants = participants.filter(
    (p) => p.competitionId === activeComp.id || p.categoryNumber === activeComp.categoryNumber
  );

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

  const toggleDefenseCheck = (key: string) => {
    setActiveDefenseChecks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getGradeAssessment = (pct: number) => {
    if (pct >= 90) return { label: 'Outstanding (Gold Standard)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (pct >= 80) return { label: 'Excellent (Silver Standard)', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (pct >= 70) return { label: 'Very Good (Bronze Standard)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (pct >= 60) return { label: 'Satisfactory (Pass)', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    return { label: 'Needs Improvement', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const gradeInfo = getGradeAssessment(percentage);

  // 7 Official Defense Questions from TTF Booklet
  const officialDefenseQuestions = [
    { id: 'q1', q: 'What real-world problem are you solving?' },
    { id: 'q2', q: 'How does your technology prototype / code work?' },
    { id: 'q3', q: 'Why did your team choose this specific project?' },
    { id: 'q4', q: 'What programming languages / hardware did you use?' },
    { id: 'q5', q: 'What technical difficulties did you face & overcome?' },
    { id: 'q6', q: 'How did you test your project under stress scenarios?' },
    { id: 'q7', q: 'What future upgrades or improvements would you make?' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-6">
      {/* Top Header Bar */}
      <div className="bg-white p-5 lg:p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] border border-blue-200 flex items-center justify-center text-[#0057B8] shrink-0 font-bold shadow-xs">
            <FileCheck2 className="w-6 h-6 text-[#0057B8]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Judge Marks Entry & Scoring Panel
              </h1>
              <Badge variant="live" dot>
                LIVE ARENA SCORING
              </Badge>
              <Badge variant="primary">
                Official 100-pt Rubric
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Juror: <strong>{currentUser.name}</strong> • 6 Categories × 4 Projects • Team Projects (1 to 5 members)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick participant selector */}
          <select
            value={participant.id}
            onChange={(e) => loadParticipantForScoring(e.target.value)}
            className="px-3.5 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0057B8]"
          >
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.teamName || p.name} ({p.schoolName.split(' ')[0]}) - {p.participantId}
              </option>
            ))}
          </select>

          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={resetActiveScore}
          >
            Reset Scores
          </Button>
        </div>
      </div>

      {/* 6 Category Quick Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        {competitions.map((comp) => {
          const isActive = comp.id === activeComp.id;
          return (
            <button
              key={comp.id}
              onClick={() => navigate('scoring', { compId: comp.id })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#0057B8] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{comp.name.split(':')[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {comp.gradeEligibility}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 3-Column Scoring Desk Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Team Dossier & Group Members Roster */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="relative inline-block">
                <img
                  src={participant.photo}
                  alt={participant.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-200 ring-4 ring-blue-50 shadow-md mx-auto"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>

              <h2 className="text-base font-black text-slate-900 mt-2.5 leading-tight">
                {participant.teamName || participant.name}
              </h2>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-[10px] font-mono font-bold">
                  {participant.participantId}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#F36C21] text-[10px] font-bold border border-orange-100">
                  {participant.teamSize || 4} Members Team
                </span>
              </div>
            </div>

            {/* School & Grade info */}
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#F36C21] shrink-0" />
                <span className="font-semibold text-slate-800">{participant.schoolName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#0057B8] shrink-0" />
                <span>{activeComp.name} • {participant.city}</span>
              </div>
            </div>

            {/* Group Project Roster (Min 1, Max 4 to 5 members) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#0057B8]" />
                  <span>Team Members Roster ({participant.teamMembers?.length || participant.teamSize || 4})</span>
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Verified Quota
                </span>
              </div>

              <div className="space-y-1.5">
                {participant.teamMembers?.map((member, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-[#F6F9FD] border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-100 text-[#0057B8] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-[11px] leading-tight">{member.name}</p>
                        <p className="text-[10px] text-slate-500">{member.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                      Gr. {member.grade}
                    </span>
                  </div>
                )) || (
                  <p className="text-xs text-slate-500 italic">Solo Participant Entry</p>
                )}
              </div>
            </div>

            {/* Selected Project Card from Booklet */}
            <div className="p-3.5 rounded-2xl bg-[#EAF3FF] border border-blue-100 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0057B8] block mb-1">
                Official Category Project (1 of 4)
              </span>
              <p className="font-black text-slate-900 leading-snug">
                {participant.projectTitle || participant.selectedProjectTitle}
              </p>
              <p className="text-slate-600 mt-1.5 text-[11px] leading-relaxed line-clamp-3">
                {participant.projectSummary}
              </p>
            </div>
          </div>

          {/* Student Defense Checklist (7 Core Questions from Booklet) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#0057B8]" />
                <span>Defense Evaluation Questions</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500">
                {Object.values(activeDefenseChecks).filter(Boolean).length}/7 Asked
              </span>
            </div>

            <div className="space-y-1.5">
              {officialDefenseQuestions.map((item) => (
                <label
                  key={item.id}
                  onClick={() => toggleDefenseCheck(item.id)}
                  className="flex items-start gap-2 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-[11px] text-slate-700 select-none"
                >
                  <input
                    type="checkbox"
                    checked={!!activeDefenseChecks[item.id]}
                    onChange={() => {}}
                    className="mt-0.5 rounded border-slate-300 text-[#0057B8] focus:ring-0 shrink-0"
                  />
                  <span className={activeDefenseChecks[item.id] ? 'text-slate-900 font-semibold' : 'text-slate-500'}>
                    {item.q}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Official 5-Criterion Rubric Scoring Desk */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {rubric.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter marks according to the 5 official criteria below (Total: 100 pts)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-extrabold">
                {completedCriteriaCount}/{totalCriteriaCount} Graded
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
                          <span className="w-6 h-6 rounded-lg bg-[#0057B8] text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-900">
                            {crit.name}
                          </h4>
                          <span className="text-[10px] font-bold text-[#0057B8] bg-blue-50 px-2 py-0.5 rounded-full">
                            {crit.maxMarks} pts ({crit.maxMarks}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 pl-8 leading-relaxed">
                          {crit.description}
                        </p>
                      </div>

                      {/* Interactive Steppers & Direct Input */}
                      <div className="flex items-center gap-2.5 shrink-0 pl-8 sm:pl-0">
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

                    {/* Quick Preset Marks Pills */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] pl-8 flex-wrap gap-1">
                      <span className="text-slate-400 font-semibold">Quick Marks:</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[0.6, 0.75, 0.85, 0.92, 1.0].map((ratio) => {
                          const val = Math.round(crit.maxMarks * ratio);
                          return (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setCriterionScore(crit.id, val)}
                              className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                                score === val
                                  ? 'bg-[#0057B8] text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              {val} pts ({Math.round(ratio * 100)}%)
                            </button>
                          );
                        })}
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
                <span>Juror Remarks / Team Assessment</span>
              </label>
              <textarea
                rows={3}
                value={activeScoreComments}
                onChange={(e) => setActiveComments(e.target.value)}
                placeholder="Provide constructive feedback on engineering mechanics, code architecture, and live defense..."
                className="w-full p-3 bg-[#F6F9FD] border border-slate-200 rounded-2xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#0057B8] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Score Summary, Breakdown & Submission */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-6 rounded-3xl border-2 border-blue-200/80 shadow-card space-y-5">
            <div className="text-center pb-4 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Score
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

              <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#EAF3FF] text-[#0057B8] text-sm font-black">
                  {percentage}%
                </span>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${gradeInfo.color}`}>
                  {gradeInfo.label}
                </span>
              </div>
            </div>

            {/* Criteria Progress */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 font-semibold">
                <span>Criteria Evaluated</span>
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

            {/* Criteria Marks Snapshot */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
              <span className="font-bold text-slate-600 block uppercase tracking-wider text-[10px]">
                Score Breakdown
              </span>
              {rubric.criteria.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-slate-600">
                  <span className="truncate max-w-[140px]">{c.name.split(' ')[0]} {c.name.split(' ')[1] || ''}:</span>
                  <span className="font-bold text-slate-900">
                    {activeCriterionScores[c.id] || 0} / {c.maxMarks}
                  </span>
                </div>
              ))}
            </div>

            {/* Submission Notice */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Locks official marks and synchronizes real-time standings on the live arena jumbotron.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <Button
                variant="orange"
                size="lg"
                className="w-full py-3 text-sm font-extrabold shadow-md"
                icon={<Send className="w-4 h-4" />}
                onClick={() => setShowConfirmModal(true)}
              >
                SUBMIT OFFICIAL SCORE ({totalScore}/100)
              </Button>

              <Button
                variant="secondary"
                size="md"
                className="w-full text-xs font-bold"
                icon={<Save className="w-3.5 h-3.5" />}
                onClick={saveEvaluationDraft}
              >
                {isDraftSaved ? 'Draft Saved Locally ✓' : 'Save Draft Locally'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Lock & Submit Official Marks?"
        subtitle="Techno Talent Feast 2026 Juror Evaluation"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#EAF3FF] border border-blue-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              Team Score Locked
            </span>
            <p className="text-3xl font-black text-[#0057B8] mt-0.5">
              {totalScore} / {maxScore} ({percentage}%)
            </p>
            <p className="text-xs font-bold text-slate-800 mt-1">
              {participant.teamName || participant.name} ({participant.schoolName})
            </p>
          </div>

          <p className="text-slate-600 leading-relaxed">
            This submission will permanently log juror <strong>{currentUser.name}</strong>'s marks for <strong>{participant.projectTitle}</strong> in <strong>{activeComp.name}</strong>.
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
              Confirm & Lock Marks
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
