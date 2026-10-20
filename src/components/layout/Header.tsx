import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { formatRelativeTime } from '../../utils/time';
import {
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  User
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    currentUser,
    currentRole,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    navigate,
    logout
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [, setTick] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const userNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const role = (n.recipientRole || 'ALL').trim().toLowerCase();
      if (role === 'all') return true;

      if (currentRole === 'admin') {
        return role === 'admin';
      }

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

  // Refresh relative timestamps every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30 shadow-xs shrink-0">
      <div className="px-3 sm:px-4 lg:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title={isSidebarOpen ? 'Collapse Navigation Sidebar' : 'Open Navigation Sidebar'}
            aria-label={isSidebarOpen ? 'Collapse Navigation Sidebar' : 'Open Navigation Sidebar'}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Techno Talent Fest 2026 Branding */}
          <div
            onClick={() => navigate(currentRole === 'judge' ? 'judge-dashboard' : 'dashboard')}
            className="cursor-pointer flex items-center gap-2 select-none min-w-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#03A695] to-[#0B2545] flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-teal-500/15 shrink-0">
              <span className="text-[#FD5E01]">T</span>T
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-none truncate">
                <span className="hidden sm:inline">TECHNO TALENT FEST</span>
                <span className="sm:hidden font-black">TTF</span>
              </span>
              <span className="text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md bg-[#FD5E01] text-white leading-none shadow-xs shrink-0">
                2026
              </span>
            </div>
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">

          {/* Notifications Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#FD5E01] ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute right-2 sm:right-0 mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-scale-up">
                <div className="px-4 py-3 bg-[#F7FCFB] border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-orange-50 text-[#FD5E01] text-[10px] font-bold border border-orange-100">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-[#03A695] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {userNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications right now.
                    </div>
                  ) : (
                    userNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.actionLink) {
                            navigate(notif.actionLink);
                            setShowNotifications(false);
                          }
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                          !notif.isRead ? 'bg-[#F7FCFB]' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                            !notif.isRead ? 'bg-[#FD5E01]' : 'bg-slate-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 leading-tight">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                            {formatRelativeTime(notif.createdAt || notif.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <UserAvatar name={currentUser?.name || 'Administrator'} size="sm" />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser?.name || 'Administrator'}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 mt-0.5 uppercase tracking-wide">
                  {currentRole === 'admin' ? 'Administration' : 'Juror / Judge'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-scale-up">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser?.name || 'Administrator'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'admin@technoschool.in'}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] text-[10px] font-bold">
                    <span>{currentUser?.organization || 'TechnoSchool Central Directorate'}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
