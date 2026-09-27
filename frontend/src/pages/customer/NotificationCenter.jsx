import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, CheckCircle2, Clock, AlertTriangle, 
  DollarSign, Sparkles, Trash2, CheckCheck, 
  ChevronRight, Filter, ShieldAlert, ArrowRight
} from 'lucide-react';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    category: 'payment',
    title: 'Nhắc lịch thanh toán kỳ 4/12 sắp đến hạn',
    message: 'Khoản vay #HD-2026-LOMS-8921 của bạn sẽ đến hạn thanh toán vào ngày 15/10/2026. Số tiền cần trả: 4.541.667 đ. Vui lòng thanh toán đúng hạn để duy trì điểm tín dụng tốt.',
    timestamp: '10 phút trước',
    isRead: false,
    actionUrl: '/payment',
    actionText: 'Thanh toán ngay',
    type: 'warning'
  },
  {
    id: 'notif_2',
    category: 'loan',
    title: 'Giải ngân thành công vào tài khoản Vietcombank',
    message: 'Số tiền 50.000.000 đ đã được chuyển thành công vào số tài khoản 990123456789 của bạn qua hệ thống Napas 247.',
    timestamp: 'Hôm qua, 14:30',
    isRead: false,
    actionUrl: '/dashboard',
    actionText: 'Xem khoản vay',
    type: 'success'
  },
  {
    id: 'notif_3',
    category: 'loan',
    title: 'Hợp đồng điện tử đã được ký số thành công',
    message: 'Hợp đồng tín dụng số HD-2026-LOMS-8921 đã được đóng dấu điện tử hợp pháp. Bạn có thể xem và tải bản PDF bất kỳ lúc nào.',
    timestamp: '2 ngày trước',
    isRead: true,
    actionUrl: '/apply/contract',
    actionText: 'Xem hợp đồng',
    type: 'info'
  },
  {
    id: 'notif_4',
    category: 'security',
    title: 'Cảnh báo đăng nhập từ thiết bị mới',
    message: 'Tài khoản của bạn vừa đăng nhập từ trình duyệt Chrome trên Windows (IP: 14.161.45.xx tại Hà Nội). Nếu không phải bạn, hãy đổi mật khẩu ngay.',
    timestamp: '3 ngày trước',
    isRead: true,
    actionUrl: '/profile',
    actionText: 'Kiểm tra bảo mật',
    type: 'security'
  },
  {
    id: 'notif_5',
    category: 'promo',
    title: 'Ưu đãi: Bạn đủ điều kiện nâng hạn mức đến 100 Triệu',
    message: 'Nhờ lịch sử thanh toán đúng hạn 3 kỳ liên tiếp, bạn được hệ thống AI tự động nâng hạn mức tín chấp với lãi suất ưu đãi chỉ 0.8%/tháng.',
    timestamp: '5 ngày trước',
    isRead: true,
    actionUrl: '/home',
    actionText: 'Khám phá ngay',
    type: 'promo'
  }
];

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [tabFilter, setTabFilter] = useState('ALL');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllAsRead = () => {
    setNotifications(curr => curr.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(curr => curr.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setNotifications(curr => curr.filter(n => n.id !== id));
  };

  const filteredNotifs = notifications.filter(n => {
    if (tabFilter === 'ALL') return true;
    if (tabFilter === 'UNREAD') return !n.isRead;
    return n.category === tabFilter;
  });

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Trung Tâm Thông Báo</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-xs font-bold">
                {unreadCount} mới
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cập nhật nhắc nợ, trạng thái thẩm định và thông tin bảo mật tài khoản.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            Đánh dấu tất cả là đã đọc
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold w-fit">
        <button
          type="button"
          onClick={() => setTabFilter('ALL')}
          className={`px-4 py-2 rounded-xl transition ${tabFilter === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Tất cả ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setTabFilter('UNREAD')}
          className={`px-4 py-2 rounded-xl transition ${tabFilter === 'UNREAD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Chưa đọc ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setTabFilter('payment')}
          className={`px-4 py-2 rounded-xl transition ${tabFilter === 'payment' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Nhắc nợ
        </button>
        <button
          type="button"
          onClick={() => setTabFilter('loan')}
          className={`px-4 py-2 rounded-xl transition ${tabFilter === 'loan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Hồ sơ & Giải ngân
        </button>
        <button
          type="button"
          onClick={() => setTabFilter('security')}
          className={`px-4 py-2 rounded-xl transition ${tabFilter === 'security' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Bảo mật
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100">
        {filteredNotifs.map((n) => (
          <div
            key={n.id}
            onClick={() => handleMarkAsRead(n.id)}
            className={`p-5 sm:p-6 transition cursor-pointer flex items-start gap-4 group ${
              !n.isRead ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50'
            }`}
          >
            {/* Category Icon */}
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
              n.type === 'warning' 
                ? 'bg-amber-100 text-amber-700' 
                : n.type === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : n.type === 'security'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {n.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
              {n.type === 'success' && <DollarSign className="w-5 h-5" />}
              {n.type === 'security' && <ShieldAlert className="w-5 h-5" />}
              {n.type === 'info' && <CheckCircle2 className="w-5 h-5" />}
              {n.type === 'promo' && <Sparkles className="w-5 h-5" />}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className={`text-sm ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                    {n.title}
                  </h4>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 animate-ping"></span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono flex-shrink-0">
                  {n.timestamp}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {n.message}
              </p>

              {/* Action Button & Link */}
              <div className="pt-2 flex items-center justify-between">
                {n.actionUrl && (
                  <Link
                    to={n.actionUrl}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>{n.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                <button
                  type="button"
                  onClick={(e) => handleDelete(n.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1 transition"
                  title="Xóa thông báo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifs.length === 0 && (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Bell className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">Không có thông báo nào trong mục này</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationCenter;
