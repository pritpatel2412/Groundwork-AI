import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#ECEDEE] text-[#232427]">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex items-center h-6 w-8">
            <span className="w-4 h-4 rounded-full bg-[#232427] block shadow-xs" />
            <span className="w-4 h-4 rounded-full bg-[#E34A32] block -ml-2 shadow-xs" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-[#232427] font-sans">
            Groundwork <span className="font-serif-accent italic font-normal text-xl text-[#E34A32]">Copilot</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#55575c]">
          <Loader2 className="w-4 h-4 animate-spin text-[#E34A32]" />
          <span>Authenticating cognitive session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
