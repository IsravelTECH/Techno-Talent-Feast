import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  UserCheck,
  Search,
  Filter,
  Trophy,
  CheckCircle2,
  Clock,
  Plus,
  Shield,
  Phone,
  Mail,
  ArrowRight
} from 'lucide-react';

export const JudgesPage: React.FC = () => {
  const { judges, competitions, navigate, loginAs, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompFilter, setSelectedCompFilter] = useState('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const filteredJudges = judges.filter((j) => {
    const matchesSearch =
      j.judgeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.competitionName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesComp =
      selectedCompFilter === 'ALL' || j.competitionId === selectedCompFilter;
    return matchesSearch && matchesComp;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Judges & Evaluators Roster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              28 Active Judges
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitor evaluator completion rates, active scoring sessions, and assign competition tracks
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAssignModal(true)}
          >
            + Assign New Judge
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search evaluator name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>

        <select
          value={selectedCompFilter}
          onChange={(e) => setSelectedCompFilter(e.target.value)}
          className="px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
        >
          <option value="ALL">All Assigned Arenas</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Judges Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJudges.map((j) => {
          const completionPct = Math.round((j.completedCount / j.assignedCount) * 100);

          return (
            <div
              key={j.judgeId}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-blue-300 transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] border border-blue-200 flex items-center justify-center text-[#0057B8] font-bold text-base shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {j.judgeName}
                      </h3>
                      <p className="text-xs text-[#0057B8] font-semibold mt-0.5">
                        {j.competitionName}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant={j.status === 'ACTIVE' ? 'success' : 'warning'}
                    dot={j.status === 'ACTIVE'}
                    size="sm"
                  >
                    {j.status}
                  </Badge>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-2xl bg-[#F6F9FD] text-center text-xs">
                  <div>
                    <span className="block font-black text-slate-900">
                      {j.completedCount} / {j.assignedCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Evaluated ({completionPct}%)
                    </span>
                  </div>
                  <div>
                    <span className="block font-black text-[#F36C21]">
                      {j.pendingCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Pending
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0057B8] to-[#16A34A] rounded-full"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Last Activity: {j.lastActivity}</span>
                </p>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    loginAs('judge');
                    navigate('scoring');
                  }}
                >
                  Enter Judge Mode (Priya) →
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Judge Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Judge to Arena"
        subtitle="Authorize academic or industry evaluator credentials"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowAssignModal(false);
            addToast({
              type: 'success',
              title: 'Judge Assigned',
              message: 'Judge successfully credentialed for Techno Talent Feast.'
            });
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Judge Full Name & Title
            </label>
            <input
              type="text"
              defaultValue="Dr. K. Swaminathan (IIT Madras)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Assigned Competition
              </label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Assigned Quota
              </label>
              <input
                type="number"
                defaultValue={48}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAssignModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="orange" size="sm">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const JudgeDashboardPage: React.FC = () => {
  const { currentUser, competitions, participants, navigate, loadParticipantForScoring } = useApp();

  const activeComp = competitions.find((c) => c.id === 'comp-01') || competitions[0];
  const nextParticipant = participants.find((p) => p.id === 'part-01') || participants[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Judge Welcome Banner */}
      <div className="bg-gradient-to-r from-[#003B7A] via-[#0057B8] to-[#004899] text-white p-6 lg:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="orange" size="sm">
              Official Evaluator
            </Badge>
            <span className="text-xs font-semibold text-blue-200">
              {currentUser.organization}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Good Morning, {currentUser.name}
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Assigned Arena: <strong className="text-white">{activeComp.name}</strong> • Innovation Arena A
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="orange"
            size="lg"
            icon={<Trophy className="w-5 h-5" />}
            onClick={() => {
              loadParticipantForScoring(nextParticipant.id);
              navigate('scoring', { partId: nextParticipant.id, compId: activeComp.id });
            }}
          >
            START EVALUATION
          </Button>
        </div>
      </div>

      {/* Progress & Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total Assigned
          </span>
          <p className="text-3xl font-black text-slate-900 mt-1">48</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Participants</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Completed
          </span>
          <p className="text-3xl font-black text-emerald-600 mt-1">36</p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Locked & Synced</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pending
          </span>
          <p className="text-3xl font-black text-[#F36C21] mt-1">12</p>
          <span className="text-[11px] text-orange-700 font-semibold mt-1 block">In Queue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card text-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Scoring Rate
          </span>
          <p className="text-3xl font-black text-[#0057B8] mt-1">75%</p>
          <span className="text-[11px] text-blue-700 font-semibold mt-1 block">On Schedule</span>
        </div>
      </div>

      {/* Next Participant Highlight Card */}
      <div className="bg-white p-6 rounded-3xl border-2 border-[#0057B8]/30 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F36C21] animate-ping" />
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">
              Next Participant Ready in Arena
            </h3>
          </div>
          <Badge variant="live" size="sm">
            Live Queue #1
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={nextParticipant.photo}
              alt={nextParticipant.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-200 ring-2 ring-blue-50"
            />
            <div>
              <h2 className="text-xl font-black text-slate-900">{nextParticipant.name}</h2>
              <p className="text-xs text-[#0057B8] font-mono font-bold">
                {nextParticipant.participantId} • {nextParticipant.schoolName}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-semibold">
                Project: {nextParticipant.projectTitle}
              </p>
            </div>
          </div>

          <Button
            variant="orange"
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
            onClick={() => {
              loadParticipantForScoring(nextParticipant.id);
              navigate('scoring', { partId: nextParticipant.id, compId: activeComp.id });
            }}
          >
            START EVALUATION (SCORE)
          </Button>
        </div>
      </div>
    </div>
  );
};
