import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, ArrowRight, Mail, AlertCircle, Loader2, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while attempting to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ECEDEE] text-[#232427] flex flex-col justify-between selection:bg-[#E34A32]/20 selection:text-[#E34A32]">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-black/5 bg-[#F4F5F5]/80 backdrop-blur-md">
        <Link
          to="/login"
          className="flex items-center gap-2 text-xs font-semibold text-[#55575c] hover:text-[#232427] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#E34A32]" />
          <span>Back to Sign In</span>
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

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[32px] border border-black/10 p-8 sm:p-10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_45px_-20px_rgba(35,36,39,0.12)]">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E34A32]/10 text-[#E34A32] text-[11px] font-mono font-semibold mb-3 border border-[#E34A32]/20">
              <KeyRound className="w-3.5 h-3.5" />
              <span>CREDENTIAL RECOVERY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#232427] font-sans">
              Reset your password
            </h1>
            <p className="text-xs sm:text-sm text-[#55575c] mt-2">
              Enter your email address and we'll send you instructions to reset your password
            </p>
          </div>

          {success ? (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <span className="font-semibold block mb-1">Check your email</span>
                  <span>
                    We have dispatched a password reset link to <strong>{email}</strong>. Follow the link in that email to choose a new password.
                  </span>
                </div>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-sm transition cursor-pointer shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 text-[#E34A32]" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <div className="flex-1">
                    <span className="font-semibold block mb-0.5">Reset failed</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#232427] mb-1.5 font-sans">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#55575c] absolute left-3.5 top-1/2 -translate-y-1/2" />
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E34A32]" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="w-4 h-4 text-[#E34A32]" />
                  </>
                )}
              </button>

              <div className="mt-6 text-center text-xs text-[#55575c]">
                Remember your password?{' '}
                <Link to="/login" className="text-[#E34A32] font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <footer className="py-4 text-center text-[11px] font-mono text-[#55575c]">
        GROUNDWORK AI • SECURE AUDITED WORKSPACES • SUPABASE RLS ACTIVE
      </footer>
    </div>
  );
};
