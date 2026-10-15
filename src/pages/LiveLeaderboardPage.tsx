import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
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
  ChevronRight,
  Flame,
  Award,
  Layers,
  Users
} from 'lucide-react';
import {
  calculateCategorySchoolStandings,
  calculateOverallSchoolStandings,
  getCategoryNumber,
  getStudentTrophy,
  CATEGORY_TRACK_INFO
} from '../utils/trophyCalculator';

export const LiveLeaderboardPage: React.FC = () => {
  const { leaderboard, competitions, schools, participants, navigate } = useApp();

  const [activeTab, setActiveTab] = useState<'SCHOOLS' | 'PARTICIPANTS'>('SCHOOLS');
  
  // Select box 1: Competitions & Tracks
  const [selectedCompFilter, setSelectedCompFilter] = useState<string>('ALL');

  // Select box 2: Trophies & Best School Awards
  const [selectedTrophyFilter, setSelectedTrophyFilter] = useState<string>('ALL');

  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic calculations based on live participants
  const categorySchoolStandings = useMemo(() => {
    return calculateCategorySchoolStandings(participants);
  }, [participants]);

  const overallSchoolStandings = useMemo(() => {
    return calculateOverallSchoolStandings(participants);
  }, [participants]);

  const grandChampionSchool = overallSchoolStandings.length > 0 ? overallSchoolStandings[0] : null;

  // Handle Competition Select -> Switches to PARTICIPANTS tab and shows student podium winners
  const handleCompetitionChange = (val: string) => {
    setSelectedCompFilter(val);
    setActiveTab('PARTICIPANTS');
  };

  // Handle Trophy Select -> Switches to SCHOOLS tab and shows only schools
  const handleTrophyChange = (val: string) => {
    setSelectedTrophyFilter(val);
    setActiveTab('SCHOOLS');
  };

  // Filtered leaderboard for participants
  const filteredLeaderboard = useMemo(() => {
    return (leaderboard || []).filter((item) => {
      if (!item) return false;
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch =
        !q ||
        (item.participantName || '').toLowerCase().includes(q) ||
        (item.schoolName || '').toLowerCase().includes(q) ||
        (item.participantCode || '').toLowerCase().includes(q);
      const matchesComp =
        selectedCompFilter === 'ALL' || (item.competitionName || '').includes(selectedCompFilter);
      return matchesSearch && matchesComp;
    });
  }, [leaderboard, searchQuery, selectedCompFilter]);

  const top3 = filteredLeaderboard.slice(0, 3);
  const remaining = filteredLeaderboard.slice(3);

  // Filtered schools
  const filteredSchools = useMemo(() => {
    if (!searchQuery) return overallSchoolStandings;
    return overallSchoolStandings.filter((s) =>
      s.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [overallSchoolStandings, searchQuery]);

  // Which category tracks to display in Best School section
  const visibleCategories = useMemo(() => {
    if (selectedTrophyFilter === 'OVERALL') return [];
    if (selectedTrophyFilter === 'cat-1') return [1];
    if (selectedTrophyFilter === 'cat-2') return [2];
    if (selectedTrophyFilter === 'cat-3') return [3];
    if (selectedTrophyFilter === 'cat-4') return [4];
    if (selectedTrophyFilter === 'cat-5') return [5];
    if (selectedTrophyFilter === 'cat-6') return [6];
    return [1, 2, 3, 4, 5, 6];
  }, [selectedTrophyFilter]);

  const showOverallTrophy = selectedTrophyFilter === 'ALL' || selectedTrophyFilter === 'OVERALL';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Mode Switcher */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="live" dot>
              LIVE STANDINGS
            </Badge>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
              Realtime Synchronized
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Championship Live Leaderboard
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Official standings computed from verified evaluator scores & school aggregations
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-[#F7FCFB] p-1.5 rounded-2xl border border-slate-200 self-start md:self-center">
          <button
            onClick={() => setActiveTab('SCHOOLS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'SCHOOLS'
                ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-[#03A695]" />
            <span>School Standings & Trophies</span>
          </button>
          <button
            onClick={() => setActiveTab('PARTICIPANTS')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === 'PARTICIPANTS'
                ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-[#FD5E01]" />
            <span>Participant Standings</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar with Dual Select Boxes */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'SCHOOLS' ? "Search school name..." : "Search participant or school..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695]"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Select Box 1: Competitions & Tracks */}
          <select
            value={selectedCompFilter}
            onChange={(e) => handleCompetitionChange(e.target.value)}
            className="px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-700 w-full sm:w-auto focus:outline-none focus:border-[#03A695]"
          >
            <option value="ALL">All Competitions & Tracks</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.name.split(' ')[0]}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Select Box 2: Trophies & Best School Awards */}
          <select
            value={selectedTrophyFilter}
            onChange={(e) => handleTrophyChange(e.target.value)}
            className="px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-bold text-[#0B2545] w-full sm:w-auto focus:outline-none focus:border-[#03A695]"
          >
            <option value="ALL">All Trophies & Awards</option>
            <option value="cat-1">Tiny Titan of ICT – Best School Best School Award 1</option>
            <option value="cat-2">Titan of Code – Best School Best School Award 1</option>
            <option value="cat-3">Titan of Creative Tech – Best School Best School Award 1</option>
            <option value="cat-4">Titan of AI – Best School Best School Award 1</option>
            <option value="cat-5">Titan of Digital Solutions – Best School Best School Award 1</option>
            <option value="cat-6">Titan of Innovation – Best School Best School Award 1</option>
            <option value="OVERALL">Titans of Technology – Champion School Overall Trophy 1</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: SCHOOL STANDINGS & TROPHIES */}
      {activeTab === 'SCHOOLS' && (
        <div className="space-y-6">
          {/* DEDICATED SEPARATE SECTION: OVERALL CHAMPION SCHOOL TROPHY */}
          {showOverallTrophy && grandChampionSchool && (
            <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-card p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-600 fill-current" />
                      Overall Grand Championship Award
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Quantity: 1 Trophy
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Titans of Technology – Champion School Overall Trophy 1
                  </h2>

                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 pt-1">
                    <Building2 className="w-4 h-4 text-[#03A695]" />
                    <span>Winner: </span>
                    <span className="text-base font-black text-[#0B2545]">{grandChampionSchool.schoolName}</span>
                  </div>
                </div>

                {/* School Stats Pill */}
                <div className="flex items-center gap-4 bg-[#F7FCFB] p-3.5 rounded-2xl border border-slate-200/80 self-start md:self-auto">
                  <div className="text-center px-3 border-r border-slate-200">
                    <span className="text-2xl font-black text-[#03A695]">
                      {grandChampionSchool.totalScore}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                      Total Points
                    </span>
                  </div>
                  <div className="text-center px-3 border-r border-slate-200">
                    <span className="text-2xl font-black text-slate-800">
                      {grandChampionSchool.totalParticipants}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                      Finalists
                    </span>
                  </div>
                  <div className="text-center px-3">
                    <span className="text-2xl font-black text-amber-600">
                      {grandChampionSchool.goldCount}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                      Gold Titles
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY BEST SCHOOL TROPHIES SECTION */}
          {visibleCategories.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#03A695]" />
                  Category Best School Awards (Quantity 1 per Category)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregated from all team final scores from each school within that specific category
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleCategories.map((catNum) => {
                  const track = CATEGORY_TRACK_INFO[catNum];
                  const standings = categorySchoolStandings[catNum] || [];
                  const bestSchool = standings.length > 0 ? standings[0] : null;

                  return (
                    <div
                      key={catNum}
                      className="p-4 rounded-2xl bg-[#F7FCFB] border border-slate-200/80 hover:border-teal-300 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-full bg-teal-100 text-[#03A695] text-[10px] font-black uppercase">
                            Category {catNum}
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            🏆 Best School Award 1
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-slate-900 line-clamp-1">
                          {track.titlePrefix} – Best School Best School Award 1
                        </h3>
                        <p className="text-[11px] text-slate-500 mb-2 truncate">
                          {track.name}
                        </p>

                        <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Leading Institution
                          </span>
                          <p className="text-xs font-black text-[#0B2545] truncate mt-0.5">
                            {bestSchool ? bestSchool.schoolName : 'Pending Evaluation'}
                          </p>

                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">
                              {bestSchool ? `${bestSchool.participantCount} Teams` : '0 Teams'}
                            </span>
                            <span className="font-black text-[#03A695]">
                              {bestSchool ? `${bestSchool.totalScore} Pts` : '--'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-400 font-medium">
                        {bestSchool
                          ? `Track Average: ${bestSchool.averageScore} / 100`
                          : 'Awaiting scores'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* OVERALL SCHOOL LEADERBOARD TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Official School Aggregate Standings
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Cumulative Performance across all categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 font-bold uppercase">
                    <th className="py-3.5 pl-6">Rank</th>
                    <th className="py-3.5 px-4">School Name</th>
                    <th className="py-3.5 px-4 text-center">Tracks</th>
                    <th className="py-3.5 px-4 text-center">Finalists</th>
                    <th className="py-3.5 px-4 text-center">Medals (G / S / B)</th>
                    <th className="py-3.5 px-4 text-center">Average Score</th>
                    <th className="py-3.5 px-4 text-center">Total Points</th>
                    <th className="py-3.5 pr-6 text-right">Trophy Designation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredSchools.map((school, index) => {
                    const isChampion = index === 0;

                    return (
                      <tr
                        key={school.schoolName}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isChampion ? 'bg-amber-50/40 font-bold' : ''
                        }`}
                      >
                        <td className="py-4 pl-6">
                          <span
                            className={`w-7 h-7 rounded-lg font-black flex items-center justify-center text-xs ${
                              index === 0
                                ? 'bg-amber-400 text-amber-950 shadow-xs'
                                : index === 1
                                ? 'bg-slate-200 text-slate-800'
                                : index === 2
                                ? 'bg-orange-100 text-orange-900'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            #{index + 1}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {school.schoolName}
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-slate-600">
                          {school.categoriesParticipated} / 6
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-slate-600">
                          {school.totalParticipants}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-amber-600">🥇 {school.goldCount}</span>{' '}
                          <span className="font-bold text-slate-500">🥈 {school.silverCount}</span>{' '}
                          <span className="font-bold text-orange-600">🥉 {school.bronzeCount}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-slate-700">
                            {school.averageScore} / 100
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-black text-slate-900 text-sm bg-slate-100 px-2.5 py-1 rounded-lg">
                            {school.totalScore} PTS
                          </span>
                        </td>
                        <td className="py-4 pr-6 text-right">
                          {isChampion ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 text-[10px] font-black uppercase">
                              🏆 Overall Champion Trophy 1
                            </span>
                          ) : school.trophiesWon.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold">
                              🏆 {school.trophiesWon[0]}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Contender</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PARTICIPANTS STANDINGS */}
      {activeTab === 'PARTICIPANTS' && (
        <div className="space-y-6">
          {/* TOP 3 PODIUM PRESENTATION */}
          {top3.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              {/* Rank 2 (Silver) */}
              <div
                onClick={() => navigate('participant-detail', { partId: top3[1].participantId })}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 text-center hover:shadow-card-hover hover:border-slate-400 transition-all cursor-pointer md:order-1"
              >
                <div className="relative inline-block mb-3">
                  <UserAvatar
                    name={top3[1].participantName}
                    size="xl"
                    className="w-20 h-20 text-2xl mx-auto rounded-2xl border-4 border-slate-200 shadow-md"
                  />
                  <span className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center shadow-sm">
                    🥈
                  </span>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
                  1st Runner-Up • Second Prize 2
                </span>
                <h3 className="text-base font-black text-slate-900 mt-2">
                  {top3[1].participantName}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {top3[1].schoolName}
                </p>

                <div className="mt-4 p-3 rounded-2xl bg-[#F7FCFB] border border-slate-100">
                  <span className="text-2xl font-black text-slate-800">
                    {top3[1].score}%
                  </span>
                  <span className="text-[11px] text-[#03A695] block font-bold mt-0.5">
                    {top3[1].competitionName}
                  </span>
                </div>
              </div>

              {/* Rank 1 (Gold - Hero Center) */}
              <div
                onClick={() => navigate('participant-detail', { partId: top3[0].participantId })}
                className="bg-white rounded-3xl border-2 border-amber-400 shadow-card p-8 text-center hover:shadow-card-hover transition-all cursor-pointer md:order-2 md:-translate-y-2 relative"
              >
                <div className="relative inline-block mb-3">
                  <UserAvatar
                    name={top3[0].participantName}
                    size="xl"
                    className="w-24 h-24 text-3xl mx-auto rounded-2xl border-4 border-amber-400 shadow-xl ring-4 ring-amber-400/20"
                  />
                  <span className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-amber-400 text-amber-950 font-black text-base flex items-center justify-center shadow-lg">
                    🥇
                  </span>
                </div>

                <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black uppercase tracking-wider">
                  CHAMPION • FIRST PRIZE 2
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-2">
                  {top3[0].participantName}
                </h2>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {top3[0].schoolName}
                </p>

                <div className="mt-4 p-3.5 rounded-2xl bg-[#F7FCFB] border border-slate-100">
                  <span className="text-3xl font-black text-[#03A695]">
                    {top3[0].score}%
                  </span>
                  <span className="text-xs text-slate-700 block font-bold mt-0.5">
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
                  <UserAvatar
                    name={top3[2].participantName}
                    size="xl"
                    className="w-20 h-20 text-2xl mx-auto rounded-2xl border-4 border-orange-200 shadow-md"
                  />
                  <span className="absolute -top-2.5 -right-2.5 w-8 h-8 rounded-xl bg-orange-100 text-orange-900 font-black text-sm flex items-center justify-center shadow-sm">
                    🥉
                  </span>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[10px] font-extrabold uppercase tracking-wider">
                  2nd Runner-Up • Third Prize 2
                </span>
                <h3 className="text-base font-black text-slate-900 mt-2">
                  {top3[2].participantName}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                  {top3[2].schoolName}
                </p>

                <div className="mt-4 p-3 rounded-2xl bg-[#F7FCFB] border border-slate-100">
                  <span className="text-2xl font-black text-slate-800">
                    {top3[2].score}%
                  </span>
                  <span className="text-[11px] text-[#03A695] block font-bold mt-0.5">
                    {top3[2].competitionName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Table for remaining ranks */}
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
                      <td className="py-4 px-4 font-bold text-slate-900 group-hover:text-[#03A695]">
                        {item.participantName}
                        <span className="block text-[11px] text-slate-400 font-mono font-normal">
                          {item.participantCode}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-semibold">
                        {item.schoolName}
                      </td>
                      <td className="py-4 px-4 font-semibold text-[#03A695]">
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
      )}
    </div>
  );
};
