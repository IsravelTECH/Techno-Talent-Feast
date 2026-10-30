import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Building2,
  Trophy,
  Users,
  Search,
  MapPin,
  Medal,
  ChevronRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  Award,
  Filter,
  Sparkles,
  ArrowRight,
  Crown,
  RotateCcw,
  GraduationCap,
  Layers,
  Plus,
  LayoutGrid,
  List
} from 'lucide-react';
import { Participant } from '../types';
import {
  calculateCategorySchoolStandings,
  calculateOverallSchoolStandings
} from '../utils/trophyCalculator';
import { getNormalizedTeamMembers } from '../utils/studentUtils';

export const SchoolsPage: React.FC = () => {
  const { schools, participants, competitions, navigate, createSchool, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrophy, setSelectedTrophy] = useState<string>('ALL');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // In-modal filter states
  const [modalSearch, setModalSearch] = useState('');
  const [modalCategoryFilter, setModalCategoryFilter] = useState<number | 'ALL'>('ALL');

  // Add School Modal state
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('Dubai');
  const [newSchoolPrincipal, setNewSchoolPrincipal] = useState('');
  const [newSchoolCoordinator, setNewSchoolCoordinator] = useState('');
  const [newSchoolEmail, setNewSchoolEmail] = useState('');
  const [newSchoolPhone, setNewSchoolPhone] = useState('');
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);

  const handleAddSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) {
      addToast('Please enter school name.', 'error');
      return;
    }
    setIsCreatingSchool(true);
    const res = await createSchool({
      name: newSchoolName.trim(),
      city: newSchoolCity.trim() || 'Dubai',
      country: 'UAE',
      principalName: newSchoolPrincipal.trim(),
      coordinatorName: newSchoolCoordinator.trim(),
      email: newSchoolEmail.trim(),
      contactNumber: newSchoolPhone.trim()
    });
    setIsCreatingSchool(false);
    if (res.success) {
      setIsAddSchoolOpen(false);
      setNewSchoolName('');
      setNewSchoolPrincipal('');
      setNewSchoolCoordinator('');
      setNewSchoolEmail('');
      setNewSchoolPhone('');
    }
  };

  // Dynamic trophy calculations based on live participant data
  const overallSchoolStandings = useMemo(() => {
    return calculateOverallSchoolStandings(participants);
  }, [participants]);

  const categorySchoolStandings = useMemo(() => {
    return calculateCategorySchoolStandings(participants);
  }, [participants]);

  // Helper to accurately count students in a team (Team Lead + Team Members)
  const getTeamStudentsCount = (p: Participant): number => {
    if (p.teamSize && p.teamSize > 0) return p.teamSize;
    const membersCount = p.teamMembers?.length || 0;
    return membersCount > 0 ? membersCount + 1 : 1;
  };

  // Dynamically enrich every school with live participant data, student grades, averages, and ranks
  const dynamicSchools = useMemo(() => {
    const enriched = schools.map((school) => {
      // Find all teams belonging to this school
      const schoolTeams = participants.filter(
        (p) =>
          p.schoolId === school.id ||
          (p.schoolName && school.name && p.schoolName.trim().toLowerCase() === school.name.trim().toLowerCase())
      );

      // Accurate students headcount: sum of all students across all teams
      const totalStudents = schoolTeams.reduce((sum, t) => sum + getTeamStudentsCount(t), 0);
      const totalTeams = schoolTeams.length;

      // Extract unique participating grades
      const participatingGrades = Array.from(
        new Set(schoolTeams.map((t) => t.grade).filter(Boolean))
      ).sort((a, b) => (Number(a) || 0) - (Number(b) || 0)) as number[];

      // Detailed student headcount breakdown by grade
      const gradeDistribution = participatingGrades.map((g) => {
        const gradeTeams = schoolTeams.filter((t) => t.grade === g);
        const studentCount = gradeTeams.reduce((sum, t) => sum + getTeamStudentsCount(t), 0);
        return {
          grade: g,
          studentCount: studentCount > 0 ? studentCount : gradeTeams.length,
          teamCount: gradeTeams.length
        };
      });

      // Evaluated teams
      const evaluatedTeams = schoolTeams.filter(
        (p) => (p.finalScore && p.finalScore > 0) || p.status === 'SUBMITTED' || p.status === 'EVALUATED' || p.status === 'COMPLETED'
      );
      const completedEvaluations = evaluatedTeams.length;
      const pendingEvaluations = Math.max(0, totalTeams - completedEvaluations);
      const evaluationProgress = totalTeams > 0 ? Math.round((completedEvaluations / totalTeams) * 100) : 0;

      // Dynamic average score from evaluated teams
      const dynamicAvg = evaluatedTeams.length > 0
        ? Math.round(evaluatedTeams.reduce((sum, t) => sum + (t.finalScore || 0), 0) / evaluatedTeams.length)
        : (school.averageScore || 0);

      // Distinct championship categories
      const distinctCategories = Array.from(
        new Set(schoolTeams.map((t) => t.categoryNumber || t.competitionId).filter(Boolean))
      ).length || school.totalCompetitions || 0;

      // Dynamic medal counts
      const goldMedals = evaluatedTeams.filter((t) => (t.finalScore || 0) >= 95).length;
      const silverMedals = evaluatedTeams.filter((t) => (t.finalScore || 0) >= 90 && (t.finalScore || 0) < 95).length;
      const bronzeMedals = evaluatedTeams.filter((t) => (t.finalScore || 0) >= 85 && (t.finalScore || 0) < 90).length;

      // Match trophies won
      const standing = overallSchoolStandings.find(
        (s) => s.schoolName.trim().toLowerCase() === school.name.trim().toLowerCase()
      );
      const trophiesWon = standing?.trophiesWon || [];

      return {
        ...school,
        teams: schoolTeams,
        totalStudents,
        totalTeams,
        participatingGrades,
        gradeDistribution,
        completedEvaluations,
        pendingEvaluations,
        evaluationProgress,
        averageScore: dynamicAvg,
        distinctCategories,
        goldMedals: goldMedals || school.goldMedals || 0,
        silverMedals: silverMedals || school.silverMedals || 0,
        bronzeMedals: bronzeMedals || school.bronzeMedals || 0,
        trophiesWon
      };
    });

    // Sort by averageScore descending, then by gold medals
    enriched.sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore;
      }
      return b.goldMedals - a.goldMedals;
    });

    // Assign dynamic computed ranks
    return enriched.map((s, idx) => ({
      ...s,
      computedRank: idx + 1
    }));
  }, [schools, participants, overallSchoolStandings]);

  // Filtered schools for search query and selected trophy
  const filteredSchools = useMemo(() => {
    return dynamicSchools.filter((s) => {
      // 1. Search query filter (name, city, code, or grade)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.participatingGrades.some((g) => `grade ${g}`.includes(q) || `gr ${g}`.includes(q) || String(g) === q);

      // 2. Trophy select box / chip filter
      let matchesTrophy = true;
      if (selectedTrophy !== 'ALL') {
        if (selectedTrophy === 'OVERALL') {
          matchesTrophy =
            s.trophiesWon.some((t) => t.includes('Titans of Technology') || t.includes('Champion School Overall')) ||
            s.computedRank === 1;
        } else if (selectedTrophy === 'AWARDS') {
          matchesTrophy = s.trophiesWon.length > 0;
        } else if (selectedTrophy.startsWith('cat-')) {
          const catNum = parseInt(selectedTrophy.replace('cat-', ''), 10);
          const catKeywords: Record<number, string> = {
            1: 'Tiny Titan of ICT',
            2: 'Titan of Code',
            3: 'Titan of Creative Tech',
            4: 'Titan of AI',
            5: 'Titan of Digital Solutions',
            6: 'Titan of Innovation'
          };
          const keyword = catKeywords[catNum];
          const wonTrophy = s.trophiesWon.some((t) => keyword && t.includes(keyword));
          const catLeader = categorySchoolStandings[catNum]?.[0]?.schoolName;
          const isCatLeader = catLeader && s.name.trim().toLowerCase() === catLeader.trim().toLowerCase();
          matchesTrophy = wonTrophy || !!isCatLeader;
        }
      }

      return matchesSearch && matchesTrophy;
    });
  }, [dynamicSchools, searchQuery, selectedTrophy, categorySchoolStandings]);

  // Grand Champion Leader (Rank #1)
  const championSchool = useMemo(() => {
    return dynamicSchools.find((s) => s.computedRank === 1) || dynamicSchools[0] || null;
  }, [dynamicSchools]);

  // Check if we should render Champion Spotlight view (Default view without search)
  const showSpotlight = !searchQuery && selectedTrophy === 'ALL' && championSchool;
  const secondarySchools = showSpotlight
    ? filteredSchools.filter((s) => s.id !== championSchool.id)
    : filteredSchools;

  // Selected school for detail modal
  const selectedSchool = dynamicSchools.find((s) => s.id === selectedSchoolId) || null;

  // Selected school's teams filtered by in-modal search and category filter
  const modalFilteredTeams = useMemo(() => {
    if (!selectedSchool) return [];
    return selectedSchool.teams.filter((team) => {
      const matchesCategory =
        modalCategoryFilter === 'ALL' || team.categoryNumber === modalCategoryFilter;
      const q = modalSearch.toLowerCase().trim();
      const members = getNormalizedTeamMembers(team);
      const matchesSearch =
        !q ||
        team.name.toLowerCase().includes(q) ||
        (team.teamName && team.teamName.toLowerCase().includes(q)) ||
        (team.teamId && team.teamId.toLowerCase().includes(q)) ||
        (team.participantId && team.participantId.toLowerCase().includes(q)) ||
        (team.projectTitle && team.projectTitle.toLowerCase().includes(q)) ||
        (team.grade && `grade ${team.grade}`.includes(q)) ||
        members.some((m) => m.name.toLowerCase().includes(q) || (m.grade && `grade ${m.grade}`.includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [selectedSchool, modalSearch, modalCategoryFilter]);

  // Quick filter chips
  const quickFilterChips = [
    { id: 'ALL', label: 'All Schools', count: dynamicSchools.length },
    { id: 'OVERALL', label: '🏆 Grand Champion', count: 1 },
    {
      id: 'AWARDS',
      label: 'Award Winners',
      count: dynamicSchools.filter((s) => s.trophiesWon && s.trophiesWon.length > 0).length
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* SECTION 1: HEADER & UNIFIED CONTROL BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-10 h-10 rounded-2xl bg-[#03A695]/10 text-[#03A695] border border-teal-200 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                School Management
              </h1>
              <span className="px-3 py-1 rounded-full bg-[#E6F7F5] text-[#03A695] text-xs font-black border border-teal-200 shadow-xs">
                {dynamicSchools.length} Enrolled Schools
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Official participating educational institutions, student delegations, and grade-level representations.
            </p>
          </div>

          {/* Right Toolbar: Trophies Dropdown & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* All Trophies & Awards Dropdown */}
            <div className="relative w-full sm:w-60">
              <select
                value={selectedTrophy}
                onChange={(e) => setSelectedTrophy(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#03A695] shadow-xs cursor-pointer truncate"
                title="Filter by Trophy or Award"
              >
                <option value="ALL">All Trophies & Awards</option>
                <option value="OVERALL">🏆 Titans of Technology (Grand Champion)</option>
                <option value="AWARDS">All Category Award Winners</option>
                <option value="cat-1">Cat 1: Tiny Titan of ICT – Best School</option>
                <option value="cat-2">Cat 2: Titan of Code – Best School</option>
                <option value="cat-3">Cat 3: Titan of Creative Tech – Best School</option>
                <option value="cat-4">Cat 4: Titan of AI – Best School</option>
                <option value="cat-5">Cat 5: Titan of Digital Solutions – Best School</option>
                <option value="cat-6">Cat 6: Titan of Innovation – Best School</option>
              </select>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search school name, city, grade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#03A695] shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsAddSchoolOpen(true)}
              className="shrink-0 text-xs shadow-xs"
            >
              + Add School
            </Button>

            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-[#F7FCFB] p-1 rounded-2xl border border-slate-200 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  viewLayout === 'grid'
                    ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  viewLayout === 'list'
                    ? 'bg-white text-[#0B2545] shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Chips & Active Filter Indicator */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Quick:
            </span>
            {quickFilterChips.map((chip) => {
              const isActive = selectedTrophy === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedTrophy(chip.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#03A695] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60'
                  }`}
                >
                  <span>{chip.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>

          {(selectedTrophy !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedTrophy('ALL');
                setSearchQuery('');
              }}
              className="self-start sm:self-auto text-xs font-bold text-[#FD5E01] hover:text-[#e05300] flex items-center gap-1.5 cursor-pointer py-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* SECTION 2: TOURNAMENT GRAND CHAMPION SPOTLIGHT (Rank #1 Hero Card - NO LOGO, NO PRINCIPAL) */}
      {showSpotlight && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-teal-500/10 border-2 border-amber-300/80 shadow-lg p-5 sm:p-7">
          {/* Subtle Background Glow Accent */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left Column: School Name, Grades & Standings (Logo & Principal removed) */}
            <div className="space-y-3 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-current" />
                  Tournament Rank #1 • Grand Champion School
                </span>
                <span className="font-mono text-xs font-bold text-slate-600 bg-white/80 px-2.5 py-0.5 rounded-md border border-amber-200">
                  {championSchool.code}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {championSchool.name}
                </h2>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FD5E01] shrink-0" />
                  <span className="font-medium">{championSchool.city}, {championSchool.state || 'UAE'}</span>
                </p>
              </div>

              {/* Student Grades Representation Strip */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#03A695]" />
                  Enrolled Students by Grade:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {championSchool.gradeDistribution && championSchool.gradeDistribution.length > 0 ? (
                    championSchool.gradeDistribution.map((item: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white border border-teal-200 text-slate-800 text-xs font-bold shadow-xs flex items-center gap-1.5"
                      >
                        <span className="px-1.5 py-0.2 rounded bg-teal-50 text-[#03A695] font-black text-[10px]">
                          Grade {item.grade}
                        </span>
                        <span className="font-extrabold text-slate-900">{item.studentCount} Students</span>
                      </span>
                    ))
                  ) : (
                    championSchool.participatingGrades.map((g: number, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-white border border-teal-200 text-[#03A695] text-xs font-bold shadow-xs"
                      >
                        Grade {g}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Trophies Awarded Showcase */}
              {championSchool.trophiesWon && championSchool.trophiesWon.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {championSchool.trophiesWon.map((trophy: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-100 to-amber-200/90 text-amber-950 font-black text-xs border border-amber-300 shadow-xs flex items-center gap-1.5"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-700 fill-current" />
                      <span>{trophy}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Key Delegation Metrics Strip & Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4 shrink-0">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-white/90 backdrop-blur-sm p-3.5 rounded-2xl border border-amber-200 shadow-xs text-center">
                <div className="px-2">
                  <span className="text-base sm:text-xl font-black text-slate-900 block">
                    {championSchool.totalStudents}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Total Students
                  </span>
                </div>
                <div className="px-2 border-x border-slate-100">
                  <span className="text-base sm:text-xl font-black text-slate-700 block">
                    {championSchool.totalTeams}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Teams
                  </span>
                </div>
                <div className="px-2">
                  <span className="text-base sm:text-xl font-black text-[#03A695] block">
                    {championSchool.averageScore}%
                  </span>
                  <span className="text-[10px] font-extrabold text-[#03A695] uppercase tracking-wider">
                    Avg Score
                  </span>
                </div>
              </div>

              {/* View Roster Button */}
              <button
                onClick={() => {
                  setSelectedSchoolId(championSchool.id);
                  setModalSearch('');
                  setModalCategoryFilter('ALL');
                }}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-[#03A695] text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Inspect Student Roster</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: INSTITUTIONAL SCHOOLS GRID (NO LOGO, NO PRINCIPAL, ONLY STUDENTS & GRADES) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              {showSpotlight
                ? `Participating Schools (${secondarySchools.length})`
                : `Participating Institutions (${filteredSchools.length})`}
            </h2>
            {selectedTrophy !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold border border-amber-300">
                Filtered by Trophy
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Click any school card to inspect student grades & roster
          </span>
        </div>

        {filteredSchools.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No schools match the selected criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or award filter to see participating educational institutions.
            </p>
            <button
              onClick={() => {
                setSelectedTrophy('ALL');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#03A695] text-white text-xs font-bold shadow-xs hover:bg-[#028b7d] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewLayout === 'list' ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-[#F7FCFB] text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4 w-14 text-center">Rank</th>
                    <th className="py-3 px-4">School & Location</th>
                    <th className="py-3 px-4 text-center">Students</th>
                    <th className="py-3 px-4 text-center">Teams</th>
                    <th className="py-3 px-4 text-center">Avg Score</th>
                    <th className="py-3 px-4">Awards & Medals</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {secondarySchools.map((school) => {
                    const rank = school.computedRank;
                    return (
                      <tr
                        key={school.id}
                        onClick={() => {
                          setSelectedSchoolId(school.id);
                          setModalSearch('');
                          setModalCategoryFilter('ALL');
                        }}
                        className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                            rank === 1
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : rank === 2
                              ? 'bg-slate-200 text-slate-800 border border-slate-300'
                              : rank === 3
                              ? 'bg-orange-100 text-orange-900 border border-orange-300'
                              : 'bg-slate-100 text-slate-600 font-bold'
                          }`}>
                            #{rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-slate-900 group-hover:text-[#03A695] transition-colors">
                              {school.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-100 px-1 rounded border border-slate-200">
                                {school.code}
                              </span>
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-2.5 h-2.5 text-[#FD5E01]" />
                                {school.city}, {school.state || 'UAE'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {school.totalStudents}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-700">
                          {school.totalTeams}
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-[#03A695]">
                          {school.averageScore}%
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            {school.trophiesWon && school.trophiesWon.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[10px]">
                                <Trophy className="w-3 h-3 text-amber-600 fill-current" />
                                {school.trophiesWon[0]}
                                {school.trophiesWon.length > 1 && ` +${school.trophiesWon.length - 1}`}
                              </span>
                            )}
                            <div className="flex items-center gap-1 text-[10px] font-bold">
                              {school.goldMedals > 0 && (
                                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                  🥇 {school.goldMedals}
                                </span>
                              )}
                              {school.silverMedals > 0 && (
                                <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  🥈 {school.silverMedals}
                                </span>
                              )}
                              {school.bronzeMedals > 0 && (
                                <span className="text-orange-800 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                                  🥉 {school.bronzeMedals}
                                </span>
                              )}
                              {school.goldMedals === 0 && school.silverMedals === 0 && school.bronzeMedals === 0 && (
                                <span className="text-slate-400 font-normal text-[11px]">—</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-teal-50 text-[#03A695] group-hover:bg-[#03A695] group-hover:text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <span>Roster</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {secondarySchools.map((school) => {
              const rank = school.computedRank;
              return (
                <div
                  key={school.id}
                  onClick={() => {
                    setSelectedSchoolId(school.id);
                    setModalSearch('');
                    setModalCategoryFilter('ALL');
                  }}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all p-5 flex flex-col justify-between group cursor-pointer h-full"
                >
                  <div className="space-y-4">
                    {/* Top School Header (Clean Typographic Identity, Logo removed) */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                            {school.code}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-[#FD5E01] shrink-0" />
                            <span className="truncate">{school.city}, {school.state || 'UAE'}</span>
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-[#03A695] transition-colors mt-1 truncate">
                          {school.name}
                        </h3>
                      </div>

                      {/* Rank Badge */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs border ${
                          rank === 1
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : rank === 2
                            ? 'bg-slate-200 text-slate-800 border-slate-300'
                            : rank === 3
                            ? 'bg-orange-100 text-orange-900 border-orange-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                      </div>
                    </div>

                    {/* FOCUS: STUDENT GRADES REPRESENTATION (Replaces Principal & Teacher gray box) */}
                    <div className="p-3.5 rounded-2xl bg-[#F7FCFB] border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        <span className="flex items-center gap-1 text-[#03A695]">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Student Grades in School
                        </span>
                        <span className="font-bold text-slate-400">
                          {school.participatingGrades.length} {school.participatingGrades.length === 1 ? 'Grade' : 'Grades'}
                        </span>
                      </div>

                      {/* Grade Pills Breakdown */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {school.gradeDistribution && school.gradeDistribution.length > 0 ? (
                          school.gradeDistribution.map((item: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 text-slate-800 text-[11px] font-bold shadow-2xs flex items-center gap-1.5"
                            >
                              <span className="font-black text-[#03A695]">Gr {item.grade}</span>
                              <span className="text-slate-400 font-normal">•</span>
                              <span className="text-slate-700">{item.studentCount} {item.studentCount === 1 ? 'Student' : 'Students'}</span>
                            </span>
                          ))
                        ) : (
                          school.participatingGrades.map((g: number, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px]"
                            >
                              Grade {g}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Consolidated 3-Column Delegation Strip */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs">
                      <div>
                        <span className="block font-black text-slate-900 text-sm">
                          {school.totalStudents}
                        </span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5">
                          Total Students
                        </span>
                      </div>
                      <div className="border-x border-slate-200/60">
                        <span className="block font-black text-slate-700 text-sm">
                          {school.totalTeams}
                        </span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5">
                          Teams
                        </span>
                      </div>
                      <div>
                        <span className="block font-black text-[#03A695] text-sm">
                          {school.averageScore}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5">
                          Avg Score
                        </span>
                      </div>
                    </div>

                    {/* Trophies & Awards (if won) */}
                    {school.trophiesWon && school.trophiesWon.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {school.trophiesWon.map((trophy: string, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-950 font-bold text-[11px]"
                          >
                            <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0 fill-current" />
                            <span className="truncate">{trophy}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Medals Row */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="text-slate-400 text-[11px] font-semibold">Medals Earned</span>
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                          🥇 {school.goldMedals}
                        </span>
                        <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                          🥈 {school.silverMedals}
                        </span>
                        <span className="text-amber-800 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-[11px]">
                          🥉 {school.bronzeMedals}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#03A695] group-hover:text-slate-900 transition-colors">
                    <span>Inspect Student Roster ({school.totalStudents} Students)</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: ENHANCED STUDENT-FOCUSED DELEGATION MODAL */}
      {selectedSchool && (
        <Modal
          isOpen={!!selectedSchool}
          onClose={() => setSelectedSchoolId(null)}
          title={selectedSchool.name}
          subtitle={`School Code: ${selectedSchool.code} • ${selectedSchool.city}, ${selectedSchool.state || 'UAE'} • Enrolled Student Grades Roster`}
          maxWidth="5xl"
        >
          <div className="space-y-6 text-xs animate-fade-in">
            {/* Trophies & Awards Banner in Modal */}
            {selectedSchool.trophiesWon && selectedSchool.trophiesWon.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-300 shadow-xs flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Trophy className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                      Official Tournament Awards Won
                    </span>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      {selectedSchool.trophiesWon.map((t: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-black text-xs border border-amber-300 flex items-center gap-1.5"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-600 fill-current" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5 Dynamic KPI Metric Cards (Responsive 2 / 3 / 5 Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200/80 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#03A695] block">
                  Total Students
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
                  {selectedSchool.totalStudents}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Headcount in arena</span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                  Total Teams
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
                  {selectedSchool.totalTeams}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Project entries</span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block">
                  Grades Enrolled
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
                  {selectedSchool.participatingGrades.length} Grades
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Gr {selectedSchool.participatingGrades.join(', ')}</span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                  Scoring Progress
                </span>
                <span className="text-lg sm:text-xl font-black text-slate-900 block mt-0.5">
                  {selectedSchool.completedEvaluations}/{selectedSchool.totalTeams}
                </span>
                <span className="text-[10px] font-bold text-amber-700">
                  {selectedSchool.evaluationProgress}% Scored
                </span>
              </div>

              <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                  School Average
                </span>
                <span className="text-lg sm:text-xl font-black text-[#03A695] block mt-0.5">
                  {selectedSchool.averageScore}%
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">
                  Rank #{selectedSchool.computedRank}
                </span>
              </div>
            </div>

            {/* DEDICATED STUDENT GRADES DISTRIBUTION STRIP (Replaces Principal & Teacher Cards) */}
            <div className="p-4 rounded-2xl bg-[#F7FCFB] border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-[#03A695]" />
                  <span>Student Headcount by Grade Level</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-medium">
                  {selectedSchool.totalStudents} total students enrolled from this institution
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-1">
                {selectedSchool.gradeDistribution && selectedSchool.gradeDistribution.length > 0 ? (
                  selectedSchool.gradeDistribution.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 text-center shadow-2xs"
                    >
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#03A695] font-black text-xs border border-teal-200 inline-block">
                        Grade {item.grade}
                      </span>
                      <span className="text-base font-black text-slate-900 block mt-1.5">
                        {item.studentCount}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        {item.teamCount} {item.teamCount === 1 ? 'Team' : 'Teams'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-slate-400 text-xs py-2">
                    Grades participating: {selectedSchool.participatingGrades.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Student & Team Delegation Section Header */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#03A695]" />
                    <span>Registered Students Roster & Projects</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-[#03A695] text-[10px] font-bold border border-teal-200">
                      {modalFilteredTeams.length} Teams • {modalFilteredTeams.reduce((acc, t) => acc + getTeamStudentsCount(t), 0)} Students
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Verified student names, assigned grades, project titles, and evaluation status
                  </p>
                </div>

                {/* Filter / Search within School */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search student or grade..."
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695] w-full sm:w-48 shadow-xs"
                    />
                  </div>

                  <select
                    value={modalCategoryFilter}
                    onChange={(e) =>
                      setModalCategoryFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
                    }
                    className="py-1.5 px-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#03A695]"
                  >
                    <option value="ALL">All Arenas</option>
                    <option value="1">Cat 1 - AI & Robotics</option>
                    <option value="2">Cat 2 - Web & Cloud</option>
                    <option value="3">Cat 3 - Mobile Apps</option>
                    <option value="4">Cat 4 - Cyber Security</option>
                    <option value="5">Cat 5 - Game Dev</option>
                    <option value="6">Cat 6 - Clean Energy</option>
                  </select>
                </div>
              </div>

              {/* VIEW MODE 1: DESKTOP & TABLET TABLE (hidden on mobile < 640px) */}
              <div className="hidden sm:block rounded-2xl border border-slate-200 overflow-hidden shadow-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4 min-w-[210px]">Team & Project</th>
                        <th className="py-3 px-4 min-w-[170px]">Competition Arena</th>
                        <th className="py-3 px-4 min-w-[220px]">Student(s) Roster</th>
                        <th className="py-3 px-4 text-center min-w-[90px]">Grade</th>
                        <th className="py-3 px-4 text-right min-w-[130px]">Status & Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {modalFilteredTeams.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400">
                            No teams or students match the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        modalFilteredTeams.map((team) => {
                          const members = getNormalizedTeamMembers(team);
                          const isEvaluated =
                            (team.finalScore && team.finalScore > 0) ||
                            team.status === 'SUBMITTED' ||
                            team.status === 'EVALUATED' ||
                            team.status === 'COMPLETED';

                          return (
                            <tr key={team.id || team.teamId} className="hover:bg-slate-50/80 transition-colors">
                              {/* 1. Team & Project */}
                              <td className="py-3.5 px-4 align-top">
                                <span className="font-mono font-black text-xs text-[#03A695] bg-[#E6F7F5] px-2 py-0.5 rounded-md border border-teal-200/80 inline-block">
                                  {team.teamId || team.participantId}
                                </span>
                                <h5 className="font-bold text-slate-900 text-xs mt-1 leading-snug">
                                  {team.projectTitle || team.selectedProjectTitle || 'Championship Project'}
                                </h5>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                  {team.teamName || `${team.name} & Delegation`}
                                </p>
                              </td>

                              {/* 2. Competition Arena */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#03A695] shrink-0" />
                                  <span className="font-black text-xs text-slate-800 shrink-0">
                                    Cat {team.categoryNumber || 1}
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-500 truncate max-w-[130px]">
                                    {team.categoryName || team.competitionName}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 block mt-1">
                                  P{team.categoryNumber || 1}-0{team.projectNumber || 1}
                                </span>
                              </td>

                              {/* 3. Student(s) Roster - ONLY Student Names */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                      <Users className="w-3 h-3 text-slate-400" />
                                      <span>{members.length} {members.length === 1 ? 'Student' : 'Students'}</span>
                                    </span>
                                  </div>
                                  <div className="space-y-1">
                                    {members.map((m, idx) => (
                                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#03A695] shrink-0" />
                                        <span className="font-bold text-slate-800 leading-snug">
                                          {m.name}
                                        </span>
                                        {m.grade && m.grade !== team.grade && (
                                          <span className="text-[9px] font-mono font-medium text-slate-400">
                                            (Gr {m.grade})
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>

                              {/* 4. Grade */}
                              <td className="py-3.5 px-4 align-top text-center">
                                <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#03A695] text-xs font-black border border-teal-200 inline-block">
                                  Grade {team.grade || members[0]?.grade || '11'}
                                </span>
                              </td>

                              {/* 5. Evaluation Status & Score */}
                              <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                                {isEvaluated ? (
                                  <div className="inline-flex flex-col items-end">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                                      <span className="font-mono font-black text-sm text-[#0B2545]">
                                        {team.finalScore ?? team.percentage ?? 0}
                                      </span>
                                      <span className="font-mono text-xs font-semibold text-slate-400">
                                        / 100
                                      </span>
                                      <span className="text-[9px] font-black uppercase tracking-wider text-[#03A695] bg-[#E6F7F5] px-1 py-0.5 rounded border border-teal-200">
                                        PTS
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Evaluated</span>
                                    </span>
                                  </div>
                                ) : (
                                  <div className="inline-flex flex-col items-end">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>Pending</span>
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-1 font-medium">In Queue</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* VIEW MODE 2: MOBILE STACKED CARDS (visible on mobile < 640px) */}
              <div className="block sm:hidden space-y-3">
                {modalFilteredTeams.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 border border-slate-200 rounded-2xl bg-slate-50">
                    No teams or students match the filter criteria.
                  </div>
                ) : (
                  modalFilteredTeams.map((team) => {
                    const members = getNormalizedTeamMembers(team);
                    const isEvaluated =
                      (team.finalScore && team.finalScore > 0) ||
                      team.status === 'SUBMITTED' ||
                      team.status === 'EVALUATED' ||
                      team.status === 'COMPLETED';

                    return (
                      <div
                        key={team.id || team.teamId}
                        className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3"
                      >
                        {/* Header: ID & Score */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-black text-xs text-[#03A695] bg-[#E6F7F5] px-2 py-0.5 rounded-md border border-teal-200/80">
                            {team.teamId || team.participantId}
                          </span>
                          {isEvaluated ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                              <span className="font-mono font-black text-slate-900">{team.finalScore ?? team.percentage ?? 0}</span>
                              <span className="text-[10px] text-slate-400 font-semibold">/ 100</span>
                              <span className="text-[8px] font-black uppercase text-[#03A695] bg-[#E6F7F5] px-1 py-0.2 rounded">PTS</span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                              Pending
                            </span>
                          )}
                        </div>

                        {/* Project Title & Arena */}
                        <div>
                          <h5 className="font-bold text-slate-900 text-xs leading-snug">
                            {team.projectTitle || team.selectedProjectTitle || 'Championship Project'}
                          </h5>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              Cat {team.categoryNumber || 1} • {team.categoryName || team.competitionName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-teal-50 text-[#03A695] text-[10px] font-black border border-teal-200">
                              Grade {team.grade || members[0]?.grade || '11'}
                            </span>
                          </div>
                        </div>

                        {/* Students Roster (Only Student Names) */}
                        <div className="p-3 bg-[#F7FCFB] rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Student Roster ({members.length})
                          </span>
                          <div className="space-y-1">
                            {members.map((m, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#03A695] shrink-0" />
                                <span className="font-bold text-slate-800">
                                  {m.name}
                                </span>
                                {m.grade && m.grade !== team.grade && (
                                  <span className="text-[10px] font-mono text-slate-400">
                                    (Gr {m.grade})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className="text-slate-400 text-[11px]">
                Showing {modalFilteredTeams.reduce((sum, t) => sum + getTeamStudentsCount(t), 0)} of {selectedSchool.totalStudents} students registered across {selectedSchool.totalTeams} project teams.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate('participants');
                    setSelectedSchoolId(null);
                  }}
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  Manage in Participants Arena
                </Button>
                <Button variant="primary" size="sm" onClick={() => setSelectedSchoolId(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add School Modal */}
      <Modal
        isOpen={isAddSchoolOpen}
        onClose={() => setIsAddSchoolOpen(false)}
        title="Enroll Educational Institution"
        subtitle="Register a new school for Techno Talent Fest 2026 Dubai Grand Finale"
      >
        <form onSubmit={handleAddSchoolSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              School Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Dubai College of Arts & Technology"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                City
              </label>
              <input
                type="text"
                placeholder="Dubai"
                value={newSchoolCity}
                onChange={(e) => setNewSchoolCity(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Country
              </label>
              <input
                type="text"
                value="UAE"
                disabled
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Principal Name
              </label>
              <input
                type="text"
                placeholder="Principal full name"
                value={newSchoolPrincipal}
                onChange={(e) => setNewSchoolPrincipal(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Coordinator Name
              </label>
              <input
                type="text"
                placeholder="Competition coordinator"
                value={newSchoolCoordinator}
                onChange={(e) => setNewSchoolCoordinator(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                placeholder="contact@school.edu"
                value={newSchoolEmail}
                onChange={(e) => setNewSchoolEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+971 4 123 4567"
                value={newSchoolPhone}
                onChange={(e) => setNewSchoolPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-[#03A695]"
              />
            </div>
          </div>

          <div className="p-3 bg-teal-50/70 border border-teal-200/60 rounded-xl text-[11px] text-[#007A6E]">
            <p className="font-bold">Automated 12-Finalist Quota Allocation:</p>
            <p className="mt-0.5 text-slate-600">
              New institutions will automatically receive standard 2-finalist quotas across all 6 championship categories (Max 12 Finalists).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddSchoolOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isCreatingSchool}
            >
              {isCreatingSchool ? 'Enrolling...' : 'Enroll School'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
