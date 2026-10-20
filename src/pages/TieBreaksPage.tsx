import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Participant } from '../types';
import {
  Scale,
  Send,
  CheckCircle2,
  Clock,
  User,
  School as SchoolIcon,
  Search,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { getNormalizedTeamMembers } from '../utils/studentUtils';

interface TiedGroup {
  key: string;
  categoryNumber: number;
  categoryName: string;
  score: number;
  teams: Participant[];
}

export const TieBreaksPage: React.FC = () => {
  const { participants, judges, sendTieBreakAlert, navigate } = useApp();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamForAlert, setSelectedTeamForAlert] = useState<Participant | null>(null);
  const [selectedJudgeId, setSelectedJudgeId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Group submitted participants by category and score to detect ties
  const tiedGroups = useMemo(() => {
    const map = new Map<string, Participant[]>();

    participants.forEach((p) => {
      const isSubmitted = p.status === 'SUBMITTED' || p.isScoreLocked;
      const score = p.finalScore;
      if (isSubmitted && typeof score === 'number' && score > 0) {
        const catKey = `${p.categoryNumber || 1}_${score}`;
        const existing = map.get(catKey) || [];
        existing.push(p);
        map.set(catKey, existing);
      }
    });

    const groups: TiedGroup[] = [];
    map.forEach((teams, key) => {
      if (teams.length >= 2) {
        const [catStr, scoreStr] = key.split('_');
        const catNum = Number(catStr);
        const score = Number(scoreStr);
        const categoryName = teams[0].categoryName || `Category ${catNum}`;
        groups.push({
          key,
          categoryNumber: catNum,
          categoryName,
          score,
          teams
        });
      }
    });

    return groups.sort((a, b) => b.score - a.score || a.categoryNumber - b.categoryNumber);
  }, [participants]);

  // Overall metrics
  const totalTiedTeams = tiedGroups.reduce((acc, g) => acc + g.teams.length, 0);
  const noticesDispatchedCount = participants.filter((p) => p.tieBreakNotice?.active).length;
  const requestsReceivedCount = participants.filter((p) => p.scoreEditRequest?.status === 'PENDING').length;

  // Filter groups
  const filteredGroups = useMemo(() => {
    return tiedGroups
      .filter((g) => selectedCategoryFilter === 'ALL' || g.categoryNumber === selectedCategoryFilter)
      .map((g) => {
        if (!searchQuery.trim()) return g;
        const q = searchQuery.toLowerCase();
        const matchingTeams = g.teams.filter((t) => {
          const uId = (t.teamId || t.participantId || '').toLowerCase();
          const school = (t.schoolName || '').toLowerCase();
          const members = getNormalizedTeamMembers(t).map((m) => m.name.toLowerCase()).join(' ');
          const judge = (t.evaluatedByJudgeName || t.assignedJudgeName || '').toLowerCase();
          return uId.includes(q) || school.includes(q) || members.includes(q) || judge.includes(q);
        });
        return matchingTeams.length > 0 ? { ...g, teams: matchingTeams } : null;
      })
      .filter((g): g is TiedGroup => g !== null);
  }, [tiedGroups, selectedCategoryFilter, searchQuery]);

  const handleOpenAlertModal = (team: Participant, group: TiedGroup) => {
    setSelectedTeamForAlert(team);
    const initialJudgeId = team.evaluatedByJudgeId || team.assignedJudgeId || 'JDG-01';
    setSelectedJudgeId(initialJudgeId);
    setCustomMessage(
      `Tie detected in ${group.categoryName} at score ${group.score}/100. Two or more teams have identical marks. Please click "Request Mark Edit" on your scoring desk to re-evaluate criteria and break the tie.`
    );
  };

  const handleSendAlert = async () => {
    if (!selectedTeamForAlert) return;
    setIsSending(true);
    try {
      const targetId = selectedTeamForAlert.teamId || selectedTeamForAlert.participantId || selectedTeamForAlert.id;
      const targetJudge = judges.find((j) => (j.judgeId || j.id).toLowerCase() === selectedJudgeId.toLowerCase());
      const judgeId = selectedJudgeId || selectedTeamForAlert.evaluatedByJudgeId || selectedTeamForAlert.assignedJudgeId;
      const judgeName = targetJudge?.name || selectedTeamForAlert.evaluatedByJudgeName || selectedTeamForAlert.assignedJudgeName;
      await sendTieBreakAlert({
        teamId: targetId,
        judgeId,
        judgeName,
        message: customMessage
      });
      setSelectedTeamForAlert(null);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in pb-12">
      {/* 1. Header & Title Banner */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#FD5E01] to-[#0B2545] text-white flex items-center justify-center shrink-0 shadow-md">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                Category Tie-Break Alerts
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                <ShieldAlert className="w-3 h-3" /> Live Event Resolution
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Real-time monitoring of identical finalist marks within each competition category. Administration can
              dispatch recalibration notices to evaluating Jurors to break ties cleanly before final awards.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <button
            onClick={() => navigate('score-requests')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#03A695]" />
            <span>Score Edit Requests ({requestsReceivedCount})</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1 */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block truncate">
              Tied Categories
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {tiedGroups.length}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block truncate">
              Tied Teams
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {totalTiedTeams}
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-50 text-[#03A695] border border-teal-200 flex items-center justify-center shrink-0">
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block truncate">
              Notices Dispatched
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {noticesDispatchedCount}
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block truncate">
              Pending Juror Requests
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {requestsReceivedCount}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Unique ID, student name, school, juror..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03A695]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategoryFilter === 'ALL'
                ? 'bg-[#0B2545] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {[1, 2, 3, 4, 5, 6].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategoryFilter === cat
                  ? 'bg-[#03A695] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cat {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tied Categories List */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="font-black text-base sm:text-lg text-slate-900">
            No Same-Category Ties Detected
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            All submitted teams currently have distinct, unique total marks. If any finalists achieve identical scores in
            the same category, they will automatically appear here for administrative tie-break dispatch.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div
              key={group.key}
              className="bg-white rounded-2xl sm:rounded-3xl border border-amber-300 dark:border-amber-500/40 shadow-sm overflow-hidden"
            >
              {/* Category Group Header */}
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 px-4 sm:px-6 py-3.5 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#008C7E] text-white shadow-xs">
                    Category {group.categoryNumber}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {group.categoryName}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Tied Official Score:</span>
                  <span className="px-3 py-1 rounded-full bg-amber-500 text-white font-mono font-black text-sm shadow-xs">
                    {group.score} / 100
                  </span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    {group.teams.length} Finalists Tied
                  </span>
                </div>
              </div>

              {/* Tied Teams Side-by-Side Cards */}
              <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.teams.map((team) => {
                  const uniqueId = team.teamId || team.participantId || team.id;
                  const members = getNormalizedTeamMembers(team);
                  const hasActiveNotice = team.tieBreakNotice?.active;
                  const isEditPending = team.scoreEditRequest?.status === 'PENDING';
                  const isEditAllowed = team.oneTimeEditAllowed;
                  const judgeName = team.evaluatedByJudgeName || team.assignedJudgeName || 'Official Juror';
                  const judgeId = team.evaluatedByJudgeId || team.assignedJudgeId || 'JDG-01';

                  return (
                    <div
                      key={uniqueId}
                      className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                        hasActiveNotice
                          ? 'bg-amber-500/5 border-amber-400'
                          : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Top ID & Status Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-slate-900 text-white shadow-xs">
                            {uniqueId}
                          </span>
                          {hasActiveNotice && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Notice Sent
                            </span>
                          )}
                          {isEditPending && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2 py-0.5 rounded-full">
                              <ExternalLink className="w-3 h-3 text-blue-600" /> Edit Requested
                            </span>
                          )}
                          {isEditAllowed && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Unlocked
                            </span>
                          )}
                        </div>

                        {/* Student Name(s) Details */}
                        <div className="mb-3 p-3 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
                            <User className="w-3 h-3 text-[#FD5E01]" />
                            {members.length > 1 ? `Students (${members.length})` : 'Student Name'}
                          </span>
                          <div className="space-y-1">
                            {members.map((m, idx) => (
                              <div key={idx} className="flex items-center justify-between gap-1 text-xs">
                                <span className="font-bold text-slate-800 truncate">
                                  {m.name}
                                </span>
                                {m.role && (
                                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                                    {m.role}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* School Name */}
                        <div className="mb-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                            <SchoolIcon className="w-3 h-3 text-[#03A695]" /> School
                          </span>
                          <span className="font-bold text-slate-800 text-xs mt-0.5 block truncate">
                            {team.schoolName}
                          </span>
                        </div>

                        {/* Evaluating Juror */}
                        <div className="mb-3 p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
                          <div className="text-[10px] font-semibold text-slate-400 uppercase">Evaluating Juror</div>
                          <div className="font-bold text-[#008C7E] truncate mt-0.5">{judgeName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{judgeId}</div>
                        </div>

                        {/* 5-Criteria Marks Snapshot */}
                        {team.criterionScores && (
                          <div className="grid grid-cols-5 gap-1.5 mb-4 text-center text-[10px]">
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[9px]">Tech</span>
                              <span className="font-black text-slate-800">{team.criterionScores['crit-tech'] ?? 0}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[9px]">Inn</span>
                              <span className="font-black text-slate-800">{team.criterionScores['crit-innov'] ?? 0}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[9px]">Des</span>
                              <span className="font-black text-slate-800">{team.criterionScores['crit-design'] ?? 0}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[9px]">Demo</span>
                              <span className="font-black text-slate-800">{team.criterionScores['crit-demo'] ?? 0}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block text-[9px]">Doc</span>
                              <span className="font-black text-slate-800">{team.criterionScores['crit-doc'] ?? 0}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Footer */}
                      <div className="pt-3 border-t border-slate-200">
                        {isEditPending ? (
                          <button
                            onClick={() => navigate('score-requests')}
                            className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Review Juror Request</span>
                          </button>
                        ) : isEditAllowed ? (
                          <div className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs text-center">
                            ✓ Unlocked for Juror Recalibration
                          </div>
                        ) : hasActiveNotice ? (
                          <div className="space-y-1.5">
                            <div className="text-[11px] text-amber-800 font-semibold text-center">
                              Awaiting Juror Action ({team.tieBreakNotice?.notifiedAt || 'Today'})
                            </div>
                            <button
                              onClick={() => handleOpenAlertModal(team, group)}
                              className="w-full py-1.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs transition-colors cursor-pointer"
                            >
                              Re-send Notice to Juror
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAlertModal(team, group)}
                            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Tie-Break Alert to Juror</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal to customize & dispatch alert to Juror */}
      {selectedTeamForAlert && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTeamForAlert(null)}
          title="Send Tie-Break Recalibration Alert to Juror"
        >
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">Official Protocol: </span>
                This notice will appear instantly on the Juror scoring portal for{' '}
                <span className="font-bold text-[#008C7E]">
                  {selectedTeamForAlert.evaluatedByJudgeName || selectedTeamForAlert.assignedJudgeName || 'Assigned Juror'}
                </span>
                . The Juror will be prompted to submit a score edit request to resolve the tie.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Finalist Team
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div>
                  <span className="text-slate-500 font-semibold">Unique ID: </span>
                  <span className="font-mono font-black text-slate-900">
                    {selectedTeamForAlert.teamId || selectedTeamForAlert.participantId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Student(s): </span>
                  <span className="font-bold text-slate-900">
                    {getNormalizedTeamMembers(selectedTeamForAlert).map((m) => m.name).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">School: </span>
                  <span className="text-slate-800">{selectedTeamForAlert.schoolName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold">Official Mark: </span>
                  <span className="font-mono font-black text-amber-700">
                    {selectedTeamForAlert.finalScore} / 100 PTS
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Juror (Notice will ONLY appear for this specific Juror)
              </label>
              <select
                value={selectedJudgeId}
                onChange={(e) => setSelectedJudgeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {judges.map((j) => {
                  const jId = j.judgeId || j.id;
                  return (
                    <option key={jId} value={jId}>
                      {jId} — {j.name} {j.specialization ? `(${j.specialization})` : ''}
                    </option>
                  );
                })}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Notice will only be visible when Juror <strong className="font-mono text-amber-700">{selectedJudgeId}</strong> logs in. Other jurors will not see it.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Instructions for Juror
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="State the instructions for the juror..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTeamForAlert(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendAlert}
                disabled={isSending || !customMessage.trim()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
