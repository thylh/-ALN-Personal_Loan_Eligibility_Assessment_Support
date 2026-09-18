import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AdminAppraisalModal from './AdminAppraisalModal';
import { Search, Filter, ShieldCheck, ChevronRight, RefreshCw, CheckCircle, AlertCircle, FileText, Clock } from 'lucide-react';

export default function AdminApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [riskFilter, statusFilter, searchQuery]);

  const fetchApplications = async () => {
    setLoading(true);
    const res = await api.getAdminApplications(riskFilter, statusFilter, searchQuery);
    if (res.success) {
      setApplications(res.data || []);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Đã Duyệt</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Từ Chối</span>;
      case 'ACTION_REQUIRED':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse"><FileText className="w-3.5 h-3.5"/> Yêu Cầu Bổ Sung</span>;
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
      default:
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Chờ Thẩm Định</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Quản Lý & Thẩm Định Danh Sách Hồ Sơ Vay (UC4.1)</h1>
          <p className="text-xs text-slate-400">
            Tra cứu, lọc hồ sơ theo Cấp Độ Rủi Ro (Grade A/B/C/D) hoặc Trạng Thái Thẩm Định.
          </p>
        </div>

        <button onClick={fetchApplications} className="self-start md:self-auto px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Làm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã Hồ Sơ, Tên Khách Vay, CCCD..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Risk Grade Filter */}
        <div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="ALL">Tất cả Cấp Độ Rủi Ro (A, B, C, D)</option>
            <option value="A">Hạng A - Low Risk (Green)</option>
            <option value="B">Hạng B - Moderate Risk (Yellow)</option>
            <option value="C">Hạng C - High Risk (Orange)</option>
            <option value="D">Hạng D - Critical Risk (Red)</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
          >
            <option value="ALL">Tất cả Trạng Thái</option>
            <option value="SUBMITTED">Mới Nộp (SUBMITTED)</option>
            <option value="UNDER_REVIEW">Đang Thẩm Định (UNDER_REVIEW)</option>
            <option value="ACTION_REQUIRED">Chờ Bổ Sung Chứng Từ (ACTION_REQUIRED)</option>
            <option value="APPROVED">Đã Phê Duyệt (APPROVED)</option>
            <option value="REJECTED">Đã Từ Chối (REJECTED)</option>
          </select>
        </div>

      </div>

      {/* Applications Data Table */}
      <div className="bg-slate-800/60 rounded-3xl border border-slate-700/80 p-6 shadow-xl">
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm">Đang tải danh sách hồ sơ...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">Không tìm thấy hồ sơ phù hợp bộ lọc.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Hồ Sơ</th>
                  <th className="py-3 px-4">Tên Khách Vay</th>
                  <th className="py-3 px-4">Số Tiền Vay</th>
                  <th className="py-3 px-4">DTI Ratio</th>
                  <th className="py-3 px-4">Điểm Tín Dụng</th>
                  <th className="py-3 px-4">Hạng Rủi Ro</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-700/30 transition">
                    <td className="py-4 px-4 font-bold text-blue-400">{app.applicationNo}</td>
                    <td className="py-4 px-4 font-semibold text-slate-200">{app.customerName}</td>
                    <td className="py-4 px-4 font-semibold text-white">
                      {(app.requestedAmount || 0).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="py-4 px-4 font-mono text-amber-400">
                      {app.scoringResult?.dtiRatioPercent || '0'}%
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-amber-400">{app.scoringResult?.score || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg risk-badge-${app.scoringResult?.riskGrade || 'B'}`}>
                        Hạng {app.scoringResult?.riskGrade || 'B'}
                      </span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow transition inline-flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Thẩm Định (UC4.2)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appraisal Modal */}
      {selectedApp && (
        <AdminAppraisalModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          onRefresh={() => {
            setSelectedApp(null);
            fetchApplications();
          }}
        />
      )}

    </div>
  );
}
