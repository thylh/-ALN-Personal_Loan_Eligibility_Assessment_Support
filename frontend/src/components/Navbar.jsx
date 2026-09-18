import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Shield, Bell, User, LogOut, ShieldAlert, Calculator, FilePlus, LayoutDashboard, SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user && user.role === 'customer') {
      api.getNotifications().then(res => {
        if (res.success) setNotifications(res.data || []);
      });
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return { name: 'Quản trị viên', bg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' };
      case 'credit_officer':
        return { name: 'Chuyên viên thẩm định', bg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
      case 'customer':
      default:
        return { name: 'Khách hàng cá nhân', bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    }
  };

  const roleInfo = user ? getRoleLabel(user.role) : null;

  return (
    <header className="bg-[#151d2a] border-b border-[#232e42] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight block leading-tight">
                Hệ Thống Vay Vốn
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Thẩm Định & Chấm Điểm Tín Dụng
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/simulator" className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1f293d] transition flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-blue-400" />
              Mô phỏng khoản vay
            </Link>

            {user?.role === 'customer' && (
              <>
                <Link to="/apply" className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1f293d] transition flex items-center gap-1.5">
                  <FilePlus className="w-4 h-4 text-emerald-400" />
                  Nộp hồ sơ vay
                </Link>
                <Link to="/customer" className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1f293d] transition flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  Trang cá nhân
                </Link>
              </>
            )}

            {(user?.role === 'admin' || user?.role === 'credit_officer') && (
              <>
                <Link to="/admin" className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1f293d] transition flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  Báo cáo tổng quan
                </Link>
                <Link to="/admin/applications" className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1f293d] transition flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Thẩm định hồ sơ
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/rules" className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1f293d] transition flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-purple-400" />
                    Cấu hình quy tắc
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Notifications Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => { setShowNotifMenu(!showNotifMenu); setShowUserMenu(false); }}
                  className="p-2 text-slate-300 hover:text-white bg-[#0b0f19] rounded-lg relative border border-[#232e42] hover:bg-[#1f293d] transition"
                  title="Thông báo"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#151d2a] border border-[#232e42] rounded-xl shadow-xl z-50 p-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#232e42]">
                      <span className="text-xs font-bold text-white">Thông báo ({notifications.length})</span>
                      <button onClick={() => setShowNotifMenu(false)} className="text-[11px] text-slate-400 hover:text-white">Đóng</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 mt-2">
                      {notifications.length === 0 ? (
                        <div className="text-xs text-slate-400 text-center py-4">Chưa có thông báo mới.</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className={`p-2.5 rounded-lg border text-xs ${n.read ? 'bg-[#0b0f19]/40 border-[#232e42] text-slate-400' : 'bg-blue-950/40 border-blue-500/30 text-slate-200'}`}>
                            <div className="font-semibold text-white">{n.title}</div>
                            <div className="mt-1 text-[11px] text-slate-300">{n.message}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile / Account Control */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifMenu(false); }}
                  className="flex items-center gap-2.5 bg-[#0b0f19] hover:bg-[#1f293d] border border-[#232e42] rounded-xl px-3 py-1.5 transition text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-semibold text-white leading-tight">{user.fullName}</div>
                    <div className="text-[10px] text-slate-400">{roleInfo?.name}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#151d2a] border border-[#232e42] rounded-xl shadow-xl z-50 p-2 space-y-1">
                    <div className="px-3 py-2 border-b border-[#232e42]">
                      <div className="text-xs font-bold text-white">{user.fullName}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded ${roleInfo?.bg}`}>
                        {roleInfo?.name}
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" /> Đăng nhập
              </Link>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
