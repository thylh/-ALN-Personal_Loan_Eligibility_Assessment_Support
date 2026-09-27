import React, { useState } from 'react';
import { 
  FileText, MessageSquare, Mail, Copy, 
  Check, Save, Eye, Sparkles, Smartphone, CheckCircle2
} from 'lucide-react';

const CONTRACT_VARIABLES = [
  { tag: '{{CustomerName}}', desc: 'Họ tên khách hàng' },
  { tag: '{{IdNumber}}', desc: 'Số CCCD' },
  { tag: '{{Phone}}', desc: 'Số điện thoại' },
  { tag: '{{Address}}', desc: 'Địa chỉ cư trú' },
  { tag: '{{LoanAmount}}', desc: 'Số tiền vay (VNĐ)' },
  { tag: '{{TermMonths}}', desc: 'Kỳ hạn (tháng)' },
  { tag: '{{InterestRate}}', desc: 'Lãi suất (%/tháng)' },
  { tag: '{{MonthlyRepayment}}', desc: 'Số tiền trả mỗi kỳ' },
  { tag: '{{BankName}}', desc: 'Ngân hàng thụ hưởng' },
  { tag: '{{BankAccount}}', desc: 'Số tài khoản nhận tiền' },
  { tag: '{{ContractId}}', desc: 'Mã hợp đồng tín dụng' },
  { tag: '{{CurrentDate}}', desc: 'Ngày ký kết' }
];

const INITIAL_CONTRACT_CONTENT = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-----------------------------------
HỢP ĐỒNG CHO VAY TIÊU DÙNG TÍN CHẤP
Mã hợp đồng: {{ContractId}}

BÊN CHO VAY (BÊN A): CÔNG TY TÀI CHÍNH TỔNG HỢP LOMS
Đại diện: Ông Lê Văn Cường - Chức vụ: Tổng Giám Đốc

BÊN VAY (BÊN B):
- Họ và tên: {{CustomerName}}
- Số CCCD: {{IdNumber}} - Điện thoại: {{Phone}}
- Địa chỉ: {{Address}}

