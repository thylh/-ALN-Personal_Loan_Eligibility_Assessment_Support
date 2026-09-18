import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AuditLogTimeline from '../components/AuditLogTimeline';
import CreditScoreGauge from '../components/CreditScoreGauge';
import RadarChartScore from '../components/RadarChartScore';
import { ArrowLeft, AlertTriangle, FileText, CheckCircle2, ShieldCheck, Clock, UploadCloud, RefreshCw } from 'lucide-react';

export default function ApplicationDetailView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supplementNote, setSupplementNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchApp();
  }, [id]);

  const fetchApp = async () => {
    const res = await api.getApplicationDetail(id);
    if (res.success) {
      setApp(res.data);
    }
    setLoading(false);
  };

  const handleResubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.resubmitDocuments(id, app.documents);
      if (res.success) {
        setApp(res.data);
        setSupplementNote('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Đang tải thông tin hồ sơ...</div>;
  if (!app) return <div className="text-center py-20 text-slate-400">Không tìm thấy thông tin hồ sơ.</div>;

  const scoreData = app.scoringResult || {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to={user?.role === 'customer' ? '/customer' : '/admin/applications'} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{app.applicationNo}</h1>
              <span className={`px-3 py-1 text-xs font-bold rounded-full risk-badge-${scoreData.riskGrade || 'A'}`}>
                Hạng Rủi Ro {scoreData.riskGrade}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Khách hàng: <span className="text-slate-200 font-semibold">{app.customerName}</span> | Khởi tạo ngày: {new Date(app.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <button onClick={fetchApp} className="self-start md:self-auto px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới dữ liệu
        </button>
      </div>

      {/* Action Required Banner for Document Supplement (UC5.2) */}
      {app.status === 'ACTION_REQUIRED' && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-6 text-amber-300 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-amber-200">Yêu Cầu Bổ Sung Chứng Từ (UC5.2)</h3>
              <p className="text-xs text-amber-300/90 mt-1">
                Lý do từ Chuyên viên thẩm định: <span className="font-bold underline">{app.actionRequiredReason || 'Vui lòng tải lại chứng từ mờ/thiếu.'}</span>
              </p>
            </div>
          </div>

          {user?.role === 'customer' && (
            <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
              <span className="text-xs text-amber-400">Bạn đã cập nhật đủ chứng từ theo yêu cầu?</span>
              <button
                onClick={handleResubmit}
                disabled={isSubmitting}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" /> {isSubmitting ? 'Đang cập nhật...' : 'Xác Nhận Đã Bổ Sung Chứng Từ'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Credit Engine Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CreditScoreGauge score={scoreData.score} riskGrade={scoreData.riskGrade} riskLevel={scoreData.riskLevel} />
        <RadarChartScore factorScores={scoreData.factorScores} />

        <div className="bg-slate-800/60 rounded-2xl border border-slate-700/80 p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Chỉ Số Tài Chính & DTI
          </h3>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tỷ lệ nợ/thu nhập DTI:</span>
              <span className="font-bold text-amber-400">{scoreData.dtiRatioPercent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Số tiền đề xuất tối đa:</span>
              <span className="font-bold text-emerald-400">{(scoreData.maxRecommendedLimit || 0).toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lãi suất gợi ý:</span>
              <span className="font-bold text-blue-400">{scoreData.suggestedInterestRate}% / năm</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-1">Số tiền yêu cầu:</span>
            <div className="text-2xl font-black text-white">{(app.requestedAmount || 0).toLocaleString('vi-VN')} VNĐ</div>
            <div className="text-xs text-slate-400">Kỳ hạn: {app.requestedTermMonths} tháng</div>
          </div>
        </div>
      </div>

      {/* Audit Log Timeline (UC5.3) */}
      <div className="bg-slate-800/60 rounded-3xl border border-slate-700/80 p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" /> Nhật Ký Cập Nhật Tiến Trình Hồ Sơ (Audit Log Timeline UC5.3)
        </h2>
        <p className="text-xs text-slate-400">
          Theo dõi minh bạch mọi thao tác của Khách đi vay, Hệ thống chấm điểm tự động và Chuyên viên thẩm định.
        </p>
        <AuditLogTimeline auditLogs={app.auditLogs} />
      </div>

    </div>
  );
}
