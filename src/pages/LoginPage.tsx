import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TechnoLogo } from '../components/common/TechnoLogo';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Eye,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  Trophy,
  CheckCircle2,
  Radio
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAs, navigate } = useApp();
  const [email, setEmail] = useState('admin@technoschool.in');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs('admin');
  };

  return (
    <div className="min-h-screen bg-[#F6F9FD] flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-[#003B7A] text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#F36C21] animate-pulse" />
        <span>TECHNO TALENT FEAST 2026 — LIVE COMPETITION MANAGEMENT PLATFORM</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          {/* Left Column: Brand Hero Showcase */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#0057B8] via-[#004899] to-[#003B7A] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#F36C21]/15 blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <TechnoLogo variant="white" size="lg" />
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-blue-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F36C21]" />
                  Grand Edition
                </span>
              </div>

              <div className="mt-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-orange-200 border border-white/15 text-xs font-bold tracking-wide uppercase mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#F36C21]" />
                  Powered by TechnoSchool
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  TECHNO TALENT <span className="text-[#F36C21]">FEAST</span>
                </h1>
                <p className="text-blue-100 text-sm mt-3 leading-relaxed">
                  Manage competitions, evaluate student talent with dynamic rubrics, and track leaderboard rankings in real time.
                </p>
              </div>

              {/* Key Features List */}
              <div className="mt-8 space-y-3">
                {[
                  'Live multi-criteria scoring with automatic calculation',
                  'Instant real-time leaderboard and stadium projector view',
                  'Role-based security for Admins, Judges, and Schools',
                  'Comprehensive analytics and official verified certificates'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs text-blue-100">
                    <CheckCircle2 className="w-4 h-4 text-[#F36C21] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Stat Ticker */}
            <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-white">1,248</p>
                <p className="text-[11px] text-blue-200 font-medium mt-0.5">Participants</p>
              </div>
              <div>
                <p className="text-2xl font-black text-[#F36C21]">42</p>
                <p className="text-[11px] text-blue-200 font-medium mt-0.5">Schools</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">12</p>
                <p className="text-[11px] text-blue-200 font-medium mt-0.5">Competitions</p>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card & Demo Quick Access */}
          <div className="lg:col-span-6 p-8 lg:p-12 flex flex-col justify-between bg-white">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Account Sign In
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter your credentials or use 1-click demo access below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0057B8]/20 focus:border-[#0057B8] transition-all"
                      placeholder="name@technoschool.in"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <a href="#forgot" className="text-xs font-semibold text-[#0057B8] hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F6F9FD] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0057B8]/20 focus:border-[#0057B8] transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0057B8] focus:ring-[#0057B8]"
                    />
                    <span className="text-xs text-slate-600 font-medium">Remember this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#0057B8] hover:bg-[#004899] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-blue-900/15 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <span>LOGIN TO WORKSPACE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* 1-Click Demo Profiles for Manager Presentation */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Select Demo Persona
                </span>
                <span className="text-[11px] font-semibold text-[#F36C21]">Instant Launch</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => loginAs('admin')}
                  className="p-3 rounded-xl border border-blue-200 bg-[#EAF3FF]/60 hover:bg-[#EAF3FF] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#0057B8] text-white flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#003B7A] group-hover:text-[#0057B8]">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Full Command Center</p>
                </button>

                <button
                  onClick={() => loginAs('judge')}
                  className="p-3 rounded-xl border border-orange-200 bg-[#FFF3EC]/70 hover:bg-[#FFF3EC] text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#F36C21] text-white flex items-center justify-center">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-amber-900 group-hover:text-[#F36C21]">
                      Judge Priya
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Robotics Scoring Panel</p>
                </button>

                <button
                  onClick={() => loginAs('judge')}
                  className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-50 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#0057B8] text-white flex items-center justify-center">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      Juror Tariq
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Smart City & IoT Track</p>
                </button>

                <button
                  onClick={() => navigate('live')}
                  className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <Radio className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-900">
                      Live Scoreboard
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">Projector Display</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white">
        © 2026 TechnoSchool. All rights reserved. Techno Talent Feast Platform.
      </div>
    </div>
  );
};
