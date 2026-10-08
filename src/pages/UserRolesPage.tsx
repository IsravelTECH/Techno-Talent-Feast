import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
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
  const { selectedEvent, competitions, navigate, loginAs, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'ALL' | 'admin' | 'judge'>('ALL');
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<RoleProfile | null>(null);

  const roleProfiles: RoleProfile[] = [
    {
      id: 'usr-01',
      name: 'James Techno',
      email: 'james@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      role: 'admin',
      roleTitle: 'Chief Convener & Grand Director (Administration)',
      organization: 'TechnoSchool UAE Central Directorate',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Finale)',
      assignedEventDate: '4 November 2026',
      assignedVenue: 'EIBFS (Academic City, Dubai, UAE)',
      assignedTracks: ['All 6 Categories (24 Projects)', '12 Finalists Quota Verification', 'Rubric Lock & Result Publishing'],
      assignedHall: 'Central Command Console & Grand Auditorium',
      assignedSlot: '08:30 AM - 06:00 PM (Full Day)',
      quotaCount: 576,
      completedCount: 530,
      permissions: ['Full Event Administration', 'Publish Official Results', 'Configure 100-pt Rubrics', 'Assign Juror Panels', 'Audit Trail', 'Stage Progression'],
      status: 'ACTIVE'
    },
    {
      id: 'usr-02',
      name: 'Dr. Priya Sharma',
      email: 'priya.sharma@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
      role: 'judge',
      roleTitle: 'Senior Juror (Robotics & AI)',
      organization: 'Dubai Tech Jurors Panel & Robotics Institute',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Finale)',
      assignedEventDate: '4 November 2026',
      assignedVenue: 'EIBFS (Academic City, Dubai, UAE)',
      assignedTracks: ['Category 1: Robotics & Embedded Systems', 'Autonomous Search & Rescue', 'Autonomous Delivery'],
      assignedHall: 'EIBFS Hall A — Robotics Arena Desk 4',
      assignedSlot: '09:30 AM - 01:00 PM (Prelims) & 02:00 PM - 04:30 PM (Finals)',
      quotaCount: 16,
      completedCount: 14,
      permissions: ['Grade 100-pt Rubric', 'Team Project Marks Entry (1-5 members)', 'Lock Evaluations', '7 Defense Questions Assessment'],
      status: 'IN_SESSION'
    },
    {
      id: 'usr-03',
      name: 'Eng. Tariq Al Mansoori',
      email: 'tariq.mansoori@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
      role: 'judge',
      roleTitle: 'Innovation & IoT Juror',
      organization: 'UAE Society of Engineers',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Finale)',
      assignedEventDate: '4 November 2026',
      assignedVenue: 'EIBFS (Academic City, Dubai, UAE)',
      assignedTracks: ['Category 6: Innovation Challenge', 'Smart Energy Management', 'Smart City Solution'],
      assignedHall: 'EIBFS Hall F — Main Innovation Stage',
      assignedSlot: '09:30 AM - 01:00 PM',
      quotaCount: 16,
      completedCount: 12,
      permissions: ['Grade 100-pt Rubric', 'Hardware Inspection', 'Live Telemetry Verification'],
      status: 'IN_SESSION'
    },
    {
      id: 'usr-04',
      name: 'Ms. Fatima Al Zahra',
      email: 'fatima.zahra@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
      role: 'judge',
      roleTitle: 'Digital Solutions Juror',
      organization: 'Dubai Future Labs',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Finale)',
      assignedEventDate: '4 November 2026',
      assignedVenue: 'EIBFS (Academic City, Dubai, UAE)',
      assignedTracks: ['Category 5: Digital Solutions Challenge (4 Projects)', 'AI Waste Sorting', 'Health Tracker'],
      assignedHall: 'EIBFS Hall E — Digital Incubator',
      assignedSlot: '10:00 AM - 02:00 PM',
      quotaCount: 16,
      completedCount: 15,
      permissions: ['App Workflow Testing', 'Dataset Bias Verification', 'Score UI/UX & AI'],
      status: 'ACTIVE'
    },
    {
      id: 'usr-05',
      name: 'Prof. Rajesh Khanna',
      email: 'rajesh.khanna@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      role: 'judge',
      roleTitle: 'AI & Web Dev Juror',
      organization: 'TechnoSchool Computing Directorate',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Finale)',
      assignedEventDate: '4 November 2026',
      assignedVenue: 'EIBFS (Academic City, Dubai, UAE)',
      assignedTracks: ['Category 4: AI Challenge (4 Projects)', 'Will Do It Today', 'My Vote', 'Banking'],
      assignedHall: 'EIBFS Hall D — AI & Web Hub',
      assignedSlot: '10:30 AM - 01:30 PM',
      quotaCount: 16,
      completedCount: 14,
      permissions: ['Code Review', 'Web Security Verification', 'Algorithm Complexity Evaluation'],
      status: 'ACTIVE'
    },
    {
      id: 'usr-06',
      name: 'Dr. Sarah Jenkins',
      email: 'sarah.j@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      role: 'judge',
      roleTitle: 'STEM & Junior Robotics Juror',
      organization: 'Middlesex University Dubai',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Finale)',
      assignedEventDate: '4 November 2026',
      assignedVenue: 'EIBFS (Academic City, Dubai, UAE)',
      assignedTracks: ['Category 2: STEM Engineering (Grades 3-5)', 'Category 3: Creative Tech'],
      assignedHall: 'EIBFS Hall B — Junior Robotics Hub',
      assignedSlot: '09:00 AM - 01:00 PM',
      quotaCount: 16,
      completedCount: 16,
      permissions: ['Grade 100-pt Rubric', 'Junior Defense Assessment', 'Teamwork Evaluation'],
      status: 'COMPLETED'
    }
  ];

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
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
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
            variant="outline"
            size="sm"
            icon={<UserCheck className="w-4 h-4" />}
            onClick={() => navigate('judges')}
          >
            Judges Roster
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

      {/* 3 Core Quick Access Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          onClick={() => navigate('projects')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#0057B8] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0057B8] flex items-center justify-center font-black group-hover:bg-[#0057B8] group-hover:text-white transition-colors">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#0057B8] transition-colors">
                24 Championship Projects
              </h4>
              <p className="text-[11px] text-slate-500">
                Problem statements, allowed tools & specs
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0057B8] group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => navigate('judges')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#0057B8] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#03A695] flex items-center justify-center font-black group-hover:bg-[#03A695] group-hover:text-white transition-colors">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#03A695] transition-colors">
                Judges & Jurors Roster
              </h4>
              <p className="text-[11px] text-slate-500">
                36 Evaluators • Track allocations
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#03A695] group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          onClick={() => navigate('assignments')}
          className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-[#F36C21] hover:shadow-md transition-all text-left flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F36C21] flex items-center justify-center font-black group-hover:bg-[#F36C21] group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 group-hover:text-[#F36C21] transition-colors">
                Judge Assignments Desk
              </h4>
              <p className="text-[11px] text-slate-500">
                6-Step Conflict-Free Assignment Wizard
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#F36C21] group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* Role Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'ALL', label: 'All Roles (6 Profiles)' },
            { id: 'admin', label: 'Administration' },
            { id: 'judge', label: 'Judges / Jurors' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRoleFilter === tab.id
                  ? 'bg-[#0057B8] text-white shadow-xs'
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
            className="w-full pl-9 pr-3 py-1.5 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
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
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-200 ring-2 ring-blue-50 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#0057B8] transition-colors leading-tight">
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
                <Building2 className="w-3.5 h-3.5 text-[#0057B8] shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{user.organization}</span>
              </div>

              {/* Assigned Event Details Box */}
              <div className="mt-4 p-4 rounded-2xl bg-[#F6F9FD] border border-slate-200/80 space-y-2.5 text-xs">
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
                    <Calendar className="w-3.5 h-3.5 text-[#F36C21] shrink-0" />
                    <span>{user.assignedEventDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0057B8] shrink-0" />
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
                        className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0057B8] text-[10px] font-semibold border border-blue-100"
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
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
              <strong className="text-[#0057B8] block font-bold">Assigned Championship Responsibilities:</strong>
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
