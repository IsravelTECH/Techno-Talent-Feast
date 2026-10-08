import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  Trophy,
  FolderKanban,
  UserCheck,
  ClipboardList,
  Activity,
  Radio,
  FileCheck2,
  Medal,
  Megaphone,
  History,
  FileSpreadsheet,
  Settings,
  Bell,
  User,
  LogOut,
  Award,
  ChevronRight,
  ShieldCheck,
  KeyRound
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
  const { currentPage, currentRole, navigate, logout, notifications, assignments, participants } = useApp();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pendingJudgeCount = assignments.filter((a) => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS').length;

  // STRICT ADMINISTRATION NAVIGATION (17 Items)
  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, badge: 'LIVE' },
    { id: 'event-overview', label: 'Event Overview', icon: Calendar },
    { id: 'schools', label: 'Schools', icon: Building2, count: '48' },
    { id: 'participants', label: 'Participants', icon: Users, count: '1,440' },
    { id: 'finalists', label: 'Finalists (12/School)', icon: Award, highlight: true },
    { id: 'categories', label: 'Categories (6)', icon: Trophy, count: '6' },
    { id: 'projects', label: 'Projects (24)', icon: FolderKanban, count: '24' },
    { id: 'judges', label: 'Judges Roster', icon: UserCheck, count: '36' },
    { id: 'assignments', label: 'Judge Assignments', icon: ClipboardList, highlight: true },
    { id: 'scoring-monitor', label: 'Scoring Monitor', icon: Activity, live: true },
    { id: 'live-control', label: 'Live Event Control', icon: Radio, badge: 'ARENA' },
    { id: 'score-review', label: 'Score Review & Audit', icon: FileCheck2 },
    { id: 'results', label: 'Results & Leaderboard', icon: Medal },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
    { id: 'activity-log', label: 'Activity Log', icon: History },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // STRICT JUDGE NAVIGATION (6 Items)
  const judgeNavItems: NavItem[] = [
    { id: 'judge-dashboard', label: 'Judge Dashboard', icon: LayoutDashboard },
    { id: 'judge-assignments', label: 'My Assignments', icon: ClipboardList, count: `${pendingJudgeCount} Active` },
    { id: 'scoring', label: 'Live Evaluations', icon: FileCheck2, highlight: true, live: true },
    { id: 'judge-completed', label: 'Completed Evaluations', icon: Award },
    { id: 'notifications', label: 'Notifications', icon: Bell, notifBadge: unreadCount },
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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0057B8] to-[#003B7A] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/15">
              <span className="text-[#F36C21]">T</span>T
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">
                TECHNO TALENT
              </h2>
              <p className="text-[10px] font-bold text-[#F36C21] uppercase tracking-wider mt-0.5">
                FEAST 2026
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0057B8] border border-blue-200 text-[10px] font-bold uppercase">
            {currentRole === 'admin' ? 'ADMIN' : 'JUDGE'}
          </span>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-3 pt-3">
          <div
            className={`p-2.5 rounded-2xl flex items-center gap-2.5 text-xs border ${
              currentRole === 'admin'
                ? 'bg-[#EAF3FF] border-blue-200 text-[#003B7A]'
                : 'bg-[#FFF3EC] border-orange-200 text-[#C2410C]'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                currentRole === 'admin' ? 'bg-[#0057B8]' : 'bg-[#F36C21]'
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
                    ? 'bg-[#0057B8] text-white shadow-xs font-bold'
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
                        ? 'text-[#F36C21]'
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
                          : 'bg-orange-100 text-[#F36C21]'
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
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#F36C21] text-white animate-pulse">
                      {item.notifBadge}
                    </span>
                  ) : null}

                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Slogan & Sign Out */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] text-slate-600 text-center leading-tight">
            <span className="font-bold text-[#0057B8] block">OFFICIAL MOTTO:</span>
            <span className="text-slate-700 font-semibold italic">
              "BUILD THE TECHNOLOGY — NOT THE ENVIRONMENT"
            </span>
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
