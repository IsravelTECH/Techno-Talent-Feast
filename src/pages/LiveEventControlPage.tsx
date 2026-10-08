import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Radio,
  Eye,
  EyeOff,
  Lock,
  Sparkles,
  Trophy,
  ExternalLink,
  ShieldAlert,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Play,
  Pause,
  Award
} from 'lucide-react';
import { ScoreboardVisibility } from '../types';

export const LiveEventControlPage: React.FC = () => {
  const {
    scoreboardVisibility,
    setScoreboardVisibility,
    selectedEvent,
    triggerManagerScenario,
    navigate,
    addToast
  } = useApp();

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const visibilityOptions: { id: ScoreboardVisibility; title: string; desc: string; icon: any; color: string }[] = [
    {
      id: 'HIDDEN',
      title: 'Hidden (Blackout Mode)',
      desc: 'All scores and leaderboards hidden from public and stadium displays',
      icon: EyeOff,
      color: 'border-slate-300 text-slate-700 bg-slate-50'
    },
    {
      id: 'INTERNAL_ONLY',
      title: 'Internal Admin & Jurors Only',
      desc: 'Scores visible only inside authenticated admin & judge desks',
      icon: Lock,
      color: 'border-blue-300 text-blue-800 bg-blue-50'
    },
    {
      id: 'LIVE',
      title: 'Live Arena Streaming (Public)',
      desc: 'Real-time leaderboard updates broadcasted to EIBFS Stadium Screens',
      icon: Radio,
      color: 'border-emerald-300 text-emerald-800 bg-emerald-50'
    },
    {
      id: 'PUBLISHED',
      title: 'Official Results Published',
      desc: 'Final rankings certified, locked, and award podiums revealed',
      icon: Trophy,
      color: 'border-amber-300 text-amber-800 bg-amber-50'
    }
  ];

  const handleSetVisibility = (mode: ScoreboardVisibility) => {
    setScoreboardVisibility(mode);
    addToast(`Scoreboard Visibility Mode set to: ${mode}`, 'success');
  };

  const handleSendBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    addToast(`Broadcast Sent to 36 Jurors: "${broadcastMessage}"`, 'success');
    setBroadcastMessage('');
    setIsBroadcastModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Live Event Command & Stadium Controller
            </h1>
            <Badge variant="live" dot>
              ARENA MASTER
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Control live score broadcasting to stadium screens, manage competition phases, and send emergency juror broadcasts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="orange"
            size="sm"
            icon={<ExternalLink className="w-4 h-4" />}
            onClick={() => navigate('live')}
          >
            Launch Stadium Screen (/live)
          </Button>
        </div>
      </div>

      {/* Visibility Control Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div>
          <h2 className="text-base font-black text-slate-900">
            1. Stadium & Public Scoreboard Visibility Control
          </h2>
          <p className="text-xs text-slate-500">
            Control whether audience and participants can see live rankings in real-time or if scores remain confidential
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {visibilityOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = scoreboardVisibility === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSetVisibility(opt.id)}
                className={`p-5 rounded-2xl border-2 text-left transition-all relative ${
                  isSelected
                    ? `${opt.color} ring-4 ring-blue-500/20 shadow-md`
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase">
                    ACTIVE
                  </span>
                )}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 inline-block mb-3 shadow-xs">
                  <Icon className="w-5 h-5 text-[#0057B8]" />
                </div>
                <h3 className="text-xs font-black text-slate-900 mb-1">{opt.title}</h3>
                <p className="text-[11px] text-slate-500 leading-snug">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Arena Operations Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions & Juror Broadcast */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            Arena Intercom & Direct Broadcasts
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs">
              <strong className="text-[#0057B8] block mb-1">Instant Juror Push Notification</strong>
              <p className="text-slate-600">
                Send an immediate announcement banner to all 36 Juror scoring pads (e.g., "Category 3 judging starts now at Table A4").
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                icon={<Megaphone className="w-4 h-4" />}
                onClick={() => setIsBroadcastModalOpen(true)}
              >
                Send Juror Announcement
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
              <strong className="text-amber-800 block mb-1">Simulate Grand Finale Climax (92%)</strong>
              <p className="text-slate-600">
                Populate complete Grand Finale scores across all 6 categories to demonstrate the live awards podium and rank calculation.
              </p>
              <Button
                variant="orange"
                size="sm"
                className="mt-3"
                icon={<Sparkles className="w-4 h-4" />}
                onClick={triggerManagerScenario}
              >
                Trigger Scoring Scenario
              </Button>
            </div>
          </div>
        </div>

        {/* Emergency & Integrity Actions */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            Scoring Integrity & Emergency Controls
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
              <strong className="text-rose-800 block mb-1">Emergency Score Freeze</strong>
              <p className="text-slate-600">
                Instantly pause score submission across all juror terminals for verification or rubric disputes.
              </p>
              <Button
                variant="danger"
                size="sm"
                className="mt-3"
                icon={<Pause className="w-4 h-4" />}
                onClick={() => setIsEmergencyModalOpen(true)}
              >
                Freeze Scoring Submissions
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs">
              <strong className="text-emerald-800 block mb-1">Force Rank Recalculation</strong>
              <p className="text-slate-600">
                Recalculate all tie-breakers, standard deviations, and overall institutional champion schools.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => addToast('Recalculated all 6 category rankings & tiebreakers', 'success')}
              >
                Recalculate Ranks Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Announcement to All Jurors"
        subtitle="This high-priority message will appear on all active judge scoring terminals"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsBroadcastModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" icon={<Megaphone className="w-4 h-4" />} onClick={handleSendBroadcast}>
              Broadcast to Jurors
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 block">Broadcast Message Text</label>
          <textarea
            rows={3}
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="e.g. Attention all Category 4 judges: please proceed to Hall B for Robotics Arena defense..."
            className="w-full p-3 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>
      </Modal>

      {/* Emergency Freeze Modal */}
      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Emergency Arena Freeze Confirmation"
        subtitle="Safety and integrity intervention"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsEmergencyModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setIsEmergencyModalOpen(false);
                addToast('Scoring submissions paused by Administration', 'warning');
              }}
            >
              Confirm Emergency Freeze
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to freeze scoring submissions? Jurors will not be able to submit or modify marks until Administration unfreezes the arena.
        </p>
      </Modal>
    </div>
  );
};
