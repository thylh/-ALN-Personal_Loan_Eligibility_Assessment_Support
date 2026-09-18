import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Calculator, ArrowRight, DollarSign, Calendar, Percent, CheckCircle2 } from 'lucide-react';

export default function LoanSimulator() {
  const [amount, setAmount] = useState(150000000);
  const [termMonths, setTermMonths] = useState(24);
  const [interestRate, setInterestRate] = useState(9.8);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.simulateLoan(amount, termMonths, interestRate).then(res => {
      if (res.success) setResult(res.data);
    });
  }, [amount, termMonths, interestRate]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
          <Calculator className="w-3.5 h-3.5" /> Công Cụ Tính Dòng Tiền & Khoản Vay (UC2.3)
        </div>
        <h1 className="text-3xl font-extrabold text-white">Mô Phỏng Dòng Tiền Trả Nợ Khoản Vay</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Điều chỉnh số tiền vay và kỳ hạn bằng thanh trượt tùy chỉnh để tính toán khoản trả gốc lãi hàng tháng chuẩn xác.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sliders Form */}
        <div className="md:col-span-6 bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-6">
          
          {/* Amount Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Số Tiền Vay Mong Muốn
              </label>
              <span className="text-lg font-black text-emerald-400">
                {amount.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
            <input
              type="range"
              min={10000000}
              max={500000000}
              step={5000000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-medium">
              <span>10,000,000 VNĐ</span>
              <span>250,000,000 VNĐ</span>
              <span>500,000,000 VNĐ</span>
            </div>
          </div>

          {/* Term Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" /> Kỳ Hạn Vay (Tháng)
              </label>
              <span className="text-lg font-black text-blue-400">
                {termMonths} Tháng ({Math.round((termMonths / 12) * 10) / 10} năm)
              </span>
            </div>
            <input
              type="range"
              min={6}
              max={60}
              step={6}
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-medium">
              <span>6 tháng</span>
              <span>36 tháng</span>
              <span>60 tháng</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-400" /> Lãi Suất Ước Tính (%/năm)
              </label>
              <span className="text-lg font-black text-amber-400">
                {interestRate}% / năm
              </span>
            </div>
            <input
              type="range"
              min={5.0}
              max={20.0}
              step={0.5}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-medium">
              <span>5.0% (Ưu đãi Hạng A)</span>
              <span>12.0% (Hạng C)</span>
              <span>20.0% (Tối đa)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-700/80">
            <Link
              to="/apply"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              Tiến Hành Nộp Hồ Sơ Vay Với Thông Số Này <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Calculation Summary Card */}
        <div className="md:col-span-6 space-y-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Kết Quả Tính Toán Dòng Tiền Trả Nợ
            </h3>

            <div className="bg-slate-900/80 p-5 rounded-2xl border border-blue-500/30 text-center">
              <span className="text-xs text-slate-400 block font-medium">Số tiền trả hàng tháng (Gốc + Lãi):</span>
              <span className="text-3xl font-black text-blue-400 tracking-tight mt-1 block">
                {(result?.monthlyPayment || 0).toLocaleString('vi-VN')} VNĐ / tháng
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block">Tổng số tiền lãi:</span>
                <span className="text-base font-bold text-amber-400 mt-1 block">
                  {(result?.totalInterest || 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block">Tổng tiền phải trả:</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">
                  {(result?.totalPayment || 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Phương thức trả nợ: Dư nợ giảm dần theo niên kim cố định hàng tháng.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Lãi suất chính thức sẽ được phê duyệt sau khi đối soát chứng từ.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Amortization Schedule Table Sample */}
      {result?.sampleSchedule && (
        <div className="bg-slate-800/60 rounded-3xl border border-slate-700/80 p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">
            Lịch Trả Nợ Mẫu (6 Kỳ Đầu Tiên)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 uppercase font-semibold">
                  <th className="py-2.5 px-3">Kỳ thứ</th>
                  <th className="py-2.5 px-3">Số tiền trả hàng tháng</th>
                  <th className="py-2.5 px-3">Tiền Gốc</th>
                  <th className="py-2.5 px-3">Tiền Lãi</th>
                  <th className="py-2.5 px-3">Dư Nợ Còn Lại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-slate-300">
                {result.sampleSchedule.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-700/30">
                    <td className="py-3 px-3 font-bold text-blue-400">Kỳ {row.month}</td>
                    <td className="py-3 px-3 font-semibold text-white">{(row.monthlyPayment).toLocaleString('vi-VN')} VNĐ</td>
                    <td className="py-3 px-3 text-emerald-400">{(row.principalPart).toLocaleString('vi-VN')} VNĐ</td>
                    <td className="py-3 px-3 text-amber-400">{(row.interestPart).toLocaleString('vi-VN')} VNĐ</td>
                    <td className="py-3 px-3 font-mono">{(row.remainingPrincipal).toLocaleString('vi-VN')} VNĐ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
