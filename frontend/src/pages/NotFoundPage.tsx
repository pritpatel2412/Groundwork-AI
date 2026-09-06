import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#ECEDEE] text-[#232427] flex flex-col justify-between selection:bg-[#E34A32]/20 selection:text-[#E34A32]">
      {/* Header */}
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

      {/* Main 404 Card */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-[32px] border border-black/10 p-8 sm:p-10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_45px_-20px_rgba(35,36,39,0.12)] text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E34A32]/10 text-[#E34A32] text-[11px] font-mono font-semibold mb-3 border border-[#E34A32]/20">
            <span>ERROR 404 • ROUTE UNMAPPED</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#232427] mb-2 font-sans">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#55575c] leading-relaxed mb-8">
            The neural route you requested does not exist or has been relocated to another workspace coordinate.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard"
              className="flex-1 py-3 px-4 rounded-full bg-[#232427] hover:bg-[#171719] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <Home className="w-4 h-4 text-[#E34A32]" />
              <span>Go to Dashboard</span>
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-full bg-white hover:bg-[#F4F5F5] border border-black/10 text-[#232427] font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Landing Page</span>
            </Link>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-[11px] font-mono text-[#55575c]">
        GROUNDWORK AI • SECURE AUDITED WORKSPACES
      </footer>
    </div>
  );
};
