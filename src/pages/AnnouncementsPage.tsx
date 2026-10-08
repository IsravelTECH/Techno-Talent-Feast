import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Megaphone,
  Plus,
  Bell,
  Search,
  Filter,
  Users,
  ShieldCheck,
  UserCheck,
  Clock,
  Pin,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { AnnouncementItem } from '../types';

export const AnnouncementsPage: React.FC = () => {
  const { announcements, createAnnouncement, addToast } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'JUDGES' | 'ADMINISTRATION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreate = () => {
    if (!title.trim() || !message.trim()) {
      addToast('Please enter both title and announcement body', 'error');
      return;
    }

    createAnnouncement({
      title,
      message,
      priority,
      targetAudience
    });

    addToast('Official announcement broadcasted successfully', 'success');
    setTitle('');
    setMessage('');
    setIsCreateModalOpen(false);
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Event Announcements & Intercom
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              Broadcast System
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch high-priority schedule updates, table directives, and scoring guidelines to Jurors and Administration
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create Broadcast
          </Button>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filteredAnnouncements.length} broadcasts
        </span>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAnnouncements.map((ann) => {
          const isUrgent = ann.priority === 'URGENT' || ann.priority === 'HIGH';
          return (
            <div
              key={ann.id}
              className={`p-5 rounded-3xl border transition-all ${
                isUrgent
                  ? 'bg-amber-50/40 border-amber-200 shadow-sm'
                  : 'bg-white border-slate-200 shadow-card'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    ann.priority === 'URGENT'
                      ? 'bg-rose-100 text-rose-700'
                      : ann.priority === 'HIGH'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-[#0057B8]'
                  }`}>
                    {ann.priority}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                    Target: {ann.targetAudience}
                  </span>

                  <h3 className="text-sm font-black text-slate-900">{ann.title}</h3>
                </div>

                <span className="text-[11px] text-slate-400 font-mono shrink-0">
                  {new Date(ann.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed pl-1">
                {ann.message}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Broadcasted by: <strong className="text-slate-700">{ann.author}</strong></span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched to Arena Displays
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Broadcast New Arena Announcement"
        subtitle="Dispatched in real-time to active judge and admin terminals"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" icon={<Megaphone className="w-4 h-4" />} onClick={handleCreate}>
              Send Broadcast
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Headline / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule Update: Category 5 Defense Commences at 11:30 AM"
              className="w-full px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent / Flash</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Target Audience</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="ALL">All (Judges & Administration)</option>
                <option value="JUDGES">Judges Only</option>
                <option value="ADMINISTRATION">Administration Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Announcement Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter full details, table locations, instructions..."
              className="w-full p-3 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
