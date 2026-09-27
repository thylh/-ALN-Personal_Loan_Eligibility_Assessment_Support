import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calculator, ShieldCheck, Clock, CheckCircle2, 
  ArrowRight, Sparkles, TrendingUp, HelpCircle, 
  Building2, CreditCard, ChevronRight, X, Info,
  Smartphone, Award, UserCheck, Shield
} from 'lucide-react';

const LOAN_PRODUCTS = [
  {
    id: 'salary',
    title: 'Vay Tín Chấp Theo Lương',
    badge: 'Phổ biến nhất',
    rate: '0.85% / tháng',
    maxAmount: '200,000,000 đ',
    term: '6 - 36 tháng',
    desc: 'Dành cho cán bộ nhân viên hưởng lương chuyển khoản ngân hàng hoặc tiền mặt.',
    benefits: ['Không cần tài sản thế chấp', 'Hạn mức gấp 10 lần thu nhập', 'Giải ngân sau 15 phút']
  },
  {
    id: 'business',
    title: 'Vay Hộ Kinh Doanh & Tiểu Thương',
    badge: 'Hạn mức cao',
    rate: '0.95% / tháng',
    maxAmount: '500,000,000 đ',
    term: '12 - 48 tháng',
    desc: 'Giải pháp vốn lưu động kịp thời cho chủ cửa hàng, sạp chợ và hộ kinh doanh cá thể.',
    benefits: ['Chỉ cần giấy phép kinh doanh/thuế', 'Lãi suất ưu đãi theo chu kỳ', 'Gốc linh hoạt']
  },
  {
    id: 'utility',
    title: 'Vay Theo Hóa Đơn & Bảo Hiểm',
    badge: 'Thủ tục đơn giản',
    rate: '1.05% / tháng',
    maxAmount: '70,000,000 đ',
    term: '3 - 24 tháng',
    desc: 'Duyệt nhanh dựa trên hóa đơn điện/nước hoặc hợp đồng bảo hiểm nhân thọ hiện có.',
    benefits: ['Không cần chứng minh lương', 'Duyệt 100% online', 'Không thẩm định thực địa']
  },
  {
    id: 'starter',
    title: 'Vay Sinh Viên & Đi Làm Mới',
    badge: 'Ưu đãi trẻ',
    rate: '0.75% / tháng',
    maxAmount: '30,000,000 đ',
    term: '3 - 12 tháng',
    desc: 'Hỗ trợ mua laptop, học phí và chi phí khởi đầu công việc cho người trẻ mới tốt nghiệp.',
    benefits: ['Ân hạn trả gốc 3 tháng đầu', 'Không phí tất toán trước hạn', 'Hỗ trợ cố vấn chi tiêu']
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(50000000);
  const [months, setMonths] = useState(12);
  const [calcMethod, setCalcMethod] = useState('reducing'); // 'reducing' (dư nợ giảm dần) or 'flat' (gốc đều)
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const monthlyRate = 0.01; // 1.0% / month base

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  // Calculation Logic
  // 1. Reducing balance:
  const monthlyPrincipal = amount / months;
  const firstMonthInterest = amount * monthlyRate;
  const firstMonthTotal = monthlyPrincipal + firstMonthInterest;
  const lastMonthInterest = (amount / months) * monthlyRate;
  const lastMonthTotal = monthlyPrincipal + lastMonthInterest;

  // Total interest for reducing balance: monthlyRate * amount * (months + 1) / 2
  const totalInterestReducing = (amount * monthlyRate * (months + 1)) / 2;
  const totalPayableReducing = amount + totalInterestReducing;

  // 2. Flat / Fixed EMI:
  const flatMonthlyInterest = amount * monthlyRate;
  const flatMonthlyTotal = monthlyPrincipal + flatMonthlyInterest;
  const totalInterestFlat = flatMonthlyInterest * months;
  const totalPayableFlat = amount + totalInterestFlat;

  // Schedule generator for modal
  const generateSchedule = () => {
    const rows = [];
    let remainingPrincipal = amount;
    for (let i = 1; i <= months; i++) {
      const interest = calcMethod === 'reducing' ? remainingPrincipal * monthlyRate : flatMonthlyInterest;
      const principal = monthlyPrincipal;
      const total = principal + interest;
      remainingPrincipal = Math.max(0, remainingPrincipal - principal);
      rows.push({
        month: i,
        startBalance: remainingPrincipal + principal,
        principal,
        interest,
        total,
        endBalance: remainingPrincipal
      });
    }
    return rows;
  };

  const handleApplyNow = (presetAmount, presetMonths) => {
    const selectedAmount = presetAmount || amount;
    const selectedMonths = presetMonths || months;
    localStorage.setItem('selectedLoanProposal', JSON.stringify({
      amount: selectedAmount,
      termMonths: selectedMonths,
      method: calcMethod
    }));
    navigate('/login');
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      
      {/* 1. HERO BANNER & LOAN CALCULATOR */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 md:p-12 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Nền Tảng Thẩm Định Tín Dụng LOMS 2026
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              Vay Vốn Trực Tuyến <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
                Phê Duyệt Siêu Tốc 5 Phút
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl font-normal">
              Định danh eKYC hiện đại, mô hình chấm điểm tín dụng AI tự động. Nhận tiền giải ngân về tài khoản ngân hàng 24/7 không cần đến quầy giao dịch.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
                <div className="text-xl md:text-2xl font-black text-blue-400">0.8%</div>
                <div className="text-xs text-slate-400 mt-0.5">Lãi suất từ / tháng</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
                <div className="text-xl md:text-2xl font-black text-emerald-400">5 Phút</div>
                <div className="text-xs text-slate-400 mt-0.5">Thời gian xét duyệt</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
                <div className="text-xl md:text-2xl font-black text-amber-400">500 Triệu</div>
                <div className="text-xs text-slate-400 mt-0.5">Hạn mức tối đa</div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button 
                onClick={() => handleApplyNow()} 
                className="btn-primary text-base font-bold py-3.5 px-8 rounded-xl flex items-center gap-2.5 shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition"
              >
                Đăng ký vay ngay
                <ArrowRight className="w-5 h-5" />
              </button>
              <a 
                href="#products" 
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition backdrop-blur-sm"
              >
                Xem các gói vay
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Bảo mật mã hóa 256-bit</span>
              <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-sky-400" /> Không giữ giấy tờ gốc</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Giấy phép NHNN cấp</span>
            </div>
          </div>

          {/* Right Loan Calculator Widget */}
          <div className="lg:col-span-5 bg-white text-slate-900 p-6 md:p-7 rounded-2xl shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">Dự toán khoản vay</h3>
                  <span className="text-xs text-slate-500">Tính toán chính xác theo thời gian thực</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md border border-emerald-200">
                Lãi 1.0%/tháng
              </span>
            </div>

            {/* Method switch */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-2">
                Phương thức tính lãi
              </label>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCalcMethod('reducing')}
                  className={`py-2 rounded-lg transition-all ${calcMethod === 'reducing' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Dư nợ giảm dần
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMethod('flat')}
                  className={`py-2 rounded-lg transition-all ${calcMethod === 'flat' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Gốc đều (Cố định)
                </button>
              </div>
            </div>

            {/* Slider 1: Loan Amount */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Số tiền vay</label>
                <span className="text-base font-black text-blue-600">{formatCurrency(amount)}</span>
              </div>
              <input 
                type="range" 
                min="10000000" 
                max="500000000" 
                step="5000000"
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              {/* Quick Pills */}
              <div className="flex justify-between gap-1.5 pt-1">
                {[20000000, 50000000, 100000000, 200000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`text-[11px] px-2 py-1 rounded-md border transition ${amount === val ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {val / 1000000} Triệu
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 2: Term */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Thời hạn vay</label>
                <span className="text-base font-black text-blue-600">{months} tháng</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="36" 
                step="3"
                value={months} 
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              {/* Quick Pills */}
              <div className="flex justify-between gap-1.5 pt-1">
                {[6, 12, 24, 36].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`text-[11px] px-3 py-1 rounded-md border transition ${months === m ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {m} Tháng
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Tiền gốc trả hàng tháng:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(monthlyPrincipal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  {calcMethod === 'reducing' ? 'Tiền lãi tháng đầu:' : 'Tiền lãi mỗi tháng:'}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(calcMethod === 'reducing' ? firstMonthInterest : flatMonthlyInterest)}
                </span>
              </div>
              {calcMethod === 'reducing' && (
                <div className="flex justify-between text-slate-600">
                  <span>Tiền lãi tháng cuối:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(lastMonthInterest)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tổng tiền lãi toàn bộ kỳ:</span>
                <span className="font-semibold text-amber-600">
                  {formatCurrency(calcMethod === 'reducing' ? totalInterestReducing : totalInterestFlat)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <span className="block text-slate-700 font-bold">
                    {calcMethod === 'reducing' ? 'Kỳ đầu trả tối đa:' : 'Mỗi tháng trả đều:'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {calcMethod === 'reducing' ? '(Các tháng sau giảm dần)' : '(Cố định hàng tháng)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-blue-600 block">
                    {formatCurrency(calcMethod === 'reducing' ? firstMonthTotal : flatMonthlyTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons inside calculator */}
            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => handleApplyNow()}
                className="w-full btn-primary py-3 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2"
              >
                Đăng ký gói vay này ngay
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1 transition"
              >
                <Info className="w-3.5 h-3.5" /> Xem bảng lịch trả nợ chi tiết {months} tháng
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 2. LOAN PRODUCTS SECTION */}
      <section id="products" className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <CreditCard className="w-3.5 h-3.5" /> Gói Vay Đa Dạng
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Chọn Sản Phẩm Vay Phù Hợp Nhu Cầu
          </h2>
          <p className="text-slate-600 text-sm">
            Mọi sản phẩm đều được thiết kế linh hoạt, minh bạch lãi suất và phí, bảo vệ tối đa quyền lợi người vay.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LOAN_PRODUCTS.map((p) => (
            <div 
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-blue-300 transition group"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {p.badge}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">{p.rate}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition mb-2">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {p.desc}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hạn mức đến:</span>
                    <span className="font-bold text-slate-800">{p.maxAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thời hạn:</span>
                    <span className="font-bold text-slate-800">{p.term}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {p.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleApplyNow()}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-1.5"
              >
                Chọn gói này
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW IT WORKS - 4 SIMPLE STEPS */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Quy Trình Siêu Nhanh</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            4 Bước Đơn Giản Nhận Tiền Ngay
          </h2>
          <p className="text-slate-600 text-sm">
            Thao tác hoàn toàn trên điện thoại hoặc máy tính, giải ngân tự động không cần gặp mặt.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Đăng Ký & eKYC',
              desc: 'Nhập số điện thoại, chụp ảnh CCCD 2 mặt và quét khuôn mặt sống (Liveness check) trong 3 phút.'
            },
            {
              step: '02',
              title: 'Điền Hồ Sơ & Chứng Từ',
              desc: 'Cung cấp thông tin nghề nghiệp, người tham chiếu và tải lên sao kê lương hoặc bảng lương minh bạch.'
            },
            {
              step: '03',
              title: 'Thẩm Định & Ký Số',
              desc: 'AI chấm điểm tự động kết hợp cán bộ tín dụng phê duyệt. Ký hợp đồng điện tử bằng mã OTP SMS.'
            },
            {
              step: '04',
              title: 'Giải Ngân 24/7',
              desc: 'Tiền được chuyển thẳng vào tài khoản ngân hàng của bạn chỉ sau vài phút qua cổng Napas 247.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group hover:bg-blue-50/50 hover:border-blue-200 transition">
              <span className="text-3xl font-black text-blue-200 group-hover:text-blue-500 transition block mb-3">
                {item.step}
              </span>
              <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SECURITY & PARTNERS */}
      <section className="bg-slate-100/70 rounded-3xl p-8 border border-slate-200/80 text-center space-y-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Liên kết giải ngân & thanh toán liên ngân hàng qua hệ thống NAPAS
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
          {['Vietcombank', 'MB Bank', 'Techcombank', 'BIDV', 'VPBank', 'ACB', 'TPBank', 'VietinBank'].map((bank, i) => (
            <div key={i} className="px-4 py-2 bg-white rounded-lg border border-slate-200 font-bold text-xs text-slate-700 shadow-sm">
              {bank}
            </div>
          ))}
        </div>
      </section>

      {/* 5. MODAL: AMORTIZATION SCHEDULE PREVIEW */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" />
                  Bảng Lịch Trả Nợ Mô Phỏng ({months} Kỳ)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Khoản vay: <strong className="text-slate-800">{formatCurrency(amount)}</strong> | Phương thức: <strong className="text-blue-600">{calcMethod === 'reducing' ? 'Dư nợ giảm dần' : 'Gốc đều cố định'}</strong>
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
                    <th className="py-2.5 px-3">Dư nợ đầu kỳ</th>
                    <th className="py-2.5 px-3">Tiền gốc</th>
                    <th className="py-2.5 px-3">Tiền lãi ({monthlyRate * 100}%)</th>
                    <th className="py-2.5 px-3 font-extrabold text-blue-700">Tổng thanh toán</th>
                    <th className="py-2.5 px-3 text-right">Dư nợ cuối kỳ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generateSchedule().map((row) => (
                    <tr key={row.month} className="hover:bg-blue-50/50">
                      <td className="py-2 px-3 text-center font-bold text-slate-600">{row.month}</td>
                      <td className="py-2 px-3 font-medium text-slate-700">{formatCurrency(row.startBalance)}</td>
                      <td className="py-2 px-3 text-slate-600">{formatCurrency(row.principal)}</td>
                      <td className="py-2 px-3 text-amber-600">{formatCurrency(row.interest)}</td>
                      <td className="py-2 px-3 font-bold text-blue-600">{formatCurrency(row.total)}</td>
                      <td className="py-2 px-3 text-right text-slate-500">{formatCurrency(row.endBalance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={2} className="py-3 px-3">Tổng cộng toàn kỳ:</td>
                    <td className="py-3 px-3 text-slate-900">{formatCurrency(amount)}</td>
                    <td className="py-3 px-3 text-amber-600">
                      {formatCurrency(calcMethod === 'reducing' ? totalInterestReducing : totalInterestFlat)}
                    </td>
                    <td className="py-3 px-3 text-blue-700 font-extrabold">
                      {formatCurrency(calcMethod === 'reducing' ? totalPayableReducing : totalPayableFlat)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">0 đ</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
              <span className="text-slate-500 italic">* Số liệu mang tính chất tham khảo mô phỏng theo biểu phí chuẩn.</span>
              <button
                onClick={() => { setShowScheduleModal(false); handleApplyNow(); }}
                className="btn-primary py-2 px-5 rounded-lg font-bold"
              >
                Đăng ký gói này ngay
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
