import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TechnoLogo } from '../common/TechnoLogo';
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  LogOut,
  User,
  Settings,
  Shield,
  CheckCircle2,
  Sparkles,
  Radio,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    currentRole,
    selectedEvent,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    navigate,
    logout
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('participants');
    }
  };

  return (
    <header className="bg-white border-b border-[#D8EBE7] sticky top-0 z-30 shadow-xs">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3 lg:gap-4">
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => navigate(currentRole === 'judge' ? 'judge-dashboard' : 'dashboard')}
            className="cursor-pointer flex items-center"
          >
            <TechnoLogo variant="badge" size="md" />
          </div>

          {/* Event Selector Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7FCFB] border border-[#D8EBE7] hover:border-[#03A695] transition-colors cursor-pointer group">
            <span className="w-2 h-2 rounded-full bg-[#03A695] animate-pulse" />
            <span className="text-xs font-bold text-[#0B2545] tracking-tight group-hover:text-[#03A695]">
              {selectedEvent.name}
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FD5E01] text-white uppercase tracking-wider">
              LIVE
            </span>
          </div>
        </div>

        {/* Center: Quick Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search participant, ID, school, competition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#F7FCFB] hover:bg-white focus:bg-white border border-slate-200 rounded-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695] transition-all"
            />
          </form>
        </div>

        {/* Right: Actions, Roles, Notifications & Profile */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* User Roles Shortcut button */}
          <button
            onClick={() => navigate('roles')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6F7F5] hover:bg-[#d0f0eb] text-[#03A695] font-bold text-xs border border-[#03A695]/30 transition-colors"
            title="Manage User Roles & Event Assignments"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>User Roles</span>
          </button>

          {/* Public Scoreboard Button */}
          <button
            onClick={() => navigate('live')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3EC] hover:bg-[#ffe5d6] text-[#FD5E01] font-bold text-xs border border-orange-200 transition-colors"
            title="Open Public Arena Live Scoreboard"
          >
            <Radio className="w-3.5 h-3.5 text-[#FD5E01] animate-pulse" />
            <span>Arena /live</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </button>

          {/* Notifications Center */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#FD5E01] ring-2 ring-white" />
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden z-50 animate-scale-up">
                <div className="px-4 py-3 bg-[#F7FCFB] border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] text-[10px] font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-[#03A695] hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map((notif) => (
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
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {notif.timestamp}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-[#F7FCFB] border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      navigate('notifications');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-bold text-[#03A695] hover:text-[#008C7E]"
                  >
                    View All Activity & Notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#03A695] ring-2 ring-teal-50"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-semibold text-[#5B6B7C] mt-0.5 uppercase tracking-wide">
                  {currentRole === 'admin'
                    ? 'Super Admin'
                    : currentRole === 'judge'
                    ? 'Robotics Judge'
                    : 'Participant'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 animate-scale-up">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] text-[10px] font-bold">
                    <Shield className="w-3 h-3" />
                    <span>{currentUser.organization}</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('roles');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F7FCFB] flex items-center gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#03A695]" />
                    <span>User Roles & Event Assignments</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5"
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
