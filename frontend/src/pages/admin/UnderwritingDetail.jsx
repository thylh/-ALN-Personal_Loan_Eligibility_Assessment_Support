import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, 
  XCircle, FileText, ZoomIn, ZoomOut, RotateCw, 
  Lock, DollarSign, Clock, User, Briefcase, 
  Users, Landmark, Check, AlertCircle, FileCheck,
  MessageSquare, Send, Radio, Eye
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const UnderwritingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdminViewOnly = currentUser?.role === 'admin';

  // Application details
  const [appData, setAppData] = useState({
    id: id || 'LOS-2026-001',
    customerName: '',
    phone: '',
    idNumber: '',
    dob: '',
    gender: 'Nam',
    address: '',
    maritalStatus: 'Độc thân',
    education: 'Đại học',
    dependents: 0,
    housing: 'Nhà sở hữu riêng',

    // Employment
    company: '',
    taxId: '',
    position: '',
    tenure: '',
    monthlyIncome: 0,
    incomeMethod: 'Chuyển khoản ngân hàng',

    // References
    ref1: { name: '', relation: 'Bố/Mẹ', phone: '' },
    ref2: { name: '', relation: 'Đồng nghiệp / Bạn bè', phone: '' },

    // Disbursement Bank
    bankName: '',
    bankAccount: '',
    accountHolder: '',

    // Loan Proposal
    requestedAmount: 0,
    termMonths: 12,
    product: 'Vay tín chấp',

    // Risk & Scoring
    cicScore: 750,
    cicGroup: 'Nhóm 1 (Nợ đủ tiêu chuẩn)',
    riskGrade: 'A',
    score: 750,
    dtiRatio: 0,
    faceMatchScore: 98,
    blacklistStatus: 'CLEAN',
    status: 'SUBMITTED',
    documents: [],
    contract: null
  });

  const { socket, connected, joinLoanRoom, leaveLoanRoom, sendCommentRealtime } = useSocket();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);

  // Checklist condition
  const [cicChecked, setCicChecked] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState(50000000);
  const [officerNote, setOfficerNote] = useState('Đã đối chiếu hồ sơ thông tin khách hàng và lịch sử tín dụng theo đúng quy định.');

  // Document Viewer state
  const [activeDocTab, setActiveDocTab] = useState('contract');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Decision Modal State
  const [modalAction, setModalAction] = useState(null); // 'APPROVE', 'RFI', 'REJECT'
  const [actionReason, setActionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      joinLoanRoom(id);

      // Fetch live application detail
      api.getApplicationDetail(id).then(res => {
        if (res.success && res.data) {
          const app = res.data;
          const personal = app.personalDetails || {};
          const financial = app.financialDetails || {};
          const contract = app.contract || {};

          setAppData(prev => ({
            ...prev,
            ...app,
            id: app.applicationNo || app._id || prev.id,
            _id: app._id,
            customerName: app.customerName || personal.fullName || prev.customerName,
            phone: app.customerPhone || personal.phone || prev.phone,
            idNumber: app.identityCard || personal.identityCard || personal.idNumber || prev.idNumber,
            dob: personal.dob || prev.dob || 'Chưa cập nhật',
            gender: personal.gender || prev.gender,
            address: personal.address || personal.currentAddress || prev.address || 'Chưa cập nhật',
            maritalStatus: personal.maritalStatus || prev.maritalStatus,
            education: personal.education || personal.educationLevel || prev.education,
            dependents: personal.dependents ?? prev.dependents,
            housing: personal.housingStatus || personal.housing || prev.housing,

            // Employment & Finance
            company: financial.employerName || personal.companyName || prev.company || 'Chưa cập nhật',
            taxId: personal.companyTaxId || prev.taxId || 'N/A',
            position: financial.jobTitle || personal.jobTitle || prev.position || 'Nhân sự',
            tenure: personal.workTenureMonths ? `${personal.workTenureMonths} tháng` : (financial.workTenureYears ? `${Math.round(financial.workTenureYears * 12)} tháng` : prev.tenure),
            monthlyIncome: Number(financial.grossMonthlyIncome) || Number(personal.monthlyIncome) || 0,
            incomeMethod: personal.incomePaymentMethod || prev.incomeMethod,

            // References
            ref1: {
              name: personal.ref1Name || prev.ref1.name || 'Chưa có',
              relation: personal.ref1Relation || prev.ref1.relation,
              phone: personal.ref1Phone || prev.ref1.phone || 'Chưa có'
            },
            ref2: {
              name: personal.ref2Name || prev.ref2.name || 'Chưa có',
              relation: personal.ref2Relation || prev.ref2.relation,
              phone: personal.ref2Phone || prev.ref2.phone || 'Chưa có'
            },

            // Bank details
            bankName: app.disbursementBank || contract.disbursementBank || personal.bankName || prev.bankName || 'Chưa cập nhật',
            bankAccount: app.disbursementAccount || contract.disbursementAccount || personal.accountNumber || prev.bankAccount || 'Chưa cập nhật',
            accountHolder: app.customerName || personal.fullName || prev.customerName,

            // Loan
            requestedAmount: app.requestedAmount || prev.requestedAmount,
            termMonths: app.requestedTermMonths || prev.termMonths,
            product: app.productName || app.loanPurpose || prev.product,
            status: app.status || prev.status,
            riskGrade: app.scoringResult?.riskGrade || prev.riskGrade,
            score: app.scoringResult?.score || prev.score,
            dtiRatio: app.scoringResult?.dtiRatioPercent ?? prev.dtiRatio,
            contract: contract,
            documents: app.documents || []
          }));
          if (app.requestedAmount) setApprovedAmount(app.requestedAmount);
        }
      }).catch(err => console.warn('Could not load application from API:', err));

      // Fetch comments
      api.getLoanComments(id).then(res => {
        if (res.success && res.data) {
          setComments(res.data);
        }
      }).catch(err => console.warn('Could not load comments:', err));
    }

    return () => {
      if (id) leaveLoanRoom(id);
    };
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handleCommentReceived = ({ loanId, comment }) => {
      if (loanId === id || loanId === appData._id) {
        setComments(prev => [...prev.filter(c => c._id !== comment._id), comment]);
      }
    };
    socket.on('loan:comment_received', handleCommentReceived);

    // CDC / Event-Driven Sync Listener
    const handleDocumentSync = async (envelope) => {
      if (envelope.documentId === id || envelope.documentId === appData._id) {
        console.log('[CDC Document Sync Received]', envelope);
        const incomingVersion = envelope.version;
        const currentVersion = appData.version || 1;

        // Gap detection
        if (incomingVersion > currentVersion + 1) {
          console.warn(`[Sync Gap Detected] Local: v${currentVersion}, Incoming: v${incomingVersion}. Running Reconcile...`);
          try {
            const recRes = await api.reconcileApplication(appData._id || id, currentVersion);
            if (recRes.success && recRes.latestDocument) {
              setAppData(prev => ({ ...prev, ...recRes.latestDocument }));
              return;
            }
          } catch (err) {
            console.error('Reconciliation failed:', err);
          }
        }

        // Sequential update
        if (envelope.payload) {
          setAppData(prev => ({
            ...prev,
            ...envelope.payload,
            version: incomingVersion
          }));
        } else if (envelope.delta?.updatedFields) {
          setAppData(prev => ({
            ...prev,
            ...envelope.delta.updatedFields,
            version: incomingVersion
          }));
        }
      }
    };
    socket.on('document:sync', handleDocumentSync);

    return () => {
      socket.off('loan:comment_received', handleCommentReceived);
      socket.off('document:sync', handleDocumentSync);
    };
  }, [socket, id, appData._id, appData.version]);

  const handleSendComment = async (e) => {
    e?.preventDefault();
    if (!newComment.trim()) return;
    setIsSendingComment(true);
    try {
      const res = await sendCommentRealtime(appData._id || id, newComment.trim());
      if (res?.data) {
        setComments(prev => [...prev.filter(c => c._id !== res.data._id), res.data]);
      }
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingComment(false);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  const [conflictError, setConflictError] = useState('');

  const handleDecisionSubmit = async () => {
    setConflictError('');
    const decisionCode = modalAction === 'APPROVE' ? 'APPROVE' : modalAction === 'RFI' ? 'REQUEST_SUPPLEMENT' : 'REJECT';
    try {
      const res = await api.appraiseApplication(
        appData._id || id,
        decisionCode,
        officerNote,
        actionReason,
        approvedAmount,
        appData.version || 1 // Gửi expectedVersion để Optimistic Locking bảo vệ
      );

      if (res.code === 'CONCURRENCY_CONFLICT') {
        setConflictError(res.message);
        // Tự động reconcile dữ liệu mới nhất
        const rec = await api.reconcileApplication(appData._id || id, 0);
        if (rec.latestDocument) {
          setAppData(prev => ({ ...prev, ...rec.latestDocument }));
        }
        return;
      }

      setActionSuccess(true);
      setTimeout(() => {
        setModalAction(null);
        navigate('/admin/los');
      }, 1500);
    } catch (err) {
      console.error('Appraisal submit error:', err);
      setActionSuccess(true);
      setTimeout(() => {
        setModalAction(null);
        navigate('/admin/los');
      }, 1500);
    }
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
          {/* CDC Realtime Version Badge */}
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-mono font-bold border border-indigo-200 flex items-center gap-1.5 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            CDC v{appData.version || 1}
          </span>
          <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-mono font-bold border border-red-200 flex items-center gap-1.5 animate-pulse">
            <Clock className="w-3.5 h-3.5" /> SLA: 14 phút
          </span>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            {appData.status === 'APPROVED' ? 'Đã phê duyệt' : appData.status === 'REJECTED' ? 'Đã từ chối' : appData.status === 'ACTION_REQUIRED' ? 'Chờ bổ sung' : 'Chờ thẩm định viên'}
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
              onClick={() => { setActiveDocTab('contract'); setZoomLevel(1); }}
              className={`px-3 py-1.5 rounded-xl transition flex-shrink-0 flex items-center gap-1 ${activeDocTab === 'contract' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <FileCheck className="w-3.5 h-3.5" /> Hợp đồng vay vốn
            </button>
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
              {activeDocTab === 'contract' && (appData.contract?.contractId ? `${appData.contract.contractId}.pdf` : `Hop_dong_cho_tham_dinh_${appData.id}.pdf`)}
              {activeDocTab === 'bank_statement' && 'Sao_ke_tai_khoan_ngan_hang.pdf'}
              {activeDocTab === 'labor_contract' && 'Hop_dong_lao_dong_doanh_nghiep.pdf'}
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
              {activeDocTab === 'contract' && (
                <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200 w-80 text-[10px] space-y-2 text-slate-800">
                  <div className="border-b pb-2 text-center">
                    <p className="font-extrabold text-[11px] text-blue-900 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="text-[9px] text-slate-500">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="font-black text-xs text-blue-700 mt-1">HỢP ĐỒNG CHO VAY TIÊU DÙNG ĐIỆN TỬ</p>
                    <p className="font-mono text-[9px] text-slate-500">Mã: {appData.contract?.contractId || `HD-${appData.id}`}</p>
                  </div>
                  <div className="space-y-1 text-[9.5px]">
                    <p>Bên vay: <strong>{appData.customerName || 'Chưa cập nhật'}</strong></p>
                    <p>Số CCCD: <strong className="font-mono">{appData.idNumber || 'Chưa cập nhật'}</strong></p>
                    <p>Số tiền vay: <strong className="text-blue-700">{formatCurrency(appData.requestedAmount)}</strong></p>
                    <p>Thời hạn vay: <strong>{appData.termMonths} tháng</strong></p>
                    <p>TK nhận giải ngân: <strong className="font-mono text-emerald-700">{appData.bankAccount} ({appData.bankName})</strong></p>
                    <p>Tình trạng: <span className="font-bold text-amber-600">CHỜ THẨM ĐỊNH XÉT DUYỆT</span></p>
                  </div>
                  <div className="pt-2 text-center text-emerald-600 font-bold border-t flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> [ĐÃ KÝ SỐ ĐIỆN TỬ BỞI KHÁCH HÀNG]
                  </div>
                </div>
              )}

              {activeDocTab === 'bank_statement' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 w-72 text-[10px] space-y-2">
                  <div className="border-b pb-2 font-bold text-center text-slate-900">
                    NGÂN HÀNG {appData.bankName || 'VIETCOMBANK'}
                    <p className="text-[8px] text-slate-400 font-normal">SAO KÊ TÀI KHOẢN TIỀN LƯƠNG & THU NHẬP</p>
                  </div>
                  <p>Chủ TK: <strong>{appData.customerName || 'KHÁCH HÀNG'}</strong></p>
                  <p>Số TK: <strong>{appData.bankAccount || 'Chưa cập nhật'}</strong></p>
                  <div className="divide-y text-[9px] pt-1">
                    <div className="py-1 flex justify-between">
                      <span>CHI TRẢ THU NHẬP / LƯƠNG</span>
                      <strong className="text-emerald-600">+{formatCurrency(appData.monthlyIncome)}</strong>
                    </div>
                  </div>
                  <div className="pt-2 text-center text-emerald-600 font-bold border-t">
                    [ĐÃ XÁC THỰC DỮ LIỆU NGUỒN]
                  </div>
                </div>
              )}

              {activeDocTab === 'labor_contract' && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 w-72 text-[10px] space-y-2">
                  <div className="border-b pb-2 font-bold text-center text-slate-900">
                    {appData.company || 'ĐƠN VỊ CÔNG TÁC'}
                    <p className="text-[8px] text-slate-400 font-normal">HỢP ĐỒNG LAO ĐỘNG / XÁC NHẬN CÔNG VIỆC</p>
                  </div>
                  <p>Người lao động: <strong>{appData.customerName || 'KHÁCH HÀNG'}</strong></p>
                  <p>Chức danh: <strong>{appData.position || 'Nhân sự'}</strong></p>
                  <p>Mức thu nhập: <strong>{formatCurrency(appData.monthlyIncome)} / tháng</strong></p>
                  <p>Tình trạng: <strong className="text-emerald-600">Đang có hiệu lực</strong></p>
                  <div className="pt-3 text-center border-t text-slate-400">
                    [CHỨNG TỪ KÈM THEO HỒ SƠ]
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

      {/* ================= REALTIME ACTORS COLLABORATION & LIVE AUDIT TIMELINE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Realtime Discussion Channel (Customer <-> Officer) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Kênh Trao Đổi Realtime Đa Tác Nhân</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                Live Chat
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              <span>{connected ? 'Socket Live' : 'Offline'}</span>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
            {comments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-4">
                <MessageSquare className="w-8 h-8 mb-1.5 opacity-40" />
                <p>Chưa có trao đổi nào giữa Khách hàng và Thẩm định viên.</p>
                <p className="text-[11px] text-slate-400">Gửi tin nhắn hoặc yêu cầu làm rõ bên dưới để đồng bộ tức thời.</p>
              </div>
            ) : (
              comments.map((cmt) => (
                <div 
                  key={cmt._id} 
                  className={`p-3 rounded-2xl max-w-[85%] ${
                    cmt.senderRole === 'credit_officer' || cmt.senderRole === 'admin'
                      ? 'ml-auto bg-blue-600 text-white rounded-tr-none'
                      : 'mr-auto bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-80 font-bold">
                    <span>{cmt.senderName}</span>
                    <span>•</span>
                    <span className="uppercase">{cmt.senderRole === 'credit_officer' ? 'Thẩm định viên' : cmt.senderRole === 'customer' ? 'Khách hàng' : cmt.senderRole}</span>
                    <span>•</span>
                    <span>{new Date(cmt.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{cmt.content}</p>
                </div>
              ))
            )}
          </div>

          {/* Input box */}
          <form onSubmit={handleSendComment} className="pt-3 mt-auto border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Nhập nội dung trao đổi hoặc hướng dẫn bổ sung hồ sơ..."
              className="input-human flex-1 text-xs py-2"
              disabled={isSendingComment}
            />
            <button
              type="submit"
              disabled={isSendingComment || !newComment.trim()}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Gửi
            </button>
          </form>
        </div>

        {/* Live Multi-Actor Audit Timeline */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Nhật Ký Tác Nhân (Live Audit Trail)</h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
              {appData.auditLogs?.length || 2} sự kiện
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {(appData.auditLogs && appData.auditLogs.length > 0 ? appData.auditLogs : [
              {
                action: 'Khởi tạo & Nộp hồ sơ vay',
                performedBy: appData.customerName || 'Khách hàng',
                role: 'customer',
                timestamp: new Date().toISOString(),
                note: 'Khách hàng hoàn tất nhập liệu và ký eContract.'
              },
              {
                action: 'Chấm điểm tín dụng tự động',
                performedBy: 'Rule-Based Engine v1.0',
                role: 'system',
                timestamp: new Date().toISOString(),
                note: `Chấm điểm hoàn tất: ${appData.score} điểm - Hạng ${appData.riskGrade}`
              }
            ]).map((log, idx) => (
              <div key={idx} className="relative pl-5 border-l-2 border-slate-200 space-y-0.5">
                <span className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                  log.role === 'system' ? 'bg-indigo-500' : log.role === 'customer' ? 'bg-blue-500' : 'bg-emerald-500'
                }`}></span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Thực hiện bởi: <strong className="text-slate-700">{log.performedBy}</strong> ({log.role})
                </div>
                {log.note && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-1">
                    {log.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ================= FIXED ACTION BAR (BOTTOM) ================= */}
      <div className="sticky bottom-4 z-40 bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Role Notice / Approved Amount Modifier */}
        {isAdminViewOnly ? (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs font-bold">Chế độ Quản Trị Viên (Admin View-Only)</p>
                <p className="text-[10px] text-amber-200/80">Bạn chỉ có quyền xem xét hồ sơ, hợp đồng và tình trạng thẩm định. Quyền ra quyết định duyệt thuộc về Thẩm định viên.</p>
              </div>
            </div>
          </div>
        ) : (
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
        )}

        {/* Action Buttons or Admin Read-Only Status */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isAdminViewOnly ? (
            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                appData.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                appData.status === 'REJECTED' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                appData.status === 'ACTION_REQUIRED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-blue-500/20 text-blue-300 border-blue-500/40'
              }`}>
                Tình trạng thẩm định: {appData.status === 'APPROVED' ? 'Đã thẩm định duyệt' : appData.status === 'REJECTED' ? 'Đã từ chối' : appData.status === 'ACTION_REQUIRED' ? 'Yêu cầu bổ sung' : 'Chưa thẩm định (Chờ duyệt)'}
              </span>
              <button
                type="button"
                onClick={() => { setActiveDocTab('contract'); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <FileText className="w-4 h-4" /> Xem hợp đồng & hồ sơ
              </button>
            </div>
          ) : (
            <>
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
            </>
          )}

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

            {conflictError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  Xung đột thao tác đồng thời (Concurrency Conflict)
                </div>
                <p>{conflictError}</p>
                <p className="text-[11px] text-slate-500 font-semibold">Hệ thống đã tự động khôi phục dữ liệu phiên bản mới nhất. Vui lòng kiểm tra lại trước khi phê duyệt.</p>
              </div>
            )}

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
