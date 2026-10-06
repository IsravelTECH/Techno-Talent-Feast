import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TechnoLogo } from '../components/common/TechnoLogo';
import {
  Trophy,
  Radio,
  Maximize2,
  Minimize2,
  Clock,
  Sparkles,
  ArrowRight,
  Building2,
  Layers,
  ChevronLeft
} from 'lucide-react';

export const PublicLiveScoreboardPage: React.FC = () => {
  const {
    leaderboard,
    schools,
    competitions,
    scoringActivities,
    selectedEvent,
    navigate
  } = useApp();

  const [activeCompIndex, setActiveCompIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const currentComp = competitions[activeCompIndex] || competitions[0];

  return (
    <div className="min-h-screen bg-[#07132B] text-white flex flex-col justify-between selection:bg-[#F36C21] selection:text-white p-4 sm:p-6 lg:p-8">
      {/* Top Arena Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-blue-900/60">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('dashboard')}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Exit Arena View to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <TechnoLogo variant="white" size="lg" />

          <div className="hidden md:block pl-4 border-l border-white/20">
            <h1 className="text-xl font-black tracking-tight leading-none text-white">
              TECHNO TALENT FEAST 2026
            </h1>
            <p className="text-[11px] font-bold text-[#F36C21] uppercase tracking-wider mt-0.5">
              GRAND ARENA LIVE SCOREBOARD
            </p>
          </div>
        </div>

        {/* Live Indicator & Clock */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-black tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span>ARENA BROADCAST LIVE</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-mono font-bold text-blue-200">
            <Clock className="w-3.5 h-3.5 text-[#F36C21]" />
            <span>{currentTime}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Toggle Fullscreen Arena Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Arena Category Bar */}
      <div className="my-4 flex items-center justify-between gap-2 overflow-x-auto pb-2">
        <div className="flex items-center gap-2">
          {competitions.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveCompIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all shrink-0 cursor-pointer ${
                activeCompIndex === idx
                  ? 'bg-gradient-to-r from-[#F36C21] to-[#FF8A3D] text-white shadow-lg shadow-orange-900/40 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-blue-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-blue-300 hidden lg:block">
          Venue: {currentComp.venueHall}
        </span>
      </div>

      {/* Main Grid: 2 Columns for Stadium Display */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 my-2">
        {/* Left: Top 10 Ranked Leaders with Large Stadium Typography */}
        <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-black uppercase tracking-wider text-white">
                  {currentComp.name} — Current Standings
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                ● Live Updates Active
              </span>
            </div>

            <div className="space-y-2.5">
              {leaderboard.slice(0, 7).map((item, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                return (
                  <div
                    key={item.participantId}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all border ${
                      isFirst
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-400/40 shadow-lg shadow-amber-900/20'
                        : isSecond
                        ? 'bg-white/10 border-slate-300/30'
                        : isThird
                        ? 'bg-orange-900/20 border-orange-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                          isFirst
                            ? 'bg-amber-400 text-slate-950 text-base'
                            : isSecond
                            ? 'bg-slate-200 text-slate-950'
                            : isThird
                            ? 'bg-[#F36C21] text-white'
                            : 'bg-white/10 text-blue-200'
                        }`}
                      >
                        {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${idx + 1}`}
                      </div>

                      <img
                        src={item.photo}
                        alt={item.participantName}
                        className="w-10 h-10 rounded-xl object-cover border border-white/20"
                      />

                      <div>
                        <h3 className="text-base font-black text-white leading-tight">
                          {item.participantName}
                        </h3>
                        <p className="text-xs text-blue-200 font-medium truncate">
                          {item.schoolName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-2xl font-black text-white tracking-tight">
                          {item.score}%
                        </span>
                        <span className="text-[10px] text-blue-300 font-bold block uppercase">
                          {item.score} / {item.maxScore} PTS
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-300">
            <span>Powered by TechnoSchool Championship Scoring Engine</span>
            <span className="font-bold text-amber-400">Total 1,248 Candidates Registered</span>
          </div>
        </div>

        {/* Right: School Medals & Real-time Scoring Feed */}
        <div className="lg:col-span-4 space-y-6">
          {/* School Leaderboard */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-3">
              <Building2 className="w-4 h-4 text-[#F36C21]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                School Medal Standings
              </h3>
            </div>

            <div className="space-y-2.5">
              {schools.slice(0, 4).map((sch, i) => (
                <div
                  key={sch.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-white/10 font-black text-blue-200 flex items-center justify-center text-[11px]">
                      #{sch.rank}
                    </span>
                    <div>
                      <h4 className="font-bold text-white line-clamp-1">{sch.name}</h4>
                      <span className="text-[10px] text-blue-300">{sch.city}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-amber-400 text-sm">
                      {sch.averageScore}%
                    </span>
                    <span className="text-[10px] text-blue-200 block font-bold">
                      🥇{sch.goldMedals} 🥈{sch.silverMedals} 🥉{sch.bronzeMedals}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Arena Activity Ticker */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F36C21] animate-ping" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Recent Submissions
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {scoringActivities.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3"
                >
                  <img
                    src={act.judgeAvatar}
                    alt={act.judgeName}
                    className="w-7 h-7 rounded-lg object-cover shrink-0 border border-blue-400"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-blue-100 font-medium text-[11px]">
                      <strong className="text-white">{act.judgeName}</strong> {act.action}{' '}
                      <strong className="text-[#F36C21]">{act.participantName}</strong>
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-blue-300 mt-1">
                      <span>{act.competitionName}</span>
                      {act.score && (
                        <span className="font-black text-amber-400">{act.score} pts</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker */}
      <div className="py-3 px-4 rounded-2xl bg-gradient-to-r from-[#003B7A] to-[#0057B8] border border-blue-600/40 text-center text-xs font-semibold flex items-center justify-between flex-wrap gap-2 mt-4">
        <span>🏆 TECHNO TALENT FEAST 2026 • OFFICIAL GRAND FINALE SCORING</span>
        <button
          onClick={() => navigate('dashboard')}
          className="text-amber-300 hover:underline font-bold"
        >
          Exit to Admin Console →
        </button>
      </div>
    </div>
  );
};
