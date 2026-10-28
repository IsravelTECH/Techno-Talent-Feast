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
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithCredentials } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="bg-[#0B2545] border-b border-white/10 text-white py-1.5 sm:py-2 px-3 sm:px-4 text-center text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-2 shadow-xs shrink-0">
        <span className="w-2 h-2 rounded-full bg-[#FD5E01] animate-pulse shrink-0" />
        <span className="tracking-wide">
          <span className="sm:hidden">TECHNO TALENT FEST 2026 • LIVE ARENA</span>
          <span className="hidden sm:inline">TECHNO TALENT FEST 2026 — LIVE COMPETITION MANAGEMENT PLATFORM</span>
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Brand Hero Showcase */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#03A695] via-[#004899] to-[#0B2545] p-5 sm:p-6 lg:p-10 text-white flex flex-col items-center lg:items-start text-center lg:text-left justify-between relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#FD5E01]/15 blur-2xl pointer-events-none" />

            {/* Top Logo & Badge */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-center lg:justify-between gap-2.5 relative z-10">
              <TechnoLogo variant="white" size="md" className="sm:hidden" />
              <TechnoLogo variant="white" size="lg" className="hidden sm:flex" />
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs font-bold text-blue-100 flex items-center gap-1.5 shadow-xs backdrop-blur-xs">
                <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#FD5E01] animate-pulse" />
                Grand Edition • Dubai 2026
              </span>
            </div>

            {/* Middle Content Hero */}
            <div className="w-full py-3 sm:py-5 lg:my-auto relative z-10 flex flex-col items-center lg:items-start">
              <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-orange-200 border border-white/15 text-[11px] font-bold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#FD5E01]" />
                Powered by TechnoSchool
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                TECHNO TALENT <span className="text-[#FD5E01]">FEST</span>
              </h1>
              <p className="text-blue-100/90 text-xs mt-1 font-medium sm:hidden">
                Championship Live Scoring & Evaluation Portal
              </p>
              <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed hidden sm:block">
                Manage competitions, evaluate student talent with dynamic rubrics, and track leaderboard rankings in real time.
              </p>

              {/* Key Features List - Responsive: 2x2 grid on mobile/tablet, stacked list on desktop */}
              <div className="mt-4 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 text-left">
                {[
                  { short: 'Live 100-pt rubric scoring', full: 'Live multi-criteria scoring with automatic 100-point calculation' },
                  { short: 'Real-time live leaderboard', full: 'Instant real-time leaderboard and administrator review' },
                  { short: 'Verified Judge & Admin access', full: 'Strict 2-role architecture: Administration and Judges only' },
                  { short: 'Instant arena synchronization', full: 'Instant live synchronization across all competition arenas' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-blue-100 bg-white/5 border border-white/10 rounded-xl px-2.5 sm:px-3 py-2 backdrop-blur-xs">
                    <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#FD5E01] shrink-0" />
                    <span className="leading-tight font-medium text-[11px] sm:text-xs">
                      <span className="lg:hidden">{feature.short}</span>
                      <span className="hidden lg:inline">{feature.full}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Anchor (Desktop only) */}
            <div className="hidden lg:flex pt-4 border-t border-white/15 items-center justify-between text-[11px] text-blue-200 relative z-10 w-full">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Championship Portal
              </span>
              <span className="font-semibold text-white/80">Dubai, UAE • 2026</span>
            </div>
          </div>

          {/* Right Column: Sign In Workspace */}
          <div className="lg:col-span-6 p-5 sm:p-8 lg:p-12 flex flex-col justify-center bg-white">
            <div className="w-full max-w-sm mx-auto">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Account Sign In
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter your verified credentials to access your competition workspace
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-700 font-medium animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Username (Judge ID) or Email
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#03A695] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695] transition-all"
                      placeholder="e.g. JDG-01 or admin@technoschool.in"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      inputMode="text"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#03A695] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#03A695]/20 focus:border-[#03A695] transition-all"
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      autoCapitalize="none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-slate-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none py-1">
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
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-[#03A695] to-[#008C7E] hover:from-[#008C7E] hover:to-[#004899] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-teal-900/15 hover:shadow-lg hover:shadow-teal-900/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 group"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span>LOGIN TO WORKSPACE</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </button>
              </form>

              {/* Official Security Notice */}
              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#03A695]" />
                  <span>256-Bit SSL Encrypted</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>TTF 2026</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-3 sm:py-4 px-4 text-center text-[11px] sm:text-xs text-slate-500 border-t border-slate-200/60 bg-white shrink-0">
        © 2026 TechnoSchool. All rights reserved. Techno Talent Fest Platform.
      </div>
    </div>
  );
};
