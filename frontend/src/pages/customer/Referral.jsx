import React, { useState } from 'react';
import { 
  Users, Gift, Copy, Share2, Check, 
  Sparkles, Award, ArrowRight, QrCode, 
  DollarSign, CheckCircle2, Clock
} from 'lucide-react';

const REFERRED_FRIENDS = [
  {
    name: 'Trần V** B***',
    phone: '0912***456',
    date: '20/09/2026',
    loanAmount: '30.000.000 đ',
    status: 'DISBURSED',
    reward: 200000
  },
  {
    name: 'Lê T** H***',
    phone: '0988***789',
    date: '12/09/2026',
    loanAmount: '50.000.000 đ',
    status: 'DISBURSED',
    reward: 200000
  },
  {
    name: 'Phạm V** D***',
    phone: '0903***112',
    date: '05/09/2026',
    loanAmount: '20.000.000 đ',
    status: 'DISBURSED',
    reward: 200000
  },
  {
    name: 'Hoàng M** K***',
    phone: '0977***665',
    date: '28/08/2026',
    loanAmount: '40.000.000 đ',
    status: 'DISBURSED',
    reward: 200000
  },
  {
    name: 'Vũ T** M***',
    phone: '0934***888',
    date: 'Hôm qua',
    loanAmount: '50.000.000 đ',
    status: 'PENDING',
    reward: 200000
  }
];

const Referral = () => {
  const refCode = 'LOMS-AN99';
  const refUrl = 'https://loms.vn/r/LOMS-AN99';

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(refUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500 space-y-8">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15 backdrop-blur-sm">
            <Gift className="w-3.5 h-3.5" /> Chương Trình Giới Thiệu Bạn Bè LOMS
          </div>
          <h1 className="text-2xl sm:text-4xl font-black leading-tight">
            Giới Thiệu Liền Tay <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
              Nhận Ngay 200.000 đ / Hồ Sơ
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Mời bạn bè và người thân trải nghiệm vay vốn siêu tốc. Khi hồ sơ của người được giới thiệu giải ngân thành công, bạn nhận ngay 200.000 đ tiền mặt chuyển khoản.
          </p>
        </div>
      </div>

      {/* Referral Code & Link Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 grid md:grid-cols-2 gap-8 items-center">
        
        {/* Left: Code & Actions */}
        <div className="space-y-5">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
              Mã giới thiệu độc quyền của bạn:
            </span>
            <div className="flex items-center gap-2">
              <div className="px-5 py-3 rounded-2xl bg-slate-50 border-2 border-dashed border-blue-400 font-mono font-black text-xl text-blue-700 tracking-wider">
                {refCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="btn-primary py-3.5 px-5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Đã sao chép' : 'Sao chép mã'}
              </button>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">
              Đường link giới thiệu trực tiếp:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={refUrl}
                className="input-human flex-1 font-mono text-xs text-slate-600 bg-slate-50"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
              >
                {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedUrl ? 'Đã chép' : 'Chép link'}</span>
              </button>
            </div>
          </div>

          {/* Social share buttons */}
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Chia sẻ nhanh qua mạng xã hội:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition"
              >
                Zalo
              </button>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs transition"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs transition"
              >
                Tin nhắn SMS
              </button>
            </div>
          </div>
        </div>

        {/* Right: QR Code Visual Card */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-44 h-44 bg-white p-3 rounded-2xl border border-slate-200 mx-auto shadow-sm flex flex-col items-center justify-center">
            <QrCode className="w-32 h-32 text-slate-900" />
            <span className="text-[10px] font-mono text-slate-400 mt-1">Quét mã để đăng ký</span>
          </div>
          <h4 className="text-xs font-bold text-slate-800">Mã QR Giới Thiệu Cá Nhân</h4>
          <p className="text-[11px] text-slate-500">
            Bạn bè chỉ cần dùng camera quét mã QR để mở trang đăng ký tự động gắn mã giới thiệu của bạn.
          </p>
        </div>

      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Bạn bè đã giới thiệu</span>
          <span className="text-2xl font-black text-slate-900 block">5 người</span>
          <span className="text-[10px] text-emerald-600 font-semibold">4 hồ sơ đã giải ngân thành công</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Hoa hồng đã nhận</span>
          <span className="text-2xl font-black text-emerald-600 block">800.000 đ</span>
          <span className="text-[10px] text-slate-500">Đã chuyển vào tài khoản Vietcombank</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Thưởng chờ đối soát</span>
          <span className="text-2xl font-black text-amber-600 block">200.000 đ</span>
          <span className="text-[10px] text-slate-500">1 hồ sơ đang thẩm định</span>
        </div>
      </div>

      {/* How it works 3 steps */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          3 Bước Đơn Giản Nhận Thưởng Giới Thiệu
        </h3>

        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">1</span>
            <h4 className="font-bold text-slate-900">Chia sẻ mã giới thiệu</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Gửi mã giới thiệu hoặc link cá nhân cho bạn bè, người thân có nhu cầu vay tiêu dùng.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">2</span>
            <h4 className="font-bold text-slate-900">Bạn bè hoàn tất giải ngân</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Người được giới thiệu hoàn tất eKYC và nhận giải ngân hợp đồng vay đầu tiên thành công.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">3</span>
            <h4 className="font-bold text-slate-900">Cả hai cùng có thưởng</h4>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Bạn nhận ngay 200.000 đ tiền mặt; Bạn bè của bạn được giảm 0.2% lãi suất tháng đầu tiên.
            </p>
          </div>
        </div>
      </div>

      {/* Referred Friends Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-5 px-6 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-700 uppercase tracking-wide">
          <span>Lịch sử bạn bè đã đăng ký ({REFERRED_FRIENDS.length})</span>
          <span>Tiền thưởng</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {REFERRED_FRIENDS.map((item, idx) => (
            <div key={idx} className="p-4 px-6 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <strong className="text-slate-900 font-bold">{item.name}</strong>
                  <span className="text-[10px] text-slate-400 font-mono">({item.phone})</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Ngày đăng ký: {item.date} • Gói vay: {item.loanAmount}
                </div>
              </div>

              <div className="text-right">
                <span className="font-black text-emerald-600 text-sm block">
                  +{formatCurrency(item.reward)}
                </span>
                {item.status === 'DISBURSED' ? (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    Đã giải ngân ✓
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">
                    Đang thẩm định
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Referral;
