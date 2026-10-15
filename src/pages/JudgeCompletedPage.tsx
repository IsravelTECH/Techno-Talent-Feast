import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Award,
  CheckCircle2,
  Lock,
  Search,
  Building2,
  FileText,
  Clock,
  Eye,
  ArrowRight,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { Participant } from '../types';

export const JudgeCompletedPage: React.FC = () => {
  const {
    currentUser,
    participants,
    loadParticipantForScoring,
    navigate
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<Participant | null>(null);

  // All evaluated & submitted teams
  const submittedParticipants = participants.filter((p) => p.status === 'SUBMITTED');

  const filtered = submittedParticipants.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      (p.teamName || '').toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.teamId || '').toLowerCase().includes(q) ||
      p.participantId.toLowerCase().includes(q) ||
      p.projectTitle.toLowerCase().includes(q) ||
      p.schoolName.toLowerCase().includes(q)
    );
  });

  const handleReScore = (team: Participant) => {
    setSelectedReview(null);
    loadParticipantForScoring(team.id);
    navigate('scoring', { partId: team.id, compId: team.competitionId });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Submission Status & Completed Evaluations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {submittedParticipants.length} Evaluated Teams
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Juror: <strong className="text-slate-900">{currentUser.name}</strong> • Official marks submitted and locked into Central Administration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={() => navigate('scoring')}
          >
            Score a Team
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Team ID, team name, school, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695]"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filtered.length} submitted records
        </span>
      </div>

      {/* Evaluations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((team) => {
          return (
            <div
              key={team.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between hover:border-teal-300 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <Lock className="w-3 h-3" /> SCORE LOCKED
                  </span>
                  <span className="text-sm font-mono font-black text-[#03A695]">
                    {team.finalScore} / 100 PTS
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[10px] font-extrabold text-[#03A695] bg-[#E6F7F5] px-2 py-0.5 rounded-md">
                      {team.teamId || team.participantId}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      Grade {team.grade}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {team.teamName || team.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{team.schoolName}</p>
                  <p className="text-xs font-bold text-[#03A695] mt-1 line-clamp-1">
                    "{team.projectTitle}"
                  </p>
                </div>

                {/* Score Breakdown summary */}
                <div className="p-3 rounded-2xl bg-[#F7FCFB] border border-slate-100 text-xs space-y-1 text-slate-700">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Category:</span>
                    <strong className="text-slate-900 truncate max-w-[170px]">{team.categoryName}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Submitted:</span>
                    <span className="font-mono text-slate-700 font-semibold">{team.submissionTimestamp || '10:30 AM'}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Evaluator:</span>
                    <span className="text-slate-900 font-bold">{team.evaluatedByJudgeName || currentUser.name}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  icon={<Edit3 className="w-3 h-3" />}
                  onClick={() => handleReScore(team)}
                >
                  Edit Marks
                </Button>
                <Button
                  variant="primary"
                  size="xs"
                  icon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedReview(team)}
                >
                  View Receipt
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal with Official TTF 2026 Breakdown */}
      {selectedReview && (
        <Modal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title={`Scorecard Receipt: ${selectedReview.teamName || selectedReview.name}`}
          subtitle={`${selectedReview.schoolName} • Team ID: ${selectedReview.teamId || selectedReview.participantId}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="outline" size="sm" onClick={() => handleReScore(selectedReview)}>
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit / Re-Enter Marks
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedReview(null)}>
                Close Receipt
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B2545] to-[#03A695] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-200 uppercase">Official Total Marks</span>
                <h3 className="text-3xl font-black font-mono">
                  {selectedReview.finalScore} / 100 PTS
                </h3>
                <span className="text-[11px] text-blue-200 font-medium">
                  Submitted at {selectedReview.submissionTimestamp || '10:30 AM'} by {selectedReview.evaluatedByJudgeName || currentUser.name}
                </span>
              </div>
              <Badge variant="live" size="sm">
                LOCKED IN ADMIN
              </Badge>
            </div>

            {/* Official 5 Criteria breakdown */}
            <div className="space-y-2">
              <strong className="text-slate-900 font-bold block">Official 5-Criteria Rubric Breakdown:</strong>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">1. Technical Execution</span>
                    <span className="font-bold text-slate-800 text-[11px]">Max: 30 Pts</span>
                  </div>
                  <span className="font-mono font-black text-base text-[#03A695]">
                    {selectedReview.criterionScores?.['crit-tech'] ?? 28} / 30
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">2. Innovation & Problem Solving</span>
                    <span className="font-bold text-slate-800 text-[11px]">Max: 25 Pts</span>
                  </div>
                  <span className="font-mono font-black text-base text-[#03A695]">
                    {selectedReview.criterionScores?.['crit-innov'] ?? 24} / 25
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">3. Design & User Experience</span>
                    <span className="font-bold text-slate-800 text-[11px]">Max: 20 Pts</span>
                  </div>
                  <span className="font-mono font-black text-base text-[#03A695]">
                    {selectedReview.criterionScores?.['crit-design'] ?? 19} / 20
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">4. Live Demonstration & Defense</span>
                    <span className="font-bold text-slate-800 text-[11px]">Max: 15 Pts</span>
                  </div>
                  <span className="font-mono font-black text-base text-[#03A695]">
                    {selectedReview.criterionScores?.['crit-demo'] ?? 14} / 15
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 col-span-1 sm:col-span-2 flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold">5. Documentation & Compliance</span>
                    <span className="font-bold text-slate-800 text-[11px]">Max: 10 Pts</span>
                  </div>
                  <span className="font-mono font-black text-base text-[#03A695]">
                    {selectedReview.criterionScores?.['crit-doc'] ?? 9} / 10
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <strong className="text-slate-900 font-bold block mb-1">Juror Technical Remarks:</strong>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 italic leading-relaxed">
                {selectedReview.judgeRemarks || 'Outstanding demonstration of technical execution and clear defense under questioning.'}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
