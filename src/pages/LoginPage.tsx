import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TechnoLogo } from '../components/common/TechnoLogo';
import { api } from '../services/api';
import {
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials } = useApp();
  const [email, setEmail] = useState('isravel@gmail.com');
  const [password, setPassword] = useState('123456');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [liveStats, setLiveStats] = useState<{
    totalTeams: number;
    totalSchools: number;
    totalCategories: number;
  }>({
    totalTeams: 576,
    totalSchools: 48,
    totalCategories: 6
  });

  useEffect(() => {
    let isMounted = true;
    api.getDashboardStats()
      .then((res) => {
        if (isMounted && res && res.stats) {
          setLiveStats({
            totalTeams: res.stats.totalTeams || 576,
            totalSchools: res.stats.totalSchools || 48,
            totalCategories: (res.stats as any).totalCategories || 6
          });
        }
      })
      .catch((err) => {
        console.warn('Dashboard stats ticker fallback:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await loginWithCredentials(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handlePersonaClick = async (targetEmail: string, targetPass: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setError(null);
    setLoading(true);
    const res = await loginWithCredentials(targetEmail, targetPass);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Could not authenticate persona.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FCFB] flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-[#0B2545] text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FD5E01] animate-pulse" />
        <span>TECHNO TALENT FEAST 2026 — LIVE COMPETITION MANAGEMENT PLATFORM</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0 lg:min-h-[620px]">
          {/* Left Column: Brand Hero Showcase */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#03A695] via-[#004899] to-[#0B2545] p-5 sm:p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#FD5E01]/15 blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between">
                <TechnoLogo variant="white" size="lg" />
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-blue-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FD5E01]" />
                  Grand Edition
                </span>
              </div>

              <div className="mt-6 sm:mt-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-orange-200 border border-white/15 text-xs font-bold tracking-wide uppercase mb-3 sm:mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-[#FD5E01]" />
                  Powered by TechnoSchool
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                  TECHNO TALENT <span className="text-[#FD5E01]">FEAST</span>
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">
                  Manage competitions, evaluate student talent with dynamic rubrics, and track leaderboard rankings in real time.
                </p>
              </div>

              {/* Key Features List (hidden on small mobile screens to bring form into immediate view) */}
              <div className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3 hidden sm:block">
                {[
                  'Live multi-criteria scoring with automatic 100-point calculation',
                  'Instant real-time leaderboard and administrator review',
                  'Strict 2-role architecture: Administration and Judges only',
                  'Real-time persistence backed by MongoDB Atlas'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs text-blue-100">
                    <CheckCircle2 className="w-4 h-4 text-[#FD5E01] shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Stat Ticker */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-4 text-center">
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {liveStats.totalTeams.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-[11px] text-blue-200 font-medium mt-0.5">Enrolled Teams</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-[#FD5E01]">
                  {liveStats.totalSchools}
                </p>
                <p className="text-[10px] sm:text-[11px] text-blue-200 font-medium mt-0.5">Member Schools</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {liveStats.totalCategories}
                </p>
                <p className="text-[10px] sm:text-[11px] text-blue-200 font-medium mt-0.5">Competitions</p>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card & Demo Quick Access */}
          <div className="lg:col-span-6 p-5 sm:p-8 lg:p-12 flex flex-col justify-between bg-white">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Account Sign In
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Enter your verified credentials or select quick-launch persona below
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 font-medium animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email / Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695] transition-all"
                      placeholder="isravel@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">Default: 123456</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F7FCFB] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695] transition-all"
                      placeholder="••••••"
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
                      className="w-4 h-4 rounded border-slate-300 text-[#03A695] focus:ring-[#03A695]"
                    />
                    <span className="text-xs text-slate-600 font-medium">Remember this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#03A695] hover:bg-[#004899] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-teal-900/15 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span>LOGIN TO WORKSPACE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Demo Personas with MongoDB Atlas credentials */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Verified Competition Personas
                </span>
                <span className="text-[11px] font-semibold text-[#FD5E01]">Atlas MongoDB Connected</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handlePersonaClick('isravel@gmail.com', '123456')}
                  className="p-3 sm:p-3.5 rounded-2xl border-2 border-teal-200 bg-[#E6F7F5]/80 hover:bg-[#E6F7F5] text-left transition-all group cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#03A695] text-white flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-[#0B2545] group-hover:text-[#03A695] block truncate">
                        ADMINISTRATION
                      </span>
                      <p className="text-[10px] text-slate-500 font-semibold truncate">isravel@gmail.com</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handlePersonaClick('judge@gmail.com', '123456')}
                  className="p-3 sm:p-3.5 rounded-2xl border-2 border-orange-200 bg-[#FFF3EC]/90 hover:bg-[#FFF3EC] text-left transition-all group cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FD5E01] text-white flex items-center justify-center font-bold shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-amber-950 group-hover:text-[#FD5E01] block truncate">
                        JUDGE ROLE
                      </span>
                      <p className="text-[10px] text-slate-500 font-semibold truncate">judge@gmail.com</p>
                    </div>
                  </div>
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
