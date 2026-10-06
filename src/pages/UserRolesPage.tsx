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
  Key,
  Radio,
  Eye
} from 'lucide-react';

export interface UserRoleAssignment {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'SUPER_ADMIN' | 'EVENT_ADMIN' | 'JUDGE' | 'SCHOOL_COORDINATOR' | 'PARTICIPANT' | 'VIEWER';
  roleLabel: string;
  organization: string;
  assignedEvent: string;
  assignedEventDate: string;
  assignedVenue: string;
  assignedCompetitions: string[];
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
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserForDetail, setSelectedUserForDetail] = useState<UserRoleAssignment | null>(null);

  const [roleAssignments, setRoleAssignments] = useState<UserRoleAssignment[]>([
    {
      id: 'usr-01',
      name: 'Dr. S. Ranganathan',
      email: 'admin@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      role: 'SUPER_ADMIN',
      roleLabel: 'Super Administrator & Convener',
      organization: 'TechnoSchool Central Academic Directorate',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Edition)',
      assignedEventDate: '12 October 2026',
      assignedVenue: 'TechnoSchool Main Campus - Grand Auditorium',
      assignedCompetitions: ['All 12 Competitions', 'Championship Oversight', 'Audit & Verification'],
      assignedHall: 'Central Command Console & Main Stage',
      assignedSlot: '08:30 AM - 07:00 PM (Full Day)',
      quotaCount: 1248,
      completedCount: 876,
      permissions: ['Full System Override', 'Publish Official Results', 'Edit Rubrics', 'Assign Judges', 'Audit Trail'],
      status: 'ACTIVE'
    },
    {
      id: 'usr-02',
      name: 'Priya Sharma',
      email: 'priya.sharma@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
      role: 'JUDGE',
      roleLabel: 'Senior Robotics Evaluator & Jury Lead',
      organization: 'Indian Institute of Robotics & Automation',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Edition)',
      assignedEventDate: '12 October 2026',
      assignedVenue: 'TechnoSchool Main Campus',
      assignedCompetitions: ['Robotics Championship', 'Autonomous Rover Category'],
      assignedHall: 'Innovation Arena A (Floor 1)',
      assignedSlot: '10:00 AM - 01:00 PM (Batch 1) & 02:00 PM - 04:30 PM (Finals)',
      quotaCount: 48,
      completedCount: 36,
      permissions: ['Grade 100-pt Rubric', 'Save Drafts', 'Lock Evaluations', 'Provide Technical Remarks'],
      status: 'IN_SESSION'
    },
    {
      id: 'usr-03',
      name: 'Dr. Arunachalam M',
      email: 'arunachalam.m@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80',
      role: 'JUDGE',
      roleLabel: 'Robotics Mechatronics Evaluator',
      organization: 'National STEM Research Foundation',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Edition)',
      assignedEventDate: '12 October 2026',
      assignedVenue: 'TechnoSchool Main Campus',
      assignedCompetitions: ['Robotics Championship'],
      assignedHall: 'Innovation Arena A (Floor 1)',
      assignedSlot: '10:00 AM - 01:00 PM',
      quotaCount: 48,
      completedCount: 38,
      permissions: ['Grade 100-pt Rubric', 'Lock Evaluations', 'Technical Defense Q&A'],
      status: 'IN_SESSION'
    },
    {
      id: 'usr-04',
      name: 'Karthik Sundaram',
      email: 'karthik.s@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      role: 'JUDGE',
      roleLabel: 'Coding Sprint Hackathon Lead Judge',
      organization: 'TechnoSchool AI & Computing Department',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Edition)',
      assignedEventDate: '12 October 2026',
      assignedVenue: 'TechnoSchool Main Campus',
      assignedCompetitions: ['Coding Sprint Hackathon', 'Algorithm Speed Round'],
      assignedHall: 'Advanced Computing Lab 1',
      assignedSlot: '10:30 AM - 01:30 PM',
      quotaCount: 72,
      completedCount: 54,
      permissions: ['Code Review', 'Automated Test Validation', 'Score Complexity'],
      status: 'ACTIVE'
    },
    {
      id: 'usr-05',
      name: 'Meena Rajagopal',
      email: 'meena.r@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
      role: 'JUDGE',
      roleLabel: 'AI & Data Science Evaluator',
      organization: 'Centre for Intelligent Systems',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Edition)',
      assignedEventDate: '12 October 2026',
      assignedVenue: 'TechnoSchool Main Campus',
      assignedCompetitions: ['AI & Data Science Challenge'],
      assignedHall: 'AI Tech Hub & Incubation Suite',
      assignedSlot: '11:00 AM - 02:00 PM',
      quotaCount: 36,
      completedCount: 28,
      permissions: ['Model Inspection', 'Accuracy Metric Evaluation', 'Score Ethical AI'],
      status: 'ACTIVE'
    },
    {
      id: 'usr-06',
      name: 'Mrs. Jayashree Raman',
      email: 'principal@abcmatriculation.edu.in',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=80',
      role: 'SCHOOL_COORDINATOR',
      roleLabel: 'School Delegation Coordinator',
      organization: 'ABC Matriculation School (Chennai)',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Edition)',
      assignedEventDate: '12 October 2026',
      assignedVenue: 'TechnoSchool Main Campus',
      assignedCompetitions: ['Robotics (12 students)', 'Coding (14 students)', 'STEM (16 students)'],
      assignedHall: 'School Delegation Bay #4',
      assignedSlot: 'Full Day Event Access',
      quotaCount: 42,
      completedCount: 42,
      permissions: ['Manage Student Roster', 'View Live School Medals', 'Download Delegation Certificates'],
      status: 'ACTIVE'
    },
    {
      id: 'usr-07',
      name: 'Arun Kumar',
      email: 'arun.k@abcschool.edu.in',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80',
      role: 'PARTICIPANT',
      roleLabel: 'Student Candidate (Grade 9)',
      organization: 'ABC Matriculation School',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Edition)',
      assignedEventDate: '12 October 2026',
      assignedVenue: 'TechnoSchool Main Campus',
      assignedCompetitions: ['Robotics Championship (Hexapod AeroBot-V4)'],
      assignedHall: 'Innovation Arena A — Booth #12',
      assignedSlot: 'Demo Slot: 11:15 AM - 11:30 AM',
      quotaCount: 1,
      completedCount: 1,
      permissions: ['View Own Scorecard', 'Download Verified Merit Certificate', 'Arena Check-in'],
      status: 'COMPLETED'
    },
    {
      id: 'usr-08',
      name: 'Arena Stadium Projector 1',
      email: 'display1@technoschool.in',
      avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=160&q=80',
      role: 'VIEWER',
      roleLabel: 'Public LED Scoreboard Screen',
      organization: 'Grand Auditorium Main Stage Display',
      assignedEvent: 'Techno Talent Feast 2026 (Grand Edition)',
      assignedEventDate: '12 October 2026',
      assignedVenue: 'TechnoSchool Main Campus',
      assignedCompetitions: ['Live Broadcast All Arenas'],
      assignedHall: 'Grand Auditorium LED Wall',
      assignedSlot: 'Continuous Live Stream',
      quotaCount: 1248,
      completedCount: 876,
      permissions: ['Public Broadcast Display', 'No Scoring Access'],
      status: 'ACTIVE'
    }
  ]);

  const filteredUsers = roleAssignments.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.assignedCompetitions.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge variant="primary" size="sm">Super Admin</Badge>;
      case 'JUDGE':
        return <Badge variant="orange" size="sm">Jury / Judge</Badge>;
      case 'SCHOOL_COORDINATOR':
        return <Badge variant="success" size="sm">School Coordinator</Badge>;
      case 'PARTICIPANT':
        return <Badge variant="neutral" size="sm">Student Participant</Badge>;
      case 'VIEWER':
        return <Badge variant="live" size="sm">Stadium /live</Badge>;
      default:
        return <Badge variant="primary" size="sm">{role}</Badge>;
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAssignModal(false);
    addToast({
      type: 'success',
      title: 'User Assigned to Event',
      message: 'New user credentialed and scheduled for Techno Talent Feast 2026.'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              User Roles & Event Assignments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] text-xs font-bold border border-[#03A695]/30">
              {roleAssignments.length} Verified Users
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage championship role-based access control, arena assignments, schedules, and evaluation quotas
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAssignModal(true)}
          >
            + Assign User to Event
          </Button>
        </div>
      </div>

      {/* Role Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          {[
            { id: 'ALL', label: 'All Users' },
            { id: 'SUPER_ADMIN', label: 'Super Admin' },
            { id: 'JUDGE', label: 'Judges / Jury' },
            { id: 'SCHOOL_COORDINATOR', label: 'School Coordinators' },
            { id: 'PARTICIPANT', label: 'Participants' },
            { id: 'VIEWER', label: 'Arena Display' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
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
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search user, arena, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695]"
          />
        </div>
      </div>

      {/* Main Role Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-[#03A695]/50 transition-all p-6 flex flex-col justify-between group"
          >
            <div>
              {/* User Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-teal-200 ring-2 ring-teal-50 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-black text-slate-900 group-hover:text-[#03A695] transition-colors leading-tight">
                      {user.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[170px]">
                      {user.roleLabel}
                    </p>
                  </div>
                </div>

                {getRoleBadge(user.role)}
              </div>

              {/* Organization */}
              <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#03A695] shrink-0" />
                <span className="font-semibold text-slate-800 truncate">{user.organization}</span>
              </div>

              {/* Assigned Event Details Box */}
              <div className="mt-4 p-4 rounded-2xl bg-[#F7FCFB] border border-[#D8EBE7] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned Event
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                    ● {user.status}
                  </span>
                </div>

                <p className="font-bold text-[#0B2545] text-xs">
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
                    <Clock className="w-3.5 h-3.5 text-[#0B2545] shrink-0" />
                    <span className="truncate font-medium">{user.assignedSlot}</span>
                  </div>
                </div>

                {/* Assigned Competitions pills */}
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                    Assigned Competitions / Arena:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {user.assignedCompetitions.map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-[#03A695]"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-semibold">Evaluation Quota:</span>
                  <span className="font-black text-slate-900">
                    {user.completedCount} / {user.quotaCount} Assigned
                  </span>
                </div>
              </div>

              {/* Permissions Pills */}
              <div className="mt-3 flex flex-wrap gap-1">
                {user.permissions.slice(0, 3).map((perm, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-medium"
                  >
                    ✓ {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setSelectedUserForDetail(user)}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Dossier</span>
              </Button>

              <Button
                variant={user.role === 'SUPER_ADMIN' ? 'primary' : user.role === 'JUDGE' ? 'orange' : 'secondary'}
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => {
                  if (user.role === 'SUPER_ADMIN') loginAs('admin');
                  else if (user.role === 'JUDGE') loginAs('judge');
                  else if (user.role === 'PARTICIPANT') loginAs('participant');
                  else loginAs('viewer');
                }}
              >
                <span>Launch Persona →</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* User Detail / Assignment Dossier Modal */}
      {selectedUserForDetail && (
        <Modal
          isOpen={!!selectedUserForDetail}
          onClose={() => setSelectedUserForDetail(null)}
          title={`User Role Profile: ${selectedUserForDetail.name}`}
          subtitle={`Role: ${selectedUserForDetail.roleLabel} • Organization: ${selectedUserForDetail.organization}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F7FCFB] border border-[#D8EBE7] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#03A695]">
                Event Assignment Master Record
              </span>
              <p className="text-base font-black text-slate-900">
                {selectedUserForDetail.assignedEvent}
              </p>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <p><strong className="text-slate-900">Date:</strong> {selectedUserForDetail.assignedEventDate}</p>
                <p><strong className="text-slate-900">Venue:</strong> {selectedUserForDetail.assignedVenue}</p>
                <p><strong className="text-slate-900">Arena Hall:</strong> {selectedUserForDetail.assignedHall}</p>
                <p><strong className="text-slate-900">Reporting Slot:</strong> {selectedUserForDetail.assignedSlot}</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">Granted Role Capabilities & Security Permissions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedUserForDetail.permissions.map((perm, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#03A695]" />
                    <span className="font-semibold text-slate-800">{perm}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserForDetail(null)}
              >
                Close
              </Button>
              <Button
                variant="orange"
                size="sm"
                onClick={() => {
                  setSelectedUserForDetail(null);
                  addToast({
                    type: 'success',
                    title: 'Permissions Synchronized',
                    message: `User permissions for ${selectedUserForDetail.name} verified.`
                  });
                }}
              >
                Save Role Specifications
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign New User Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign User to Championship Event"
        subtitle="Provision roles, permissions, and arena slots for Techno Talent Feast"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              User Full Name & Designation
            </label>
            <input
              type="text"
              defaultValue="Dr. K. Swaminathan (IIT Madras)"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Role Category
              </label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                <option value="JUDGE">Judge / Evaluator</option>
                <option value="EVENT_ADMIN">Event Administrator</option>
                <option value="SCHOOL_COORDINATOR">School Coordinator</option>
                <option value="PARTICIPANT">Student Participant</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Championship Edition
              </label>
              <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                <option>Techno Talent Feast 2026</option>
                <option>Techno Junior STEM Fair 2026</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Assigned Arena / Hall
              </label>
              <input
                type="text"
                defaultValue="Innovation Arena A (Floor 1)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Candidate Quota
              </label>
              <input
                type="number"
                defaultValue={48}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
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
              Confirm Role & Event Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
