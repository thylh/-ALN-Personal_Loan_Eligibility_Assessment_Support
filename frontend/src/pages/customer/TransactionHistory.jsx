import React, { useState } from 'react';
import { 
  History, ArrowDownLeft, ArrowUpRight, Filter, 
  Search, Download, Calendar, CheckCircle2, 
  Clock, X, Printer, ShieldCheck, FileText, ChevronRight
} from 'lucide-react';

const TRANSACTIONS_DATA = [
  {
    id: 'TXN-REPAY-03',
    type: 'REPAYMENT',
    title: 'Thanh toán tiền gốc & lãi kỳ 3/12',
    contractId: 'HD-2026-LOMS-8921',
    amount: 4541667,
    isPositive: false,
    channel: 'VietQR (MB Virtual Account)',
    timestamp: '15/09/2026 14:22:10',
    status: 'SUCCESS',
    principal: 4166667,
    interest: 375000,
    fee: 0,
    balanceAfter: 37500000
  },
  {
    id: 'TXN-REPAY-02',
    type: 'REPAYMENT',
    title: 'Thanh toán tiền gốc & lãi kỳ 2/12',
    contractId: 'HD-2026-LOMS-8921',
    amount: 4583333,
    isPositive: false,
    channel: 'Chuyển khoản Napas 247',
    timestamp: '14/08/2026 09:45:00',
    status: 'SUCCESS',
    principal: 4166667,
    interest: 416666,
    fee: 0,
    balanceAfter: 41666667
  },
  {
    id: 'TXN-REPAY-01',
    type: 'REPAYMENT',
    title: 'Thanh toán tiền gốc & lãi kỳ 1/12',
    contractId: 'HD-2026-LOMS-8921',
    amount: 4625000,
    isPositive: false,
    channel: 'VietQR Napas 247',
    timestamp: '15/07/2026 18:10:45',
    status: 'SUCCESS',
    principal: 4166667,
    interest: 458333,
    fee: 0,
    balanceAfter: 45833334
  },
  {
    id: 'TXN-DISB-01',
    type: 'DISBURSEMENT',
    title: 'Giải ngân khoản vay tín chấp qua lương',
    contractId: 'HD-2026-LOMS-8921',
    amount: 50000000,
    isPositive: true,
    channel: 'Core Banking Vietcombank',
    timestamp: '15/07/2026 10:30:15',
    status: 'SUCCESS',
    principal: 50000000,
    interest: 0,
    fee: 0,
    balanceAfter: 50000000
  }
];

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState(TRANSACTIONS_DATA);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Receipt Modal State
  const [selectedTxn, setSelectedTxn] = useState(null);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  // Filter logic
  const filteredTransactions = transactions.filter((txn) => {
    if (typeFilter !== 'ALL' && txn.type !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        txn.id.toLowerCase().includes(q) ||
        txn.title.toLowerCase().includes(q) ||
        txn.channel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Lịch Sử Giao Dịch & Sao Kê Dòng Tiền</h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi chi tiết các đợt giải ngân, trả gốc, trả lãi và phí phát sinh theo thời gian thực.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-sm transition"
        >
          <Download className="w-4 h-4 text-blue-600" />
          Xuất sao kê giao dịch PDF
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng giải ngân nhận</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 block">+50.000.000 đ</span>
          <span className="text-[10px] text-slate-500">1 khoản vay</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Gốc đã thanh toán</span>
          <span className="text-xl sm:text-2xl font-black text-blue-600 block">-12.500.000 đ</span>
          <span className="text-[10px] text-slate-500">3 kỳ trả đều</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tiền lãi đã trả</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 block">-1.250.000 đ</span>
          <span className="text-[10px] text-slate-500">Lãi 1.0%/tháng</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Phí phạt trễ hạn</span>
          <span className="text-xl sm:text-2xl font-black text-slate-700 block">0 đ</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Thanh toán đúng hạn 100%</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
        
        {/* Type tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl transition ${typeFilter === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('REPAYMENT')}
            className={`px-3.5 py-1.5 rounded-xl transition ${typeFilter === 'REPAYMENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Trả nợ (-)
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('DISBURSEMENT')}
            className={`px-3.5 py-1.5 rounded-xl transition ${typeFilter === 'DISBURSEMENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Giải ngân (+)
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm mã GD, nội dung..."
            className="input-human w-full pl-9 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Transaction List / Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span>Danh sách giao dịch ({filteredTransactions.length})</span>
          <span>Số tiền & Trạng thái</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTransactions.map((txn) => (
            <div
              key={txn.id}
              onClick={() => setSelectedTxn(txn)}
              className="p-5 sm:px-6 hover:bg-slate-50/80 transition cursor-pointer flex items-center justify-between gap-4 group"
            >
              {/* Left Details */}
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition group-hover:scale-105 ${
                  txn.isPositive 
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                }`}>
                  {txn.isPositive ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {txn.title}
                    </h4>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-mono">
                      {txn.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono">{txn.timestamp}</span>
                    <span>•</span>
                    <span>{txn.channel}</span>
                  </div>
                </div>
              </div>

              {/* Right Amount & Status */}
              <div className="text-right flex items-center gap-4">
                <div>
                  <span className={`text-sm sm:text-base font-black block ${
                    txn.isPositive ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {txn.isPositive ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                    Thành công ✓
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition hidden sm:block" />
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <History className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">Không tìm thấy giao dịch nào phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {/* RECEIPT DETAIL MODAL */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
            
            <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Chi Tiết Biên Lai Điện Tử
              </span>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Số tiền giao dịch</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">
                  {selectedTxn.isPositive ? '+' : '-'}{formatCurrency(selectedTxn.amount)}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mt-1">
                  Giao dịch hoàn tất
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã giao dịch:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTxn.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hợp đồng liên kết:</span>
                  <span className="font-mono font-bold text-blue-600">{selectedTxn.contractId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian xử lý:</span>
                  <span className="font-medium text-slate-800">{selectedTxn.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phương thức:</span>
                  <span className="font-medium text-slate-800">{selectedTxn.channel}</span>
                </div>

                {selectedTxn.type === 'REPAYMENT' && (
                  <>
                    <div className="pt-2 border-t border-slate-200 flex justify-between">
                      <span className="text-slate-500">Khấu trừ tiền gốc:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(selectedTxn.principal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Khấu trừ tiền lãi:</span>
                      <span className="font-bold text-amber-600">{formatCurrency(selectedTxn.interest)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dư nợ còn lại sau GD:</span>
                      <span className="font-bold text-blue-700">{formatCurrency(selectedTxn.balanceAfter)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> In biên lai
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTxn(null)}
                  className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-bold"
                >
                  Đóng
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TransactionHistory;
