import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  Medal,
  Trophy,
  Search,
  Filter,
  Radio,
  ArrowUp,
  ArrowDown,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const LiveLeaderboardPage: React.FC = () => {
  const { leaderboard, competitions, schools, navigate } = useApp();

  const [selectedCompFilter, setSelectedCompFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeaderboard = leaderboard.filter((item) => {
    const matchesSearch =
      item.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.participantCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesComp =
      selectedCompFilter === 'ALL' || item.competitionName.includes(selectedCompFilter);
    return matchesSearch && matchesComp;
  });

  const top3 = filteredLeaderboard.slice(0, 3);
  const remaining = filteredLeaderboard.slice(3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003B7A] via-[#0057B8] to-[#004899] text-white p-6 lg:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="live" dot>
              LIVE STANDINGS
            </Badge>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-white text-xs font-bold">
              Realtime Synchronized
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Championship Live Leaderboard
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Official multi-arena talent standings computed from verified evaluator scores
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="orange"
            size="md"
            icon={<Radio className="w-4 h-4 animate-pulse" />}
            onClick={() => navigate('live')}
          >
            Launch Fullscreen /live Scoreboard
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search participant or school..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCompFilter}
            onChange={(e) => setSelectedCompFilter(e.target.value)}
            className="px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-medium text-slate-700 w-full sm:w-auto"
          >
            <option value="ALL">All Competitions (Overall Standings)</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.name.split(' ')[0]}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TOP 3 PODIUM PRESENTATION */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
          {/* Rank 2 (Silver) */}
          <div
            onClick={() => navigate('participant-detail', { partId: top3[1].participantId })}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 text-center hover:shadow-card-hover hover:border-slate-400 transition-all cursor-pointer md:order-1"
          >
            <div className="relative inline-block mb-3">
              <img
                src={top3[1].photo}
                alt={top3[1].participantName}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-200 mx-auto shadow-md"
              />
              <span className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center shadow-sm">
                🥈
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
              Rank 2 • Silver
            </span>
            <h3 className="text-base font-black text-slate-900 mt-2">
              {top3[1].participantName}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {top3[1].schoolName}
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-[#F6F9FD] border border-slate-100">
              <span className="text-2xl font-black text-slate-800">
                {top3[1].score}%
              </span>
              <span className="text-[11px] text-[#0057B8] block font-bold mt-0.5">
                {top3[1].competitionName}
              </span>
            </div>
          </div>

          {/* Rank 1 (Gold - Hero Center) */}
          <div
            onClick={() => navigate('participant-detail', { partId: top3[0].participantId })}
            className="bg-gradient-to-br from-[#003B7A] via-[#0057B8] to-[#004899] text-white rounded-3xl shadow-xl p-8 text-center hover:scale-[1.02] transition-all cursor-pointer border-2 border-amber-400/50 md:order-2 md:-translate-y-2 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>

            <div className="relative inline-block mb-3">
              <img
                src={top3[0].photo}
                alt={top3[0].participantName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-amber-400 mx-auto shadow-xl ring-4 ring-amber-400/20"
              />
              <span className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-amber-400 text-amber-950 font-black text-base flex items-center justify-center shadow-lg">
                🥇
              </span>
            </div>

            <span className="px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider">
              CHAMPION • RANK 1
            </span>
            <h2 className="text-xl font-black text-white mt-2">
              {top3[0].participantName}
            </h2>
            <p className="text-xs text-blue-100 font-medium truncate mt-0.5">
              {top3[0].schoolName}
            </p>

            <div className="mt-4 p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
              <span className="text-3xl font-black text-amber-300">
                {top3[0].score}%
              </span>
              <span className="text-xs text-white block font-bold mt-0.5">
                {top3[0].competitionName}
              </span>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div
            onClick={() => navigate('participant-detail', { partId: top3[2].participantId })}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 text-center hover:shadow-card-hover hover:border-orange-300 transition-all cursor-pointer md:order-3"
          >
            <div className="relative inline-block mb-3">
              <img
                src={top3[2].photo}
                alt={top3[2].participantName}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-orange-200 mx-auto shadow-md"
              />
              <span className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-xl bg-orange-100 text-orange-900 font-black text-sm flex items-center justify-center shadow-sm">
                🥉
              </span>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[10px] font-extrabold uppercase tracking-wider">
              Rank 3 • Bronze
            </span>
            <h3 className="text-base font-black text-slate-900 mt-2">
              {top3[2].participantName}
            </h3>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {top3[2].schoolName}
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-[#F6F9FD] border border-slate-100">
              <span className="text-2xl font-black text-slate-800">
                {top3[2].score}%
              </span>
              <span className="text-[11px] text-[#0057B8] block font-bold mt-0.5">
                {top3[2].competitionName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table for remaining ranks */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Official Ranked Standings (4th & Subsequent Ranks)
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Last Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase">
                <th className="py-3.5 pl-6">Rank</th>
                <th className="py-3.5 px-4">Participant</th>
                <th className="py-3.5 px-4">School</th>
                <th className="py-3.5 px-4">Competition</th>
                <th className="py-3.5 px-4 text-center">Percentage</th>
                <th className="py-3.5 pr-6 text-right">Award Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {remaining.map((item) => (
                <tr
                  key={item.participantId}
                  onClick={() => navigate('participant-detail', { partId: item.participantId })}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  <td className="py-4 pl-6">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 font-black text-slate-700 flex items-center justify-center text-xs">
                      #{item.rank}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900 group-hover:text-[#0057B8]">
                    {item.participantName}
                    <span className="block text-[11px] text-slate-400 font-mono font-normal">
                      {item.participantCode}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-700 font-semibold">
                    {item.schoolName}
                  </td>
                  <td className="py-4 px-4 font-semibold text-[#0057B8]">
                    {item.competitionName}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-black text-slate-900 text-sm bg-slate-100 px-2.5 py-1 rounded-lg">
                      {item.score}%
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-right">
                    <Badge variant="primary" size="sm">
                      {item.award || 'Honorable Mention'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
