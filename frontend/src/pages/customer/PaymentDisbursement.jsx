import React, { useState } from 'react';
import { 
  CreditCard, QrCode, Copy, CheckCircle2, 
  ArrowRight, ShieldCheck, Landmark, Check, 
  DollarSign, RefreshCw, AlertCircle, Sparkles, Download
} from 'lucide-react';

const PaymentDisbursement = () => {
  // Tabs: 'repayment' (Thanh toán trả nợ), 'disbursement' (Nhận giải ngân)
  const [activeTab, setActiveTab] = useState('repayment');

  // Repayment Options: 'monthly' (kỳ này), 'full' (tất toán), 'custom' (tùy chọn)
  const [payOption, setPayOption] = useState('monthly');
  const [customAmount, setCustomAmount] = useState(4541667);

  // Copy feedback states
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Virtual Account data
  const vaData = {
    bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
    accountNumber: '99LOMS001099123456',
    accountHolder: 'LOMS - NGUYỄN VĂN AN',
    monthlyAmount: 4541667,
    fullAmount: 37875000,
    transferMemo: 'LOMS TT HD8921',
    dueDate: '15/10/2026'
  };

  // Disbursement Data
  const [disbursementData, setDisbursementData] = useState({
    bankName: 'Vietcombank (Ngân hàng Ngoại Thương)',
    accountNumber: '990123456789',
    accountHolder: 'NGUYỄN VĂN AN',
    status: 'DISBURSED',
    amount: 50000000,
    refId: 'NAPAS-DISB-998812',
    timestamp: '15/07/2026 10:30:15'
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Simulate payment processing via Webhook
  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  const currentPayAmount = payOption === 'monthly' ? vaData.monthlyAmount : payOption === 'full' ? vaData.fullAmount : customAmount;

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

      {/* TAB 1: REPAYMENT VIA VIETQR & VIRTUAL ACCOUNT */}
      {activeTab === 'repayment' && (
        <div className="space-y-6">
          
          {/* Payment Success Receipt */}
          {paymentSuccess ? (
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-8 text-center space-y-6 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-emerald-950">Giao dịch thanh toán thành công!</h3>
                <p className="text-xs text-emerald-800">
                  Hệ thống LOMS đã nhận được số tiền <strong className="font-black text-emerald-950">{formatCurrency(currentPayAmount)}</strong> qua Virtual Account.
                </p>
                <p className="text-[11px] text-emerald-700 font-mono">
                  Mã giao dịch: TXN-REPAY-{Date.now()} • Kênh: Napas 247
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
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Xuất biên lai điện tử
                </button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: QR Code Visual & Instructions (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 text-center space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                  <QrCode className="w-3.5 h-3.5" /> Quét mã VietQR 24/7
                </div>

                {/* Simulated VietQR Box */}
                <div className="mx-auto w-64 p-4 rounded-2xl border-2 border-slate-200 bg-white shadow-md relative">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 text-[10px] font-bold text-slate-500">
                    <span>VIETQR • NAPAS247</span>
                    <span className="text-blue-600">MB BANK</span>
                  </div>

                  {/* QR SVG Graphic */}
                  <div className="py-4 flex items-center justify-center">
                    <div className="w-48 h-48 bg-slate-900 rounded-xl p-3 flex flex-col justify-between items-center text-white relative overflow-hidden">
                      {/* Stylized QR simulation */}
                      <div className="grid grid-cols-6 gap-1.5 w-full h-full p-1 opacity-90">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-sm ${
                              i === 0 || i === 5 || i === 30 || i === 35 || (i % 7 === 0) || (i % 3 === 0)
                                ? 'bg-white'
                                : 'bg-transparent'
                            }`}
                          ></div>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 border-2 border-white flex items-center justify-center font-black text-white text-xs shadow-md">
                          LOMS
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-xs font-black text-blue-600">
                    {formatCurrency(currentPayAmount)}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Mở ứng dụng ngân hàng bất kỳ (Vietcombank, MB, Techcombank, BIDV, Momo...) và quét mã để thanh toán tự động không cần nhập thông tin.
                </p>

                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {isProcessingPayment ? 'Đang nhận diện chuyển khoản...' : 'Mô phỏng quét chuyển khoản thử nghiệm'}
                </button>
              </div>

              {/* Right Column: Manual Transfer Details & Virtual Account (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Repayment Amount Selector */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    Chọn số tiền thanh toán
                  </h3>

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

                    {/* Account Number */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Số tài khoản định danh (VA)</span>
                        <strong className="text-blue-700 font-mono text-sm">{vaData.accountNumber}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(vaData.accountNumber, 'acc')}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-[11px]"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'acc' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                    {/* Account Holder */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Tên người thụ hưởng</span>
                        <strong className="text-slate-800 uppercase">{vaData.accountHolder}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(vaData.accountHolder, 'holder')}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-[11px]"
                      >
                        {copiedField === 'holder' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'holder' ? 'Đã sao chép' : 'Sao chép'}</span>
                      </button>
                    </div>

                    {/* Transfer Memo */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">Nội dung chuyển khoản (Bắt buộc)</span>
                        <strong className="text-amber-700 font-mono font-bold">{vaData.transferMemo}</strong>
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
                Tiền giải ngân sẽ được truyền tự động qua cổng liên ngân hàng Napas 247 ngay khi ký hợp đồng xong.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Đã Xác Thực Danh Tính Chủ Tài Khoản
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ngân hàng thụ hưởng</span>
              <strong className="text-slate-800 text-sm block">{disbursementData.bankName}</strong>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Số tài khoản</span>
              <strong className="text-blue-600 font-mono text-base block">{disbursementData.accountNumber}</strong>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Chủ tài khoản (Bắt buộc trùng CCCD)</span>
              <strong className="text-slate-800 uppercase text-sm block">{disbursementData.accountHolder}</strong>
              <span className="text-[11px] text-emerald-600 font-semibold block pt-1">
                ✓ Hệ thống đã xác thực tên chủ tài khoản trùng khớp 100% với CCCD điện tử 001099123456.
              </span>
            </div>
          </div>

          {/* Historical Disbursement Orders */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Lịch sử lệnh chi giải ngân
            </h4>

            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">Lệnh chi Napas 247 #{disbursementData.refId}</span>
                <span className="text-[11px] text-slate-500 font-mono">{disbursementData.timestamp}</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-600 block">
                  +{formatCurrency(disbursementData.amount)}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Thành công 100%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentDisbursement;
