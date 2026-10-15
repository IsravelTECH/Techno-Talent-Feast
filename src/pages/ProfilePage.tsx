import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { UserAvatar } from '../components/common/UserAvatar';
import { Modal } from '../components/common/Modal';
import { UserRole } from '../types';
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  KeyRound,
  Pencil,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Hash
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, updateUserProfile, changeUserPassword, addToast } = useApp();

  // Edit Profile Details Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    role: (currentUser.role || currentRole) as UserRole
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Change Password Modal State (Separate)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const displayId = currentUser.judgeId || currentUser.id || 'usr-admin-01';

  // Open Edit Profile Modal
  const handleOpenEditModal = () => {
    setEditFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      role: (currentUser.role || currentRole) as UserRole
    });
    setProfileError('');
    setIsEditModalOpen(true);
  };

  // Submit Profile Details Changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      setProfileError('User Name is required.');
      return;
    }
    if (!editFormData.email.trim()) {
      setProfileError('Email Address is required.');
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');

    try {
      const res = await updateUserProfile({
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
        role: editFormData.role
      });

      if (res.success) {
        setIsEditModalOpen(false);
      } else {
        setProfileError(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setProfileError(err.message || 'Error saving profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open Change Password Modal (Separate)
  const handleOpenPasswordModal = () => {
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  // Submit Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordFormData.newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (passwordFormData.newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setIsSavingPassword(true);
    setPasswordError('');

    try {
      const res = await changeUserPassword({
        currentPassword: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPassword
      });

      if (res.success) {
        setIsPasswordModalOpen(false);
      } else {
        setPasswordError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Error updating password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
              User Profile & Security
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E6F7F5] text-[#03A695] border border-teal-200 text-[10px] font-bold uppercase">
              {currentRole === 'admin' ? 'Administration' : 'Juror'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your account credentials, security profile, and contact information
          </p>
        </div>

        {/* Header Action: Edit Profile */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleOpenEditModal}
          className="gap-2 shrink-0 cursor-pointer shadow-sm"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </Button>
      </div>

      {/* Main Profile Dossier Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 lg:p-8 space-y-6">
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <UserAvatar
              name={currentUser.name}
              className="w-20 h-20 text-2xl rounded-2xl shadow-md border-4 border-teal-100 bg-[#03A695] text-white shrink-0"
            />

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">{currentUser.name}</h2>
                <Badge variant={currentRole === 'admin' ? 'primary' : 'warning'} size="sm">
                  {currentRole === 'admin' ? 'Super Administrator' : 'Official Competition Judge'}
                </Badge>
              </div>

              <p className="text-xs text-slate-500 font-semibold mt-1">
                {currentUser.email}
              </p>

              <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold border border-slate-200/80">
                  <Hash className="w-3.5 h-3.5 text-slate-400" />
                  <span>ID: {displayId}</span>
                  <span title="Permanent Non-Editable ID">
                    <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active Status
                </span>
              </div>
            </div>
          </div>

          {/* Quick Edit Icon Button */}
          <button
            onClick={handleOpenEditModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#03A695] bg-[#E6F7F5] hover:bg-blue-100 border border-teal-200/80 transition-colors cursor-pointer"
            title="Edit profile details"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Details</span>
          </button>
        </div>

        {/* Profile Details Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Personal & Security Information
            </h3>
            <span className="text-[11px] text-slate-400">Click edit icon to modify fields</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. System Identifier (ID) - Strictly Non-Editable */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/70 relative group">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Account ID
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Lock className="w-2.5 h-2.5" />
                  Non-Editable
                </span>
              </div>
              <p className="font-mono font-bold text-slate-800 text-sm mt-1.5">
                {displayId}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Permanent system unique identifier (cannot be edited)
              </p>
            </div>

            {/* 2. User Name */}
            <div className="p-4 rounded-2xl bg-[#F7FCFB] border border-teal-100/70 relative group hover:border-teal-200 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#03A695]" />
                  User Name
                </span>
                <button
                  onClick={handleOpenEditModal}
                  className="opacity-60 group-hover:opacity-100 text-[#03A695] hover:text-[#0B2545] transition-opacity cursor-pointer p-0.5"
                  title="Edit User Name"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="font-bold text-slate-900 text-sm mt-1.5">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Official display name used throughout reports and evaluation logs
              </p>
            </div>

            {/* 3. Email Address */}
            <div className="p-4 rounded-2xl bg-[#F7FCFB] border border-teal-100/70 relative group hover:border-teal-200 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#03A695]" />
                  Email Address
                </span>
                <button
                  onClick={handleOpenEditModal}
                  className="opacity-60 group-hover:opacity-100 text-[#03A695] hover:text-[#0B2545] transition-opacity cursor-pointer p-0.5"
                  title="Edit Email Address"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="font-bold text-slate-900 text-sm mt-1.5 truncate">
                {currentUser.email}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Primary login credential and official communication channel
              </p>
            </div>

            {/* 4. Phone Number */}
            <div className="p-4 rounded-2xl bg-[#F7FCFB] border border-teal-100/70 relative group hover:border-teal-200 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#03A695]" />
                  Phone Number
                </span>
                <button
                  onClick={handleOpenEditModal}
                  className="opacity-60 group-hover:opacity-100 text-[#03A695] hover:text-[#0B2545] transition-opacity cursor-pointer p-0.5"
                  title="Edit Phone Number"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="font-bold text-slate-900 text-sm mt-1.5">
                {currentUser.phone || '+971 - 565104104'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Direct phone number for SMS alerts and urgent arena dispatches
              </p>
            </div>

            {/* 5. Role */}
            <div className="p-4 rounded-2xl bg-[#F7FCFB] border border-teal-100/70 relative group hover:border-teal-200 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#03A695]" />
                  System Role
                </span>
                <button
                  onClick={handleOpenEditModal}
                  className="opacity-60 group-hover:opacity-100 text-[#03A695] hover:text-[#0B2545] transition-opacity cursor-pointer p-0.5"
                  title="Edit Role"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="font-bold text-slate-900 text-sm mt-1.5 flex items-center gap-2">
                <span>{currentRole === 'admin' ? 'Super Administrator' : 'Judge / Juror'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-[#03A695] font-mono font-bold uppercase">
                  {currentUser.role || currentRole}
                </span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {currentRole === 'admin'
                  ? 'Full administrative control across all scores, schools, and judge assignments'
                  : 'Evaluation privileges for live arena team scores and rubric entries'}
              </p>
            </div>

            {/* 6. Password (Separate Edit) */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 relative group hover:border-amber-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-amber-600" />
                  Account Password
                </span>
                <button
                  onClick={handleOpenPasswordModal}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                  title="Change Password"
                >
                  <Pencil className="w-2.5 h-2.5" />
                  <span>Change Password</span>
                </button>
              </div>
              <p className="font-mono font-bold text-slate-800 text-sm mt-1.5 tracking-wider">
                ••••••••••••
              </p>
              <p className="text-[10px] text-amber-700/80 mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3 inline shrink-0" />
                Password editing is managed separately for security
              </p>
            </div>
          </div>
        </div>

        {/* Security & Action Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Authenticated session via MongoDB Atlas. All updates sync in real time.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPasswordModal}
              className="gap-2 flex-1 sm:flex-none cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Change Password</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenEditModal}
              className="gap-2 flex-1 sm:flex-none cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. EDIT PROFILE DETAILS MODAL                                */}
      {/* ============================================================ */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Profile Details"
          subtitle="Update your personal identification and contact information"
          maxWidth="md"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {profileError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* ID Field: Strictly Non-Editable */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Account Identifier (ID)</span>
                <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  ID cannot be edited
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={displayId}
                  disabled
                  readOnly
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                This unique system identifier cannot be modified.
              </p>
            </div>

            {/* User Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                User Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g. Isravel Admin"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695] focus:border-transparent"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="e.g. isravel@technoschool.in"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695] focus:border-transparent"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="e.g. +971 - 565104104"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695] focus:border-transparent"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Shield className="w-4 h-4" />
                </div>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695] focus:border-transparent cursor-pointer"
                >
                  <option value="admin">Administrator (Full Control)</option>
                  <option value="judge">Official Judge (Evaluation Desk)</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSavingProfile}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSavingProfile}
                className="cursor-pointer min-w-[120px]"
              >
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* 2. CHANGE PASSWORD MODAL (SEPARATE)                          */}
      {/* ============================================================ */}
      {isPasswordModalOpen && (
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Change Password"
          subtitle="Update login security credentials for your account"
          maxWidth="md"
        >
          <form onSubmit={handleSavePassword} className="space-y-4">
            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Password <span className="text-slate-400 font-normal">(if required)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordFormData.currentPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordFormData.newPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, newPassword: e.target.value })}
                  placeholder="Minimum 4 characters"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordFormData.confirmPassword}
                  onChange={(e) => setPasswordFormData({ ...passwordFormData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordFormData.newPassword && passwordFormData.confirmPassword && (
                <p className={`text-[10px] mt-1 font-semibold flex items-center gap-1 ${
                  passwordFormData.newPassword === passwordFormData.confirmPassword ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {passwordFormData.newPassword === passwordFormData.confirmPassword ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(false)}
                disabled={isSavingPassword}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="orange"
                size="sm"
                disabled={isSavingPassword}
                className="cursor-pointer min-w-[140px]"
              >
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
