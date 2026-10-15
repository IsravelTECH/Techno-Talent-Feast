import React from 'react';
import { useApp } from '../../context/AppContext';
import { TechnoLogo } from '../common/TechnoLogo';
import { UserAvatar } from '../common/UserAvatar';
import {
  LayoutDashboard,
  Users,
  Building2,
  Trophy,
  FolderKanban,
  ClipboardList,
  Medal,
  FileSpreadsheet,
  Settings,
  Bell,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  KeyRound,
  FileCheck2,
  Award
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  count?: string;
  highlight?: boolean;
  live?: boolean;
  notifBadge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, currentPage, currentRole, navigate, logout, notifications, assignments, participants } = useApp();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pendingJudgeCount = assignments.filter((a) => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS').length;

  // STRICT ADMINISTRATION NAVIGATION (9 Items)
  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, badge: 'LIVE' },
    { id: 'assignments', label: 'Judge Roaster', icon: ClipboardList, highlight: true },
    { id: 'schools', label: 'Schools', icon: Building2, count: '48' },
    { id: 'participants', label: 'Participants', icon: Users, count: '1,440' },
    { id: 'categories', label: 'Categories (6)', icon: Trophy, count: '6' },
    { id: 'projects', label: 'Projects (24)', icon: FolderKanban, count: '24' },
    { id: 'results', label: 'Results & Leaderboard', icon: Medal },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  const submittedCount = participants.filter((p) => p.status === 'SUBMITTED').length;

  // SIMPLIFIED JUDGE ROLE NAVIGATION (Team Scoring Desk Focus)
  const judgeNavItems: NavItem[] = [
    { id: 'judge-dashboard', label: 'Judge Dashboard', icon: LayoutDashboard },
    { id: 'scoring', label: 'Team Scoring Desk', icon: FileCheck2, highlight: true, live: true },
    { id: 'judge-completed', label: 'Submission Status', icon: Award, count: `${submittedCount} Locked` },
    { id: 'profile', label: 'Juror Profile', icon: User }
  ];

  const navItems: NavItem[] = currentRole === 'judge' ? judgeNavItems : adminNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-[#E2E8F0] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Area in Sidebar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div
            onClick={() => navigate(currentRole === 'judge' ? 'judge-dashboard' : 'dashboard')}
            className="cursor-pointer flex items-center"
          >
            <TechnoLogo variant="full" size="sm" />
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] border border-teal-200 text-[10px] font-bold uppercase">
            {currentRole === 'admin' ? 'ADMIN' : 'JUDGE'}
          </span>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-3 pt-3">
          <div
            className={`p-2.5 rounded-2xl flex items-center gap-2.5 text-xs border ${
              currentRole === 'admin'
                ? 'bg-[#E6F7F5] border-teal-200 text-[#007A6E]'
                : 'bg-[#FFF3EC] border-orange-200 text-[#C2410C]'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                currentRole === 'admin' ? 'bg-[#03A695]' : 'bg-[#FD5E01]'
              }`}
            >
              {currentRole === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[11px] truncate">
                {currentRole === 'admin' ? 'ADMINISTRATION' : 'JUDGE ROLE'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {currentRole === 'admin' ? 'Central Event Controller' : 'Marks Entry & Evaluation'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {currentRole === 'judge' ? 'Judge Portal Menu' : 'Event Control Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group cursor-pointer ${
                  isActive
                    ? 'bg-[#03A695] text-white shadow-xs font-bold'
                    : item.highlight
                    ? 'text-slate-800 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-[#FD5E01]'
                        : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-orange-100 text-[#FD5E01]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.count && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-white/20 text-white font-bold'
                          : 'bg-slate-100 text-slate-500 font-medium'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}

                  {item.notifBadge && item.notifBadge > 0 ? (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#FD5E01] text-white animate-pulse">
                      {item.notifBadge}
                    </span>
                  ) : null}

                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom User Info & Sign Out */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {/* Admin / Logged-in User Profile Card */}
          <div
            onClick={() => navigate('profile')}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#E6F7F5] border border-slate-200/80 hover:border-teal-200 transition-all cursor-pointer flex items-center gap-2.5 group"
            title="View Profile"
          >
            <UserAvatar name={currentUser.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#03A695] truncate transition-colors">
                {currentUser.name}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide truncate">
                {currentRole === 'admin' ? 'Administration' : 'Official Juror'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
