import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  CreditCard, Calendar, Clock, ArrowUpRight, 
  CheckCircle2, AlertTriangle, FileText, ChevronRight, 
  DollarSign, ShieldCheck, Download, History, HelpCircle, 
  Sparkles, RefreshCw, X, Landmark, Bell, Eye, ArrowRight, Printer
} from 'lucide-react';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loanOverview, setLoanOverview] = useState({
    hasActiveLoan: false,
    activeLoan: null,
    hasPendingLoan: false,
    pendingLoan: null,
    allApplications: [],
    transactions: []
  });

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showPendingContractModal, setShowPendingContractModal] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomerLoanOverview();
      if (res && res.success && res.data) {
        setLoanOverview(res.data);
      }
    } catch (err) {
      console.warn('Failed to load customer loan overview:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [user]);

  const activeLoan = loanOverview.activeLoan;
  const pendingLoan = loanOverview.pendingLoan;
  const hasActiveLoan = !!activeLoan;
  const hasPendingLoan = !!pendingLoan;

  // Active Loan dynamic variables
  const originalAmount = activeLoan ? (activeLoan.approvedAmount || activeLoan.requestedAmount || 0) : 0;
  const remainingPrincipal = activeLoan ? (activeLoan.remainingPrincipal !== undefined ? activeLoan.remainingPrincipal : originalAmount) : 0;
  const termMonths = activeLoan ? (activeLoan.requestedTermMonths || 12) : 12;
  const paidMonths = activeLoan ? (activeLoan.paidMonths || 0) : 0;
  const interestRate = activeLoan ? (activeLoan.interestRate || 0.85) : 0.85;

  const monthlyPrincipal = termMonths > 0 ? Math.round(originalAmount / termMonths) : 0;
  const monthlyInterest = Math.round(remainingPrincipal * (interestRate / 100));
  const nextPaymentTotal = Math.min(remainingPrincipal, monthlyPrincipal + monthlyInterest);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  // Generate real schedule
  const generateSchedule = () => {
    if (!activeLoan) return [];
    const rows = [];
    let balance = originalAmount;
    for (let i = 1; i <= termMonths; i++) {
      const interest = Math.round(balance * (interestRate / 100));
      const principal = monthlyPrincipal;
      const total = principal + interest;
      const isPaid = i <= paidMonths;
      const isCurrent = i === paidMonths + 1;
      balance = Math.max(0, balance - principal);
      rows.push({
        month: i,
        dueDate: `15/${(i + 6) > 12 ? (i + 6 - 12) : (i + 6)}/2026`,
        principal,
        interest,
        total,
        status: isPaid ? 'PAID' : isCurrent ? 'UPCOMING' : 'PENDING'
      });
    }
    return rows;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto py-2">
      
      {/* Top Greeting Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Xin chào, {user?.fullName || 'Quý khách'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Đã Định Danh eKYC
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Trung tâm quản lý tài chính, theo dõi hồ sơ vay và thanh toán tức thì theo thời gian thực.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOverview}
          className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Đồng bộ mới nhất
        </button>
      </div>

      {/* 1. SECTION: PENDING LOAN & CONTRACT AWAITING APPRAISAL */}
      {hasPendingLoan && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-200/60">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-widest block">
                  Hồ sơ đang trong quy trình xử lý
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">
                  Hồ Sơ Vay #{pendingLoan.applicationNo} • Đang Chờ Thẩm Định Xét Duyệt
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Gói vay: <strong>{pendingLoan.productName || 'Vay Tiêu Dùng'}</strong> | Số tiền đăng ký: <strong className="text-blue-700">{formatCurrency(pendingLoan.requestedAmount)}</strong> | Kỳ hạn: <strong>{pendingLoan.requestedTermMonths} tháng</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPendingContractModal(true)}
              className="btn-primary py-2.5 px-5 rounded-xl font-bold text-xs flex items-center gap-2 self-start sm:self-auto shadow-md shadow-blue-500/20"
            >
              <Eye className="w-4 h-4" /> Xem bản hợp đồng chờ thẩm định
            </button>
          </div>

          {/* Stepper Status for Pending Loan */}
          <div className="grid grid-cols-4 gap-2 sm:gap-4 pt-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 mt-1.5">1. Khởi tạo & Ký</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Đã hoàn thành</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs ring-4 ring-blue-100 animate-pulse">
                2
              </div>
              <span className="text-xs font-bold text-blue-700 mt-1.5">2. Thẩm định tín dụng</span>
              <span className="text-[10px] text-blue-600 font-semibold">Đang chấm điểm AI</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <span className="text-xs font-bold text-slate-600 mt-1.5">3. Phê duyệt hạn mức</span>
              <span className="text-[10px] text-slate-400">Chờ kết quả</span>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <span className="text-xs font-bold text-slate-600 mt-1.5">4. Nhận giải ngân</span>
              <span className="text-[10px] text-slate-400">Napas 247</span>
            </div>
          </div>

          {/* Bank Account synchronized notification */}
          <div className="p-3.5 bg-white rounded-2xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <span className="text-slate-600 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-600" />
              Tài khoản nhận giải ngân đã ghi nhận trong hợp đồng:
              <strong className="text-blue-700 font-mono font-bold">
                {pendingLoan.disbursementAccount || 'Chưa cung cấp'}
              </strong> 
              ({pendingLoan.disbursementBank || 'Vietcombank'})
            </span>
            <span className="text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ✓ Đã khớp chủ tài khoản
            </span>
          </div>
        </div>
      )}

      {/* 2. SECTION: ACTIVE LOAN (DISBURSED - REPAYMENT PHASE) */}
      {hasActiveLoan ? (
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
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {activeLoan.productName || 'Vay Tiêu Dùng Tín Chấp'}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono block mt-0.5">
                      Mã hợp đồng: {activeLoan.contract?.contractId || activeLoan.applicationNo}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-white/10 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold backdrop-blur-sm">
                    {remainingPrincipal > 0 ? 'Đang trả nợ định kỳ' : 'Đã tất toán toàn bộ'}
                  </span>
                </div>

                {/* Primary Metric: Remaining Balance vs Total */}
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    <span className="text-xs text-slate-400 block">Dư nợ gốc còn lại (Real-Time)</span>
                    <span className="text-2xl sm:text-3xl font-black text-blue-300 mt-1 block">
                      {formatCurrency(remainingPrincipal)}
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Khoản vay ban đầu: {formatCurrency(originalAmount)}
                    </span>
                  </div>

                  {/* Upcoming Installment Box */}
                  <div className="p-4 bg-blue-600/30 border border-blue-400/40 rounded-2xl backdrop-blur-md">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-blue-200">Số tiền cần thanh toán kỳ tới</span>
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded">
                        Kỳ {paidMonths + 1}/{termMonths}
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
                      {formatCurrency(nextPaymentTotal)}
                    </span>
                    <span className="text-[11px] text-amber-300 font-semibold mt-1 block">
                      Hạn chót thanh toán: 15 hàng tháng
                    </span>
                  </div>
                </div>

                {/* Progress of payments */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span>Tiến độ thanh toán: {paidMonths}/{termMonths} tháng</span>
                    <span className="text-blue-400">{termMonths > 0 ? Math.round((paidMonths / termMonths) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${termMonths > 0 ? (paidMonths / termMonths) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/payment"
                    className="flex-1 btn-primary py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 text-center"
                  >
                    <DollarSign className="w-4 h-4" /> Thanh toán trả nợ ngay (VietQR Real-Time)
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
                  <p className="text-[10px] text-slate-500">Xem sao kê các lần trả nợ</p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setShowPendingContractModal(true)}
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex items-center gap-3 group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">Hợp đồng điện tử</h4>
                  <p className="text-[10px] text-slate-500">Xem văn bản pháp lý đã ký</p>
                </div>
              </button>

              <Link
                to="/support"
                className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-600">Hỗ trợ CSKH 24/7</h4>
                  <p className="text-[10px] text-slate-500">Giải đáp & Tất toán</p>
                </div>
              </Link>
            </div>

          </div>

          {/* Right Side Column: Disbursement Account Info & Realtime Updates (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Account Disbursement Info Card (Synchronized from Step 3 / DB) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                Tài khoản nhận giải ngân
              </h3>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ngân hàng</span>
                  <span className="font-bold text-slate-800">{activeLoan.disbursementBank || 'Vietcombank'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Số tài khoản</span>
                  <span className="font-mono font-bold text-blue-600 text-sm">
                    {activeLoan.disbursementAccount || 'Chưa cung cấp'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Chủ tài khoản</span>
                  <span className="font-bold text-slate-800 uppercase">
                    {activeLoan.customerName || user?.fullName}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Tiền giải ngân đã khớp nối theo đúng số tài khoản đăng ký tại Bước 3.</span>
              </div>
            </div>

            {/* Repayment Gateway Shortcut */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Thanh toán Napas 247
              </h3>
              <p className="text-xs text-slate-500">
                Thanh toán qua số tài khoản ảo (Virtual Account) hoặc quét mã VietQR để được trừ nợ trực tiếp tức thì.
              </p>
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
      ) : (
        /* CASE 3: NO ACTIVE LOAN (New user or no active contracts) */
        !hasPendingLoan && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CreditCard className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Bạn chưa có khoản vay nào đang hoạt động</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tài khoản của bạn chưa có khoản vay nào được giải ngân. Mọi chi phí và dư nợ hiện tại là <strong>0 VNĐ</strong>. Bạn có thể chọn gói vay phù hợp để khởi tạo hồ sơ trực tuyến ngay bây giờ.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/home"
                className="btn-primary py-3 px-8 rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                Xem các gói vay đề xuất theo nghề nghiệp
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )
      )}

      {/* MODAL: AMORTIZATION SCHEDULE */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Lịch Trả Nợ Chi Tiết Hợp Đồng #{activeLoan?.contract?.contractId || activeLoan?.applicationNo}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Khoản vay ban đầu: <strong>{formatCurrency(originalAmount)}</strong> • Dư nợ còn lại: <strong className="text-blue-600">{formatCurrency(remainingPrincipal)}</strong>
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

      {/* MODAL: PENDING CONTRACT AWAITING APPRAISAL */}
      {showPendingContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
            
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-800 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-sm font-bold">BẢN HỢP ĐỒNG ĐIỆN TỬ CHỜ THẨM ĐỊNH XÉT DUYỆT</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Mã hồ sơ: {(pendingLoan || activeLoan)?.applicationNo} • Trạng thái: Chờ xét duyệt hạn mức
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowPendingContractModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-6 text-xs text-slate-800 leading-relaxed bg-slate-50/50">
              <div className="text-center space-y-1 pb-4 border-b border-slate-200">
                <p className="font-bold uppercase text-[11px] text-slate-700">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="text-[10px] italic text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
                <div className="w-20 h-0.5 bg-slate-300 mx-auto my-1.5"></div>
                <h2 className="text-base font-black text-slate-900 uppercase pt-1">
                  HỢP ĐỒNG CHO VAY TIÊU DÙNG TÍN CHẤP (BẢN CHỜ THẨM ĐỊNH)
                </h2>
                <p className="text-[11px] font-mono text-slate-500">
                  Mã số: {(pendingLoan || activeLoan)?.contract?.contractId || (pendingLoan || activeLoan)?.applicationNo} / HĐTD-LOMS
                </p>
              </div>

              {/* Parties */}
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 uppercase text-xs">BÊN CHO VAY (BÊN A): CÔNG TY TÀI CHÍNH TỔNG HỢP LOMS</h4>
                  <p>Trụ sở chính: Tòa nhà Fintech Tower, 54 Liễu Giai, Ba Đình, Hà Nội</p>
                  <p>Đại diện theo pháp luật: Ông Lê Văn Cường - Chức vụ: Tổng Giám Đốc</p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <h4 className="font-bold text-slate-900 uppercase text-xs">BÊN VAY (BÊN B - KHÁCH HÀNG):</h4>
                  <p>Họ và tên: <strong className="uppercase">{(pendingLoan || activeLoan)?.customerName || user?.fullName}</strong></p>
                  <p>Số CCCD: <strong className="font-mono">{(pendingLoan || activeLoan)?.identityCard || user?.identityCard}</strong></p>
                  <p>Số điện thoại: {(pendingLoan || activeLoan)?.customerPhone || user?.phone}</p>
                  <p>Địa chỉ cư trú: {(pendingLoan || activeLoan)?.personalDetails?.address || 'Theo hồ sơ định danh'}</p>
                  <p className="pt-1 text-blue-700 font-semibold">
                    Tài khoản nhận giải ngân: <strong className="font-mono">{(pendingLoan || activeLoan)?.disbursementAccount || 'Chưa cung cấp'}</strong> tại {(pendingLoan || activeLoan)?.disbursementBank || 'Vietcombank'}
                  </p>
                </div>
              </div>

              {/* Clauses */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <strong className="block font-bold">Điều 1. Số tiền đăng ký vay</strong>
                  <p>Bên B đề nghị vay số tiền: <strong className="text-blue-700 font-bold">{formatCurrency((pendingLoan || activeLoan)?.requestedAmount || 0)}</strong> ({ (pendingLoan || activeLoan)?.requestedTermMonths || 12 } tháng).</p>
                </div>
                <div>
                  <strong className="block font-bold">Điều 2. Phương thức giải ngân</strong>
                  <p>
                    Giải ngân chuyển khoản trực tiếp qua hệ thống liên ngân hàng Napas 247 vào tài khoản ngân hàng chính chủ của Bên B: <strong className="font-mono font-bold text-blue-700">{(pendingLoan || activeLoan)?.disbursementAccount}</strong> tại <strong>{(pendingLoan || activeLoan)?.disbursementBank}</strong> sau khi chuyên viên hoàn tất thẩm định.
                  </p>
                </div>
                <div>
                  <strong className="block font-bold">Điều 3. Trạng thái bản thảo hợp đồng</strong>
                  <p className="italic text-slate-600">
                    Bản hợp đồng này đã được Bên B ký số điện tử bằng OTP. Bản thảo đang lưu trong hệ thống LOMS để chuyên viên thẩm định rà soát hồ sơ và duyệt giải ngân.
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 text-center pt-2">
                <div className="p-4 bg-white rounded-2xl border border-slate-200">
                  <p className="font-bold uppercase text-[11px] text-slate-800">ĐẠI DIỆN BÊN CHO VAY</p>
                  <p className="text-[10px] text-slate-500 mb-3">Chờ phê duyệt</p>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded font-bold border border-amber-200">
                    ĐANG THẨM ĐỊNH
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200">
                  <p className="font-bold uppercase text-[11px] text-slate-800">BÊN VAY (KHÁCH HÀNG)</p>
                  <p className="text-[10px] text-slate-500 mb-3">Đã ký số điện tử OTP</p>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-bold border border-emerald-200">
                    ✓ ĐÃ KÝ SỐ
                  </span>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">
                Lưu trữ bất biến trên hệ thống LOMS MongoDB
              </span>
              <button
                onClick={() => setShowPendingContractModal(false)}
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
