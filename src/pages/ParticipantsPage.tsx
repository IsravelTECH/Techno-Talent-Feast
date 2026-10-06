import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
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
  Sparkles,
  Printer,
  Award,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export const ParticipantsPage: React.FC = () => {
  const { participants, schools, competitions, navigate, loadParticipantForScoring } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('ALL');
  const [selectedCompFilter, setSelectedCompFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [showImportModal, setShowImportModal] = useState(false);

  // Filtered Participants
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.participantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSchool =
      selectedSchoolFilter === 'ALL' || p.schoolId === selectedSchoolFilter;

    const matchesComp =
      selectedCompFilter === 'ALL' || p.competitionId === selectedCompFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || p.status === selectedStatusFilter;

    return matchesSearch && matchesSchool && matchesComp && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Participants Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              1,248 Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse registered student entries, assigned arenas, and live evaluation records
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => setShowImportModal(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert('Exporting participant roster as Excel file (mock)...')}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, ID, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>

        {/* School Filter */}
        <select
          value={selectedSchoolFilter}
          onChange={(e) => setSelectedSchoolFilter(e.target.value)}
          className="w-full px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0057B8]"
        >
          <option value="ALL">All Participating Schools ({schools.length})</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Competition Filter */}
        <select
          value={selectedCompFilter}
          onChange={(e) => setSelectedCompFilter(e.target.value)}
          className="w-full px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0057B8]"
        >
          <option value="ALL">All Competitions ({competitions.length})</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="w-full px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0057B8]"
        >
          <option value="ALL">All Evaluation Statuses</option>
          <option value="SUBMITTED">Evaluated & Locked</option>
          <option value="PENDING">Pending Evaluation</option>
          <option value="DRAFT">Draft in Progress</option>
        </select>
      </div>

      {/* Participants Table / Mobile Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 pl-6">Participant</th>
                <th className="py-3.5 px-4">School</th>
                <th className="py-3.5 px-4">Grade</th>
                <th className="py-3.5 px-4">Competition</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Score</th>
                <th className="py-3.5 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredParticipants.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => navigate('participant-detail', { partId: p.id })}
                >
                  <td className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-slate-900 group-hover:text-[#0057B8] transition-colors block">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {p.participantId} {p.teamName ? `• ${p.teamName}` : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-semibold max-w-[200px] truncate">
                    {p.schoolName}
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-bold">
                    Grade {p.grade}
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#0057B8]">
                    {p.competitionName}
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant={
                        p.status === 'SUBMITTED'
                          ? 'success'
                          : p.status === 'DRAFT'
                          ? 'warning'
                          : 'orange'
                      }
                      size="sm"
                    >
                      {p.status === 'SUBMITTED'
                        ? 'Evaluated'
                        : p.status === 'DRAFT'
                        ? 'Draft'
                        : 'Pending'}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {p.status === 'SUBMITTED' ? (
                      <span className="inline-flex items-center gap-1 font-black text-slate-900 text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {p.finalScore} / 100
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono italic">-- / 100</span>
                    )}
                  </td>
                  <td className="py-4 pr-6 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('participant-detail', { partId: p.id });
                      }}
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View</span>
                    </Button>

                    <Button
                      variant="orange"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        loadParticipantForScoring(p.id);
                        navigate('scoring', { partId: p.id, compId: p.competitionId });
                      }}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Score</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {filteredParticipants.length} of 1,248 entries</span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50">
              Previous
            </button>
            <span className="px-3 py-1 rounded-lg bg-[#0057B8] text-white font-bold">1</span>
            <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100">
              2
            </button>
            <button className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CSV Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Bulk Import Participants"
        subtitle="Upload Excel (.xlsx) or CSV roster file"
      >
        <div className="space-y-4 text-xs">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-colors">
            <Upload className="w-8 h-8 text-[#0057B8] mx-auto mb-2" />
            <p className="font-bold text-slate-800">
              Drag and drop student roster spreadsheet here
            </p>
            <p className="text-slate-400 mt-1 text-[11px]">
              Supports .csv, .xlsx formatted with Student Name, School ID, Grade, Competition
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
                alert('Uploaded mock roster with 50 students successfully!');
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
  const { selectedParticipantId, participants, navigate, loadParticipantForScoring } = useApp();

  const participant =
    participants.find((p) => p.id === selectedParticipantId) || participants[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('participants')}
          className="text-xs font-bold text-[#0057B8] hover:underline flex items-center gap-1"
        >
          ← Back to Participants Roster
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
            onClick={() => window.print()}
          >
            Print Dossier
          </Button>
          <Button
            variant="orange"
            size="sm"
            icon={<FileCheck2 className="w-3.5 h-3.5" />}
            onClick={() => {
              loadParticipantForScoring(participant.id);
              navigate('scoring', { partId: participant.id, compId: participant.competitionId });
            }}
          >
            Evaluate / Re-Score
          </Button>
        </div>
      </div>

      {/* Profile Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 lg:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between border-b border-slate-100 pb-6">
          <div className="flex items-center gap-5">
            <img
              src={participant.photo}
              alt={participant.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-200 ring-4 ring-blue-50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {participant.name}
                </h1>
                <Badge
                  variant={participant.status === 'SUBMITTED' ? 'success' : 'orange'}
                  size="sm"
                >
                  {participant.status === 'SUBMITTED' ? 'Evaluated' : 'Pending Evaluation'}
                </Badge>
                {participant.award && (
                  <Badge variant="orange" size="sm">
                    🏆 {participant.award}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-[#0057B8] font-mono font-bold mt-1">
                Participant ID: {participant.participantId}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {participant.schoolName} • Grade {participant.grade}
              </p>
            </div>
          </div>

          {/* Score Highlight Box */}
          <div className="bg-gradient-to-br from-[#003B7A] to-[#0057B8] text-white p-4 rounded-2xl text-center min-w-[160px] shadow-md">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
              Official Score
            </span>
            <div className="text-3xl font-black mt-0.5">
              {participant.status === 'SUBMITTED' ? `${participant.finalScore}/100` : '--/100'}
            </div>
            <span className="text-xs font-semibold text-emerald-300">
              {participant.status === 'SUBMITTED' ? `${participant.percentage}% • Rank #${participant.rank || 2}` : 'Awaiting Judge'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
          {/* Section 1: Participant Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Student Details
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p><strong className="text-slate-900">Gender:</strong> {participant.gender}</p>
              <p><strong className="text-slate-900">Date of Birth:</strong> {participant.dob}</p>
              <p><strong className="text-slate-900">Email:</strong> {participant.email}</p>
              <p><strong className="text-slate-900">Phone:</strong> {participant.phone}</p>
              <p><strong className="text-slate-900">Parent/Guardian:</strong> {participant.parentName} ({participant.parentContact})</p>
            </div>
          </div>

          {/* Section 2: Competition Specs */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Competition Entry
            </h3>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p><strong className="text-slate-900">Arena:</strong> {participant.competitionName}</p>
              <p><strong className="text-slate-900">Category:</strong> {participant.category}</p>
              <p><strong className="text-slate-900">Team:</strong> {participant.teamName || 'Individual Entry'}</p>
              <p><strong className="text-slate-900">Assigned Judge:</strong> Priya Sharma</p>
            </div>
          </div>

          {/* Section 3: Project Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Project Demonstration
            </h3>
            <div className="p-3.5 rounded-2xl bg-[#F6F9FD] border border-slate-100 text-xs">
              <p className="font-bold text-slate-900">{participant.projectTitle}</p>
              <p className="text-slate-600 mt-1 leading-relaxed">{participant.projectSummary}</p>
            </div>
          </div>
        </div>

        {/* Official Criteria Breakdown */}
        {participant.status === 'SUBMITTED' && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Rubric Criteria Score Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold block">Innovation</span>
                <span className="text-base font-black text-[#0057B8]">18 / 20</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold block">Technical</span>
                <span className="text-base font-black text-[#0057B8]">19 / 20</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold block">Creativity</span>
                <span className="text-base font-black text-[#0057B8]">17 / 20</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold block">Presentation</span>
                <span className="text-base font-black text-[#0057B8]">20 / 20</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-semibold block">Execution</span>
                <span className="text-base font-black text-[#0057B8]">18 / 20</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
