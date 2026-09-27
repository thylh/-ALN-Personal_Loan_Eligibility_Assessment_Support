import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// CUSTOMER PAGES
import Home from './pages/customer/Home';
import LoginRegister from './pages/customer/LoginRegister';
import Ekyc from './pages/customer/Ekyc';
import LoanApplicationForm from './pages/customer/LoanApplicationForm';
import DocumentUpload from './pages/customer/DocumentUpload';
import EContract from './pages/customer/EContract';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import PaymentDisbursement from './pages/customer/PaymentDisbursement';
import TransactionHistory from './pages/customer/TransactionHistory';
import ProfileSettings from './pages/customer/ProfileSettings';
import NotificationCenter from './pages/customer/NotificationCenter';
import SupportHelp from './pages/customer/SupportHelp';
import Referral from './pages/customer/Referral';

// ADMIN PAGES
import AdminDashboard from './pages/admin/AdminDashboard';
import LosList from './pages/admin/LosList';
import UnderwritingDetail from './pages/admin/UnderwritingDetail';
import LmsList from './pages/admin/LmsList';
import DisbursementCommand from './pages/admin/DisbursementCommand';
import CollectionReconciliation from './pages/admin/CollectionReconciliation';
import DebtCollection from './pages/admin/DebtCollection';
import CrmCustomerList from './pages/admin/CrmCustomerList';
import IamManagement from './pages/admin/IamManagement';
import ProductConfig from './pages/admin/ProductConfig';
import RuleEngineConfig from './pages/admin/RuleEngineConfig';
import TemplateConfig from './pages/admin/TemplateConfig';
import ReportsBi from './pages/admin/ReportsBi';
import AuditLogs from './pages/admin/AuditLogs';

import './App.css';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/home" replace />;
  if (user.role === 'customer') return <Navigate to="/dashboard" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<LoginRegister />} />
              <Route path="/support" element={<SupportHelp />} />
              <Route path="/referral" element={<Referral />} />

              {/* CUSTOMER PORTAL ROUTES */}
              <Route path="/apply/ekyc" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Ekyc />
                </ProtectedRoute>
              } />
              <Route path="/apply/form" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <LoanApplicationForm />
                </ProtectedRoute>
              } />
              <Route path="/apply/upload" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <DocumentUpload />
                </ProtectedRoute>
              } />
              <Route path="/apply/contract" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <EContract />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/payment" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <PaymentDisbursement />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <TransactionHistory />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <ProfileSettings />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <NotificationCenter />
                </ProtectedRoute>
              } />

              {/* ADMIN & OPERATIONS PORTAL ROUTES */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['credit_officer', 'admin', 'accountant', 'collection']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/los" element={
                <ProtectedRoute allowedRoles={['credit_officer', 'admin']}>
                  <LosList />
                </ProtectedRoute>
              } />
              <Route path="/admin/los/:id" element={
                <ProtectedRoute allowedRoles={['credit_officer', 'admin']}>
                  <UnderwritingDetail />
                </ProtectedRoute>
              } />
              <Route path="/admin/lms" element={
                <ProtectedRoute allowedRoles={['admin', 'accountant']}>
                  <LmsList />
                </ProtectedRoute>
              } />
              <Route path="/admin/disbursement" element={
                <ProtectedRoute allowedRoles={['admin', 'accountant']}>
                  <DisbursementCommand />
                </ProtectedRoute>
              } />
              <Route path="/admin/collection-reconciliation" element={
                <ProtectedRoute allowedRoles={['admin', 'accountant']}>
                  <CollectionReconciliation />
                </ProtectedRoute>
              } />
              <Route path="/admin/debt-collection" element={
                <ProtectedRoute allowedRoles={['admin', 'collection']}>
                  <DebtCollection />
                </ProtectedRoute>
              } />
              <Route path="/admin/crm" element={
                <ProtectedRoute allowedRoles={['admin', 'credit_officer', 'collection']}>
                  <CrmCustomerList />
                </ProtectedRoute>
              } />
              <Route path="/admin/iam" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <IamManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProductConfig />
                </ProtectedRoute>
              } />
              <Route path="/admin/rules" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RuleEngineConfig />
                </ProtectedRoute>
              } />
              <Route path="/admin/templates" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TemplateConfig />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute allowedRoles={['admin', 'credit_officer', 'accountant']}>
                  <ReportsBi />
                </ProtectedRoute>
              } />
              <Route path="/admin/audit-logs" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AuditLogs />
                </ProtectedRoute>
              } />

            </Routes>
          </main>
          <footer className="py-6 border-t border-slate-200 bg-white text-center text-sm text-slate-500 mt-auto">
            Hệ Thống Vay Vốn (Loan Origination & Management System) © 2026
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
