import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, 
  XCircle, FileText, ZoomIn, ZoomOut, RotateCw, 
  Lock, DollarSign, Clock, User, Briefcase, 
  Users, Landmark, Check, AlertCircle, FileCheck
} from 'lucide-react';

const UnderwritingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Application details
  const [appData, setAppData] = useState({
    id: id || 'LOS-2026-001',
    customerName: 'NGUYỄN VĂN AN',
    phone: '0901234567',
    idNumber: '001099123456',
    dob: '15/08/1995',
    gender: 'Nam',
    address: 'Số 45 ngõ 120 đường Hoàng Quốc Việt, Cổ Nhuế 1, Bắc Từ Liêm, Hà Nội',
    maritalStatus: 'Độc thân',
    education: 'Đại học',
    dependents: 0,
    housing: 'Nhà sở hữu riêng',

    // Employment
    company: 'Công ty Cổ phần Công nghệ ABC Việt Nam',
    taxId: '0108991234',
    position: 'Kỹ sư phần mềm / IT',
    tenure: '28 tháng',
    monthlyIncome: 22000000,
    incomeMethod: 'Chuyển khoản Vietcombank',

    // References
    ref1: { name: 'Nguyễn Văn Bình', relation: 'Bố/Mẹ', phone: '0912345678' },
    ref2: { name: 'Trần Văn Cường', relation: 'Đồng nghiệp', phone: '0988776655' },

    // Disbursement Bank
    bankName: 'Vietcombank',
    bankAccount: '990123456789',
    accountHolder: 'NGUYỄN VĂN AN',

    // Loan Proposal
    requestedAmount: 50000000,
    termMonths: 12,
    product: 'Vay tín chấp theo lương',

    // Risk & Scoring
    cicScore: 785,
    cicGroup: 'Nhóm 1 (Nợ đủ tiêu chuẩn)',
    riskGrade: 'A',
    score: 785,
    dtiRatio: 32,
    faceMatchScore: 97.8,
    blacklistStatus: 'CLEAN',
    status: 'PENDING'
  });

  // Checklist condition
  const [cicChecked, setCicChecked] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(50000000);
  const [officerNote, setOfficerNote] = useState('Khách hàng có lịch sử tín dụng CIC nhóm 1 rất tốt, thu nhập 22 triệu qua chuyển khoản, DTI 32% an toàn.');

  // Document Viewer state
  const [activeDocTab, setActiveDocTab] = useState('bank_statement');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Decision Modal State
  const [modalAction, setModalAction] = useState(null); // 'APPROVE', 'RFI', 'REJECT'
  const [actionReason, setActionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState(false);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  const handleDecisionSubmit = () => {
    setActionSuccess(true);
    setTimeout(() => {
      setModalAction(null);
      navigate('/admin/los');
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/los"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Quay lại danh sách LOS"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-blue-700 font-mono">{appData.id}</span>
              <span className="text-base font-black text-slate-900">• {appData.customerName}</span>
              <span className={`risk-badge-${appData.riskGrade}`}>
                Hạng {appData.riskGrade} ({appData.score} đ)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Đề xuất: <strong className="text-slate-800">{formatCurrency(appData.requestedAmount)}</strong> ({appData.termMonths} tháng) • {appData.product}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-mono font-bold border border-red-200 flex items-center gap-1.5 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> SLA còn lại: 14 phút
          </span>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            Chờ thẩm định viên phê duyệt
          </span>
        </div>
      </div>

      {/* 3-COLUMN SPLIT VIEW WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= COLUMN 1 (LEFT - 4 COLS): DEMOGRAPHICS & PROFILE ================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1.1: Personal & eKYC */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              1. Thông tin nhân khẩu & eKYC
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Số CCCD (12 số):</span>
                <span className="font-mono font-bold text-slate-800">{appData.idNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ngày sinh / Giới tính:</span>
                <span className="font-medium text-slate-800">{appData.dob} ({appData.gender})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số điện thoại:</span>
                <span className="font-semibold text-blue-600">{appData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Học vấn / Hôn nhân:</span>
                <span className="font-medium text-slate-800">{appData.education} • {appData.maritalStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hình thức nhà ở:</span>
                <span className="font-medium text-slate-800">{appData.housing}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Địa chỉ nơi ở:</span>
                <span className="font-medium text-slate-800 text-[11px] block">{appData.address}</span>
              </div>
            </div>
          </div>

          {/* Card 1.2: Employment & Income */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              2. Nghề nghiệp & Nguồn thu nhập
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Cơ quan công tác:</span>
                <strong className="text-slate-900 block text-xs">{appData.company}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chức vụ:</span>
                <span className="font-semibold text-slate-800">{appData.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thâm niên:</span>
                <span className="font-medium text-slate-800">{appData.tenure}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-600 font-bold">Thu nhập thực nhận:</span>
                <span className="font-black text-blue-600 text-sm">{formatCurrency(appData.monthlyIncome)}/tháng</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hình thức chi lương:</span>
                <span className="text-[11px] font-semibold text-emerald-600">{appData.incomeMethod}</span>
              </div>
            </div>
          </div>

          {/* Card 1.3: References & Bank Account */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Users className="w-4 h-4 text-blue-600" />
              3. Người tham chiếu & Tài khoản chi
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{appData.ref1.name}</span>
                  <span className="text-blue-600">({appData.ref1.relation})</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">{appData.ref1.phone}</span>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-800">{appData.ref2.name}</span>
                  <span className="text-blue-600">({appData.ref2.relation})</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500">{appData.ref2.phone}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tài khoản nhận giải ngân:</span>
                <div className="flex justify-between font-mono font-bold">
                  <span>{appData.bankName}</span>
                  <span className="text-blue-700">{appData.bankAccount}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Chủ TK trùng 100% với CCCD eKYC
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= COLUMN 2 (CENTER - 4 COLS): CIC, SCORING & COMPLIANCE ================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 2.1: Credit Bureau CIC Check */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Tra cứu Trung tâm Tín dụng (CIC)
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                CIC Sạch
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Phân nhóm nợ hiện tại:</span>
                <strong className="text-emerald-700">{appData.cicGroup}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Lịch sử quá hạn 36 tháng:</span>
                <strong className="text-slate-900">0 lần</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Số TCTD đang có quan hệ nợ:</span>
                <strong className="text-slate-900">1 ngân hàng (Thẻ tín dụng)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Tổng dư nợ hiện tại:</span>
                <strong className="text-slate-900">5.200.000 đ</strong>
              </div>
            </div>
          </div>

          {/* Card 2.2: Credit Scoring Engine & DTI */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-600" />
                Mô hình Chấm điểm Tín dụng AI
              </h3>
              <span className="text-xs font-black text-emerald-600">785 / 1000 Điểm</span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">Thu nhập & Việc làm (25%):</span>
                  <span className="font-bold text-blue-700">95 / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">Chỉ số DTI gánh nợ (30%):</span>
                  <span className="font-bold text-emerald-600">DTI: {appData.dtiRatio}% (Rất an toàn)</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">Thâm niên công tác (20%):</span>
                  <span className="font-bold text-blue-700">85 / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">Lịch sử tín dụng CIC (15%):</span>
                  <span className="font-bold text-blue-700">95 / 100</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>

            {/* Blacklist check */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Kiểm tra Gian lận & Blacklist: PASSED
              </div>
              <p className="text-[11px] text-emerald-700">
                Khuôn mặt khớp CCCD 97.8% (≥ 80%). Không nằm trong danh sách đen rửa tiền hay gian lận công nghệ.
              </p>
            </div>
          </div>

          {/* Card 2.3: Compliance Checkbox & Officer Note */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Xác nhận Thẩm định & Ghi chú
            </h3>

            {/* Mandatory Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={cicChecked}
                onChange={(e) => setCicChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-bold text-blue-900 leading-relaxed">
                Tôi xác nhận đã kiểm tra tra cứu CIC, đối chiếu hồ sơ và dữ liệu rủi ro theo đúng quy định tín dụng.
              </span>
            </label>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ghi chú của thẩm định viên</label>
              <textarea
                rows={2}
                value={officerNote}
                onChange={(e) => setOfficerNote(e.target.value)}
                className="input-human w-full text-xs"
                placeholder="Nhập nhận định thẩm định..."
              />
            </div>
          </div>

        </div>

        {/* ================= COLUMN 3 (RIGHT - 4 COLS): DOCUMENT VIEWER ================= */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[680px]">
          
          {/* Document Tabs */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex gap-1 text-[11px] font-bold overflow-x-auto">
            <button
              type="button"
              onClick={() => { setActiveDocTab('bank_statement'); setZoomLevel(1); }}
              className={`px-3 py-1.5 rounded-xl transition flex-shrink-0 ${activeDocTab === 'bank_statement' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Sao kê lương
            </button>
            <button
              type="button"
              onClick={() => { setActiveDocTab('labor_contract'); setZoomLevel(1); }}
              className={`px-3 py-1.5 rounded-xl transition flex-shrink-0 ${activeDocTab === 'labor_contract' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Hợp đồng LĐ
            </button>
            <button
              type="button"
              onClick={() => { setActiveDocTab('cccd_front'); setZoomLevel(1); }}
              className={`px-3 py-1.5 rounded-xl transition flex-shrink-0 ${activeDocTab === 'cccd_front' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              CCCD trước
            </button>
            <button
              type="button"
              onClick={() => { setActiveDocTab('cccd_back'); setZoomLevel(1); }}
              className={`px-3 py-1.5 rounded-xl transition flex-shrink-0 ${activeDocTab === 'cccd_back' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              CCCD sau
            </button>
          </div>

          {/* Controls Bar */}
          <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50/50">
            <span className="font-semibold truncate">
              {activeDocTab === 'bank_statement' && 'Sao_ke_luong_VCB_T7-T9.pdf'}
              {activeDocTab === 'labor_contract' && 'Hop_dong_lao_dong_ABC.pdf'}
              {activeDocTab === 'cccd_front' && 'CCCD_Mat_Truoc.jpg'}
              {activeDocTab === 'cccd_back' && 'CCCD_Mat_Sau.jpg'}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel(curr => Math.min(curr + 0.25, 2.5))}
                className="p-1 rounded hover:bg-slate-200"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(curr => Math.max(curr - 0.25, 0.75))}
                className="p-1 rounded hover:bg-slate-200"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setRotation(curr => (curr + 90) % 360)}
                className="p-1 rounded hover:bg-slate-200"
                title="Xoay ảnh"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Document Canvas Display */}
          <div className="flex-1 p-4 overflow-auto bg-slate-100 flex items-center justify-center">
            <div
              style={{
                transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
              className="max-h-[500px] max-w-full"
            >
              {activeDocTab === 'bank_statement' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 w-72 text-[10px] space-y-2">
                  <div className="border-b pb-2 font-bold text-center text-slate-900">
                    NGÂN HÀNG NGOẠI THƯƠNG (VIETCOMBANK)
                    <p className="text-[8px] text-slate-400 font-normal">SAO KÊ TÀI KHOẢN TIỀN LƯƠNG</p>
                  </div>
                  <p>Chủ TK: <strong>NGUYEN VAN AN</strong></p>
                  <p>Số TK: <strong>990123456789</strong></p>
                  <div className="divide-y text-[9px] pt-1">
                    <div className="py-1 flex justify-between">
                      <span>05/09 - CTY ABC TRA LUONG</span>
                      <strong className="text-emerald-600">+22.000.000 đ</strong>
                    </div>
                    <div className="py-1 flex justify-between">
                      <span>05/08 - CTY ABC TRA LUONG</span>
                      <strong className="text-emerald-600">+22.000.000 đ</strong>
                    </div>
                    <div className="py-1 flex justify-between">
                      <span>05/07 - CTY ABC TRA LUONG</span>
                      <strong className="text-emerald-600">+22.000.000 đ</strong>
                    </div>
                  </div>
                  <div className="pt-2 text-center text-emerald-600 font-bold border-t">
                    [ĐÃ XÁC THỰC MỘC SỐ NGÂN HÀNG]
                  </div>
                </div>
              )}

              {activeDocTab === 'labor_contract' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 w-72 text-[10px] space-y-2">
                  <div className="border-b pb-2 font-bold text-center text-slate-900">
                    CÔNG TY CỔ PHẦN CÔNG NGHỆ ABC
                    <p className="text-[8px] text-slate-400 font-normal">HỢP ĐỒNG LAO ĐỘNG VÔ THỜI HẠN</p>
                  </div>
                  <p>Người lao động: <strong>NGUYỄN VĂN AN</strong></p>
                  <p>Chức danh: <strong>Kỹ sư phần mềm</strong></p>
                  <p>Mức lương cơ bản: <strong>22.000.000 đ / tháng</strong></p>
                  <p>Tình trạng hiệu lực: <strong className="text-emerald-600">Đang có hiệu lực</strong></p>
                  <div className="pt-3 text-center border-t text-slate-400">
                    [MỘC TRÒN PHÁP LÝ DOANH NGHIỆP]
                  </div>
                </div>
              )}

              {(activeDocTab === 'cccd_front' || activeDocTab === 'cccd_back') && (
                <img
                  src={activeDocTab === 'cccd_front' 
                    ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
                    : 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80'
                  }
                  alt="CCCD"
                  className="rounded-xl shadow-lg object-contain max-h-72"
                />
              )}
            </div>
          </div>

        </div>

      </div>

      {/* ================= FIXED ACTION BAR (BOTTOM) ================= */}
      <div className="sticky bottom-4 z-40 bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Approved Amount Modifier */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-300 font-bold whitespace-nowrap">Hạn mức phê duyệt:</span>
          <div className="relative">
            <input
              type="number"
              step="1000000"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(Number(e.target.value))}
              className="input-human py-1.5 px-3 bg-slate-800 text-white border-slate-700 font-black text-sm w-44 text-right"
            />
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">VNĐ</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          
          {/* Request For Information (RFI) */}
          <button
            type="button"
            onClick={() => setModalAction('RFI')}
            className="px-4 py-2.5 rounded-xl border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" /> Yêu cầu bổ sung (RFI)
          </button>

          {/* Reject */}
          <button
            type="button"
            onClick={() => setModalAction('REJECT')}
            className="px-4 py-2.5 rounded-xl border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" /> Từ chối
          </button>

          {/* Approve Button (Conditional on CIC checked) */}
          <button
            type="button"
            disabled={!cicChecked}
            onClick={() => setModalAction('APPROVE')}
            className={`py-2.5 px-7 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition ${
              cicChecked
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
            title={!cicChecked ? 'Vui lòng tích vào ô xác nhận đã kiểm tra CIC ở Cột 2' : 'Phê duyệt hồ sơ'}
          >
            <CheckCircle2 className="w-4 h-4" /> Chấp thuận cho vay (Approve)
          </button>

        </div>

      </div>

      {/* CONFIRMATION / ACTION MODAL */}
      {modalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            
            <div className="text-center space-y-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
                modalAction === 'APPROVE' ? 'bg-emerald-100 text-emerald-600' : modalAction === 'RFI' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
              }`}>
                {modalAction === 'APPROVE' && <CheckCircle2 className="w-8 h-8" />}
                {modalAction === 'RFI' && <AlertTriangle className="w-8 h-8" />}
                {modalAction === 'REJECT' && <XCircle className="w-8 h-8" />}
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                {modalAction === 'APPROVE' && 'Xác Nhận Phê Duyệt Hồ Sơ Vay'}
                {modalAction === 'RFI' && 'Yêu Cầu Khách Hàng Bổ Sung Hồ Sơ'}
                {modalAction === 'REJECT' && 'Xác Nhận Từ Chối Khoản Vay'}
              </h3>

              <p className="text-xs text-slate-500">
                Hồ sơ: <strong className="font-mono text-slate-800">{appData.id}</strong> • Khách hàng: <strong className="text-slate-800">{appData.customerName}</strong>
              </p>
            </div>

            {actionSuccess ? (
              <div className="p-4 bg-emerald-50 rounded-2xl text-center text-xs font-bold text-emerald-800">
                Đã cập nhật quyết định thành công! Đang chuyển hướng...
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                {modalAction === 'APPROVE' && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                    Số tiền giải ngân được duyệt: <strong className="font-black text-sm">{formatCurrency(approvedAmount)}</strong>
                  </div>
                )}

                {modalAction === 'RFI' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Lý do yêu cầu bổ sung</label>
                    <textarea
                      rows={3}
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      placeholder="Ví dụ: Hình ảnh sao kê lương trang 2 bị mờ, vui lòng tải lại bản PDF..."
                      className="input-human w-full"
                      required
                    />
                  </div>
                )}

                {modalAction === 'REJECT' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mã lý do từ chối</label>
                    <select
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="input-human w-full"
                    >
                      <option value="CIC_BAD">Lịch sử tín dụng CIC xấu (Nhóm 3-5)</option>
                      <option value="DTI_HIGH">Tỷ lệ nợ trên thu nhập (DTI) vượt mức 60%</option>
                      <option value="FRAUD_RISK">Phát hiện dấu hiệu rủi ro gian lận hồ sơ</option>
                      <option value="OTHER">Lý do chính sách nội bộ khác</option>
                    </select>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalAction(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleDecisionSubmit}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-white transition ${
                      modalAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : modalAction === 'RFI' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default UnderwritingDetail;
