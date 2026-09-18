import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FileCheck, UploadCloud, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, Sparkles, User, Briefcase, FileText } from 'lucide-react';

export default function ApplyLoanMultiStep() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    requestedAmount: 150000000,
    requestedTermMonths: 24,
    loanPurpose: 'Tiêu dùng cá nhân & Mua sắm',
    personalDetails: {
      fullName: user?.fullName || 'Nguyễn Văn An',
      dob: '1992-05-15',
      gender: 'Nam',
      educationLevel: 'Đại học',
      maritalStatus: 'Đã kết hôn',
      dependents: 1,
      address: '123 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh'
    },
    financialDetails: {
      grossMonthlyIncome: 35000000,
      monthlyExpenses: 12000000,
      existingMonthlyDebt: 3000000,
      workTenureYears: 4,
      employerName: 'Công ty TNHH Công Nghệ Việt',
      jobTitle: 'Kỹ sư Phần mềm',
      creditHistoryScore: 80
    },
    documents: [
      {
        id: 'doc_cccd',
        title: 'Ảnh CCCD Mặt Trước',
        docType: 'cccd',
        fileUrl: '/uploads/cccd_sample.png',
        ocrData: null,
        verified: false
      },
      {
        id: 'doc_saoke',
        title: 'Sao kê Lương 3 tháng gần nhất',
        docType: 'saoke',
        fileUrl: '/uploads/saoke_sample.pdf',
        ocrData: null,
        verified: false
      }
    ]
  });

  const handlePersonalChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, [field]: value }
    }));
  };

  const handleFinancialChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      financialDetails: { ...prev.financialDetails, [field]: value }
    }));
  };

  // OCR Upload handler (UC2.2)
  const handleFileUploadAndOCR = async (docIndex, file, docType) => {
    setOcrLoading(true);
    try {
      const res = await api.ocrExtract(file, docType);
      if (res.success) {
        setFormData(prev => {
          const newDocs = [...prev.documents];
          newDocs[docIndex] = {
            ...newDocs[docIndex],
            ocrData: res.data,
            verified: true
          };
          return { ...prev, documents: newDocs };
        });
      }
    } catch (err) {
      console.error('OCR Error', err);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.submitLoanApplication(formData);
      if (res.success) {
        navigate(`/application/${res.data._id}`);
      } else {
        setError(res.message || 'Nộp hồ sơ không thành công.');
      }
    } catch (err) {
      setError('Lỗi kết nối khi nộp hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Step Indicator Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Form Kê Khai Đơn Đăng Ký Vay Multi-Step (UC2.1)</h1>
        <p className="text-slate-400 text-sm">
          Nhập đầy đủ thông tin cá nhân, tài chính và đính kèm chứng từ bóc tách dữ liệu tự động qua OCR.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between relative bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
        {[
          { step: 1, title: 'Thông Tin Cá Nhân', icon: User },
          { step: 2, title: 'Tài Chính & Nợ', icon: Briefcase },
          { step: 3, title: 'Chứng Từ & OCR', icon: UploadCloud },
          { step: 4, title: 'Xác Nhận & Nộp', icon: FileCheck }
        ].map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.step;
          const isDone = currentStep > s.step;
          return (
            <div key={s.step} className="flex items-center gap-2 z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition ${isDone ? 'bg-emerald-600 text-white' : isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-700 text-slate-400'}`}>
                {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-semibold hidden md:inline ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* STEP 1: Personal Details */}
      {currentStep === 1 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-5">
          <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Bước 1: Thông Tin Cá Nhân Người Vay
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Họ và Tên (*)</label>
              <input
                type="text"
                value={formData.personalDetails.fullName}
                onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Ngày sinh</label>
              <input
                type="date"
                value={formData.personalDetails.dob}
                onChange={(e) => handlePersonalChange('dob', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Trình độ học vấn</label>
              <select
                value={formData.personalDetails.educationLevel}
                onChange={(e) => handlePersonalChange('educationLevel', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Đại học">Đại học / Sau đại học</option>
                <option value="Cao đẳng">Cao đẳng / Trung cấp</option>
                <option value="THPT">Trung học phổ thông</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tình trạng hôn nhân</label>
              <select
                value={formData.personalDetails.maritalStatus}
                onChange={(e) => handlePersonalChange('maritalStatus', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Đã kết hôn">Đã kết hôn</option>
                <option value="Độc thân">Độc thân</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Địa chỉ thường trú / Chỗ ở hiện tại</label>
              <input
                type="text"
                value={formData.personalDetails.address}
                onChange={(e) => handlePersonalChange('address', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Financial Details & Loan Specs */}
      {currentStep === 2 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-5">
          <h2 className="text-lg font-bold text-white border-b border-slate-700 pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" /> Bước 2: Kê Khai Tài Chính & Nợ Hàng Tháng
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Thu nhập hàng tháng (VNĐ) (*)</label>
              <input
                type="number"
                value={formData.financialDetails.grossMonthlyIncome}
                onChange={(e) => handleFinancialChange('grossMonthlyIncome', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Chi tiêu sinh hoạt hàng tháng (VNĐ)</label>
              <input
                type="number"
                value={formData.financialDetails.monthlyExpenses}
                onChange={(e) => handleFinancialChange('monthlyExpenses', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Trả nợ hiện tại hàng tháng (VNĐ)</label>
              <input
                type="number"
                value={formData.financialDetails.existingMonthlyDebt}
                onChange={(e) => handleFinancialChange('existingMonthlyDebt', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Thâm niên công tác (Số năm)</label>
              <input
                type="number"
                step="0.5"
                value={formData.financialDetails.workTenureYears}
                onChange={(e) => handleFinancialChange('workTenureYears', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tên đơn vị công tác</label>
              <input
                type="text"
                value={formData.financialDetails.employerName}
                onChange={(e) => handleFinancialChange('employerName', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Chức danh công việc</label>
              <input
                type="text"
                value={formData.financialDetails.jobTitle}
                onChange={(e) => handleFinancialChange('jobTitle', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Documents Upload & Smart OCR Extraction (UC2.2) */}
      {currentStep === 3 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-700 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-purple-400" /> Bước 3: Upload & Trích Xuất Chứng Từ Tự Động (OCR UC2.2)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tải lên tài liệu mẫu (CCCD, Sao kê tài khoản). Hệ thống sẽ tự bóc tách dữ liệu vào hồ sơ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.documents.map((doc, idx) => (
              <div key={doc.id} className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{doc.title}</span>
                  {doc.verified && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Đã Bóc Tách OCR
                    </span>
                  )}
                </div>

                <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center hover:border-blue-500 transition cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs text-slate-300 block font-medium">Bấm để chọn file hoặc kéo thả vào đây</span>
                  <input
                    type="file"
                    className="hidden"
                    id={`file-input-${idx}`}
                    onChange={(e) => {
                      if (e.target.files[0]) handleFileUploadAndOCR(idx, e.target.files[0], doc.docType);
                    }}
                  />
                  <label htmlFor={`file-input-${idx}`} className="mt-2 inline-block px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-400 rounded-lg border border-slate-700 cursor-pointer">
                    {ocrLoading ? 'Đang trích xuất OCR...' : 'Chọn Tệp Chứng Từ Mẫu'}
                  </label>
                </div>

                {doc.ocrData && (
                  <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-blue-400 block tracking-wider">Kết quả OCR trích xuất:</span>
                    <div className="text-slate-300">Loại: <span className="font-semibold text-white">{doc.ocrData.docType}</span></div>
                    {doc.ocrData.idNumber && <div className="text-slate-300">Số CCCD: <span className="font-semibold text-emerald-400">{doc.ocrData.idNumber}</span></div>}
                    {doc.ocrData.fullName && <div className="text-slate-300">Họ tên: <span className="font-semibold text-white">{doc.ocrData.fullName}</span></div>}
                    {doc.ocrData.averageMonthlyIncome && (
                      <div className="text-slate-300">Lương sao kê TB: <span className="font-semibold text-emerald-400">{(doc.ocrData.averageMonthlyIncome).toLocaleString('vi-VN')} VNĐ</span></div>
                    )}
                    <div className="text-[10px] text-slate-400 pt-1">Độ chính xác khớp: {doc.ocrData.matchScore}%</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Review & Submit */}
      {currentStep === 4 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-700 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Bước 4: Kiểm Tra Thông Tin & Kích Hoạt Bộ Máy Chấm Điểm
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Bấm Nộp Hồ Sơ để chuyển thông tin tới Rule-Based Credit Scoring Engine để tự động phân hạng rủi ro & đề xuất hạn mức.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/60 p-4 rounded-2xl border border-slate-700">
            <div>
              <span className="text-slate-400 block">Số tiền xin vay:</span>
              <span className="text-base font-extrabold text-blue-400">{(formData.requestedAmount).toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div>
              <span className="text-slate-400 block">Kỳ hạn vay:</span>
              <span className="text-base font-extrabold text-white">{formData.requestedTermMonths} tháng</span>
            </div>
            <div>
              <span className="text-slate-400 block">Người nộp:</span>
              <span className="text-sm font-semibold text-slate-200">{formData.personalDetails.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Thu nhập hàng tháng kê khai:</span>
              <span className="text-sm font-semibold text-emerald-400">{(formData.financialDetails.grossMonthlyIncome).toLocaleString('vi-VN')} VNĐ</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition flex items-center gap-2 border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Quay Lại
          </button>
        ) : <div />}

        {currentStep < 4 ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            Tiếp Theo <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-600/30 transition flex items-center gap-2"
          >
            {loading ? 'Đang tính toán & nộp...' : 'XÁC NHẬN NỘP HỒ SƠ & CHẤM ĐIỂM (UC3)'}
          </button>
        )}
      </div>

    </div>
  );
}
