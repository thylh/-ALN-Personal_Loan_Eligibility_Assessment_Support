import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, Calendar, Clock, ArrowUpRight, 
  CheckCircle2, AlertTriangle, FileText, ChevronRight, 
  DollarSign, ShieldCheck, Download, History, HelpCircle, 
  Sparkles, RefreshCw, X, Landmark, Bell
} from 'lucide-react';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Simulated loan states:
  // 'DISBURSED' (Active loan in repayment), 'UNDERWRITING' (Evaluating), 'ACTION_REQUIRED' (Needs docs), 'AWAITING_CONTRACT' (Approved, needs sign)
  const [loanStatus, setLoanStatus] = useState('DISBURSED');

  const [activeLoan, setActiveLoan] = useState({
    contractId: 'HD-2026-LOMS-8921',
    productName: 'Vay Tiêu Dùng Tín Chấp Theo Lương',
    originalAmount: 50000000,
    remainingPrincipal: 37500000,
    termMonths: 12,
    paidMonths: 3,
    interestRate: 1.0, // % / month
    nextDueDate: '15/10/2026',
    daysLeft: 5,
    nextPaymentTotal: 4541667,
    nextPrincipal: 4166667,
    nextInterest: 375000,
    serviceFee: 0,
    disbursedDate: '15/07/2026'
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    const savedStatus = localStorage.getItem('activeLoanStatus');
    if (savedStatus === 'ACTIVE_DISBURSED') {
      setLoanStatus('DISBURSED');
    }
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  // Generate 12-month schedule for modal
  const generateSchedule = () => {
    const rows = [];
    const monthlyPrincipal = activeLoan.originalAmount / activeLoan.termMonths;
    let balance = activeLoan.originalAmount;
    for (let i = 1; i <= activeLoan.termMonths; i++) {
      const interest = balance * (activeLoan.interestRate / 100);
      const total = monthlyPrincipal + interest;
      const isPaid = i <= activeLoan.paidMonths;
      const isCurrent = i === activeLoan.paidMonths + 1;
      balance = Math.max(0, balance - monthlyPrincipal);
      rows.push({
        month: i,
        dueDate: `15/${(i + 6) > 12 ? (i + 6 - 12) : (i + 6)}/2026`,
        principal: monthlyPrincipal,
        interest,
        total,
        status: isPaid ? 'PAID' : isCurrent ? 'UPCOMING' : 'PENDING'
      });
    }
    return rows;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto py-2">
      
      {/* Top Greeting & State Switcher Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Xin chào, {user?.fullName || 'Nguyễn Văn An'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã Định Danh eKYC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chào mừng bạn đến với trung tâm quản lý khoản vay và thanh toán LOMS.
          </p>
        </div>

        {/* Demo State Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-[11px] font-bold">
          <span className="text-slate-400 px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Trạng thái Demo:
          </span>
          <button
            type="button"
            onClick={() => setLoanStatus('DISBURSED')}
            className={`px-3 py-1.5 rounded-xl transition ${loanStatus === 'DISBURSED' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đang vay (Active)
          </button>
          <button
            type="button"
            onClick={() => setLoanStatus('UNDERWRITING')}
            className={`px-3 py-1.5 rounded-xl transition ${loanStatus === 'UNDERWRITING' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đang thẩm định
          </button>
          <button
            type="button"
            onClick={() => setLoanStatus('ACTION_REQUIRED')}
            className={`px-3 py-1.5 rounded-xl transition ${loanStatus === 'ACTION_REQUIRED' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Yêu cầu bổ sung
          </button>
        </div>
      </div>

      {/* 1. LOAN STATUS TRACKER (All Stages) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Tiến Trình Hồ Sơ Khoản Vay #{activeLoan.contractId}
          </h2>
          <span className="text-xs font-bold text-blue-600">
            {loanStatus === 'DISBURSED' && 'Trạng thái: Đã giải ngân thành công'}
            {loanStatus === 'UNDERWRITING' && 'Trạng thái: Đang thẩm định AI & CIC'}
            {loanStatus === 'ACTION_REQUIRED' && 'Trạng thái: Cần bổ sung tài liệu'}
            {loanStatus === 'AWAITING_CONTRACT' && 'Trạng thái: Chờ ký hợp đồng'}
          </span>
        </div>

        {/* Horizontal Stepper Tracker */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 relative pt-2">
          
          {/* Step 1: Initial */}
          <div className="flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 mt-2">1. Khởi tạo hồ sơ</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Đã hoàn thành</span>
          </div>

          {/* Step 2: Underwriting */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
              loanStatus === 'UNDERWRITING' 
                ? 'bg-blue-600 text-white animate-pulse ring-4 ring-blue-100' 
                : loanStatus === 'ACTION_REQUIRED'
                ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                : 'bg-emerald-500 text-white'
            }`}>
              {loanStatus === 'DISBURSED' ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-xs font-bold text-slate-800 mt-2">2. Thẩm định tín dụng</span>
            <span className="text-[10px] font-semibold text-slate-500">
              {loanStatus === 'ACTION_REQUIRED' ? 'Yêu cầu giấy tờ' : loanStatus === 'UNDERWRITING' ? 'Đang chấm điểm AI' : 'Đã phê duyệt'}
            </span>
          </div>

          {/* Step 3: Contract Signing */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
              loanStatus === 'AWAITING_CONTRACT'
                ? 'bg-blue-600 text-white animate-pulse'
                : loanStatus === 'DISBURSED'
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {loanStatus === 'DISBURSED' ? <CheckCircle2 className="w-5 h-5" /> : '3'}
            </div>
            <span className="text-xs font-bold text-slate-800 mt-2">3. Ký hợp đồng OTP</span>
            <span className="text-[10px] font-semibold text-slate-500">
              {loanStatus === 'DISBURSED' ? 'Đã ký số' : 'Chờ khách hàng'}
            </span>
          </div>

          {/* Step 4: Disbursed */}
          <div className="flex flex-col items-center text-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md ${
              loanStatus === 'DISBURSED'
                ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                : 'bg-slate-200 text-slate-500'
            }`}>
              {loanStatus === 'DISBURSED' ? <CheckCircle2 className="w-5 h-5" /> : '4'}
            </div>
            <span className="text-xs font-bold text-slate-800 mt-2">4. Nhận giải ngân</span>
            <span className="text-[10px] font-semibold text-slate-500">
              {loanStatus === 'DISBURSED' ? 'Đã nhận tiền' : 'Chờ hoàn tất'}
            </span>
          </div>

        </div>
      </div>

      {/* 2. DYNAMIC CONDITIONAL VIEW BASED ON STATUS */}
      
      {/* CASE A: ACTION REQUIRED BANNER */}
      {loanStatus === 'ACTION_REQUIRED' && (
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-3xl space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-amber-900 text-base">Hồ sơ cần bổ sung thêm chứng từ</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                Chuyên viên thẩm định phát hiện hình ảnh sao kê lương của bạn bị mờ ở trang 2. Vui lòng tải lại ảnh chụp rõ nét hoặc tệp PDF sao kê có dấu giáp lai ngân hàng để tiếp tục xét duyệt.
              </p>
            </div>
          </div>
          <div className="pt-2 flex gap-3">
            <Link
              to="/apply/upload"
              className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-2"
            >
              Cập nhật hồ sơ & Tải lại chứng từ ngay
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* CASE B: UNDERWRITING STATE */}
      {loanStatus === 'UNDERWRITING' && (
        <div className="p-8 bg-blue-50/70 border border-blue-200 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Hệ thống đang thẩm định hồ sơ của bạn</h3>
            <p className="text-xs text-slate-600">
              Thuật toán Credit Scoring đang tự động tra cứu điểm CIC và đánh giá khả năng thanh toán. Kết quả sẽ có sau 5 - 10 phút.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setLoanStatus('DISBURSED')}
              className="px-6 py-2.5 rounded-xl border border-blue-300 bg-white text-blue-700 text-xs font-bold shadow-sm hover:bg-blue-50 transition"
            >
              Mô phỏng: Thẩm định thành công & Đi đến Giải ngân
            </button>
          </div>
        </div>
      )}

      {/* CASE C: ACTIVE LOAN (DISBURSED - REPAYMENT PHASE) */}
      {loanStatus === 'DISBURSED' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Active Loan Repayment Card (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 space-y-6">
                
                {/* Card Title & Contract Badge */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block">Khoản Vay Đang Hoạt Động</span>
                    <h3 className="text-xl font-black text-white mt-0.5">{activeLoan.productName}</h3>
                  </div>
                  <span className="px-3 py-1 bg-white/10 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold backdrop-blur-sm">
                    Đang trả nợ định kỳ
                  </span>
                </div>

                {/* Primary Metric: Remaining Balance vs Total */}
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    <span className="text-xs text-slate-400 block">Dư nợ gốc còn lại</span>
                    <span className="text-2xl sm:text-3xl font-black text-blue-300 mt-1 block">
                      {formatCurrency(activeLoan.remainingPrincipal)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Khoản vay gốc ban đầu: {formatCurrency(activeLoan.originalAmount)}
                    </span>
                  </div>

                  {/* Upcoming Installment Box */}
                  <div className="p-4 bg-blue-600/30 border border-blue-400/40 rounded-2xl backdrop-blur-md">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-blue-200">Số tiền cần trả kỳ tới</span>
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded">
                        Còn {activeLoan.daysLeft} ngày
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
                      {formatCurrency(activeLoan.nextPaymentTotal)}
                    </span>
                    <span className="text-[11px] text-amber-300 font-semibold mt-1 block">
                      Hạn chót thanh toán: {activeLoan.nextDueDate}
                    </span>
                  </div>
                </div>

                {/* Next Payment Breakdown */}
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Tiền gốc kỳ này:</span>
                    <span className="font-semibold text-white">{formatCurrency(activeLoan.nextPrincipal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Tiền lãi kỳ này ({activeLoan.interestRate}%/tháng):</span>
                    <span className="font-semibold text-amber-300">{formatCurrency(activeLoan.nextInterest)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Phí quản lý khoản vay:</span>
                    <span className="font-semibold text-white">0 đ (Miễn phí)</span>
                  </div>
                </div>

                {/* Progress of payments (e.g. 3 of 12 months) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Tiến độ hoàn trả: {activeLoan.paidMonths}/{activeLoan.termMonths} tháng</span>
                    <span className="text-blue-400">{Math.round((activeLoan.paidMonths / activeLoan.termMonths) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${(activeLoan.paidMonths / activeLoan.termMonths) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/payment"
                    className="flex-1 btn-primary py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 text-center"
                  >
                    <DollarSign className="w-4 h-4" /> Thanh toán trả nợ ngay (VietQR)
                  </Link>

                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(true)}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Calendar className="w-4 h-4" /> Xem lịch trả nợ chi tiết
                  </button>
                </div>

              </div>
            </div>

            {/* Quick Actions & Navigation Bar */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Link
                to="/history"
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Lịch sử giao dịch</h4>
                  <p className="text-[10px] text-slate-500">Xem sao kê dòng tiền</p>
                </div>
              </Link>

              <Link
                to="/apply/contract"
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">Hợp đồng điện tử</h4>
                  <p className="text-[10px] text-slate-500">Xem văn bản đã ký</p>
                </div>
              </Link>

              <Link
                to="/support"
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600">Hỗ trợ CSKH 24/7</h4>
                  <p className="text-[10px] text-slate-500">Giải đáp thắc mắc</p>
                </div>
              </Link>
            </div>

          </div>

          {/* Right Side Column: Notifications & Quick Overview (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Account Disbursement Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                Tài khoản nhận giải ngân
              </h3>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ngân hàng</span>
                  <span className="font-bold text-slate-800">Vietcombank</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Số tài khoản</span>
                  <span className="font-mono font-bold text-blue-600 text-sm">990123456789</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Chủ tài khoản</span>
                  <span className="font-bold text-slate-800 uppercase">{user?.fullName || 'NGUYỄN VĂN AN'}</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Tiền đã giải ngân thành công qua Napas 247 ngày {activeLoan.disbursedDate}.</span>
              </div>
            </div>

            {/* Upcoming Alert & Notifications Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Nhắc nợ tự động
                </h3>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Kỳ 4 / 12
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex justify-between text-slate-800 font-bold">
                    <span>Kỳ hạn thanh toán tới</span>
                    <span className="text-blue-600">{activeLoan.nextDueDate}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Vui lòng duy trì số dư hoặc quét mã QR trước 17:00 ngày đến hạn để tránh phát sinh phí quá hạn.
                  </p>
                </div>
              </div>

              <Link
                to="/payment"
                className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition block text-center"
              >
                Mở cổng thanh toán VietQR
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      )}

      {/* AMORTIZATION SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Lịch Trả Nợ Chi Tiết Khoản Vay #{activeLoan.contractId}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gốc ban đầu: <strong>{formatCurrency(activeLoan.originalAmount)}</strong> • Kỳ hạn: <strong>{activeLoan.termMonths} tháng</strong>
                </p>
              </div>
              <button 
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3 text-center">Kỳ</th>
                    <th className="py-2.5 px-3">Ngày đến hạn</th>
                    <th className="py-2.5 px-3">Tiền gốc</th>
                    <th className="py-2.5 px-3">Tiền lãi</th>
                    <th className="py-2.5 px-3">Tổng phải trả</th>
                    <th className="py-2.5 px-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generateSchedule().map((row) => (
                    <tr key={row.month} className={row.status === 'UPCOMING' ? 'bg-blue-50/60 font-bold' : 'hover:bg-slate-50'}>
                      <td className="py-2.5 px-3 text-center font-bold">{row.month}</td>
                      <td className="py-2.5 px-3 text-slate-600">{row.dueDate}</td>
                      <td className="py-2.5 px-3">{formatCurrency(row.principal)}</td>
                      <td className="py-2.5 px-3 text-amber-600">{formatCurrency(row.interest)}</td>
                      <td className="py-2.5 px-3 text-blue-600 font-bold">{formatCurrency(row.total)}</td>
                      <td className="py-2.5 px-3 text-right">
                        {row.status === 'PAID' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Đã thanh toán ✓
                          </span>
                        )}
                        {row.status === 'UPCOMING' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Kỳ tới (Chờ nộp)
                          </span>
                        )}
                        {row.status === 'PENDING' && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium">
                            Chưa đến hạn
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="btn-primary py-2 px-6 rounded-xl font-bold text-xs"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerDashboard;
