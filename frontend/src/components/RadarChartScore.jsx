import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export default function RadarChartScore({ factorScores = {} }) {
  const data = [
    { factor: 'Thu nhập', score: factorScores.incomeScore || 70, fullMark: 100 },
    { factor: 'Tỷ lệ DTI', score: factorScores.dtiScore || 80, fullMark: 100 },
    { factor: 'Thâm niên', score: factorScores.workTenureScore || 75, fullMark: 100 },
    { factor: 'Lịch sử nợ', score: factorScores.creditHistoryScore || 85, fullMark: 100 },
    { factor: 'Độ tuổi', score: factorScores.ageScore || 90, fullMark: 100 }
  ];

  return (
    <div className="w-full h-64 bg-[#151d2a] rounded-2xl border border-[#232e42] p-4 flex flex-col items-center">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
        Biểu đồ phân tích rủi ro 5 yếu tố
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
          <PolarGrid stroke="#232e42" />
          <PolarAngleAxis dataKey="factor" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
          <Radar name="Điểm yếu tố" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.35} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
