import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Activity,
  Trophy,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Radio,
  Search,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye,
  Award
} from 'lucide-react';

export const ScoringMonitorPage: React.FC = () => {
  const { competitions, assignments, participants, scoringActivities, navigate, triggerManagerScenario, addToast } = useApp();
  const [selectedCatFilter, setSelectedCatFilter] = useState('ALL');

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'COMPLETED').length;
  const inProgressAssignments = assignments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'ASSIGNED').length;
  const overallRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Grand Finale Scoring Monitor
            </h1>
            <Badge variant="live" dot>
              REAL-TIME SYNC
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Live evaluation telemetry, juror submission velocity, and category completion pacing across EIBFS Arena
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={triggerManagerScenario}
          >
            Simulate Scoring (92%)
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Radio className="w-4 h-4" />}
            onClick={() => navigate('live-control')}
          >
            Live Arena Control
          </Button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Overall Pacing</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-[#0057B8]">{overallRate}%</h3>
            <span className="text-xs text-slate-500 font-bold">Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#0057B8] h-full rounded-full transition-all duration-500" style={{ width: `${overallRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Completed Evaluations</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-emerald-600">{completedAssignments}</h3>
            <span className="text-xs text-slate-500 font-bold">/ {totalAssignments} Finalists</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-2 block">Verified & Locked</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Active In-Arena</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-[#F36C21]">{inProgressAssignments}</h3>
            <span className="text-xs text-slate-500 font-bold">Queues</span>
          </div>
          <span className="text-[11px] text-orange-700 font-semibold mt-2 block">Judges Currently Scoring</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase">Average Score</span>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-slate-900">88.4</h3>
            <span className="text-xs text-slate-500 font-bold">/ 100 Pts</span>
          </div>
          <span className="text-[11px] text-blue-700 font-semibold mt-2 block">High Quality Submissions</span>
        </div>
      </div>

      {/* 6 Category Progress Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-black text-slate-900">
            6 Category Pacing & Completion Status
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            All 6 Categories tracked concurrently
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((comp) => {
            const compAssignments = assignments.filter(a => a.competitionId === comp.id);
            const compCompleted = compAssignments.filter(a => a.status === 'COMPLETED').length;
            const compTotal = compAssignments.length || 1;
            const compPct = Math.round((compCompleted / compTotal) * 100);

            return (
              <div key={comp.id} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-[#0057B8] text-xs font-black">
                    Category {comp.categoryNumber}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900">{compCompleted}/{compTotal} Evaluated</span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-900 truncate">{comp.name}</h3>
                  <p className="text-xs text-slate-500">{comp.gradeBand}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-[#0057B8]">{compPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#0057B8] to-[#03A695] h-full rounded-full transition-all duration-500"
                      style={{ width: `${compPct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">
                    Avg Score: <strong>89.2 / 100</strong>
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate('score-review')}
                  >
                    Review Scores
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Stream Activity Feed */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-black text-slate-900">
              Live Arena Evaluation Stream
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Auto-syncing every 3s</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {scoringActivities.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0057B8] flex items-center justify-center font-bold text-xs shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    <span className="text-[#0057B8]">{act.judgeName}</span> submitted evaluation for{' '}
                    <span className="text-slate-900">{act.participantName}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {act.competitionName} • Score: <strong className="text-emerald-600 font-mono">{act.score} / 100</strong>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 font-mono block">{act.time}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  LOCKED
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
