import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Users,
  Trophy,
  Building2,
  UserCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { participants, schools, competitions, judges, addToast } = useApp();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reportsList = [
    {
      id: 'rep-participants',
      title: 'Complete Participant Master Report',
      description: 'Comprehensive roster of all 1,248 registered students with grades, contact info, and scores.',
      icon: Users,
      count: '1,248 Records',
      format: 'Excel / CSV'
    },
    {
      id: 'rep-schools',
      title: 'School Delegation & Medal Tally',
      description: 'Ranked standings of 42 institutions with average marks, gold/silver/bronze medal distributions.',
      icon: Building2,
      count: '42 Institutions',
      format: 'PDF / Excel'
    },
    {
      id: 'rep-competitions',
      title: 'Competition Arena Summary',
      description: 'Breakdown of 12 competitions with completion status, judge rosters, and passing percentiles.',
      icon: Trophy,
      count: '12 Arenas',
      format: 'PDF Executive'
    },
    {
      id: 'rep-judges',
      title: 'Judge Evaluation Performance Audit',
      description: 'Evaluation audit tracking scoring timestamps, score variances, and pending queues.',
      icon: UserCheck,
      count: '28 Evaluators',
      format: 'Audit Log CSV'
    },
    {
      id: 'rep-winners',
      title: 'Championship Winners & Merit Gazette',
      description: 'Official gazette of top 3 podium finishers for all arenas for press release and valedictory.',
      icon: FileSpreadsheet,
      count: 'Podium Roster',
      format: 'Official PDF'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
            Reports & Data Export Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export official audit logs, participant rosters, score sheets, and gazettes
          </p>
        </div>

        <Button
          variant="orange"
          size="sm"
          icon={<Download className="w-3.5 h-3.5" />}
          onClick={() => {
            addToast({
              type: 'success',
              title: 'Generating Bulk Archive',
              message: 'Compiled all 5 reports into a downloadable zip archive (mock).'
            });
          }}
        >
          Download Complete Event Archive (.zip)
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportsList.map((rep) => {
          const Icon = rep.icon;
          return (
            <div
              key={rep.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-blue-300 transition-all p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF3FF] border border-blue-100 flex items-center justify-center text-[#0057B8]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="primary" size="sm">
                    {rep.format}
                  </Badge>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-black text-slate-900">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {rep.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Scope:</span>
                  <span className="font-bold text-[#0057B8]">{rep.count}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setSelectedReport(rep.title)}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    addToast({
                      type: 'success',
                      title: 'Report Downloaded',
                      message: `Exported ${rep.title} successfully.`
                    });
                  }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {selectedReport && (
        <Modal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Executive Report: ${selectedReport}`}
          subtitle="Real-time tabulated snapshot generated from live event records"
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#F6F9FD] border border-slate-200">
              <p className="font-bold text-slate-900">
                Techno Talent Feast 2026 — Verified Report Output
              </p>
              <p className="text-slate-500 mt-0.5">
                Timestamp: {new Date().toLocaleString()} • Authorized by Convener Office
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Parameter / Category</th>
                    <th className="p-3 text-center">Entries</th>
                    <th className="p-3 text-center">Completion</th>
                    <th className="p-3 text-right">Aggregate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {competitions.slice(0, 5).map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3 text-center">{c.registeredCount}</td>
                      <td className="p-3 text-center font-bold text-emerald-600">
                        {Math.round((c.completedCount / c.registeredCount) * 100)}%
                      </td>
                      <td className="p-3 text-right font-black text-[#0057B8]">
                        91.4% Avg
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </Button>
              <Button
                variant="orange"
                size="sm"
                onClick={() => {
                  setSelectedReport(null);
                  window.print();
                }}
              >
                Print Report
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
