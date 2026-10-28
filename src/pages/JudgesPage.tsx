import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserAvatar } from '../components/common/UserAvatar';
import { parseCSV, downloadCSV } from '../utils/csvUtils';
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
  AlertCircle,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

export const JudgesPage: React.FC = () => {
  const { judges, competitions, navigate, loginAs, addToast, createJudge, bulkImportJudges } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompFilter, setSelectedCompFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'IN_SESSION' | 'AVAILABLE'>('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Import Modal State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedJudges, setParsedJudges] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCreateJudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudgeName.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide the evaluator full name.'
      });
      return;
    }

    if (!newJudgeEmail.trim()) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please provide an official email.'
      });
      return;
    }

    const res = await createJudge({
      name: newJudgeName.trim(),
      email: newJudgeEmail.trim(),
      organization: newJudgeOrg.trim(),
      specialization: newJudgeSpecialization.trim()
    });

    if (res.success) {
      setShowAssignModal(false);
      setNewJudgeName('');
      setNewJudgeOrg('');
      setNewJudgeEmail('');
      setNewJudgePhone('');
    }
  };

  // Dynamic CSV Export for Judges
  const handleExportCSV = () => {
    if (filteredJudges.length === 0) {
      addToast({
        type: 'info',
        title: 'No Records',
        message: 'No judge records match current filter to export.'
      });
      return;
    }

    const headers = [
      'Judge ID',
      'Juror Name',
      'Email',
      'Initial Password',
      'Organization / Institution',
      'Specialization Track',
      'Status',
      'Assigned Categories',
      'Assigned Teams',
      'Completed Evaluations',
      'Completion Rate (%)'
    ];

    const rows = filteredJudges.map((j) => {
      const assignedCount = j.assignedCount || 0;
      const completedCount = j.completedCount || 0;
      const rate = assignedCount > 0 ? Math.round((completedCount / assignedCount) * 100) : 0;
      const cats = j.assignedCategoryNames ? j.assignedCategoryNames.join('; ') : (j.competitionName || '');

      return [
        j.judgeId || j.id || '',
        j.name || j.judgeName || '',
        j.email || '',
        j.password || '',
        j.organization || j.institution || '',
        j.specialization || '',
        j.status || 'ACTIVE',
        cats,
        assignedCount,
        completedCount,
        rate
      ];
    });

    downloadCSV(
      `TTF2026_Judges_Roster_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows
    );

    addToast({
      type: 'success',
      title: 'Export Complete',
      message: `Exported ${filteredJudges.length} judge record(s) to CSV.`
    });
  };

  // Download Sample CSV Template
  const handleDownloadSampleTemplate = () => {
    const headers = ['Judge ID', 'Full Name', 'Email', 'Organization', 'Specialization', 'Status'];
    const sampleRows = [
      ['JDG-12', 'Dr. Alan Turing', 'alan.turing@technoschool.in', 'Techno AI Academy', 'Robotics & AI', 'ACTIVE'],
      ['JDG-13', 'Prof. Ada Lovelace', 'ada.lovelace@technoschool.in', 'Cambridge International', 'Coding & Software', 'ACTIVE'],
      ['JDG-14', 'Dr. Claude Shannon', 'claude.shannon@technoschool.in', 'Dubai Silicon Oasis High', 'Innovation Challenge', 'AVAILABLE']
    ];
    downloadCSV('Judge_Roster_Template.csv', headers, sampleRows);
  };

  // Handle CSV File Selection & Parse
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const { headers, rows } = parseCSV(text);

      if (rows.length === 0) {
        addToast({
          type: 'error',
          title: 'Empty File',
          message: 'The uploaded CSV file contains no data rows.'
        });
        setParsedJudges([]);
        return;
      }

      // Map headers flexibly
      const normalized = rows.map((r, idx) => {
        const name = r['Full Name'] || r['Juror Name'] || r['Name'] || r['judgeName'] || '';
        const email = r['Email'] || r['Official Email'] || r['email'] || '';
        const judgeId = r['Judge ID'] || r['judgeId'] || '';
        const organization = r['Organization / Institution'] || r['Organization'] || r['Institution'] || '';
        const specialization = r['Specialization Track'] || r['Specialization'] || r['Track'] || 'Robotics & AI';
        const status = r['Status'] || 'ACTIVE';

        const isValid = !!name && !!email && email.includes('@');
        let errorMsg = '';
        if (!name) errorMsg = 'Missing name';
        else if (!email) errorMsg = 'Missing email';
        else if (!email.includes('@')) errorMsg = 'Invalid email';

        return {
          rowNum: idx + 1,
          name,
          email,
          judgeId,
          organization,
          specialization,
          status,
          isValid,
          errorMsg
        };
      });

      setParsedJudges(normalized);
    };

    reader.readAsText(file);
  };

  // Submit Bulk Import
  const handleConfirmImport = async () => {
    const validRows = parsedJudges.filter((j) => j.isValid);
    if (validRows.length === 0) {
      addToast({
        type: 'error',
        title: 'No Valid Records',
        message: 'No valid judge rows detected to import.'
      });
      return;
    }

    setIsImporting(true);
    const res = await bulkImportJudges(validRows);
    setIsImporting(false);

    if (res.success) {
      setShowImportModal(false);
      setParsedJudges([]);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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
            <span className="px-3 py-1 rounded-full bg-[#E6F7F5] text-[#03A695] border border-teal-200 text-xs font-bold">
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

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="w-4 h-4 text-slate-500" />}
            onClick={() => setShowImportModal(true)}
            title="Import judges roster from CSV"
          >
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4 text-slate-500" />}
            onClick={handleExportCSV}
            title="Export filtered judges roster as CSV"
          >
            Export ({filteredJudges.length})
          </Button>
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
            <span className="text-xs font-bold text-[#03A695]">6 per Category</span>
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
            <span className="text-2xl font-black text-[#03A695]">{totalEvaluated}</span>
            <span className="text-xs font-bold text-slate-500">/ {totalAssigned} total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{overallCompletionRate}% total completion rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Judging Standard
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#FD5E01]">100 Pts</span>
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
            className="w-full pl-9 pr-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#03A695] text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center bg-[#F7FCFB] p-1 rounded-xl border border-slate-200 shrink-0">
            {(['ALL', 'IN_SESSION', 'ACTIVE'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-[#03A695] shadow-xs'
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
            className="px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
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
                className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={judgeName} size="lg" />
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
                  <div className="space-y-1.5 p-3 rounded-2xl bg-[#F7FCFB] border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#03A695]">
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
                            className="px-2 py-0.5 rounded-lg bg-[#E6F7F5] text-[#03A695] border border-teal-200/60 text-[10px] font-semibold line-clamp-1"
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
                      <span className="font-black text-[#03A695]">
                        {completed} / {assigned} ({completionPct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#03A695] to-[#16A34A] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, completionPct)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {j.lastActivity || 'Scored recently'}
                      </span>
                      <span className="font-semibold text-[#FD5E01]">
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
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695] focus:bg-white text-slate-900"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695] focus:bg-white text-slate-900"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695] focus:bg-white text-slate-900"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695] focus:bg-white text-slate-900 cursor-pointer"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695] focus:bg-white text-slate-900"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695] focus:bg-white text-slate-900"
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
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695] focus:bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#E6F7F5] border border-teal-200 text-blue-900 space-y-1">
            <p className="font-bold text-[11px] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#03A695]" />
              Official Grand Finale Accreditation
            </p>
            <p className="text-[10px] text-[#008C7E]">
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

      {/* MODAL 2: CSV IMPORT MODAL */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          if (!isImporting) {
            setShowImportModal(false);
            setParsedJudges([]);
            setImportFile(null);
          }
        }}
        title="Bulk Import Judges & Jurors"
        subtitle="Upload CSV file with evaluator credentials and track assignments"
      >
        <div className="space-y-4 text-xs">
          {/* Template Download Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#03A695]" />
              <div>
                <p className="font-bold text-slate-800">Need the standard CSV format?</p>
                <p className="text-[11px] text-slate-500">Download the pre-configured spreadsheet template</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadSampleTemplate}
            >
              Template
            </Button>
          </div>

          {/* Hidden File Input & Upload Dropzone */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#03A695] rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-[#E6F7F5]/30 transition-colors cursor-pointer"
          >
            <Upload className="w-8 h-8 text-[#03A695] mx-auto mb-2" />
            <p className="font-bold text-slate-800">
              {importFile ? importFile.name : 'Click to browse or drop CSV roster file'}
            </p>
            <p className="text-slate-400 mt-1 text-[11px]">
              {importFile
                ? `${(importFile.size / 1024).toFixed(1)} KB • Click to replace file`
                : 'Supports .csv with Full Name, Email, Organization, Specialization Track'}
            </p>
          </div>

          {/* Preview of Parsed Rows */}
          {parsedJudges.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Preview ({parsedJudges.filter((j) => j.isValid).length} valid of {parsedJudges.length} rows)
                </span>
                <span className="text-[11px] text-slate-500">
                  Sequential IDs will be generated automatically
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {parsedJudges.map((j, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 flex items-center justify-between gap-2 text-xs ${
                      j.isValid ? 'bg-white' : 'bg-red-50/70'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        {j.isValid ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                        <span className="truncate">{j.name || 'Unnamed Juror'}</span>
                        {j.judgeId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {j.judgeId}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {j.email} • {j.organization || 'General Juror'} • {j.specialization}
                      </p>
                    </div>

                    {!j.isValid && (
                      <span className="text-[10px] font-bold text-red-600 px-2 py-0.5 rounded bg-red-100 shrink-0">
                        {j.errorMsg}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isImporting}
              onClick={() => {
                setShowImportModal(false);
                setParsedJudges([]);
                setImportFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="orange"
              size="sm"
              disabled={isImporting || parsedJudges.filter((j) => j.isValid).length === 0}
              onClick={handleConfirmImport}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Importing...
                </>
              ) : (
                `Confirm Import (${parsedJudges.filter((j) => j.isValid).length})`
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
