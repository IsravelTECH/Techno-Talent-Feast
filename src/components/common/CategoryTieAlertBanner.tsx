import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Participant } from '../../types';
import {
  AlertTriangle,
  Scale,
  Send,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  School as SchoolIcon,
  Award,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Modal } from './Modal';
import { getNormalizedTeamMembers } from '../../utils/studentUtils';

interface TiedGroup {
  key: string;
  categoryNumber: number;
  categoryName: string;
  score: number;
  teams: Participant[];
}

export const CategoryTieAlertBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { participants, sendTieBreakAlert, navigate, currentRole } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTeamForAlert, setSelectedTeamForAlert] = useState<Participant | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Group submitted participants by category and score to detect ties
  const tiedGroups = useMemo(() => {
    const map = new Map<string, Participant[]>();

    participants.forEach((p) => {
      // Must be submitted and have a score
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

    // Sort by highest score first, then category
    return groups.sort((a, b) => b.score - a.score || a.categoryNumber - b.categoryNumber);
  }, [participants]);

  if (tiedGroups.length === 0) return null;

  const totalTiedTeams = tiedGroups.reduce((acc, g) => acc + g.teams.length, 0);

  const handleOpenAlertModal = (team: Participant, group: TiedGroup) => {
    setSelectedTeamForAlert(team);
    setCustomMessage(
      `Tie detected in ${group.categoryName} at score ${group.score}/100. Two or more teams have identical marks. Please click "Request Mark Edit" on your scoring desk to re-evaluate and break the tie.`
    );
  };

  const handleSendAlert = async () => {
    if (!selectedTeamForAlert) return;
    setIsSending(true);
    try {
      const targetId = selectedTeamForAlert.teamId || selectedTeamForAlert.participantId || selectedTeamForAlert.id;
      const judgeId = selectedTeamForAlert.evaluatedByJudgeId || selectedTeamForAlert.assignedJudgeId;
      await sendTieBreakAlert({
        teamId: targetId,
        judgeId,
        message: customMessage
      });
      setSelectedTeamForAlert(null);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/40 rounded-2xl shadow-lg backdrop-blur-sm p-4 sm:p-5 mb-6 transition-all duration-300">
        {/* Banner Top Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm animate-pulse">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-white shadow-sm">
                  <ShieldAlert className="w-3.5 h-3.5" /> Same-Category Tie Alert
                </span>
                <span className="text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-md">
                  {tiedGroups.length} Tied Group{tiedGroups.length > 1 ? 's' : ''} ({totalTiedTeams} Teams)
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                Identical Final Marks Detected — Administrative Tie-Break Action Required
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Collapse</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Review Tied Teams ({totalTiedTeams})</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Informational description */}
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-2">
          Two or more finalists in the same category have identical total marks. Administration can dispatch an official
          alert to the assigned Juror(s) prompting them to request a mark recalibration to resolve the tie cleanly.
        </p>

        {/* Expanded Group Details */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {tiedGroups.map((group) => (
              <div
                key={group.key}
                className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-300 dark:border-amber-500/30 p-4 shadow-sm"
              >
                {/* Group Summary Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-500/20 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-500/10 text-[#008C7E] dark:text-[#03A695] border border-teal-500/30">
                      Category {group.categoryNumber}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">
                      {group.categoryName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600 dark:text-slate-400">Tied Official Score:</span>
                    <span className="px-3 py-0.5 rounded-full bg-amber-500 text-white font-black text-sm shadow-sm">
                      {group.score} / 100
                    </span>
                    <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
                      ({group.teams.length} teams identical)
                    </span>
                  </div>
                </div>

                {/* Tied Teams Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        className={`rounded-xl p-3.5 border transition-all ${
                          hasActiveNotice
                            ? 'bg-amber-500/5 border-amber-400 dark:border-amber-500/50'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {/* Unique ID & Status Badges */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                            {uniqueId}
                          </span>
                          {hasActiveNotice && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3 animate-spin" /> Notice Sent
                            </span>
                          )}
                          {isEditPending && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full">
                              <ExternalLink className="w-3 h-3" /> Edit Requested
                            </span>
                          )}
                          {isEditAllowed && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 dark:text-green-300 bg-green-500/20 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Unlocked
                            </span>
                          )}
                        </div>

                        {/* Student Name(s) */}
                        <div className="mb-2">
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <User className="w-3 h-3 text-[#FD5E01]" />
                            {members.length > 1 ? `Students (${members.length})` : 'Student Name'}
                          </div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                            {members.map((m) => m.name).join(', ')}
                          </div>
                        </div>

                        {/* School Name */}
                        <div className="mb-2">
                          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <SchoolIcon className="w-3 h-3 text-[#03A695]" /> School
                          </div>
                          <div className="text-xs text-slate-800 dark:text-slate-200 truncate">
                            {team.schoolName}
                          </div>
                        </div>

                        {/* Evaluated By Judge */}
                        <div className="mb-3 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-700/60">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Juror: </span>
                          <span className="font-bold text-[#008C7E] dark:text-[#03A695]">{judgeName}</span>{' '}
                          <span className="text-[10px] text-slate-500">({judgeId})</span>
                        </div>

                        {/* Criteria Marks Snapshot */}
                        {team.criterionScores && (
                          <div className="grid grid-cols-5 gap-1 mb-3 text-[10px] text-center">
                            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded">
                              <div className="text-slate-400">Tech</div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">{team.criterionScores['crit-tech'] ?? 0}</div>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded">
                              <div className="text-slate-400">Inn</div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">{team.criterionScores['crit-innov'] ?? 0}</div>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded">
                              <div className="text-slate-400">Des</div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">{team.criterionScores['crit-design'] ?? 0}</div>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded">
                              <div className="text-slate-400">Demo</div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">{team.criterionScores['crit-demo'] ?? 0}</div>
                            </div>
                            <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded">
                              <div className="text-slate-400">Doc</div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">{team.criterionScores['crit-doc'] ?? 0}</div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                          {isEditPending ? (
                            <button
                              onClick={() => navigate('score-requests')}
                              className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Review Juror Request
                            </button>
                          ) : isEditAllowed ? (
                            <div className="w-full py-1.5 px-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-300 font-bold text-xs text-center border border-green-500/30">
                              ✓ Unlocked for Juror Recalibration
                            </div>
                          ) : hasActiveNotice ? (
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold truncate">
                                Awaiting Juror Request
                              </span>
                              <button
                                onClick={() => handleOpenAlertModal(team, group)}
                                className="py-1 px-2.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 font-bold text-[11px] shrink-0"
                              >
                                Re-send Notice
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenAlertModal(team, group)}
                              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Send Tie-Break Alert to Juror
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
      </div>

      {/* Modal to customize & dispatch tie alert */}
      {selectedTeamForAlert && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedTeamForAlert(null)}
          title="Send Tie-Break Notice to Juror"
        >
          <div className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">Administrative Protocol: </span>
                This will dispatch a high-priority alert notification to Juror{' '}
                <span className="font-bold">
                  {selectedTeamForAlert.evaluatedByJudgeName || selectedTeamForAlert.assignedJudgeName || 'Assigned Juror'}
                </span>
                . The Juror's scoring interface will display a tie-break recalibration banner prompting them to submit a
                score edit request.
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Team Unique ID & Details
              </label>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs space-y-1">
                <div>
                  <span className="font-semibold text-slate-500">Unique ID: </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedTeamForAlert.teamId || selectedTeamForAlert.participantId}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Students: </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {getNormalizedTeamMembers(selectedTeamForAlert).map((m) => m.name).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Category & Score: </span>
                  <span className="font-bold text-[#FD5E01]">
                    {selectedTeamForAlert.categoryName} • {selectedTeamForAlert.finalScore} / 100
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Alert Message to Juror
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="State the instructions for the juror to re-evaluate marks..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTeamForAlert(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendAlert}
                disabled={isSending || !customMessage.trim()}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Official Notice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