HAI BÊN THỐNG NHẤT CÁC ĐIỀU KHOẢN SAU:
Điều 1. Số tiền cho vay: {{LoanAmount}} VNĐ.
Điều 2. Thời hạn vay: {{TermMonths}} tháng tính từ ngày giải ngân.
Điều 3. Lãi suất cho vay: {{InterestRate}}%/tháng tính theo dư nợ thực tế. Số tiền trả góp hàng tháng ước tính: {{MonthlyRepayment}} VNĐ.
Điều 4. Tiền giải ngân được chuyển vào tài khoản số {{BankAccount}} tại {{BankName}}.
Điều 5. Hợp đồng này được ký kết điện tử bằng mã OTP SMS có giá trị pháp lý ràng buộc.`;

const INITIAL_SMS_TEMPLATES = {
  otp: '[LOMS] Ma OTP xac thuc ky hop dong tin dung {{ContractId}} cua ban la: {{OtpCode}}. Hieu luc trong 60 giay. Khong chia se ma nay cho bat ky ai.',
  disbursed: '[LOMS] Khoan vay {{ContractId}} da duoc giai ngan thanh cong {{LoanAmount}} vao TK {{BankName}} {{BankAccount}}. Hotline 19008899.',
  dueReminder: '[LOMS] Nhac nho: Ky tra no {{ContractId}} cua quy khach se den han vao ngay {{DueDate}}. So tien: {{MonthlyRepayment}} VND. Vui long quet VietQR de thanh toan.'
};

const TemplateConfig = () => {
  const [activeTab, setActiveTab] = useState('contract'); // 'contract' or 'sms'
  const [contractTemplate, setContractTemplate] = useState(INITIAL_CONTRACT_CONTENT);
  const [smsTemplates, setSmsTemplates] = useState(INITIAL_SMS_TEMPLATES);
  const [selectedSmsKey, setSelectedSmsKey] = useState('dueReminder');
  const [previewMode, setPreviewMode] = useState(false);
  const [copiedTag, setCopiedTag] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleCopyTag = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handleSave = () => {
    setSaveSuccess('Lưu cấu hình biểu mẫu văn bản thành công!');
    setTimeout(() => setSaveSuccess(''), 2500);
  };

  // Render preview text with sample values
  const renderPreviewContract = () => {
    return contractTemplate
      .replace(/{{CustomerName}}/g, 'NGUYỄN VĂN AN')
      .replace(/{{IdNumber}}/g, '001099123456')
      .replace(/{{Phone}}/g, '0901234567')
      .replace(/{{Address}}/g, 'Số 45 Hoàng Quốc Việt, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội')
      .replace(/{{LoanAmount}}/g, '50.000.000 đ')
      .replace(/{{TermMonths}}/g, '12')
      .replace(/{{InterestRate}}/g, '1.0%')
      .replace(/{{MonthlyRepayment}}/g, '4.541.667 đ')
      .replace(/{{BankName}}/g, 'Vietcombank')
      .replace(/{{BankAccount}}/g, '990123456789')
      .replace(/{{ContractId}}/g, 'HD-2026-LOMS-8921')
      .replace(/{{CurrentDate}}/g, '27/09/2026');
  };

  const currentSmsText = smsTemplates[selectedSmsKey];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Cấu Hình Biểu Mẫu Hợp Đồng & SMS (Template Engine)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý văn bản pháp lý và các kịch bản tin nhắn thông báo tự động sử dụng biến nội suy (Variables).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab switcher */}
          <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('contract')}
              className={`px-4 py-2 rounded-xl transition ${activeTab === 'contract' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Mẫu Hợp đồng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sms')}
              className={`px-4 py-2 rounded-xl transition ${activeTab === 'sms' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Mẫu Tin nhắn SMS
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="btn-primary py-2 px-5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" /> Lưu cấu hình
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">{saveSuccess}</span>
        </div>
      )}

      {/* TAB 1: CONTRACT TEMPLATE EDITOR */}
      {activeTab === 'contract' && (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Editor (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Trình Soạn Thảo Văn Bản Hợp Đồng Tín Dụng
              </h3>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  previewMode ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {previewMode ? 'Chuyển sang Soạn thảo' : 'Xem trước với dữ liệu mẫu'}
              </button>
            </div>

            {previewMode ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap select-text h-[420px] overflow-y-auto">
                {renderPreviewContract()}
              </div>
            ) : (
              <textarea
                rows={18}
                value={contractTemplate}
                onChange={(e) => setContractTemplate(e.target.value)}
                className="input-human w-full font-mono text-xs leading-relaxed"
              />
            )}
          </div>

          {/* Right: Available Variables Palette (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Biến Số Tự Động Nội Suy
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Bấm vào biến để sao chép nhanh vào con trỏ</p>
            </div>

            <div className="space-y-2">
              {CONTRACT_VARIABLES.map((v) => (
                <div
                  key={v.tag}
                  onClick={() => handleCopyTag(v.tag)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 transition cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <span className="font-mono font-bold text-blue-700 text-xs block group-hover:text-blue-900">
                      {v.tag}
                    </span>
                    <span className="text-[10px] text-slate-500">{v.desc}</span>
                  </div>

                  <span className="text-[10px] text-slate-400 group-hover:text-blue-600 font-bold">
                    {copiedTag === v.tag ? 'Đã chép ✓' : 'Sao chép'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SMS TEMPLATES */}
      {activeTab === 'sms' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: SMS Editor (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Chọn mẫu tin nhắn SMS cần cấu hình
              </label>
              
              <div className="grid sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSmsKey('dueReminder')}
                  className={`p-3 rounded-2xl border text-left transition ${selectedSmsKey === 'dueReminder' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  <div className="text-xs">Nhắc nợ kỳ hạn</div>
                  <div className="text-[10px] text-slate-500">Trước 3 ngày</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSmsKey('otp')}
                  className={`p-3 rounded-2xl border text-left transition ${selectedSmsKey === 'otp' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  <div className="text-xs">Mã OTP ký HĐ</div>
                  <div className="text-[10px] text-slate-500">Bảo mật 60s</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSmsKey('disbursed')}
                  className={`p-3 rounded-2xl border text-left transition ${selectedSmsKey === 'disbursed' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                >
                  <div className="text-xs">Báo giải ngân</div>
                  <div className="text-[10px] text-slate-500">Napas 247</div>
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <label className="font-bold text-slate-700">Nội dung tin nhắn (Tiếng Việt không dấu chuẩn Brandname SMS)</label>
                <span className="text-slate-400 font-mono text-[11px]">
                  {currentSmsText.length} / 160 ký tự (1 Tin)
                </span>
              </div>
              <textarea
                rows={4}
                value={currentSmsText}
                onChange={(e) => setSmsTemplates({...smsTemplates, [selectedSmsKey]: e.target.value})}
                className="input-human w-full font-mono text-xs"
              />
            </div>
          </div>

          {/* Right: Mobile Phone Simulator (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" /> Mô Phỏng Hiển Thị Trên Điện Thoại
            </span>

            {/* Phone Screen Mockup */}
            <div className="w-64 bg-slate-950 rounded-[36px] border-4 border-slate-700 p-4 shadow-2xl space-y-4">
              <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto"></div>
              
              <div className="text-center space-y-0.5 border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-200 block">LOMS_FINTECH</span>
                <span className="text-[9px] text-slate-500 block">Brandname Tin Nhắn Chính Thức</span>
              </div>

              {/* Message Bubble */}
              <div className="p-3 bg-blue-600 rounded-2xl rounded-tl-none text-[11px] leading-relaxed text-white font-sans shadow-md">
                {currentSmsText
                  .replace(/{{ContractId}}/g, 'HD8921')
                  .replace(/{{OtpCode}}/g, '123456')
                  .replace(/{{LoanAmount}}/g, '50.000.000d')
                  .replace(/{{BankName}}/g, 'VCB')
                  .replace(/{{BankAccount}}/g, '990123456789')
                  .replace(/{{DueDate}}/g, '15/10/2026')
                  .replace(/{{MonthlyRepayment}}/g, '4.541.667d')
                }
              </div>

              <div className="text-[9px] text-slate-500 text-center font-mono pt-2">
                Hôm nay 10:15
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default TemplateConfig;
