import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Phone, Lock, Mail, User, ShieldCheck, ArrowRight, 
  RotateCcw, Fingerprint, ScanFace, AlertTriangle, 
  CheckCircle2, Sparkles, KeyRound, Eye, EyeOff, Briefcase
} from 'lucide-react';
import { OCCUPATIONS } from '../../data/loanProducts';

const LoginRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, quickDemoLogin } = useAuth();

  // Mode: 'login_phone' (Phone+OTP), 'login_password' (Email+Password), 'register'
  const [authMode, setAuthMode] = useState('login_phone');
  
  // Step for OTP flow: 'enter_phone' -> 'enter_otp'
  const [otpStep, setOtpStep] = useState('enter_phone');
  const [phone, setPhone] = useState('0901234567');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isCounting, setIsCounting] = useState(false);
  const [wrongOtpAttempts, setWrongOtpAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockSeconds, setBlockSeconds] = useState(0);

  // Email / Password Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form
  const [regData, setRegData] = useState({
    fullName: '',
    phone: '',
    email: '',
    identityCard: '',
    occupation: '',
    password: '',
    confirmPassword: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [biometricScanning, setBiometricScanning] = useState(false);

  const otpInputsRef = useRef([]);

  // Timer effect for OTP resend countdown
  useEffect(() => {
    let timer;
    if (isCounting && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsCounting(false);
    }
    return () => clearInterval(timer);
  }, [isCounting, countdown]);

  // Timer effect for 15-min lockout when wrong attempts >= 5
  useEffect(() => {
    let blockTimer;
    if (isBlocked && blockSeconds > 0) {
      blockTimer = setInterval(() => {
        setBlockSeconds(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            setWrongOtpAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(blockTimer);
  }, [isBlocked, blockSeconds]);

  // Send OTP
  const handleRequestOtp = (e) => {
    e?.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (10 số).');
      return;
    }
    if (isBlocked) {
      setErrorMsg(`Tài khoản tạm khóa do nhập sai OTP nhiều lần. Thử lại sau ${Math.floor(blockSeconds / 60)}p ${blockSeconds % 60}s.`);
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpStep('enter_otp');
      setIsCounting(true);
      setCountdown(60);
      setSuccessMsg(`Mã OTP 6 số đã được gửi đến SĐT ${phone}. Mã thử nghiệm: 123456`);
      // Auto focus first OTP input
      setTimeout(() => otpInputsRef.current[0]?.focus(), 100);
    }, 600);
  };

  // OTP input change handler with auto-focus to next box
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(paste)) {
      const digits = paste.split('');
      setOtpDigits(digits);
      otpInputsRef.current[5]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    if (isBlocked) {
      setErrorMsg('Tài khoản bị tạm khóa 15 phút do nhập sai OTP 5 lần.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    // Check OTP (Demo OTP is 123456)
    setTimeout(async () => {
      if (code === '123456') {
        setLoading(false);
        // Login as customer
        await quickDemoLogin('customer');
        navigate('/home');
      } else {
        const nextAttempts = wrongOtpAttempts + 1;
        setWrongOtpAttempts(nextAttempts);
        setLoading(false);

        if (nextAttempts >= 5) {
          setIsBlocked(true);
          setBlockSeconds(15 * 60); // 15 minutes lockout
          setErrorMsg('Bạn đã nhập sai OTP 5 lần liên tiếp! Hệ thống tạm khóa 15 phút vì lý do an toàn.');
        } else {
          setErrorMsg(`Mã OTP không chính xác. Bạn còn ${5 - nextAttempts} lần thử.`);
        }
      }
    }, 600);
  };

  // Quick auto-fill demo OTP
  const fillDemoOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
    setErrorMsg('');
  };

  // Login Email/Password
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        if (res.user.role === 'customer') {
          navigate('/home');
        } else {
          navigate('/admin');
        }
      } else {
        setErrorMsg(res.message || 'Đăng nhập thất bại.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Không thể kết nối đến máy chủ.');
    }
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regData.fullName || !regData.email || !regData.password) {
      setErrorMsg('Vui lòng điền đủ các trường bắt buộc.');
      return;
    }
    if (!regData.occupation) {
      setErrorMsg('Vui lòng chọn thông tin Nghề nghiệp của bạn để hệ thống đề xuất gói vay phù hợp.');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await register({
        fullName: regData.fullName,
        email: regData.email,
        phone: regData.phone,
        identityCard: regData.identityCard,
        occupation: regData.occupation,
        password: regData.password
      });
      setLoading(false);
      if (res.success) {
        // Kiểm tra nếu trước đó đã chọn gói vay từ trang chi tiết
        const savedProposal = localStorage.getItem('selectedLoanProposal');
        if (savedProposal) {
          navigate('/apply/ekyc');
        } else {
          // Điều hướng về Trang chủ để hiển thị các gói vay đề xuất theo nghề nghiệp vừa chọn
          navigate('/home', { state: { justRegistered: true, occupation: regData.occupation } });
        }
      } else {
        setErrorMsg(res.message || 'Đăng ký không thành công.');
      }
    } catch {
      setLoading(false);
      setErrorMsg('Lỗi đăng ký tài khoản.');
    }
  };

  // Biometrics simulation
  const handleBiometricAuth = () => {
    setBiometricScanning(true);
    setErrorMsg('');
    setTimeout(async () => {
      setBiometricScanning(false);
      await quickDemoLogin('customer');
      navigate('/home');
    }, 1500);
  };

  // 1-Click Fast Pass
  const handleFastPass = async (role) => {
    setLoading(true);
    await quickDemoLogin(role);
    setLoading(false);
    if (role === 'customer') navigate('/home');
    else navigate('/admin');
  };

  return (
    <div className="max-w-xl mx-auto py-4 sm:py-8 animate-in fade-in duration-500">
      
      {/* Card Header */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          Hệ Thống Xác Thực Định Danh Bảo Mật
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {authMode === 'register' ? 'Đăng Ký Tài Khoản Mới' : 'Đăng Nhập Khách Hàng'}
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm">
          {authMode === 'register' 
            ? 'Khởi tạo tài khoản để nhận khoản vay ưu đãi ngay trong ngày' 
            : 'Xác thực nhanh bằng OTP di động hoặc tài khoản bảo mật'}
        </p>
      </div>

      {/* Main Authentication Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setAuthMode('login_phone'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition ${authMode === 'login_phone' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            SĐT & OTP
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('login_password'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition ${authMode === 'login_password' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Email & Mật khẩu
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex-1 py-2.5 rounded-xl transition ${authMode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đăng ký mới
          </button>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* Alerts */}
          {errorMsg && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* TAB 1: PHONE + OTP FLOW */}
          {authMode === 'login_phone' && (
            <div className="space-y-6">
              
              {otpStep === 'enter_phone' && (
                <form onSubmit={handleRequestOtp} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                      Số điện thoại di động
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0901234567"
                        className="input-human w-full pl-10 text-base font-semibold text-slate-900 tracking-wider"
                        disabled={isBlocked}
                        required
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Hệ thống sẽ gửi mã xác thực OTP 6 số qua SMS về số điện thoại này.
                    </span>
                  </div>

                  {isBlocked && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                      <span>Đang khóa do sai OTP 5 lần</span>
                      <strong className="font-bold text-red-600">
                        {Math.floor(blockSeconds / 60)}:{blockSeconds % 60 < 10 ? '0' : ''}{blockSeconds % 60}
                      </strong>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || isBlocked}
                    className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? 'Đang gửi mã...' : 'Nhận mã xác thực OTP'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {otpStep === 'enter_otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-500">Mã 6 chữ số đã gửi tới số</p>
                    <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-2">
                      <span>{phone}</span>
                      <button
                        type="button"
                        onClick={() => { setOtpStep('enter_phone'); setOtpDigits(['','','','','','']); setErrorMsg(''); }}
                        className="text-xs text-blue-600 hover:underline font-semibold"
                      >
                        Đổi SĐT
                      </button>
                    </div>
                  </div>

                  {/* 6 Digit Inputs */}
                  <div>
                    <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (otpInputsRef.current[index] = el)}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-11 sm:w-13 h-13 text-center text-xl font-extrabold rounded-xl border border-slate-300 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-3 text-xs">
                      <button
                        type="button"
                        onClick={fillDemoOtp}
                        className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Điền nhanh mã demo (123456)
                      </button>

                      <div className="text-right">
                        {isCounting ? (
                          <span className="text-slate-400">Gửi lại sau ({countdown}s)</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Gửi lại mã OTP
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Wrong attempts counter badge */}
                  {wrongOtpAttempts > 0 && !isBlocked && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 text-center font-medium">
                      Đã nhập sai: <strong>{wrongOtpAttempts}/5</strong> lần. (Khóa 15 phút nếu sai 5 lần).
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || isBlocked}
                    className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? 'Đang xác thực...' : 'Xác thực & Tiến hành vay vốn'}
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Biometrics Mock Login Option */}
              <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
                <p className="text-xs text-slate-500 mb-3 font-medium">Hoặc đăng nhập bằng sinh trắc học</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    disabled={biometricScanning}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <ScanFace className="w-4 h-4 text-blue-600" />
                    FaceID
                  </button>
                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    disabled={biometricScanning}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-2 transition"
                  >
                    <Fingerprint className="w-4 h-4 text-blue-600" />
                    TouchID / Vân tay
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EMAIL & PASSWORD FLOW */}
          {authMode === 'login_password' && (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input-human w-full pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Mật khẩu
                  </label>
                  <button type="button" className="text-xs text-blue-600 hover:underline">
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu của bạn"
                    className="input-human w-full pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW USER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Họ và Tên (như trên CCCD)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regData.fullName}
                    onChange={(e) => setRegData({...regData, fullName: e.target.value})}
                    placeholder="NGUYỄN VĂN AN"
                    className="input-human w-full pl-10 uppercase font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={regData.phone}
                    onChange={(e) => setRegData({...regData, phone: e.target.value})}
                    placeholder="0901234567"
                    className="input-human w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Số CCCD (12 số)
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    value={regData.identityCard}
                    onChange={(e) => setRegData({...regData, identityCard: e.target.value})}
                    placeholder="001099123456"
                    className="input-human w-full font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={regData.email}
                  onChange={(e) => setRegData({...regData, email: e.target.value})}
                  placeholder="nguyenvanan@gmail.com"
                  className="input-human w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                  <span>Nghề nghiệp <span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-blue-600 font-semibold lowercase">Đề xuất gói vay phù hợp</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={regData.occupation}
                    onChange={(e) => setRegData({...regData, occupation: e.target.value})}
                    className="input-human w-full pl-10 pr-8 bg-white font-medium text-slate-800"
                    required
                  >
                    <option value="">-- Chọn nghề nghiệp của bạn --</option>
                    {OCCUPATIONS.map((occ) => (
                      <option key={occ.id} value={occ.id}>
                        {occ.label}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Thông tin phân loại người dùng (User Segmentation) để hệ thống tự động đề xuất gói vay tối ưu.
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={regData.password}
                    onChange={(e) => setRegData({...regData, password: e.target.value})}
                    placeholder="Tối thiểu 6 ký tự"
                    className="input-human w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})}
                    placeholder="Nhập lại mật khẩu"
                    className="input-human w-full"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký & Bắt đầu eKYC'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

        </div>

        {/* FAST-PASS DEMO LOGIN FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              Đăng nhập nhanh tài khoản mẫu (Demo Fast-Pass):
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFastPass('customer')}
              className="p-2.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl text-left transition group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Khách Hàng</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">customer@demo.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleFastPass('credit_officer')}
              className="p-2.5 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-xl text-left transition group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">Thẩm Định</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">officer@demo.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleFastPass('admin')}
              className="p-2.5 bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 rounded-xl text-left transition group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600">Admin Quản Trị</div>
              <div className="text-[10px] text-slate-400 font-mono truncate">admin@demo.com</div>
            </button>
          </div>
        </div>

      </div>

      {/* Biometric Scanning Overlay Simulation */}
      {biometricScanning && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 mx-auto rounded-full bg-blue-50 border-4 border-blue-500/30 flex items-center justify-center relative">
              <ScanFace className="w-10 h-10 text-blue-600 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <h4 className="text-lg font-bold text-slate-900">Đang quét sinh trắc học FaceID...</h4>
            <p className="text-xs text-slate-500">Giữ khuôn mặt trước thiết bị trong giây lát</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginRegister;
