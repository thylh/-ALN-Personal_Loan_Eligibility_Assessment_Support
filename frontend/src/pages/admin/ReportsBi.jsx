import React, { useState } from 'react';
import { 
  BarChart3, Download, Calendar, Filter, 
  TrendingUp, Activity, Users, Clock, FileSpreadsheet, 
  FileText, CheckCircle2, ChevronRight
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const VINTAGE_DATA = [
  { mob: 'MOB 1', cohortJan: 0.1, cohortFeb: 0.1, cohortMar: 0.2, cohortApr: 0.1 },
  { mob: 'MOB 2', cohortJan: 0.3, cohortFeb: 0.4, cohortMar: 0.3, cohortApr: 0.2 },
  { mob: 'MOB 3', cohortJan: 0.6, cohortFeb: 0.7, cohortMar: 0.5, cohortApr: 0.4 },
  { mob: 'MOB 4', cohortJan: 0.9, cohortFeb: 0.9, cohortMar: 0.8, cohortApr: null },
  { mob: 'MOB 5', cohortJan: 1.1, cohortFeb: 1.2, cohortMar: null, cohortApr: null },
  { mob: 'MOB 6', cohortJan: 1.2, cohortFeb: null, cohortMar: null, cohortApr: null },
];

const ROLL_RATE_DATA = [
  { stage: 'Current -> Bucket 1 (1-15d)', rate: 2.4, benchmark: 3.5 },
  { stage: 'Bucket 1 -> Bucket 2 (16-30d)', rate: 1.2, benchmark: 2.0 },
  { stage: 'Bucket 2 -> Bucket 3 (>30d)', rate: 0.6, benchmark: 1.0 },
  { stage: 'Bucket 3 -> Write-off (Xử lý rủi ro)', rate: 0.2, benchmark: 0.5 },
];

const UNDERWRITER_TAT_DATA = [
  { name: 'Trần Thị Bình', count: 142, avgTatMinutes: 7.8, approvalRate: 74 },
  { name: 'Lê Văn Cường', count: 110, avgTatMinutes: 8.5, approvalRate: 68 },
  { name: 'Nguyễn Văn Minh', count: 95, avgTatMinutes: 9.2, approvalRate: 70 },
  { name: 'Hoàng Lan Phương', count: 88, avgTatMinutes: 8.1, approvalRate: 72 }
];

const ReportsBi = () => {
  // Report Types: 'vintage', 'roll_rate', 'tat'
  const [reportType, setReportType] = useState('vintage');
  const [timeRange, setTimeRange] = useState('2026_Q3');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Báo Cáo Chuyên Sâu & Phân Tích Dữ Liệu (BI Reports)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân tích Vintage nợ quá hạn, tỷ lệ trượt nhóm nợ Roll-Rate và hiệu suất SLA thẩm định viên.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Xuất Excel (.xlsx)
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" /> Xuất PDF
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <button
          type="button"
          onClick={() => setReportType('vintage')}
          className={`px-5 py-2.5 rounded-2xl transition ${reportType === 'vintage' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
        >
          Báo cáo Vintage Analysis (Chất lượng nợ theo tháng giải ngân)
        </button>

        <button
          type="button"
          onClick={() => setReportType('roll_rate')}
          className={`px-5 py-2.5 rounded-2xl transition ${reportType === 'roll_rate' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
        >
          Báo cáo Roll-Rate (Trượt nhóm nợ)
        </button>

        <button
          type="button"
          onClick={() => setReportType('tat')}
          className={`px-5 py-2.5 rounded-2xl transition ${reportType === 'tat' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
        >
          Báo cáo Hiệu suất Thẩm định viên (TAT & Approval)
        </button>
      </div>

      {/* REPORT VIEW 1: VINTAGE ANALYSIS */}
      {reportType === 'vintage' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Đường Cong Nợ Xấu Lũy Kế Theo Tháng Giải Ngân (Vintage Curve MOB 1 - MOB 6)
              </h3>
              <p className="text-[11px] text-slate-400">Tỷ lệ NPL 30+ (%) theo từng chu kỳ tháng sau giải ngân</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Kiểm soát rủi ro tốt &lt; 1.5%
            </span>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={VINTAGE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mob" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ nợ xấu']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" name="Cohort T01/2026" dataKey="cohortJan" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" name="Cohort T02/2026" dataKey="cohortFeb" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" name="Cohort T03/2026" dataKey="cohortMar" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" name="Cohort T04/2026" dataKey="cohortApr" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <strong>Nhận định chuyên sâu của hệ thống:</strong>
            <p className="text-[11px]">
              Chất lượng danh mục tín dụng từ tháng 1 đến tháng 4/2026 duy trì ổn định cao. Tỷ lệ trôi nợ xấu sau 6 tháng (MOB 6) chỉ dừng ở mức 1.2%, thấp hơn nhiều so với khẩu vị rủi ro mục tiêu 2.5%.
            </p>
          </div>
        </div>
      )}

      {/* REPORT VIEW 2: ROLL RATE ANALYSIS */}
      {reportType === 'roll_rate' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Tỷ Lệ Chuyển Dịch Nhóm Nợ (Roll-Rate Matrix) vs Ngưỡng Benchmark Ngân Hàng
            </h3>
            <p className="text-[11px] text-slate-400">So sánh tỷ lệ trượt nợ thực tế so với giới hạn an toàn quy định</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ROLL_RATE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Tỷ lệ']} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar name="Thực tế LOMS (%)" dataKey="rate" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar name="Ngưỡng an toàn Benchmark (%)" dataKey="benchmark" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* REPORT VIEW 3: UNDERWRITER PERFORMANCE (TAT) */}
      {reportType === 'tat' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-4">
          <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Bảng Đánh Giá Hiệu Suất Thẩm Định Viên (SLA & Tỷ Lệ Duyệt)
            </span>
            <span className="text-[11px] font-bold text-blue-600">SLA cam kết: ≤ 15 phút / hồ sơ</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Tên thẩm định viên</th>
                  <th className="py-3.5 px-4">Số hồ sơ đã xử lý</th>
                  <th className="py-3.5 px-4">Thời gian xử lý TB (TAT)</th>
                  <th className="py-3.5 px-4">Tỷ lệ phê duyệt</th>
                  <th className="py-3.5 px-4 text-right">Đánh giá SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {UNDERWRITER_TAT_DATA.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600">{u.count} hồ sơ</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{u.avgTatMinutes} phút</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">{u.approvalRate}%</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Đạt chuẩn SLA 100% ✓
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReportsBi;
