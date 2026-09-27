import React, { useState } from 'react';
import { 
  Send, Landmark, CheckCircle2, Clock, 
  ShieldCheck, AlertTriangle, ArrowRight, DollarSign, 
  Sparkles, Check, KeyRound, RefreshCw
} from 'lucide-react';

const INITIAL_DISBURSEMENT_QUEUE = [
  {
    id: 'LOS-2026-001',
    customerName: 'Nguyễn Văn An',
    phone: '0901234567',
    amount: 50000000,
    bankName: 'Vietcombank',
    accountNumber: '990123456789',
    accountHolder: 'NGUYỄN VĂN AN',
    signedAt: '27/09/2026 11:30',
    status: 'READY'
  },
  {
    id: 'LOS-2026-005',
    customerName: 'Bùi Thị Lan',
    phone: '0944556677',
    amount: 40000000,
    bankName: 'MB Bank',
    accountNumber: '094455667788',
    accountHolder: 'BÙI THỊ LAN',
    signedAt: '27/09/2026 11:15',
    status: 'READY'
  },
  {
    id: 'LOS-2026-007',
    customerName: 'Phan Quốc Bảo',
    phone: '0988112233',
    amount: 70000000,
    bankName: 'Techcombank',
    accountNumber: '190334455667',
    accountHolder: 'PHAN QUỐC BẢO',
    signedAt: '27/09/2026 10:50',
    status: 'READY'
  },
  {
    id: 'LOS-2026-008',
    customerName: 'Trịnh Thu Hà',
    phone: '0933998877',
    amount: 30000000,
    bankName: 'ACB',
    accountNumber: '2468101214',
    accountHolder: 'TRỊNH THU HÀ',
    signedAt: '27/09/2026 10:20',
    status: 'READY'
  }
];

const DisbursementCommand = () => {
  const [queue, setQueue] = useState(INITIAL_DISBURSEMENT_QUEUE);
  const [selectedIds, setSelectedIds] = useState(['LOS-2026-001', 'LOS-2026-005']);
  
  // Execution Modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitCompleted, setTransmitCompleted] = useState(false);
  const [otpToken, setOtpToken] = useState('123456');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  // Toggle selection
  const handleToggleSelect = (id) => {
    setSelectedIds(curr => 
      curr.includes(id) ? curr.filter(item => item !== id) : [...curr, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(queue.filter(q => q.status === 'READY').map(q => q.id));
    } else {
      setSelectedIds([]);
    }
  };

  const selectedLoans = queue.filter(q => selectedIds.includes(q.id));
  const totalDisburseAmount = selectedLoans.reduce((sum, item) => sum + item.amount, 0);

  // Execute Core Banking Batch API
  const handleExecuteBatchDisbursement = () => {
    setIsTransmitting(true);
    setTimeout(() => {
      setIsTransmitting(false);
      setTransmitCompleted(true);
      // Update queue status
      setQueue(curr => curr.map(item => 
        selectedIds.includes(item.id) 
          ? { ...item, status: 'DISBURSED', txRef: 'NAPAS-' + Date.now().toString().slice(-6) }
          : item
      ));
      setSelectedIds([]);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lập Lệnh Giải Ngân Trực Tuyến (Disbursement Hub)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Không gian làm việc của Kế toán xuất quỹ: Lập lệnh chi tiền qua cổng liên ngân hàng Napas 247 và Core Banking.
          </p>
        </div>

        <div className="p-3 px-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-3">
          <Landmark className="w-5 h-5 text-blue-600" />
          <div className="text-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Tài khoản chi chính (VCB):</span>
            <strong className="text-slate-800 font-mono">00110099887766 • Số dư: 120.5 Tỷ ₫</strong>
          </div>
        </div>
      </div>

      {/* Batch Summary Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block">
            Tổng Lệnh Chi Đang Chọn:
          </span>
          <div className="text-2xl font-black text-white">
            {selectedIds.length} Hồ sơ • <span className="text-amber-300">{formatCurrency(totalDisburseAmount)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            disabled={selectedIds.length === 0}
            onClick={() => { setShowConfirmModal(true); setTransmitCompleted(false); }}
            className={`w-full md:w-auto py-3 px-8 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
              selectedIds.length > 0
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25 font-black'
                : 'bg-white/10 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" /> Lập Lệnh Batch & Giải Ngân Ngay ({selectedIds.length})
          </button>
        </div>
      </div>

      {/* Main Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
          <span>Danh sách hồ sơ đã hoàn tất hợp đồng chờ xuất tiền ({queue.length})</span>
          <span className="text-emerald-600">Tự động đối soát tên chủ TK 100% ✓</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === queue.filter(q => q.status === 'READY').length && queue.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3.5 px-4">Mã hồ sơ</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Số tiền giải ngân</th>
                <th className="py-3.5 px-4">Ngân hàng thụ hưởng</th>
                <th className="py-3.5 px-4">Số tài khoản</th>
                <th className="py-3.5 px-4">Tên chủ TK (Đã so khớp)</th>
                <th className="py-3.5 px-4">Thời gian ký HĐ</th>
                <th className="py-3.5 px-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition">
                  <td className="py-3.5 px-4 text-center">
                    {item.status === 'READY' ? (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    {item.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="block text-slate-900">{item.customerName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{item.phone}</span>
                  </td>

                  <td className="py-3.5 px-4 font-black text-blue-600 text-sm">
                    {formatCurrency(item.amount)}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {item.bankName}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {item.accountNumber}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold uppercase text-slate-800 block">{item.accountHolder}</span>
                    <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Khớp CCCD
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {item.signedAt}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'READY' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        Chờ xuất tiền
                      </span>
                    ) : (
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold block">
                          Đã chi tiền ✓
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{item.txRef}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CORE BANKING BATCH EXECUTION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border-2 border-blue-200">
                <Landmark className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Xác Nhận Xuất Lệnh Chi Core Banking</h3>
              <p className="text-xs text-slate-500">
                Lệnh chi sẽ được truyền trực tiếp qua cổng API Napas 247 tới các ngân hàng thụ hưởng.
              </p>
            </div>

            {transmitCompleted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-emerald-950 text-base">Giải ngân hàng loạt thành công!</h4>
                <p className="text-xs text-emerald-800">
                  Đã chuyển thành công tổng số tiền <strong className="font-black">{formatCurrency(totalDisburseAmount)}</strong> tới các khách hàng.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="btn-primary py-2 px-6 rounded-xl font-bold text-xs"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số lượng hợp đồng:</span>
                    <strong className="text-slate-900">{selectedIds.length} khoản vay</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tổng số tiền chi quỹ:</span>
                    <strong className="text-blue-700 font-black text-sm">{formatCurrency(totalDisburseAmount)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cổng thanh toán:</span>
                    <strong className="text-emerald-700">Napas 247 Instant Transfer</strong>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã OTP / Chữ ký số Kế toán trưởng</label>
                  <input
                    type="text"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="Nhập mã OTP 6 số"
                    className="input-human w-full font-mono text-center text-sm font-bold tracking-widest"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block text-center">
                    Mã xác thực chữ ký số PKI CA có hiệu lực trong phiên làm việc.
                  </span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    disabled={isTransmitting}
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    disabled={isTransmitting}
                    onClick={handleExecuteBatchDisbursement}
                    className="flex-1 btn-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md"
                  >
                    {isTransmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Đang truyền lệnh chi...
                      </>
                    ) : (
                      'Xác Nhận & Xuất Tiền'
                    )}
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

export default DisbursementCommand;
