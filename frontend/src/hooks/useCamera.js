import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook quản lý Webcam / Camera thiết bị
 * Hỗ trợ chuyển đổi camera trước/sau, chụp ảnh tức thì qua canvas
 */
export function useCamera(initialFacingMode = 'user') {
  const [stream, setStream] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState(initialFacingMode);
  const [hasPermission, setHasPermission] = useState(null);

  const videoRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, [stream]);

  const startCamera = useCallback(async (mode = facingMode) => {
    stopCamera();
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
      setStream(mediaStream);
      setHasPermission(true);
      setIsActive(true);
      setFacingMode(mode);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(e => console.warn('Video auto-play warning:', e));
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
  }, [facingMode, stopCamera]);

  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    return await startCamera(nextMode);
  }, [facingMode, startCamera]);

  const captureSnapshot = useCallback((options = { quality: 0.92, mimeType: 'image/jpeg' }) => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // If front camera, flip horizontally for mirror preview match
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL(options.mimeType, options.quality);
    return dataUrl;
  }, [facingMode]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    stream,
    isActive,
    error,
    hasPermission,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    captureSnapshot
  };
}

