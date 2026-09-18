import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, FileText, UserCheck, ShieldCheck } from 'lucide-react';

export default function AuditLogTimeline({ auditLogs = [] }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-sm">
        Chưa có nhật ký ghi nhận tiến trình.
      </div>
    );
  }

  const getLogIcon = (role, action) => {
    if (action.includes('Phê duyệt')) return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    if (action.includes('Từ chối')) return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    if (action.includes('bổ sung')) return <FileText className="w-5 h-5 text-amber-400" />;
    if (role === 'system') return <ShieldCheck className="w-5 h-5 text-blue-400" />;
    return <UserCheck className="w-5 h-5 text-cyan-400" />;
  };

  return (
    <div className="relative border-l-2 border-slate-700 ml-4 space-y-6 py-2">
      {auditLogs.map((log, idx) => (
        <div key={idx} className="relative pl-6">
          {/* Icon Bullet */}
          <div className="absolute -left-[17px] top-0 bg-slate-900 rounded-full p-1 border border-slate-700">
            {getLogIcon(log.role, log.action)}
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-sm">{log.action}</span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(log.timestamp).toLocaleString('vi-VN')}
              </span>
            </div>
            
            <div className="text-xs text-slate-400 mt-1">
              Thực hiện bởi: <span className="text-slate-300 font-medium">{log.performedBy}</span> ({log.role})
            </div>

            {log.note && (
              <div className="mt-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                {log.note}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
