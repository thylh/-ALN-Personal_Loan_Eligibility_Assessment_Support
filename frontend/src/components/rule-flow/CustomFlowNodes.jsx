import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlayCircle, ShieldCheck, HelpCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';

/**
 * Node Bắt Đầu (Start Node)
 */
export const StartNode = memo(({ data }) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-2 border-blue-400 min-w-[200px]">
      <div className="flex items-center gap-2">
        <PlayCircle className="w-5 h-5 text-blue-200" />
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-200">Bắt đầu luồng</div>
          <div className="text-sm font-bold">{data.label || 'Hồ sơ vay tiếp nhận'}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-400" />
    </div>
  );
});

/**
 * CustomDecisionNode: Khối điều kiện IF / Rẽ nhánh
 */
export const CustomDecisionNode = memo(({ data, selected }) => {
  return (
    <div className={`p-4 rounded-xl border-2 shadow-md transition-all duration-200 min-w-[240px] max-w-[280px] bg-slate-900 ${
      selected ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-amber-500/50 hover:border-amber-400'
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-400" />
      
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
            ĐIỀU KIỆN IF
          </span>
          <div className="text-xs font-bold text-slate-100 truncate mt-0.5">{data.label || 'Kiểm tra quy tắc'}</div>
        </div>
      </div>

      <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
        <div className="flex justify-between items-center text-slate-400">
          <span>Chỉ số:</span>
          <span className="text-slate-200 font-mono font-medium">{data.field || 'creditScore'}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Toán tử:</span>
          <span className="text-amber-300 font-bold font-mono">{data.operator || '≥'}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Ngưỡng:</span>
          <span className="text-emerald-400 font-bold font-mono">{data.value ?? '700'}</span>
        </div>
      </div>

      <div className="flex justify-between text-[11px] font-semibold mt-3 pt-2 text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span> Đạt (True)
        </span>
        <span className="flex items-center gap-1 text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span> Không đạt (False)
        </span>
      </div>

      {/* 2 Handles xuất nhánh True và False */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '30%' }}
        className="!w-3 !h-3 !bg-emerald-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '70%' }}
        className="!w-3 !h-3 !bg-rose-500"
      />
    </div>
  );
});

/**
 * CustomActionNode: Khối hành động THEN (Duyệt tự động / Thẩm định thủ công / Từ chối)
 */
export const CustomActionNode = memo(({ data, selected }) => {
  const isApprove = data.action === 'AUTO_APPROVE';
  const isReject = data.action === 'AUTO_REJECT';
  const isReview = data.action === 'MANUAL_REVIEW';

  const colorConfig = isApprove
    ? {
        border: 'border-emerald-500/60',
        bg: 'bg-emerald-950/40',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
        text: 'Duyệt tự động (Auto Approve)'
      }
    : isReject
    ? {
        border: 'border-rose-500/60',
        bg: 'bg-rose-950/40',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        icon: <XCircle className="w-5 h-5 text-rose-400" />,
        text: 'Từ chối tự động (Auto Reject)'
      }
    : {
        border: 'border-amber-500/60',
        bg: 'bg-amber-950/40',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        icon: <Clock className="w-5 h-5 text-amber-400" />,
        text: 'Chuyển thẩm định thủ công'
      };

  return (
    <div className={`p-4 rounded-xl border-2 shadow-lg transition-all duration-200 min-w-[220px] max-w-[260px] ${colorConfig.bg} ${
      selected ? 'ring-2 ring-white/40 ' + colorConfig.border : colorConfig.border
    }`}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-slate-400" />
      
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-lg">
          {colorConfig.icon}
        </div>
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colorConfig.badge}`}>
            HÀNH ĐỘNG
          </span>
          <div className="text-xs font-bold text-slate-100 mt-1">{data.label || colorConfig.text}</div>
        </div>
      </div>

      {data.description && (
        <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800">
          {data.description}
        </div>
      )}
    </div>
  );
});

