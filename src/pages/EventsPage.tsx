import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Calendar,
  MapPin,
  Users,
  Building2,
  Trophy,
  Plus,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { selectedEvent, navigate, addToast } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const eventsList = [
    {
      ...selectedEvent,
      isPrimary: true
    },
    {
      id: 'ttf-stem-2026',
      name: 'Techno Junior STEM Fair 2026',
      edition: 'Junior Regional',
      theme: 'Young Minds, Infinite Possibilities',
      date: '28 November 2026',
      venue: 'TechnoSchool Coimbatore Campus',
      city: 'Coimbatore, Tamil Nadu',
      status: 'UPCOMING' as const,
      totalParticipants: 640,
      totalSchools: 24,
      totalJudges: 16,
      totalCompetitions: 6,
      description: 'Championship for junior grades 3-7 in basic coding, science prototypes, and robotics discovery.',
      bannerImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      scoringProgress: 0
    },
    {
      id: 'ttf-2025',
      name: 'Techno Talent Feast 2025 (Archive)',
      edition: '6th Edition',
      theme: 'NextGen Innovators',
      date: '15 October 2025',
      venue: 'TechnoSchool Main Auditorium',
      city: 'Chennai, Tamil Nadu',
      status: 'COMPLETED' as const,
      totalParticipants: 1080,
      totalSchools: 36,
      totalJudges: 24,
      totalCompetitions: 10,
      description: 'Historical archive of the 6th edition of Techno Talent Feast.',
      bannerImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
      scoringProgress: 100
    }
  ];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateModal(false);
    addToast({
      type: 'success',
      title: 'Event Created Successfully',
      message: 'New Techno Talent Feast event draft created in system.'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
            Events Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure championship editions, schedules, participating schools, and venues
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            + Create Event
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsList.map((evt) => (
          <div
            key={evt.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              {/* Event Banner */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src={evt.bannerImage}
                  alt={evt.name}
                  className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge
                    variant={
                      evt.status === 'LIVE'
                        ? 'live'
                        : evt.status === 'UPCOMING'
                        ? 'warning'
                        : 'neutral'
                    }
                    dot={evt.status === 'LIVE'}
                  >
                    {evt.status}
                  </Badge>
                  <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                    {evt.edition}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                  {evt.name}
                </h3>
                <p className="text-xs text-slate-500 italic mt-1">
                  "{evt.theme}"
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#0057B8]" />
                    <span className="font-semibold text-slate-800">{evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#F36C21]" />
                    <span className="truncate">{evt.venue}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-[#F6F9FD]">
                    <span className="block text-xs font-black text-slate-900">
                      {evt.totalParticipants}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Students</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F6F9FD]">
                    <span className="block text-xs font-black text-[#0057B8]">
                      {evt.totalSchools}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Schools</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#F6F9FD]">
                    <span className="block text-xs font-black text-[#F36C21]">
                      {evt.totalCompetitions}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Arenas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0">
              <Button
                variant={evt.status === 'LIVE' ? 'primary' : 'outline'}
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => navigate('event-detail')}
              >
                {evt.status === 'LIVE' ? 'Enter Event Dashboard' : 'View Event Specs'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Event Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Techno Talent Feast Event"
        subtitle="Initialize new inter-school championship portal"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Event Name
            </label>
            <input
              type="text"
              defaultValue="Techno Talent Feast 2027"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Event Date
              </label>
              <input
                type="date"
                defaultValue="2027-10-10"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8]"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                City / Region
              </label>
              <input
                type="text"
                defaultValue="Chennai, Tamil Nadu"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Campus Venue
            </label>
            <input
              type="text"
              defaultValue="TechnoSchool Main Campus - Grand Complex"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#0057B8]"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="orange" size="sm">
              Save & Launch Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const EventDetailPage: React.FC = () => {
  const { selectedEvent, competitions, schools, judges, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'competitions' | 'schools' | 'judges' | 'schedule'
  >('overview');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Event Hero Header */}
      <div className="bg-gradient-to-r from-[#003B7A] via-[#0057B8] to-[#004899] text-white p-6 lg:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <Badge variant="live" dot>
                {selectedEvent.status}
              </Badge>
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-bold border border-white/20">
                {selectedEvent.edition}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {selectedEvent.name}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {selectedEvent.description}
            </p>
            <div className="mt-4 flex items-center gap-4 text-xs text-blue-200 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#F36C21]" />
                <strong className="text-white">{selectedEvent.date}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F36C21]" />
                <strong className="text-white">{selectedEvent.venue}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="orange"
              size="md"
              icon={<Trophy className="w-4 h-4" />}
              onClick={() => navigate('leaderboard')}
            >
              Live Leaderboard
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 flex items-center gap-1 overflow-x-auto shadow-xs">
        {[
          { id: 'overview', label: 'Event Overview' },
          { id: 'competitions', label: `Competitions (${competitions.length})` },
          { id: 'schools', label: `Registered Schools (${schools.length})` },
          { id: 'judges', label: `Judges Panel (${judges.length})` },
          { id: 'schedule', label: 'Grand Arena Schedule' }
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

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
            <h3 className="text-base font-extrabold text-slate-900">
              Live Competition Progress Ticker
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-[#EAF3FF] border border-blue-100">
                <p className="text-2xl font-black text-[#0057B8]">1,248</p>
                <p className="text-xs text-slate-600 font-semibold mt-1">Total Students</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF3EC] border border-orange-100">
                <p className="text-2xl font-black text-[#F36C21]">876</p>
                <p className="text-xs text-slate-600 font-semibold mt-1">Evaluations Done</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-2xl font-black text-emerald-700">78%</p>
                <p className="text-xs text-slate-600 font-semibold mt-1">Completion Rate</p>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
                <p className="text-2xl font-black text-purple-700">42</p>
                <p className="text-xs text-slate-600 font-semibold mt-1">Schools Participating</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Championship Guidelines
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0057B8]" />
                  <span>Judges score on a standardized 100-point multi-parameter rubric.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0057B8]" />
                  <span>Scores are locked and recorded immediately to prevent score tampering.</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0057B8]" />
                  <span>Top 3 podium finishes awarded official medals, certificates, and trophies.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Championship Operations
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-semibold"
                onClick={() => navigate('competitions')}
              >
                Browse All 12 Competitions →
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-semibold"
                onClick={() => navigate('rubrics')}
              >
                Rubric Criteria Builder →
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-semibold"
                onClick={() => navigate('reports')}
              >
                Export Event Summaries →
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'competitions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate('competitions', { compId: c.id })}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 shadow-card cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between">
                <Badge variant="primary">{c.category}</Badge>
                <Badge variant={c.status === 'LIVE' ? 'live' : 'neutral'} dot={c.status === 'LIVE'}>
                  {c.status}
                </Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">{c.name}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span>{c.registeredCount} Participants</span>
                <span className="text-[#0057B8]">{c.assignedJudgesCount} Judges</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'schools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((sch) => (
            <div
              key={sch.id}
              onClick={() => navigate('schools', { schoolId: sch.id })}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 shadow-card cursor-pointer transition-all"
            >
              <h4 className="text-sm font-bold text-slate-900">{sch.name}</h4>
              <p className="text-xs text-slate-500">{sch.city}, {sch.state}</p>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                <span>{sch.totalParticipants} Students</span>
                <span className="text-[#F36C21]">Avg: {sch.averageScore}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'judges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {judges.map((j) => (
            <div
              key={j.judgeId}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">{j.judgeName}</h4>
                <Badge variant={j.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {j.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">{j.competitionName}</p>
              <p className="text-xs text-[#0057B8] font-bold mt-2">
                {j.completedCount} Evaluated / {j.pendingCount} Pending
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900">Today's Grand Arena Schedule</h3>
          <div className="space-y-3">
            {[
              { time: '09:00 AM - 09:45 AM', event: 'Inaugural Ceremony & Lamp Lighting', hall: 'Main Grand Auditorium' },
              { time: '10:00 AM - 01:00 PM', event: 'Robotics & AI Innovation Preliminary Evaluation Round', hall: 'Innovation Arena A & AI Lab' },
              { time: '01:00 PM - 01:45 PM', event: 'Networking & Networking Lunch', hall: 'Dining Pavilion' },
              { time: '02:00 PM - 04:30 PM', event: 'Coding Sprint Finals & STEM Demonstration', hall: 'Computing Center 1' },
              { time: '05:00 PM - 06:30 PM', event: 'Grand Valedictory & Official Trophy Award Ceremony', hall: 'Main Grand Auditorium' }
            ].map((slot, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#F6F9FD] border border-slate-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#0057B8]">{slot.time}</span>
                  <p className="font-bold text-slate-900 mt-0.5">{slot.event}</p>
                </div>
                <span className="text-slate-500 font-semibold">{slot.hall}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
