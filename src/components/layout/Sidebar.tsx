import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Building2,
  Trophy,
  ListOrdered,
  UserCheck,
  FileCheck2,
  Medal,
  Award,
  FileSpreadsheet,
  Bell,
  Settings,
  User,
  LogOut,
  Radio,
  ChevronRight,
  ShieldCheck,
  Key
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
  const { currentPage, currentRole, navigate, logout, notifications } = useApp();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'LIVE' },
    { id: 'roles', label: 'User Roles & Events', icon: ShieldCheck, count: '8 Users', highlight: true },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'participants', label: 'Participants', icon: Users, count: '1,248' },
    { id: 'schools', label: 'Schools', icon: Building2, count: '42' },
    { id: 'competitions', label: 'Competitions', icon: Trophy, count: '12' },
    { id: 'rubrics', label: 'Rubric Builder', icon: ListOrdered },
    { id: 'judges', label: 'Judges Roster', icon: UserCheck, count: '28' },
    { id: 'scoring', label: 'Scoring Panel', icon: FileCheck2, highlight: true },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Medal, live: true },
    { id: 'results', label: 'Official Results', icon: Award },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'notifications', label: 'Notifications', icon: Bell, notifBadge: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const judgeNavItems: NavItem[] = [
    { id: 'judge-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'roles', label: 'My Event Assignment', icon: ShieldCheck },
    { id: 'competitions', label: 'My Competitions', icon: Trophy },
    { id: 'scoring', label: 'Scoring Panel', icon: FileCheck2, highlight: true },
    { id: 'leaderboard', label: 'Live Leaderboard', icon: Medal, live: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, notifBadge: unreadCount },
    { id: 'profile', label: 'My Profile', icon: User }
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
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-[#D8EBE7] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Area in Sidebar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#03A695] to-[#0B2545] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-teal-500/15">
              <span className="text-[#FD5E01]">T</span>T
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0B2545] tracking-tight leading-none">
                TECHNO TALENT
              </h2>
              <p className="text-[10px] font-bold text-[#FD5E01] uppercase tracking-wider mt-0.5">
                FEAST 2026
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            v1.0
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {currentRole === 'judge' ? 'Judge Workspace' : 'Main Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#E6F7F5] text-[#03A695] shadow-xs font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-[#03A695]'
                        : item.highlight
                        ? 'text-[#FD5E01]'
                        : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded bg-[#FD5E01] text-white text-[9px] font-extrabold uppercase">
                      {item.badge}
                    </span>
                  )}
                  {item.live && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                  {item.notifBadge && item.notifBadge > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#FD5E01] text-white text-[10px] font-bold">
                      {item.notifBadge}
                    </span>
                  ) : null}
                  {item.count && !item.badge && (
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.count}
                    </span>
                  )}
                  {isActive && (
                    <span className="w-1.5 h-4 rounded-full bg-[#FD5E01]" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Quick Arena Scoreboard shortcut */}
          <div className="pt-3 border-t border-slate-100 my-2">
            <button
              onClick={() => {
                navigate('live');
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-gradient-to-r from-teal-50/50 to-blue-50/50 border border-teal-100 hover:border-teal-300 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-[#FD5E01] animate-pulse" />
                <span>Stadium Display</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Bottom Profile / Quick Info Card */}
        <div className="p-3 border-t border-slate-100 bg-[#F7FCFB]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#D8EBE7] shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-900 truncate">
                  TechnoSchool Network
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold truncate">
                  ● Realtime Connected
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
