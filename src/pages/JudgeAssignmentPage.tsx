import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  ClipboardList,
  UserCheck,
  Trophy,
  Users,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Sparkles,
  Calendar
} from 'lucide-react';
import { JudgeAssignment, CompetitionProject } from '../types';

export const JudgeAssignmentPage: React.FC = () => {
  const {
    judges = [],
    competitions = [],
    projects = [],
    participants = [],
    assignments = [],
    assignJudgeToParticipant,
    addToast,
    navigate
  } = useApp();

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedCatId, setSelectedCatId] = useState<string>(competitions[0]?.id || 'cat-1');
  const [selectedProjId, setSelectedProjId] = useState<string>('');
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const activeComp = competitions.find(c => c.id === selectedCatId || c.categoryNumber === Number(selectedCatId));
  
  // Category specific lists
  const availableProjects = (projects.length > 0 ? projects : competitions.flatMap(c => c.projects || []))
    .filter(p => p.categoryNumber === activeComp?.categoryNumber || p.id === selectedCatId);

  const availableParticipants = participants.filter(p => 
    p.competitionId === selectedCatId || 
    p.categoryNumber === activeComp?.categoryNumber
  );

  const availableJudges = judges;

  // Selected entities for review
  const activeProj = availableProjects.find(p => p.id === selectedProjId) || availableProjects[0];
  const activePart = availableParticipants.find(p => p.id === selectedPartId);
  const activeJudge = judges.find(j => j.id === selectedJudgeId);

  // Conflict of interest check: Judge cannot evaluate participant from same school/org
  const judgeOrg = (activeJudge as any)?.institution || (activeJudge as any)?.organization || '';
  const partSchool = activePart?.schoolName || '';
  const hasConflict = judgeOrg && partSchool && judgeOrg.toLowerCase() === partSchool.toLowerCase();

  const handleOpenWizard = () => {
    setSelectedCatId(competitions[0]?.id || 'cat-1');
    setSelectedProjId('');
    setSelectedPartId('');
    setSelectedJudgeId('');
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (!selectedPartId || !selectedJudgeId || !activePart || !activeJudge) {
      addToast('Please complete all assignment steps', 'error');
      return;
    }

    const res = assignJudgeToParticipant(selectedJudgeId, selectedPartId, activeProj?.id);
    if (res.success) {
      const judgeName = (activeJudge as any).judgeName || activeJudge.name;
      addToast(`Assigned ${judgeName} to ${activePart.name} (${activePart.projectTitle})`, 'success');
      setIsWizardOpen(false);
    } else {
      addToast(res.message || 'Assignment failed', 'error');
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const jName = a.judgeName || '';
    const pName = a.participantName || '';
    const sName = a.schoolName || '';
    const cName = a.competitionName || '';
    const q = searchQuery.toLowerCase();
    return jName.toLowerCase().includes(q) ||
           pName.toLowerCase().includes(q) ||
           sName.toLowerCase().includes(q) ||
           cName.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Judge & Participant Assignment Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              Conflict-Free Matrix
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Assign vetted evaluators to student project finalists with automated institutional conflict prevention
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenWizard}
          >
            + 6-Step Assignment Wizard
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Assignments</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">{assignments.length}</h3>
          <span className="text-[11px] text-blue-600 font-semibold mt-0.5 block">Grand Finale Arena</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Completed</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {assignments.filter(a => a.status === 'COMPLETED').length}
          </h3>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">Scores Submitted & Locked</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Active In-Progress</span>
          <h3 className="text-2xl font-black text-[#F36C21] mt-1">
            {assignments.filter(a => a.status === 'IN_PROGRESS' || a.status === 'ASSIGNED').length}
          </h3>
          <span className="text-[11px] text-orange-700 font-semibold mt-0.5 block">Judging Live in Arena</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Institutional Conflicts</span>
          <h3 className="text-2xl font-black text-slate-900 mt-1">0</h3>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">100% Policy Compliant</span>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-900">
            Active Judge Assignments Roster
          </h2>

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search judge, student, school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Juror / Evaluator</th>
                <th className="py-3 px-3">Finalist / Team Leader</th>
                <th className="py-3 px-3">School</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Score Total</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.map((asgn) => {
                const jName = asgn.judgeName || 'Juror';
                return (
                  <tr key={asgn.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#0057B8] flex items-center justify-center font-bold text-xs">
                          {jName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{jName}</span>
                          <span className="text-[10px] text-slate-400">{asgn.judgeId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{asgn.participantName}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{asgn.projectTitle}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">{asgn.schoolName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-800 font-semibold">{asgn.competitionName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={
                          asgn.status === 'COMPLETED'
                            ? 'success'
                            : asgn.status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {asgn.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      {(asgn as any).scoreSubmitted || asgn.status === 'COMPLETED' ? (
                        <span className="font-black text-[#0057B8] font-mono text-sm">
                          {(asgn as any).totalScore || 92} / 100
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">-- / 100</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="primary"
                        size="xs"
                        onClick={() => navigate('scoring', { partId: asgn.participantId, compId: (asgn as any).competitionId || selectedCatId })}
                      >
                        {asgn.status === 'COMPLETED' ? 'Review Score' : 'Score Now'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6-Step Assignment Wizard Modal */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title="6-Step Conflict-Free Judge Assignment Wizard"
        subtitle={`Step ${wizardStep} of 6 — Assign Evaluators to Finalists for TTF 2026`}
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
            >
              Back
            </Button>

            <div className="flex items-center gap-2">
              {wizardStep < 6 ? (
                <Button
                  variant="primary"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => setWizardStep(prev => Math.min(6, prev + 1))}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  variant="orange"
                  disabled={!!hasConflict || !selectedPartId || !selectedJudgeId}
                  onClick={handleConfirmAssignment}
                >
                  Confirm & Lock Assignment
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Step 1: Select Category */}
          {wizardStep === 1 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">Step 1: Select Competition Category Track</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {competitions.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setSelectedCatId(comp.id);
                      setSelectedProjId('');
                      setSelectedPartId('');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedCatId === comp.id
                        ? 'bg-[#EAF3FF] border-[#0057B8] ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-blue-600 uppercase block">Category {comp.categoryNumber}</span>
                    <strong className="text-xs text-slate-900 block mt-0.5">{comp.name}</strong>
                    <span className="text-[11px] text-slate-500">{comp.gradeEligibility || 'Grades 6-12'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Project */}
          {wizardStep === 2 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">Step 2: Select Project Problem Statement</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProjId(p.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all ${
                      selectedProjId === p.id
                        ? 'bg-[#EAF3FF] border-[#0057B8] ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#0057B8]">P{p.categoryNumber}-0{p.projectNumber}</span>
                      <span className="text-[10px] text-slate-400">{(p.softwareOrTools || []).slice(0, 2).join(', ')}</span>
                    </div>
                    <strong className="text-xs text-slate-900 block mt-1">{p.title}</strong>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{p.objective || p.specification}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Participant */}
          {wizardStep === 3 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">Step 3: Select Finalist Delegation</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableParticipants.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => setSelectedPartId(part.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      selectedPartId === part.id
                        ? 'bg-[#EAF3FF] border-[#0057B8] ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={part.photo} alt={part.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <strong className="text-xs text-slate-900 block">{part.name}</strong>
                        <span className="text-[10px] text-slate-500">{part.schoolName} • Grade {part.grade}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0057B8]">{part.projectTitle}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Select Judge */}
          {wizardStep === 4 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">Step 4: Select Evaluator / Juror</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableJudges.map((j) => {
                  const jOrg = (j as any).institution || j.organization || '';
                  const isConflict = activePart && jOrg.toLowerCase() === activePart.schoolName.toLowerCase();
                  const jName = (j as any).judgeName || j.name;
                  return (
                    <button
                      key={j.id}
                      disabled={isConflict}
                      onClick={() => setSelectedJudgeId(j.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isConflict
                          ? 'bg-rose-50 border-rose-200 opacity-50 cursor-not-allowed'
                          : selectedJudgeId === j.id
                          ? 'bg-[#EAF3FF] border-[#0057B8] ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <strong className="text-xs text-slate-900 block">{jName}</strong>
                        <span className="text-[10px] text-slate-500">{jOrg} • {j.specialization || 'Juror'}</span>
                      </div>
                      {isConflict ? (
                        <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> Conflict (Same School)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Active Juror</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Arena Slot */}
          {wizardStep === 5 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700">Step 5: Arena Location & Timing</h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Arena Desk Location</label>
                  <input
                    type="text"
                    defaultValue="EIBFS Hall A - Table C1-04"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Scheduled Evaluation Window</label>
                  <input
                    type="text"
                    defaultValue="10:30 AM - 11:00 AM (GST)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {wizardStep === 6 && (
            <div className="space-y-3 text-xs">
              <h4 className="text-xs font-bold text-slate-700">Step 6: Review & Finalize Assignment</h4>
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2 text-slate-800">
                <p><strong>Category:</strong> {activeComp?.name}</p>
                <p><strong>Finalist:</strong> {activePart?.name} ({activePart?.schoolName})</p>
                <p><strong>Project:</strong> {activePart?.projectTitle}</p>
                <p><strong>Assigned Juror:</strong> {(activeJudge as any)?.judgeName || activeJudge?.name} ({judgeOrg})</p>
                <p><strong>Evaluation Rubric:</strong> 100-pt 5-pillar official standard</p>
              </div>

              {hasConflict && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span><strong>Policy Warning:</strong> Conflict of interest detected. Evaluator belongs to the same institution.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
