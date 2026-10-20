import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  Users,
  Search,
  Filter,
  Download,
  Upload,
  Trophy,
  Building2,
  FileCheck2,
  Eye,
  Printer,
  Award,
  ChevronRight,
  RefreshCw,
  School as SchoolIcon,
  CheckCircle2,
  Clock,
  Layers,
  Plus,
  BookOpen,
  Sparkles,
  Edit3,
  MapPin,
  RotateCcw,
  ChevronLeft,
  GraduationCap,
  LayoutGrid,
  List
} from 'lucide-react';
import {
  CATEGORY_CATALOG,
  getCategoryForGrade,
  getProjectsForCategory,
  getProjectById,
  formatProjectCode
} from '../utils/projectCatalog';
import { CompetitionProject, Participant } from '../types';

export const ParticipantsPage: React.FC = () => {
  const {
    participants,
    schools,
    competitions,
    navigate,
    refreshData,
    isLoadingData,
    registerTeamWithProject,
    updateParticipantProject
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('ALL');
  const [selectedCompFilter, setSelectedCompFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const pageSize = 10;

  // Modals for project selection and team registration
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [projectChangeParticipant, setProjectChangeParticipant] = useState<Participant | null>(null);

  // New Team Form State
  const [formTeamName, setFormTeamName] = useState('');
  const [formLeaderName, setFormLeaderName] = useState('');
  const [formSchoolId, setFormSchoolId] = useState('');
  const [formGrade, setFormGrade] = useState<number>(1);
  const [formProjectId, setFormProjectId] = useState<string>('c1-p1');

  // Derive Category from Grade
  const currentCategoryInfo = useMemo(() => {
    return getCategoryForGrade(formGrade);
  }, [formGrade]);

  // Available projects for the selected grade/category
  const availableCategoryProjects = useMemo(() => {
    return currentCategoryInfo?.projects || [];
  }, [currentCategoryInfo]);

  // When grade changes, ensure selected project defaults to first of that category
  const handleGradeChange = (newGrade: number) => {
    setFormGrade(newGrade);
    const cat = getCategoryForGrade(newGrade);
    if (cat.projects.length > 0) {
      setFormProjectId(cat.projects[0].id);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLeaderName.trim() || !formSchoolId) {
      alert('Please enter student leader name and select a school.');
      return;
    }
    const school = schools.find((s) => s.id === formSchoolId);
    const schoolName = school ? school.name : 'Registered Institution';

    registerTeamWithProject({
      name: formLeaderName,
      teamName: formTeamName.trim() || `${formLeaderName} & Team`,
      schoolId: formSchoolId,
      schoolName,
      grade: formGrade,
      categoryNumber: currentCategoryInfo.categoryNumber,
      projectId: formProjectId
    });

    // Reset and close
    setFormTeamName('');
    setFormLeaderName('');
    setShowRegisterModal(false);
  };

  // High-Level Live KPI Metrics
  const kpiMetrics = useMemo(() => {
    const totalTeams = participants.length;
    const evaluatedTeams = participants.filter(
      (p) => (p.finalScore && p.finalScore > 0) || p.status === 'SUBMITTED' || p.status === 'EVALUATED'
    );
    const evaluatedCount = evaluatedTeams.length;
    const pendingCount = Math.max(0, totalTeams - evaluatedCount);

    const scores = evaluatedTeams
      .map((p) => p.finalScore || p.percentage || 0)
      .filter((s) => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return {
      totalTeams,
      evaluatedCount,
      pendingCount,
      avgScore
    };
  }, [participants]);

  // Filtered Participants from real dynamic context
  const filteredParticipants = useMemo(() => {
    return (participants || []).filter((p) => {
      if (!p) return false;
      const q = (searchQuery || '').toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.name || '').toLowerCase().includes(q) ||
        (p.participantId && p.participantId.toLowerCase().includes(q)) ||
        (p.teamId && p.teamId.toLowerCase().includes(q)) ||
        (p.teamName && p.teamName.toLowerCase().includes(q)) ||
        (p.schoolName && p.schoolName.toLowerCase().includes(q)) ||
        (p.projectTitle && p.projectTitle.toLowerCase().includes(q)) ||
        (p.teamMembers && p.teamMembers.some((m) => (typeof m === 'string' ? m : m.name).toLowerCase().includes(q)));

      const matchesSchool =
        selectedSchoolFilter === 'ALL' || p.schoolId === selectedSchoolFilter || p.schoolName === selectedSchoolFilter;

      const matchesComp =
        selectedCompFilter === 'ALL' ||
        p.competitionId === selectedCompFilter ||
        String(p.category) === String(selectedCompFilter) ||
        String(p.categoryNumber) === String(selectedCompFilter);

      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        (selectedStatusFilter === 'SUBMITTED' && (p.status === 'SUBMITTED' || p.status === 'EVALUATED' || (p.finalScore && p.finalScore > 0))) ||
        (selectedStatusFilter === 'PENDING' && (p.status !== 'SUBMITTED' && p.status !== 'EVALUATED' && (!p.finalScore || p.finalScore === 0)));

      return matchesSearch && matchesSchool && matchesComp && matchesStatus;
    });
  }, [participants, searchQuery, selectedSchoolFilter, selectedCompFilter, selectedStatusFilter]);

  // Dynamic Pagination
  const totalPages = Math.max(1, Math.ceil(filteredParticipants.length / pageSize));
  const paginatedParticipants = useMemo(() => {
    const start = (currentPageNum - 1) * pageSize;
    return filteredParticipants.slice(start, start + pageSize);
  }, [filteredParticipants, currentPageNum, pageSize]);

  // Real Dynamic CSV Exporter
  const handleExportCSV = () => {
    if (filteredParticipants.length === 0) {
      alert('No participant records to export.');
      return;
    }

    const headers = [
      'Team ID',
      'Participant ID',
      'Team / Entry Name',
      'Student Leader',
      'School Name',
      'Grade',
      'Competition Track',
      'Project Code',
      'Project Title',
      'Evaluation Status',
      'Final Score / 100'
    ];

    const rows = filteredParticipants.map((p) => [
      `"${p.teamId || ''}"`,
      `"${p.participantId || ''}"`,
      `"${(p.teamName || p.name || '').replace(/"/g, '""')}"`,
      `"${(p.name || '').replace(/"/g, '""')}"`,
      `"${(p.schoolName || '').replace(/"/g, '""')}"`,
      p.grade || 8,
      `"${(p.competitionName || p.categoryName || 'Innovation Challenge').replace(/"/g, '""')}"`,
      `"P${p.categoryNumber || 1}-0${p.projectNumber || 1}"`,
      `"${(p.projectTitle || '').replace(/"/g, '""')}"`,
      p.status || 'PENDING',
      p.finalScore || p.percentage || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TTF2026_Participants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasActiveFilters = searchQuery || selectedSchoolFilter !== 'ALL' || selectedCompFilter !== 'ALL' || selectedStatusFilter !== 'ALL';

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12">
      {/* SECTION 1: HEADER & ACTIONS BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-[#03A695]/10 text-[#03A695] border border-teal-200 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Registered Teams & Projects
            </h1>
            <span className="px-3 py-1 rounded-full bg-[#E6F7F5] text-[#03A695] text-xs font-black border border-teal-200 shadow-xs">
              {participants.length} Active Teams
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Official roster across 6 Categories (Grades 1 to 12) • Each team chooses 1 of 4 standardized rubric projects
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="orange"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (schools.length > 0 && !formSchoolId) setFormSchoolId(schools[0].id);
              setShowRegisterModal(true);
            }}
            className="cursor-pointer shadow-xs text-xs font-bold w-full sm:w-auto justify-center"
          >
            <span>Register Team (Choose Project)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 text-[#03A695] ${isLoadingData ? 'animate-spin' : ''}`} />}
            onClick={() => refreshData()}
            className="cursor-pointer text-xs flex-1 sm:flex-initial justify-center"
            title="Synchronize live MongoDB Atlas data"
          >
            <span>{isLoadingData ? 'Syncing...' : 'Sync Data'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5 text-slate-500" />}
            onClick={() => setShowImportModal(true)}
            className="cursor-pointer text-xs flex-1 sm:flex-initial justify-center"
            title="Import Excel or CSV roster"
          >
            <span>Import</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-slate-500" />}
            onClick={handleExportCSV}
            className="cursor-pointer text-xs flex-1 sm:flex-initial justify-center"
            title="Export filtered records as CSV"
          >
            <span>Export ({filteredParticipants.length})</span>
          </Button>
        </div>
      </div>

      {/* SECTION 2: LIVE KPI METRICS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Enrolled */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#03A695] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Total Teams
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
              {kpiMetrics.totalTeams}
            </span>
            <span className="text-[10px] text-teal-700 font-semibold block truncate">
              6 Categories active
            </span>
          </div>
        </div>

        {/* KPI 2: Evaluated & Locked */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Evaluated & Scored
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
              {kpiMetrics.evaluatedCount}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block truncate">
              {kpiMetrics.totalTeams > 0 ? Math.round((kpiMetrics.evaluatedCount / kpiMetrics.totalTeams) * 100) : 0}% locked in
            </span>
          </div>
        </div>

        {/* KPI 3: Pending Defense */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Awaiting Evaluation
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-tight">
              {kpiMetrics.pendingCount}
            </span>
            <span className="text-[10px] text-amber-700 font-semibold block truncate">
              Jury queue ready
            </span>
          </div>
        </div>

        {/* KPI 4: Arena Average */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Arena Average
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#03A695] block leading-tight">
              {kpiMetrics.avgScore}%
            </span>
            <span className="text-[10px] text-purple-700 font-semibold block truncate">
              Official rubric scale
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: SMART FILTER & STATUS CHIPS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        {/* Top Filter Row: Search & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team, student leader, ID, project..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPageNum(1);
              }}
              className="w-full pl-9 pr-8 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* School Filter */}
          <select
            value={selectedSchoolFilter}
            onChange={(e) => {
              setSelectedSchoolFilter(e.target.value);
              setCurrentPageNum(1);
            }}
            className="w-full px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#03A695] truncate"
          >
            <option value="ALL">All Schools ({schools.length})</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Competition / Category Filter */}
          <select
            value={selectedCompFilter}
            onChange={(e) => {
              setSelectedCompFilter(e.target.value);
              setCurrentPageNum(1);
            }}
            className="w-full px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#03A695] truncate"
          >
            <option value="ALL">All Categories (1 to 6)</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.categoryNumber || c.id} {c.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value);
              setCurrentPageNum(1);
            }}
            className="w-full px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#03A695] truncate"
          >
            <option value="ALL">All Statuses ({participants.length})</option>
            <option value="SUBMITTED">Evaluated & Locked ({kpiMetrics.evaluatedCount})</option>
            <option value="PENDING">Pending Evaluation ({kpiMetrics.pendingCount})</option>
          </select>
        </div>

        {/* Quick Status Chips & Clear Action */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Status:
            </span>

            {/* Chip: All */}
            <button
              onClick={() => {
                setSelectedStatusFilter('ALL');
                setCurrentPageNum(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-[#03A695] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60'
              }`}
            >
              <span>All Teams</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedStatusFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {participants.length}
              </span>
            </button>

            {/* Chip: Evaluated */}
            <button
              onClick={() => {
                setSelectedStatusFilter('SUBMITTED');
                setCurrentPageNum(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'SUBMITTED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60'
              }`}
            >
              <span>Evaluated</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedStatusFilter === 'SUBMITTED' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {kpiMetrics.evaluatedCount}
              </span>
            </button>

            {/* Chip: Pending */}
            <button
              onClick={() => {
                setSelectedStatusFilter('PENDING');
                setCurrentPageNum(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedStatusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60'
              }`}
            >
              <span>Pending</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                selectedStatusFilter === 'PENDING' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {kpiMetrics.pendingCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSchoolFilter('ALL');
                  setSelectedCompFilter('ALL');
                  setSelectedStatusFilter('ALL');
                  setCurrentPageNum(1);
                }}
                className="text-xs font-bold text-[#FD5E01] hover:text-[#e05300] flex items-center gap-1.5 cursor-pointer py-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All Filters
              </button>
            )}

            {/* Grid / List Toggle */}
            <div className="flex items-center bg-[#F7FCFB] p-1 rounded-2xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                aria-label="Grid View"
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewLayout === 'grid'
                    ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('list')}
                aria-label="List View"
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewLayout === 'list'
                    ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: DATA VIEW (TOGGLEABLE TABLE & DOSSIER CARDS) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        {viewLayout === 'list' ? (
          /* VIEW 1: DATA TABLE */
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 pl-4 sm:pl-6 min-w-[200px]">Participant / Team</th>
                <th className="py-3.5 px-3 min-w-[140px]">School</th>
                <th className="py-3.5 px-3 min-w-[120px]">Grade & Category</th>
                <th className="py-3.5 px-3 min-w-[180px]">Selected Project (1 of 4)</th>
                <th className="py-3.5 px-3 min-w-[110px]">Status</th>
                <th className="py-3.5 px-3 text-center min-w-[90px]">Score</th>
                <th className="py-3.5 pr-4 sm:pr-6 text-right min-w-[160px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedParticipants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#03A695]" />
                    <p className="font-bold text-sm text-slate-700">No matching participants found</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing your filters or search keywords</p>
                  </td>
                </tr>
              ) : (
                paginatedParticipants.map((p) => {
                  const isSubmitted = (p.finalScore && p.finalScore > 0) || p.status === 'SUBMITTED' || p.status === 'EVALUATED';
                  const scoreVal = p.finalScore || p.percentage || 0;
                  const projectCode = `P${p.categoryNumber || 1}-0${p.projectNumber || 1}`;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate('participant-detail', { partId: p.id })}
                    >
                      <td className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={p.name} size="sm" variant="color" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-[#03A695] bg-[#E6F7F5] px-1.5 py-0.5 rounded border border-teal-200 shrink-0">
                                {p.teamId || p.participantId}
                              </span>
                              <span className="font-bold text-slate-900 group-hover:text-[#03A695] transition-colors truncate">
                                {p.teamName || p.name}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                              Leader: {p.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 text-slate-700 font-semibold max-w-[180px] truncate">
                        {p.schoolName}
                      </td>
                      <td className="py-4 px-3">
                        <span className="font-bold text-slate-900 block">Grade {p.grade || 1}</span>
                        <span className="text-[11px] text-[#03A695] font-semibold">
                          Category {p.categoryNumber || 1}
                        </span>
                      </td>

                      {/* Selected Project (1 of 4) */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300 shrink-0">
                            {projectCode}
                          </span>
                          <span className="font-bold text-slate-900 text-xs line-clamp-1">
                            {p.projectTitle || 'Selected Project'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <Badge
                          variant={isSubmitted ? 'success' : 'orange'}
                          size="sm"
                        >
                          {isSubmitted ? 'Evaluated' : 'Pending Evaluation'}
                        </Badge>
                      </td>
                      <td className="py-4 px-3 text-center">
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 font-black text-slate-900 text-xs bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                            {scoreVal} / 100
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono italic">-- / 100</span>
                        )}
                      </td>
                      <td className="py-4 pr-6 text-right space-x-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectChangeParticipant(p);
                          }}
                          className="text-xs cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Change Project</span>
                        </Button>

                        <Button
                          variant="orange"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('participant-detail', { partId: p.id, compId: p.competitionId });
                          }}
                          className="text-xs cursor-pointer font-bold"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
          /* VIEW 2: TEAM DOSSIER CARDS (GRID VIEW) */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedParticipants.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#03A695]" />
              <p className="font-bold text-sm text-slate-700">No matching participants found</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search or status filters</p>
            </div>
          ) : (
            paginatedParticipants.map((p) => {
              const isSubmitted = (p.finalScore && p.finalScore > 0) || p.status === 'SUBMITTED' || p.status === 'EVALUATED';
              const scoreVal = p.finalScore || p.percentage || 0;
              const projectCode = `P${p.categoryNumber || 1}-0${p.projectNumber || 1}`;

              return (
                <div
                  key={p.id}
                  onClick={() => navigate('participant-detail', { partId: p.id })}
                  className="bg-[#F7FCFB] rounded-2xl border border-slate-200/90 p-4 flex flex-col justify-between shadow-xs hover:border-teal-300 transition-all cursor-pointer h-full group"
                >
                  <div className="space-y-3">
                    {/* Card Header: Avatar, Team Name, ID & Status Badge */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar name={p.name} size="sm" variant="color" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-black bg-white text-[#03A695] px-1.5 py-0.5 rounded border border-teal-200 shrink-0">
                              {p.teamId || p.participantId}
                            </span>
                            <span className="font-black text-slate-900 text-xs truncate group-hover:text-[#03A695] transition-colors">
                              {p.teamName || p.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                            Leader: <strong className="text-slate-800">{p.name}</strong>
                          </span>
                        </div>
                      </div>

                      {isSubmitted ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                          {scoreVal}%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* School & Grade Strip */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-slate-200/70">
                      <div className="flex items-center gap-1 truncate max-w-[65%]">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold truncate">{p.schoolName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-white text-[#03A695] border border-teal-200 shrink-0">
                        Grade {p.grade || 1} • Cat {p.categoryNumber || 1}
                      </span>
                    </div>

                    {/* Project Showcase Box */}
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-black text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 shrink-0">
                          {projectCode}
                        </span>
                        <p className="font-bold text-slate-900 text-xs truncate">
                          {p.projectTitle || 'Selected Project'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-200/70">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectChangeParticipant(p);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Change Project</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('participant-detail', { partId: p.id, compId: p.competitionId });
                      }}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-[#FD5E01] hover:bg-[#e05300] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>View Dossier</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

        {/* SECTION 5: ADAPTIVE RESPONSIVE PAGINATION */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span className="text-center sm:text-left">
            Showing <strong className="text-slate-800">{paginatedParticipants.length}</strong> of{' '}
            <strong className="text-slate-800">{filteredParticipants.length}</strong> filtered entries ({participants.length} total enrolled)
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-1 w-full sm:w-auto justify-center">
              <button
                disabled={currentPageNum === 1}
                onClick={() => setCurrentPageNum((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer font-medium flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Numbered pills on desktop / tablet */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPageNum(i + 1)}
                    className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                      currentPageNum === i + 1
                        ? 'bg-[#03A695] text-white shadow-xs'
                        : 'border border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Compact page indicator on mobile */}
              <span className="sm:hidden px-3 py-1 font-bold text-slate-700">
                Page {currentPageNum} of {totalPages}
              </span>

              <button
                disabled={currentPageNum === totalPages}
                onClick={() => setCurrentPageNum((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer font-medium flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: REGISTER TEAM & SELECT 1 OF 4 PROJECTS */}
      {showRegisterModal && (
        <Modal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          title="Register Team & Select Project"
          subtitle="Assign team to official Category & pick 1 of 4 standardized projects"
          maxWidth="2xl"
        >
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Team Name / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tiny Code Masters"
                  value={formTeamName}
                  onChange={(e) => setFormTeamName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Student Leader / Duo Lead *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liam Smith"
                  value={formLeaderName}
                  onChange={(e) => setFormLeaderName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Representing School *
                </label>
                <select
                  value={formSchoolId}
                  onChange={(e) => setFormSchoolId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#03A695]"
                >
                  {schools.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Student Grade (Grades 1 to 12) *
                </label>
                <select
                  value={formGrade}
                  onChange={(e) => handleGradeChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs text-slate-700 font-bold focus:outline-none focus:border-[#03A695]"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>
                      Grade {g} ({getCategoryForGrade(g).gradeEligibility})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Locked Notice */}
            <div className="p-3 bg-[#E6F7F5] rounded-xl border border-teal-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider">
                  Assigned Competition Track
                </span>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  {currentCategoryInfo.name} ({currentCategoryInfo.gradeEligibility})
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white text-[#03A695] text-[11px] font-bold border border-teal-200">
                Category {currentCategoryInfo.categoryNumber}
              </span>
            </div>

            {/* THE CORE RULE: CHOOSE 1 OF 4 PROJECTS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FD5E01]" />
                  Select Project: Team chooses 1 of 4 Projects
                </label>
                <span className="text-[10px] text-slate-400 font-semibold">
                  Click to select active project
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto p-1">
                {availableCategoryProjects.map((proj) => {
                  const isSelected = formProjectId === proj.id;
                  const code = `P${proj.categoryNumber}-0${proj.projectNumber}`;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => setFormProjectId(proj.id)}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#03A695] bg-[#E6F7F5]/40 shadow-xs ring-2 ring-teal-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-white border border-teal-200 text-[#03A695]">
                            {code}
                          </span>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full bg-[#03A695] text-white text-[9px] font-black uppercase">
                              Selected
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-900 text-xs line-clamp-1">
                          {proj.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {proj.objective || proj.specification}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400 truncate">
                        <span>Tools:</span>
                        <span className="font-semibold text-slate-600 truncate">
                          {(proj.softwareOrTools || []).slice(0, 3).join(', ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRegisterModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="orange"
                size="sm"
                type="submit"
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Enroll Team with Selected Project
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: CHANGE PROJECT FOR EXISTING PARTICIPANT */}
      {projectChangeParticipant && (
        <Modal
          isOpen={!!projectChangeParticipant}
          onClose={() => setProjectChangeParticipant(null)}
          title={`Change Project for ${projectChangeParticipant.teamName || projectChangeParticipant.name}`}
          subtitle={`Category ${projectChangeParticipant.categoryNumber}: Select 1 of the 4 official projects`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Current Assigned Project</span>
                <p className="text-xs font-black text-slate-900 mt-0.5">
                  P{projectChangeParticipant.categoryNumber || 1}-0{projectChangeParticipant.projectNumber || 1}: {projectChangeParticipant.projectTitle}
                </p>
              </div>
              <span className="text-xs text-slate-600 font-bold">
                {projectChangeParticipant.schoolName}
              </span>
            </div>

            <div>
              <label className="text-xs font-black text-slate-900 uppercase tracking-tight block mb-2">
                Available Projects in Category {projectChangeParticipant.categoryNumber || 1} (Choose 1):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
                {getProjectsForCategory(projectChangeParticipant.categoryNumber || 1).map((proj) => {
                  const isCurrent = projectChangeParticipant.projectId === proj.id || projectChangeParticipant.projectNumber === proj.projectNumber;
                  const code = `P${proj.categoryNumber}-0${proj.projectNumber}`;

                  return (
                    <div
                      key={proj.id}
                      className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#03A695] bg-[#E6F7F5]/40 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-white border border-teal-200 text-[#03A695]">
                            {code}
                          </span>
                          {isCurrent ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#03A695] text-white text-[9px] font-black uppercase">
                              Active
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Available</span>
                          )}
                        </div>

                        <h4 className="font-black text-slate-900 text-xs">
                          {proj.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {proj.objective || proj.specification}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium truncate">
                          {(proj.softwareOrTools || []).slice(0, 2).join(', ')}
                        </span>
                        {!isCurrent && (
                          <Button
                            variant="primary"
                            size="xs"
                            onClick={() => {
                              updateParticipantProject(projectChangeParticipant.id, proj.id);
                              setProjectChangeParticipant(null);
                            }}
                          >
                            Switch to this
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProjectChangeParticipant(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: CSV IMPORT MODAL */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Bulk Import Participants"
        subtitle="Upload Excel (.xlsx) or CSV roster file"
      >
        <div className="space-y-4 text-xs">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-[#E6F7F5]/30 transition-colors">
            <Upload className="w-8 h-8 text-[#03A695] mx-auto mb-2" />
            <p className="font-bold text-slate-800">
              Drag and drop student roster spreadsheet here
            </p>
            <p className="text-slate-400 mt-1 text-[11px]">
              Supports .csv, .xlsx formatted with Team Name, School, Grade, Category, Project
            </p>
            <Button variant="primary" size="sm" className="mt-4">
              Browse Local Files
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="orange"
              size="sm"
              onClick={() => {
                setShowImportModal(false);
                alert('Roster import processed.');
              }}
            >
              Confirm Import
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const ParticipantDetailPage: React.FC = () => {
  const { selectedParticipantId, participants, navigate, updateParticipantProject } = useApp();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const participant = useMemo(() => {
    return participants.find((p) => p.id === selectedParticipantId || p.teamId === selectedParticipantId) || participants[0];
  }, [participants, selectedParticipantId]);

  // Dynamic Rank computation from all evaluated participants
  const dynamicRank = useMemo(() => {
    if (!participant || (!participant.finalScore && !participant.percentage)) return null;
    const sorted = [...participants]
      .filter((p) => (p.finalScore || 0) > 0)
      .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));

    const index = sorted.findIndex((p) => p.id === participant.id || p.teamId === participant.teamId);
    return index !== -1 ? index + 1 : null;
  }, [participants, participant]);

  if (!participant) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-sm text-slate-500 font-bold">No participant selected.</p>
        <Button variant="primary" size="sm" className="mt-3" onClick={() => navigate('participants')}>
          Return to Roster
        </Button>
      </div>
    );
  }

  const isSubmitted = (participant.finalScore && participant.finalScore > 0) || participant.status === 'SUBMITTED' || participant.status === 'EVALUATED';
  const scoreVal = participant.finalScore || participant.percentage || 0;
  const projectCode = `P${participant.categoryNumber || 1}-0${participant.projectNumber || 1}`;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => navigate('participants')}
          className="text-xs font-bold text-[#03A695] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Participants Roster</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
            className="cursor-pointer text-xs"
          >
            Print Dossier
          </Button>
          <Button
            variant="orange"
            size="sm"
            icon={<FileCheck2 className="w-3.5 h-3.5" />}
            onClick={() => navigate('results')}
            className="cursor-pointer text-xs font-bold"
          >
            Championship Results
          </Button>
        </div>
      </div>

      {/* Profile Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-5 sm:p-7 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <UserAvatar name={participant.name} size="xl" variant="color" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {participant.teamName || participant.name}
                </h1>
                <Badge
                  variant={isSubmitted ? 'success' : 'orange'}
                  size="sm"
                >
                  {isSubmitted ? 'Evaluated' : 'Pending Evaluation'}
                </Badge>
                {participant.award && (
                  <Badge variant="orange" size="sm">
                    🏆 {participant.award}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs font-mono font-bold text-[#03A695] bg-[#E6F7F5] px-2 py-0.5 rounded border border-teal-200">
                  ID: {participant.teamId || participant.participantId}
                </span>
                <span className="text-xs text-slate-600 font-semibold truncate">
                  {participant.schoolName} • Grade {participant.grade || 1}
                </span>
              </div>
            </div>
          </div>

          {/* Score Highlight Box */}
          <div className="bg-gradient-to-br from-[#0B2545] to-[#03A695] text-white p-4 rounded-2xl text-center min-w-[170px] shadow-md w-full md:w-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-100">
              Official Rubric Score
            </span>
            <div className="text-3xl font-black mt-0.5">
              {isSubmitted ? `${scoreVal}/100` : '--/100'}
            </div>
            <span className="text-xs font-semibold text-emerald-300">
              {isSubmitted ? `${scoreVal}% ${dynamicRank ? `• Rank #${dynamicRank}` : ''}` : 'Awaiting Juror Evaluation'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {/* Section 1: Team & Student Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Team & Delegation
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p><strong className="text-slate-900">Student Leader:</strong> {participant.name}</p>
              <p><strong className="text-slate-900">Team Size:</strong> {participant.teamSize || (participant.teamMembers ? participant.teamMembers.length + 1 : 1)} Finalists</p>
              {participant.teamMembers && participant.teamMembers.length > 0 && (
                <p>
                  <strong className="text-slate-900">Members:</strong>{' '}
                  {participant.teamMembers.map((m: any) => (typeof m === 'string' ? m : m.name)).join(', ')}
                </p>
              )}
              <p><strong className="text-slate-900">School:</strong> {participant.schoolName}</p>
              <p><strong className="text-slate-900">Campus Location:</strong> {participant.city || 'Dubai, UAE'}</p>
            </div>
          </div>

          {/* Section 2: Competition Specs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Competition Track
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p><strong className="text-slate-900">Track:</strong> {participant.competitionName || participant.categoryName || 'Innovation Challenge'}</p>
              <p><strong className="text-slate-900">Category #:</strong> Category {participant.categoryNumber || 1}</p>
              <p>
                <strong className="text-slate-900">Assigned Juror:</strong>{' '}
                {participant.assignedJudgeName || participant.evaluatedByJudgeName || 'Official Juror Panel'}
              </p>
              <p><strong className="text-slate-900">Registration Status:</strong> Verified Finalist</p>
            </div>
          </div>

          {/* Section 3: Selected Project (1 of 4) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selected Project (1 of 4)
              </h3>
              <button
                onClick={() => setShowSwitchModal(true)}
                className="text-[11px] font-bold text-[#03A695] hover:underline cursor-pointer"
              >
                Change Project
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7FCFB] border border-teal-100/70 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 shrink-0">
                  {projectCode}
                </span>
                <p className="font-bold text-slate-900 truncate">{participant.projectTitle || 'Selected Project'}</p>
              </div>
              <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                {participant.projectSummary || 'Autonomous and innovative technical design built for the official Techno Talent Fest 2026 rubric criteria.'}
              </p>
            </div>
          </div>
        </div>

        {/* Official Criteria Breakdown */}
        {isSubmitted && (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                Official 100-Point Rubric Score Breakdown
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Evaluated by <strong className="text-slate-900">{participant.evaluatedByJudgeName || participant.assignedJudgeName || 'Official Juror'}</strong>
                {participant.submissionTimestamp ? ` • ${participant.submissionTimestamp}` : ''}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3.5 rounded-2xl bg-[#E6F7F5]/50 border border-teal-200">
                <span className="text-slate-500 font-semibold block text-[11px]">1. Technical Execution</span>
                <span className="text-lg font-black text-[#03A695] mt-1 block">
                  {participant.criterionScores?.['crit-tech'] ?? 0} / 30
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#E6F7F5]/50 border border-teal-200">
                <span className="text-slate-500 font-semibold block text-[11px]">2. Innovation</span>
                <span className="text-lg font-black text-[#03A695] mt-1 block">
                  {participant.criterionScores?.['crit-innov'] ?? 0} / 25
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#E6F7F5]/50 border border-teal-200">
                <span className="text-slate-500 font-semibold block text-[11px]">3. Design & UX</span>
                <span className="text-lg font-black text-[#03A695] mt-1 block">
                  {participant.criterionScores?.['crit-design'] ?? 0} / 20
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#E6F7F5]/50 border border-teal-200">
                <span className="text-slate-500 font-semibold block text-[11px]">4. Demo & Defense</span>
                <span className="text-lg font-black text-[#03A695] mt-1 block">
                  {participant.criterionScores?.['crit-demo'] ?? 0} / 15
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#E6F7F5]/50 border border-teal-200">
                <span className="text-slate-500 font-semibold block text-[11px]">5. Documentation</span>
                <span className="text-lg font-black text-[#03A695] mt-1 block">
                  {participant.criterionScores?.['crit-doc'] ?? 0} / 10
                </span>
              </div>
            </div>

            {participant.judgeRemarks && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Juror Technical Evaluation Remarks:
                </span>
                <p className="text-slate-700 italic leading-relaxed">
                  "{participant.judgeRemarks}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Switch Project Modal for Detail Page */}
      {showSwitchModal && (
        <Modal
          isOpen={showSwitchModal}
          onClose={() => setShowSwitchModal(false)}
          title={`Select Project for ${participant.teamName || participant.name}`}
          subtitle={`Category ${participant.categoryNumber || 1}: Choose 1 of 4 projects`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto p-1">
              {getProjectsForCategory(participant.categoryNumber || 1).map((proj) => {
                const isCurrent = participant.projectId === proj.id || participant.projectNumber === proj.projectNumber;
                const code = `P${proj.categoryNumber}-0${proj.projectNumber}`;

                return (
                  <div
                    key={proj.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isCurrent
                        ? 'border-[#03A695] bg-[#E6F7F5]/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-white border border-teal-200 text-[#03A695]">
                          {code}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-[#03A695] text-white text-[9px] font-black uppercase">
                            Current
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-slate-900 text-xs">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {proj.objective || proj.specification}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-medium truncate">
                        {(proj.softwareOrTools || []).slice(0, 2).join(', ')}
                      </span>
                      {!isCurrent && (
                        <Button
                          variant="primary"
                          size="xs"
                          onClick={() => {
                            updateParticipantProject(participant.id, proj.id);
                            setShowSwitchModal(false);
                          }}
                        >
                          Select this Project
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setShowSwitchModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
