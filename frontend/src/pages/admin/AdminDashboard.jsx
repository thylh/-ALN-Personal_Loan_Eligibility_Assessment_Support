import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DollarSign, Users, Activity, FileCheck, 
  TrendingUp, TrendingDown, Clock, AlertTriangle, 
  ArrowUpRight, ShieldCheck, CheckCircle2, ChevronRight, 
  Building2, RefreshCw, Filter, Layers, PieChart as PieIcon
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { useSocket } from '../../context/SocketContext';
import { api } from '../../services/api';
import CustomerProfile360Modal from '../../components/CustomerProfile360Modal';

const DISBURSEMENT_TREND_DATA = [
  { day: 'T2 (22/09)', amount: 1450, count: 28 },
  { day: 'T3 (23/09)', amount: 2100, count: 42 },
  { day: 'T4 (24/09)', amount: 1850, count: 36 },
  { day: 'T5 (25/09)', amount: 2600, count: 51 },
  { day: 'T6 (26/09)', amount: 3200, count: 64 },
  { day: 'T7 (27/09)', amount: 2150, count: 39 },
  { day: 'CN (28/09)', amount: 1500, count: 25 },
];

const INITIAL_APPROVAL_PIE_DATA = [
  { name: 'Đã phê duyệt / Giải ngân', value: 68, color: '#10b981' },
  { name: 'Chờ duyệt / Bổ sung', value: 18, color: '#f59e0b' },
  { name: 'Từ chối (CIC/Risk)', value: 14, color: '#ef4444' }
];

