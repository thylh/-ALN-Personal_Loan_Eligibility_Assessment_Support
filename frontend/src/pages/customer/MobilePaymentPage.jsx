import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, CheckCircle2, XCircle, ShieldCheck, 
  Smartphone, Landmark, AlertCircle, ArrowRight, RefreshCw, Lock
} from 'lucide-react';
import { NGROK_DOMAIN } from '../../config/paymentConfig';

/**
 * MobilePaymentView / MobilePaymentPage:
 * Trang Web xác nhận trên điện thoại (Mobile Page) khi quét mã QR ngrok.
 * Đọc contractId & amount từ Query Parameters, hiển thị giao diện xác nhận và gọi API xác nhận / hủy.
 */
const MobilePaymentPage = () => {
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get('contractId') || 'LOAN-2026-7679';
  const amount = Number(searchParams.get('amount')) || 4513940;
  const sessionId = searchParams.get('sessionId') || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('IDLE'); // 'IDLE' | 'SUCCESS' | 'CANCELLED' | 'ERROR'
  const [message, setMessage] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // 1. Hàm gọi API Xác nhận (handleConfirmPayment)
  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    setMessage('');

    try {
      // Ưu tiên gọi tương đối qua proxy /api hoặc domain ngrok
      const apiUrl = window.location.origin.includes('ngrok')
        ? `${window.location.origin}/api/payment/confirm`
        : `${NGROK_DOMAIN}/api/payment/confirm`;
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contractId,
          sessionId,
          amount
        })
      });

      const data = await res.json();
      if (data.success) {
        setPaymentStatus('SUCCESS');
        setMessage('Thanh toán thành công! Trình duyệt máy tính đã tự động cập nhật.');
        alert('Thanh toán thành công! Bạn có thể đóng trang này.');
      } else {
        setPaymentStatus('ERROR');
        setMessage(data.message || 'Lỗi khi xử lý xác nhận thanh toán.');
      }
    } catch (error) {
      console.error('Lỗi xác nhận', error);
      // Fallback thử qua host hiện tại
      try {
        const fallbackRes = await fetch(`/api/payment/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId, sessionId, amount })
        });
        const fallbackData = await fallbackRes.json();
        if (fallbackData.success) {
          setPaymentStatus('SUCCESS');
          alert('Thanh toán thành công! Bạn có thể đóng trang này.');
          return;
        }
      } catch (e) {}

      setPaymentStatus('ERROR');
      setMessage('Lỗi kết nối API máy chủ: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alias handleConfirmClick cho tương thích
  const handleConfirmClick = handleConfirmPayment;

  // 2. Hàm gọi API Hủy (handleCancelPayment)
  const handleCancelPayment = async () => {
    setIsSubmitting(true);
    try {
      const apiUrl = window.location.origin.includes('ngrok')
        ? `${window.location.origin}/api/payment/cancel`
        : `${NGROK_DOMAIN}/api/payment/cancel`;
      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId, sessionId, reason: 'Người dùng hủy trên điện thoại' })
      });
      setPaymentStatus('CANCELLED');
      setMessage('Bạn đã từ chối giao dịch thanh toán.');
    } catch (err) {
      setPaymentStatus('CANCELLED');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Alias handleCancelClick cho tương thích
  const handleCancelClick = handleCancelPayment;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 max-w-md mx-auto">
      {/* Header */}
      <header className="pt-4 pb-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
          <Smartphone className="w-3.5 h-3.5" /> Xác Nhận Thanh Toán Di Động
        </div>
        <h1 className="text-xl font-black text-white tracking-tight">Hệ Thống Vay Vốn LOMS</h1>
        <p className="text-xs text-slate-400">Xác thực giao dịch trả nợ trực tuyến</p>
      </header>

      {/* Main Body */}
      <main className="my-auto py-4">
        {/* Trạng thái đã thanh toán thành công */}
        {paymentStatus === 'SUCCESS' && (
          <div className="bg-slate-900 border border-emerald-500/40 p-6 rounded-3xl text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-white">Thanh Toán Thành Công!</h2>
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 space-y-2 text-left text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Mã hợp đồng:</span>
                <span className="font-bold text-white font-mono">{contractId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Số tiền đã trả:</span>
                <span className="font-extrabold text-emerald-400 font-mono text-sm">
                  {formatCurrency(amount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Trạng thái máy tính:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  Đã cập nhật tự động
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bạn có thể đóng tab trình duyệt này. Màn hình máy tính của bạn đã chuyển sang trạng thái thành công.
            </p>
            <button
              type="button"
              onClick={() => window.close()}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition"
            >
              Đóng trang
            </button>
          </div>
        )}

        {/* Trạng thái đã hủy */}
        {paymentStatus === 'CANCELLED' && (
          <div className="bg-slate-900 border border-rose-500/40 p-6 rounded-3xl text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-bold text-white">Giao Dịch Đã Hủy</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bạn đã chọn hủy bỏ thanh toán. Màn hình máy tính đã nhận được thông báo hủy.
            </p>
            <button
              type="button"
              onClick={() => setPaymentStatus('IDLE')}
              className="w-full py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Trạng thái chờ xác nhận: Hiển thị số tiền cần trả và 2 nút */}
        {paymentStatus === 'IDLE' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-2xl">
            {/* Khung số tiền cần trả */}
            <div className="text-center pb-2 border-b border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Số tiền cần thanh toán</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1 tracking-tight">
                {formatCurrency(amount)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Phí dịch vụ: 0 ₫ (Miễn phí qua Napas 247)</div>
            </div>

            {/* Chi tiết hợp đồng */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Mã hợp đồng:</span>
                <span className="font-mono font-bold text-blue-400">{contractId}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Đơn vị nhận:</span>
                <span className="font-semibold text-slate-200">Công ty Tài chính LOMS</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Cổng thanh toán:</span>
                <span className="text-blue-400 font-mono">Napas 247 Realtime Sync</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-950/40 border border-blue-900/40 text-[11px] text-blue-300">
              <Lock className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Giao dịch an toàn được xác thực tự động bằng chữ ký số.</span>
            </div>

            {/* 2 Nút: [Xác nhận thanh toán] và [Hủy] */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmClick}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Đang gửi xác nhận...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Xác Nhận Thanh Toán
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCancelClick}
                className="w-full py-3 rounded-2xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 font-bold text-xs transition"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 text-center text-[10px] text-slate-500">
        Bản quyền © 2026 Hệ Thống Vay Vốn & Thẩm Định LOMS.
      </footer>
    </div>
  );
};

export default MobilePaymentPage;
