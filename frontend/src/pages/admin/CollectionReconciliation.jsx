import React, { useState } from 'react';
import { 
  FileSpreadsheet, UploadCloud, CheckCircle2, AlertTriangle, 
  Search, Filter, Check, ArrowRight, DollarSign, 
  Layers, ShieldCheck, Download, RefreshCw, Landmark
} from 'lucide-react';

const AUTO_MATCHED_TRANSACTIONS = [
  {
    id: 'TXN-MB-9921',
    timestamp: '27/09/2026 14:15:20',
    vaAccount: '99LOMS001099123456',
    customerName: 'Nguyễn Văn An',
    contractId: 'HD-2026-LOMS-8921',
    amount: 4541667,
    expectedAmount: 4541667,
    matchType: 'AUTO_VA',
    status: 'RECONCILED',
    allocated: {
      penaltyFee: 0,
      overdueInterest: 0,
      normalInterest: 375000,
      principal: 4166667
    }
  },
  {
    id: 'TXN-MB-9920',
    timestamp: '27/09/2026 13:40:10',
    vaAccount: '99LOMS001098877665',
    customerName: 'Lê Hoàng Nam',
    contractId: 'HD-2026-LOMS-8840',
    amount: 5125000,
    expectedAmount: 5125000,
    matchType: 'AUTO_VA',
    status: 'RECONCILED',
    allocated: {
      penaltyFee: 150000,
      overdueInterest: 225000,
      normalInterest: 750000,
      principal: 4000000
    }
  },
  {
    id: 'TXN-VCB-8812',
    timestamp: '27/09/2026 11:20:05',
    vaAccount: '00110099887766',
    customerName: 'Vũ Thị Mai',
    contractId: 'HD-2026-LOMS-8510',
    amount: 4100000,
    expectedAmount: 4100000,
    matchType: 'AUTO_MEMO',
    status: 'RECONCILED',
    allocated: {
      penaltyFee: 0,
      overdueInterest: 0,
      normalInterest: 300000,
      principal: 3800000
    }
  }
];

const UNMATCHED_TRANSACTIONS = [
  {
    id: 'TXN-UNKNOWN-01',
    timestamp: '27/09/2026 10:05:12',
    bank: 'Vietcombank',
    rawSender: 'PHAM VAN LONG chuyen tien',
    amount: 3500000,
    rawMemo: 'tra tien vay thang 9',
    suggestedContract: 'HD-2026-LOMS-8620'
  },
  {
    id: 'TXN-UNKNOWN-02',
    timestamp: '27/09/2026 08:30:45',
    bank: 'Techcombank',
    rawSender: 'NGUYEN THI HOA',
    amount: 2800000,
    rawMemo: 'chuyen khoan',
    suggestedContract: 'Chưa tìm thấy'
  }
];

