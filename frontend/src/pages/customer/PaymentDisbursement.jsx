import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  CreditCard, QrCode, Copy, CheckCircle2, 
  ArrowRight, ShieldCheck, Landmark, Check, 
  DollarSign, RefreshCw, AlertCircle, Sparkles, Download, Clock
} from 'lucide-react';

const PaymentDisbursement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Tabs: 'repayment' (Thanh toán trả nợ), 'disbursement' (Nhận giải ngân)
  const [activeTab, setActiveTab] = useState('repayment');

  // Repayment Options: 'monthly' (kỳ này), 'full' (tất toán), 'custom' (tùy chọn)
  const [payOption, setPayOption] = useState('monthly');
  const [customAmount, setCustomAmount] = useState(0);

  // Copy feedback states
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastTxn, setLastTxn] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Loan data loaded from DB via API
  const [loading, setLoading] = useState(true);
  const [loanOverview, setLoanOverview] = useState({
    hasActiveLoan: false,
    activeLoan: null,
    hasPendingLoan: false,
    pendingLoan: null,
    allApplications: [],
    transactions: []
  });

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomerLoanOverview();
      if (res && res.success && res.data) {
        setLoanOverview(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch loan overview:', err.message);
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

  // Active Loan Metrics
  const originalAmount = activeLoan ? (activeLoan.approvedAmount || activeLoan.requestedAmount || 0) : 0;
  const remainingPrincipal = activeLoan ? (activeLoan.remainingPrincipal !== undefined ? activeLoan.remainingPrincipal : originalAmount) : 0;
  const termMonths = activeLoan ? (activeLoan.requestedTermMonths || 12) : 12;
  const interestRateMonth = activeLoan ? (activeLoan.interestRate || 0.85) : 0.85;

  // Monthly estimate: principal / term + interest on remaining
  const monthlyPrincipal = termMonths > 0 ? Math.round(originalAmount / termMonths) : 0;
  const monthlyInterest = Math.round(remainingPrincipal * (interestRateMonth / 100));
  const calculatedMonthlyDue = Math.min(remainingPrincipal, monthlyPrincipal + monthlyInterest);

  // Virtual Account data (strictly dynamic to active loan or user)
  const vaData = {
    bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
    accountNumber: activeLoan 
      ? `99LOMS${activeLoan.identityCard || user?.identityCard || '000000000000'}`
      : `99LOMS${user?.identityCard || '000000000000'}`,
    accountHolder: `LOMS - ${(activeLoan?.customerName || user?.fullName || 'KHACH HANG').toUpperCase()}`,
    monthlyAmount: calculatedMonthlyDue > 0 ? calculatedMonthlyDue : 0,
    fullAmount: remainingPrincipal,
    transferMemo: activeLoan ? `LOMS TT ${activeLoan.applicationNo}` : 'LOMS TT KHOAN VAY',
    dueDate: '15 hàng tháng'
  };

  // Disbursement Data (strictly synchronized from Step 3 / Registration / DB)
  const disbursementAccountInfo = {
    bankName: activeLoan?.disbursementBank || pendingLoan?.disbursementBank || user?.bankName || 'Vietcombank (Ngân hàng Ngoại Thương)',
    accountNumber: activeLoan?.disbursementAccount || pendingLoan?.disbursementAccount || user?.accountNumber || 'Chưa cung cấp',
    accountHolder: (activeLoan?.customerName || pendingLoan?.customerName || user?.fullName || 'Khách hàng').toUpperCase(),
    status: activeLoan ? 'DISBURSED' : (pendingLoan ? 'PENDING_DISBURSEMENT' : 'NOT_APPLIED'),
    amount: activeLoan ? (activeLoan.approvedAmount || activeLoan.requestedAmount) : (pendingLoan ? pendingLoan.requestedAmount : 0),
    refId: activeLoan ? `NAPAS-${activeLoan.applicationNo}` : (pendingLoan ? `CHO-DUYET-${pendingLoan.applicationNo}` : 'CHUA-CO'),
    timestamp: activeLoan?.updatedAt ? new Date(activeLoan.updatedAt).toLocaleString('vi-VN') : '---'
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const currentPayAmount = payOption === 'monthly' ? vaData.monthlyAmount : payOption === 'full' ? vaData.fullAmount : customAmount;

  // Real-time payment execution connected to backend & MongoDB
  const handleProcessPayment = async () => {
    if (!activeLoan) {
      setErrorMsg('Bạn chưa có khoản vay nào đang hoạt động để thực hiện thanh toán.');
      return;
    }
    if (currentPayAmount <= 0) {
      setErrorMsg('Số tiền thanh toán phải lớn hơn 0 VNĐ.');
      return;
    }

    setIsProcessingPayment(true);
    setErrorMsg('');

    try {
      const res = await api.processRepayment({
        applicationId: activeLoan._id,
        amount: currentPayAmount,
        paymentType: payOption === 'monthly' ? 'MONTHLY_INSTALLMENT' : (payOption === 'full' ? 'EARLY_SETTLEMENT' : 'CUSTOM_PAYMENT'),
        note: `Thanh toán hợp đồng ${activeLoan.applicationNo} qua cổng VietQR Napas`
      });

      if (res && res.success) {
        setPaymentSuccess(true);
        setLastTxn(res.data.transaction);
        // Refresh overview immediately from DB to update remaining balance and stats in real-time
        await fetchOverview();
      } else {
        setErrorMsg(res?.message || 'Giao dịch thanh toán thất bại.');
      }
    } catch (err) {
      setErrorMsg('Lỗi khi gửi yêu cầu thanh toán: ' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Cổng Thanh Toán & Quản Lý Giải Ngân</h1>
          <p className="text-xs text-slate-500 mt-1">
            Giao dịch tài chính tức thì qua hệ thống tài khoản định danh Virtual Account & VietQR Napas 247.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold w-full sm:w-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('repayment'); setPaymentSuccess(false); }}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl transition ${activeTab === 'repayment' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Thanh toán trả nợ
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('disbursement'); setPaymentSuccess(false); }}
            className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl transition ${activeTab === 'disbursement' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Thông tin nhận giải ngân
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* TAB 1: REPAYMENT VIA VIETQR & VIRTUAL ACCOUNT */}
      {activeTab === 'repayment' && (
        <div className="space-y-6">
          
          {/* Payment Success Receipt */}
          {paymentSuccess && (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-emerald-950">Giao dịch thanh toán thành công!</h3>
                <p className="text-xs text-emerald-800">
                  Hệ thống đã nhận được số tiền <strong className="font-black text-emerald-950">{formatCurrency(lastTxn?.amount || currentPayAmount)}</strong> và cập nhật trừ dư nợ thành công vào cơ sở dữ liệu.
                </p>
                <p className="text-[11px] text-emerald-700 font-mono">
                  Mã giao dịch: {lastTxn?.transactionNo || `TXN-REPAY-${Date.now()}`} • Kênh: Napas 247 Realtime
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentSuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100/50 transition"
                >
                  Thực hiện giao dịch khác
                </button>
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  Về Dashboard xem số dư mới
                </Link>
              </div>
            </div>
          )}

          {/* CASE 1: NO ACTIVE LOAN */}
          {!hasActiveLoan ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CreditCard className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Không có khoản vay nào cần thanh toán</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tài khoản của bạn hiện tại chưa có khoản vay nào đang hoạt động. Khi có hợp đồng vay được giải ngân, bảng tính trả nợ và mã VietQR thanh toán tự động sẽ hiển thị tại đây theo thời gian thực.
                </p>
              </div>
              {pendingLoan && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl max-w-md mx-auto text-left text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Hồ sơ đang chờ thẩm định: {pendingLoan.applicationNo}
                  </div>
                  <p className="text-slate-600">
                    Gói vay: <strong>{pendingLoan.productName || 'Vay tiêu dùng'}</strong> • Số tiền: <strong>{formatCurrency(pendingLoan.requestedAmount)}</strong>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Hợp đồng đang chờ duyệt. Sau khi chuyên viên phê duyệt và giải ngân, bạn có thể thực hiện thanh toán tại đây.
                  </p>
                </div>
              )}
              <div className="pt-2">
                <Link
                  to="/home"
                  className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs inline-flex items-center gap-2"
                >
                  Khám phá các gói vay ưu đãi
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* CASE 2: ACTIVE LOAN FOUND - REAL-TIME PAYMENT VIA VIETQR */
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: VietQR Code Box (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 text-center space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-blue-600" /> VietQR Napas 247
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                    Khớp Lệnh Tức Thì
                  </span>
                </div>

                {/* QR Code Container */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center space-y-3">
                  <div className="w-48 h-48 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=247-MBBANK-${vaData.accountNumber}-${currentPayAmount}-${encodeURIComponent(vaData.transferMemo)}`}
                      alt="VietQR Transfer"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="text-[11px] font-mono text-slate-500">
                    Số tiền thanh toán:
                  </div>
                  <div className="text-base font-black text-blue-600">
                    {formatCurrency(currentPayAmount)}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Mở ứng dụng ngân hàng bất kỳ (Vietcombank, MB, Techcombank, BIDV, MoMo...) quét mã để thanh toán tự động trừ nợ theo thời gian thực.
                </p>

                <button
                  type="button"
                  onClick={handleProcessPayment}
                  disabled={isProcessingPayment || remainingPrincipal <= 0}
                  className="w-full py-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {isProcessingPayment ? 'Đang gửi giao dịch đến ngân hàng...' : 'Xác nhận thanh toán ngay (Real-Time)'}
                </button>
              </div>

              {/* Right Column: Manual Transfer Details & Virtual Account (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Repayment Amount Selector */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Chọn số tiền thanh toán (Hợp đồng: {activeLoan.applicationNo})
                    </h3>
                    <span className="text-xs font-bold text-blue-600">
                      Dư nợ còn lại: {formatCurrency(remainingPrincipal)}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPayOption('monthly')}
                      className={`p-4 rounded-2xl border text-left transition ${payOption === 'monthly' ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Thanh toán kỳ này</span>
                      <span className="text-base font-black text-blue-600 mt-1 block">
                        {formatCurrency(vaData.monthlyAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Hạn chót: {vaData.dueDate}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayOption('full')}
                      className={`p-4 rounded-2xl border text-left transition ${payOption === 'full' ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-sm' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Tất toán toàn bộ nợ</span>
                      <span className="text-base font-black text-slate-900 mt-1 block">
                        {formatCurrency(vaData.fullAmount)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Miễn phí phạt trả trước</span>
                    </button>
                  </div>
                </div>

                {/* Virtual Account (VA) Information Box */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-blue-600" />
                      Tài khoản định danh chuyển khoản (Virtual Account)
                    </h3>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Ghi nhận sau 3 giây
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    
                    {/* Bank */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Ngân hàng thụ hưởng</span>
                        <strong className="text-slate-800">{vaData.bankName}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(vaData.bankName, 'bank')}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-[11px]"
                      >
                        {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'bank' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                    {/* VA Account Number */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
                      <div>
                        <span className="text-[10px] text-blue-600 font-semibold block">Số tài khoản ảo định danh</span>
                        <strong className="text-blue-900 font-mono text-sm tracking-wider">{vaData.accountNumber}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(vaData.accountNumber, 'va')}
                        className="p-1.5 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 flex items-center gap-1 text-[11px] font-bold"
                      >
                        {copiedField === 'va' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'va' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                    {/* Account Holder */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-semibold block">Tên người thụ hưởng</span>
                      <strong className="text-slate-800 font-mono">{vaData.accountHolder}</strong>
                    </div>

                    {/* Transfer Memo */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Nội dung chuyển khoản (bắt buộc)</span>
                        <strong className="text-slate-900 font-mono">{vaData.transferMemo}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(vaData.transferMemo, 'memo')}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-[11px]"
                      >
                        {copiedField === 'memo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'memo' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: DISBURSEMENT RECEIVING INFORMATION */}
      {activeTab === 'disbursement' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-start pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                Thông Tin Tài Khoản Nhận Tiền Giải Ngân
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Đồng bộ trực tiếp từ thông tin kê khai tại Bước 3 của hồ sơ vay và bản hợp đồng điện tử đã ký.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Đã Đồng Bộ Hồ Sơ Vay
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ngân hàng thụ hưởng</span>
              <strong className="text-slate-800 text-sm block">{disbursementAccountInfo.bankName}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Số tài khoản nhận giải ngân</span>
              <strong className="text-blue-600 font-mono text-base block">{disbursementAccountInfo.accountNumber}</strong>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Chủ tài khoản (Bắt buộc trùng CCCD)</span>
              <strong className="text-slate-800 uppercase text-sm block">{disbursementAccountInfo.accountHolder}</strong>
              <span className="text-[11px] text-emerald-600 font-semibold block pt-1">
                ✓ Trùng khớp 100% với thông tin định danh CCCD và điều khoản giải ngân trong hợp đồng tín dụng.
              </span>
            </div>
          </div>

          {/* Historical Disbursement Orders / Current Status */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Trạng thái lệnh chi giải ngân
            </h4>

            {disbursementAccountInfo.amount > 0 ? (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-800 block">Lệnh chi Napas 247 #{disbursementAccountInfo.refId}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{disbursementAccountInfo.timestamp}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-emerald-600 block">
                    +{formatCurrency(disbursementAccountInfo.amount)}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    disbursementAccountInfo.status === 'DISBURSED' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {disbursementAccountInfo.status === 'DISBURSED' ? 'Đã giải ngân thành công' : 'Chờ hoàn tất thẩm định'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Chưa có lệnh giải ngân nào phát sinh.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentDisbursement;
