import React from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { StatCard } from '../components/common/StatCard';
import {
  Trophy,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Users,
  Building2,
  FileCheck2,
  ShieldCheck,
  Radio,
  BookOpen
} from 'lucide-react';

export const JudgeDashboardPage: React.FC = () => {
  const {
    currentUser,
    assignments,
    participants,
    competitions,
    loadParticipantForScoring,
    navigate,
    triggerManagerScenario
  } = useApp();

  // Find assignments for this judge (or default to current juror assignments)
  const myAssignments = assignments.filter(a => a.judgeId === currentUser.id || a.judgeName === currentUser.name || a.judgeId === 'JDG-001');
  const pendingAssignments = myAssignments.filter(a => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS');
  const completedAssignments = myAssignments.filter(a => a.status === 'COMPLETED');

  // Next up in queue
  const nextAssignment = pendingAssignments[0] || myAssignments[0];
  const nextParticipant = nextAssignment ? participants.find(p => p.id === nextAssignment.participantId) || participants[0] : participants[0];
  const nextComp = nextAssignment ? competitions.find(c => c.id === nextAssignment.competitionId) || competitions[0] : competitions[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#003B7A] to-[#0057B8] p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-[#FF8A3D]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Official TTF 2026 Juror Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100">
            Assigned Category Track: <strong className="text-[#FF8A3D]">{(currentUser as any).assignedCategory || currentUser.specialization || 'Category 1: Robotics & Embedded Systems'}</strong> • EIBFS Arena Hall A
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="orange"
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
            onClick={() => {
              if (nextParticipant) {
                loadParticipantForScoring(nextParticipant.id);
                navigate('scoring', { partId: nextParticipant.id, compId: nextComp.id });
              } else {
                navigate('scoring');
              }
            }}
          >
            SCORE NEXT PARTICIPANT
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Assigned to Judge</span>
          <h3 className="text-3xl font-black text-slate-900 mt-1">{myAssignments.length || 8}</h3>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">Finalist Teams</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Evaluations Completed</span>
          <h3 className="text-3xl font-black text-emerald-600 mt-1">{completedAssignments.length || 6}</h3>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Locked & Verified</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Awaiting Evaluation</span>
          <h3 className="text-3xl font-black text-[#F36C21] mt-1">{pendingAssignments.length || 2}</h3>
          <span className="text-[11px] text-orange-700 font-semibold mt-1 block">Live in Queue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Rubric Standard</span>
          <h3 className="text-3xl font-black text-slate-900 mt-1">100 Pts</h3>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">5 Criteria + 7 Q's</span>
        </div>
      </div>

      {/* Primary Highlight: "What do I judge now?" */}
      {nextParticipant && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#0057B8] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#F36C21] animate-ping" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                CURRENTLY AT EVALUATION DESK (READY FOR JUDGING)
              </h2>
            </div>
            <Badge variant="live" size="sm">
              ACTIVE QUEUE #1
            </Badge>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <img
                src={nextParticipant.photo}
                alt={nextParticipant.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-200 shadow-md ring-4 ring-blue-50 shrink-0"
              />
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-black text-slate-900">{nextParticipant.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0057B8] text-xs font-bold">
                    Grade {nextParticipant.grade}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#0057B8]" />
                  {nextParticipant.schoolName} • ID: <span className="font-mono text-[#0057B8] font-bold">{nextParticipant.participantId}</span>
                </p>
                <p className="text-sm font-black text-slate-900 pt-1">
                  Project: <span className="text-[#0057B8]">{nextParticipant.projectTitle}</span>
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 max-w-xl">
                  {nextParticipant.projectSummary || nextParticipant.projectTitle}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Button
                variant="orange"
                size="lg"
                icon={<ArrowRight className="w-5 h-5" />}
                iconPosition="right"
                onClick={() => {
                  loadParticipantForScoring(nextParticipant.id);
                  navigate('scoring', { partId: nextParticipant.id, compId: nextComp.id });
                }}
              >
                START 100-PT EVALUATION
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* My Upcoming Queue */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              My Assigned Finalist Queue
            </h2>
            <p className="text-xs text-slate-500">
              Evaluations assigned to your judging pad
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('judge-assignments')}>
            View All My Assignments
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {myAssignments.slice(0, 4).map((asgn) => (
            <div key={asgn.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] text-[#0057B8] font-black text-xs flex items-center justify-center shrink-0">
                  {asgn.participantName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">{asgn.participantName}</h4>
                  <span className="text-[11px] text-slate-500">{asgn.schoolName} • {asgn.projectTitle}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <Badge variant={asgn.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                  {asgn.status === 'COMPLETED' ? 'SCORE LOCKED' : 'PENDING'}
                </Badge>
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    loadParticipantForScoring(asgn.participantId);
                    navigate('scoring', { partId: asgn.participantId, compId: asgn.competitionId });
                  }}
                >
                  {asgn.status === 'COMPLETED' ? 'View Marks' : 'Score Now'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
