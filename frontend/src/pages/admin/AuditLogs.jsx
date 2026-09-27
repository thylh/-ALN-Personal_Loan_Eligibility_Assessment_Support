import React, { useState } from 'react';
import { 
  ShieldCheck, Search, Filter, Download, AlertTriangle, 
  CheckCircle2, XCircle, Clock, Eye, RefreshCw, 
  Terminal, User, Globe, Lock, ArrowUpRight, FileCode, Check
} from 'lucide-react';

const MOCK_AUDIT_LOGS = [
  {
    id: 'LOG-892301',
    timestamp: '2026-09-28 00:15:32',
    userId: 'US-001',
    userName: 'Nguyễn Quản Trị',
    role: 'Admin',
    ip: '14.232.18.99',
    device: 'Chrome 128 / Windows 11',
    action: 'MODIFY_RULE',
    actionLabel: 'Sửa quy tắc tín dụng',
    actionCategory: 'SYSTEM_CONFIG',
    targetType: 'RULE_ENGINE',
    targetId: 'RULE-002 (CIC Check)',
    status: 'SUCCESS',
    severity: 'HIGH',
    details: {
      field: 'minScore',
      oldValue: 650,
      newValue: 670,
      reason: 'Siết chặt khẩu vị rủi ro Q4/2026 theo chỉ thị Ban điều hành'
    }
  },
  {
    id: 'LOG-892300',
    timestamp: '2026-09-27 23:42:10',
    userId: 'US-003',
    userName: 'Phạm Kế Toán',
    role: 'Accountant',
    ip: '192.168.1.105',
    device: 'Safari 17 / macOS',
    action: 'DISBURSE_BATCH',
    actionLabel: 'Phê duyệt lệnh giải ngân Napas',
    actionCategory: 'FINANCIAL',
    targetType: 'DISBURSEMENT_BATCH',
    targetId: 'BATCH-20260927-02',
    status: 'SUCCESS',
    severity: 'CRITICAL',
    details: {
      totalRecords: 3,
      totalAmount: 115000000,
      channel: 'NAPAS_247',
      authOtpMethod: 'HARD_TOKEN_RSA'
    }
  },
  {
    id: 'LOG-892299',
    timestamp: '2026-09-27 22:10:04',
    userId: 'US-002',
    userName: 'Trần Thị Thẩm Định',
    role: 'Underwriter',
    ip: '113.161.45.12',
    device: 'Edge 126 / Windows 11',
    action: 'APPROVE_LOAN',
    actionLabel: 'Phê duyệt hồ sơ vay',
    actionCategory: 'UNDERWRITING',
    targetType: 'LOAN_APPLICATION',
    targetId: 'LOS-2026-001',
    status: 'SUCCESS',
    severity: 'MEDIUM',
    details: {
      approvedAmount: 50000000,
      interestRate: '12.5%/năm',
      cicScorePassed: 785,
      mandatoryCheckCicVerified: true
    }
  },
  {
    id: 'LOG-892298',
    timestamp: '2026-09-27 21:55:18',
    userId: 'US-UNKNOWN',
    userName: 'Chưa xác thực',
    role: 'Guest',
    ip: '45.134.20.12',
    device: 'Python-requests/2.31',
    action: 'LOGIN_FAILED',
    actionLabel: 'Đăng nhập thất bại (Sai mật khẩu)',
    actionCategory: 'SECURITY',
    targetType: 'AUTH',
    targetId: 'admin@hethongvay.vn',
    status: 'FAILED',
    severity: 'CRITICAL',
    details: {
      reason: 'Bad credentials - Attempt 4/5',
      blockedAfterAttempts: false,
      suspiciousIp: true
    }
  },
  {
    id: 'LOG-892297',
    timestamp: '2026-09-27 20:30:11',
    userId: 'US-002',
    userName: 'Trần Thị Thẩm Định',
    role: 'Underwriter',
    ip: '113.161.45.12',
    device: 'Edge 126 / Windows 11',
    action: 'RFI_REQUEST',
    actionLabel: 'Yêu cầu bổ sung hồ sơ (RFI)',
    actionCategory: 'UNDERWRITING',
    targetType: 'LOAN_APPLICATION',
    targetId: 'LOS-2026-004',
    status: 'SUCCESS',
    severity: 'LOW',
    details: {
      requestedDocs: ['Sao kê tài khoản 3 tháng gần nhất có mộc đỏ'],
      slaExtendedHours: 24
    }
  },
  {
    id: 'LOG-892296',
    timestamp: '2026-09-27 19:12:44',
    userId: 'US-004',
    userName: 'Vũ Thu Hồi Nợ',
    role: 'Collection',
    ip: '192.168.1.189',
    device: 'Chrome 128 / Windows 10',
    action: 'ADD_CALL_LOG',
    actionLabel: 'Ghi nhật ký cuộc gọi đòi nợ',
    actionCategory: 'COLLECTION',
    targetType: 'LOAN_CONTRACT',
    targetId: 'HD-2026-LOMS-1044',
    status: 'SUCCESS',
    severity: 'LOW',
    details: {
      contactStatus: 'CUSTOMER_PROMISE_PAY',
      ptpDate: '2026-09-30',
      promisedAmount: 18500000
    }
  },
  {
    id: 'LOG-892295',
    timestamp: '2026-09-27 18:05:00',
    userId: 'US-001',
    userName: 'Nguyễn Quản Trị',
    role: 'Admin',
    ip: '14.232.18.99',
    device: 'Chrome 128 / Windows 11',
    action: 'UPDATE_PERMISSION',
    actionLabel: 'Cập nhật ma trận phân quyền',
    actionCategory: 'IAM',
    targetType: 'USER_ROLE',
    targetId: 'ROLE_UNDERWRITER',
    status: 'SUCCESS',
    severity: 'HIGH',
    details: {
      permissionAdded: 'RECONCILE_MANUAL',
      authorizedBy: 'BOARD_OF_DIRECTORS'
    }
  },
  {
    id: 'LOG-892294',
    timestamp: '2026-09-27 16:40:22',
    userId: 'US-003',
    userName: 'Phạm Kế Toán',
    role: 'Accountant',
    ip: '192.168.1.105',
    device: 'Safari 17 / macOS',
    action: 'MANUAL_RECONCILE',
    actionLabel: 'Khớp nối gạch nợ thủ công',
    actionCategory: 'FINANCIAL',
    targetType: 'TRANSACTION',
    targetId: 'TXN-MBB-998124',
    status: 'WARNING',
    severity: 'MEDIUM',
    details: {
      matchedWithContract: 'HD-2026-LOMS-8921',
      transferredAmount: 5200000,
      note: 'Khách hàng chuyển khoản sai cú pháp nội dung VA'
    }
  }
];