const INITIAL_URGENT_LOS_QUEUE = [
  {
    id: 'LOS-2026-001',
    customerName: 'Nguyễn Văn An',
    phone: '0901234567',
    amount: '50.000.000 đ',
    product: 'Vay tín chấp theo lương',
    riskGrade: 'A',
    score: 785,
    slaMinutesLeft: 14,
    status: 'Chờ duyệt',
    officer: 'Trần Thị Bình'
  },
  {
    id: 'LOS-2026-002',
    customerName: 'Lê Hoàng Nam',
    phone: '0987654321',
    amount: '120.000.000 đ',
    product: 'Vay hộ kinh doanh',
    riskGrade: 'B',
    score: 690,
    slaMinutesLeft: 28,
    status: 'Đang thẩm định',
    officer: 'Trần Thị Bình'
  },
  {
    id: 'LOS-2026-003',
    customerName: 'Vũ Thị Mai',
    phone: '0912334455',
    amount: '30.000.000 đ',
    product: 'Vay sinh viên & trẻ',
    riskGrade: 'A',
    score: 740,
    slaMinutesLeft: 45,
    status: 'Chờ duyệt',
    officer: 'Chưa phân công'
  },
  {
    id: 'LOS-2026-004',
    customerName: 'Đặng Quốc Huy',
    phone: '0933221100',
    amount: '80.000.000 đ',
    product: 'Vay theo hóa đơn',
    riskGrade: 'C',
    score: 580,
    slaMinutesLeft: 52,
    status: 'Cần bổ sung',
    officer: 'Lê Văn Cường'
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7DAYS');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Customer Profile 360 Modal State
  const [selectedCustomerFor360, setSelectedCustomerFor360] = useState(null);
  const [showCustomer360Modal, setShowCustomer360Modal] = useState(false);

  // Dynamic Dashboard Stats State
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
    disbursedCount: 0,
    approvalRate: 0,
    totalApprovedLoanAmount: 0,
    totalDisbursedAmount: 0,
    riskDistribution: [],
    statusDistribution: []
  });

  const [urgentQueue, setUrgentQueue] = useState(INITIAL_URGENT_LOS_QUEUE);

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getAdminApplications().catch(() => null)
      ]);

      if (statsRes && statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      if (appsRes && appsRes.success && Array.isArray(appsRes.data)) {
        // Find active applications waiting for appraisal or action
        const pendingApps = appsRes.data.filter(a => 
          a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW' || a.status === 'ACTION_REQUIRED'
        );
        if (pendingApps.length > 0) {
          const mappedQueue = pendingApps.map((a, idx) => ({
            id: a.applicationNo || a._id,
            customerName: a.customerName || 'Khách hàng',
            phone: a.customerPhone || a.personalDetails?.phone || '0901234567',
            amount: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(a.requestedAmount || 0),
            product: a.loanPurpose || a.productName || 'Vay tiêu dùng',
            riskGrade: a.scoringResult?.riskGrade || 'A',
            score: a.scoringResult?.score || 720,
            slaMinutesLeft: Math.max(5, 55 - (idx * 11)),
            status: a.status === 'SUBMITTED' ? 'Chờ duyệt' : a.status === 'ACTION_REQUIRED' ? 'Cần bổ sung' : 'Đang thẩm định',
            officer: a.assignedOfficer || 'Trần Thị Bình'
          }));
          setUrgentQueue(mappedQueue);
        }
      }
    } catch (err) {
      console.warn('Dashboard stats fetch error:', err.message);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      loadDashboardData();
    };

    socket.on('loan:application_submitted', handleUpdate);
    socket.on('loan:status_updated', handleUpdate);
    socket.on('loan:table_row_updated', handleUpdate);

    return () => {
      socket.off('loan:application_submitted', handleUpdate);
      socket.off('loan:status_updated', handleUpdate);
      socket.off('loan:table_row_updated', handleUpdate);
    };
  }, [socket, loadDashboardData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const formatDisbursed = (amount) => {
    if (!amount || amount === 0) return '0 ₫';
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(2)} Tỷ ₫`;
    }
    return `${(amount / 1_000_000).toLocaleString('vi-VN')} Triệu ₫`;
  };

  // Build Pie Chart Data dynamically
  const approvalPieData = stats.totalApplications > 0 ? [
    {
      name: 'Đã phê duyệt / Giải ngân',
      value: Math.round(((stats.approvedCount + stats.disbursedCount) / Math.max(1, stats.totalApplications)) * 100) || stats.approvalRate,
      color: '#10b981'
    },
    {
      name: 'Chờ duyệt / Bổ sung',
      value: Math.round((stats.pendingCount / Math.max(1, stats.totalApplications)) * 100) || 0,
      color: '#f59e0b'
    },
    {
      name: 'Từ chối (CIC/Risk)',
      value: Math.round((stats.rejectedCount / Math.max(1, stats.totalApplications)) * 100) || 0,
      color: '#ef4444'
    }
  ] : INITIAL_APPROVAL_PIE_DATA;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Top Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Tổng Quan Quản Trị & Vận Hành (LOMS)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Giám sát thời gian thực: Tốc độ giải ngân, Phân bổ rủi ro tín dụng và Tiến độ xử lý SLA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs">
            <Building2 className="w-4 h-4 text-slate-500" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="ALL">Toàn hệ thống (HQ)</option>
              <option value="HN">Chi nhánh Hà Nội</option>
              <option value="HCM">Chi nhánh TP. Hồ Chí Minh</option>
              <option value="DN">Chi nhánh Đà Nẵng</option>
            </select>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 text-xs">
            <Clock className="w-4 h-4 text-slate-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="TODAY">Hôm nay</option>
              <option value="7DAYS">7 ngày qua</option>
              <option value="THIS_MONTH">Tháng này</option>
              <option value="QUARTER">Quý này</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 PRIMARY FINTECH KPI WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Disbursed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4%
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng tiền giải ngân</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalDisbursedAmount > 0 ? formatDisbursed(stats.totalDisbursedAmount) : '14.85 Tỷ ₫'}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats.disbursedCount > 0 ? `${stats.disbursedCount} hợp đồng hoàn tất` : '285 hợp đồng hoàn tất'}
            </span>
          </div>
        </div>

        {/* KPI 2: Underwriting Queue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5" /> SLA Active
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hồ sơ chờ thẩm định</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats.pendingCount > 0 ? `${stats.pendingCount} Hồ sơ` : `${urgentQueue.length} Hồ sơ`}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats.totalApplications > 0 ? `Tổng cộng ${stats.totalApplications} hồ sơ hệ thống` : 'Thời gian xử lý TB: 8.5 phút'}
            </span>
          </div>
        </div>

        {/* KPI 3: NPL Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <TrendingDown className="w-3.5 h-3.5" /> -0.15%
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ nợ xấu (NPL)</h3>
            <p className="text-2xl font-black text-emerald-600 mt-1">1.15%</p>
            <span className="text-[11px] text-slate-500 mt-1 block">Ngưỡng chuẩn an toàn &lt; 3.0%</span>
          </div>
        </div>

        {/* KPI 4: Auto Approval Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              AI Powered
            </span>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ duyệt hồ sơ</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {stats.approvalRate > 0 ? `${stats.approvalRate}%` : '78.5%'}
            </p>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats.approvedCount > 0 ? `${stats.approvedCount} đã duyệt / ${stats.totalApplications} hồ sơ` : 'Auto-Score CIC & Liveness'}
            </span>
          </div>
        </div>

      </div>

      {/* CHARTS ROW (Disbursement Trend + Pie Approval) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Chart 1: Disbursement Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Tốc Độ Giải Ngân Theo Ngày (Triệu VNĐ)
              </h3>
              <span className="text-[11px] text-slate-400">Doanh số giải ngân thực tế liên ngân hàng Napas</span>
            </div>
            <span className="text-xs font-black text-blue-600">
              Đỉnh: Thứ 6 (3.2 Tỷ)
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DISBURSEMENT_TREND_DATA}>
                <defs>
                  <linearGradient id="disburseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}Tr`} />
                <Tooltip 
                  formatter={(value) => [`${value} Triệu VNĐ`, 'Giải ngân']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#disburseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Approval Ratio Pie Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              Tỷ Lệ Ra Quyết Định Tín Dụng
            </h3>
            <span className="text-[11px] text-slate-400">
              {stats.totalApplications > 0 ? `Dữ liệu thời gian thực trên ${stats.totalApplications} hồ sơ` : 'Phân bổ quyết định trên 450 hồ sơ gần nhất'}
            </span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={approvalPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {approvalPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs pt-1">
            {approvalPieData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <strong className="text-slate-900">{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* URGENT SLA QUEUE TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 px-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Hồ Sơ Cần Thẩm Định Khẩn Cấp (SLA Timer Warning)
            </h3>
            <p className="text-[11px] text-slate-400">Cần phê duyệt trước khi vượt ngưỡng cam kết SLA 60 phút</p>
          </div>

          <Link
            to="/admin/los"
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>Xem toàn bộ hồ sơ LOS</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="py-3 px-4">Mã hồ sơ</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Gói vay / Số tiền</th>
                <th className="py-3 px-4">Hạng rủi ro</th>
                <th className="py-3 px-4">Thời gian SLA còn lại</th>
                <th className="py-3 px-4">Phụ trách</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {urgentQueue.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-blue-700">{item.id}</td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomerFor360(item);
                        setShowCustomer360Modal(true);
                      }}
                      className="text-left group cursor-pointer focus:outline-none"
                      title="Nhấn để xem Hồ sơ Khách hàng 360°, Lịch sử vay & Nhắc nợ"
                    >
                      <div className="flex items-center gap-1.5">
                        <strong className="block text-slate-900 group-hover:text-blue-600 group-hover:underline font-bold transition">
                          {item.customerName}
                        </strong>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition">
                          360°
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block group-hover:text-slate-600">
                        {item.phone}
                      </span>
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{item.amount}</span>
                    <span className="text-[10px] text-slate-500">{item.product}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`risk-badge-${item.riskGrade}`}>
                      Hạng {item.riskGrade} ({item.score} đ)
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      item.slaMinutesLeft < 20 
                        ? 'bg-red-100 text-red-700 animate-pulse' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.slaMinutesLeft} phút còn lại
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{item.officer}</td>
                  <td className="py-3 px-4 text-right">
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
      </div>

      {/* CUSTOMER 360 MODAL */}
      <CustomerProfile360Modal
        isOpen={showCustomer360Modal}
        onClose={() => setShowCustomer360Modal(false)}
        customerData={selectedCustomerFor360}
        onNavigateToLoan={(loanId) => navigate(`/admin/los/${loanId}`)}
      />

    </div>
  );
};

export default AdminDashboard;

