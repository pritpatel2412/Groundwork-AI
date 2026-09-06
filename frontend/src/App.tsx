import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SprintForgeLanding } from './components/SprintForgeLanding';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { NotFoundPage } from './pages/NotFoundPage';

const LandingWrapper: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <SprintForgeLanding
      onOpenCopilot={() => {
        if (user) {
          navigate('/dashboard');
        } else {
          navigate('/signup');
        }
      }}
    />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingWrapper />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes requiring Supabase authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workspace/:id" element={<WorkspacePage />} />
          </Route>

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
