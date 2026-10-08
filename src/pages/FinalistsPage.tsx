import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Award,
  Building2,
  Trophy,
  Users,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  Download
} from 'lucide-react';

export const FinalistsPage: React.FC = () => {
  const { schools, competitions, participants, navigate, addToast } = useApp();
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || 'SCH-001');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const activeSchool = schools.find((s) => s.id === selectedSchoolId) || schools[0];

  // Filter participants for this school who are marked as Grand Finalists
  const schoolParticipants = participants.filter((p) => p.schoolId === activeSchool?.id);

  // Compute category breakdown for the active school
  const categoryBreakdown = competitions.map((comp) => {
    const count = schoolParticipants.filter((p) => p.competitionId === comp.id).length;
    const quota = 2; // Strict TTF 2026 rule: 2 finalists per category per school
    return {
      category: comp,
      count,
      quota,
      isCompliant: count === quota,
      isExceeded: count > quota
    };
  });

  const totalFinalists = categoryBreakdown.reduce((sum, c) => sum + c.count, 0);
  const totalQuota = 12; // 2 * 6 categories
  const isSchoolFullyCompliant = totalFinalists === totalQuota && categoryBreakdown.every(c => c.isCompliant);

  const displayedParticipants = schoolParticipants.filter((p) => {
    const matchesCategory = selectedCategoryFilter === 'ALL' || p.competitionId === selectedCategoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.participantId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              School Finalists & Quota Verification
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              12 Finalists Rule
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Strict TTF 2026 Quota Matrix: Exactly <strong>12 Finalists per school</strong> (2 from each of the 6 categories)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => addToast('Exported Grand Finale Finalist Delegation Matrix (PDF/CSV)', 'success')}
          >
            Export Roster
          </Button>
          <Button
            variant="orange"
            size="sm"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => navigate('assignments')}
          >
            Assign Judges to Finalists
          </Button>
        </div>
      </div>

      {/* School Delegation Selector Pill Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          Select Participating School Delegation ({schools.length} Schools)
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {schools.map((sch) => {
            const isSelected = sch.id === activeSchool?.id;
            return (
              <button
                key={sch.id}
                onClick={() => setSelectedSchoolId(sch.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#0057B8] text-white shadow-md shadow-blue-500/20'
                    : 'bg-[#F6F9FD] text-slate-700 hover:bg-blue-50 border border-slate-200'
                }`}
              >
                <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FF8A3D]' : 'text-slate-400'}`} />
                <span>{sch.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  12/12
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 12-Finalist Quota Status & Matrix for Selected School */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] border border-blue-200 flex items-center justify-center text-[#0057B8] shrink-0 font-black text-sm">
              {activeSchool?.code || 'SCH'}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {activeSchool?.name}
              </h2>
              <p className="text-xs text-slate-500">
                Delegation Lead: <strong>{activeSchool?.coordinatorName || 'Engr. Sarah Al Mansoori'}</strong> • City: {activeSchool?.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2 ${
              isSchoolFullyCompliant
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {isSchoolFullyCompliant ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              <div>
                <span className="text-xs font-black block">
                  {totalFinalists} / {totalQuota} Finalists Verified
                </span>
                <span className="text-[10px] font-medium block">
                  {isSchoolFullyCompliant ? '100% Compliant with 2/Category Rule' : 'Quota Mismatch Detected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Category Quota Cards */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">
            6-Category Quota Verification (2 per Category)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {categoryBreakdown.map((item) => (
              <div
                key={item.category.id}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  item.isCompliant
                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-800'
                    : item.isExceeded
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Cat {item.category.categoryNumber}
                </span>
                <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">
                  {item.category.name}
                </h4>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <span className="text-lg font-black text-slate-900">{item.count}</span>
                  <span className="text-xs text-slate-400 font-bold">/ {item.quota}</span>
                </div>
                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.isCompliant ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.isCompliant ? 'VERIFIED' : `${item.count} / 2`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Finalist Roster Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Grand Finalist Team Rosters for {activeSchool?.name}
            </h2>
            <p className="text-xs text-slate-500">
              Showing {displayedParticipants.length} verified project delegations
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search finalist/project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0057B8]"
            >
              <option value="ALL">All 6 Categories</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  Cat {c.categoryNumber}: {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Finalist / Team Leader</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Project Title</th>
                <th className="py-3 px-3">Team Size</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedParticipants.map((part) => {
                const comp = competitions.find((c) => c.id === part.competitionId);
                return (
                  <tr key={part.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={part.photo}
                          alt={part.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{part.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{part.participantId} • Grade {part.grade}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800 block">{comp?.name || 'Category'}</span>
                      <span className="text-[10px] text-[#0057B8] font-bold">Category {comp?.categoryNumber}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{part.projectTitle}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{part.projectDescription}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold text-slate-700">
                          {part.teamMembers ? part.teamMembers.length : 1} Members
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={part.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                        {part.status === 'COMPLETED' ? 'EVALUATED' : 'READY FOR ARENA'}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button
                        variant="primary"
                        size="xs"
                        icon={<ArrowRight className="w-3.5 h-3.5" />}
                        iconPosition="right"
                        onClick={() => navigate('participant-detail', { partId: part.id })}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
