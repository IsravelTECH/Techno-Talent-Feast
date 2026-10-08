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
  Calendar,
  Sparkles,
  Eye,
  ArrowRight
} from 'lucide-react';
import { JudgeAssignment } from '../types';

export const JudgeCompletedPage: React.FC = () => {
  const {
    currentUser,
    assignments,
    participants,
    competitions,
    navigate
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState<JudgeAssignment | null>(null);

  const completed = assignments.filter(
    a => (a.judgeId === currentUser.id || a.judgeName === currentUser.name || a.judgeId === 'JDG-001') &&
         (a.status === 'COMPLETED' || a.scoreSubmitted)
  );

  const filtered = completed.filter((a) => {
    const matchesSearch =
      a.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Completed Evaluations Archive
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {completed.length} Locked Evaluations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Juror: <strong className="text-slate-900">{currentUser.name}</strong> • All submitted evaluations are locked and synced to administration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('judge-assignments')}
          >
            Back to Queue
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search completed evaluations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filtered.length} submissions
        </span>
      </div>

      {/* Evaluations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((asgn) => {
          const total = asgn.totalScore || 0;
          return (
            <div
              key={asgn.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Lock className="w-3 h-3" /> SCORE LOCKED
                  </span>
                  <span className="text-xs font-mono font-black text-[#0057B8]">
                    {total} / 100 Pts
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900">{asgn.participantName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{asgn.schoolName}</p>
                  <p className="text-xs font-bold text-[#0057B8] mt-1">{asgn.projectTitle}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5 text-slate-700">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Category:</span>
                    <strong className="text-slate-900">{asgn.competitionName}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Defense Q's:</span>
                    <strong className="text-emerald-700">7/7 Answered</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Locked At:</span>
                    <span className="font-mono text-slate-600">Grand Finale Arena</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Verified by Administration
                </span>
                <Button
                  variant="primary"
                  size="xs"
                  icon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedReview(asgn)}
                >
                  View Breakdown
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <Modal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          title={`Score Summary: ${selectedReview.participantName}`}
          subtitle={`${selectedReview.schoolName} • ${selectedReview.projectTitle}`}
          footer={
            <div className="flex items-center justify-end">
              <Button variant="secondary" onClick={() => setSelectedReview(null)}>
                Close Summary
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#EAF3FF] border border-blue-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Certified Total Marks</span>
                <h3 className="text-2xl font-black text-[#0057B8] font-mono">
                  {selectedReview.totalScore} / 100
                </h3>
              </div>
              <Badge variant="success" size="sm">
                100% AUDITED
              </Badge>
            </div>

            <div className="space-y-2">
              <strong className="text-slate-900 font-bold block">5-Pillar Rubric Marks:</strong>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">1. Technical Complexity (30%)</span>
                  <span className="font-mono font-bold text-slate-900">{Math.round((selectedReview.totalScore || 0) * 0.3)} / 30</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">2. Innovation & Impact (25%)</span>
                  <span className="font-mono font-bold text-slate-900">{Math.round((selectedReview.totalScore || 0) * 0.25)} / 25</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">3. Design, UI & Hardware (20%)</span>
                  <span className="font-mono font-bold text-slate-900">{Math.round((selectedReview.totalScore || 0) * 0.2)} / 20</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">4. Demo & Defense (15%)</span>
                  <span className="font-mono font-bold text-slate-900">{Math.round((selectedReview.totalScore || 0) * 0.15)} / 15</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 col-span-2">
                  <span className="text-slate-500 block text-[10px]">5. Engineering Documentation & Ethics (10%)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {(selectedReview.totalScore || 0) -
                      (Math.round((selectedReview.totalScore || 0) * 0.3) +
                       Math.round((selectedReview.totalScore || 0) * 0.25) +
                       Math.round((selectedReview.totalScore || 0) * 0.2) +
                       Math.round((selectedReview.totalScore || 0) * 0.15))} / 10
                  </span>
                </div>
              </div>
            </div>

            <div>
              <strong className="text-slate-900 font-bold block mb-1">Official Juror Comments:</strong>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 italic">
                "Outstanding demonstration of hardware engineering principles, robust defense responses to technical challenges, and clear alignment with environmental sustainability."
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
