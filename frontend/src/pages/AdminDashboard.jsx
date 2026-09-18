import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ShieldCheck, CheckCircle2, XCircle, Clock, DollarSign, TrendingUp, SlidersHorizontal } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then(res => {
      if (res.success) setStats(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-20 text-slate-400">Đang tải báo cáo tổng quan...</div>;

  const COLORS = ['#10B981', '#F59E0B', '#F97316', '#EF4444'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Portal Quản Trị & Thẩm Định Tín Dụng</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Báo Cáo Thống Kê Tổng Quan (UC4.4)</h1>
        </div>

        <div className="flex gap-3">
          <Link to="/admin/applications" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-600/30 transition flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Danh Sách Thẩm Định
          </Link>
          <Link to="/admin/rules" className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold text-sm transition flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" /> Cấu Hình Quy Tắc
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tổng số hồ sơ</span>
            <span className="text-2xl font-black text-white">{stats?.totalApplications || 0}</span>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tỷ lệ duyệt hồ sơ</span>
            <span className="text-2xl font-black text-emerald-400">{stats?.approvalRate || 0}%</span>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Hồ sơ chờ xử lý</span>
            <span className="text-2xl font-black text-amber-400">{stats?.pendingCount || 0}</span>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block font-medium">Tổng dư nợ đã duyệt</span>
            <span className="text-lg font-black text-purple-300">
              {((stats?.totalApprovedLoanAmount || 0) / 1000000).toLocaleString('vi-VN')} Tr VNĐ
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts with Recharts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Risk Distribution Pie Chart */}
        <div className="bg-slate-800/60 rounded-3xl border border-slate-700 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Phân Bổ Cấp Độ Rủi Ro Tín Dụng toàn hệ thống (Risk Grade A-D)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.riskDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.riskDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown Bar Chart */}
        <div className="bg-slate-800/60 rounded-3xl border border-slate-700 p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Thống Kê Số Lượng Hồ Sơ Theo Trạng Thái
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.statusDistribution || []}>
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
