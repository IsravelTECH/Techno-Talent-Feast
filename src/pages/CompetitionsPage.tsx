import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Trophy,
  Bot,
  Code2,
  Cpu,
  Sparkles,
  Layout,
  HelpCircle,
  Users,
  UserCheck,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

export const CompetitionsPage: React.FC = () => {
  const { competitions, navigate, addToast } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Robotics':
        return <Bot className="w-6 h-6 text-[#0057B8]" />;
      case 'Coding':
        return <Code2 className="w-6 h-6 text-[#0057B8]" />;
      case 'AI & Data':
        return <Cpu className="w-6 h-6 text-[#0057B8]" />;
      case 'STEM':
        return <Sparkles className="w-6 h-6 text-[#0057B8]" />;
      case 'Digital Design':
        return <Layout className="w-6 h-6 text-[#0057B8]" />;
      default:
        return <HelpCircle className="w-6 h-6 text-[#0057B8]" />;
    }
  };

  const handleCreateComp = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    addToast({
      type: 'success',
      title: 'Competition Created',
      message: 'New arena successfully added to Techno Talent Feast 2026.'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Competitions & Categories
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              {competitions.length} Active Categories
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure championship arenas, evaluation rubrics, time limits, and assigned evaluators
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            + Create Competition
          </Button>
        </div>
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((comp) => {
          const completionRate = Math.round(
            (comp.completedCount / comp.registeredCount) * 100
          );

          return (
            <div
              key={comp.id}
              onClick={() => navigate('competition-detail', { compId: comp.id })}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-blue-300 transition-all p-6 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getCategoryIcon(comp.category)}
                  </div>

                  <Badge
                    variant={comp.status === 'LIVE' ? 'live' : 'success'}
                    dot={comp.status === 'LIVE'}
                    size="sm"
                  >
                    {comp.status}
                  </Badge>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0057B8] transition-colors leading-snug">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                {/* Meta details */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#F36C21]" />
                    <span className="font-semibold text-slate-800">{comp.venueHall}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#0057B8]" />
                    <span>{comp.timeLimit} • {comp.gradeEligibility}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-2xl bg-[#F6F9FD] text-center text-xs">
                  <div>
                    <span className="block font-black text-slate-900">
                      {comp.completedCount} / {comp.registeredCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Evaluated ({completionRate}%)
                    </span>
                  </div>
                  <div>
                    <span className="block font-black text-[#0057B8]">
                      {comp.assignedJudgesCount} Judges
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Max: {comp.maxScore} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0057B8] to-[#F36C21] rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0057B8] group-hover:text-[#003B7A]">
                <span>Open Arena Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Competition Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Competition Arena"
        subtitle="Add a new talent evaluation track to Techno Talent Feast"
      >
        <form onSubmit={handleCreateComp} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Competition Name
            </label>
            <input
              type="text"
              defaultValue="Space Exploration & Rocketry"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Category Track
              </label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                <option>Robotics</option>
                <option>Coding</option>
                <option>AI & Data</option>
                <option>STEM</option>
                <option>Digital Design</option>
                <option>Innovation</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Grade Eligibility
              </label>
              <input
                type="text"
                defaultValue="Grades 8 to 12"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Venue / Hall
              </label>
              <input
                type="text"
                defaultValue="Aerospace Wing Lab 3"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Max Score
              </label>
              <input
                type="number"
                defaultValue={100}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="orange" size="sm">
              Save Arena
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const CompetitionDetailPage: React.FC = () => {
  const {
    selectedCompetitionId,
    competitions,
    participants,
    judges,
    rubrics,
    navigate,
    publishCompetitionResults
  } = useApp();

  const comp =
    competitions.find((c) => c.id === selectedCompetitionId) || competitions[0];
  const rubric = rubrics[comp.rubricId] || rubrics['rub-robotics'];
  const compParticipants = participants.filter((p) => p.competitionId === comp.id);
  const compJudges = judges.filter((j) => j.competitionId === comp.id);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'participants' | 'judges' | 'rubric' | 'leaderboard'
  >('overview');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={comp.status === 'LIVE' ? 'live' : 'success'} dot={comp.status === 'LIVE'}>
              {comp.status}
            </Badge>
            <Badge variant="primary">{comp.category}</Badge>
            <span className="text-xs font-semibold text-slate-500">{comp.venueHall}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {comp.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {comp.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('rubrics')}
          >
            Edit Rubric ({rubric.criteria.length} Criteria)
          </Button>

          <Button
            variant="orange"
            size="sm"
            onClick={() => publishCompetitionResults(comp.id)}
          >
            Publish Results Officially
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex items-center gap-1 overflow-x-auto shadow-xs">
        {[
          { id: 'overview', label: 'Arena Overview' },
          { id: 'projects', label: `Official Projects (${comp.projects?.length || 4})` },
          { id: 'participants', label: `Participants (${compParticipants.length})` },
          { id: 'judges', label: `Assigned Judges (${compJudges.length})` },
          { id: 'rubric', label: `Scoring Rubric (100 pts)` },
          { id: 'leaderboard', label: 'Arena Leaderboard' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0057B8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
            <h3 className="text-base font-bold text-slate-900">Arena Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#F6F9FD]">
                <p className="text-2xl font-black text-slate-900">{comp.registeredCount}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Total Entries</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#EAF3FF]">
                <p className="text-2xl font-black text-[#0057B8]">{comp.completedCount}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Evaluated</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF3EC]">
                <p className="text-2xl font-black text-[#F36C21]">{comp.pendingCount}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Pending</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50">
                <p className="text-2xl font-black text-emerald-700">100</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Max Marks</p>
              </div>
            </div>

            {/* Allowed Software Tools */}
            {comp.allowedTools && comp.allowedTools.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Official Software & Tools Permitted (from TTF Booklet)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {comp.allowedTools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 rounded-xl bg-blue-50 text-[#0057B8] font-bold text-xs border border-blue-100"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Arena Rules & Constraints (Official PDF Rule)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>“BUILD THE TECHNOLOGY — NOT THE ENVIRONMENT”</strong>: Focus on working engineering prototypes, algorithms, and real-time interaction. Participants must report to {comp.venueHall} 15 minutes before their assigned demo slot. Time limit: {comp.timeLimit}.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
            <Button
              variant="orange"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={() => navigate('scoring', { compId: comp.id })}
            >
              Open Live Scoring Panel →
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={() => navigate('leaderboard')}
            >
              View Competition Leaderboard →
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={() => setActiveTab('projects')}
            >
              Inspect 4 Category Projects →
            </Button>
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Official TTF 2026 Category Projects
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Exact project challenges defined in the official TTF 2026 Booklet for {comp.gradeEligibility}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comp.projects?.map((prj, i) => (
              <div
                key={prj.id}
                className="p-5 rounded-2xl bg-[#F6F9FD] border border-slate-200/80 hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#0057B8] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">{prj.title}</h4>
                </div>
                <p className="text-xs text-slate-600 pl-9 leading-relaxed">{prj.description}</p>
              </div>
            )) || (
              <p className="text-xs text-slate-500 italic">No specific sub-projects assigned.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'participants' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-3.5 pl-6">Student</th>
                <th className="py-3.5 px-4">School</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">Evaluation Status</th>
                <th className="py-3.5 pr-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compParticipants.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => navigate('participant-detail', { partId: p.id })}
                >
                  <td className="py-3.5 pl-6 font-bold text-slate-900">{p.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{p.schoolName}</td>
                  <td className="py-3.5 px-4 font-semibold">Grade {p.grade}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={p.status === 'SUBMITTED' ? 'success' : 'orange'} size="sm">
                      {p.status === 'SUBMITTED' ? 'Evaluated' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="py-3.5 pr-6 text-right font-black text-slate-900">
                    {p.status === 'SUBMITTED' ? `${p.finalScore} / 100` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'rubric' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">{rubric.name}</h3>
              <p className="text-xs text-slate-500">{rubric.description}</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#EAF3FF] text-[#0057B8] font-black text-sm">
              Total: {rubric.maxScore} Marks
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {rubric.criteria.map((crit, idx) => (
              <div
                key={crit.id}
                className="p-4 rounded-2xl bg-[#F6F9FD] border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {idx + 1}. {crit.name}
                  </span>
                  <p className="text-slate-500 mt-0.5">{crit.description}</p>
                </div>
                <span className="font-black text-[#0057B8] text-sm shrink-0 pl-4">
                  {crit.maxMarks} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
