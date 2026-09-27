import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Calculator, FilePlus, LayoutDashboard, 
  ShieldAlert, SlidersHorizontal, Bell, ChevronDown, 
  LogOut, User, Activity, Wallet, History, Users 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 block leading-tight">
                LOMS App
              </span>
              <span className="text-[10px] text-slate-500 font-medium block uppercase tracking-wider">
                Tài Chính & Vay Vốn
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/home" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              Trang Chủ
            </Link>

            {user?.role === 'customer' && (
              <>
                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  Quản lý khoản vay
                </Link>
                <Link to="/apply/ekyc" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  Nộp hồ sơ mới
                </Link>
                <Link to="/payment" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  Thanh toán
                </Link>
              </>
            )}

            {(user?.role === 'admin' || user?.role === 'credit_officer' || user?.role === 'accountant') && (
              <>
                <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  Tổng quan
                </Link>
                <Link to="/admin/los" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                  Thẩm định (LOS)
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/rules" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    Rule Engine
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full pl-1 pr-3 py-1 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-sm font-medium text-slate-700 hidden sm:block">
                    {user.fullName || 'User'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-medium text-slate-900">{user.email}</p>
                      <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                    {user?.role === 'customer' && (
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cài đặt tài khoản</Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
