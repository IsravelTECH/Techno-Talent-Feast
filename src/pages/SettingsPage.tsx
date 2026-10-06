import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Settings,
  Shield,
  Sliders,
  Bell,
  Lock,
  Sparkles,
  Save,
  CheckCircle2,
  Radio,
  FileCheck2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { selectedEvent, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<
    'event' | 'scoring' | 'notifications' | 'security'
  >('event');

  const [autoLock, setAutoLock] = useState(true);
  const [tieBreaker, setTieBreaker] = useState('HIGHEST_INNOVATION');
  const [publicLeaderboard, setPublicLeaderboard] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Settings Saved Successfully',
      message: 'Event scoring engine and security configurations updated.'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
          System & Event Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure championship rules, scoring engine parameters, tie-breakers, and live broadcast security
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 overflow-x-auto shadow-xs">
        {[
          { id: 'event', label: 'Event Parameters' },
          { id: 'scoring', label: 'Scoring Engine & Tie Breakers' },
          { id: 'notifications', label: 'Broadcast & Alerts' },
          { id: 'security', label: 'Access Control & Audit' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0057B8] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 lg:p-8 space-y-6">
        {activeTab === 'event' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Event Identity & Venue Details
            </h3>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Championship Official Title
              </label>
              <input
                type="text"
                defaultValue={selectedEvent.name}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Edition Label
                </label>
                <input
                  type="text"
                  defaultValue={selectedEvent.edition}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Event Status
                </label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#0057B8]">
                  <option value="LIVE">● LIVE (Arena Scoring Active)</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Championship Theme Slogan
              </label>
              <input
                type="text"
                defaultValue={selectedEvent.theme}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>
        )}

        {activeTab === 'scoring' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Automated Scoring Engine Parameters
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F9FD] border border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLock}
                  onChange={(e) => setAutoLock(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0057B8] focus:ring-[#0057B8]"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Immediate Score Lock on Evaluation Submit
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Prevents accidental score edits after submission without convener override.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl bg-[#F6F9FD] border border-slate-100 cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicLeaderboard}
                  onChange={(e) => setPublicLeaderboard(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0057B8] focus:ring-[#0057B8]"
                />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Realtime Public /live Scoreboard Broadcasting
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Sync verified marks directly with arena projectors and stadium monitors.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Tie-Breaker Priority Rule
              </label>
              <select
                value={tieBreaker}
                onChange={(e) => setTieBreaker(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                <option value="HIGHEST_INNOVATION">
                  Priority 1: Higher marks in Innovation & Problem Relevance
                </option>
                <option value="HIGHEST_TECHNICAL">
                  Priority 2: Higher marks in Technical Knowledge & Architecture
                </option>
                <option value="EARLIER_SUBMISSION">
                  Priority 3: Earlier completion timestamp
                </option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Broadcast Channels & Alerts
            </h3>
            <p className="text-slate-600">
              Configure in-app and arena notification triggers for jury milestones and result publishing.
            </p>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-[#0057B8]" />
                <span>Notify Admin on each judge score submission</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-[#0057B8]" />
                <span>Trigger confetti burst on Top 3 Rank changes</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded text-[#0057B8]" />
                <span>Publish real-time score summaries to school coordinators</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Role-Based Access & Audit Logging
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
              <p className="font-bold">System Status: Secure & Synchronized</p>
              <p className="text-[11px]">
                RBAC is enforced across Super Admin, Event Admin, Judges, and Public Screens.
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button type="submit" variant="orange" size="sm" icon={<Save className="w-4 h-4" />}>
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
