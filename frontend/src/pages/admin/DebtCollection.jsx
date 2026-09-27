import React, { useState } from 'react';
import { 
  PhoneCall, PhoneOff, PhoneForwarded, Clock, 
  Calendar, User, AlertTriangle, CheckCircle2, 
  Send, History, ShieldAlert, DollarSign, ChevronRight
} from 'lucide-react';

const DEBT_BUCKETS_DATA = [
  {
    bucketId: 'BUCKET_1',
    name: 'Bucket 1 (Quá hạn 1 - 15 ngày)',
    badge: 'Nhắc nợ sớm',
    color: 'amber',
    loans: [
      {
        contractId: 'HD-2026-LOMS-8840',
        customerName: 'Hoàng Minh Tuấn',
        phone: '0912445566',
        overdueAmount: 5125000,
        dpd: 9,
        lastCallStatus: 'Khách hẹn trả (PTP)',
        lastCallDate: '26/09/2026',
        references: [
          { name: 'Hoàng Văn Long', relation: 'Bố ruột', phone: '0913998877' },
          { name: 'Đoàn Thị Thảo', relation: 'Đồng nghiệp', phone: '0988665544' }
        ],
        callHistory: [
          { time: '26/09/2026 14:10', officer: 'Lê Văn Cường', result: 'PTP (Khách hẹn trả)', note: 'Khách hứa chuyển tiền trước 17:00 ngày 28/09 sau khi nhận lương.' },
          { time: '24/09/2026 09:30', officer: 'Lê Văn Cường', result: 'Không nghe máy', note: 'Chuông đổ 3 hồi không bắt máy.' }
        ]
      },
      {
        contractId: 'HD-2026-LOMS-8902',
        customerName: 'Nguyễn Thị Bích',
        phone: '0903889922',
        overdueAmount: 4350000,
        dpd: 5,
        lastCallStatus: 'Thuê bao không liên lạc được',
        lastCallDate: '27/09/2026',
        references: [
          { name: 'Nguyễn Văn Toàn', relation: 'Chồng', phone: '0908776655' }
        ],
        callHistory: [
          { time: '27/09/2026 10:15', officer: 'Trần Thị Bình', result: 'Thuê bao', note: 'Số máy tạm thời không liên lạc được. Cần gọi người tham chiếu.' }
        ]
      }
    ]
  },
  {
    bucketId: 'BUCKET_2',
    name: 'Bucket 2 (Quá hạn 16 - 30 ngày)',
    badge: 'Nhắc nợ cấp 2',
    color: 'orange',
    loans: [
      {
        contractId: 'HD-2026-LOMS-8712',
        customerName: 'Đỗ Thị Hương',
        phone: '0988771122',
        overdueAmount: 8200000,
        dpd: 22,
        lastCallStatus: 'Khách hẹn gọi lại',
        lastCallDate: '25/09/2026',
        references: [
          { name: 'Đỗ Văn Hưng', relation: 'Anh trai', phone: '0912112233' }
        ],
        callHistory: [
          { time: '25/09/2026 15:40', officer: 'Lê Văn Cường', result: 'Khách hẹn gọi lại', note: 'Đang bận họp, hẹn chiều tối gọi lại.' }
        ]
      }
    ]
  },
  {
    bucketId: 'BUCKET_3',
    name: 'Bucket 3 (Quá hạn > 30 ngày)',
    badge: 'Nợ xấu nặng (Xử lý pháp lý)',
    color: 'red',
    loans: [
      {
        contractId: 'HD-2026-LOMS-8650',
        customerName: 'Trần Văn Cường',
        phone: '0933112233',
        overdueAmount: 16350000,
        dpd: 38,
        lastCallStatus: 'Tranh chấp nợ',
        lastCallDate: '24/09/2026',
        references: [
          { name: 'Trần Văn Tiến', relation: 'Bố', phone: '0912889900' }
        ],
        callHistory: [
          { time: '24/09/2026 11:00', officer: 'Lê Văn Cường', result: 'Tranh chấp', note: 'Khách nói gặp khó khăn kinh doanh, đã gửi thông báo khởi kiện và chuyển hồ sơ hiện trường.' }
        ]
      }
    ]
  }
];

