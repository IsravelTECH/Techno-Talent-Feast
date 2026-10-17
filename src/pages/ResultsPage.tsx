import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  Award,
  Trophy,
  Building2,
  Medal,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Users
} from 'lucide-react';
import {
  calculateCategorySchoolStandings,
  calculateOverallSchoolStandings,
  getCategoryNumber,
  getStudentTrophy,
  CATEGORY_TRACK_INFO
} from '../utils/trophyCalculator';

export const ResultsPage: React.FC = () => {
  const { participants, competitions, navigate } = useApp();
  
  // View mode: 'STUDENTS' or 'SCHOOLS'
  const [viewMode, setViewMode] = useState<'STUDENTS' | 'SCHOOLS'>('STUDENTS');

  // Select box 1: Competitions & Tracks (for Student & Duo Winners)
  const [selectedComp, setSelectedComp] = useState<string>('ALL');
  
  // Select box 2: Specific Trophies & School Awards (for Schools)
  const [selectedTrophy, setSelectedTrophy] = useState<string>('ALL');

  // Dynamic trophy calculations based on live MongoDB participants
  const evaluatedParticipants = useMemo(() => {
    return participants.filter((p) => p.status === 'SUBMITTED' || (p.finalScore && p.finalScore > 0));
  }, [participants]);

  const categorySchoolStandings = useMemo(() => {
    return calculateCategorySchoolStandings(participants);
  }, [participants]);

  const overallSchoolStandings = useMemo(() => {
    return calculateOverallSchoolStandings(participants);
  }, [participants]);

  const grandChampionSchool = overallSchoolStandings.length > 0 ? overallSchoolStandings[0] : null;

  // Handler for Select Box 1: Competitions & Tracks
  // -> Directly switches to STUDENTS view mode and filters student podium winners
  const handleCompetitionChange = (val: string) => {
    setSelectedComp(val);
    setViewMode('STUDENTS');
  };

  // Handler for Select Box 2: Specific Trophies & School Awards
  // -> Directly switches to SCHOOLS view mode and filters school awards
  const handleTrophyChange = (val: string) => {
    setSelectedTrophy(val);
    setViewMode('SCHOOLS');
  };

  // Filter participants based on category selection
  const filteredResults = useMemo(() => {
    let list = evaluatedParticipants;

    if (selectedComp !== 'ALL') {
      list = list.filter((p) => {
        return p.competitionId === selectedComp || String(getCategoryNumber(p)) === selectedComp.replace('cat-', '');
      });
    }

    // Rank participants within their respective category
    return list.map((p) => {
      const catNum = getCategoryNumber(p);
      const catPeers = evaluatedParticipants
        .filter((peer) => getCategoryNumber(peer) === catNum)
        .sort((a, b) => Number(b.finalScore || 0) - Number(a.finalScore || 0));

      const rank = catPeers.findIndex((peer) => peer.id === p.id) + 1;
      const trophy = getStudentTrophy(catNum, rank);

      return {
        ...p,
        categoryNumber: catNum,
        computedRank: rank > 0 ? rank : (p.rank || 1),
        trophy
      };
    });
  }, [evaluatedParticipants, selectedComp]);

  // Which category tracks to display in Best School section
  const visibleCategories = useMemo(() => {
    if (selectedTrophy === 'OVERALL') return [];
    if (selectedTrophy === 'cat-1') return [1];
    if (selectedTrophy === 'cat-2') return [2];
    if (selectedTrophy === 'cat-3') return [3];
    if (selectedTrophy === 'cat-4') return [4];
    if (selectedTrophy === 'cat-5') return [5];
    if (selectedTrophy === 'cat-6') return [6];
    return [1, 2, 3, 4, 5, 6];
  }, [selectedTrophy]);

  // Show Overall Trophy section if ALL or OVERALL selected
  const showOverallTrophy = selectedTrophy === 'ALL' || selectedTrophy === 'OVERALL';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and Dual Select Toolbar */}
      {/* Header and Dual Select Toolbar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Official Championship Results
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified winners, school awards, and category standings
          </p>
        </div>

        {/* View Mode Toggle & Dual Select Boxes */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          {/* Quick Tab Toggle */}
          <div className="flex items-center bg-[#F7FCFB] p-1 rounded-2xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('STUDENTS')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'STUDENTS'
                  ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Students</span>
            </button>
            <button
              onClick={() => setViewMode('SCHOOLS')}
              className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                viewMode === 'SCHOOLS'
                  ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#03A695]" />
              <span>Schools</span>
            </button>
          </div>

          {/* Select Box 1: Competitions & Tracks (Shows Student & Duo Podium Winners) */}
          <select
            value={selectedComp}
            onChange={(e) => handleCompetitionChange(e.target.value)}
            className={`w-full sm:w-auto max-w-full sm:max-w-[220px] truncate px-3 py-2 bg-[#F7FCFB] border rounded-xl text-xs font-bold transition-all focus:outline-none cursor-pointer ${
              viewMode === 'STUDENTS'
                ? 'border-[#03A695] text-[#03A695] ring-2 ring-teal-500/10'
                : 'border-slate-200 text-slate-700'
            }`}
          >
            <option value="ALL">All Competitions & Tracks</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Select Box 2: Trophies & Best School Awards (Shows Only Schools) */}
          <select
            value={selectedTrophy}
            onChange={(e) => handleTrophyChange(e.target.value)}
            className={`w-full sm:w-auto max-w-full sm:max-w-[220px] truncate px-3 py-2 bg-[#F7FCFB] border rounded-xl text-xs font-bold transition-all focus:outline-none cursor-pointer ${
              viewMode === 'SCHOOLS'
                ? 'border-[#03A695] text-[#0B2545] ring-2 ring-teal-500/10'
                : 'border-slate-200 text-slate-700'
            }`}
          >
            <option value="ALL">All Trophies & Awards</option>
            <option value="cat-1">Tiny Titan of ICT – Best School</option>
            <option value="cat-2">Titan of Code – Best School</option>
            <option value="cat-3">Titan of Creative Tech – Best School</option>
            <option value="cat-4">Titan of AI – Best School</option>
            <option value="cat-5">Titan of Digital Solutions – Best School</option>
            <option value="cat-6">Titan of Innovation – Best School</option>
            <option value="OVERALL">Titans of Technology – Champion Overall</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: SCHOOLS VIEW (SHOWS ONLY THE SCHOOLS: CATEGORY BEST SCHOOL AWARDS & OVERALL TROPHY) */}
      {viewMode === 'SCHOOLS' && (
        <div className="space-y-6">
          {/* DEDICATED SEPARATE SECTION: OVERALL CHAMPION SCHOOL TROPHY */}
          {showOverallTrophy && grandChampionSchool && (
            <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-amber-300 shadow-card p-4 sm:p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-600 fill-current" />
                      Overall Grand Championship Award
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      Quantity: 1 Trophy
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight break-words">
                    Titans of Technology – Champion School Overall Trophy 1
                  </h2>

                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 pt-1">
                    <Building2 className="w-4 h-4 text-[#03A695] shrink-0" />
                    <span>Winner: </span>
                    <span className="text-sm sm:text-base font-black text-[#0B2545] truncate">{grandChampionSchool.schoolName}</span>
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

          {/* CATEGORY BEST SCHOOL AWARDS (Quantity 1 per Category) */}
          {visibleCategories.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#03A695]" />
                    Category Best School Awards (Quantity 1 per Category)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Aggregated from all team final scores from each school within that specific category
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleCategories.map((catNum) => {
                  const track = CATEGORY_TRACK_INFO[catNum];
                  const standings = categorySchoolStandings[catNum] || [];
                  const bestSchool = standings.length > 0 ? standings[0] : null;

                  return (
                    <div
                      key={catNum}
                      className="p-5 rounded-2xl bg-[#F7FCFB] border border-slate-200/80 hover:border-teal-300 hover:shadow-sm transition-all flex flex-col justify-between"
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
                        <p className="text-[11px] text-slate-500 mb-3 truncate">
                          {track.name}
                        </p>

                        <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Leading School
                          </span>
                          <p className="text-xs font-black text-[#0B2545] truncate mt-0.5">
                            {bestSchool ? bestSchool.schoolName : 'Pending Evaluation'}
                          </p>

                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">
                              {bestSchool ? `${bestSchool.participantCount} Teams Evaluated` : '0 Teams'}
                            </span>
                            <span className="font-black text-[#03A695]">
                              {bestSchool ? `${bestSchool.totalScore} Pts` : '--'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-[10px] text-slate-400 font-medium">
                        {bestSchool
                          ? `Average: ${bestSchool.averageScore} / 100 • Top: ${bestSchool.topScore}`
                          : 'Awaiting verified scores'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: STUDENTS VIEW (SHOWS ONLY THE CATEGORY STUDENT & DUO PODIUM WINNERS) */}
      {viewMode === 'STUDENTS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Category Student & Duo Podium Winners (Qty 2 per Award)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Champion (First Prize 2), 1st Runner-Up (Second Prize 2), and 2nd Runner-Up (Third Prize 2)
              </p>
            </div>

            <span className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 w-fit">
              Showing {filteredResults.length} Evaluated Teams
            </span>
          </div>

          {/* Winners Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((p) => {
              const isRank1 = p.computedRank === 1;
              const isRank2 = p.computedRank === 2;
              const trophyTitle = p.trophy?.title || (isRank1 ? 'Category Champion' : isRank2 ? '1st Runner-Up' : '2nd Runner-Up');
              const prizeType = p.trophy?.prizeType || (isRank1 ? 'First Prize' : isRank2 ? 'Second Prize' : 'Third Prize');

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all p-6 flex flex-col justify-between"
                >
                  <div>
                    {/* Official Trophy Badge */}
                    <div className="mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isRank1
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : isRank2
                            ? 'bg-slate-100 text-slate-800 border-slate-300'
                            : 'bg-orange-50 text-orange-900 border-orange-300'
                        }`}
                      >
                        🏆 {trophyTitle}
                      </span>
                      <span className="ml-2 text-[10px] font-bold text-slate-500">
                        ({prizeType} 2)
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={p.name} size="lg" variant="color" />
                        <div>
                          <h3 className="text-base font-black text-slate-900 mt-0.5">
                            {p.name}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {p.schoolName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-[#03A695]">
                          {p.finalScore}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-bold">
                          / 100 PTS
                        </span>
                      </div>
                    </div>

                    {/* Competition & Project info */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-[#F7FCFB] border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono font-bold text-[#03A695] bg-[#E6F7F5] px-1.5 py-0.5 rounded border border-teal-200">
                          {p.teamId || p.participantId}
                        </span>
                        <span className="text-slate-500 font-medium">
                          {p.evaluatedByJudgeName ? `Juror: ${p.evaluatedByJudgeName}` : 'Evaluated'}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">{p.competitionName}</p>
                      <p className="text-slate-600 text-[11px] line-clamp-1 italic">
                        "{p.projectTitle}"
                      </p>
                      {p.submissionTimestamp && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          Locked at {p.submissionTimestamp}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Single Clean Action: Full Scorecard */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <Button
                      variant="orange"
                      size="sm"
                      className="w-full text-xs font-bold"
                      onClick={() => navigate('participant-detail', { partId: p.id })}
                    >
                      <span>Full Scorecard</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
