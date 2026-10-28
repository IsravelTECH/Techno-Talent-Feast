import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TechnoLogo } from '../components/common/TechnoLogo';
import {
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#F7FCFB] flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-[#0B2545] text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FD5E01] animate-pulse" />
        <span>TECHNO TALENT FEST 2026 — LIVE COMPETITION MANAGEMENT PLATFORM</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Brand Hero Showcase */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#03A695] via-[#004899] to-[#0B2545] p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#FD5E01]/15 blur-2xl pointer-events-none" />

            {/* Top Logo & Badge */}
            <div className="flex items-center justify-between relative z-10">
              <TechnoLogo variant="white" size="lg" />
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-blue-100 flex items-center gap-1.5 shadow-xs backdrop-blur-xs">
                <span className="w-2 h-2 rounded-full bg-[#FD5E01] animate-pulse" />
                Grand Edition
              </span>
            </div>

            {/* Middle Content Hero */}
            <div className="my-auto py-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-orange-200 border border-white/15 text-[11px] font-bold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#FD5E01]" />
                Powered by TechnoSchool
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                TECHNO TALENT <span className="text-[#FD5E01]">FEST</span>
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed">
                Manage competitions, evaluate student talent with dynamic rubrics, and track leaderboard rankings in real time.
              </p>

              {/* Key Features List */}
              <div className="mt-5 space-y-2 hidden sm:block">
                {[
                  'Live multi-criteria scoring with automatic 100-point calculation',
                  'Instant real-time leaderboard and administrator review',
                  'Strict 2-role architecture: Administration and Judges only',
                  'Instant live synchronization across all competition arenas'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-blue-100 bg-white/5 border border-white/10 rounded-xl px-3 py-2 backdrop-blur-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#FD5E01] shrink-0" />
                    <span className="leading-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Anchor */}
            <div className="pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-200 relative z-10">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Championship Portal
              </span>
              <span className="font-semibold text-white/80">Dubai, UAE • 2026</span>
            </div>
          </div>

          {/* Right Column: Sign In Workspace */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
            <div className="w-full max-w-sm mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Account Sign In
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Enter your verified credentials to access your competition workspace
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
                    Username (Judge ID) or Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695] transition-all"
                      placeholder="e.g. JDG-01 or admin@technoschool.in"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695] transition-all"
                      placeholder="••••••••••••"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
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
                  className="w-full py-3 px-4 bg-[#03A695] hover:bg-[#008C7E] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-teal-900/15 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
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

              {/* Official Security Notice */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-[#03A695]" />
                  Encrypted Competition Session
                </span>
                <span className="font-semibold text-slate-500">TTF 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-slate-500 border-t border-slate-200/60 bg-white">
        © 2026 TechnoSchool. All rights reserved. Techno Talent Fest Platform.
      </div>
    </div>
  );
};
