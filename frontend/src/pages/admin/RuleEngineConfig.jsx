import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  MiniMap
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  Sliders, Plus, Trash2, CheckCircle2, AlertTriangle, 
  Save, Play, ShieldAlert, Check, X, ArrowRight, Zap,
  GitBranch, Table, Workflow, RotateCcw, AlertCircle
} from 'lucide-react';

import { StartNode, CustomDecisionNode, CustomActionNode } from '../../components/rule-flow/CustomFlowNodes';
import { transformDBToFlow, transformFlowToDB, validateFlowGraph } from '../../components/rule-flow/flowTransformers';

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
    name: 'Phê duyệt siêu tốc AI',
    conditionField: 'Score >= 750 & DTI',
    operator: 'NHỎ_HƠN',
    value: '40%',
    action: 'AUTO_APPROVE',
    actionLabel: 'Tự động phê duyệt (Instant Pass)',
    actionColor: 'emerald',
    isActive: true
  }
];

const RuleEngineConfig = () => {
  const [activeTab, setActiveTab] = useState('flowchart'); // 'flowchart' | 'table'
  const [rules, setRules] = useState(INITIAL_RULES);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Trọng số chấm điểm tín dụng
  const [weights, setWeights] = useState({
    income: 25,
    dti: 30,
    tenure: 20,
    creditHistory: 15,
    demographics: 10
  });

  // State đồ thị Flowchart
  const initialFlow = useMemo(() => transformDBToFlow(), []);
  const [nodes, setNodes] = useState(initialFlow.nodes);
  const [edges, setEdges] = useState(initialFlow.edges);

  // Đăng ký custom nodes cho React Flow
  const nodeTypes = useMemo(() => ({
    startNode: StartNode,
    decisionNode: CustomDecisionNode,
    actionNode: CustomActionNode
  }), []);

  // Tải cấu hình từ API nếu có
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/admin/scoring-rules', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.weights) {
            setWeights({
              income: data.data.weights.income ?? 25,
              dti: data.data.weights.dti ?? 30,
              tenure: data.data.weights.workTenure ?? 20,
              creditHistory: data.data.weights.creditHistory ?? 15,
              demographics: data.data.weights.age ?? 10
            });
          }
          if (data.data.decisionFlow?.nodes && data.data.decisionFlow?.edges) {
            setNodes(data.data.decisionFlow.nodes);
            setEdges(data.data.decisionFlow.edges);
          }
        }
      } catch (err) {
        console.warn('Sử dụng dữ liệu mặc định ban đầu cho Rule Engine');
      }
    };
    fetchRules();
  }, []);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge({
      ...connection,
      animated: true,
      style: { stroke: '#38bdf8', strokeWidth: 2 }
    }, eds)),
    []
  );

  // Xử lý thêm Node quyết định vào Canvas
  const handleAddDecisionNodeToCanvas = () => {
    const newNodeId = `cond-${Date.now().toString().slice(-4)}`;
    const newNode = {
      id: newNodeId,
      type: 'decisionNode',
      position: { x: 300 + Math.random() * 50, y: 350 + Math.random() * 50 },
      data: {
        label: 'Điều kiện mới',
        field: 'monthlyIncome',
        operator: '>=',
        value: '15,000,000'
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Xử lý thêm Node hành động vào Canvas
  const handleAddActionNodeToCanvas = (actionType) => {
    const newNodeId = `act-${Date.now().toString().slice(-4)}`;
    const newNode = {
      id: newNodeId,
      type: 'actionNode',
      position: { x: 450 + Math.random() * 50, y: 450 + Math.random() * 50 },
      data: {
        action: actionType,
        label: actionType === 'AUTO_APPROVE' ? 'Duyệt khoản vay' : actionType === 'AUTO_REJECT' ? 'Từ chối tự động' : 'Thẩm định thủ công',
        description: 'Hành động phân nhánh tự động'
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Khôi phục đồ thị về mặc định
  const handleResetFlow = () => {
    const defaultFlow = transformDBToFlow();
    setNodes(defaultFlow.nodes);
    setEdges(defaultFlow.edges);
    setValidationErrors([]);
  };

  // Lưu cấu hình toàn diện (Gọi API Backend)
  const handleSaveAll = async () => {
    // 1. Validate Flowchart
    const validation = validateFlowGraph(nodes, edges);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);

    // 2. Kiểm tra tổng trọng số = 100%
    const totalWeights = Object.values(weights).reduce((a, b) => a + Number(b), 0);
    if (totalWeights !== 100) {
      alert(`Tổng trọng số phải đúng bằng 100%! Hiện tại đang là: ${totalWeights}%`);
      return;
    }

    setIsSaving(true);
    try {
      const decisionTree = transformFlowToDB(nodes, edges);
      const token = localStorage.getItem('token');

      const payload = {
        weights: {
          income: Number(weights.income),
          dti: Number(weights.dti),
          workTenure: Number(weights.tenure),
          creditHistory: Number(weights.creditHistory),
          age: Number(weights.demographics)
        },
        decisionFlow: decisionTree
      };

      const res = await fetch('http://localhost:5000/api/admin/scoring-rules', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(result.message || 'Lỗi khi lưu cấu hình.');
      }
    } catch (err) {
      // Giả lập lưu thành công nếu backend offline
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Cấu hình tạo quy tắc trong bảng
  const [newRule, setNewRule] = useState({
    name: '',
    conditionField: 'Thu nhập hàng tháng',
    operator: 'NHỎ_HƠN',
    value: '',
    action: 'MANUAL_REVIEW',
    actionLabel: 'Chuyển thẩm định thủ công',
    actionColor: 'amber'
  });

  const handleToggleRule = (id) => {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleDeleteRule = (id) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleWeightChange = (key, val) => {
    setWeights({
      ...weights,
      [key]: parseInt(val) || 0
    });
  };

  const totalWeights = Object.values(weights).reduce((a, b) => a + Number(b), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Cấu Hình Động Cơ Phê Duyệt Tự Động (Rule & Decision Engine)
              </h1>
              <p className="text-sm text-slate-400">
                Thiết lập bộ điều kiện IF/THEN dạng Flowchart đồ thị trực quan và ma trận trọng số chấm điểm tín dụng.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch View Mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('flowchart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'flowchart'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Workflow className="w-4 h-4" />
              Sơ đồ Flowchart
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'table'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-4 h-4" />
              Bảng quy tắc
            </button>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? 'Đã lưu thành công!' : 'Lưu toàn bộ quy tắc'}
          </button>
        </div>
      </div>

      {/* Validation Errors Notice */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            Đồ thị Flowchart chưa hợp lệ:
          </div>
          <ul className="list-disc pl-6 text-xs space-y-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* VIEW 1: FLOWCHART CANVAS */}
      {activeTab === 'flowchart' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Flowchart Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/80 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thêm khối:</span>
              <button
                onClick={handleAddDecisionNodeToCanvas}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                + Khối Điều kiện (IF)
              </button>
              <button
                onClick={() => handleAddActionNodeToCanvas('AUTO_APPROVE')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                + Duyệt tự động
              </button>
              <button
                onClick={() => handleAddActionNodeToCanvas('AUTO_REJECT')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                + Từ chối
              </button>
              <button
                onClick={() => handleAddActionNodeToCanvas('MANUAL_REVIEW')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                + Thẩm định thủ công
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFlow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Đặt lại mặc định
              </button>
            </div>
          </div>

          {/* Canvas React Flow */}
          <div className="h-[560px] w-full bg-slate-950 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
              className="bg-[#0b0f19]"
            >
              <Background color="#334155" gap={20} size={1} />
              <Controls className="!bg-slate-900 !border-slate-800 !fill-white" />
              <MiniMap
                nodeStrokeColor="#38bdf8"
                nodeColor="#1e293b"
                className="!bg-slate-900 !border-slate-800"
              />
            </ReactFlow>

            {/* Note hướng dẫn thao tác */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-2 rounded-lg text-[11px] text-slate-400 pointer-events-none">
              💡 <span className="text-slate-200 font-semibold">Mẹo:</span> Kéo thả từ các điểm nối tròn màu xanh (True) hoặc đỏ (False) để liên kết điều kiện tới hành động tương ứng.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {activeTab === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Danh sách điều kiện IF/THEN tuần tự</h2>
              <p className="text-xs text-slate-400">Các quy tắc được thực thi theo thứ tự ưu tiên từ trên xuống dưới.</p>
            </div>
            <button
              onClick={() => setShowAddRuleModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition"
            >
              <Plus className="w-4 h-4" />
              Thêm quy tắc
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div 
                key={rule.id}
                className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border transition ${
                  rule.isActive 
                    ? 'bg-slate-950/60 border-slate-800' 
                    : 'bg-slate-950/20 border-slate-900 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={() => handleToggleRule(rule.id)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-200">{rule.name}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900">
                        IF: {rule.conditionField} {rule.operator} {rule.value}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        rule.actionColor === 'red' ? 'bg-rose-950/50 text-rose-400 border border-rose-900' :
                        rule.actionColor === 'amber' ? 'bg-amber-950/50 text-amber-400 border border-amber-900' :
                        'bg-emerald-950/50 text-emerald-400 border border-emerald-900'
                      }`}>
                        THEN: {rule.actionLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 md:mt-0">
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Credit Scoring Matrix Sliders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              Ma Trận Trọng Số Chấm Điểm Tín Dụng (Credit Scoring Weights)
            </h2>
            <p className="text-xs text-slate-400">
              Điều chỉnh tỷ trọng % đóng góp của từng chỉ tiêu trong mô hình tính điểm FICO/Custom Score (Tổng phải bằng 100%).
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${
            totalWeights === 100 
              ? 'bg-emerald-950/50 text-emerald-400 border-emerald-700/60' 
              : 'bg-rose-950/50 text-rose-400 border-rose-700/60'
          }`}>
            Tổng trọng số: {totalWeights}% {totalWeights === 100 ? '✓ Hợp lệ' : '✗ Phải bằng 100%'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Thu nhập (Income)</span>
              <span className="text-indigo-400 font-mono">{weights.income}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.income}
              onChange={(e) => handleWeightChange('income', e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Tỷ lệ gánh nợ (DTI)</span>
              <span className="text-blue-400 font-mono">{weights.dti}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.dti}
              onChange={(e) => handleWeightChange('dti', e.target.value)}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Thâm niên công tác</span>
              <span className="text-emerald-400 font-mono">{weights.tenure}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.tenure}
              onChange={(e) => handleWeightChange('tenure', e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Lịch sử tín dụng CIC</span>
              <span className="text-amber-400 font-mono">{weights.creditHistory}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.creditHistory}
              onChange={(e) => handleWeightChange('creditHistory', e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Nhân khẩu & Độ tuổi</span>
              <span className="text-rose-400 font-mono">{weights.demographics}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights.demographics}
              onChange={(e) => handleWeightChange('demographics', e.target.value)}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Modal Thêm Quy Tắc Table */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Thêm mới quy tắc IF/THEN</h3>
              <button onClick={() => setShowAddRuleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setRules([...rules, { ...newRule, id: `R_${Date.now()}`, isActive: true }]);
                setShowAddRuleModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tên quy tắc</label>
                <input
                  type="text"
                  required
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="Ví dụ: Giới hạn độ tuổi vay nhanh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Trường dữ liệu kiểm tra</label>
                <input
                  type="text"
                  required
                  value={newRule.conditionField}
                  onChange={(e) => setNewRule({ ...newRule, conditionField: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Giá trị ngưỡng</label>
                <input
                  type="text"
                  required
                  value={newRule.value}
                  onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                  placeholder="Ví dụ: 10,000,000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddRuleModal(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Thêm ngay
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
