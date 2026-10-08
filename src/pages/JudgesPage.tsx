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
  ArrowRight,
  Building2,
  MapPin,
  Sparkles,
  Award,
  Layers,
  Activity,
  AlertCircle
} from 'lucide-react';

export const JudgesPage: React.FC = () => {
  const { judges, competitions, navigate, loginAs, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompFilter, setSelectedCompFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'IN_SESSION' | 'AVAILABLE'>('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // New Judge Form State
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeTitle, setNewJudgeTitle] = useState('Senior Evaluation Juror');
  const [newJudgeOrg, setNewJudgeOrg] = useState('');
  const [newJudgeEmail, setNewJudgeEmail] = useState('');
  const [newJudgePhone, setNewJudgePhone] = useState('');
  const [newJudgeCategory, setNewJudgeCategory] = useState('cat-6');
  const [newJudgeSpecialization, setNewJudgeSpecialization] = useState('Robotics & AI');

  // Filter judges safely
  const filteredJudges = judges.filter((j) => {
    const name = j.name || j.judgeName || '';
    const org = j.organization || j.institution || '';
    const spec = j.specialization || '';
    const catNames = j.assignedCategoryNames ? j.assignedCategoryNames.join(' ') : '';
    const compName = j.competitionName || '';

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
      compName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesComp =
      selectedCompFilter === 'ALL' ||
      j.competitionId === selectedCompFilter ||
      (j.assignedCategories && j.assignedCategories.some((cat) => `cat-${cat}` === selectedCompFilter || String(cat) === selectedCompFilter));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && (j.status === 'ACTIVE' || j.status === 'IN_SESSION')) ||
      j.status === statusFilter;

    return matchesSearch && matchesComp && matchesStatus;
  });

  // Calculate totals
  const totalJudges = judges.length;
  const inSessionCount = judges.filter((j) => j.status === 'IN_SESSION' || j.status === 'ACTIVE').length;
  const totalEvaluated = judges.reduce((sum, j) => sum + (j.completedCount || 0), 0);
  const totalAssigned = judges.reduce((sum, j) => sum + (j.assignedCount || 0), 0);
  const overallCompletionRate = totalAssigned > 0 ? Math.round((totalEvaluated / totalAssigned) * 100) : 0;

  const handleCreateJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudgeName.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide the evaluator full name.'
      });
      return;
    }

    setShowAssignModal(false);
    addToast({
      type: 'success',
      title: 'Juror Accredited & Roster Updated',
      message: `${newJudgeName} successfully accredited for ${newJudgeSpecialization}.`
    });

    // Reset Form
    setNewJudgeName('');
    setNewJudgeOrg('');
    setNewJudgeEmail('');
    setNewJudgePhone('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 lg:p-8 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Judges & Evaluators Roster
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#EAF3FF] text-[#0057B8] border border-blue-200 text-xs font-bold">
              {totalJudges} Accredited Jurors
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {inSessionCount} Active in Arenas
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Manage certified academic and industry jurors, monitor track scoring progress, and allocate evaluation batches across all 6 categories.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<Layers className="w-4 h-4" />}
            onClick={() => navigate('assignments')}
          >
            Assignment Matrix
          </Button>
          <Button
            variant="orange"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAssignModal(true)}
          >
            + Onboard Juror
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Accredited Jurors
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{totalJudges}</span>
            <span className="text-xs font-bold text-[#0057B8]">6 per Category</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Certified for Grand Finale</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Active in Session
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">{inSessionCount}</span>
            <span className="text-xs font-bold text-emerald-700">Live Arenas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Connected via scoring tablets</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Evaluations Completed
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#0057B8]">{totalEvaluated}</span>
            <span className="text-xs font-bold text-slate-500">/ {totalAssigned} total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{overallCompletionRate}% total completion rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Judging Standard
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#F36C21]">100 Pts</span>
            <span className="text-xs font-bold text-slate-500">5 Official Pillars</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Mandatory student defense</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by juror name, university, track, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#0057B8] text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center bg-[#F6F9FD] p-1 rounded-xl border border-slate-200 shrink-0">
            {(['ALL', 'IN_SESSION', 'ACTIVE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-[#0057B8] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st === 'IN_SESSION' ? 'In Session' : 'Active'}
              </button>
            ))}
          </div>

          {/* Arena / Category Filter */}
          <select
            value={selectedCompFilter}
            onChange={(e) => setSelectedCompFilter(e.target.value)}
            className="px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All 6 Categories</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                Category {c.categoryNumber}: {c.challengeTitle || c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Judges Cards Grid */}
      {filteredJudges.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-card">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Judges Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No evaluators match your search criteria. Try adjusting the search query or category filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setSelectedCompFilter('ALL');
              setStatusFilter('ALL');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJudges.map((j) => {
            const judgeName = j.name || j.judgeName || 'Juror';
            const organization = j.organization || j.institution || 'Accredited STEM Evaluator';
            const assignedCategories = j.assignedCategoryNames
              ? j.assignedCategoryNames.join(', ')
              : j.competitionName || `Category ${j.assignedCategories ? j.assignedCategories.join(', ') : '1-6'}`;
            const completed = j.completedCount ?? 0;
            const assigned = j.assignedCount || 48;
            const pending = j.pendingCount ?? Math.max(0, assigned - completed);
            const completionPct = Math.round((completed / assigned) * 100);

            return (
              <div
                key={j.id || j.judgeId}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-blue-300 transition-all p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {j.avatar ? (
                        <img
                          src={j.avatar}
                          alt={judgeName}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-100 ring-2 ring-blue-50 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] border border-blue-200 flex items-center justify-center text-[#0057B8] font-bold text-base shrink-0">
                          <UserCheck className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                          {judgeName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-0.5">
                          {j.title || 'Official Juror'} • {organization}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant={j.status === 'IN_SESSION' || j.status === 'ACTIVE' ? 'success' : 'neutral'}
                      dot={j.status === 'IN_SESSION' || j.status === 'ACTIVE'}
                      size="sm"
                    >
                      {j.status === 'IN_SESSION' ? 'IN SESSION' : j.status || 'ACTIVE'}
                    </Badge>
                  </div>

                  {/* Category & Arena Badges */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-[#F6F9FD] border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0057B8]">
                      <Trophy className="w-3.5 h-3.5 shrink-0" />
                      <span className="line-clamp-1">{assignedCategories}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{j.assignedHall || 'EIBFS Main Auditorium'}</span>
                    </div>
                    {j.assignedSlot && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{j.assignedSlot}</span>
                      </div>
                    )}
                  </div>

                  {/* Specialization & Assigned Projects */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Assigned Projects
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {j.assignedProjects && j.assignedProjects.length > 0 ? (
                        j.assignedProjects.map((proj, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-blue-50 text-[#0057B8] border border-blue-200/60 text-[10px] font-semibold line-clamp-1"
                          >
                            {proj}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          All Category Projects Allocated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Stats */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-600">Evaluation Progress</span>
                      <span className="font-black text-[#0057B8]">
                        {completed} / {assigned} ({completionPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#0057B8] to-[#16A34A] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, completionPct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {j.lastActivity || 'Scored recently'}
                      </span>
                      <span className="font-semibold text-[#F36C21]">
                        {pending} Pending in Queue
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    className="flex-1 text-xs"
                    onClick={() => navigate('assignments')}
                  >
                    View Allocations
                  </Button>
                  <Button
                    variant="primary"
                    size="xs"
                    className="flex-1 text-xs"
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    iconPosition="right"
                    onClick={() => {
                      loginAs('judge');
                      navigate('judge-dashboard');
                      addToast({
                        type: 'info',
                        title: 'Switched to Juror Mode',
                        message: `Accessing evaluation panel as ${judgeName}.`
                      });
                    }}
                  >
                    Juror View
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Onboard Judge Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Onboard Accredited TTF 2026 Juror"
        subtitle="Authorize academic or industry evaluator credentials for the Grand Finale"
      >
        <form onSubmit={handleCreateJudge} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Juror Full Name & Academic Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Dr. K. Swaminathan (IIT Madras)"
              value={newJudgeName}
              onChange={(e) => setNewJudgeName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8] focus:bg-white text-slate-900"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Designation / Title
              </label>
              <input
                type="text"
                value={newJudgeTitle}
                onChange={(e) => setNewJudgeTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8] focus:bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Organization / University
              </label>
              <input
                type="text"
                placeholder="e.g. Dubai Future Labs"
                value={newJudgeOrg}
                onChange={(e) => setNewJudgeOrg(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Assigned Category Track *
              </label>
              <select
                value={newJudgeCategory}
                onChange={(e) => setNewJudgeCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8] focus:bg-white text-slate-900 cursor-pointer"
              >
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    Category {c.categoryNumber}: {c.challengeTitle || c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Domain Specialization
              </label>
              <input
                type="text"
                value={newJudgeSpecialization}
                onChange={(e) => setNewJudgeSpecialization(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                placeholder="juror@organization.org"
                value={newJudgeEmail}
                onChange={(e) => setNewJudgeEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8] focus:bg-white text-slate-900"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+971 50 000 0000"
                value={newJudgePhone}
                onChange={(e) => setNewJudgePhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
            <p className="font-bold text-[11px] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#0057B8]" />
              Official Grand Finale Accreditation
            </p>
            <p className="text-[10px] text-blue-700">
              The juror will be bound to the official 100-point rubric and allocated 48 finalists across the selected category arena at EIBFS Dubai.
            </p>
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
              Accredit Juror
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
