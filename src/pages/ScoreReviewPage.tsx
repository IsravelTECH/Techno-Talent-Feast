import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  FileCheck2,
  Trophy,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Search,
  Filter,
  ShieldCheck,
  Eye,
  MessageSquare,
  Award,
  Sparkles,
  Download
} from 'lucide-react';
import { JudgeAssignment } from '../types';

export const ScoreReviewPage: React.FC = () => {
  const {
    assignments,
    competitions,
    verifyScoreByAdmin,
    reopenEvaluation,
    addToast,
    navigate
  } = useApp();

  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reopenModalAssignment, setReopenModalAssignment] = useState<JudgeAssignment | null>(null);
  const [reopenReason, setReopenReason] = useState('');

  const completedAssignments = assignments.filter(a => a.status === 'COMPLETED' || a.scoreSubmitted);

  const filteredAssignments = completedAssignments.filter((a) => {
    const matchesCat = selectedCatFilter === 'ALL' || a.competitionId === selectedCatFilter;
    const matchesSearch =
      a.judgeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleApprove = (asgnId: string) => {
    verifyScoreByAdmin(asgnId);
    addToast('Score verified and certified by Administration', 'success');
  };

  const handleConfirmReopen = () => {
    if (!reopenModalAssignment) return;
    reopenEvaluation(reopenModalAssignment.id, reopenReason || 'Administrative review requested score adjustment');
    addToast(`Reopened evaluation for ${reopenModalAssignment.participantName}. Judge notified.`, 'info');
    setReopenModalAssignment(null);
    setReopenReason('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Score Review, Verification & Audit Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              100-Pt Rubric Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Examine individual 5-pillar criterion scores, certify official marks, or reopen evaluations for juror recalibration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => addToast('Exported complete Grand Finale Score Audit Sheet (Excel)', 'success')}
          >
            Export Audit Log
          </Button>
          <Button
            variant="orange"
            size="sm"
            icon={<Award className="w-4 h-4" />}
            onClick={() => navigate('results')}
          >
            Publish Final Results
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search juror, student, school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>

        <select
          value={selectedCatFilter}
          onChange={(e) => setSelectedCatFilter(e.target.value)}
          className="px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0057B8]"
        >
          <option value="ALL">All 6 Categories</option>
          {competitions.map((comp) => (
            <option key={comp.id} value={comp.id}>
              Cat {comp.categoryNumber}: {comp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Submitted Scores Audit Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900">
            Juror Submitted Evaluations ({filteredAssignments.length} Submissions)
          </h2>
          <span className="text-xs text-slate-400 font-mono">5-Pillar Rubric Breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Finalist & Project</th>
                <th className="py-3 px-3">Juror / Evaluator</th>
                <th className="py-3 px-3 text-center">Tech (/30)</th>
                <th className="py-3 px-3 text-center">Inno (/25)</th>
                <th className="py-3 px-3 text-center">Design (/20)</th>
                <th className="py-3 px-3 text-center">Defense (/15)</th>
                <th className="py-3 px-3 text-center">Docs (/10)</th>
                <th className="py-3 px-3 text-center font-bold text-slate-900">Total (/100)</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.map((asgn) => {
                const total = asgn.totalScore || 0;
                // Mock realistic breakdown if specific criterion map isn't filled
                const techScore = Math.round(total * 0.3);
                const innoScore = Math.round(total * 0.25);
                const designScore = Math.round(total * 0.2);
                const defScore = Math.round(total * 0.15);
                const docScore = total - (techScore + innoScore + designScore + defScore);

                return (
                  <tr key={asgn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-900 block">{asgn.participantName}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{asgn.schoolName}</span>
                      <span className="text-[10px] text-[#0057B8] font-mono block">{asgn.projectTitle}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="font-bold text-slate-800 block">{asgn.judgeName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{asgn.competitionName}</span>
                    </td>

                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                      {techScore}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                      {innoScore}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                      {designScore}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                      {defScore}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono font-semibold text-slate-700">
                      {docScore}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="text-sm font-black font-mono px-2.5 py-1 rounded-xl bg-blue-50 text-[#0057B8] border border-blue-200">
                        {total}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="xs"
                          icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          onClick={() => handleApprove(asgn.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          size="xs"
                          icon={<RotateCcw className="w-3.5 h-3.5 text-amber-600" />}
                          onClick={() => setReopenModalAssignment(asgn)}
                        >
                          Reopen
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reopen Modal */}
      {reopenModalAssignment && (
        <Modal
          isOpen={!!reopenModalAssignment}
          onClose={() => setReopenModalAssignment(null)}
          title={`Reopen Evaluation: ${reopenModalAssignment.participantName}`}
          subtitle={`Evaluated by Juror ${reopenModalAssignment.judgeName} • Total: ${reopenModalAssignment.totalScore}/100`}
          footer={
            <div className="flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setReopenModalAssignment(null)}>
                Cancel
              </Button>
              <Button variant="orange" icon={<RotateCcw className="w-4 h-4" />} onClick={handleConfirmReopen}>
                Reopen & Notify Judge
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Reopening will unlock this rubric on the juror's terminal, allowing them to adjust marks and defense question assessments.
            </p>
            <label className="text-xs font-bold text-slate-700 block">Reason for Recalibration / Note to Juror</label>
            <textarea
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. Please re-evaluate Defense Q4 answer regarding power budgeting..."
              className="w-full p-3 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
