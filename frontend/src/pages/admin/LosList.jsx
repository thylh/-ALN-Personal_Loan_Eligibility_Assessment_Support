import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Search, Filter, Clock, CheckCircle2, 
  AlertTriangle, XCircle, ArrowUpRight, Download, 
  UserCheck, Plus, RefreshCw, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';

const INITIAL_LOS_APPLICATIONS = [
  {
    id: 'LOS-2026-001',
    customerName: 'Nguyễn Văn An',
    phone: '0901234567',
    idNumber: '001099123456',
    amount: 50000000,
    termMonths: 12,
    product: 'Vay tín chấp theo lương',
    riskGrade: 'A',
    score: 785,
    status: 'PENDING',
    statusLabel: 'Chờ duyệt',
    officer: 'Trần Thị Bình',
    createdAt: '27/09/2026 10:15',
    slaMinutesLeft: 14
  },
  {
    id: 'LOS-2026-002',
    customerName: 'Lê Hoàng Nam',
    phone: '0987654321',
    idNumber: '001098877665',
    amount: 120000000,
    termMonths: 24,
    product: 'Vay hộ kinh doanh',
    riskGrade: 'B',
    score: 690,
    status: 'IN_REVIEW',
    statusLabel: 'Đang thẩm định',
    officer: 'Trần Thị Bình',
    createdAt: '27/09/2026 09:30',
    slaMinutesLeft: 28
  },
  {
    id: 'LOS-2026-003',
    customerName: 'Vũ Thị Mai',
    phone: '0912334455',
    idNumber: '001099334455',
    amount: 30000000,
    termMonths: 6,
    product: 'Vay sinh viên & trẻ',
    riskGrade: 'A',
    score: 740,
    status: 'PENDING',
    statusLabel: 'Chờ duyệt',
    officer: 'Chưa phân công',
    createdAt: '27/09/2026 11:00',
    slaMinutesLeft: 45
  },
  {
    id: 'LOS-2026-004',
    customerName: 'Đặng Quốc Huy',
    phone: '0933221100',
    idNumber: '001097223344',
    amount: 80000000,
    termMonths: 18,
    product: 'Vay theo hóa đơn',
    riskGrade: 'C',
    score: 580,
    status: 'ACTION_REQUIRED',
    statusLabel: 'Cần bổ sung',
    officer: 'Lê Văn Cường',
    createdAt: '26/09/2026 16:45',
    slaMinutesLeft: 52
  },
  {
    id: 'LOS-2026-005',
    customerName: 'Bùi Thị Lan',
    phone: '0944556677',
    idNumber: '001098556677',
    amount: 40000000,
    termMonths: 12,
    product: 'Vay tín chấp theo lương',
    riskGrade: 'A',
    score: 790,
    status: 'APPROVED',
    statusLabel: 'Đã phê duyệt',
    officer: 'Trần Thị Bình',
    createdAt: '26/09/2026 14:20',
    slaMinutesLeft: 0
  },
  {
    id: 'LOS-2026-006',
    customerName: 'Hoàng Minh Tuấn',
    phone: '0966778899',
    idNumber: '001095667788',
    amount: 150000000,
    termMonths: 36,
    product: 'Vay hộ kinh doanh',
    riskGrade: 'D',
    score: 490,
    status: 'REJECTED',
    statusLabel: 'Từ chối (CIC 3)',
    officer: 'Lê Văn Cường',
    createdAt: '26/09/2026 11:10',
    slaMinutesLeft: 0
  }
];

