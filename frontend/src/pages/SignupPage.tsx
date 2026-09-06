import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, ArrowRight, Lock, Mail, AlertCircle, Loader2, CheckCircle2, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error, user } = await signUp(email.trim(), password);
      if (error) {
        setError(error.message);
      } else {
        if (user && !user.identities?.length) {
          setError('An account with this email address already exists.');
        } else {
          setSuccessMessage(
            'Account created successfully! If email verification is enabled, please check your inbox.'
          );
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEDEE] text-[#232427] flex flex-col justify-between selection:bg-[#E34A32]/20 selection:text-[#E34A32]">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-black/5 bg-[#F4F5F5]/80 backdrop-blur-md">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-[#55575c] hover:text-[#232427] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#E34A32]" />
          <span>Back to Landing</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative flex items-center h-5 w-7">
            <span className="w-3.5 h-3.5 rounded-full bg-[#232427] block shadow-xs" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#E34A32] block -ml-1.5 shadow-xs" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[#232427] font-sans">
            Groundwork <span className="font-serif-accent italic font-normal text-base text-[#E34A32]">AI</span>
          </span>
        </div>

        <div className="w-20" />
      </header>

      {/* Main Signup Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[32px] border border-black/10 p-8 sm:p-10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_45px_-20px_rgba(35,36,39,0.12)]">
          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E34A32]/10 text-[#E34A32] text-[11px] font-mono font-semibold mb-3 border border-[#E34A32]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NEW ARCHITECT ACCOUNT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#232427] font-sans">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-[#55575c] mt-2">
              Start building dual-verified enterprise architectures with automated citation ledgers
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Success</span>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Sign up failed</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#232427] mb-1.5 font-sans">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#55575c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F4F5F5] border border-black/10 text-sm text-[#232427] placeholder-[#55575c]/60 focus:bg-white focus:outline-none focus:border-[#E34A32] focus:ring-2 focus:ring-[#E34A32]/20 transition font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#232427] mb-1.5 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#55575c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#F4F5F5] border border-black/10 text-sm text-[#232427] placeholder-[#55575c]/60 focus:bg-white focus:outline-none focus:border-[#E34A32] focus:ring-2 focus:ring-[#E34A32]/20 transition font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#55575c] hover:text-[#232427] focus:outline-none p-1 rounded-md transition cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#232427] mb-1.5 font-sans">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#55575c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#F4F5F5] border border-black/10 text-sm text-[#232427] placeholder-[#55575c]/60 focus:bg-white focus:outline-none focus:border-[#E34A32] focus:ring-2 focus:ring-[#E34A32]/20 transition font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#55575c] hover:text-[#232427] focus:outline-none p-1 rounded-md transition cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#E34A32]" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-[#E34A32]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="mt-6 text-center text-xs text-[#55575c]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#E34A32] font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle Footer */}
      <footer className="py-4 text-center text-[11px] font-mono text-[#55575c]">
        GROUNDWORK AI • SECURE AUDITED WORKSPACES • SUPABASE RLS ACTIVE
      </footer>
    </div>
  );
};
