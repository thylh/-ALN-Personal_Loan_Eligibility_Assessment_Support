import React, { useState } from 'react';
import { 
  Users, Search, Filter, ShieldCheck, Phone, 
  Mail, Calendar, DollarSign, Clock, ChevronRight, 
  X, History, FileText, CheckCircle2, Award, UserPlus
} from 'lucide-react';

const CRM_CUSTOMERS = [
  {
    id: 'CRM-001',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    idNumber: '001099123456',
    email: 'nguyenvanan@gmail.com',
    tier: 'Vàng',
    cicScore: 785,
    cicGrade: 'A',
    totalLoans: 2,
    activeLoanAmount: 37500000,
    status: 'ACTIVE',
    createdAt: '15/07/2026',
    loanHistory: [
      { id: 'HD-2026-LOMS-8921', product: 'Vay tín chấp theo lương', amount: 50000000, date: '15/07/2026', status: 'Đang trả nợ' },
      { id: 'HD-2025-LOMS-4510', product: 'Vay tiêu dùng nhanh', amount: 20000000, date: '10/01/2025', status: 'Đã tất toán ✓' }
    ],
    interactions: [
      { date: '15/09/2026', type: 'SMS', note: 'Gửi SMS thông báo nhắc nợ kỳ 3 thành công.' },
      { date: '15/07/2026', type: 'Call', note: 'Xác thực thông tin thẩm định hồ sơ eKYC - Kết quả PASSED.' }
    ]
  },
  {
    id: 'CRM-002',
    fullName: 'Lê Hoàng Nam',
    phone: '0987654321',
    idNumber: '001098877665',
    email: 'lehoangnam@gmail.com',
    tier: 'Bạc',
    cicScore: 690,
    cicGrade: 'B',
    totalLoans: 1,
    activeLoanAmount: 75000000,
    status: 'OVERDUE',
    createdAt: '20/03/2026',
    loanHistory: [
      { id: 'HD-2026-LOMS-8840', product: 'Vay hộ kinh doanh', amount: 100000000, date: '20/03/2026', status: 'Quá hạn 9 ngày' }
    ],
    interactions: [
      { date: '26/09/2026', type: 'Call', note: 'Telesale nhắc nợ: Khách hẹn thanh toán trước ngày 28/09 (PTP).' }
    ]
  },
  {
    id: 'CRM-003',
    fullName: 'Vũ Thị Mai',
    phone: '0912334455',
    idNumber: '001099334455',
    email: 'vuthimai@gmail.com',
    tier: 'Chuẩn',
    cicScore: 740,
    cicGrade: 'A',
    totalLoans: 1,
    activeLoanAmount: 30000000,
    status: 'ACTIVE',
    createdAt: '10/08/2026',
    loanHistory: [
      { id: 'HD-2026-LOMS-8955', product: 'Vay sinh viên & trẻ', amount: 30000000, date: '10/08/2026', status: 'Đang trả nợ' }
    ],
    interactions: [
      { date: '10/08/2026', type: 'System', note: 'Giải ngân thành công 30 triệu qua Napas 247.' }
    ]
  }
];