const LosList = () => {
  const [applications, setApplications] = useState(INITIAL_LOS_APPLICATIONS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [officerFilter, setOfficerFilter] = useState('ALL'); // 'ALL' or 'MINE'
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  // Filter application items
  const filteredApps = applications.filter((app) => {
    if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;
    if (gradeFilter !== 'ALL' && app.riskGrade !== gradeFilter) return false;
    if (officerFilter === 'MINE' && app.officer !== 'Trần Thị Bình') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        app.id.toLowerCase().includes(q) ||
        app.customerName.toLowerCase().includes(q) ||
        app.phone.includes(q) ||
        app.idNumber.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Khởi Tạo & Thẩm Định Hồ Sơ Vay (LOS Queue)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Không gian làm việc của chuyên viên thẩm định rủi ro và ra quyết định phê duyệt tín dụng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-4 h-4 text-blue-600" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã HS, tên KH, CCCD, SĐT..."
              className="input-human w-full pl-9 py-2 text-xs"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-human w-full py-2 font-medium"
            >
              <option value="ALL">Tất cả trạng thái hồ sơ</option>
              <option value="PENDING">Chờ phê duyệt</option>
              <option value="IN_REVIEW">Đang thẩm định</option>
              <option value="ACTION_REQUIRED">Cần bổ sung chứng từ</option>
              <option value="APPROVED">Đã phê duyệt</option>
              <option value="REJECTED">Bị từ chối</option>
            </select>
          </div>

          {/* Risk Grade Filter */}
          <div>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="input-human w-full py-2 font-medium"
            >
              <option value="ALL">Tất cả phân hạng rủi ro</option>
              <option value="A">Hạng A (Rủi ro Thấp - Rất Tốt)</option>
              <option value="B">Hạng B (Rủi ro Trung Bình)</option>
              <option value="C">Hạng C (Rủi ro Cao)</option>
              <option value="D">Hạng D (Rủi ro Nghiêm Trọng)</option>
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <select
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
              className="input-human w-full py-2 font-bold text-blue-700 bg-blue-50/50"
            >
              <option value="ALL">Toàn bộ hồ sơ phòng ban</option>
              <option value="MINE">Chỉ hồ sơ phân công cho tôi (Trần Thị Bình)</option>
            </select>
          </div>

        </div>

        {/* Quick summary counts */}
        <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-500">
            Hiển thị <strong>{filteredApps.length}</strong> / {applications.length} hồ sơ
          </span>

          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="flex items-center gap-1 text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Chờ duyệt: 2
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Đang xử lý: 1
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Đã duyệt: 1
            </span>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Mã hồ sơ</th>
                <th className="py-3.5 px-4">Khách hàng / CCCD</th>
                <th className="py-3.5 px-4">Số tiền & Sản phẩm</th>
                <th className="py-3.5 px-4">Điểm / Hạng rủi ro</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Cán bộ phụ trách</th>
                <th className="py-3.5 px-4">SLA Còn lại</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition">
                  {/* LOS ID */}
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                    <Link to={`/admin/los/${item.id}`} className="hover:underline">
                      {item.id}
                    </Link>
                  </td>

                  {/* Customer Info */}
                  <td className="py-3.5 px-4">
                    <strong className="block text-slate-900 font-bold text-xs">{item.customerName}</strong>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{item.phone}</span> • <span>{item.idNumber}</span>
                    </div>
                  </td>

                  {/* Loan Amount & Product */}
                  <td className="py-3.5 px-4">
                    <span className="font-black text-slate-900 block text-xs">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {item.product} ({item.termMonths}T)
                    </span>
                  </td>

                  {/* Risk Grade & Score */}
                  <td className="py-3.5 px-4">
                    <span className={`risk-badge-${item.riskGrade}`}>
                      Hạng {item.riskGrade} ({item.score} đ)
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {item.status === 'PENDING' && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-[10px] font-bold">
                        Chờ duyệt
                      </span>
                    )}
                    {item.status === 'IN_REVIEW' && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">
                        Đang thẩm định
                      </span>
                    )}
                    {item.status === 'ACTION_REQUIRED' && (
                      <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-[10px] font-bold">
                        Cần bổ sung
                      </span>
                    )}
                    {item.status === 'APPROVED' && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                        Đã phê duyệt ✓
                      </span>
                    )}
                    {item.status === 'REJECTED' && (
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-[10px] font-bold">
                        Từ chối
                      </span>
                    )}
                  </td>

                  {/* Assignee */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {item.officer}
                  </td>

                  {/* SLA Timer */}
                  <td className="py-3.5 px-4">
                    {item.slaMinutesLeft > 0 ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.slaMinutesLeft < 20 
                          ? 'bg-red-100 text-red-700 animate-pulse' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.slaMinutesLeft} phút
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">Đã đóng</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/los/${item.id}`}
                      className="btn-primary py-1.5 px-3 rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                    >
                      Thẩm định
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Trang 1 / 1</span>
          <div className="flex gap-1">
            <button type="button" disabled className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-300 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button type="button" disabled className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-300 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LosList;
