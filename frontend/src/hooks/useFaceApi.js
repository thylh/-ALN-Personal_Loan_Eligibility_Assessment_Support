import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

/**
 * Custom hook tải và tương tác với AI face-api
 * Hỗ trợ nhận diện khuôn mặt, đo khoảng cách Euclidean để so khớp và nhận biết góc quay đầu
 */
export function useFaceApi() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const loadingPromiseRef = useRef(null);

  const loadModels = useCallback(async () => {
    if (isLoaded) return true;
    if (loadingPromiseRef.current) return loadingPromiseRef.current;

    setIsLoading(true);
    setLoadError(null);

    const modelPath = '/models';

    loadingPromiseRef.current = (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
          faceapi.nets.faceRecognitionNet.loadFromUri(modelPath),
          faceapi.nets.faceExpressionNet.loadFromUri(modelPath)
        ]);
        setIsLoaded(true);
        setIsLoading(false);
        return true;
      } catch (err) {
        console.warn('Local /models loading failed, attempting jsdelivr CDN fallback...', err.message);
        try {
          const cdnPath = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
          await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(cdnPath),
            faceapi.nets.faceLandmark68Net.loadFromUri(cdnPath),
            faceapi.nets.faceRecognitionNet.loadFromUri(cdnPath),
            faceapi.nets.faceExpressionNet.loadFromUri(cdnPath)
          ]);
          setIsLoaded(true);
          setIsLoading(false);
          return true;
        } catch (cdnErr) {
          console.error('[FaceApi Load Error]:', cdnErr);
          setLoadError('Không thể tải mô hình AI nhận diện khuôn mặt: ' + cdnErr.message);
          setIsLoading(false);
          return false;
        }
      }
    })();

    return loadingPromiseRef.current;
  }, [isLoaded]);

  // Tự động load models khi component mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  /**
   * Phát hiện khuôn mặt và trích xuất descriptor 128 chiều
   */
  const extractFaceDescriptor = useCallback(async (imageOrCanvasOrVideo) => {
    if (!isLoaded) {
      await loadModels();
    }
    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 });
      const detection = await faceapi
        .detectSingleFace(imageOrCanvasOrVideo, options)
        .withFaceLandmarks()
        .withFaceExpressions()
        .withFaceDescriptor();

      return detection;
    } catch (e) {
      console.warn('extractFaceDescriptor warning:', e.message);
      return null;
    }
  }, [isLoaded, loadModels]);

  /**
   * Tính toán độ tương đồng giữa 2 face descriptors
   * Euclidean Distance:
   * 0.0 -> giống 100%
   * 0.4 -> rất giống (~93%)
   * 0.6 -> ngưỡng chuẩn biometric (~80%)
   * > 0.65 -> không cùng một người
   */
  const compareFaces = useCallback((descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2) return { similarity: 0, distance: 1, isMatch: false };

    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);

    // Chuyển đổi Euclidean distance (0.0 -> 1.0+) sang tỉ lệ phần trăm tương đồng
    // distance <= 0.6 là match
    let similarity = 0;
    if (distance < 0.6) {
      similarity = Math.round((1 - distance / 1.2) * 100 * 10) / 10;
      // Clamp between 80% and 99%
      similarity = Math.max(80, Math.min(99.4, similarity));
    } else {
      similarity = Math.round(Math.max(20, (1 - distance / 1.0) * 100) * 10) / 10;
    }

    const isMatch = distance <= 0.6 || similarity >= 80;

    return {
      similarity,
      distance: Math.round(distance * 1000) / 1000,
      isMatch
    };
  }, []);

  /**
   * Tính toán góc quay đầu (Head Pose) và biểu cảm từ Face Landmarks
   * @param {Object} landmarks - Face landmarks từ face-api.js
   * @param {Object} expressions - Face expressions từ face-api.js
   */
  const calculateHeadPose = useCallback((landmarks, expressions) => {
    if (!landmarks) return { headPose: 'unknown', isSmiling: false, yawRatio: 0 };

    const nose = landmarks.getNose();
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const jawOutline = landmarks.getJawOutline();

    // Tính tâm mắt trung bình
    const eyeCenter = (leftEye[0].x + rightEye[3].x) / 2;
    const noseTip = nose[3].x;
    const faceWidth = Math.max(1, jawOutline[16].x - jawOutline[0].x);

    // Tỉ lệ độ lệch giữa đỉnh mũi và tâm mắt trên bề ngang khuôn mặt
    const yawRatio = (noseTip - eyeCenter) / faceWidth;

    // C. Tối ưu hóa lại ngưỡng nhận diện:
    // - Nới lỏng nhẹ ngưỡng cho bước nhìn thẳng đầu tiên (|yawRatio| <= 0.07) để dễ dàng bắt khung hình chính diện
    // - Quay mặt rõ ràng sang phải: yawRatio < -0.09
    // - Quay mặt rõ ràng sang trái: yawRatio > 0.09
    // - Nhìn thẳng: nằm trong khoảng [-0.07, 0.07]
    let headPose = 'straight';
    if (yawRatio < -0.09) {
      headPose = 'right';
    } else if (yawRatio > 0.09) {
      headPose = 'left';
    } else if (Math.abs(yawRatio) <= 0.07) {
      headPose = 'straight';
    } else {
      // Khoảng chuyển tiếp giữa thẳng và nghiêng
      headPose = yawRatio > 0 ? 'slight_left' : 'slight_right';
    }

    const isSmiling = expressions && expressions.happy > 0.65;

    return {
      headPose,
      isSmiling,
      yawRatio: Math.round(yawRatio * 1000) / 1000
    };
  }, []);

  /**
   * Phân tích cử động đầu và biểu cảm từ video stream để kiểm tra Liveness
   */
  const analyzeLivenessFrame = useCallback(async (videoElement) => {
    if (!isLoaded || !videoElement) return null;

    try {
      const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
      const detection = await faceapi
        .detectSingleFace(videoElement, options)
        .withFaceLandmarks()
        .withFaceExpressions();

      if (!detection) {
        return {
          detected: false,
          message: 'Không tìm thấy khuôn mặt trong khung hình.'
        };
      }

      const { headPose, isSmiling, yawRatio } = calculateHeadPose(
        detection.landmarks,
        detection.expressions
      );

      return {
        detected: true,
        detection,
        headPose,
        isSmiling,
        yawRatio,
        box: detection.detection.box,
        confidence: Math.round(detection.detection.score * 100)
      };
    } catch (e) {
      return null;
    }
  }, [isLoaded, calculateHeadPose]);

  return {
    isLoaded,
    isLoading,
    loadError,
    loadModels,
    extractFaceDescriptor,
    compareFaces,
    calculateHeadPose,
    analyzeLivenessFrame
  };
}

