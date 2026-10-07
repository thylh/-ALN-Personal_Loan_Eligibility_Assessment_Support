import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, Users, ChevronRight, Lock, 
  AlertTriangle, CheckCircle2, Building, DollarSign, 
  CreditCard, Save, ArrowLeft, ArrowRight, ShieldCheck, 
  HelpCircle, Landmark, Wifi, Activity
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const VIETNAM_BANKS = [
  'Vietcombank (Ngân hàng Ngoại Thương)',
  'MB Bank (Ngân hàng Quân Đội)',
  'Techcombank (Ngân hàng Kỹ Thương)',
  'BIDV (Ngân hàng Đầu Tư và Phát Triển)',
  'VPBank (Ngân hàng Việt Nam Thịnh Vượng)',
  'ACB (Ngân hàng Á Châu)',
  'TPBank (Ngân hàng Tiên Phong)',
  'VietinBank (Ngân hàng Công Thương)'
];

const getOccupationTitle = (occupation) => {
  switch (occupation) {
    case 'STUDENT': return 'Sinh viên / Học sinh';
    case 'EMPLOYED': return 'Nhân viên chính thức (Hưởng lương)';
    case 'BUSINESS_OWNER': return 'Chủ hộ kinh doanh / Doanh nhân';
    case 'FREELANCER': return 'Làm việc tự do (Freelancer)';
    default: return 'Lao động tự do / Khác';
  }
};

const LoanApplicationForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active step in form: 'personal' -> 'employment' -> 'reference'
  const [activeTab, setActiveTab] = useState('personal');

  // Prepopulated eKYC data synchronized from registration & step 1
  const [ekycData, setEkycData] = useState({
    fullName: user?.fullName ? user.fullName.toUpperCase() : '',
    idNumber: user?.identityCard || '',
    dob: '',
    gender: 'Nam',
    address: ''
  });

  // Selected Loan Proposal from Step 1 / Home / Product Details
  const [loanProposal, setLoanProposal] = useState({
    productId: 'prod-salary',
    productName: 'Gói Vay Tín Chấp Người Đi Làm (Theo Lương)',
    amount: 50000000,
    termMonths: 12,
    interestRate: 0.85,
    calcMethod: 'reducing'
  });

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal & Residence
    phone: user?.phone || '',
    email: user?.email || '',
    maritalStatus: 'Độc thân',
    dependents: '0',
    education: user?.occupation === 'STUDENT' ? 'Đại học (Đang theo học)' : 'Đại học',
    housingStatus: 'Nhà sở hữu riêng',
    rentExpense: '0',
    currentAddress: '',
    livingYears: '1',

    // Step 2: Employment & Financial
    employmentType: getOccupationTitle(user?.occupation),
    companyName: user?.occupation === 'STUDENT' ? 'Trường Đại học' : '',
    companyTaxId: '',
    jobTitle: user?.occupation === 'STUDENT' ? 'Sinh viên' : '',
    workTenureMonths: '',
    monthlyIncome: '',
    incomePaymentMethod: 'Chuyển khoản ngân hàng',
    otherIncome: 0,
    monthlyExpenses: '',
    existingDebtPayment: 0,

    // Step 3: Reference 1
    ref1Name: '',
    ref1Relation: 'Bố/Mẹ',
    ref1Phone: '',
    ref1Job: '',

    // Step 3: Reference 2
    ref2Name: '',
    ref2Relation: 'Đồng nghiệp / Bạn bè',
    ref2Phone: '',

    // Step 3: Bank Account for Disbursement
    bankName: user?.bankName || 'Vietcombank (Ngân hàng Ngoại Thương)',
    accountNumber: user?.accountNumber || ''
  });

  const { connected, saveDraftRealtime, syncFormField, onlineActors } = useSocket();
  const [validationError, setValidationError] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [autoSyncing, setAutoSyncing] = useState(false);

  // Load persisted eKYC and proposal on mount + fetch remote draft
  useEffect(() => {
    // 1. Reset & Sync with current registered user profile
    if (user) {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || '',
        email: user.email || '',
        bankName: user.bankName || 'Vietcombank (Ngân hàng Ngoại Thương)',
        accountNumber: user.accountNumber || '',
        employmentType: getOccupationTitle(user.occupation) || prev.employmentType,
        companyName: user.occupation === 'STUDENT' ? 'Trường Đại học' : '',
        jobTitle: user.occupation === 'STUDENT' ? 'Sinh viên' : '',
        workTenureMonths: '',
        monthlyIncome: '',
        monthlyExpenses: '',
        currentAddress: '',
        ref1Name: '',
        ref1Phone: '',
        ref2Name: '',
        ref2Phone: ''
      }));
      setEkycData({
        fullName: user.fullName ? user.fullName.toUpperCase() : '',
        idNumber: user.identityCard || '',
        dob: '',
        gender: 'Nam',
        address: ''
      });
    } else {
      setFormData({
        phone: '',
        email: '',
        maritalStatus: 'Độc thân',
        dependents: '0',
        education: 'Đại học',
        housingStatus: 'Nhà sở hữu riêng',
        rentExpense: '0',
        currentAddress: '',
        livingYears: '1',
        employmentType: '',
        companyName: '',
        companyTaxId: '',
        jobTitle: '',
        workTenureMonths: '',
        monthlyIncome: '',
        incomePaymentMethod: 'Chuyển khoản ngân hàng',
        otherIncome: 0,
        monthlyExpenses: '',
        existingDebtPayment: 0,
        ref1Name: '',
        ref1Relation: 'Bố/Mẹ',
        ref1Phone: '',
        ref1Job: '',
        ref2Name: '',
        ref2Relation: 'Đồng nghiệp / Bạn bè',
        ref2Phone: '',
        bankName: 'Vietcombank (Ngân hàng Ngoại Thương)',
        accountNumber: ''
      });
      setEkycData({
        fullName: '',
        idNumber: '',
        dob: '',
        gender: 'Nam',
        address: ''
      });
    }

    // 2. Prioritize verified eKYC ONLY IF it belongs to the active user
    const savedEkyc = localStorage.getItem('verifiedEkyc');
    if (savedEkyc) {
      try {
        const parsed = JSON.parse(savedEkyc);
        // Only accept if phone or identityCard matches current user
        if (!user || !user.phone || parsed.phone === user.phone || parsed.idNumber === user.identityCard) {
          setEkycData(prev => ({ ...prev, ...parsed }));
          setFormData(prev => ({
            ...prev,
            phone: parsed.phone || (user ? user.phone : prev.phone),
            email: parsed.email || (user ? user.email : prev.email),
            bankName: parsed.bankName || (user ? user.bankName : prev.bankName),
            accountNumber: parsed.accountNumber || (user ? user.accountNumber : prev.accountNumber),
            currentAddress: parsed.address || prev.currentAddress,
            employmentType: parsed.occupation ? getOccupationTitle(parsed.occupation) : (user ? getOccupationTitle(user.occupation) : prev.employmentType)
          }));
        } else {
          localStorage.removeItem('verifiedEkyc');
        }
      } catch (err) {
        console.error(err);
      }
    }

    const savedProposal = localStorage.getItem('selectedLoanProposal');
    if (savedProposal) {
      try {
        const parsed = JSON.parse(savedProposal);
        setLoanProposal(parsed);
      } catch (err) {
        console.error(err);
      }
    }

    // Attempt to load remote draft from backend server
    const fetchRemoteDraft = async () => {
      try {
        const res = await api.getDraft();
        if (res.success && res.data) {
          if (res.data.form) setFormData(prev => ({ ...prev, ...res.data.form }));
          if (res.data.loanProposal) setLoanProposal(res.data.loanProposal);
          if (res.data.ekyc) setEkycData(prev => ({ ...prev, ...res.data.ekyc }));
          if (res.data.activeTab) setActiveTab(res.data.activeTab);
        }
      } catch (err) {
        console.warn('Could not load remote draft:', err.message);
      }
    };
    if (user) {
      fetchRemoteDraft();
    }
  }, [user]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  // Calculate Debt-to-Income (DTI)
  const totalIncome = Number(formData.monthlyIncome) + Number(formData.otherIncome);
  const estimatedMonthlyLoanRepayment = (loanProposal.amount / loanProposal.termMonths) + (loanProposal.amount * 0.01);
  const totalObligations = Number(formData.monthlyExpenses) + Number(formData.existingDebtPayment) + estimatedMonthlyLoanRepayment;
  const dtiRatio = totalIncome > 0 ? Math.round((totalObligations / totalIncome) * 100) : 0;

  // Validate step navigation
  const handleProceed = (nextStep) => {
    setValidationError('');

    // Tab 1 validation
    if (activeTab === 'personal') {
      if (!formData.phone || !formData.email || !formData.currentAddress) {
        setValidationError('Vui lòng điền đầy đủ số điện thoại, email và địa chỉ cư trú hiện tại.');
        return;
      }
      setActiveTab('employment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Tab 2 validation
    if (activeTab === 'employment') {
      if (!formData.companyName || !formData.monthlyIncome || formData.monthlyIncome <= 0) {
        setValidationError('Vui lòng điền tên công ty và mức thu nhập hàng tháng hợp lệ.');
        return;
      }
      setActiveTab('reference');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Tab 3 validation: References
    if (activeTab === 'reference') {
      // 1. Mandatory check
      if (!formData.ref1Name || !formData.ref1Phone || !formData.ref2Name || !formData.ref2Phone) {
        setValidationError('Bắt buộc phải cung cấp đầy đủ thông tin của 2 người tham chiếu.');
        return;
      }

      // 2. Validate reference phone numbers are distinct
      if (formData.ref1Phone.trim() === formData.ref2Phone.trim()) {
        setValidationError('Lỗi: Số điện thoại người tham chiếu 1 và người tham chiếu 2 KHÔNG được trùng nhau!');
        return;
      }

      // 3. Validate reference phone does not match applicant's phone
      if (formData.ref1Phone.trim() === formData.phone.trim() || formData.ref2Phone.trim() === formData.phone.trim()) {
        setValidationError('Lỗi: Số điện thoại người tham chiếu không được trùng với số điện thoại của chính bạn!');
        return;
      }

      if (!formData.accountNumber) {
        setValidationError('Vui lòng nhập số tài khoản ngân hàng để nhận giải ngân.');
        return;
      }

      // Save complete form to localStorage
      const applicationPayload = {
        ekyc: ekycData,
        loanProposal,
        form: formData,
        dtiRatio,
        submittedAt: new Date().toISOString()
      };
      localStorage.setItem('loanApplicationDraft', JSON.stringify(applicationPayload));

      // Navigate to Step 5: Document Upload
      navigate('/apply/upload');
    }
  };

  const handleSaveDraft = async () => {
    setAutoSyncing(true);
    const draftPayload = {
      ekyc: ekycData,
      loanProposal,
      form: formData,
      activeTab,
      dtiRatio,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem('loanApplicationDraft', JSON.stringify(draftPayload));

    // Realtime Socket save and REST API fallback
    try {
      await saveDraftRealtime(draftPayload);
      await api.saveDraft(draftPayload);
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (err) {
      console.error('Draft save failed', err);
    } finally {
      setAutoSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500">
      
      {/* Header & Steps */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Bước 2 / 4</span>
            <h1 className="text-2xl font-black text-slate-900">Tạo Hồ Sơ Vay Vốn & Thu Thập Dữ Liệu Rủi Ro</h1>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Realtime Live Indicator */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              connected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span>{connected ? 'Realtime Đồng Bộ' : 'Ngoại tuyến (Offline)'}</span>
            </div>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={autoSyncing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition"
            >
              <Save className="w-3.5 h-3.5 text-blue-600" />
              {autoSyncing ? 'Đang lưu máy chủ...' : draftSaved ? 'Đã lưu & đồng bộ ✓' : 'Lưu hồ sơ nháp'}
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          <div className="h-2 rounded-full bg-blue-600"></div>
          <div className="h-2 rounded-full bg-blue-600"></div>
          <div className="h-2 rounded-full bg-slate-200"></div>
          <div className="h-2 rounded-full bg-slate-200"></div>
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1.5">
          <span className="text-emerald-600 font-bold">1. eKYC (Hoàn tất ✓)</span>
          <span className="text-blue-600 font-bold">2. Tạo hồ sơ vay</span>
          <span>3. Tải chứng từ</span>
          <span>4. Ký hợp đồng</span>
        </div>
      </div>

      {/* Proposal Summary Badge */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Gói vay đang đăng ký:</span>
            {loanProposal.productName && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                {loanProposal.productName}
              </span>
            )}
          </div>
          <div className="text-base font-black text-slate-900">
            Số tiền: <span className="text-blue-600">{formatCurrency(loanProposal.amount)}</span> | Kỳ hạn: <span className="text-blue-600">{loanProposal.termMonths} tháng</span>
            {loanProposal.interestRate && (
              <span className="text-xs font-semibold text-emerald-600 ml-2">
                (Lãi: {loanProposal.interestRate}%/tháng)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">DTI Ước Tính:</span>
            <span className={`text-xs font-bold ${dtiRatio <= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {dtiRatio}% ({dtiRatio <= 50 ? 'An Toàn' : 'Cần Chú Ý'})
            </span>
          </div>
          <div className="h-8 w-px bg-blue-200"></div>
          <div className="text-xs font-bold text-slate-700">
            Trả tháng đầu: {formatCurrency(estimatedMonthlyLoanRepayment)}
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Stepper Tabs + Content Form */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Sub-stepper Nav */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2">
          <button 
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex-1 md:flex-none flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all border ${activeTab === 'personal' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <User className={`w-5 h-5 ${activeTab === 'personal' ? 'text-white' : 'text-blue-600'}`} />
            <div>
              <div className="font-bold text-xs">Phần 1</div>
              <div className="text-[11px] font-medium opacity-90">Cá nhân & Cư trú</div>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('employment')}
            className={`flex-1 md:flex-none flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all border ${activeTab === 'employment' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Briefcase className={`w-5 h-5 ${activeTab === 'employment' ? 'text-white' : 'text-blue-600'}`} />
            <div>
              <div className="font-bold text-xs">Phần 2</div>
              <div className="text-[11px] font-medium opacity-90">Công việc & Thu nhập</div>
            </div>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('reference')}
            className={`flex-1 md:flex-none flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all border ${activeTab === 'reference' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Users className={`w-5 h-5 ${activeTab === 'reference' ? 'text-white' : 'text-blue-600'}`} />
            <div>
              <div className="font-bold text-xs">Phần 3</div>
              <div className="text-[11px] font-medium opacity-90">Người tham chiếu & STK</div>
            </div>
          </button>
        </div>

        {/* Right Form Card */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
          
          {/* Validation Alert */}
          {validationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-3 animate-in shake">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">{validationError}</div>
            </div>
          )}

          {/* TAB 1: PERSONAL & RESIDENCE */}
          {activeTab === 'personal' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Locked eKYC Fields Group */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Thông tin định danh pháp lý (Từ eKYC - Khóa cố định)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Chống sửa đổi
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Họ và Tên
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={ekycData.fullName} 
                        disabled 
                        className="input-human w-full bg-slate-100/90 text-slate-600 font-bold uppercase cursor-not-allowed pr-8" 
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Số CCCD (12 chữ số)
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={ekycData.idNumber} 
                        disabled 
                        className="input-human w-full bg-slate-100/90 text-slate-600 font-mono font-bold cursor-not-allowed pr-8" 
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Ngày sinh
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={ekycData.dob} 
                        disabled 
                        className="input-human w-full bg-slate-100/90 text-slate-600 cursor-not-allowed pr-8" 
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Giới tính
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={ekycData.gender || 'Nam'} 
                        disabled 
                        className="input-human w-full bg-slate-100/90 text-slate-600 cursor-not-allowed pr-8" 
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Personal & Residence Info */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">
                  Tình trạng nhân khẩu & Cư trú hiện tại
                </h3>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Số điện thoại liên lạc *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="input-human w-full font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Địa chỉ Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input-human w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Tình trạng hôn nhân *</label>
                    <select
                      value={formData.maritalStatus}
                      onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      <option value="Độc thân">Độc thân</option>
                      <option value="Đã kết hôn">Đã kết hôn</option>
                      <option value="Ly hôn / Góa">Ly hôn / Góa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Số người phụ thuộc tài chính *</label>
                    <select
                      value={formData.dependents}
                      onChange={(e) => setFormData({...formData, dependents: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      <option value="0">0 người</option>
                      <option value="1">1 người</option>
                      <option value="2">2 người</option>
                      <option value="3+">Trên 2 người</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Trình độ học vấn cao nhất *</label>
                    <select
                      value={formData.education}
                      onChange={(e) => setFormData({...formData, education: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      <option value="Đại học">Đại học</option>
                      <option value="Cao đẳng / Trung cấp">Cao đẳng / Trung cấp</option>
                      <option value="Sau đại học (ThS/TS)">Sau đại học (Thạc sĩ / Tiến sĩ)</option>
                      <option value="Trung học phổ thông">Trung học phổ thông (THPT)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Hình thức sở hữu nhà ở *</label>
                    <select
                      value={formData.housingStatus}
                      onChange={(e) => setFormData({...formData, housingStatus: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      <option value="Nhà sở hữu riêng">Nhà sở hữu riêng (Đứng tên)</option>
                      <option value="Nhà của bố mẹ/gia đình">Ở cùng nhà bố mẹ / gia đình</option>
                      <option value="Thuê nhà / Căn hộ">Thuê nhà / Thuê phòng trọ</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Địa chỉ nơi ở hiện tại (Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP) *
                    </label>
                    <input
                      type="text"
                      value={formData.currentAddress}
                      onChange={(e) => setFormData({...formData, currentAddress: e.target.value})}
                      className="input-human w-full font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleProceed('employment')}
                  className="btn-primary py-3 px-8 rounded-xl font-bold text-xs flex items-center gap-2"
                >
                  Tiếp tục: Nghề nghiệp & Thu nhập
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: EMPLOYMENT & FINANCIAL PROFILE */}
          {activeTab === 'employment' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 border-b border-slate-100 pb-2">
                  Thông tin việc làm & Nguồn thu nhập
                </h3>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Hình thức lao động *</label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({...formData, employmentType: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      <option value="Nhân viên chính thức">Hợp đồng lao động chính thức</option>
                      <option value="Công chức / Viên chức">Công chức / Viên chức nhà nước</option>
                      <option value="Chủ hộ kinh doanh / Doanh nghiệp">Chủ hộ kinh doanh / Chủ doanh nghiệp</option>
                      <option value="Lao động tự do (Freelance)">Lao động tự do (Freelancer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Chức vụ / Vị trí *</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      placeholder="Ví dụ: Kỹ sư, Trưởng phòng, Chuyên viên..."
                      className="input-human w-full font-medium"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1.5">Tên công ty / Cơ quan công tác *</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Ví dụ: Công ty TNHH Giải pháp Số Quốc tế..."
                      className="input-human w-full font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Mã số thuế công ty (nếu có)</label>
                    <input
                      type="text"
                      value={formData.companyTaxId}
                      onChange={(e) => setFormData({...formData, companyTaxId: e.target.value})}
                      placeholder="010xxxxxxx"
                      className="input-human w-full font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Thâm niên công tác tại cty hiện tại (tháng) *</label>
                    <input
                      type="number"
                      value={formData.workTenureMonths}
                      onChange={(e) => setFormData({...formData, workTenureMonths: e.target.value})}
                      className="input-human w-full font-medium"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Thu nhập thực nhận hàng tháng (VNĐ) *
                    </label>
                    <input
                      type="number"
                      step="500000"
                      value={formData.monthlyIncome}
                      onChange={(e) => setFormData({...formData, monthlyIncome: Number(e.target.value)})}
                      className="input-human w-full font-bold text-blue-600 text-sm"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Hiển thị: <strong>{formatCurrency(formData.monthlyIncome)}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Hình thức nhận lương *</label>
                    <select
                      value={formData.incomePaymentMethod}
                      onChange={(e) => setFormData({...formData, incomePaymentMethod: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng (Ưu tiên duyệt)</option>
                      <option value="Tiền mặt">Tiền mặt có phiếu lương công ty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Chi phí sinh hoạt gia đình/tháng (VNĐ)</label>
                    <input
                      type="number"
                      step="500000"
                      value={formData.monthlyExpenses}
                      onChange={(e) => setFormData({...formData, monthlyExpenses: Number(e.target.value)})}
                      className="input-human w-full font-medium"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Hiển thị: {formatCurrency(formData.monthlyExpenses)}
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Nợ đang trả ở nơi khác/tháng (nếu có)</label>
                    <input
                      type="number"
                      step="500000"
                      value={formData.existingDebtPayment}
                      onChange={(e) => setFormData({...formData, existingDebtPayment: Number(e.target.value)})}
                      className="input-human w-full font-medium"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Hiển thị: {formatCurrency(formData.existingDebtPayment)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại Phần 1
                </button>

                <button
                  type="button"
                  onClick={() => handleProceed('reference')}
                  className="btn-primary py-3 px-8 rounded-xl font-bold text-xs flex items-center gap-2"
                >
                  Tiếp tục: Người tham chiếu & STK
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: REFERENCES & DISBURSEMENT ACCOUNT */}
          {activeTab === 'reference' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Reference 1 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  Người tham chiếu 1 (Ưu tiên Người thân trong gia đình) *
                </h4>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      value={formData.ref1Name}
                      onChange={(e) => setFormData({...formData, ref1Name: e.target.value})}
                      placeholder="Nguyễn Văn B"
                      className="input-human w-full font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mối quan hệ *</label>
                    <select
                      value={formData.ref1Relation}
                      onChange={(e) => setFormData({...formData, ref1Relation: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      <option value="Bố/Mẹ">Bố / Mẹ</option>
                      <option value="Vợ/Chồng">Vợ / Chồng</option>
                      <option value="Anh/Chị/Em">Anh / Chị / Em ruột</option>
                      <option value="Họ hàng">Người thân khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      value={formData.ref1Phone}
                      onChange={(e) => setFormData({...formData, ref1Phone: e.target.value})}
                      placeholder="0912xxxxxx"
                      className="input-human w-full font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Reference 2 */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  Người tham chiếu 2 (Đồng nghiệp / Bạn bè) *
                </h4>

                <div className="grid sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Họ và Tên *</label>
                    <input
                      type="text"
                      value={formData.ref2Name}
                      onChange={(e) => setFormData({...formData, ref2Name: e.target.value})}
                      placeholder="Trần Văn C"
                      className="input-human w-full font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mối quan hệ *</label>
                    <select
                      value={formData.ref2Relation}
                      onChange={(e) => setFormData({...formData, ref2Relation: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      <option value="Đồng nghiệp">Đồng nghiệp cùng cơ quan</option>
                      <option value="Bạn thân">Bạn thân</option>
                      <option value="Cấp trên">Quản lý / Cấp trên</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      value={formData.ref2Phone}
                      onChange={(e) => setFormData({...formData, ref2Phone: e.target.value})}
                      placeholder="0988xxxxxx"
                      className="input-human w-full font-semibold"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Account for Disbursement */}
              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-blue-600" />
                  Tài khoản nhận tiền giải ngân
                </h4>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Ngân hàng thụ hưởng *</label>
                    <select
                      value={formData.bankName}
                      onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      {VIETNAM_BANKS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Số tài khoản ngân hàng *</label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                      placeholder="Nhập số tài khoản nhận tiền"
                      className="input-human w-full font-mono font-bold text-slate-900"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Tên chủ tài khoản (Bắt buộc trùng CCCD) *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={ekycData.fullName}
                        disabled
                        className="input-human w-full bg-slate-100 text-slate-600 font-bold uppercase cursor-not-allowed pr-8"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      * Theo quy định phòng chống rửa tiền, tên chủ tài khoản nhận tiền phải hoàn toàn trùng khớp với tên trên Căn cước công dân đã xác minh.
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('employment')}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại Phần 2
                </button>

                <button
                  type="button"
                  onClick={() => handleProceed('submit')}
                  className="btn-primary py-3 px-8 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  Hoàn tất hồ sơ & Đi đến Tải chứng từ
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default LoanApplicationForm;
