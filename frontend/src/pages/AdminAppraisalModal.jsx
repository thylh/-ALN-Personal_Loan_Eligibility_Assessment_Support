import React, { useState } from 'react';
import { api } from '../services/api';
import CreditScoreGauge from '../components/CreditScoreGauge';
import RadarChartScore from '../components/RadarChartScore';
import { X, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, FileText, Check } from 'lucide-react';

export default function AdminAppraisalModal({ app, onClose, onRefresh }) {
  const [decision, setDecision] = useState('APPROVE');
  const [note, setNote] = useState('');
  const [actionRequiredReason, setActionRequiredReason] = useState('');
  const [approvedAmount, setApprovedAmount] = useState(app?.scoringResult?.maxRecommendedLimit || app?.requestedAmount || 150000000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!app) return null;

  const scoreData = app.scoringResult || {};

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.appraiseApplication(app._id, decision, note, actionRequiredReason, approvedAmount);
      if (res.success) {
        onRefresh();
      } else {
        setError(res.message || 'Thao tác thất bại.');
      }
    } catch (err) {
      setError('Lỗi máy chủ khi cập nhật quyết định.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-white">Thẩm Định & Phê Duyệt Hồ Sơ: {app.applicationNo} (UC4.2)</h2>
              <span className={`px-3 py-1 text-xs font-bold rounded-full risk-badge-${scoreData.riskGrade || 'A'}`}>
                Hạng {scoreData.riskGrade}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Khách hàng: <span className="text-white font-semibold">{app.customerName}</span> | CCCD: {app.identityCard}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl font-semibold">
              {error}
            </div>
          )}

          {/* Engine Visual Score & Radar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CreditScoreGauge score={scoreData.score} riskGrade={scoreData.riskGrade} riskLevel={scoreData.riskLevel} />
            <RadarChartScore factorScores={scoreData.factorScores} />
          </div>

          {/* OCR Document Verification (UC2.2 Match Check) */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-white uppercase text-xs tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Đối Soát Chứng Từ Bóc Tách OCR (UC2.2)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(app.documents || []).map((doc, idx) => (
                <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-700">
                  <div className="font-bold text-white mb-1">{doc.title}</div>
                  {doc.ocrData ? (
                    <div className="space-y-1 text-[11px] text-slate-300">
                      <div>Độ tin cậy OCR: <span className="text-emerald-400 font-bold">{doc.ocrData.matchScore}%</span></div>
                      {doc.ocrData.idNumber && <div>Số CCCD: <span className="text-white font-mono">{doc.ocrData.idNumber}</span></div>}
                      {doc.ocrData.averageMonthlyIncome && <div>Lương sao kê: <span className="text-emerald-400 font-bold">{(doc.ocrData.averageMonthlyIncome).toLocaleString('vi-VN')} VNĐ</span></div>}
                    </div>
                  ) : (
                    <div className="text-slate-500 italic">Chưa thực hiện bóc tách OCR.</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Decision Form */}
          <form onSubmit={handleDecisionSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Quyết Định Thẩm Định Của Chuyên Viên</h3>
            
            {/* Decision Tabs */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVE')}
                className={`p-3 rounded-xl font-bold border transition flex items-center justify-center gap-2 ${decision === 'APPROVE' ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500 shadow-lg' : 'bg-slate-900 text-slate-400 border-slate-700'}`}
              >
                <CheckCircle2 className="w-4 h-4" /> Phê Duyệt Khoản Vay
              </button>
              <button
                type="button"
                onClick={() => setDecision('REQUEST_SUPPLEMENT')}
                className={`p-3 rounded-xl font-bold border transition flex items-center justify-center gap-2 ${decision === 'REQUEST_SUPPLEMENT' ? 'bg-amber-600/20 text-amber-300 border-amber-500 shadow-lg' : 'bg-slate-900 text-slate-400 border-slate-700'}`}
              >
                <FileText className="w-4 h-4" /> Yêu Cầu Bổ Sung (UC5.2)
              </button>
              <button
                type="button"
                onClick={() => setDecision('REJECT')}
                className={`p-3 rounded-xl font-bold border transition flex items-center justify-center gap-2 ${decision === 'REJECT' ? 'bg-rose-600/20 text-rose-300 border-rose-500 shadow-lg' : 'bg-slate-900 text-slate-400 border-slate-700'}`}
              >
                <XCircle className="w-4 h-4" /> Từ Chối Khoản Vay
              </button>
            </div>

            {decision === 'APPROVE' && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">Số Tiền Phê Duyệt (VNĐ)</label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-emerald-400 font-extrabold focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {decision === 'REQUEST_SUPPLEMENT' && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">Lý Do Yêu Cầu Bổ Sung (Gửi tới Khách Vay UC5.2)</label>
                <input
                  type="text"
                  value={actionRequiredReason}
                  onChange={(e) => setActionRequiredReason(e.target.value)}
                  placeholder="Ví dụ: Ảnh CCCD bị mờ góc, yêu cầu chụp lại ảnh rõ nét."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">Ghi Chú Thẩm Định Nội Bộ</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập ghi chú đánh giá chi tiết..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl font-bold"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg"
              >
                {loading ? 'Đang lưu...' : 'Xác Nhận Quyết Định'}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
