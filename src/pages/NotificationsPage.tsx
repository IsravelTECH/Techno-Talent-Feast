import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Bell,
  CheckCircle2,
  Trophy,
  FileCheck,
  AlertCircle,
  Clock,
  Trash2
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsRead, navigate } = useApp();
  const [filterType, setFilterType] = useState('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
            Notification Center & Event Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time feed of evaluator submissions, competition milestones, and system broadcasts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsRead}
          >
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 overflow-x-auto shadow-xs">
        {[
          { id: 'ALL', label: 'All Alerts' },
          { id: 'score', label: 'Scoring Submissions' },
          { id: 'competition', label: 'Competition Milestones' },
          { id: 'result', label: 'Results & Certificates' },
          { id: 'system', label: 'System Announcements' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filterType === tab.id
                ? 'bg-[#0057B8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card divide-y divide-slate-100 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications found in this category.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.actionLink) navigate(notif.actionLink);
              }}
              className={`p-5 flex items-start gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                !notif.isRead ? 'bg-[#F6F9FD]' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.type === 'score'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : notif.type === 'competition'
                    ? 'bg-[#EAF3FF] text-[#0057B8] border border-blue-200'
                    : notif.type === 'result'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {notif.type === 'score' ? (
                  <FileCheck className="w-5 h-5" />
                ) : notif.type === 'competition' ? (
                  <Trophy className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    {notif.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#F36C21] shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
