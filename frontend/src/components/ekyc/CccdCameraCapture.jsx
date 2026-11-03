import React, { useState, useRef, useEffect } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { 
  Camera, UploadCloud, RefreshCw, CheckCircle2, 
  AlertCircle, Trash2, ArrowRight, Sparkles, Shield,
  Sun, Eye, Image as ImageIcon
} from 'lucide-react';

export default function CccdCameraCapture({
  frontImage,
  backImage,
  onFrontImageChange,
  onBackImageChange,
  onNext
}) {
  const [activeSide, setActiveSide] = useState('front'); // 'front' | 'back'
  const [captureMethod, setCaptureMethod] = useState('camera'); // 'camera' | 'upload'
  const [flashActive, setFlashActive] = useState(false);

  const fileInputRef = useRef(null);
  const {
    videoRef,
    isActive,
    error: cameraError,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    captureSnapshot
  } = useCamera('environment'); // Prioritize back camera for document capture

  // B. Khởi tạo và ràng buộc vòng đời (useEffect)
  // Chỉ chạy đúng 1 lần khi component mount (dependency array []), tự động dọn dẹp khi unmount
  useEffect(() => {
    let isCancelled = false;

    if (captureMethod === 'camera') {
      startCamera('environment').then(() => {
        if (isCancelled) {
          stopCamera();
        }
      });
    } else {
      stopCamera();
    }

    return () => {
      isCancelled = true;
      stopCamera();
    };
  }, [captureMethod]); // Chỉ kích hoạt lại khi chuyển tab Camera <-> Tải ảnh, không phụ thuộc startCamera/stopCamera

  // Handle capture snapshot
  const handleSnap = () => {
    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const dataUrl = captureSnapshot();
    if (dataUrl) {
      if (activeSide === 'front') {
        onFrontImageChange(dataUrl);
        // Prompt user to flip to back
        if (!backImage) {
          setTimeout(() => setActiveSide('back'), 400);
        }
      } else {
        onBackImageChange(dataUrl);
      }
    }
  };

  // Handle file upload fallback
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Dung lượng ảnh không được vượt quá 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        if (activeSide === 'front') {
          onFrontImageChange(dataUrl);
          if (!backImage) setActiveSide('back');
        } else {
          onBackImageChange(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const isComplete = Boolean(frontImage && backImage);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Selector */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Bước 1 / 4
              </span>
              <span className="text-xs text-slate-300 font-medium">Bảo mật chuẩn ISO/IEC 30107</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-400" />
              Chụp Căn Cước Công Dân (CCCD) 2 Mặt
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Hệ thống sẽ tự động quét thông tin OCR và trích xuất khuôn mặt chân dung để đối soát với ảnh chụp selfie liveness của bạn.
            </p>
          </div>

          {/* Capture Method Switcher */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCaptureMethod('camera')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                captureMethod === 'camera'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Mở Camera
            </button>
            <button
              type="button"
              onClick={() => setCaptureMethod('upload')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                captureMethod === 'upload'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Tải Tệp Lên
            </button>
          </div>
        </div>

        {/* Side Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSide('front')}
            className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
              activeSide === 'front'
                ? 'bg-blue-600/20 border-blue-500 text-white'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>1. Mặt trước CCCD</span>
                {frontImage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-[10px] text-slate-400">Có ảnh chân dung & số ID</span>
            </div>
            {frontImage && (
              <img src={frontImage} alt="Front thumb" className="w-9 h-6 object-cover rounded-md border border-slate-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSide('back')}
            className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
              activeSide === 'back'
                ? 'bg-blue-600/20 border-blue-500 text-white'
                : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>2. Mặt sau CCCD</span>
                {backImage && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-[10px] text-slate-400">Có vân tay & mã chip MRZ</span>
            </div>
            {backImage && (
              <img src={backImage} alt="Back thumb" className="w-9 h-6 object-cover rounded-md border border-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Main View Area: Camera or Upload */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
        
        {captureMethod === 'camera' ? (
          <div>
            {/* Viewfinder Frame */}
            <div className="relative w-full max-w-xl mx-auto aspect-[1.58/1] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center border-4 border-slate-800">
              
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}
              />

              {/* Shutter flash animation */}
              {flashActive && (
                <div className="absolute inset-0 bg-white z-30 animate-pulse"></div>
              )}

              {/* Camera Loading or Error State */}
              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-900/90 text-white">
                  {cameraError ? (
                    <div className="space-y-3">
                      <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                      <p className="text-xs text-amber-200 font-medium max-w-md">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => setCaptureMethod('upload')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition shadow-lg"
                      >
                        Chuyển sang Tải Ảnh Từ Máy
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-xs text-slate-300">Đang khởi tạo máy ảnh...</p>
                    </div>
                  )}
                </div>
              )}

              {/* High-Tech Card Bounding Box Overlay */}
              {isActive && (
                <div className="absolute inset-0 pointer-events-none p-4 sm:p-8 flex flex-col justify-between">
                  {/* Card Guide Box */}
                  <div className="relative w-full h-full border-2 border-dashed border-blue-400/70 rounded-2xl flex flex-col justify-between p-3">
                    
                    {/* 4 Corner Markers */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>

                    {/* Top Guide Text */}
                    <div className="self-center bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white border border-white/20 flex items-center gap-1.5 shadow-lg">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      Căn chỉnh {activeSide === 'front' ? 'mặt trước' : 'mặt sau'} CCCD khớp khung viền
                    </div>

                    {/* Bottom Chip / Portrait Hint */}
                    <div className="self-center bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-slate-200 border border-white/10 flex items-center gap-1.5">
                      <Sun className="w-3 h-3 text-blue-400" />
                      Giữ thẳng tay, chụp ở nơi có ánh sáng tốt và không bị chói đèn
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Camera Controls Bar */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={switchCamera}
                disabled={!isActive}
                title="Đổi camera trước/sau"
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition disabled:opacity-50"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleSnap}
                disabled={!isActive}
                className="group relative px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl font-bold text-xs shadow-xl shadow-blue-500/30 transition flex items-center gap-2.5 disabled:opacity-50 disabled:scale-100"
              >
                <div className="w-4 h-4 rounded-full border-2 border-white bg-red-500 animate-pulse"></div>
                Chụp {activeSide === 'front' ? 'Mặt Trước' : 'Mặt Sau'}
              </button>

              <button
                type="button"
                onClick={() => setCaptureMethod('upload')}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                title="Tải ảnh từ máy"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Upload File Box */
          <div className="max-w-xl mx-auto">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-[1.58/1] border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl flex flex-col items-center justify-center cursor-pointer p-6 bg-slate-50/50 hover:bg-blue-50/20 transition group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-3 transition shadow-sm">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Chọn ảnh {activeSide === 'front' ? 'Mặt trước' : 'Mặt sau'} CCCD từ máy
              </p>
              <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB/tệp)</p>
              <span className="mt-4 px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition">
                Duyệt tệp tin
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Dual Thumbnail Preview Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
          
          {/* Front Card Preview */}
          <div className={`p-4 rounded-2xl border transition ${frontImage ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                Mặt trước CCCD
                {frontImage && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </span>
              {frontImage && (
                <button
                  type="button"
                  onClick={() => onFrontImageChange(null)}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa chụp lại
                </button>
              )}
            </div>
            {frontImage ? (
              <div className="relative aspect-[1.58/1] rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-black">
                <img src={frontImage} alt="Mặt trước CCCD" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div 
                onClick={() => { setActiveSide('front'); if (captureMethod === 'upload') fileInputRef.current?.click(); }}
                className="aspect-[1.58/1] rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 bg-white cursor-pointer hover:bg-slate-50 transition"
              >
                Chưa có ảnh mặt trước
              </div>
            )}
          </div>

          {/* Back Card Preview */}
          <div className={`p-4 rounded-2xl border transition ${backImage ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                Mặt sau CCCD
                {backImage && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </span>
              {backImage && (
                <button
                  type="button"
                  onClick={() => onBackImageChange(null)}
                  className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa chụp lại
                </button>
              )}
            </div>
            {backImage ? (
              <div className="relative aspect-[1.58/1] rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-black">
                <img src={backImage} alt="Mặt sau CCCD" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div 
                onClick={() => { setActiveSide('back'); if (captureMethod === 'upload') fileInputRef.current?.click(); }}
                className="aspect-[1.58/1] rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400 bg-white cursor-pointer hover:bg-slate-50 transition"
              >
                Chưa có ảnh mặt sau
              </div>
            )}
          </div>

        </div>

        {/* Footer Next Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Hình ảnh được mã hóa bảo mật đầu-cuối chuẩn AES-256</span>
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!isComplete}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition ${
              isComplete
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                : 'bg-slate-300 cursor-not-allowed shadow-none'
            }`}
          >
            Tiếp Tục: Quét Dữ Liệu OCR Tự Động
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

