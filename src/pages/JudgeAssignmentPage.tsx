import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserAvatar } from '../components/common/UserAvatar';
import { parseCSV, downloadCSV } from '../utils/csvUtils';
import {
  UserCheck,
  Plus,
  Search,
  Trash2,
  Edit3,
  AlertTriangle,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { Judge } from '../types';
import { generateJudgePassword } from '../utils/judgeCredentials';

export const JudgeAssignmentPage: React.FC = () => {
  const {
    judges = [],
    createJudge,
    bulkImportJudges,
    updateJudge,
    deleteJudge,
    toggleJudgeStatus,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedJudges, setParsedJudges] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create Judge Modal State
  const [isCreateJudgeOpen, setIsCreateJudgeOpen] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeEmail, setNewJudgeEmail] = useState('');
  const [newJudgePassword, setNewJudgePassword] = useState('');
  const [isCreatingJudge, setIsCreatingJudge] = useState(false);

  // Edit Judge Modal State
  const [isEditJudgeOpen, setIsEditJudgeOpen] = useState(false);
  const [editingJudge, setEditingJudge] = useState<Judge | null>(null);
  const [editJudgeName, setEditJudgeName] = useState('');
  const [editJudgeEmail, setEditJudgeEmail] = useState('');
  const [editJudgePassword, setEditJudgePassword] = useState('');
  const [isUpdatingJudge, setIsUpdatingJudge] = useState(false);

  // Delete Judge Modal State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingJudge, setDeletingJudge] = useState<Judge | null>(null);
  const [isDeletingJudge, setIsDeletingJudge] = useState(false);

  // Filter judges
  const filteredJudges = judges.filter((j) => {
    const q = searchQuery.toLowerCase();
    const name = j.name || (j as any).judgeName || '';
    const email = j.email || '';
    const jId = j.judgeId || j.id || '';
    return name.toLowerCase().includes(q) ||
           email.toLowerCase().includes(q) ||
           jId.toLowerCase().includes(q);
  });

  // Copy password handler
  const handleCopyPassword = (judgeId: string, pass: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(pass);
      setCopiedId(judgeId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Create Submit
  const handleCreateJudgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudgeName.trim() || !newJudgeEmail.trim()) {
      return;
    }

    const predictedId = `JDG-${String(judges.length + 1).padStart(2, '0')}`;
    const autoPass = generateJudgePassword(predictedId, newJudgeName);
    const finalPass = newJudgePassword.trim() && newJudgePassword.trim() !== '123456'
      ? newJudgePassword.trim()
      : autoPass;

    setIsCreatingJudge(true);
    const res = await createJudge({
      name: newJudgeName.trim(),
      email: newJudgeEmail.trim().toLowerCase(),
      password: finalPass
    });

    setIsCreatingJudge(false);
    if (res.success) {
      setIsCreateJudgeOpen(false);
      setNewJudgeName('');
      setNewJudgeEmail('');
      setNewJudgePassword('');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (judge: Judge) => {
    setEditingJudge(judge);
    setEditJudgeName(judge.name || '');
    setEditJudgeEmail(judge.email || '');
    setEditJudgePassword('');
    setIsEditJudgeOpen(true);
  };

  // Edit Submit
  const handleEditJudgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJudge) return;
    if (!editJudgeName.trim() || !editJudgeEmail.trim()) {
      addToast('Name and email cannot be blank.', 'error');
      return;
    }

    setIsUpdatingJudge(true);
    const updates: any = {
      name: editJudgeName.trim(),
      email: editJudgeEmail.trim().toLowerCase()
    };
    if (editJudgePassword.trim()) {
      updates.password = editJudgePassword.trim();
    }

    const targetId = editingJudge.id || editingJudge.judgeId || (editingJudge as any)._id;
    const res = await updateJudge(targetId, updates);
    setIsUpdatingJudge(false);

    if (res.success) {
      setIsEditJudgeOpen(false);
      setEditingJudge(null);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (judge: Judge) => {
    setDeletingJudge(judge);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingJudge) return;
    setIsDeletingJudge(true);
    const targetId = deletingJudge.id || deletingJudge.judgeId || (deletingJudge as any)._id;
    const res = await deleteJudge(targetId);
    setIsDeletingJudge(false);
    if (res.success) {
      setIsDeleteDialogOpen(false);
      setDeletingJudge(null);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (judge: Judge) => {
    const targetId = judge.id || judge.judgeId || (judge as any)._id;
    await toggleJudgeStatus(targetId, judge.status || 'ACTIVE');
  };

  // Dynamic CSV Export for Judges
  const handleExportCSV = () => {
    if (filteredJudges.length === 0) {
      addToast({
        type: 'info',
        title: 'No Records',
        message: 'No judge records match current search to export.'
      });
      return;
    }

    const headers = [
      'Username (Judge ID)',
      'Full Name',
      'Email Address',
      'Login Password',
      'Status'
    ];

    const rows = filteredJudges.map((j) => {
      const jName = j.name || (j as any).judgeName || 'Juror';
      const jId = j.judgeId || j.id || 'JDG-00';
      const displayPass = j.password && j.password !== '123456'
        ? j.password
        : generateJudgePassword(jId, jName);

      return [
        jId,
        jName,
        j.email || '',
        displayPass,
        j.status || 'ACTIVE'
      ];
    });

    downloadCSV(
      `TTF2026_Judges_Roster_${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows
    );

    addToast({
      type: 'success',
      title: 'Export Complete',
      message: `Exported ${filteredJudges.length} judge record(s) to CSV.`
    });
  };

  // Download Sample CSV Template
  const handleDownloadSampleTemplate = () => {
    const headers = ['Judge ID', 'Full Name', 'Email', 'Organization', 'Specialization', 'Status'];
    const sampleRows = [
      ['JDG-16', 'Dr. Alan Turing', 'alan.turing@technoschool.in', 'Techno AI Academy', 'Robotics & AI', 'ACTIVE'],
      ['JDG-17', 'Prof. Ada Lovelace', 'ada.lovelace@technoschool.in', 'Cambridge International', 'Coding & Software', 'ACTIVE'],
      ['JDG-18', 'Dr. Claude Shannon', 'claude.shannon@technoschool.in', 'Dubai Silicon Oasis High', 'Innovation Challenge', 'AVAILABLE']
    ];
    downloadCSV('Judge_Roster_Template.csv', headers, sampleRows);
  };

  // Handle CSV File Selection & Parse
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const { headers, rows } = parseCSV(text);

      if (rows.length === 0) {
        addToast({
          type: 'error',
          title: 'Empty File',
          message: 'The uploaded CSV file contains no data rows.'
        });
        setParsedJudges([]);
        return;
      }

      const normalized = rows.map((r, idx) => {
        const name = (r['Full Name'] || r['Juror Name'] || r['Name'] || r['judgeName'] || '').trim();
        const email = (r['Email Address'] || r['Email'] || r['Official Email'] || r['email'] || '').trim().toLowerCase();
        const judgeId = (r['Username (Judge ID)'] || r['Judge ID'] || r['judgeId'] || '').trim();
        const organization = (r['Organization'] || r['Institution'] || '').trim();
        const specialization = (r['Specialization'] || r['Track'] || 'Robotics & AI').trim();
        const status = (r['Status'] || 'ACTIVE').trim().toUpperCase();

        const isValid = !!name && !!email && email.includes('@');
        let errorMsg = '';
        if (!name) errorMsg = 'Missing name';
        else if (!email) errorMsg = 'Missing email';
        else if (!email.includes('@')) errorMsg = 'Invalid email';

        return {
          rowNum: idx + 1,
          name,
          email,
          judgeId,
          organization,
          specialization,
          status,
          isValid,
          errorMsg
        };
      });

      setParsedJudges(normalized);
    };

    reader.readAsText(file);
  };

  // Submit Bulk Import
  const handleConfirmImport = async () => {
    const validRows = parsedJudges.filter((j) => j.isValid);
    if (validRows.length === 0) {
      addToast({
        type: 'error',
        title: 'No Valid Records',
        message: 'No valid judge rows detected to import.'
      });
      return;
    }

    setIsImporting(true);
    const res = await bulkImportJudges(validRows);
    setIsImporting(false);

    if (res.success) {
      setShowImportModal(false);
      setParsedJudges([]);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Unified Judge Roaster Panel */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-card space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                Judge Roaster
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] text-xs font-bold">
                {filteredJudges.length} Jurors
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live evaluators accredited in system for TTF 2026 scoring
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full md:w-auto flex-wrap">
            <div className="relative w-full sm:w-auto sm:min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search judge by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695] transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Upload className="w-3.5 h-3.5 text-slate-500" />}
                onClick={() => setShowImportModal(true)}
                className="text-xs shrink-0"
                title="Import judges from CSV file"
              >
                Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="w-3.5 h-3.5 text-slate-500" />}
                onClick={handleExportCSV}
                className="text-xs shrink-0"
                title="Export filtered judges roster as CSV"
              >
                Export ({filteredJudges.length})
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCreateJudgeOpen(true)}
                className="text-xs shrink-0 whitespace-nowrap"
              >
                + Create New Judge
              </Button>
            </div>
          </div>
        </div>

        {filteredJudges.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="font-semibold text-slate-600">No Judges Found</p>
            <p className="text-xs text-slate-400 mt-1">
              Click "+ Create New Judge" above to register an evaluator with name, email, and password.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-3">Username (Judge ID)</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Login Password</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJudges.map((judge) => {
                  const jName = judge.name || (judge as any).judgeName || 'Juror';
                  const jId = judge.judgeId || judge.id || 'JDG-00';
                  const isActive = judge.status === 'ACTIVE';
                  const displayPass = judge.password && judge.password !== '123456'
                    ? judge.password
                    : generateJudgePassword(jId, jName);
                  const isVisible = !!visiblePasswords[judge.id];
                  const isCopied = copiedId === judge.id;

                  return (
                    <tr key={judge.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono font-extrabold text-[#03A695] text-xs bg-[#E6F7F5] border border-teal-200 px-2 py-0.5 rounded-md w-fit">
                            {jId}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">Login Username</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar name={jName} size="sm" />
                          <span className="font-bold text-slate-900">{jName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-600 font-medium">{judge.email}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center gap-1.5 bg-[#F8FAFC] border border-slate-200 rounded-lg px-2.5 py-1">
                          <Key className="w-3.5 h-3.5 text-[#FD5E01] shrink-0" />
                          <span className="font-mono font-bold text-xs text-[#0B2545] tracking-wide select-all min-w-[95px]">
                            {isVisible ? displayPass : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setVisiblePasswords((prev) => ({ ...prev, [judge.id]: !prev[judge.id] }))
                            }
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title={isVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(judge.id, displayPass)}
                            className="p-1 text-slate-400 hover:text-[#03A695] transition-colors cursor-pointer"
                            title="Copy Password"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(judge)}
                          title={`Click to mark as ${isActive ? 'INACTIVE' : 'ACTIVE'}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full transition-colors ${
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(judge)}
                            className="p-1.5 text-slate-500 hover:text-[#03A695] hover:bg-[#E6F7F5] rounded-lg transition-colors cursor-pointer"
                            title="Edit Judge"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(judge)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Judge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create New Judge Modal */}
      {/* Create New Judge Modal */}
      <Modal
        isOpen={isCreateJudgeOpen}
        onClose={() => setIsCreateJudgeOpen(false)}
        title="Register Official Competition Judge"
        subtitle="Create a new verified Judge with Judge ID and formatted credentials."
        maxWidth="md"
      >
        <form onSubmit={handleCreateJudgeSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Judge Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Eng. Marcus Vance"
              value={newJudgeName}
              onChange={(e) => setNewJudgeName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="marcus.vance@technoschool.in"
              value={newJudgeEmail}
              onChange={(e) => setNewJudgeEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 block">Password</label>
              <span className="text-[10px] text-[#03A695] font-bold bg-[#E6F7F5] px-2 py-0.5 rounded-full border border-teal-200">
                JDG-XX-firstname Format
              </span>
            </div>
            <input
              type="text"
              placeholder={generateJudgePassword(
                `JDG-${String(judges.length + 1).padStart(2, '0')}`,
                newJudgeName || 'Eng. Marcus Vance'
              )}
              value={newJudgePassword}
              onChange={(e) => setNewJudgePassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695]"
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FD5E01] shrink-0" />
              <span>
                Auto-assigned credential:{' '}
                <strong className="text-[#03A695] font-mono">
                  {generateJudgePassword(
                    `JDG-${String(judges.length + 1).padStart(2, '0')}`,
                    newJudgeName || 'Eng. Marcus Vance'
                  )}
                </strong>{' '}
                <span className="text-slate-400">(leave blank to use auto format)</span>
              </span>
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateJudgeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isCreatingJudge}
              icon={isCreatingJudge ? undefined : <Plus className="w-4 h-4" />}
            >
              {isCreatingJudge ? 'Saving to Database...' : 'Register Judge in Atlas'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Judge Modal */}
      <Modal
        isOpen={isEditJudgeOpen}
        onClose={() => setIsEditJudgeOpen(false)}
        title={`Edit Judge: ${editingJudge?.name || ''}`}
        subtitle={`Update details and credentials for ${editingJudge?.judgeId || 'Judge'}.`}
        maxWidth="md"
      >
        <form onSubmit={handleEditJudgeSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Judge Full Name *</label>
            <input
              type="text"
              required
              value={editJudgeName}
              onChange={(e) => setEditJudgeName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={editJudgeEmail}
              onChange={(e) => setEditJudgeEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Password <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
            </label>
            <input
              type="text"
              placeholder={
                editingJudge
                  ? (editingJudge.password && editingJudge.password !== '123456'
                    ? editingJudge.password
                    : generateJudgePassword(editingJudge.judgeId || editingJudge.id, editingJudge.name))
                  : 'Enter new password...'
              }
              value={editJudgePassword}
              onChange={(e) => setEditJudgePassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditJudgeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isUpdatingJudge}
            >
              {isUpdatingJudge ? 'Saving Updates...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Judge Deletion"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Are you sure you want to remove this judge?</p>
              <p className="mt-1 text-rose-700">
                Judge <span className="font-semibold">{deletingJudge?.name}</span> ({deletingJudge?.judgeId}) will be permanently removed from MongoDB Atlas.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              disabled={isDeletingJudge}
              onClick={handleConfirmDelete}
            >
              {isDeletingJudge ? 'Deleting...' : 'Delete Judge'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CSV IMPORT MODAL */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          if (!isImporting) {
            setShowImportModal(false);
            setParsedJudges([]);
            setImportFile(null);
          }
        }}
        title="Bulk Import Judges & Evaluators"
        subtitle="Upload CSV file to register evaluator credentials into the system"
      >
        <div className="space-y-4 text-xs">
          {/* Template Download Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#03A695]" />
              <div>
                <p className="font-bold text-slate-800">Need the standard CSV format?</p>
                <p className="text-[11px] text-slate-500">Download the pre-configured spreadsheet template</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownloadSampleTemplate}
            >
              Template
            </Button>
          </div>

          {/* Hidden File Input & Upload Dropzone */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-[#03A695] rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-[#E6F7F5]/30 transition-colors cursor-pointer"
          >
            <Upload className="w-8 h-8 text-[#03A695] mx-auto mb-2" />
            <p className="font-bold text-slate-800">
              {importFile ? importFile.name : 'Click to browse or drop CSV roster file'}
            </p>
            <p className="text-slate-400 mt-1 text-[11px]">
              {importFile
                ? `${(importFile.size / 1024).toFixed(1)} KB • Click to replace file`
                : 'Supports .csv with Full Name, Email, Organization, Specialization'}
            </p>
          </div>

          {/* Preview of Parsed Rows */}
          {parsedJudges.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Preview ({parsedJudges.filter((j) => j.isValid).length} valid of {parsedJudges.length} rows)
                </span>
                <span className="text-[11px] text-slate-500">
                  Sequential IDs (JDG-XX) will be generated automatically
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                {parsedJudges.map((j, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 flex items-center justify-between gap-2 text-xs ${
                      j.isValid ? 'bg-white' : 'bg-red-50/70'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        {j.isValid ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                        <span className="truncate">{j.name || 'Unnamed Juror'}</span>
                        {j.judgeId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                            {j.judgeId}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {j.email} • {j.organization || 'General Juror'} • {j.specialization}
                      </p>
                    </div>

                    {!j.isValid && (
                      <span className="text-[10px] font-bold text-red-600 px-2 py-0.5 rounded bg-red-100 shrink-0">
                        {j.errorMsg}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isImporting}
              onClick={() => {
                setShowImportModal(false);
                setParsedJudges([]);
                setImportFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="orange"
              size="sm"
              disabled={isImporting || parsedJudges.filter((j) => j.isValid).length === 0}
              onClick={handleConfirmImport}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Importing...
                </>
              ) : (
                `Confirm Import (${parsedJudges.filter((j) => j.isValid).length})`
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
