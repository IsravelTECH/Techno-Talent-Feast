import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { TechnoLogo } from '../components/common/TechnoLogo';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  Award,
  Trophy,
  Download,
  Printer,
  Search,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { participants, competitions, navigate } = useApp();
  const [selectedComp, setSelectedComp] = useState('ALL');
  const [selectedParticipantForCert, setSelectedParticipantForCert] = useState<any | null>(null);

  const evaluatedParticipants = participants.filter((p) => p.status === 'SUBMITTED');

  const filteredResults = evaluatedParticipants.filter((p) => {
    return selectedComp === 'ALL' || p.competitionId === selectedComp;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Official Championship Results
            </h1>
            <Badge variant="success" size="sm">
              Verified by Convener
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse official awardees, download verified merit certificates, and review jury rankings
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedComp}
            onChange={(e) => setSelectedComp(e.target.value)}
            className="px-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Competitions & Tracks</option>
            {competitions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Winners Podium Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar name={p.name} size="lg" variant="color" />
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                      🏆 {p.rank === 1 ? 'WINNER • 1st Place' : p.rank === 2 ? '1st Runner-Up' : '2nd Runner-Up'}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
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

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-bold"
                onClick={() => setSelectedParticipantForCert(p)}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View Certificate</span>
              </Button>

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
        ))}
      </div>

      {/* Official Certificate Modal */}
      {selectedParticipantForCert && (
        <Modal
          isOpen={!!selectedParticipantForCert}
          onClose={() => setSelectedParticipantForCert(null)}
          title="Official Techno Talent Feast Merit Certificate"
          subtitle="Verified digital certificate issued by TechnoSchool"
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Printable Certificate Frame */}
            <div className="p-8 rounded-2xl border-4 border-double border-[#03A695] bg-gradient-to-br from-white via-[#F7FCFB] to-[#E6F7F5] text-center space-y-4 shadow-inner relative overflow-hidden">
              <div className="flex justify-center">
                <TechnoLogo variant="badge" size="lg" />
              </div>

              <div className="pt-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#FD5E01]">
                  CERTIFICATE OF MERIT & DISTINCTION
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Techno Talent Feast 2026 Inter-School Championship
                </p>
              </div>

              <div className="py-2">
                <p className="text-xs text-slate-600 italic">This is proudly awarded to</p>
                <h2 className="text-2xl font-black text-[#0B2545] tracking-tight mt-1">
                  {selectedParticipantForCert.name}
                </h2>
                <p className="text-xs font-bold text-slate-700">
                  {selectedParticipantForCert.schoolName} (Grade {selectedParticipantForCert.grade})
                </p>
              </div>

              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                for securing <strong className="text-[#03A695]">Rank #{selectedParticipantForCert.rank || 1}</strong> with an aggregate score of <strong className="text-[#FD5E01]">{selectedParticipantForCert.finalScore} / 100 ({selectedParticipantForCert.percentage}%)</strong> in the <strong className="text-slate-900">{selectedParticipantForCert.competitionName}</strong>.
              </p>

              {/* Signatures */}
              <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700">
                <div>
                  <p className="font-serif italic text-sm font-bold text-[#0B2545]">Dr. S. Ranganathan</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">
                    Convener, TechnoSchool Group
                  </p>
                </div>
                <div>
                  <p className="font-serif italic text-sm font-bold text-[#0B2545]">Priya Sharma</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">
                    Lead Arena Evaluator
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedParticipantForCert(null)}
              >
                Close
              </Button>
              <Button
                variant="orange"
                size="sm"
                icon={<Printer className="w-3.5 h-3.5" />}
                onClick={() => window.print()}
              >
                Print Official Certificate
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
