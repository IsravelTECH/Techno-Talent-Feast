import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Building2,
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  Radio,
  Eye,
  FolderKanban,
  Award
} from 'lucide-react';

export interface RoleProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'judge';
  roleTitle: string;
  organization: string;
  assignedEvent: string;
  assignedEventDate: string;
  assignedVenue: string;
  assignedTracks: string[];
  assignedHall: string;
  assignedSlot: string;
  quotaCount: number;
  completedCount: number;
  permissions: string[];
  status: 'ACTIVE' | 'IN_SESSION' | 'COMPLETED' | 'STANDBY';
}

export const UserRolesPage: React.FC = () => {
  const { selectedEvent, competitions, judges, participants, currentUser, navigate, loginAs, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'admin' | 'judge'>('ALL');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<RoleProfile | null>(null);

  // Dynamically assemble profiles from live MongoDB Atlas context
  const adminProfile: RoleProfile = {
    id: currentUser?.role === 'admin' && currentUser?.id ? currentUser.id : 'usr-admin-01',
    name: currentUser?.role === 'admin' && currentUser?.name ? currentUser.name : 'James Techno (Admin)',
    email: currentUser?.role === 'admin' && currentUser?.email ? currentUser.email : 'james@technoschool.in',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    role: 'admin',
    roleTitle: 'Chief Convener & Grand Director (Administration)',
    organization: 'TechnoSchool UAE Central Directorate',
    assignedEvent: selectedEvent?.name || 'Techno Talent Feast 2026 (Grand Finale)',
    assignedEventDate: selectedEvent?.date || '4 November 2026',
    assignedVenue: selectedEvent?.venue || 'EIBFS (Academic City, Dubai, UAE)',
    assignedTracks: ['All 6 Categories (24 Projects)', '12 Finalists Quota Verification', 'Rubric Lock & Result Publishing'],
    assignedHall: 'Central Command Console & Grand Auditorium',
    assignedSlot: '08:30 AM - 06:00 PM (Full Day)',
    quotaCount: 576,
    completedCount: participants ? participants.filter((p) => p.status === 'SUBMITTED').length : 530,
    permissions: [
      'Full Event Administration',
      'Publish Official Results',
      'Configure 100-pt Rubrics',
      'Assign Juror Panels',
      'Audit Trail',
      'Stage Progression'
    ],
    status: 'ACTIVE'
  };

  const dynamicJudgeProfiles: RoleProfile[] = (judges && judges.length > 0)
    ? judges.map((judge, idx) => {
        const judgeEvals = (participants || []).filter(
          (p) => p.evaluatedByJudgeId === judge.id || p.evaluatedByJudgeId === judge.judgeId
        );
        const lockedCount = judgeEvals.filter((p) => p.status === 'SUBMITTED').length;
        const totalQuota = judge.assignedCount || judgeEvals.length || 16;
        const isComplete = lockedCount >= totalQuota && totalQuota > 0;
        const isInSession = lockedCount > 0 && !isComplete;

        return {
          id: judge.id || judge.judgeId || `usr-judge-${idx + 1}`,
          name: judge.name,
          email: judge.email,
          avatar: judge.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
          role: 'judge' as const,
          roleTitle: judge.title || `${judge.specialization || 'Technical'} Juror`,
          organization: judge.organization || 'Dubai Tech Jurors Panel',
          assignedEvent: selectedEvent?.name || 'Techno Talent Feast 2026 (Grand Finale)',
          assignedEventDate: selectedEvent?.date || '4 November 2026',
          assignedVenue: selectedEvent?.venue || 'EIBFS (Academic City, Dubai, UAE)',
          assignedTracks: (judge.assignedCategoryNames && judge.assignedCategoryNames.length > 0)
            ? judge.assignedCategoryNames
            : (judge.assignedCategories && judge.assignedCategories.length > 0
              ? judge.assignedCategories.map((c) => `Category ${c}`)
              : ['All Assigned Tracks']),
          assignedHall: judge.assignedHall || 'EIBFS Arena Desk',
          assignedSlot: judge.assignedSlot || '09:30 AM - 04:30 PM',
          quotaCount: totalQuota,
          completedCount: lockedCount || judge.completedCount || 0,
          permissions: [
            'Grade 100-pt Rubric',
            'Team Project Marks Entry (1-5 members)',
            'Lock Evaluations',
            '7 Defense Questions Assessment'
          ],
          status: isComplete ? 'COMPLETED' : (isInSession ? 'IN_SESSION' : 'ACTIVE')
        };
      })
    : [];

  const roleProfiles: RoleProfile[] = [adminProfile, ...dynamicJudgeProfiles];

  const filteredUsers = roleProfiles.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.assignedTracks.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Administration & Judge Roles Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] text-xs font-bold">
              Strict 2-Role System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official operational roles for TTF 2026: <strong>Administration</strong> (Central Control) and <strong>Judges</strong> (Evaluation & Scoring)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            icon={<FolderKanban className="w-4 h-4" />}
            onClick={() => navigate('projects')}
          >
            Projects (24)
          </Button>

          <Button
            variant="orange"
            size="sm"
            icon={<Award className="w-4 h-4" />}
            onClick={() => navigate('assignments')}
          >
            Judge Assignments
          </Button>
        </div>
      </div>

      {/* 2 Core Quick Access Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          onClick={() => navigate('projects')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#03A695] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F5] text-[#03A695] flex items-center justify-center font-black group-hover:bg-[#03A695] group-hover:text-white transition-colors">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#03A695] transition-colors">
                24 Championship Projects
              </h4>
              <p className="text-[11px] text-slate-500">
                Problem statements, allowed tools & specs
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#03A695] group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => navigate('assignments')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#FD5E01] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FD5E01] flex items-center justify-center font-black group-hover:bg-[#FD5E01] group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#FD5E01] transition-colors">
                Judge Assignments Desk
              </h4>
              <p className="text-[11px] text-slate-500">
                6-Step Conflict-Free Assignment Wizard
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#FD5E01] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Role Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: `All Roles (${roleProfiles.length} Profiles)` },
            { id: 'admin', label: `Administration (${roleProfiles.filter(r => r.role === 'admin').length})` },
            { id: 'judge', label: `Judges / Jurors (${roleProfiles.filter(r => r.role === 'judge').length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRoleFilter === tab.id
                  ? 'bg-[#03A695] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, category, organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695]"
          />
        </div>
      </div>

      {/* Main Role Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all p-6 flex flex-col justify-between group"
          >
            <div>
              {/* User Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar name={user.name} size="md" variant="color" />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#03A695] transition-colors leading-tight">
                      {user.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {user.roleTitle}
                    </p>
                  </div>
                </div>

                <Badge variant={user.role === 'admin' ? 'primary' : 'orange'} size="sm">
                  {user.role === 'admin' ? 'ADMIN' : 'JUDGE'}
                </Badge>
              </div>

              {/* Organization */}
              <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#03A695] shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{user.organization}</span>
              </div>

              {/* Assigned Event Details Box */}
              <div className="mt-4 p-4 rounded-2xl bg-[#F7FCFB] border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned Event & Venue
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                    ● {user.status}
                  </span>
                </div>

                <p className="font-bold text-slate-900 text-xs">
                  {user.assignedEvent}
                </p>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#FD5E01] shrink-0" />
                    <span>{user.assignedEventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#03A695] shrink-0" />
                    <span className="truncate">{user.assignedHall}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span className="truncate font-medium">{user.assignedSlot}</span>
                  </div>
                </div>

                {/* Assigned Tracks */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Assigned Categories & Tracks
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {user.assignedTracks.map((trk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-[#E6F7F5] text-[#03A695] text-[10px] font-semibold border border-teal-100"
                      >
                        {trk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setSelectedUserForDetail(user)}
              >
                View Role Spec
              </Button>

              <Button
                variant={user.role === 'judge' ? 'orange' : 'primary'}
                size="xs"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
                onClick={() => {
                  loginAs(user.role);
                  navigate(user.role === 'judge' ? 'scoring' : 'dashboard');
                }}
              >
                Log in as {user.role === 'admin' ? 'Admin' : 'Judge'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Spec Detail Modal */}
      {selectedUserForDetail && (
        <Modal
          isOpen={!!selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          title={`Role Specification: ${selectedUserForDetail.name}`}
          subtitle={`${selectedUserForDetail.roleTitle} • ${selectedUserForDetail.organization}`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button variant="secondary" onClick={() => setSelectedUserForDetail(null)}>
                Close
              </Button>
              <Button
                variant="orange"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={() => {
                  loginAs(selectedUserForDetail.role);
                  navigate(selectedUserForDetail.role === 'judge' ? 'scoring' : 'dashboard');
                  setSelectedUserForDetail(null);
                }}
              >
                Switch to this User Session
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#E6F7F5] border border-teal-100 space-y-1">
              <strong className="text-[#03A695] block font-bold">Assigned Championship Responsibilities:</strong>
              <p className="text-slate-700">{selectedUserForDetail.assignedEvent} — {selectedUserForDetail.assignedVenue}</p>
            </div>

            <div>
              <strong className="text-slate-900 font-bold block mb-1">Operational Permissions:</strong>
              <ul className="list-disc list-inside space-y-1 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedUserForDetail.permissions.map((perm, idx) => (
                  <li key={idx}><strong>{perm}</strong></li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
