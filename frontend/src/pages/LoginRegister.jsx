import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User, Phone, CreditCard, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

export default function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [identityCard, setIdentityCard] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) {
          if (res.user.role === 'customer') navigate('/customer');
          else navigate('/admin');
        } else {
          setError(res.message || 'Email hoặc mật khẩu không chính xác.');
        }
      } else {
        const res = await register({ email, password, fullName, phone, identityCard });
        if (res.success) {
          navigate('/customer');
        } else {
          setError(res.message || 'Đăng ký tài khoản không thành công.');
        }
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ. Vui lòng kiểm tra lại đường truyền.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-[#151d2a] border border-[#232e42] rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Hệ Thống Tín Dụng Cá Nhân</h1>
          <p className="text-xs text-slate-400 mt-1">Cổng đăng nhập & quản lý hồ sơ vay trực tuyến</p>
        </div>

        {/* Clean Segmented Tab Switcher */}
        <div className="flex bg-[#0b0f19] p-1 rounded-xl mb-6 border border-[#232e42]">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${isLogin ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Đăng ký khách vay
          </button>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Họ và tên người vay (*)</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn An"
                    className="w-full bg-[#0b0f19] border border-[#2d3b53] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số điện thoại</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full bg-[#0b0f19] border border-[#2d3b53] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số CCCD (12 số)</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={identityCard}
                      onChange={(e) => setIdentityCard(e.target.value)}
                      placeholder="012345678901"
                      className="w-full bg-[#0b0f19] border border-[#2d3b53] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Địa chỉ Email (*)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full bg-[#0b0f19] border border-[#2d3b53] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu (*)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0b0f19] border border-[#2d3b53] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 font-semibold text-xs text-white rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Đang kết nối...</span>
            ) : (
              <>
                <span>{isLogin ? 'Đăng nhập vào tài khoản' : 'Đăng ký tài khoản'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#232e42] text-center text-[11px] text-slate-400">
          Hệ thống thẩm định tự động và quản lý hồ sơ vay vốn an toàn.
        </div>

      </div>
    </div>
  );
}
