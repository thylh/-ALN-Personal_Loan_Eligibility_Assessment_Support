import React, { useState } from 'react';
import { 
  Sliders, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Save, Play, ShieldAlert, Check, X, ArrowRight, Zap
} from 'lucide-react';

const INITIAL_RULES = [
  {
    id: 'R_AGE',
    name: 'Kiểm tra độ tuổi công dân',
    conditionField: 'Tuổi',
    operator: 'NGOÀI_KHOẢNG',
    value: '18 - 60',
    action: 'AUTO_REJECT',
    actionLabel: 'Tự động từ chối (Auto-Reject)',
    actionColor: 'red',
    isActive: true
  },
  {
    id: 'R_CIC',
    name: 'Chặn nợ xấu CIC',
    conditionField: 'Nhóm nợ CIC',
    operator: 'LỚN_HƠN_HOẶC_BẰNG',
    value: 'Nhóm 3',
    action: 'AUTO_REJECT',
    actionLabel: 'Tự động từ chối (Auto-Reject)',
    actionColor: 'red',
    isActive: true
  },
  {
    id: 'R_EKYC',
    name: 'Xác thực sinh trắc học eKYC',
    conditionField: 'Face Match Score',
    operator: 'NHỎ_HƠN',
    value: '80%',
    action: 'AUTO_REJECT',
    actionLabel: 'Tự động từ chối (Gian lận eKYC)',
    actionColor: 'red',
    isActive: true
  },
  {
    id: 'R_DTI_HIGH',
    name: 'Cảnh báo gánh nợ DTI cao',
    conditionField: 'Tỷ lệ nợ/thu nhập (DTI)',
    operator: 'LỚN_HƠN',
    value: '55%',
    action: 'MANUAL_REVIEW',
    actionLabel: 'Chuyển thẩm định thủ công',
    actionColor: 'amber',
    isActive: true
  },
  {
    id: 'R_AUTO_APPROVE',
    name: 'Phê duyệt siêu tốc AI Fast-Track',
    conditionField: 'Điểm tín dụng & DTI',
    operator: 'ĐIỀU_KIỆN_KÉP',
    value: 'Score ≥ 750 & DTI < 40%',
    action: 'AUTO_APPROVE',
    actionLabel: 'Tự động phê duyệt trong 5 phút (Auto-Approve)',
    actionColor: 'emerald',
    isActive: true
  }
];