const CrmCustomerList = () => {
  const [customers, setCustomers] = useState(CRM_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  const filteredCustomers = customers.filter(c => {
    if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.fullName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.idNumber.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Khách Hàng (Customer 360 View)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Hồ sơ khách hàng 360 độ: Lịch sử tất cả các khoản vay cũ & mới, phân hạng tín dụng và tương tác chăm sóc.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert('Chức năng tạo hồ sơ khách hàng tại quầy')}
          className="btn-primary py-2.5 px-5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md"
        >
          <UserPlus className="w-4 h-4" /> Thêm khách hàng mới
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tổng số khách hàng</span>
          <span className="text-2xl font-black text-slate-900 block">1.280 KH</span>
          <span className="text-[10px] text-emerald-600 font-semibold">+45 khách hàng mới tuần này</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Khách vay quay lại</span>
          <span className="text-2xl font-black text-blue-600 block">45.2%</span>
          <span className="text-[10px] text-slate-500">Tỷ lệ giữ chân cao (Retention)</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Khách hàng hạng Vàng/VIP</span>
          <span className="text-2xl font-black text-amber-500 block">312 KH</span>
          <span className="text-[10px] text-slate-500">CIC Hạng A & thanh toán tốt</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tỷ lệ quá hạn CRM</span>
          <span className="text-2xl font-black text-emerald-600 block">1.1%</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Kiểm soát rủi ro hiệu quả</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setTierFilter('ALL')}
            className={`px-4 py-1.5 rounded-xl transition ${tierFilter === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tất cả hạng
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('Vàng')}
            className={`px-4 py-1.5 rounded-xl transition ${tierFilter === 'Vàng' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Hạng Vàng (VIP)
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('Bạc')}
            className={`px-4 py-1.5 rounded-xl transition ${tierFilter === 'Bạc' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Hạng Bạc
          </button>
          <button
            type="button"
            onClick={() => setTierFilter('Chuẩn')}
            className={`px-4 py-1.5 rounded-xl transition ${tierFilter === 'Chuẩn' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Hạng Chuẩn
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên KH, CCCD, SĐT..."
            className="input-human pl-9 py-1.5 text-xs w-60"
          />
        </div>
      </div>

      {/* Main CRM Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Mã KH</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">CCCD & Ngày tạo</th>
                <th className="py-3.5 px-4">Hạng thành viên</th>
                <th className="py-3.5 px-4">Điểm CIC</th>
                <th className="py-3.5 px-4">Khoản vay (Đang vay / Đã trả)</th>
                <th className="py-3.5 px-4">Dư nợ hiện tại</th>
                <th className="py-3.5 px-4 text-right">Xem 360°</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-blue-50/50 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{cust.id}</td>

                  <td className="py-3.5 px-4">
                    <strong className="block text-slate-900">{cust.fullName}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{cust.phone}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-mono text-slate-800 font-semibold block">{cust.idNumber}</span>
                    <span className="text-[10px] text-slate-400">{cust.createdAt}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cust.tier === 'Vàng' ? 'bg-amber-100 text-amber-800 border border-amber-300' : cust.tier === 'Bạc' ? 'bg-slate-200 text-slate-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {cust.tier}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`risk-badge-${cust.cicGrade}`}>
                      Hạng {cust.cicGrade} ({cust.cicScore} đ)
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {cust.totalLoans} khoản vay
                  </td>

                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {formatCurrency(cust.activeLoanAmount)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(cust)}
                      className="btn-primary py-1 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                    >
                      Hồ sơ 360°
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER 360 VIEW MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center">
                  {selectedCustomer.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedCustomer.fullName}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedCustomer.id} • CCCD: {selectedCustomer.idNumber} • SĐT: {selectedCustomer.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              
              {/* Loan History in System */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Lịch sử các khoản vay trong hệ thống ({selectedCustomer.loanHistory.length})
                </h4>
                
                <div className="space-y-2">
                  {selectedCustomer.loanHistory.map((l, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900 font-mono block">{l.id}</strong>
                        <span className="text-[11px] text-slate-500">{l.product} • Ngày: {l.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 block">{formatCurrency(l.amount)}</span>
                        <span className="text-[10px] text-blue-600 font-bold">{l.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactions / Collection Call History */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <History className="w-4 h-4 text-amber-600" />
                  Nhật ký tương tác chăm sóc & Telesale ({selectedCustomer.interactions.length})
                </h4>

                <div className="space-y-2">
                  {selectedCustomer.interactions.map((int, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {int.type}
                      </span>
                      <div className="flex-1">
                        <span className="text-slate-400 text-[10px] block font-mono">{int.date}</span>
                        <p className="text-slate-700 text-[11px] mt-0.5">{int.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="btn-primary py-2 px-6 rounded-xl font-bold text-xs"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default CrmCustomerList;