const CollectionReconciliation = () => {
  const [activeTab, setActiveTab] = useState('auto'); // 'auto' or 'manual'
  const [unmatchedList, setUnmatchedList] = useState(UNMATCHED_TRANSACTIONS);
  const [matchedList, setMatchedList] = useState(AUTO_MATCHED_TRANSACTIONS);
  
  // Manual Match Modal
  const [selectedUnmatched, setSelectedUnmatched] = useState(null);
  const [manualContractInput, setManualContractInput] = useState('');
  const [manualSuccess, setManualSuccess] = useState(false);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  const handleManualMatchConfirm = () => {
    setManualSuccess(true);
    setTimeout(() => {
      setUnmatchedList(curr => curr.filter(item => item.id !== selectedUnmatched.id));
      setMatchedList(curr => [
        {
          id: selectedUnmatched.id,
          timestamp: selectedUnmatched.timestamp,
          vaAccount: 'MANUAL',
          customerName: selectedUnmatched.rawSender,
          contractId: manualContractInput || selectedUnmatched.suggestedContract,
          amount: selectedUnmatched.amount,
          expectedAmount: selectedUnmatched.amount,
          matchType: 'MANUAL_MATCHED',
          status: 'RECONCILED',
          allocated: {
            penaltyFee: 0,
            overdueInterest: 0,
            normalInterest: 300000,
            principal: selectedUnmatched.amount - 300000
          }
        },
        ...curr
      ]);
      setSelectedUnmatched(null);
      setManualSuccess(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Thu Nợ & Đối Soát Dòng Tiền (Reconciliation)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tự động gạch nợ dòng tiền báo có từ ngân hàng và đối chiếu công nợ phải thu.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('auto')}
            className={`px-5 py-2 rounded-xl transition ${activeTab === 'auto' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Khớp tự động VA ({matchedList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-5 py-2 rounded-xl transition ${activeTab === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Cần đối soát thủ công ({unmatchedList.length})
          </button>
        </div>
      </div>

      {/* Waterfall Allocation Visual Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Thứ tự ưu tiên phân bổ dòng tiền trả nợ (Waterfall Allocation Rule):
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-900">
            <span className="font-bold text-[10px] uppercase block text-red-600">Ưu tiên 1</span>
            <strong>Phí phạt trễ hạn</strong>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <span className="font-bold text-[10px] uppercase block text-amber-600">Ưu tiên 2</span>
            <strong>Lãi quá hạn phát sinh</strong>
          </div>
          <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
            <span className="font-bold text-[10px] uppercase block text-blue-600">Ưu tiên 3</span>
            <strong>Lãi trong hạn kỳ này</strong>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <span className="font-bold text-[10px] uppercase block text-emerald-600">Ưu tiên 4</span>
            <strong>Khấu trừ Dư nợ gốc</strong>
          </div>
        </div>
      </div>

      {/* TAB 1: AUTO RECONCILED TRANSACTIONS (VA) */}
      {activeTab === 'auto' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
            <span>Danh sách giao dịch đã gạch nợ tự động qua Virtual Account ({matchedList.length})</span>
            <span className="text-emerald-600">Khớp 100% thời gian thực ✓</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Mã GD Ngân hàng</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Khách hàng / Hợp đồng</th>
                  <th className="py-3.5 px-4">Số tiền nhận</th>
                  <th className="py-3.5 px-4">Khấu trừ Lãi</th>
                  <th className="py-3.5 px-4">Khấu trừ Gốc</th>
                  <th className="py-3.5 px-4">Phí phạt</th>
                  <th className="py-3.5 px-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matchedList.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {item.id}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {item.timestamp}
                    </td>

                    <td className="py-3.5 px-4">
                      <strong className="block text-slate-900">{item.customerName}</strong>
                      <span className="text-[10px] text-blue-600 font-mono">{item.contractId}</span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                      +{formatCurrency(item.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-amber-700 font-semibold">
                      {formatCurrency(item.allocated.normalInterest + item.allocated.overdueInterest)}
                    </td>

                    <td className="py-3.5 px-4 text-blue-700 font-semibold">
                      {formatCurrency(item.allocated.principal)}
                    </td>

                    <td className="py-3.5 px-4 text-red-600 font-semibold">
                      {formatCurrency(item.allocated.penaltyFee)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Đã gạch nợ ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL RECONCILIATION & EXCEL UPLOAD */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          
          {/* Upload Dropzone for Statement */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Tải lên Tệp Sao Kê Ngân Hàng (.xlsx, .csv)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kéo thả file sao kê để hệ thống tự động bóc tách và đối chiếu các khoản thu nợ chuyển khoản thường.
              </p>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => alert('Đã nạp 2 giao dịch cần đối chiếu!')}
                className="btn-primary py-2 px-5 rounded-xl font-bold text-xs inline-flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" /> Chọn tệp sao kê Excel
              </button>
            </div>
          </div>

          {/* Unmatched List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
              <span>Các giao dịch chưa nhận diện được Hợp đồng ({unmatchedList.length})</span>
              <span className="text-amber-600">Cần kế toán đối soát thủ công</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Mã GD</th>
                    <th className="py-3.5 px-4">Thời gian</th>
                    <th className="py-3.5 px-4">Ngân hàng</th>
                    <th className="py-3.5 px-4">Tên người gửi thực tế</th>
                    <th className="py-3.5 px-4">Nội dung chuyển khoản (Raw Memo)</th>
                    <th className="py-3.5 px-4">Số tiền vào</th>
                    <th className="py-3.5 px-4">Gợi ý khớp</th>
                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unmatchedList.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {item.id}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {item.timestamp}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {item.bank}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.rawSender}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        "{item.rawMemo}"
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-600 text-sm">
                        +{formatCurrency(item.amount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold">
                          {item.suggestedContract}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUnmatched(item);
                            setManualContractInput(item.suggestedContract);
                          }}
                          className="btn-primary py-1 px-3 rounded-lg text-xs font-bold"
                        >
                          Khớp hợp đồng
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MANUAL MATCH MODAL */}
      {selectedUnmatched && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-slate-900">Xác Nhận Gạch Nợ Thủ Công</h3>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Người chuyển tiền:</span>
                <strong className="text-slate-900">{selectedUnmatched.rawSender}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền nhận:</span>
                <strong className="text-emerald-600 font-black">{formatCurrency(selectedUnmatched.amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nội dung ghi có:</span>
                <span className="font-mono text-slate-700">"{selectedUnmatched.rawMemo}"</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã Hợp Đồng gán gạch nợ</label>
              <input
                type="text"
                value={manualContractInput}
                onChange={(e) => setManualContractInput(e.target.value)}
                placeholder="Ví dụ: HD-2026-LOMS-8620"
                className="input-human w-full font-mono font-bold text-blue-700"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedUnmatched(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleManualMatchConfirm}
                className="flex-1 btn-primary py-2.5 rounded-xl font-bold text-xs"
              >
                Xác nhận gạch nợ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CollectionReconciliation;
