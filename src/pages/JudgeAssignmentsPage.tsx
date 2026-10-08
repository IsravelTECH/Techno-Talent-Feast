import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  ClipboardList,
  Search,
  Filter,
  Trophy,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const JudgeAssignmentsPage: React.FC = () => {
  const {
    currentUser,
    assignments,
    participants,
    competitions,
    loadParticipantForScoring,
    navigate
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const myAssignments = assignments.filter(
    a => a.judgeId === currentUser.id || a.judgeName === currentUser.name || a.judgeId === 'JDG-001'
  );

  const filtered = myAssignments.filter((a) => {
    const matchesSearch =
      a.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.schoolName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              My Assigned Participant Delegations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              {myAssignments.length} Assigned Teams
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Juror: <strong className="text-slate-900">{currentUser.name}</strong> • Category: <strong className="text-[#0057B8]">{currentUser.assignedCategory || 'Category 1'}</strong>
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
            Launch Scoring Pad
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assigned finalist or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-semibold"
        >
          <option value="ALL">All Evaluation Statuses</option>
          <option value="ASSIGNED">Assigned / Waiting</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed & Locked</option>
        </select>
      </div>

      {/* Assignments Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((asgn) => {
          const part = participants.find(p => p.id === asgn.participantId);
          const isCompleted = asgn.status === 'COMPLETED';

          return (
            <div
              key={asgn.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'bg-emerald-50/30 border-emerald-200 shadow-xs'
                  : 'bg-white border-slate-200 shadow-card hover:border-[#0057B8]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
                    {isCompleted ? 'EVALUATED' : 'AWAITING SCORE'}
                  </Badge>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {asgn.participantId}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <img
                    src={part?.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={asgn.participantName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{asgn.participantName}</h3>
                    <p className="text-xs text-slate-500 font-medium">{asgn.schoolName}</p>
                    <p className="text-xs font-bold text-[#0057B8] mt-1">{asgn.projectTitle}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <p><strong>Category:</strong> {asgn.competitionName}</p>
                  <p><strong>Scheduled:</strong> Hall A - Table C1-04 (10:30 AM)</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                {isCompleted ? (
                  <span className="text-xs font-black font-mono text-emerald-700">
                    Score: {asgn.totalScore} / 100
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">100-Pt Rubric</span>
                )}

                <Button
                  variant={isCompleted ? 'outline' : 'orange'}
                  size="xs"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                  onClick={() => {
                    loadParticipantForScoring(asgn.participantId);
                    navigate('scoring', { partId: asgn.participantId, compId: asgn.competitionId });
                  }}
                >
                  {isCompleted ? 'Review Marks' : 'Score Now'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
