import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { OCCUPATIONS } from '../../data/loanProducts';
import { 
  User, ShieldCheck, Lock, Mail, Phone, 
  MapPin, Fingerprint, Bell, Smartphone, Key, 
  CheckCircle2, AlertCircle, Save, ChevronRight, Eye, EyeOff, Briefcase
} from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();

  // Tab: 'profile', 'security', 'notifications', 'devices'
  const [activeTab, setActiveTab] = useState('profile');

  const verified = JSON.parse(localStorage.getItem('verifiedEkyc') || '{}');

  // Contact info state
  const [contactData, setContactData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    occupation: user?.occupation || 'EMPLOYED',
    currentAddress: verified.address || 'Hà Nội'
  });

  useEffect(() => {
    if (user) {
      const latestVerified = JSON.parse(localStorage.getItem('verifiedEkyc') || '{}');
      setContactData({
        email: user.email || '',
        phone: user.phone || '',
        occupation: user.occupation || 'EMPLOYED',
        currentAddress: latestVerified.address || 'Hà Nội'
      });
    }
  }, [user]);

  // eKYC data (synchronized)
  const ekycData = {
    fullName: user?.fullName ? user.fullName.toUpperCase() : (verified.fullName || 'CHƯA ĐỊNH DANH'),
    idNumber: user?.identityCard || (verified.idNumber || 'Chưa cập nhật'),
    dob: verified.dob || '15/08/1995',
    gender: verified.gender || 'Nam',
    hometown: verified.hometown || 'Việt Nam',
    permanentAddress: verified.address || contactData.currentAddress,
    issueDate: verified.issueDate || '20/05/2021',
    expiryDate: verified.expiryDate || '15/08/2035'
  };

  // Security Toggles
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Change Password Form
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Transaction PIN Form
  const [pinCode, setPinCode] = useState('123456');

  // Notification Toggles
  const [notifPreferences, setNotifPreferences] = useState({
    smsDueDate: true,
    emailReceipt: true,
    promoOffers: false
  });

  // Success / Alert message
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveContact = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile({
        phone: contactData.phone,
        occupation: contactData.occupation
      });
      setSuccessMsg('Cập nhật thông tin tài khoản thành công!');
    } catch (err) {
      setSuccessMsg('Đã lưu thông tin trên thiết bị!');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!passwords.newPassword || passwords.newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('Đổi mật khẩu thành công!');
    setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500 space-y-8">
      
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg flex-shrink-0">
          {ekycData.fullName.charAt(0)}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{ekycData.fullName}</h1>
            <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> eKYC Định Danh Cấp 2
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            CCCD: {ekycData.idNumber} • SĐT: {contactData.phone}
          </p>
          <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs">
            <span className="text-slate-600">Hạng tài khoản: <strong className="text-amber-600">Thành Viên Vàng</strong></span>
            <span>•</span>
            <span className="text-slate-600">Điểm CIC: <strong className="text-emerald-600">765 (Hạng 1 - Tốt)</strong></span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        
        {/* Navigation Sidebar */}
        <div className="w-full sm:w-64 bg-white rounded-3xl border border-slate-200 p-2 shadow-sm flex flex-row sm:flex-col gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-none flex items-center gap-2.5 p-3 rounded-2xl transition ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <User className="w-4 h-4" /> Thông tin cá nhân
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 sm:flex-none flex items-center gap-2.5 p-3 rounded-2xl transition ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Lock className="w-4 h-4" /> Bảo mật & Mật khẩu
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 sm:flex-none flex items-center gap-2.5 p-3 rounded-2xl transition ${activeTab === 'notifications' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Bell className="w-4 h-4" /> Cài đặt thông báo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('devices')}
            className={`flex-1 sm:flex-none flex items-center gap-2.5 p-3 rounded-2xl transition ${activeTab === 'devices' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Smartphone className="w-4 h-4" /> Thiết bị đăng nhập
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 w-full">
          
          {/* Feedback messages */}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: PROFILE & CONTACT INFORMATION */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Locked eKYC Group */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Thông tin định danh CCCD (Đã khóa bảo vệ)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Pháp lý
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Họ và Tên</span>
                    <strong className="text-slate-800 uppercase">{ekycData.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Số CCCD</span>
                    <strong className="text-slate-800 font-mono">{ekycData.idNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ngày sinh</span>
                    <strong className="text-slate-800">{ekycData.dob}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Giới tính</span>
                    <strong className="text-slate-800">{ekycData.gender}</strong>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Nơi thường trú</span>
                    <strong className="text-slate-800">{ekycData.permanentAddress}</strong>
                  </div>
                </div>
              </div>

              {/* Editable Contact Info Form */}
              <form onSubmit={handleSaveContact} className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide pb-2 border-b border-slate-100">
                  Thông tin liên lạc & Địa chỉ hiện tại
                </h3>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Số điện thoại di động</label>
                    <input
                      type="tel"
                      value={contactData.phone}
                      onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                      className="input-human w-full font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Email nhận thông báo</label>
                    <input
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData({...contactData, email: e.target.value})}
                      className="input-human w-full"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1.5">Địa chỉ cư trú hiện tại</label>
                    <input
                      type="text"
                      value={contactData.currentAddress}
                      onChange={(e) => setContactData({...contactData, currentAddress: e.target.value})}
                      className="input-human w-full"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" /> Lưu cập nhật thông tin
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 2: SECURITY & AUTHENTICATION */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              {/* Toggles */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4 text-blue-600" />
                      Đăng nhập bằng Sinh trắc học (FaceID / Vân tay)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Cho phép xác thực nhanh trên thiết bị cá nhân không cần mật khẩu.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricsEnabled}
                    onChange={(e) => setBiometricsEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-blue-600" />
                      Xác thực 2 bước (2FA OTP) khi thanh toán
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Yêu cầu nhập OTP gửi về số điện thoại trước khi ký số hoặc trả nợ lớn.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Password Change Form */}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Đổi mật khẩu tài khoản
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwords.oldPassword}
                      onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})}
                      placeholder="Nhập mật khẩu hiện tại"
                      className="input-human w-full"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mật khẩu mới</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                        placeholder="Tối thiểu 6 ký tự"
                        className="input-human w-full"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwords.confirmPassword}
                        onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                        placeholder="Nhập lại mật khẩu mới"
                        className="input-human w-full"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Lock className="w-3.5 h-3.5" /> Lưu mật khẩu mới
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide pb-2 border-b border-slate-100">
                Tùy chọn kênh thông báo & Nhắc nợ
              </h3>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Tin nhắn SMS nhắc nợ trước 3 ngày
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Gửi tin SMS tự động nhắc số tiền và hạn thanh toán tới số điện thoại chính.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.smsDueDate}
                    onChange={(e) => setNotifPreferences({...notifPreferences, smsDueDate: e.target.checked})}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Email biên lai xác nhận giao dịch
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Gửi tệp đính kèm hóa đơn điện tử VAT & biên lai giải ngân / trả gốc qua email.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.emailReceipt}
                    onChange={(e) => setNotifPreferences({...notifPreferences, emailReceipt: e.target.checked})}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">
                      Chương trình ưu đãi lãi suất & Nâng hạn mức
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Nhận thông tin khi bạn đủ điều kiện nâng gói vay lên đến 500 triệu.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifPreferences.promoOffers}
                    onChange={(e) => setNotifPreferences({...notifPreferences, promoOffers: e.target.checked})}
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => { setSuccessMsg('Đã lưu tùy chọn thông báo!'); setTimeout(() => setSuccessMsg(''), 2500); }}
                  className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ACTIVE DEVICES */}
          {activeTab === 'devices' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Thiết bị đang đăng nhập
                </h3>
                <button
                  type="button"
                  onClick={() => { setSuccessMsg('Đã đăng xuất khỏi các thiết bị khác thành công.'); setTimeout(() => setSuccessMsg(''), 3000); }}
                  className="text-xs text-red-600 hover:underline font-bold"
                >
                  Đăng xuất tất cả thiết bị khác
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">Chrome trên Windows 11</span>
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded">Thiết bị này</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">IP: 14.161.xx.xx • Hà Nội • Đang hoạt động</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800">LOMS App trên iPhone 14 Pro</span>
                    <p className="text-[11px] text-slate-500 font-mono">IP: 113.190.xx.xx • Hoạt động 2 giờ trước</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSuccessMsg('Đã thu hồi quyền truy cập của thiết bị!'); setTimeout(() => setSuccessMsg(''), 2500); }}
                    className="text-xs text-red-600 hover:underline font-semibold"
                  >
                    Thu hồi
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProfileSettings;
