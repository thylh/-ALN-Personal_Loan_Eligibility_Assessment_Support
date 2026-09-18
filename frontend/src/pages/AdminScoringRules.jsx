import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SlidersHorizontal, CheckCircle2, AlertCircle, Save, RefreshCw } from 'lucide-react';

export default function AdminScoringRules() {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    const res = await api.getScoringRules();
    if (res.success) {
      setRules(res.data);
    }
    setLoading(false);
  };

  const handleWeightChange = (field, val) => {
    setRules(prev => ({
      ...prev,
      weights: { ...prev.weights, [field]: Number(val) }
    }));
  };

  const handleThresholdChange = (field, val) => {
    setRules(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [field]: Number(val) }
    }));
  };

  const handleRateChange = (field, val) => {
    setRules(prev => ({
      ...prev,
      interestRates: { ...prev.interestRates, [field]: Number(val) }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await api.updateScoringRules(rules);
      if (res.success) {
        setMessage('Cập nhật Ma trận Trọng số Chấm điểm thành công!');
        setRules(res.data);
      } else {
        setError(res.message || 'Cập nhật thất bại.');
      }
    } catch (err) {
      setError('Lỗi kết nối máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Đang tải cấu hình quy tắc...</div>;

  const totalWeight = rules ? (
    (rules.weights.income || 0) +
    (rules.weights.dti || 0) +
    (rules.weights.workTenure || 0) +
    (rules.weights.creditHistory || 0) +
    (rules.weights.age || 0)
  ) : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-purple-400" /> Cấu Hình Trọng Số Quy Tắc Chấm Điểm (UC4.3)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Chỉnh sửa phần trăm ưu tiên và ngưỡng điểm rủi ro trực tiếp trên giao diện Admin UI.
          </p>
        </div>

        <button onClick={fetchRules} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Khôi phục mặc định
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Section 1: Weights (%) */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <h2 className="text-base font-bold text-white">1. Ma Trận Trọng Số % Thành Phần (Tổng bằng 100%)</h2>
              <span className="text-xs text-slate-400">Điều chỉnh mức độ quan trọng của từng yếu tố tài chính.</span>
            </div>

            <div className={`px-4 py-1.5 rounded-full border text-xs font-extrabold ${totalWeight === 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'}`}>
              Tổng Trọng Số: {totalWeight}% {totalWeight !== 100 && '(Phải bằng 100%)'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Trọng số Thu nhập (Income Weight)</span>
                <span className="text-blue-400 font-mono">{rules.weights.income}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={rules.weights.income}
                onChange={(e) => handleWeightChange('income', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Trọng số Tỷ lệ nợ/thu nhập (DTI Weight)</span>
                <span className="text-blue-400 font-mono">{rules.weights.dti}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={rules.weights.dti}
                onChange={(e) => handleWeightChange('dti', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Trọng số Thâm niên công tác (Work Tenure Weight)</span>
                <span className="text-blue-400 font-mono">{rules.weights.workTenure}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={rules.weights.workTenure}
                onChange={(e) => handleWeightChange('workTenure', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Trọng số Lịch sử tín dụng (Credit History Weight)</span>
                <span className="text-blue-400 font-mono">{rules.weights.creditHistory}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={rules.weights.creditHistory}
                onChange={(e) => handleWeightChange('creditHistory', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-semibold mb-1">
                <span>Trọng số Độ tuổi (Age Weight)</span>
                <span className="text-blue-400 font-mono">{rules.weights.age}%</span>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={rules.weights.age}
                onChange={(e) => handleWeightChange('age', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Thresholds */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white border-b border-slate-700 pb-3">
            2. Ngưỡng Điểm Phân Loại Rủi Ro (Credit Score Thresholds 300 - 850)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">Hạng A (Rủi ro Thấp - Green)</label>
              <input
                type="number"
                value={rules.thresholds.gradeA}
                onChange={(e) => handleThresholdChange('gradeA', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Điểm tối thiểu đạt Hạng A</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">Hạng B (Rủi ro TB - Yellow)</label>
              <input
                type="number"
                value={rules.thresholds.gradeB}
                onChange={(e) => handleThresholdChange('gradeB', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Điểm tối thiểu đạt Hạng B</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-orange-400 mb-1">Hạng C (Rủi ro Cao - Orange)</label>
              <input
                type="number"
                value={rules.thresholds.gradeC}
                onChange={(e) => handleThresholdChange('gradeC', e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Điểm tối thiểu đạt Hạng C</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || totalWeight !== 100}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Đang lưu cấu hình...' : 'LƯU MA TRẬN QUY TẮC MỚI'}
          </button>
        </div>

      </form>

    </div>
  );
}
