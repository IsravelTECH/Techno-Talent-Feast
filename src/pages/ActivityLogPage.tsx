import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Award,
  CheckCircle2,
  Clock,
  UserCheck,
  FileCheck2,
  AlertCircle,
  Download
} from 'lucide-react';

export const ActivityLogPage: React.FC = () => {
  const { auditLogs, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || log.action === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              Championship Audit Trail & Activity Log
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] text-[#0057B8] text-xs font-bold">
              Tamper-Proof Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete chronological record of all juror marks, admin approvals, rubric reopens, and stage transitions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-4 h-4" />}
            onClick={() => addToast('Exported complete Audit Trail CSV', 'success')}
          >
            Export Audit Log
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit actions, jurors, admins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#0057B8]"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#0057B8]"
        >
          <option value="ALL">All Actions</option>
          <option value="SCORE_SUBMITTED">Score Submitted</option>
          <option value="SCORE_APPROVED">Score Approved</option>
          <option value="EVALUATION_REOPENED">Evaluation Reopened</option>
          <option value="JUDGE_ASSIGNED">Judge Assigned</option>
          <option value="STAGE_CHANGED">Stage Changed</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900">
            System Event Log ({filteredLogs.length} Events)
          </h2>
          <span className="text-xs text-slate-400 font-mono">Immutable Log Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Actor / User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Activity Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {log.userName}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      log.userRole === 'admin' ? 'bg-blue-100 text-[#0057B8]' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={
                      log.action.includes('SUBMITTED') || log.action.includes('APPROVED')
                        ? 'success'
                        : log.action.includes('REOPENED')
                        ? 'warning'
                        : 'neutral'
                    } size="sm">
                      {log.action.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {log.details}
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
