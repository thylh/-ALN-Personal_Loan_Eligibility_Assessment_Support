import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, ShieldCheck, CheckSquare, Square, 
  ArrowRight, ArrowLeft, Download, Printer, CheckCircle2, 
  AlertCircle, Sparkles, KeyRound, Stamp, Lock
} from 'lucide-react';

const EContract = () => {
  const navigate = useNavigate();
  const contractScrollRef = useRef(null);

  // eKYC & Form data from previous steps
  const [contractData, setContractData] = useState({
    contractId: 'HD-2026-LOMS-8921',
    customerName: 'NGUYỄN VĂN AN',
    idNumber: '001099123456',
    phone: '0901234567',
    address: 'Số 45 ngõ 120 đường Hoàng Quốc Việt, Phường Cổ Nhuế 1, Quận Bắc Từ Liêm, TP. Hà Nội',
    loanAmount: 50000000,
    termMonths: 12,
    interestRateYear: 12.0, // 1.0%/month
    monthlyRepayment: 4666667,
    disbursementBank: 'Vietcombank (Ngân hàng Ngoại Thương)',
    disbursementAccount: '990123456789'
  });

  // Scroll condition
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // OTP Signing state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const otpInputsRef = useRef([]);

  useEffect(() => {
    // Load persisted data if available
    const savedEkyc = localStorage.getItem('verifiedEkyc');
    const savedProposal = localStorage.getItem('selectedLoanProposal');
    const savedApp = localStorage.getItem('loanApplicationDraft');

    if (savedApp) {
      try {
        const app = JSON.parse(savedApp);
        setContractData(prev => ({
          ...prev,
          customerName: app.ekyc?.fullName || prev.customerName,
          idNumber: app.ekyc?.idNumber || prev.idNumber,
          phone: app.form?.phone || prev.phone,
          address: app.form?.currentAddress || prev.address,
          loanAmount: app.loanProposal?.amount || prev.loanAmount,
          termMonths: app.loanProposal?.termMonths || prev.termMonths,
          disbursementBank: app.form?.bankName || prev.disbursementBank,
          disbursementAccount: app.form?.accountNumber || prev.disbursementAccount
        }));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  // Check scroll position to end of document
  const handleScroll = () => {
    const el = contractScrollRef.current;
    if (!el) return;
    // Buffer of 30px
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 30) {
      setHasScrolledToBottom(true);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  // Handle OTP inputs
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  // Sign contract
  const handleConfirmSignature = () => {
    const code = otpCode.join('');
    if (code.length < 6) {
      setErrorMsg('Vui lòng nhập đầy đủ mã OTP 6 số để ký số.');
      return;
    }

    setIsSigning(true);
    setErrorMsg('');
    setTimeout(() => {
      setIsSigning(false);
      setIsSigned(true);
      setShowOtpModal(false);
      // Persist signed status
      localStorage.setItem('activeLoanStatus', 'ACTIVE_DISBURSED');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500">
      
      {/* Step Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Bước 4 / 4</span>
            <h1 className="text-2xl font-black text-slate-900">Xem & Ký Hợp Đồng Tín Dụng Điện Tử</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Chữ Ký Số Pháp Lý Luật GDĐT 2023
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          <div className="h-2 rounded-full bg-blue-600"></div>
          <div className="h-2 rounded-full bg-blue-600"></div>
          <div className="h-2 rounded-full bg-blue-600"></div>
          <div className="h-2 rounded-full bg-blue-600"></div>
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1.5">
          <span className="text-emerald-600 font-bold">1. eKYC ✓</span>
          <span className="text-emerald-600 font-bold">2. Tạo hồ sơ ✓</span>
          <span className="text-emerald-600 font-bold">3. Tải chứng từ ✓</span>
          <span className="text-blue-600 font-bold">4. Ký hợp đồng điện tử</span>
        </div>
      </div>

      {/* Main Contract Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Document Header Controls */}
        <div className="bg-slate-800 text-white p-4 px-6 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <span className="font-bold text-sm block">HỢP ĐỒNG CHO VAY TIÊU DÙNG TÍN CHẤP ĐIỆN TỬ</span>
              <span className="text-xs text-slate-400 font-mono">Mã số: {contractData.contractId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> In bản thảo
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Tải PDF
            </button>
          </div>
        </div>

        {/* Scrollable PDF Contract Content with Watermark */}
        <div
          ref={contractScrollRef}
          onScroll={handleScroll}
          className="p-8 sm:p-12 max-h-[500px] overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed relative bg-slate-50/50 border-b border-slate-200 select-text"
        >
          {/* Watermark Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.04] rotate-[-25deg] select-none">
            <span className="text-6xl md:text-8xl font-black text-slate-900 tracking-widest whitespace-nowrap">
              BẢN GỐC LOMS ĐIỆN TỬ
            </span>
          </div>

          {/* National Emblem & Title */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-200">
            <p className="font-bold uppercase tracking-wider text-[11px] text-slate-700">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-[10px] italic text-slate-600">Độc lập - Tự do - Hạnh phúc</p>
            <div className="w-24 h-0.5 bg-slate-300 mx-auto my-2"></div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase pt-2">
              HỢP ĐỒNG CHO VAY TIÊU DÙNG TÍN CHẤP
            </h2>
            <p className="text-[11px] font-mono text-slate-500">
              Số: {contractData.contractId} / HĐTD-LOMS
            </p>
          </div>

          {/* Parties involved */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">
                BÊN CHO VAY (BÊN A): CÔNG TY TÀI CHÍNH TỔNG HỢP LOMS VIỆT NAM
              </h3>
              <p>Mã số doanh nghiệp: 0108999888 do Sở KH&ĐT cấp ngày 15/01/2020.</p>
              <p>Địa chỉ trụ sở chính: Tòa nhà Fintech Tower, 54 Liễu Giai, Ba Đình, Hà Nội.</p>
              <p>Đại diện theo pháp luật: Ông Lê Văn Cường - Chức vụ: Tổng Giám Đốc.</p>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase mb-1">
                BÊN VAY (BÊN B - KHÁCH HÀNG):
              </h3>
              <p>Họ và tên: <strong className="font-bold uppercase">{contractData.customerName}</strong></p>
              <p>Số Căn cước công dân: <strong className="font-mono">{contractData.idNumber}</strong></p>
              <p>Số điện thoại liên lạc: {contractData.phone}</p>
              <p>Địa chỉ cư trú: {contractData.address}</p>
              <p>Tài khoản nhận giải ngân: <strong className="font-mono">{contractData.disbursementAccount}</strong> tại {contractData.disbursementBank}</p>
            </div>
          </div>

          {/* Terms & Clauses */}
          <div className="space-y-4 pt-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase">
              HAI BÊN THỐNG NHẤT KÝ KẾT CÁC ĐIỀU KHOẢN SAU ĐÂY:
            </h4>

            <div>
              <strong className="block font-bold mb-1">Điều 1. Số tiền vay và Mục đích vay</strong>
              <p>
                1.1. Bên A đồng ý cấp cho Bên B khoản vay tiêu dùng tín chấp không tài sản bảo đảm với số tiền là: <strong className="text-blue-700 font-bold">{formatCurrency(contractData.loanAmount)}</strong>.
              </p>
              <p>
                1.2. Mục đích vay: Tiêu dùng cá nhân phục vụ đời sống gia đình hợp pháp theo quy định của pháp luật Việt Nam.
              </p>
            </div>

            <div>
              <strong className="block font-bold mb-1">Điều 2. Thời hạn vay, Lãi suất và Phương thức giải ngân</strong>
              <p>
                2.1. Thời hạn vay: <strong className="font-bold">{contractData.termMonths} tháng</strong> tính từ ngày giải ngân thành công.
              </p>
              <p>
                2.2. Lãi suất cho vay: <strong className="font-bold text-slate-900">{contractData.interestRateYear}%/năm</strong> (tương đương 1.0%/tháng) tính theo dư nợ thực tế.
              </p>
              <p>
                2.3. Phương thức giải ngân: Chuyển khoản trực tiếp 24/7 qua cổng thanh toán liên ngân hàng Napas vào tài khoản ngân hàng chính chủ của Bên B đã đăng ký.
              </p>
            </div>

            <div>
              <strong className="block font-bold mb-1">Điều 3. Trách nhiệm hoàn trả và Phí phạt chậm trả</strong>
              <p>
                3.1. Bên B có nghĩa vụ thanh toán đầy đủ tiền gốc và tiền lãi định kỳ hàng tháng theo đúng lịch trả nợ ban hành kèm theo Hợp đồng này.
              </p>
              <p>
                3.2. Trong trường hợp quá hạn, số dư nợ gốc quá hạn sẽ chịu lãi suất quá hạn bằng 150% lãi suất trong hạn tính trên số ngày chậm trả theo quy định của Ngân hàng Nhà nước.
              </p>
            </div>

            <div>
              <strong className="block font-bold mb-1">Điều 4. Giá trị pháp lý của Hợp đồng điện tử và Chữ ký số OTP</strong>
              <p>
                4.1. Hợp đồng này được lập dưới dạng thông điệp dữ liệu điện tử theo quy định của Luật Giao dịch điện tử số 20/2023/QH15 và Nghị định số 52/2013/NĐ-CP.
              </p>
              <p>
                4.2. Việc Bên B xác nhận mã OTP gửi về số điện thoại chính chủ được xem là hành vi ký kết điện tử hợp pháp và có giá trị ràng buộc tương đương với chữ ký tay trực tiếp.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="italic text-slate-500">
                (Khách hàng đã đọc kỹ, hiểu rõ toàn bộ quyền lợi, trách nhiệm và tự nguyện ký tên điện tử dưới đây).
              </p>
            </div>
          </div>

          {/* Signature Box Section inside Contract */}
          <div className="pt-6 grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="font-bold uppercase text-slate-900">ĐẠI DIỆN BÊN CHO VAY</p>
              <p className="text-[10px] text-slate-500 mb-6">Tổng Giám Đốc (Đã ký số)</p>
              <div className="inline-block p-2 border-2 border-emerald-600 rounded-lg text-emerald-700 bg-emerald-50/50">
                <Stamp className="w-8 h-8 mx-auto text-emerald-600 mb-1" />
                <span className="text-[9px] font-bold block uppercase">CÔNG TY TÀI CHÍNH LOMS</span>
                <span className="text-[8px] font-mono block">Chữ ký số PKI Certified</span>
              </div>
            </div>

            <div>
              <p className="font-bold uppercase text-slate-900">BÊN VAY (KHÁCH HÀNG)</p>
              <p className="text-[10px] text-slate-500 mb-6">Ký xác thực bằng OTP SMS</p>
              {isSigned ? (
                <div className="inline-block p-2 border-2 border-blue-600 rounded-lg text-blue-700 bg-blue-50/50 animate-in zoom-in">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-blue-600 mb-1" />
                  <span className="text-[9px] font-bold block uppercase">{contractData.customerName}</span>
                  <span className="text-[8px] font-mono block">ĐÃ KÝ SỐ LÚC: {new Date().toLocaleTimeString()}</span>
                </div>
              ) : (
                <div className="inline-block px-4 py-3 border border-dashed border-slate-300 rounded-lg text-slate-400 text-[11px]">
                  Chờ xác nhận mã OTP...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Scroll Guard Notice & Acceptance Checkbox */}
        <div className="p-6 bg-slate-50 space-y-4">
          {!hasScrolledToBottom ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Vui lòng cuộn đến cuối trang hợp đồng để kích hoạt tính năng đồng ý và ký số.
              </span>
              <button
                type="button"
                onClick={() => {
                  if (contractScrollRef.current) {
                    contractScrollRef.current.scrollTop = contractScrollRef.current.scrollHeight;
                  }
                  setHasScrolledToBottom(true);
                }}
                className="text-xs font-bold text-blue-600 hover:underline flex-shrink-0"
              >
                Cuộn nhanh xuống cuối
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Bạn đã cuộn và đọc toàn bộ hợp đồng. Vui lòng xác nhận điều khoản để tiếp tục ký số.</span>
            </div>
          )}

          <label className={`flex items-start gap-3 select-none ${hasScrolledToBottom ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
            <input
              type="checkbox"
              disabled={!hasScrolledToBottom || isSigned}
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed">
              Tôi đã đọc, hiểu rõ và hoàn toàn đồng ý với tất cả các điều khoản, lãi suất, nghĩa vụ thanh toán và lịch trả nợ trong Hợp đồng tín dụng điện tử số <strong className="font-mono">{contractData.contractId}</strong>.
            </span>
          </label>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/apply/upload')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại kiểm tra chứng từ
            </button>

            {!isSigned ? (
              <button
                type="button"
                disabled={!hasScrolledToBottom || !agreedTerms}
                onClick={() => setShowOtpModal(true)}
                className={`py-3.5 px-8 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition ${
                  hasScrolledToBottom && agreedTerms
                    ? 'btn-primary shadow-blue-500/25'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <KeyRound className="w-4 h-4" /> Ký Hợp Đồng Bằng Mã OTP SMS
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="py-3.5 px-8 rounded-2xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition"
              >
                Hợp Đồng Đã Ký Thành Công • Đến Trang Quản Lý Khoản Vay
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* OTP MODAL FOR DIGITAL SIGNATURE */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border-2 border-blue-200">
                <KeyRound className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xác Thực Ký Hợp Đồng Điện Tử</h3>
              <p className="text-xs text-slate-500">
                Mã OTP 6 số xác nhận chữ ký số đã được gửi đến số điện thoại <strong className="text-slate-800">{contractData.phone}</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 6 Digit Inputs */}
            <div>
              <div className="flex justify-between gap-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 sm:w-12 h-12 text-center text-xl font-black rounded-xl border border-slate-300 bg-white focus:border-blue-600 outline-none"
                  />
                ))}
              </div>

              <div className="flex justify-between items-center mt-3 text-xs">
                <button
                  type="button"
                  onClick={() => setOtpCode(['1', '2', '3', '4', '5', '6'])}
                  className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Điền mã mẫu (123456)
                </button>
                <span className="text-slate-400">Hiệu lực trong 60s</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmSignature}
                disabled={isSigning}
                className="w-full btn-primary py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md"
              >
                {isSigning ? 'Hệ thống đang đóng dấu chữ ký điện tử...' : 'Xác Nhận Ký Hợp Đồng & Hoàn Tất'}
              </button>

              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Hủy bỏ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default EContract;