const RuleEngineConfig = () => {
  const [rules, setRules] = useState(INITIAL_RULES);

  // Scoring Weights (Sum = 100%)
  const [weights, setWeights] = useState({
    income: 25,
    dti: 30,
    tenure: 20,
    creditHistory: 15,
    demographics: 10
  });

  const [saveSuccess, setSaveSuccess] = useState('');
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    conditionField: 'Thu nhập',
    operator: 'NHỎ_HƠN',
    value: '5000000',
    action: 'MANUAL_REVIEW',
    actionLabel: 'Chuyển thẩm định thủ công',
    actionColor: 'amber'
  });

  const totalWeight = weights.income + weights.dti + weights.tenure + weights.creditHistory + weights.demographics;

  const handleToggleRule = (id) => {
    setRules(curr => curr.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleSaveAll = () => {
    if (totalWeight !== 100) {
      alert('Tổng trọng số chấm điểm tín dụng phải bằng chính xác 100%!');
      return;
    }
    setSaveSuccess('Lưu cấu hình quy tắc duyệt tự động Rule Engine thành công!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const handleAddRule = (e) => {
    e.preventDefault();
    setRules([...rules, {
      ...newRule,
      id: 'R_' + Date.now().toString().slice(-4),
      isActive: true
    }]);
    setShowAddRuleModal(false);
    setSaveSuccess('Đã thêm quy tắc duyệt mới vào hệ thống!');
    setTimeout(() => setSaveSuccess(''), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Cấu Hình Quy Tắc Duyệt Tự Động (Rule Engine)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập luật điều kiện IF/THEN và phân bổ trọng số mô hình chấm điểm tín dụng tự động.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddRuleModal(true)}
            className="px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-blue-600" /> Thêm quy tắc IF/THEN
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="btn-primary py-2.5 px-6 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" /> Lưu cấu hình toàn hệ thống
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">{saveSuccess}</span>
        </div>
      )}

      {/* SECTION 1: IF/THEN CONDITION RULES BUILDER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-4">
        <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Danh Sách Quy Tắc Phê Duyệt & Chặn Rủi Ro (IF / THEN Rules)
            </h3>
            <p className="text-[11px] text-slate-400">Các quy tắc sẽ được hệ thống chạy tự động khi khách hàng nộp hồ sơ</p>
          </div>
          <span className="text-xs font-bold text-blue-600">{rules.filter(r => r.isActive).length} / {rules.length} quy tắc đang bật</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`p-5 px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition ${
                !rule.isActive ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {rule.id}
                  </span>
                  <strong className="text-slate-900 text-sm font-bold">{rule.name}</strong>
                </div>

                {/* Condition Expression */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">IF</span>
                  <span className="font-bold text-slate-800">[{rule.conditionField}]</span>
                  <span className="text-slate-500">{rule.operator}</span>
                  <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{rule.value}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold">THEN</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    rule.actionColor === 'red' ? 'bg-red-100 text-red-700 border border-red-200' : rule.actionColor === 'amber' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {rule.actionLabel}
                  </span>
                </div>
              </div>

              {/* Toggle switch */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={() => handleToggleRule(rule.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-600">
                    {rule.isActive ? 'Đang kích hoạt' : 'Tắt'}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: CREDIT SCORING ENGINE WEIGHT SLIDERS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Trọng Số Mô Hình Chấm Điểm Tín Dụng AI (Credit Scoring Weights)
            </h3>
            <p className="text-[11px] text-slate-400">Điều chỉnh tỷ trọng phần trăm của các nhóm dữ liệu rủi ro (Tổng buộc phải bằng 100%)</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Tổng trọng số:</span>
            <span className={`text-base font-black px-3 py-1 rounded-xl ${
              totalWeight === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
            }`}>
              {totalWeight}% {totalWeight === 100 ? '✓' : '(Lỗi: Chưa đủ 100%)'}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 text-xs">
          
          {/* Factor 1: Income */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center font-bold">
              <span>Thu nhập hàng tháng</span>
              <span className="text-blue-600 text-sm font-black">{weights.income}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={weights.income}
              onChange={(e) => setWeights({...weights, income: Number(e.target.value)})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400 block">Đánh giá khả năng trả nợ</span>
          </div>

          {/* Factor 2: DTI */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center font-bold">
              <span>Tỷ lệ gánh nợ (DTI)</span>
              <span className="text-blue-600 text-sm font-black">{weights.dti}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={weights.dti}
              onChange={(e) => setWeights({...weights, dti: Number(e.target.value)})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400 block">Tỷ trọng chi phí/thu nhập</span>
          </div>

          {/* Factor 3: Tenure */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center font-bold">
              <span>Thâm niên công tác</span>
              <span className="text-blue-600 text-sm font-black">{weights.tenure}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={weights.tenure}
              onChange={(e) => setWeights({...weights, tenure: Number(e.target.value)})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400 block">Độ ổn định công việc</span>
          </div>

          {/* Factor 4: Credit History */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center font-bold">
              <span>Lịch sử tín dụng CIC</span>
              <span className="text-blue-600 text-sm font-black">{weights.creditHistory}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={weights.creditHistory}
              onChange={(e) => setWeights({...weights, creditHistory: Number(e.target.value)})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400 block">Lịch sử quá hạn 36 tháng</span>
          </div>

          {/* Factor 5: Demographics */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between items-center font-bold">
              <span>Độ tuổi & Học vấn</span>
              <span className="text-blue-600 text-sm font-black">{weights.demographics}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="5"
              value={weights.demographics}
              onChange={(e) => setWeights({...weights, demographics: Number(e.target.value)})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-[10px] text-slate-400 block">Nhân khẩu & cư trú</span>
          </div>

        </div>
      </div>

      {/* ADD RULE MODAL */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Thêm Mới Quy Tắc IF/THEN</h3>

            <form onSubmit={handleAddRule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên quy tắc</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  placeholder="Ví dụ: Kiểm tra mức lương tối thiểu"
                  className="input-human w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trường điều kiện (IF)</label>
                  <select
                    value={newRule.conditionField}
                    onChange={(e) => setNewRule({...newRule, conditionField: e.target.value})}
                    className="input-human w-full"
                  >
                    <option value="Thu nhập">Thu nhập hàng tháng</option>
                    <option value="DTI">Tỷ lệ DTI</option>
                    <option value="Thâm niên">Thâm niên (tháng)</option>
                    <option value="Nhóm CIC">Nhóm nợ CIC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Toán tử</label>
                  <select
                    value={newRule.operator}
                    onChange={(e) => setNewRule({...newRule, operator: e.target.value})}
                    className="input-human w-full"
                  >
                    <option value="NHỎ_HƠN">&lt; (Nhỏ hơn)</option>
                    <option value="LỚN_HƠN">&gt; (Lớn hơn)</option>
                    <option value="BẰNG">= (Bằng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giá trị ngưỡng</label>
                <input
                  type="text"
                  value={newRule.value}
                  onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                  placeholder="Ví dụ: 4500000"
                  className="input-human w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hành động thực thi (THEN)</label>
                <select
                  value={newRule.action}
                  onChange={(e) => {
                    const act = e.target.value;
                    setNewRule({
                      ...newRule,
                      action: act,
                      actionLabel: act === 'AUTO_REJECT' ? 'Tự động từ chối' : act === 'MANUAL_REVIEW' ? 'Chuyển thẩm định thủ công' : 'Tự động phê duyệt',
                      actionColor: act === 'AUTO_REJECT' ? 'red' : act === 'MANUAL_REVIEW' ? 'amber' : 'emerald'
                    });
                  }}
                  className="input-human w-full font-bold"
                >
                  <option value="MANUAL_REVIEW">Chuyển thẩm định thủ công</option>
                  <option value="AUTO_REJECT">Tự động từ chối (Auto-Reject)</option>
                  <option value="AUTO_APPROVE">Tự động phê duyệt (Auto-Approve)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 rounded-xl font-bold"
                >
                  Thêm quy tắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RuleEngineConfig;
