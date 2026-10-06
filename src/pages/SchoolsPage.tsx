import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Building2,
  Trophy,
  Users,
  Search,
  MapPin,
  Mail,
  Phone,
  User,
  Plus,
  Medal,
  ChevronRight
} from 'lucide-react';

export const SchoolsPage: React.FC = () => {
  const { schools, participants, navigate } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);

  const filteredSchools = schools.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.principalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              School Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              {schools.length} Schools Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered educational institutions, overall rankings, and student delegations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search school name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
            />
          </div>
        </div>
      </div>

      {/* School Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <div
            key={school.id}
            onClick={() => setSelectedSchool(school)}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-blue-300 transition-all p-6 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F6F9FD] border border-slate-200/90 flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                    <img
                      src={school.logo}
                      alt={school.name}
                      className="w-full h-full object-contain"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <Building2 className="w-6 h-6 text-[#0057B8]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#0057B8] transition-colors line-clamp-1">
                      {school.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#F36C21]" />
                      <span>{school.city}, {school.state}</span>
                    </p>
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    school.rank === 1
                      ? 'bg-amber-100 text-amber-800'
                      : school.rank === 2
                      ? 'bg-slate-200 text-slate-700'
                      : school.rank === 3
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  #{school.rank}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-[#F6F9FD] text-center text-xs">
                <div>
                  <span className="block font-black text-slate-900">
                    {school.totalParticipants}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Students</span>
                </div>
                <div>
                  <span className="block font-black text-[#0057B8]">
                    {school.totalCompetitions}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Arenas</span>
                </div>
                <div>
                  <span className="block font-black text-[#F36C21]">
                    {school.averageScore}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">Avg Score</span>
                </div>
              </div>

              {/* Medals Row */}
              <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <span className="text-slate-500 font-medium">Medal Tally</span>
                <span className="font-bold flex items-center gap-2">
                  <span className="text-amber-500">🥇 {school.goldMedals}</span>
                  <span className="text-slate-400">🥈 {school.silverMedals}</span>
                  <span className="text-amber-700">🥉 {school.bronzeMedals}</span>
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0057B8] group-hover:text-[#003B7A]">
              <span>View Registered Delegation</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* School Delegation Detail Modal */}
      {selectedSchool && (
        <Modal
          isOpen={!!selectedSchool}
          onClose={() => setSelectedSchool(null)}
          title={selectedSchool.name}
          subtitle={`School Code: ${selectedSchool.code} • ${selectedSchool.city}, ${selectedSchool.state}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Principal / Coordinator info */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F6F9FD] border border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Principal</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedSchool.principalName}</p>
                <p className="text-slate-500">{selectedSchool.email}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Teacher Coordinator</span>
                <p className="font-bold text-slate-900 mt-0.5">{selectedSchool.coordinatorName}</p>
                <p className="text-slate-500">{selectedSchool.contactNumber}</p>
              </div>
            </div>

            {/* Student Roster Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Registered Students in Techno Talent Feast
              </h4>
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <tr>
                      <th className="p-3">Student</th>
                      <th className="p-3">Competition</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {participants
                      .filter((p) => p.schoolId === selectedSchool.id || p.schoolName === selectedSchool.name)
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{p.name}</td>
                          <td className="p-3 text-[#0057B8] font-semibold">{p.competitionName}</td>
                          <td className="p-3 text-slate-600">Grade {p.grade}</td>
                          <td className="p-3 text-right">
                            <Badge variant={p.status === 'SUBMITTED' ? 'success' : 'orange'} size="sm">
                              {p.status === 'SUBMITTED' ? `Scored (${p.finalScore}%)` : 'Pending'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setSelectedSchool(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
