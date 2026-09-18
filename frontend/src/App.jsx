import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginRegister from './pages/LoginRegister';
import CustomerDashboard from './pages/CustomerDashboard';
import LoanSimulator from './pages/LoanSimulator';
import ApplyLoanMultiStep from './pages/ApplyLoanMultiStep';
import ApplicationDetailView from './pages/ApplicationDetailView';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplicationsList from './pages/AdminApplicationsList';
import AdminScoringRules from './pages/AdminScoringRules';
import './App.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-400">Đang tải ứng dụng...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/simulator" replace />;
  if (user.role === 'customer') return <Navigate to="/customer" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginRegister />} />
              <Route path="/simulator" element={<LoanSimulator />} />
              
              {/* Customer Routes */}
              <Route path="/customer" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/apply" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ApplyLoanMultiStep />
                </ProtectedRoute>
              } />

              {/* Shared Detail View */}
              <Route path="/application/:id" element={
                <ProtectedRoute>
                  <ApplicationDetailView />
                </ProtectedRoute>
              } />

              {/* Admin & Officer Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['credit_officer', 'admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/applications" element={
                <ProtectedRoute allowedRoles={['credit_officer', 'admin']}>
                  <AdminApplicationsList />
                </ProtectedRoute>
              } />
              <Route path="/admin/rules" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminScoringRules />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <footer className="py-6 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
            Hệ Thống Vay Vốn & Thẩm Định Tín Dụng Cá Nhân (MERN Stack Scratch Architecture) © 2026
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
