import React, { useState } from 'react';
import { 
  CreditCard, Search, Filter, Download, 
  Clock, AlertTriangle, CheckCircle2, DollarSign, 
  ChevronRight, Calendar, User, Eye
} from 'lucide-react';

const INITIAL_LMS_LOANS = [
  {
    contractId: 'LMS-2026-8921',
    customerName: 'Nguyễn Văn An',
    phone: '0901234567',
    product: 'Vay tín chấp theo lương',
    originalAmount: 50000000,
    remainingPrincipal: 37500000,
    termMonths: 12,
    paidMonths: 3,
    nextDueAmount: 4541667,
    nextDueDate: '15/10/2026',
    dpd: 0,
    debtGroup: 'Nhóm 1 (Đủ tiêu chuẩn)',
    status: 'ACTIVE'
  },
  {
    contractId: 'LMS-2026-8840',
    customerName: 'Hoàng Minh Tuấn',
    phone: '0912445566',
    product: 'Vay hộ kinh doanh',
    originalAmount: 100000000,
    remainingPrincipal: 75000000,
    termMonths: 24,
    paidMonths: 6,
    nextDueAmount: 5125000,
    nextDueDate: '18/09/2026',
    dpd: 9,
    debtGroup: 'Nhóm 1 (Chậm nhẹ)',
    status: 'OVERDUE'
  },
  {
    contractId: 'LMS-2026-8712',
    customerName: 'Đỗ Thị Hương',
    phone: '0988771122',
    product: 'Vay theo hóa đơn',
    originalAmount: 40000000,
    remainingPrincipal: 26666667,
    termMonths: 12,
    paidMonths: 4,
    nextDueAmount: 4100000,
    nextDueDate: '05/09/2026',
    dpd: 22,
    debtGroup: 'Nhóm 2 (Cần chú ý)',
    status: 'OVERDUE'
  },
  {
    contractId: 'LMS-2026-8650',
    customerName: 'Trần Văn Cường',
    phone: '0933112233',
    product: 'Vay tín chấp theo lương',
    originalAmount: 60000000,
    remainingPrincipal: 45000000,
    termMonths: 12,
    paidMonths: 3,
    nextDueAmount: 5450000,
    nextDueDate: '20/08/2026',
    dpd: 38,
    debtGroup: 'Nhóm 3 (Dưới tiêu chuẩn)',
    status: 'OVERDUE'
  },
  {
    contractId: 'LMS-2026-8510',
    customerName: 'Bùi Lan Anh',
    phone: '0977889900',
    product: 'Vay sinh viên & trẻ',
    originalAmount: 25000000,
    remainingPrincipal: 0,
    termMonths: 6,
    paidMonths: 6,
    nextDueAmount: 0,
    nextDueDate: 'Đã hoàn tất',
    dpd: 0,
    debtGroup: 'Tất toán',
    status: 'SETTLED'
  }
];