export default function AuditLogs() {
  const [logs, setLogs] = useState(MOCK_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || log.actionCategory === selectedCategory;
    const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit-logs-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* HEADER & COMPLIANCE BADGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Lịch sử Thao tác & Nhật ký Bảo mật (Audit Logs)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Read-Only Immutable
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Ghi nhận toàn bộ thao tác thêm/sửa/xóa/phê duyệt, địa chỉ IP và phiên làm việc theo tiêu chuẩn kiểm toán Ngân hàng Nhà nước.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={exportLogsAsJson}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Xuất File Kiểm Toán (JSON/CSV)
          </button>
        </div>
      </div>

      {/* INTEGRITY BANNER & KPI STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Tổng bản ghi Log</p>
            <p className="text-2xl font-bold text-white mt-1">{logs.length}</p>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> Ghi nhận 100% realtime
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <Terminal className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Hành vi Nghi vấn</p>
            <p className="text-2xl font-bold text-rose-400 mt-1">1</p>
            <span className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3" /> 1 IP lạ brute-force mật khẩu
            </span>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Thao tác Quản trị / Rule</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">2</p>
            <span className="text-[11px] text-slate-400 mt-1">Đã gắn mã cấp phê duyệt</span>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium">Tính toàn vẹn Dữ liệu</p>
            <p className="text-sm font-bold text-emerald-400 mt-1 font-mono">SHA-256 VALID</p>
            <span className="text-[11px] text-slate-400 mt-1">Không có dấu hiệu giả mạo</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Tìm theo Mã Log, User, IP, Đối tượng (LOS, RULE, BATCH)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Mọi phân loại</option>
            <option value="UNDERWRITING">Thẩm định (Underwriting)</option>
            <option value="FINANCIAL">Tài chính & Giải ngân</option>
            <option value="SYSTEM_CONFIG">Cấu hình Hệ thống</option>
            <option value="IAM">Phân quyền IAM</option>
            <option value="SECURITY">An ninh & Đăng nhập</option>
            <option value="COLLECTION">Thu hồi nợ</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả mức độ</option>
            <option value="CRITICAL">Critical (Rất quan trọng / Cảnh báo)</option>
            <option value="HIGH">High (Sửa Rule/IAM)</option>
            <option value="MEDIUM">Medium (Duyệt/Từ chối hồ sơ)</option>
            <option value="LOW">Low (Ghi log thông thường)</option>
          </select>

          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); setSelectedSeverity('ALL'); }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            title="Reset bộ lọc"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* READ-ONLY AUDIT LOGS TABLE */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Mã Log & Thời gian</th>
                <th className="px-4 py-3.5">Người thực hiện (User / Role)</th>
                <th className="px-4 py-3.5">Địa chỉ IP & Thiết bị</th>
                <th className="px-4 py-3.5">Hành động</th>
                <th className="px-4 py-3.5">Đối tượng tác động</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-4 py-3.5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map(log => {
                const isCritical = log.severity === 'CRITICAL';
                const isHigh = log.severity === 'HIGH';

                return (
                  <tr 
                    key={log.id} 
                    className={`hover:bg-slate-800/40 transition group ${
                      isCritical ? 'bg-rose-500/5' : isHigh ? 'bg-amber-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-slate-200">{log.id}</span>
                        <button 
                          onClick={() => handleCopy(log.id, log.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition"
                          title="Copy Log ID"
                        >
                          {copiedId === log.id ? <Check className="w-3 h-3 text-emerald-400" /> : <ArrowUpRight className="w-3 h-3" />}
                        </button>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                          {log.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white text-xs">{log.userName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <span className="text-slate-500">{log.userId}</span> • 
                            <span className="text-blue-400 font-mono">{log.role}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-mono text-xs text-slate-300 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-500" />
                        {log.ip}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[160px]" title={log.device}>
                        {log.device}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                          log.actionCategory === 'SECURITY' ? 'bg-rose-500/20 text-rose-300' :
                          log.actionCategory === 'FINANCIAL' ? 'bg-emerald-500/20 text-emerald-300' :
                          log.actionCategory === 'SYSTEM_CONFIG' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{log.actionLabel}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-mono text-xs font-medium text-white">{log.targetId}</div>
                      <div className="text-[11px] text-slate-500">{log.targetType}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Thành công
                        </span>
                      ) : log.status === 'WARNING' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" /> Cảnh báo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" /> Thất bại
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white text-xs font-medium transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL (INSPECTION / DIFF JSON) */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Chi tiết Bản ghi Kiểm toán: <span className="font-mono text-blue-400">{selectedLog.id}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedLog.timestamp} • IP: {selectedLog.ip}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Người thực hiện</span>
                  <span className="font-medium text-white">{selectedLog.userName} ({selectedLog.userId})</span>
                  <span className="text-blue-400 block mt-0.5">Role: {selectedLog.role}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Đối tượng tác động</span>
                  <span className="font-mono text-emerald-400 font-medium block">{selectedLog.targetId}</span>
                  <span className="text-slate-400 block mt-0.5">Loại: {selectedLog.targetType}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Payload Metadata & Event Diff (JSON)
                </span>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-300">
                <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-400" />
                <span>
                  Bản ghi này đã được ký số chữ ký bất biến (HMAC-SHA256 signature). Không thể bị chỉnh sửa hoặc ghi đè bởi bất kỳ người dùng quản trị nào kể cả cấp Super Admin.
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
