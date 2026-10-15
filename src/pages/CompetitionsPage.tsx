import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserAvatar } from '../components/common/UserAvatar';
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
  FileSpreadsheet,
  RefreshCw,
  Award,
  Medal,
  ChevronRight
} from 'lucide-react';

export const CompetitionsPage: React.FC = () => {
  const { competitions, participants, judges, navigate, addToast, refreshData, isLoadingData } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompTrack, setNewCompTrack] = useState('Innovation');
  const [newCompVenue, setNewCompVenue] = useState('Arena Hall A');
  const [newCompGrade, setNewCompGrade] = useState('Grades 8 to 12');

  const getCategoryIcon = (category: string) => {
    const catLower = (category || '').toLowerCase();
    if (catLower.includes('robot')) return <Bot className="w-6 h-6 text-[#03A695]" />;
    if (catLower.includes('cod') || catLower.includes('ict')) return <Code2 className="w-6 h-6 text-[#03A695]" />;
    if (catLower.includes('ai') || catLower.includes('data')) return <Cpu className="w-6 h-6 text-[#03A695]" />;
    if (catLower.includes('stem') || catLower.includes('creative')) return <Sparkles className="w-6 h-6 text-[#03A695]" />;
    if (catLower.includes('design') || catLower.includes('digital')) return <Layout className="w-6 h-6 text-[#03A695]" />;
    return <Trophy className="w-6 h-6 text-[#03A695]" />;
  };

  const handleCreateComp = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    addToast({
      type: 'success',
      title: 'Arena Registered',
      message: `Competition arena "${newCompName || 'New Track'}" added to Techno Talent Feast 2026 schedule.`
    });
    setNewCompName('');
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
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] border border-teal-200 text-xs font-bold">
              {competitions.length} Active Tracks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Championship evaluation tracks, 100-point rubrics, arena allocations, and assigned jurors
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 text-[#03A695] ${isLoadingData ? 'animate-spin' : ''}`} />}
            onClick={() => refreshData()}
            className="cursor-pointer"
          >
            <span>{isLoadingData ? 'Syncing...' : 'Sync Live Data'}</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
            className="cursor-pointer shadow-xs"
          >
            Create Category
          </Button>
        </div>
      </div>

      {/* Competitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((comp) => {
          // Dynamic team calculations for this specific track
          const catTeams = participants.filter(
            (p) =>
              String(p.category) === String(comp.id) ||
              String(p.category) === String(comp.categoryNumber) ||
              String(p.categoryNumber) === String(comp.categoryNumber) ||
              p.categoryName?.toLowerCase() === comp.name?.toLowerCase() ||
              p.category === comp.name ||
              p.competitionId === comp.id
          );

          const registeredCount = catTeams.length > 0 ? catTeams.length : (comp.registeredCount || 0);
          const completedCount = catTeams.filter((p) => p.status === 'SUBMITTED' || p.status === 'EVALUATED').length;
          const completionRate = registeredCount > 0 ? Math.min(100, Math.round((completedCount / registeredCount) * 100)) : 0;

          // Dynamic judges assigned to this track
          const catJudges = judges.filter(
            (j) =>
              j.assignedCategories?.includes(comp.categoryNumber) ||
              j.assignedCategories?.includes(Number(comp.id?.replace(/\D/g, ''))) ||
              j.competitionId === comp.id
          );
          const assignedJudgesCount = catJudges.length > 0 ? catJudges.length : (comp.assignedJudgesCount || 0);

          return (
            <div
              key={comp.id}
              onClick={() => navigate('competition-detail', { compId: comp.id })}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all p-6 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Top Row */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F7F5] border border-teal-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getCategoryIcon(comp.category || comp.name)}
                  </div>

                  <Badge
                    variant={comp.status === 'LIVE' ? 'live' : 'success'}
                    dot={comp.status === 'LIVE'}
                    size="sm"
                  >
                    {comp.status || 'ACTIVE'}
                  </Badge>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#03A695] transition-colors leading-snug">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {comp.description || 'Championship engineering category testing innovation and technical defense.'}
                  </p>
                </div>

                {/* Meta details */}
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#FD5E01] shrink-0" />
                    <span className="font-semibold text-slate-800">{comp.venueHall || 'EIBFS Main Arena'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#03A695] shrink-0" />
                    <span>{comp.timeLimit || '15 Mins'} • {comp.gradeEligibility || 'Grades 6 - 12'}</span>
                  </div>
                </div>

                {/* Dynamic Stats Box */}
                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-2xl bg-[#F7FCFB] border border-teal-100/50 text-center text-xs">
                  <div>
                    <span className="block font-black text-slate-900">
                      {completedCount} / {registeredCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Evaluated ({completionRate}%)
                    </span>
                  </div>
                  <div>
                    <span className="block font-black text-[#03A695]">
                      {assignedJudgesCount} Jurors
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Max: {comp.maxScore || 100} pts
                    </span>
                  </div>
                </div>

                {/* Dynamic Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#03A695] to-[#FD5E01] rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#03A695] group-hover:text-[#0B2545]">
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
        title="Register Competition Category"
        subtitle="Add a new talent evaluation track to Techno Talent Feast 2026"
      >
        <form onSubmit={handleCreateComp} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Category Name
            </label>
            <input
              type="text"
              placeholder="e.g. Space Exploration & Rocketry"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Category Track
              </label>
              <select
                value={newCompTrack}
                onChange={(e) => setNewCompTrack(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              >
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
                value={newCompGrade}
                onChange={(e) => setNewCompGrade(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
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
                value={newCompVenue}
                onChange={(e) => setNewCompVenue(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Max Rubric Score
              </label>
              <input
                type="number"
                defaultValue={100}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                disabled
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
            <Button type="submit" variant="primary" size="sm">
              Save Category
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

  const comp = useMemo(() => {
    return (
      competitions.find(
        (c) => c.id === selectedCompetitionId || String(c.categoryNumber) === String(selectedCompetitionId)
      ) || competitions[0]
    );
  }, [competitions, selectedCompetitionId]);

  const rubric = rubrics[comp.rubricId] || rubrics['rub-robotics'] || {
    name: 'Official 100-Point TTF Engineering Rubric',
    description: 'Evaluation criteria across Technical, Innovation, Design, Demo, and Documentation.',
    maxScore: 100,
    criteria: [
      { id: 'crit-tech', name: 'Technical Execution & Functionality', maxMarks: 30, description: 'Code quality, system stability, architecture' },
      { id: 'crit-innov', name: 'Innovation & Problem Solving', maxMarks: 25, description: 'Creativity, originality, novel engineering application' },
      { id: 'crit-design', name: 'Design & User Experience', maxMarks: 20, description: 'Ergonomics, interface, structural elegance' },
      { id: 'crit-demo', name: 'Live Demonstration & Student Defense', maxMarks: 15, description: 'Live operation, confidence in answering jury questions' },
      { id: 'crit-doc', name: 'Documentation & Compliance', maxMarks: 10, description: 'Engineering notebook, project summary, rule compliance' }
    ]
  };

  // Dynamic participants belonging to this competition track
  const compParticipants = useMemo(() => {
    return participants.filter(
      (p) =>
        p.competitionId === comp.id ||
        String(p.category) === String(comp.id) ||
        String(p.categoryNumber) === String(comp.categoryNumber) ||
        p.categoryName?.toLowerCase() === comp.name?.toLowerCase() ||
        p.category === comp.name
    );
  }, [participants, comp]);

  // Dynamic judges assigned to this competition track
  const compJudges = useMemo(() => {
    return judges.filter(
      (j) =>
        j.competitionId === comp.id ||
        j.assignedCategories?.includes(comp.categoryNumber) ||
        j.assignedCategories?.includes(Number(comp.id?.replace(/\D/g, '')))
    );
  }, [judges, comp]);

  const registeredCount = compParticipants.length > 0 ? compParticipants.length : (comp.registeredCount || 0);
  const completedCount = compParticipants.filter((p) => p.status === 'SUBMITTED' || p.status === 'EVALUATED').length;
  const pendingCount = Math.max(0, registeredCount - completedCount);

  // Leaderboard for this category
  const categoryLeaderboard = useMemo(() => {
    return [...compParticipants]
      .filter((p) => (p.finalScore || 0) > 0)
      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
  }, [compParticipants]);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'projects' | 'participants' | 'judges' | 'rubric' | 'leaderboard'
  >('overview');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('categories')}
          className="text-xs font-bold text-[#03A695] hover:underline flex items-center gap-1 cursor-pointer"
        >
          ← Back to All Categories
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('rubrics')}
            className="cursor-pointer"
          >
            Edit Rubric ({rubric.criteria?.length || 5} Criteria)
          </Button>

          <Button
            variant="orange"
            size="sm"
            onClick={() => publishCompetitionResults(comp.id)}
            className="cursor-pointer shadow-xs"
          >
            Publish Results Officially
          </Button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={comp.status === 'LIVE' ? 'live' : 'success'} dot={comp.status === 'LIVE'}>
              {comp.status || 'ACTIVE'}
            </Badge>
            <Badge variant="primary">{comp.category || comp.name}</Badge>
            <span className="text-xs font-semibold text-slate-500">{comp.venueHall || 'EIBFS Main Arena'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {comp.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {comp.description || 'Championship talent evaluation track testing student engineering innovation and practical application.'}
          </p>
        </div>

        {/* Quick Arena Progress Box */}
        <div className="bg-[#F7FCFB] border border-teal-200 p-4 rounded-2xl text-center min-w-[170px] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Arena Progress
          </span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {completedCount} / {registeredCount}
          </div>
          <span className="text-xs font-bold text-[#03A695]">
            {registeredCount > 0 ? Math.round((completedCount / registeredCount) * 100) : 0}% Complete
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex items-center gap-1 overflow-x-auto shadow-xs">
        {[
          { id: 'overview', label: 'Arena Overview' },
          { id: 'projects', label: `Official Projects (${comp.projects?.length || 4})` },
          { id: 'participants', label: `Teams (${registeredCount})` },
          { id: 'judges', label: `Assigned Jurors (${compJudges.length})` },
          { id: 'rubric', label: `Scoring Rubric (100 pts)` },
          { id: 'leaderboard', label: `Track Leaderboard (${categoryLeaderboard.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#03A695] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
            <h3 className="text-base font-bold text-slate-900">Arena Statistics (Live Data)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#F7FCFB] border border-teal-100/50">
                <p className="text-2xl font-black text-slate-900">{registeredCount}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Total Teams</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#E6F7F5] border border-teal-200">
                <p className="text-2xl font-black text-[#03A695]">{completedCount}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Evaluated</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF3EC] border border-orange-200">
                <p className="text-2xl font-black text-[#FD5E01]">{pendingCount}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Pending</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-2xl font-black text-emerald-700">{comp.maxScore || 100}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">Max Marks</p>
              </div>
            </div>

            {/* Allowed Software Tools */}
            {comp.allowedTools && comp.allowedTools.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Official Permitted Tools & Platforms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {comp.allowedTools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 rounded-xl bg-[#E6F7F5] text-[#03A695] font-bold text-xs border border-teal-100"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Arena Guidelines & Evaluation Schedule
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Participants must report to <strong>{comp.venueHall || 'Assigned Arena'}</strong> 15 minutes before their allotted presentation time. Live student technical defense is allocated a strict <strong>{comp.timeLimit || '15 Mins'}</strong> window evaluated by verified jurors.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-base font-bold text-slate-900">Arena Actions</h3>
            <Button
              variant="primary"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={() => navigate('participants')}
            >
              Browse Category Teams ({registeredCount}) →
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={() => setActiveTab('leaderboard')}
            >
              View Track Leaderboard →
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-bold"
              onClick={() => setActiveTab('projects')}
            >
              Inspect {comp.projects?.length || 4} Official Projects →
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
              Official engineering project challenges specified for {comp.gradeEligibility || 'Grades 6 - 12'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comp.projects?.map((prj, i) => (
              <div
                key={prj.id}
                className="p-5 rounded-2xl bg-[#F7FCFB] border border-teal-100/70 hover:border-teal-300 transition-all space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#03A695] text-white text-xs font-extrabold flex items-center justify-center shrink-0">
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

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-3.5 pl-6">Participant / Team</th>
                <th className="py-3.5 px-4">School</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">Evaluation Status</th>
                <th className="py-3.5 pr-6 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {compParticipants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No teams currently registered in this track.
                  </td>
                </tr>
              ) : (
                compParticipants.map((p) => {
                  const isSubmitted = p.status === 'SUBMITTED' || p.status === 'EVALUATED';
                  const scoreVal = p.finalScore || p.percentage || 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      onClick={() => navigate('participant-detail', { partId: p.id })}
                    >
                      <td className="py-3.5 pl-6 font-bold text-slate-900">
                        {p.teamName || p.name}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          Leader: {p.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-semibold">{p.schoolName}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">Grade {p.grade || 8}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={isSubmitted ? 'success' : 'orange'} size="sm">
                          {isSubmitted ? 'Evaluated' : 'Pending Evaluation'}
                        </Badge>
                      </td>
                      <td className="py-3.5 pr-6 text-right font-black text-slate-900">
                        {isSubmitted ? (
                          <span className="text-[#03A695] text-sm">{scoreVal} / 100</span>
                        ) : (
                          <span className="text-slate-400 font-mono italic">-- / 100</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Judges Tab */}
      {activeTab === 'judges' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Assigned Jurors for {comp.name} ({compJudges.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('assignments')}
              className="cursor-pointer"
            >
              Manage Juror Assignments
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {compJudges.length === 0 ? (
              <p className="text-xs text-slate-400 col-span-3 py-6 text-center">
                No jurors explicitly assigned yet. Click "Manage Juror Assignments" to allocate judges.
              </p>
            ) : (
              compJudges.map((j) => (
                <div
                  key={j.id}
                  className="p-4 rounded-2xl bg-[#F7FCFB] border border-teal-100 flex items-center gap-3"
                >
                  <UserAvatar name={j.name} size="md" variant="color" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{j.name}</h4>
                    <p className="text-[11px] text-slate-500">{j.organization || 'TechnoSchool Juror'}</p>
                    <span className="text-[10px] font-mono text-[#03A695] font-bold">
                      ID: {j.judgeId || j.id}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Rubric Tab */}
      {activeTab === 'rubric' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">{rubric.name}</h3>
              <p className="text-xs text-slate-500">{rubric.description}</p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-[#E6F7F5] text-[#03A695] border border-teal-200 font-black text-sm">
              Total: {rubric.maxScore || 100} Marks
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {rubric.criteria?.map((crit: any, idx: number) => (
              <div
                key={crit.id}
                className="p-4 rounded-2xl bg-[#F7FCFB] border border-teal-100/70 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">
                    {idx + 1}. {crit.name}
                  </span>
                  <p className="text-slate-500 mt-0.5">{crit.description}</p>
                </div>
                <span className="font-black text-[#03A695] text-sm shrink-0 pl-4">
                  {crit.maxMarks} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Track Standings & Podium</h3>
              <p className="text-xs text-slate-500">Live rankings for {comp.name}</p>
            </div>
            <Badge variant="orange" size="sm">
              {categoryLeaderboard.length} Scored Teams
            </Badge>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
              <tr>
                <th className="py-3.5 pl-6">Rank</th>
                <th className="py-3.5 px-4">Team</th>
                <th className="py-3.5 px-4">School</th>
                <th className="py-3.5 pr-6 text-right">Official Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {categoryLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No teams in this track have been scored yet.
                  </td>
                </tr>
              ) : (
                categoryLeaderboard.map((team, idx) => (
                  <tr
                    key={team.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate('participant-detail', { partId: team.id })}
                  >
                    <td className="py-3.5 pl-6">
                      <span
                        className={`w-6 h-6 rounded-lg inline-flex items-center justify-center font-black text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800 border border-slate-300'
                            : idx === 2
                            ? 'bg-orange-100 text-orange-900 border border-orange-300'
                            : 'text-slate-600'
                        }`}
                      >
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{team.teamName || team.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{team.schoolName}</td>
                    <td className="py-3.5 pr-6 text-right font-black text-[#03A695] text-sm">
                      {team.finalScore} / 100 ({team.percentage || team.finalScore}%)
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