const LmsList = () => {
  const [loans, setLoans] = useState(INITIAL_LMS_LOANS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dpdFilter, setDpdFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  const filteredLoans = loans.filter((loan) => {
    if (statusFilter !== 'ALL' && loan.status !== statusFilter) return false;
    if (dpdFilter === 'DPD_0' && loan.dpd !== 0) return false;
    if (dpdFilter === 'DPD_1_15' && (loan.dpd < 1 || loan.dpd > 15)) return false;
    if (dpdFilter === 'DPD_16_30' && (loan.dpd < 16 || loan.dpd > 30)) return false;
    if (dpdFilter === 'DPD_OVER_30' && loan.dpd <= 30) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        loan.contractId.toLowerCase().includes(q) ||
        loan.customerName.toLowerCase().includes(q) ||
        loan.phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Vòng Đời Khoản Vay (LMS Portfolio)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi dư nợ sau giải ngân, quản lý kỳ hạn hoàn trả và kiểm soát chỉ số DPD quá hạn.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          <Download className="w-4 h-4 text-blue-600" /> Xuất báo cáo LMS
        </button>
      </div>

      {/* Portfolio Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng dư nợ đang quản lý</span>
          <span className="text-xl sm:text-2xl font-black text-blue-600 block">48.2 Tỷ ₫</span>
          <span className="text-[10px] text-slate-500">642 hợp đồng giải ngân</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Đang trả đúng hạn (DPD = 0)</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 block">624 Hợp đồng</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Tỷ lệ trả tốt 97.2%</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Quá hạn cần thu hồi (DPD &gt; 0)</span>
          <span className="text-xl sm:text-2xl font-black text-amber-600 block">18 Hợp đồng</span>
          <span className="text-[10px] text-amber-600 font-semibold">Tỷ lệ quá hạn 2.8%</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Khoản vay đã tất toán</span>
          <span className="text-xl sm:text-2xl font-black text-slate-800 block">1.250 Khoản</span>
          <span className="text-[10px] text-slate-400">Hoàn tất nghĩa vụ nợ</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
        
        {/* Status Tabs */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl transition ${statusFilter === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tất cả ({loans.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-xl transition ${statusFilter === 'ACTIVE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đang vay (Active)
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('OVERDUE')}
            className={`px-3.5 py-1.5 rounded-xl transition ${statusFilter === 'OVERDUE' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Quá hạn (Overdue)
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('SETTLED')}
            className={`px-3.5 py-1.5 rounded-xl transition ${statusFilter === 'SETTLED' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đã tất toán
          </button>
        </div>

        {/* DPD Filter */}
        <div className="flex items-center gap-2">
          <select
            value={dpdFilter}
            onChange={(e) => setDpdFilter(e.target.value)}
            className="input-human py-1.5 text-xs font-semibold"
          >
            <option value="ALL">Tất cả ngưỡng DPD</option>
            <option value="DPD_0">DPD = 0 (Đúng hạn)</option>
            <option value="DPD_1_15">DPD 1 - 15 ngày (Bucket 1)</option>
            <option value="DPD_16_30">DPD 16 - 30 ngày (Bucket 2)</option>
            <option value="DPD_OVER_30">DPD &gt; 30 ngày (Bucket 3)</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã HĐ, tên KH, SĐT..."
              className="input-human pl-9 py-1.5 text-xs w-52"
            />
          </div>
        </div>

      </div>

      {/* Main LMS Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Mã hợp đồng</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Sản phẩm vay</th>
                <th className="py-3.5 px-4">Dư nợ còn lại / Gốc</th>
                <th className="py-3.5 px-4">Tiến độ kỳ</th>
                <th className="py-3.5 px-4">Số tiền kỳ tới</th>
                <th className="py-3.5 px-4">DPD (Số ngày trễ)</th>
                <th className="py-3.5 px-4">Nhóm nợ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.map((loan) => (
                <tr key={loan.contractId} className="hover:bg-blue-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    {loan.contractId}
                  </td>

                  <td className="py-3.5 px-4">
                    <strong className="block text-slate-900">{loan.customerName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{loan.phone}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {loan.product}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-900 block">
                      {formatCurrency(loan.remainingPrincipal)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Gốc: {formatCurrency(loan.originalAmount)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-700">
                    {loan.paidMonths} / {loan.termMonths} tháng
                  </td>

                  <td className="py-3.5 px-4">
                    {loan.nextDueAmount > 0 ? (
                      <>
                        <span className="font-bold text-blue-600 block">
                          {formatCurrency(loan.nextDueAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400">{loan.nextDueDate}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">0 đ</span>
                    )}
                  </td>

                  {/* DPD Badge */}
                  <td className="py-3.5 px-4">
                    {loan.dpd === 0 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        0 ngày (Đúng hạn)
                      </span>
                    ) : loan.dpd <= 15 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {loan.dpd} ngày trễ
                      </span>
                    ) : loan.dpd <= 30 ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                        {loan.dpd} ngày trễ
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold animate-pulse">
                        {loan.dpd} ngày (Nợ xấu)
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {loan.debtGroup}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default LmsList;
