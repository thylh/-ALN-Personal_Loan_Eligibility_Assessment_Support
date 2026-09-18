import React from 'react';

export default function CreditScoreGauge({ score = 650, riskGrade = 'B', riskLevel = 'Rủi ro Trung Bình' }) {
  const minScore = 300;
  const maxScore = 850;
  const percentage = Math.min(100, Math.max(0, ((score - minScore) / (maxScore - minScore)) * 100));

  const getColorConfig = (grade) => {
    switch (grade) {
      case 'A':
        return { color: '#10B981', label: 'Hạng A - Low Risk', bg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
      case 'B':
        return { color: '#F59E0B', label: 'Hạng B - Moderate Risk', bg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
      case 'C':
        return { color: '#F97316', label: 'Hạng C - High Risk', bg: 'bg-orange-500/10 text-orange-400 border border-orange-500/20' };
      case 'D':
      default:
        return { color: '#EF4444', label: 'Hạng D - Critical Risk', bg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20' };
    }
  };

  const config = getColorConfig(riskGrade);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#151d2a] rounded-2xl border border-[#232e42]">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Điểm Uy Tín Tín Dụng (Credit Score)
      </div>

      {/* Circle Meter */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#232e42"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={config.color}
            strokeWidth="8"
            strokeDasharray={251}
            strokeDashoffset={251 - (251 * percentage) / 100}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-[11px] text-slate-400 font-medium">/ 850 điểm</span>
        </div>
      </div>

      {/* Risk Badge */}
      <div className={`mt-4 px-3.5 py-1 rounded-md text-xs font-bold ${config.bg}`}>
        {riskLevel || config.label}
      </div>
    </div>
  );
}
