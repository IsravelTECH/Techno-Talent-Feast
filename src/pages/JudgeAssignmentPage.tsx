import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserAvatar } from '../components/common/UserAvatar';
import {
  UserCheck,
  Plus,
  Search,
  Trash2,
  Edit3,
  AlertTriangle
} from 'lucide-react';
import { Judge } from '../types';

export const JudgeAssignmentPage: React.FC = () => {
  const {
    judges = [],
    createJudge,
    updateJudge,
    deleteJudge,
    toggleJudgeStatus,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Create Judge Modal State
  const [isCreateJudgeOpen, setIsCreateJudgeOpen] = useState(false);
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeEmail, setNewJudgeEmail] = useState('');
  const [newJudgePassword, setNewJudgePassword] = useState('123456');
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

  // Create Submit
  const handleCreateJudgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJudgeName.trim() || !newJudgeEmail.trim()) {
      addToast('Please enter judge full name and valid email address.', 'error');
      return;
    }

    setIsCreatingJudge(true);
    const res = await createJudge({
      name: newJudgeName.trim(),
      email: newJudgeEmail.trim().toLowerCase(),
      password: newJudgePassword.trim() || '123456'
    });

    setIsCreatingJudge(false);
    if (res.success) {
      setIsCreateJudgeOpen(false);
      setNewJudgeName('');
      setNewJudgeEmail('');
      setNewJudgePassword('123456');
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

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <div className="relative w-full sm:min-w-[260px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search judge by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#03A695] transition-colors"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateJudgeOpen(true)}
              className="text-xs shrink-0"
            >
              + Create New Judge
            </Button>
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
            <table className="w-full text-left text-xs min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-3">Juror / Judge ID</th>
                  <th className="py-3 px-3">Full Name</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJudges.map((judge) => {
                  const jName = judge.name || (judge as any).judgeName || 'Juror';
                  const jId = judge.judgeId || judge.id || 'JDG-00';
                  const isActive = judge.status === 'ACTIVE';

                  return (
                    <tr key={judge.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-[#03A695] text-xs bg-[#E6F7F5] px-2 py-1 rounded-md">
                          {jId}
                        </span>
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
                            className="p-1.5 text-slate-500 hover:text-[#03A695] hover:bg-[#E6F7F5] rounded-lg transition-colors"
                            title="Edit Judge"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(judge)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
      <Modal
        isOpen={isCreateJudgeOpen}
        onClose={() => setIsCreateJudgeOpen(false)}
        title="Register Official Competition Judge"
        subtitle="Create a new verified Judge with name, email, and password."
        maxWidth="md"
      >
        <form onSubmit={handleCreateJudgeSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Judge Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Rajesh Khanna"
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
              placeholder="judge@technoschool.in"
              value={newJudgeEmail}
              onChange={(e) => setNewJudgeEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
            <input
              type="text"
              placeholder="123456"
              value={newJudgePassword}
              onChange={(e) => setNewJudgePassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695]"
            />
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
        subtitle={`Update details for ${editingJudge?.judgeId || 'Judge'}.`}
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
              New Password <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
            </label>
            <input
              type="text"
              placeholder="Enter new password if changing..."
              value={editJudgePassword}
              onChange={(e) => setEditJudgePassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695]"
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
    </div>
  );
};
