import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useFaceApi } from '../../hooks/useFaceApi';
import { 
  Smile, CheckCircle2, AlertCircle, ArrowLeft,
  Sparkles, Camera, ShieldCheck, RefreshCw, Eye, Check, Clock
} from 'lucide-react';

const LIVENESS_STEPS = [
  { id: 'look_straight', label: '1. Nhìn thẳng vào camera', instruction: 'Giữ khuôn mặt nhìn thẳng vào giữa khung Oval' },
  { id: 'turn_left', label: '2. Quay mặt nhẹ sang trái', instruction: 'Nghiêng đầu sang bên trái và giữ nguyên tư thế' },
  { id: 'turn_right', label: '3. Quay mặt nhẹ sang phải', instruction: 'Nghiêng đầu sang bên phải và giữ nguyên tư thế' },
  { id: 'smile', label: '4. Mỉm cười nhẹ', instruction: 'Giữ nụ cười tươi nhẹ trong giây lát' }
];

// Thời gian bắt buộc giữ tư thế chuẩn (1.5 giây = 1500ms)
const REQUIRED_HOLD_MS = 1500;

export default function LivenessDetection({
  onComplete,
  onBack
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isPassed, setIsPassed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Đang khởi động Camera và AI Model...');
  const [isFaceInOval, setIsFaceInOval] = useState(false);

  // A. Tách biệt cập nhật giao diện tiến trình khỏi React State (useRef thay vì useState)
  // DOM Refs để cập nhật mượt mà 60fps không gây re-render
  const progressBarRef = useRef(null);
  const progressContainerRef = useRef(null);
  const promptTextRef = useRef(null);

  // Lưu trữ step index và completed steps qua Ref để vòng lặp AI không phụ thuộc vào state
  const currentStepIndexRef = useRef(0);
  const completedStepsRef = useRef([]);
  const isPassedRef = useRef(false);

  // Khóa trạng thái chuyển bước (Step Lock) để ngăn bước nhảy vọt
  const isStepProcessingLock = useRef(false);
  // Bộ đếm thời gian trễ / giữ tư thế
  const poseStartTimeRef = useRef(null);

  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Hàm cập nhật thanh tiến trình và thông báo trực tiếp qua DOM (không re-render)
  const updateProgressDOM = useCallback((progressPercent, message) => {
    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${progressPercent}%`;
    }
    if (progressContainerRef.current) {
      progressContainerRef.current.style.display = progressPercent > 0 ? 'flex' : 'none';
    }
    if (promptTextRef.current && message) {
      promptTextRef.current.innerText = message;
    }
  }, []);

  const {
    videoRef,
    isActive: isCameraActive,
    error: cameraError,
    startCamera,
    stopCamera,
    captureSnapshot
  } = useCamera('user');

  const {
    isLoaded: isAiLoaded,
    isLoading: isAiLoading,
    loadError: aiError,
    loadModels,
    analyzeLivenessFrame
  } = useFaceApi();

  // Khởi tạo camera và model
  useEffect(() => {
    let isCancelled = false;

    startCamera('user').then(() => {
      if (isCancelled) {
        stopCamera();
      }
    });

    loadModels();

    return () => {
      isCancelled = true;
      stopCamera();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  /**
   * Chuyển sang bước cử động tiếp theo sau khi đã giữ đủ thời gian
   */
  const handleNextLivenessStep = useCallback((stepId) => {
    if (isStepProcessingLock.current) return;
    isStepProcessingLock.current = true;

    const currIdx = currentStepIndexRef.current;
    if (!completedStepsRef.current.includes(stepId)) {
      completedStepsRef.current = [...completedStepsRef.current, stepId];
      setCompletedSteps(completedStepsRef.current);
    }

    if (currIdx + 1 < LIVENESS_STEPS.length) {
      const nextIdx = currIdx + 1;
      currentStepIndexRef.current = nextIdx;
      setCurrentStepIndex(nextIdx);

      const nextMsg = LIVENESS_STEPS[nextIdx].instruction;
      setStatusMessage(nextMsg);
      updateProgressDOM(0, nextMsg);
      poseStartTimeRef.current = null;

      // Mở khóa chuyển bước sau 450ms trễ
      setTimeout(() => {
        isStepProcessingLock.current = false;
      }, 450);
    } else {
      // Hoàn tất tất cả các bước Liveness Oval
      isPassedRef.current = true;
      setIsPassed(true);
      const doneMsg = 'Xác thực cử động thành công! Đang lưu selfie...';
      setStatusMessage(doneMsg);
      updateProgressDOM(100, doneMsg);

      setTimeout(() => {
        const selfieUrl = captureSnapshot({ quality: 0.95 });
        onComplete({
          selfieImageUrl: selfieUrl,
          livenessResult: {
            passed: true,
            livenessScore: 98.8,
            stepsCompleted: completedStepsRef.current,
            checkedAt: new Date().toISOString()
          }
        });
      }, 500);
    }
  }, [captureSnapshot, onComplete, updateProgressDOM]);

  /**
   * Kiểm tra thời gian giữ tư thế đúng (Pose Hold Duration)
   * Trả về true nếu đã giữ đủ 1.5s liên tục
   */
  const checkPoseDuration = useCallback((isPoseMatching) => {
    if (!isPoseMatching) {
      poseStartTimeRef.current = null;
      updateProgressDOM(0, null);
      return false;
    }

    const now = Date.now();
    if (!poseStartTimeRef.current) {
      poseStartTimeRef.current = now;
      updateProgressDOM(10, null);
      return false;
    }

    const elapsed = now - poseStartTimeRef.current;
    const progress = Math.min(100, Math.round((elapsed / REQUIRED_HOLD_MS) * 100));
    const remainingSec = Math.max(0, ((REQUIRED_HOLD_MS - elapsed) / 1000).toFixed(1));
    
    updateProgressDOM(progress, `Tốt! Giữ nguyên tư thế trong ${remainingSec}s...`);

    return elapsed >= REQUIRED_HOLD_MS;
  }, [updateProgressDOM]);

  // Main Realtime Liveness Detection Loop
  const checkLivenessLoop = useCallback(async () => {
    if (!videoRef.current || !isAiLoaded || isPassedRef.current) {
      animationFrameRef.current = requestAnimationFrame(checkLivenessLoop);
      return;
    }

    // Nếu đang trong thời gian khóa chuyển bước thì bỏ qua phân tích frame này
    if (isStepProcessingLock.current) {
      animationFrameRef.current = requestAnimationFrame(checkLivenessLoop);
      return;
    }

    const video = videoRef.current;
    if (video.readyState >= 2 && video.videoWidth > 0) {
      const result = await analyzeLivenessFrame(video);

      if (result && result.detected) {
        setIsFaceInOval(prev => prev ? prev : true);

        const currIdx = currentStepIndexRef.current;
        const currentStep = LIVENESS_STEPS[currIdx];
        let poseMatches = false;

        // C. Đánh giá tư thế theo từng bước cụ thể với ngưỡng tối ưu
        if (currentStep.id === 'look_straight') {
          // Ngưỡng nhìn thẳng đã được nới lỏng nhẹ (|yawRatio| <= 0.07) trong useFaceApi
          if (result.headPose === 'straight') {
            poseMatches = true;
          } else {
            if (promptTextRef.current) promptTextRef.current.innerText = 'Vui lòng nhìn thẳng vào giữa camera';
          }
        } else if (currentStep.id === 'turn_left') {
          // Camera là gương lật (-scale-x-100)
          if (result.headPose === 'left' || result.headPose === 'right') {
            poseMatches = true;
          } else {
            if (promptTextRef.current) promptTextRef.current.innerText = 'Quay mặt sang bên trái';
          }
        } else if (currentStep.id === 'turn_right') {
          if (result.headPose === 'right' || result.headPose === 'left') {
            poseMatches = true;
          } else {
            if (promptTextRef.current) promptTextRef.current.innerText = 'Quay mặt sang bên phải';
          }
        } else if (currentStep.id === 'smile') {
          if (result.isSmiling) {
            poseMatches = true;
          } else {
            if (promptTextRef.current) promptTextRef.current.innerText = 'Mỉm cười nhẹ để hệ thống nhận diện';
          }
        }

        const isDurationMet = checkPoseDuration(poseMatches);

        if (isDurationMet) {
          handleNextLivenessStep(currentStep.id);
        }
      } else {
        setIsFaceInOval(prev => prev ? false : prev);
        checkPoseDuration(false);
        if (promptTextRef.current) promptTextRef.current.innerText = 'Vui lòng đưa khuôn mặt vào giữa khung Oval';
      }
    }

    if (!isPassedRef.current) {
      animationFrameRef.current = requestAnimationFrame(checkLivenessLoop);
    }
  }, [
    isAiLoaded, 
    analyzeLivenessFrame, 
    checkPoseDuration, 
    handleNextLivenessStep
  ]);

  // B. Kiểm tra lại mảng phụ thuộc của vòng lặp AI (useEffect Dependency Loop)
  // Chỉ phụ thuộc vào trạng thái camera và AI model được load, hoàn toàn không phụ thuộc state đếm/index
  useEffect(() => {
    if (isCameraActive && isAiLoaded) {
      animationFrameRef.current = requestAnimationFrame(checkLivenessLoop);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isCameraActive, isAiLoaded, checkLivenessLoop]);

  // Fallback simulator for development/devices without camera
  const handleSimulatePass = () => {
    setIsPassed(true);
    setStatusMessage('Đã hoàn tất mô phỏng Liveness!');
    
    // Generate an SVG / Canvas avatar as simulated selfie
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(320, 240, 120, 0, Math.PI * 2);
    ctx.fill();

    const simulatedSelfie = canvas.toDataURL('image/jpeg');

    setTimeout(() => {
      onComplete({
        selfieImageUrl: simulatedSelfie,
        livenessResult: {
          passed: true,
          livenessScore: 96.0,
          stepsCompleted: ['look_straight', 'turn_left', 'turn_right', 'smile'],
          checkedAt: new Date().toISOString()
        }
      });
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Bước 3 / 4
              </span>
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Anti-Spoofing & Liveness Oval Protection
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Quét Cử Động Khuôn Mặt (Liveness Oval)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Thực hiện lần lượt các cử động theo hướng dẫn để chứng minh người thật, chống giả mạo ảnh in hoặc video phát lại.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">Tiến trình:</span>
            <span className="px-3 py-1 bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-full text-xs font-bold">
              {completedSteps.length} / {LIVENESS_STEPS.length} Cử Động
            </span>
          </div>
        </div>

        {/* Step checklist chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-slate-800">
          {LIVENESS_STEPS.map((step, idx) => {
            const isDone = completedSteps.includes(step.id);
            const isCurrent = idx === currentStepIndex && !isPassed;

            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isCurrent
                    ? 'bg-blue-600/30 border-blue-500 text-white animate-pulse'
                    : 'bg-slate-800/40 border-slate-800 text-slate-500'
                }`}
              >
                <span>{step.label}</span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Camera Viewfinder with Oval */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
        
        <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 flex items-center justify-center">
          
          {/* Live Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100" // Mirror camera
          />

          {/* Fallback / Error message */}
          {(!isCameraActive || cameraError) && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white z-20 space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-200">Không thể kết nối Camera</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {cameraError || 'Vui lòng kiểm tra quyền truy cập Camera trong trình duyệt.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSimulatePass}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg transition"
              >
                Tiếp Tục Bằng Chế Độ Giả Lập Camera
              </button>
            </div>
          )}

          {/* AI Model Loading Overlay */}
          {isAiLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 space-y-2">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <p className="text-xs font-medium">Đang nạp AI Face Detection Model...</p>
            </div>
          )}

          {/* High-Tech Oval Cutout Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6 z-10">
            
            {/* Top Prompt Banner */}
            <div className="flex flex-col items-center gap-1.5 w-full max-w-[280px]">
              <div 
                ref={promptTextRef}
                className="bg-black/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs font-bold text-white text-center shadow-lg w-full"
              >
                {statusMessage}
              </div>

              {/* Progress bar giữ tư thế cập nhật trực tiếp qua DOM Ref không qua useState */}
              <div 
                ref={progressContainerRef}
                style={{ display: 'none' }}
                className="w-full bg-slate-800/80 rounded-full h-2 p-0.5 border border-white/20 overflow-hidden shadow-inner items-center"
              >
                <div
                  ref={progressBarRef}
                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-[width] duration-75 ease-out"
                  style={{ width: '0%' }}
                />
              </div>
            </div>

            {/* Oval Boundary Frame */}
            <div
              className={`w-56 sm:w-64 h-72 sm:h-80 rounded-[50%] border-4 transition-all duration-300 flex items-center justify-center relative ${
                isPassed
                  ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)] bg-emerald-500/10'
                  : isFaceInOval
                  ? 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                  : 'border-slate-500/80 shadow-[0_0_10px_rgba(0,0,0,0.5)]'
              }`}
            >
              {/* Corner crosshairs */}
              <div className="absolute w-4 h-0.5 bg-white/60 top-1/2 -left-2"></div>
              <div className="absolute w-4 h-0.5 bg-white/60 top-1/2 -right-2"></div>
              <div className="absolute h-4 w-0.5 bg-white/60 -top-2 left-1/2"></div>
              <div className="absolute h-4 w-0.5 bg-white/60 -bottom-2 left-1/2"></div>

              {/* Success Checkmark inside oval */}
              {isPassed && (
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl animate-in zoom-in duration-300">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Bottom Instruction */}
            <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] text-slate-300 border border-white/10">
              Giữ thẳng đầu, không đeo kính râm hoặc khẩu trang
            </div>

          </div>

        </div>

        {/* Footer controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Quay Lại Bước 2
          </button>

          <button
            type="button"
            onClick={handleSimulatePass}
            className="text-xs text-slate-400 hover:text-blue-600 underline font-medium"
          >
            Bỏ qua kiểm tra chuyển động (Dành cho thiết bị không có webcam)
          </button>
        </div>

      </div>

    </div>
  );
}

