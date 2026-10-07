import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LOAN_PRODUCTS, getProductById, formatVND, OCCUPATIONS } from '../../data/loanProducts';
import { 
  Calculator, ShieldCheck, Clock, CheckCircle2, 
  ArrowRight, Sparkles, TrendingUp, HelpCircle, 
  Building2, CreditCard, ChevronRight, X, Info,
  Smartphone, Award, UserCheck, Shield, ArrowLeft,
  FileText, Check, AlertCircle, Share2, Tag
} from 'lucide-react';

export default function LoanProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Calculator State
  const [amount, setAmount] = useState(50000000);
  const [months, setMonths] = useState(12);
  const [calcMethod, setCalcMethod] = useState('reducing'); // 'reducing' | 'flat'
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Load product data dynamically from API with fallback to local catalog
  useEffect(() => {
    let isMounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.getLoanProductById(id);
        if (res && res.success && res.product) {
          if (isMounted) {
            initProductData(res.product);
          }
        } else {
          // Fallback to local catalog
          const localProd = getProductById(id);
          if (localProd && isMounted) {
            initProductData(localProd);
          } else if (isMounted) {
            setError('Không tìm thấy thông tin gói vay yêu cầu.');
          }
        }
      } catch (err) {
        console.warn('API fetch loan detail error, using fallback:', err.message);
        const localProd = getProductById(id);
        if (localProd && isMounted) {
          initProductData(localProd);
        } else if (isMounted) {
          setError('Không thể tải thông tin gói vay.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();
    return () => { isMounted = false; };
  }, [id]);

  const initProductData = (prod) => {
    setProduct(prod);
    setAmount(prod.defaultAmount || prod.minAmount);
    setMonths(prod.defaultTerm || prod.minTerm);
    setCalcMethod(prod.calcMethod || 'reducing');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">Đang tải thông tin chi tiết gói vay...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-black text-slate-800">Không tìm thấy gói vay</h2>
        <p className="text-slate-500 text-sm">{error || 'Gói vay bạn tìm kiếm không tồn tại hoặc đã tạm dừng cung cấp.'}</p>
        <Link to="/home" className="btn-primary inline-flex items-center gap-2 py-2.5 px-6 rounded-xl font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Quay lại Trang Chủ
        </Link>
      </div>
    );
  }

  // Monthly interest rate calculation: (product.interestRate / 100)
  const monthlyRate = (product.interestRate || 1.0) / 100;

  // 1. Reducing balance:
  const monthlyPrincipal = amount / months;
  const firstMonthInterest = amount * monthlyRate;
  const firstMonthTotal = monthlyPrincipal + firstMonthInterest;
  const lastMonthInterest = (amount / months) * monthlyRate;
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

  // Quick Amount Presets calculation
  const getAmountPresets = () => {
    const min = product.minAmount;
    const max = product.maxAmount;
    const step = (max - min) / 3;
    const presets = [
      min,
      Math.round((min + step) / 5000000) * 5000000 || min + step,
      Math.round((min + step * 2) / 5000000) * 5000000 || min + step * 2,
      max
    ];
    return Array.from(new Set(presets)).filter(p => p >= min && p <= max);
  };

  // Quick Term Presets
  const getTermPresets = () => {
    const min = product.minTerm;
    const max = product.maxTerm;
    const standard = [3, 6, 12, 18, 24, 36, 48];
    const filtered = standard.filter(t => t >= min && t <= max);
    if (!filtered.includes(min)) filtered.unshift(min);
    if (!filtered.includes(max)) filtered.push(max);
    return Array.from(new Set(filtered)).sort((a, b) => a - b);
  };

  const handleApplyThisLoan = () => {
    const proposal = {
      productId: product.id,
      productName: product.name,
      amount: Number(amount),
      termMonths: Number(months),
      interestRate: product.interestRate,
      calcMethod,
      monthlyEstimate: calcMethod === 'reducing' ? Math.round(firstMonthTotal) : Math.round(flatMonthlyTotal),
      selectedAt: new Date().toISOString()
    };

    localStorage.setItem('selectedLoanProposal', JSON.stringify(proposal));

    if (!user) {
      // Navigate to login with state to return
      navigate('/login', { state: { returnToApply: true, selectedPackage: product.name } });
    } else {
      // If already logged in, navigate to eKYC or application form
      const isEkycVerified = localStorage.getItem('verifiedEkyc');
      if (isEkycVerified) {
        navigate('/apply/form');
      } else {
        navigate('/apply/ekyc');
      }
    }
  };

  const targetOccupationLabels = (product.targetOccupations || []).map(occId => {
    const found = OCCUPATIONS.find(o => o.id === occId);
    return found ? found.label : occId;
  }).join(', ');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/home" className="hover:text-blue-600 transition flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Trang chủ
        </Link>
        <span>/</span>
        <span className="text-slate-400">Gói vay đề xuất</span>
        <span>/</span>
        <span className="font-bold text-slate-900 truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              {product.badge || 'Gói Vay Ưu Đãi'}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              Nhóm: {targetOccupationLabels || product.tag}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {product.name}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {product.subtitle || product.desc}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
              <div className="text-xs text-slate-400">Lãi suất ưu đãi</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">{product.interestRate}% / tháng</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
              <div className="text-xs text-slate-400">Hạn mức vay</div>
              <div className="text-xl sm:text-2xl font-black text-blue-400 mt-0.5">Tới {formatVND(product.maxAmount)}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
              <div className="text-xs text-slate-400">Thời hạn vay</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">{product.minTerm} - {product.maxTerm} tháng</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
              <div className="text-xs text-slate-400">Thời gian duyệt</div>
              <div className="text-xl sm:text-2xl font-black text-sky-400 mt-0.5">5 - 15 Phút</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Calculator */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Chi tiết gói vay & Điều kiện (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Lợi ích vượt trội */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Lợi Ích & Đặc Quyền Gói Vay
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {product.desc}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              {(product.benefits || []).map((b, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Điều kiện vay */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              Điều Kiện Áp Dụng
            </h2>
            <div className="space-y-2.5">
              {(product.eligibilityCriteria || []).map((ec, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="font-medium">{ec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Hồ sơ cần chuẩn bị */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Hồ Sơ & Chứng Từ Cần Chuẩn Bị
            </h2>
            <p className="text-xs text-slate-500">
              Chụp ảnh bản gốc rõ nét và tải trực tiếp qua ứng dụng khi điền hồ sơ (Không giữ bản gốc):
            </p>
            <div className="space-y-2.5">
              {(product.requiredDocs || []).map((doc, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs text-slate-800">
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-semibold">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Quy trình vay */}
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-7 space-y-4">
            <h2 className="text-base font-black text-slate-900">Quy Trình 3 Bước Để Nhận Tiền Vay</h2>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black mx-auto flex items-center justify-center mb-1.5 text-xs">1</div>
                <div className="font-bold text-slate-900">Chọn dự toán</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Số tiền & Kỳ hạn</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black mx-auto flex items-center justify-center mb-1.5 text-xs">2</div>
                <div className="font-bold text-slate-900">eKYC & Nộp đơn</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Định danh 1 phút</div>
              </div>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-black mx-auto flex items-center justify-center mb-1.5 text-xs">3</div>
                <div className="font-bold text-slate-900">Giải ngân 24/7</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Tiền về tài khoản</div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: BẢNG DỰ TOÁN KHOẢN VAY NHÚNG TRỰC TIẾP (5 Cols) */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          
          <div className="bg-white text-slate-900 p-6 sm:p-7 rounded-3xl shadow-xl border-2 border-blue-100 relative overflow-hidden">
            
            {/* Calculator Title Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight">Dự Toán Khoản Vay</h3>
                  <span className="text-[11px] text-slate-500 font-medium">Tùy chỉnh số tiền & thời hạn theo gói</span>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                {product.interestRate}%/tháng
              </span>
            </div>

            {/* Method switch */}
            <div className="mb-5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-2">
                Phương thức tính lãi
              </label>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCalcMethod('reducing')}
                  className={`py-2 rounded-lg transition-all ${calcMethod === 'reducing' ? 'bg-white text-blue-700 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Dư nợ giảm dần
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMethod('flat')}
                  className={`py-2 rounded-lg transition-all ${calcMethod === 'flat' ? 'bg-white text-blue-700 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Gốc đều (Cố định)
                </button>
              </div>
            </div>

            {/* Slider 1: Loan Amount */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Số tiền vay</label>
                <span className="text-lg font-black text-blue-600">{formatVND(amount)}</span>
              </div>
              <input 
                type="range" 
                min={product.minAmount} 
                max={product.maxAmount} 
                step={product.stepAmount || 1000000}
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Tối thiểu: {formatVND(product.minAmount)}</span>
                <span>Tối đa: {formatVND(product.maxAmount)}</span>
              </div>
              {/* Quick Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {getAmountPresets().map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${amount === val ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {val >= 1000000 ? `${val / 1000000} Triệu` : formatVND(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 2: Term */}
            <div className="space-y-2 mb-5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Thời hạn vay</label>
                <span className="text-lg font-black text-blue-600">{months} tháng</span>
              </div>
              <input 
                type="range" 
                min={product.minTerm} 
                max={product.maxTerm} 
                step={product.minTerm <= 6 ? 1 : 3}
                value={months} 
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>{product.minTerm} tháng</span>
                <span>{product.maxTerm} tháng</span>
              </div>
              {/* Quick Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {getTermPresets().map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`text-[11px] px-3 py-1 rounded-lg border transition ${months === m ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {m} Tháng
                  </button>
                ))}
              </div>
            </div>

            {/* Calculation Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs mb-5">
              <div className="flex justify-between text-slate-600">
                <span>Tiền gốc trả hàng tháng:</span>
                <span className="font-bold text-slate-900">{formatVND(monthlyPrincipal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  {calcMethod === 'reducing' ? 'Tiền lãi tháng đầu tiên:' : 'Tiền lãi mỗi tháng:'}
                </span>
                <span className="font-bold text-slate-900">
                  {formatVND(calcMethod === 'reducing' ? firstMonthInterest : flatMonthlyInterest)}
                </span>
              </div>
              {calcMethod === 'reducing' && (
                <div className="flex justify-between text-slate-600">
                  <span>Tiền lãi tháng cuối:</span>
                  <span className="font-bold text-slate-900">{formatVND(lastMonthInterest)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Tổng tiền lãi toàn bộ kỳ:</span>
                <span className="font-bold text-amber-600">
                  {formatVND(calcMethod === 'reducing' ? totalInterestReducing : totalInterestFlat)}
                </span>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-between items-center">
                <div>
                  <span className="block text-slate-800 font-extrabold text-sm">
                    {calcMethod === 'reducing' ? 'Kỳ đầu trả tối đa:' : 'Mỗi tháng trả đều:'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {calcMethod === 'reducing' ? '(Các kỳ sau sẽ giảm dần)' : '(Số tiền cố định hàng tháng)'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-blue-600 block">
                    {formatVND(calcMethod === 'reducing' ? firstMonthTotal : flatMonthlyTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleApplyThisLoan}
                className="w-full btn-primary py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition"
              >
                Đăng ký gói vay này ngay
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setShowScheduleModal(true)}
                className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl flex items-center justify-center gap-1.5 transition border border-slate-200"
              >
                <Info className="w-4 h-4 text-blue-500" /> Xem lịch trả nợ chi tiết {months} tháng
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Không phí ẩn</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-blue-500" /> Duyệt tự động</span>
            </div>

          </div>

        </div>

      </div>

      {/* AMORTIZATION SCHEDULE MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Lịch Trả Nợ Dự Kiến - {product.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Khoản vay: {formatVND(amount)} trong {months} tháng | Lãi: {product.interestRate}%/tháng ({calcMethod === 'reducing' ? 'Dư nợ giảm dần' : 'Gốc đều'})
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 my-4 divide-y divide-slate-100 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Kỳ</th>
                    <th className="py-2.5 px-3">Dư nợ đầu</th>
                    <th className="py-2.5 px-3">Tiền gốc</th>
                    <th className="py-2.5 px-3">Tiền lãi</th>
                    <th className="py-2.5 px-3">Tổng trả</th>
                    <th className="py-2.5 px-3">Dư nợ cuối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generateSchedule().map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-900">Tháng {row.month}</td>
                      <td className="py-2.5 px-3 text-slate-600">{formatVND(row.startBalance)}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{formatVND(row.principal)}</td>
                      <td className="py-2.5 px-3 text-emerald-600">{formatVND(row.interest)}</td>
                      <td className="py-2.5 px-3 font-black text-blue-600">{formatVND(row.total)}</td>
                      <td className="py-2.5 px-3 text-slate-500">{formatVND(row.endBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl">
              <div className="text-xs text-slate-600">
                <span>Tổng phải trả: </span>
                <strong className="text-slate-900 font-extrabold">
                  {formatVND(calcMethod === 'reducing' ? totalPayableReducing : totalPayableFlat)}
                </strong>
                <span className="text-slate-400 ml-2">
                  (Lãi: {formatVND(calcMethod === 'reducing' ? totalInterestReducing : totalInterestFlat)})
                </span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => { setShowScheduleModal(false); handleApplyThisLoan(); }}
                  className="flex-1 sm:flex-none btn-primary px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Đăng ký ngay
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
