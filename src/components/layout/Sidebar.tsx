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
  Settings,
  Bell,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  KeyRound,
  FileCheck2,
  Award,
  Scale
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

  const userNotifications = React.useMemo(() => {
    return notifications.filter((n) => {
      const role = (n.recipientRole || 'ALL').trim().toLowerCase();
      if (role === 'all') return true;
      if (currentRole === 'admin') return role === 'admin';
      if (currentRole === 'judge') {
        if (role === 'judge') return true;
        const currentJudgeId = (currentUser?.judgeId || '').trim().toLowerCase();
        const currentUserId = (currentUser?.id || '').trim().toLowerCase();
        if (role === currentJudgeId || role === currentUserId) return true;
        const digitsRole = role.replace(/\D/g, '');
        const digitsJudge = currentJudgeId.replace(/\D/g, '');
        if (digitsRole && digitsJudge && parseInt(digitsRole, 10) === parseInt(digitsJudge, 10)) {
          return true;
        }
        return false;
      }
      return true;
    });
  }, [notifications, currentRole, currentUser]);

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;
  const pendingJudgeCount = assignments.filter((a) => a.status === 'ASSIGNED' || a.status === 'IN_PROGRESS').length;

  const pendingRequestsCount = participants.filter(
    (p) => p.scoreEditRequest && p.scoreEditRequest.status === 'PENDING'
  ).length;

  // Real-time calculation of tied teams count
  const tiedTeamsCount = React.useMemo(() => {
    const map = new Map<string, number>();
    participants.forEach((p) => {
      const isSub = p.status === 'SUBMITTED' || p.isScoreLocked;
      if (isSub && typeof p.finalScore === 'number' && p.finalScore > 0) {
        const k = `${p.categoryNumber || 1}_${p.finalScore}`;
        map.set(k, (map.get(k) || 0) + 1);
      }
    });
    let count = 0;
    map.forEach((cnt) => {
      if (cnt >= 2) count += cnt;
    });
    return count;
  }, [participants]);

  // STRICT ADMINISTRATION NAVIGATION (Clean without counts)
  const adminNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, badge: 'LIVE' },
    {
      id: 'score-requests',
      label: 'Score Edit Requests',
      icon: FileCheck2,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} NEW` : undefined,
      highlight: pendingRequestsCount > 0
    },
    {
      id: 'tie-breaks',
      label: 'Tie-Break Alerts',
      icon: Scale,
      badge: tiedTeamsCount > 0 ? `${tiedTeamsCount} TIED` : undefined,
      highlight: tiedTeamsCount > 0
    },
    { id: 'assignments', label: 'Judge Roaster', icon: ClipboardList, highlight: false },
    { id: 'schools', label: 'Schools', icon: Building2 },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'categories', label: 'Categories', icon: Trophy },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'results', label: 'Results & Leaderboard', icon: Medal },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  // DEDICATED JUDGE NAVIGATION MENU (Score page & Profile page that's it)
  const judgeNavItems: NavItem[] = [
    { id: 'scoring', label: 'Score Page', icon: FileCheck2, highlight: true },
    { id: 'profile', label: 'Profile Page', icon: User }
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
        className={`h-screen bg-white transition-all duration-300 ease-in-out shrink-0 flex flex-col z-40 ${
          isOpen
            ? 'fixed lg:static top-0 left-0 w-64 translate-x-0 opacity-100 border-r border-[#E2E8F0] shadow-2xl lg:shadow-none'
            : 'fixed lg:static top-0 left-0 -translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 lg:overflow-hidden lg:opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-64 h-full flex flex-col min-w-[16rem] overflow-hidden">
          {/* Top Brand Area in Sidebar */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div
              onClick={() => {
                navigate(currentRole === 'judge' ? 'scoring' : 'dashboard');
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className="cursor-pointer flex items-center"
            >
              <TechnoLogo variant="full" size="sm" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] border border-teal-200 text-[10px] font-bold uppercase">
                {currentRole === 'admin' ? 'ADMIN' : 'JUDGE'}
              </span>
            </div>
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
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      onClose();
                    }
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
              onClick={() => {
                navigate('profile');
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  onClose();
                }
              }}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#E6F7F5] border border-slate-200/80 hover:border-teal-200 transition-all cursor-pointer flex items-center gap-2.5 group"
              title="View Profile"
            >
              <UserAvatar name={currentUser?.name || 'Administrator'} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#03A695] truncate transition-colors">
                  {currentUser?.name || 'Administrator'}
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
        </div>
      </aside>
    </>
  );
};
