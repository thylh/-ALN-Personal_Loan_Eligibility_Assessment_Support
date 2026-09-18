import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CreditScoreGauge from '../components/CreditScoreGauge';
import RadarChartScore from '../components/RadarChartScore';
import { FilePlus, Shield, AlertCircle, Clock, ChevronRight, Calculator, CheckCircle, FileText } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyApplications().then((res) => {
      if (res.success) {
        setApplications(res.data || []);
      }
      setLoading(false);
    });
  }, []);

  const latestApp = applications[0];
  const scoreData = latestApp?.scoringResult || {
    score: 750,
    riskGrade: 'A',
    riskLevel: 'Rủi ro Thấp (Low Risk)',
    factorScores: { incomeScore: 85, dtiScore: 90, workTenureScore: 80, creditHistoryScore: 80, ageScore: 85 }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> Đã phê duyệt</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Từ chối</span>;
      case 'ACTION_REQUIRED':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> Cần bổ sung</span>;
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> Đang xử lý</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-[#151d2a] border border-[#232e42] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Trang quản lý cá nhân</span>
          <h1 className="text-2xl font-bold text-white mt-1">
            Xin chào, {user?.fullName || 'Khách hàng'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Theo dõi tiến độ duyệt khoản vay và báo cáo điểm uy tín tín dụng cá nhân.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/simulator"
            className="px-3.5 py-2 bg-[#0b0f19] hover:bg-[#1f293d] text-slate-200 border border-[#232e42] rounded-xl font-semibold text-xs transition flex items-center gap-1.5"
          >
            <Calculator className="w-4 h-4 text-blue-400" /> Mô phỏng khoản vay
          </Link>
          <Link
            to="/apply"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
          >
            <FilePlus className="w-4 h-4" /> Nộp hồ sơ mới
          </Link>
        </div>
      </div>

      {/* Financial Health Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <CreditScoreGauge
            score={scoreData.score}
            riskGrade={scoreData.riskGrade}
            riskLevel={scoreData.riskLevel}
          />
        </div>

        <div className="md:col-span-1">
          <RadarChartScore factorScores={scoreData.factorScores} />
        </div>

        <div className="md:col-span-1 bg-[#151d2a] rounded-2xl border border-[#232e42] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Hạn mức tối đa đề xuất
            </h3>
            <div className="bg-[#0b0f19] p-4 rounded-xl border border-[#232e42] mb-4">
              <span className="text-xs text-slate-400 block">Số tiền vay an toàn tối đa:</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                {(scoreData.maxRecommendedLimit || 250000000).toLocaleString('vi-VN')} VNĐ
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Đánh giá hệ thống:</span>
              {(scoreData.suggestions || [
                'Tỷ lệ DTI nằm trong khoảng an toàn.',
                'Lịch sử trả nợ tốt giúp tăng hạn mức.'
              ]).map((sug, idx) => (
                <div key={idx} className="text-xs text-slate-300 bg-[#0b0f19] p-2.5 rounded-lg border border-[#232e42] flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-[#151d2a] rounded-2xl border border-[#232e42] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-white">Danh sách hồ sơ đã nộp</h2>
            <p className="text-xs text-slate-400">Tra cứu trạng thái xử lý khoản vay theo thời gian thực</p>
          </div>

          <Link to="/apply" className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
            Nộp hồ sơ <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 text-xs">Đang tải danh sách hồ sơ...</div>
        ) : applications.length === 0 ? (
          <div className="text-center py-10 bg-[#0b0f19] rounded-xl border border-[#232e42]">
            <p className="text-slate-400 text-xs mb-3">Bạn chưa nộp hồ sơ đăng ký vay nào.</p>
            <Link to="/apply" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-xs">
              Tạo hồ sơ vay mới
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#232e42] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Mã hồ sơ</th>
                  <th className="py-3 px-4">Số tiền vay</th>
                  <th className="py-3 px-4">Kỳ hạn</th>
                  <th className="py-3 px-4">Điểm tín dụng</th>
                  <th className="py-3 px-4">Phân hạng rủi ro</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232e42] text-xs">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-[#1f293d]/50 transition">
                    <td className="py-3.5 px-4 font-semibold text-blue-400">{app.applicationNo}</td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {(app.requestedAmount || 0).toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{app.requestedTermMonths} tháng</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-amber-400">{app.scoringResult?.score || 'N/A'}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-xs font-bold rounded risk-badge-${app.scoringResult?.riskGrade || 'B'}`}>
                        Hạng {app.scoringResult?.riskGrade || 'B'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/application/${app._id}`}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-[#0b0f19] hover:bg-[#1f293d] border border-[#232e42] rounded-lg transition inline-flex items-center gap-1"
                      >
                        Xem <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
