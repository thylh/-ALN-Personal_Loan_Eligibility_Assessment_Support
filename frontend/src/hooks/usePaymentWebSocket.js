import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * usePaymentWebSocket:
 * Hook lắng nghe trạng thái phiên thanh toán Realtime qua Socket.IO.
 * Khi nhận sự kiện thanh toán thành công hoặc hủy bỏ từ di động,
 * tự động kích hoạt callback để đổi giao diện máy tính ngay lập tức mà không cần reload trang.
 *
 * @param {string} sessionId Mã phiên thanh toán hiện tại
 * @param {object} callbacks Các hàm xử lý { onPaymentSuccess, onPaymentCancelled }
 */
export function usePaymentWebSocket(identifier, { onPaymentSuccess, onPaymentCancelled }) {
  const { socket, connected, joinPaymentSession } = useSocket();

  useEffect(() => {
    if (!socket || !identifier) return;

    // Tham gia room riêng theo sessionId hoặc contractId
    joinPaymentSession(identifier);

    // 1. Lắng nghe sự kiện thanh toán thành công từ Mobile
    const handleSuccess = (data) => {
      console.log('[usePaymentWebSocket] Nhận event payment:success:', data);
      if (
        !data.contractId ||
        !data.sessionId ||
        data.contractId === identifier ||
        data.sessionId === identifier
      ) {
        if (onPaymentSuccess) {
          onPaymentSuccess(data);
        }
      }
    };

    // 2. Lắng nghe sự kiện hủy bỏ từ Mobile
    const handleCancelled = (data) => {
      console.log('[usePaymentWebSocket] Nhận event payment:cancelled:', data);
      if (
        !data.contractId ||
        !data.sessionId ||
        data.contractId === identifier ||
        data.sessionId === identifier
      ) {
        if (onPaymentCancelled) {
          onPaymentCancelled(data);
        }
      }
    };

    // 3. Lắng nghe sự kiện cập nhật hợp đồng toàn cục
    const handleLoanPaymentCompleted = (data) => {
      if (
        data.contractId === identifier ||
        data.application?.applicationNo === identifier ||
        data.sessionId === identifier
      ) {
        if (onPaymentSuccess) {
          onPaymentSuccess(data);
        }
      }
    };

    socket.on('payment:success', handleSuccess);
    socket.on('payment:cancelled', handleCancelled);
    socket.on('loan:payment_completed', handleLoanPaymentCompleted);

    return () => {
      socket.off('payment:success', handleSuccess);
      socket.off('payment:cancelled', handleCancelled);
      socket.off('loan:payment_completed', handleLoanPaymentCompleted);
    };
  }, [socket, connected, identifier, onPaymentSuccess, onPaymentCancelled, joinPaymentSession]);
}