const DebtCollection = () => {
  const [selectedBucket, setSelectedBucket] = useState('BUCKET_1');
  const activeBucketObj = DEBT_BUCKETS_DATA.find(b => b.bucketId === selectedBucket);
  
  // Selected Customer for Call Log
  const [selectedLoan, setSelectedLoan] = useState(activeBucketObj.loans[0] || null);

  // Call Log Form
  const [callResult, setCallResult] = useState('PTP');
  const [ptpDate, setPtpDate] = useState('2026-09-30');
  const [ptpAmount, setPtpAmount] = useState(selectedLoan?.overdueAmount || 0);
  const [callNote, setCallNote] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  const handleSaveCallLog = (e) => {
    e.preventDefault();
    if (!selectedLoan) return;

    const newEntry = {
      time: 'Vừa xong',
      officer: 'Trần Thị Bình',
      result: callResult === 'PTP' ? `PTP (Hẹn trả ${ptpDate})` : callResult,
      note: callNote || 'Không có ghi chú thêm.'
    };

    selectedLoan.callHistory.unshift(newEntry);
    selectedLoan.lastCallStatus = newEntry.result;
    setSaveSuccess(true);
    setCallNote('');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Quản Lý Nợ Xấu & Nhắc Nợ (Collection Workspace)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Phân lớp nợ theo Bucket DPD, quản lý cuộc gọi Telesale nhắc nợ và ghi nhận cam kết thanh toán (PTP).
          </p>
        </div>

        {/* Bucket Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
          {DEBT_BUCKETS_DATA.map(bucket => (
            <button
              key={bucket.bucketId}
              type="button"
              onClick={() => {
                setSelectedBucket(bucket.bucketId);
                setSelectedLoan(bucket.loans[0] || null);
              }}
              className={`px-4 py-2 rounded-xl transition whitespace-nowrap ${
                selectedBucket === bucket.bucketId 
                  ? 'bg-white text-blue-600 shadow-sm font-black' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {bucket.name} ({bucket.loans.length})
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Left List (5 cols) + Right Call Log Panel (7 cols) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Overdue Debtors in Bucket (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100">
          <div className="p-4 px-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-600">
            <span>Danh sách hồ sơ {activeBucketObj.name}</span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
              {activeBucketObj.badge}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {activeBucketObj.loans.map((loan) => {
              const isSelected = selectedLoan?.contractId === loan.contractId;
              return (
                <div
                  key={loan.contractId}
                  onClick={() => {
                    setSelectedLoan(loan);
                    setPtpAmount(loan.overdueAmount);
                  }}
                  className={`p-5 transition cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-slate-900">{loan.customerName}</strong>
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-bold text-[10px]">
                        Trễ {loan.dpd} ngày
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                      {loan.contractId} • {loan.phone}
                    </div>

                    <div className="text-[11px] text-slate-600">
                      Gần nhất: <strong className="text-blue-700">{loan.lastCallStatus}</strong>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Nợ quá hạn</span>
                    <span className="text-sm font-black text-red-600 block">
                      {formatCurrency(loan.overdueAmount)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto mt-1" />
                  </div>
                </div>
              );
            })}

            {activeBucketObj.loans.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                Không có hồ sơ nào trong Bucket này.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Telesale Call Log & Reference Details (7 cols) */}
        {selectedLoan ? (
          <div className="lg:col-span-7 space-y-6">
            
            {/* Customer Contact & Reference Cards */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                    Đang tác nghiệp hồ sơ: {selectedLoan.contractId}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-0.5">{selectedLoan.customerName}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-semibold">Tổng tiền quá hạn cần thu:</span>
                  <span className="text-xl font-black text-red-600">{formatCurrency(selectedLoan.overdueAmount)}</span>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                
                {/* Main Phone */}
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-blue-700 font-bold uppercase block">Số điện thoại chính</span>
                    <strong className="text-slate-900 font-mono text-sm">{selectedLoan.phone}</strong>
                  </div>
                  <a
                    href={`tel:${selectedLoan.phone}`}
                    className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
                    title="Gọi ngay"
                  >
                    <PhoneCall className="w-4 h-4" />
                  </a>
                </div>

                {/* References */}
                {selectedLoan.references.map((ref, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        Tham chiếu: {ref.name} ({ref.relation})
                      </span>
                      <strong className="text-slate-900 font-mono text-xs">{ref.phone}</strong>
                    </div>
                    <a
                      href={`tel:${ref.phone}`}
                      className="p-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                      title="Gọi người tham chiếu"
                    >
                      <PhoneForwarded className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Call Log Entry Form */}
            <form onSubmit={handleSaveCallLog} className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Ghi nhận kết quả cuộc gọi Telesale
              </h3>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đã lưu kết quả cuộc gọi thành công vào lịch sử nhắc nợ!</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                
                {/* Result Code */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kết quả cuộc gọi</label>
                  <select
                    value={callResult}
                    onChange={(e) => setCallResult(e.target.value)}
                    className="input-human w-full font-bold text-slate-900"
                  >
                    <option value="PTP">Khách hẹn trả (Promise to Pay - PTP)</option>
                    <option value="BUSY_NO_ANSWER">Không nghe máy / Máy bận</option>
                    <option value="UNREACHABLE">Thuê bao / Không liên lạc được</option>
                    <option value="CALL_BACK_LATER">Khách hẹn gọi lại sau</option>
                    <option value="DISPUTE">Khách tranh chấp / Không nhận nợ</option>
                  </select>
                </div>

                {/* PTP Date */}
                {callResult === 'PTP' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Ngày cam kết thanh toán (PTP Date)</label>
                    <input
                      type="date"
                      value={ptpDate}
                      onChange={(e) => setPtpDate(e.target.value)}
                      className="input-human w-full font-bold text-blue-700"
                    />
                  </div>
                )}

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Nội dung chi tiết trao đổi</label>
                  <textarea
                    rows={2}
                    value={callNote}
                    onChange={(e) => setCallNote(e.target.value)}
                    placeholder="Nhập phản hồi của khách, lý do trễ nợ, thỏa thuận gia hạn..."
                    className="input-human w-full"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" /> Lưu kết quả cuộc gọi
                </button>
              </div>
            </form>

            {/* Previous Call Log History Timeline */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                Lịch sử tác nghiệp nhắc nợ ({selectedLoan.callHistory.length} lần)
              </h3>

              <div className="space-y-3 text-xs">
                {selectedLoan.callHistory.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-blue-700 font-bold">{item.result}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      "{item.note}"
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">Nhân viên: {item.officer}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : null}

      </div>

    </div>
  );
};

export default DebtCollection;
