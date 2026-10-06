import React from 'react';
import { useApp } from '../context/AppContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Calendar,
  CheckCircle2,
  Sparkles,
  Trophy,
  Lock
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, currentRole, selectedEvent, addToast } = useApp();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
          User Profile & Credentials
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account credentials, role authorization, and event assignment details
        </p>
      </div>

      {/* Main Profile Dossier */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-blue-200 ring-4 ring-blue-50 shadow-md"
          />

          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="text-xl font-black text-slate-900">{currentUser.name}</h2>
              <Badge variant="primary" size="sm">
                {currentRole === 'admin' ? 'Super Administrator' : currentRole === 'judge' ? 'Evaluator' : 'Participant'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {currentUser.title}
            </p>
            <p className="text-xs text-[#0057B8] font-bold mt-1">
              {currentUser.organization}
            </p>
          </div>
        </div>

        {/* Profile Information Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#F6F9FD] border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Email Address
            </span>
            <span className="font-bold text-slate-900 mt-1 block">
              {currentUser.email}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F9FD] border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Contact Number
            </span>
            <span className="font-bold text-slate-900 mt-1 block">
              {currentUser.phone || '+91 98401 23456'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F9FD] border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Active Championship Edition
            </span>
            <span className="font-bold text-[#0057B8] mt-1 block">
              {selectedEvent.name}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#F6F9FD] border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Security Level
            </span>
            <span className="font-bold text-emerald-700 mt-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Verified Multi-Factor Authenticated
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
          <Button
            variant="orange"
            size="sm"
            onClick={() => {
              addToast({
                type: 'success',
                title: 'Profile Updated',
                message: 'Your profile changes have been saved.'
              });
            }}
          >
            Save Profile Preferences
          </Button>
        </div>
      </div>
    </div>
  );
};
