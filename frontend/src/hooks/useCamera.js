import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook quản lý Webcam / Camera thiết bị tối ưu hóa không bị re-render loop
 * - Sử dụng streamRef (useRef) thay vì useState để giữ MediaStream
 * - Bắt buộc cleanup track.stop() khi unmount
 * - Cung cấp hàm khởi tạo chuẩn, autoPlay, playsInline, muted
 */
export function useCamera(initialFacingMode = 'user') {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState(initialFacingMode);
  const [hasPermission, setHasPermission] = useState(null);

  const videoRef = useRef(null);
  // A. Biến tham chiếu streamRef: Giữ đối tượng MediaStream bằng useRef ngăn chặn re-render loop
  const streamRef = useRef(null);

  // Hàm dừng và dọn dẹp phần cứng (cleanup)
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => {
          try {
            track.stop();
          } catch (e) {}
        });
      } catch (e) {}
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  // B. Hàm khởi tạo camera (initializeCamera)
  const startCamera = useCallback(async (mode = facingMode) => {
    // Dọn dẹp luồng cũ trước khi mở luồng mới
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => {
        try { t.stop(); } catch (e) {}
      });
      streamRef.current = null;
    }

    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Trình duyệt của bạn không hỗ trợ truy cập Camera (getUserMedia).');
      setHasPermission(false);
      return false;
    }

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setHasPermission(true);
      setIsActive(true);
      setFacingMode(mode);

      // C. Gắn kết hiển thị giao diện vào thẻ video
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Đảm bảo các thuộc tính phát mượt mà
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.muted = true;
        
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video auto-play warning:', e);
        }
      }

      return true;
    } catch (err) {
      console.error('[useCamera error]:', err);
      let message = 'Không thể kết nối đến Camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Bạn đã từ chối quyền truy cập Camera. Vui lòng cấp quyền trong cài đặt trình duyệt để tiếp tục.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'Không tìm thấy thiết bị Camera nào trên máy của bạn.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera đang bị ứng dụng khác sử dụng (Zoom, Teams, v.v.).';
      }
      setError(message);
      setHasPermission(false);
      setIsActive(false);
      return false;
    }
  }, [facingMode]);

  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    return await startCamera(nextMode);
  }, [facingMode, startCamera]);

  // Chụp ảnh tức thì qua canvas
  const captureSnapshot = useCallback((options = { quality: 0.95, mimeType: 'image/jpeg' }) => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // Nếu là camera trước, lật ngang để khớp với gương preview
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(options.mimeType || 'image/jpeg', options.quality || 0.95);
  }, [facingMode]);

  // Tự động dọn dẹp phần cứng khi component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          try { track.stop(); } catch (e) {}
        });
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    streamRef,
    isActive,
    error,
    facingMode,
    hasPermission,
    startCamera,
    stopCamera,
    switchCamera,
    captureSnapshot
  };
}
