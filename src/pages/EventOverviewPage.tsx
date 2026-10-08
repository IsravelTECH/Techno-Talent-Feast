import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EventStage } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Award,
  Radio,
  FileCheck2,
  FolderKanban,
  Coins
} from 'lucide-react';

export const EventOverviewPage: React.FC = () => {
  const { selectedEvent, schools, competitions, participants, setEventStage, navigate, addToast } = useApp();
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [targetStage, setTargetStage] = useState<EventStage>(selectedEvent.currentStage || 'GRAND_FINALE');

  const stageOrder: { id: EventStage; label: string; desc: string }[] = [
    { id: 'REGISTRATION', label: '1. School Registration', desc: '48 Schools register technology delegations' },
    { id: 'SCHOOL_PRELIMINARY', label: '2. School Preliminaries', desc: 'Internal selection across 6 categories' },
    { id: 'FINALIST_VERIFICATION', label: '3. Finalist Verification', desc: 'Strict 12 finalists quota (2 per category)' },
    { id: 'GRAND_FINALE', label: '4. Grand Finale at EIBFS', desc: 'Live scoring arena with 36 jurors' },
    { id: 'RESULTS_PUBLISHED', label: '5. Results & Awards', desc: 'Official championship trophies & rank lists' }
  ];

  const handleStageTransition = () => {
    setEventStage(targetStage);
    setIsTransitionModalOpen(false);
    addToast(`Event stage updated to: ${targetStage.replace('_', ' ')}`, 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Grand Finale Hero Banner */}
      <div className="bg-gradient-to-br from-[#003B7A] via-[#0057B8] to-[#03A695] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-[#FF8A3D]">
              <Sparkles className="w-3.5 h-3.5" />
              Championship Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {selectedEvent.name}
            </h1>
            <p className="text-sm text-blue-100 italic font-medium">
              "{selectedEvent.slogan}"
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100 pt-1">
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <Calendar className="w-4 h-4 text-[#FF8A3D]" />
                <strong>Grand Finale:</strong> {selectedEvent.grandFinaleDate}
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <MapPin className="w-4 h-4 text-[#FF8A3D]" />
                <strong>Venue:</strong> {selectedEvent.venue} ({selectedEvent.city})
              </span>
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <Coins className="w-4 h-4 text-[#FF8A3D]" />
                <strong>Fee:</strong> {selectedEvent.registrationFeeAED} AED / Student
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              variant="orange"
              size="lg"
              icon={<Radio className="w-5 h-5 animate-pulse" />}
              onClick={() => navigate('live-control')}
            >
              Open Live Event Control
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={<Clock className="w-4 h-4" />}
              onClick={() => setIsTransitionModalOpen(true)}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Transition Event Stage
            </Button>
          </div>
        </div>
      </div>

      {/* Stage Progression Pipeline */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Competition Stage Progression
            </h2>
            <p className="text-xs text-slate-500">
              Current Active Stage: <strong className="text-[#0057B8]">{selectedEvent.currentStage?.replace('_', ' ')}</strong>
            </p>
          </div>
          <Badge variant="live" dot>Active Phase</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {stageOrder.map((st, idx) => {
            const isCurrent = selectedEvent.currentStage === st.id;
            const isPast = stageOrder.findIndex(s => s.id === selectedEvent.currentStage) > idx;

            return (
              <div
                key={st.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-[#EAF3FF] border-[#0057B8] shadow-sm ring-2 ring-blue-500/20'
                    : isPast
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    isCurrent ? 'bg-[#0057B8] text-white' : isPast ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isPast ? 'COMPLETED' : isCurrent ? 'IN PROGRESS' : 'UPCOMING'}
                  </span>
                  {isPast && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <h3 className={`text-xs font-bold ${isCurrent ? 'text-[#0057B8]' : isPast ? 'text-slate-800' : 'text-slate-500'}`}>
                  {st.label}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Essential TTF Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-blue-50 text-[#0057B8] border border-blue-100">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schools Enrolled</span>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">{schools.length}</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Top UAE Private & Int'l Schools</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-orange-50 text-[#F36C21] border border-orange-100">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</span>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">6 Tracks</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Grades 1 to 12 Spectrum</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-teal-50 text-[#03A695] border border-teal-100">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Championship Projects</span>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">24 Tasks</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">4 Projects per Category</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Finalist Quota</span>
            <h4 className="text-2xl font-black text-slate-900 mt-0.5">12 / School</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Strict 2 per Category Rule</p>
          </div>
        </div>
      </div>

      {/* Official Rule & Quota Matrix Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900">
              6 Official Categories & Grade Bands
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigate('categories')}>
              View Category Details
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {competitions.map((comp) => (
              <div key={comp.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-[#0057B8] shrink-0 shadow-xs">
                  C{comp.categoryNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{comp.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#0057B8]">
                      {comp.gradeBand}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{comp.tagline}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-600 font-medium mt-1.5">
                    <span>Projects: <strong>4</strong></span>
                    <span>•</span>
                    <span>Quota: <strong>2 Finalists</strong></span>
                    <span>•</span>
                    <span>Rubric: <strong>100 Pts</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Administration Venue & Logistics Quick Sheet */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            Grand Finale Venue Brief
          </h2>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#EAF3FF] border border-blue-200">
              <strong className="text-[#0057B8] block mb-1">Official Location</strong>
              <p className="text-slate-700">
                Emirates Institute of Banking and Financial Studies (EIBFS), Al Ruwayyah 2, Opposite Zayed University, Academic City, Dubai, UAE.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <strong className="text-amber-800 block mb-1">Key Directives</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                <li>School Technology Team: Exactly 12 finalists per school.</li>
                <li>All submissions evaluated on 100-pt rubric.</li>
                <li>7 Student Defense Questions mandatory for each team.</li>
                <li>No external coach or teacher interference during judging.</li>
              </ul>
            </div>

            <Button
              variant="primary"
              className="w-full"
              size="md"
              icon={<Award className="w-4 h-4" />}
              onClick={() => navigate('finalists')}
            >
              Manage School Finalist Rosters
            </Button>
          </div>
        </div>
      </div>

      {/* Stage Transition Modal */}
      <Modal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        title="Transition Competition Stage"
        subtitle="Update the active operational phase for Techno Talent Feast 2026"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsTransitionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" onClick={handleStageTransition}>
              Confirm Stage Change
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {stageOrder.map((st) => (
            <label
              key={st.id}
              onClick={() => setTargetStage(st.id as any)}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                targetStage === st.id
                  ? 'bg-[#EAF3FF] border-[#0057B8] ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="stage"
                checked={targetStage === st.id}
                onChange={() => setTargetStage(st.id as any)}
                className="mt-1 text-[#0057B8]"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900">{st.label}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
};
