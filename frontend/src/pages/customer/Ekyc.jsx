import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, CheckCircle2, UserCircle, UploadCloud, AlertCircle, 
  RefreshCw, Scan, ShieldCheck, Check, ArrowRight, Eye, 
  Sparkles, AlertTriangle, FileText, CornerRightDown
} from 'lucide-react';

const SAMPLE_OCR_DATA = {
  fullName: 'NGUYỄN VĂN AN',
  idNumber: '001099123456',
  dob: '15/08/1995',
  gender: 'Nam',
  nationality: 'Việt Nam',
  hometown: 'Tiền Hải, Thái Bình',
  address: 'Số 45 ngõ 120 đường Hoàng Quốc Việt, Phường Cổ Nhuế 1, Quận Bắc Từ Liêm, TP. Hà Nội',
  issueDate: '20/05/2021',
  expiryDate: '15/08/2035'
};

const Ekyc = () => {
  const navigate = useNavigate();

  // eKYC Steps:
  // 1: CCCD Front
  // 2: CCCD Back
  // 3: Facial Liveness Detection
  // 4: AI Analysis & Face Matching
  // 5: OCR Data Verification & Confirmation
  const [subStep, setSubStep] = useState(1);

  // Uploaded/Captured Image States
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [faceImage, setFaceImage] = useState(null);

  // Liveness progress and action guides
  const [livenessStage, setLivenessStage] = useState(0); // 0: Look straight, 1: Turn left, 2: Smile
  const [livenessProgress, setLivenessProgress] = useState(0);

  // AI Matching metrics
  const [matchScore, setMatchScore] = useState(97.8);
  const [isProcessing, setIsProcessing] = useState(false);

  // Editable confirmed data
  const [ocrData, setOcrData] = useState(SAMPLE_OCR_DATA);

  // Auto trigger liveness progress when on subStep 3
  useEffect(() => {
    let interval;
    if (subStep === 3) {
      setLivenessStage(0);
      setLivenessProgress(10);
      
      const t1 = setTimeout(() => {
        setLivenessStage(1); // Turn head left
        setLivenessProgress(55);
      }, 1500);

      const t2 = setTimeout(() => {
        setLivenessStage(2); // Smile
        setLivenessProgress(85);
      }, 3000);

      const t3 = setTimeout(() => {
        setLivenessProgress(100);
        setFaceImage('captured_face_portrait.jpg');
        setSubStep(4); // Move to AI analysis
      }, 4500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [subStep]);

  // AI Analysis auto-completion
  useEffect(() => {
    if (subStep === 4) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        setIsProcessing(false);
        setSubStep(5); // Move to OCR Confirmation
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [subStep]);

  // Fast-fill sample card for front
  const useSampleFrontCard = () => {
    setFrontImage('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80');
    setTimeout(() => setSubStep(2), 400);
  };

  // Fast-fill sample card for back
  const useSampleBackCard = () => {
    setBackImage('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80');
    setTimeout(() => setSubStep(3), 400);
  };

  // Handle confirmation and proceed to Loan Form
  const handleConfirmOcr = () => {
    // Save to local storage for the next page to prefill
    localStorage.setItem('verifiedEkyc', JSON.stringify({
      ...ocrData,
      matchScore,
      ekycVerifiedAt: new Date().toISOString()
    }));
    navigate('/apply/form');
  };

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500">
      
      {/* Step Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Bước 1 / 4</span>
            <h1 className="text-2xl font-black text-slate-900">Xác Thực Danh Tính Điện Tử (eKYC)</h1>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            AI Chống Giả Mạo Chuẩn FIDO
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          <div className="h-2 rounded-full bg-blue-600"></div>
          <div className="h-2 rounded-full bg-slate-200"></div>
          <div className="h-2 rounded-full bg-slate-200"></div>
          <div className="h-2 rounded-full bg-slate-200"></div>
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1.5">
          <span className="text-blue-600 font-bold">1. Định danh eKYC</span>
          <span>2. Tạo hồ sơ vay</span>
          <span>3. Tải chứng từ</span>
          <span>4. Ký hợp đồng</span>
        </div>
      </div>

      {/* Main Stepper Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Sub-step indicator bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              {subStep}
            </span>
            <span className="text-slate-800">
              {subStep === 1 && 'Chụp mặt trước Căn cước công dân (CCCD)'}
              {subStep === 2 && 'Chụp mặt sau Căn cước công dân (CCCD)'}
              {subStep === 3 && 'Quét nhận diện gương mặt sống (Facial Liveness)'}
              {subStep === 4 && 'Trí tuệ nhân tạo đối soát dữ liệu (Face Matching & OCR)'}
              {subStep === 5 && 'Xác nhận thông tin trích xuất OCR'}
            </span>
          </div>
          <span className="text-slate-400 text-[11px]">Tiến trình: {subStep * 20}%</span>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* SUB-STEP 1: CCCD FRONT */}
          {subStep === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex gap-3 text-blue-900 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Yêu cầu chụp mặt trước CCCD gắn chip:</strong>
                  Đặt thẻ nằm trọn trong khung chữ nhật, đủ ánh sáng, không bị lóa đèn flash, không mất 4 góc và không che tay lên thông tin.
                </div>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative mx-auto max-w-md aspect-[1.58/1] rounded-2xl border-2 border-dashed border-blue-400 bg-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-inner text-white p-6">
                
                {/* 4 Corner Markers */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blue-400"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-blue-400"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-blue-400"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-blue-400"></div>

                <div className="text-center space-y-3 z-10">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto border border-white/20">
                    <Camera className="w-7 h-7 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Đặt mặt trước CCCD vào khung</h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">Đảm bảo rõ quốc huy và ảnh chân dung</p>
                  </div>
                </div>

                <div className="absolute bottom-2 text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                  LOMS Security Encrypted Viewfinder
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={useSampleFrontCard}
                  className="flex-1 btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Camera className="w-4 h-4" /> Chụp ảnh / Tải ảnh mặt trước
                </button>
                <button
                  type="button"
                  onClick={useSampleFrontCard}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Dùng CCCD mẫu kiểm thử
                </button>
              </div>
            </div>
          )}

          {/* SUB-STEP 2: CCCD BACK */}
          {subStep === 2 && (
            <div className="space-y-6">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex gap-3 text-blue-900 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Yêu cầu chụp mặt sau CCCD gắn chip:</strong>
                  Đảm bảo thấy rõ chip điện tử, mã vạch MRZ và dấu vân tay. Không dán băng dính hoặc vật cản lên dải mã từ.
                </div>
              </div>

              {/* Viewfinder Frame */}
              <div className="relative mx-auto max-w-md aspect-[1.58/1] rounded-2xl border-2 border-dashed border-emerald-400 bg-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-inner text-white p-6">
                
                {/* 4 Corner Markers */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400"></div>
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400"></div>
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400"></div>
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400"></div>

                <div className="text-center space-y-3 z-10">
                  <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto border border-white/20">
                    <Scan className="w-7 h-7 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Đặt mặt sau CCCD vào khung</h3>
                    <p className="text-[11px] text-slate-300 mt-0.5">Giữ thẳng chip điện tử và dải mã vạch MRZ</p>
                  </div>
                </div>

                <div className="absolute bottom-2 text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                  MRZ / Chip Verification Ready
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubStep(1)}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Quay lại mặt trước
                </button>
                <button
                  type="button"
                  onClick={useSampleBackCard}
                  className="flex-1 btn-primary py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <Camera className="w-4 h-4" /> Chụp ảnh / Tải ảnh mặt sau
                </button>
                <button
                  type="button"
                  onClick={useSampleBackCard}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Dùng mẫu mặt sau
                </button>
              </div>
            </div>
          )}

          {/* SUB-STEP 3: FACIAL LIVENESS DETECTION */}
          {subStep === 3 && (
            <div className="space-y-6 text-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Quét Nhận Diện Khuôn Mặt (Liveness)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Vui lòng không đeo kính râm, khẩu trang hoặc mũ. Giữ thiết bị ngang tầm mắt.
                </p>
              </div>

              {/* Oval Camera Viewfinder */}
              <div className="relative mx-auto w-56 h-72 rounded-[50%] border-4 border-blue-500 bg-slate-900 overflow-hidden shadow-2xl flex flex-col items-center justify-center text-white">
                
                {/* Rotating scanner ring */}
                <div className="absolute inset-0 rounded-[50%] border-4 border-dashed border-sky-300/40 animate-spin"></div>

                <UserCircle className="w-28 h-28 text-slate-400 opacity-60" />

                {/* Live Stage Instruction Prompt */}
                <div className="absolute bottom-4 inset-x-2 bg-black/60 backdrop-blur-md rounded-xl py-2 px-3 text-center border border-white/10">
                  <span className="text-[11px] font-bold text-amber-300 block">
                    {livenessStage === 0 && '1. Nhìn thẳng vào camera'}
                    {livenessStage === 1 && '2. Nghiêng đầu nhẹ sang TRÁI'}
                    {livenessStage === 2 && '3. Giữ nguyên & Mỉm cười nhẹ'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-xs mx-auto space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Tiến trình quét</span>
                  <span className="text-blue-600">{livenessProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${livenessProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 max-w-sm mx-auto flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                <span>Hệ thống đang tự động phân tích cử động khuôn mặt...</span>
              </div>
            </div>
          )}

          {/* SUB-STEP 4: AI PROCESSING & FACE MATCHING */}
          {subStep === 4 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-bold text-slate-900">AI Đang Phân Tích & Đối Khớp Dữ Liệu</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Công nghệ OCR đang bóc tách ký tự và so sánh tỷ lệ tương đồng sinh trắc học giữa ảnh thẻ CCCD và khuôn mặt người thật...
                </p>
              </div>

              {/* AI Checklist simulation */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full max-w-md text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Kiểm tra dấu mộc & Quốc huy
                  </span>
                  <span className="font-bold">HỢP LỆ</span>
                </div>
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chống giả mạo sinh trắc (Anti-spoofing)
                  </span>
                  <span className="font-bold">ĐẠT (PASS)</span>
                </div>
                <div className="flex items-center justify-between text-blue-700">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" /> So khớp khuôn mặt (Face Matching)
                  </span>
                  <span className="font-bold">97.8% (≥ 80%)</span>
                </div>
              </div>
            </div>
          )}

          {/* SUB-STEP 5: OCR CONFIRMATION SCREEN */}
          {subStep === 5 && (
            <div className="space-y-6">
              
              {/* Success Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-sm">Xác thực eKYC thành công</h3>
                    <p className="text-xs text-emerald-700">
                      Tỷ lệ khớp khuôn mặt sinh trắc học: <strong className="font-bold">{matchScore}%</strong> (Đạt yêu cầu &gt;= 80%)
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 shadow-sm">
                  Đã Định Danh
                </span>
              </div>

              {/* Extracted OCR Information Table */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Thông tin trích xuất tự động từ CCCD (OCR)
                  </h4>
                  <span className="text-[11px] text-slate-400 italic">Kiểm tra kỹ trước khi xác nhận</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Họ và Tên
                    </label>
                    <input
                      type="text"
                      value={ocrData.fullName}
                      onChange={(e) => setOcrData({...ocrData, fullName: e.target.value.toUpperCase()})}
                      className="input-human w-full font-bold text-slate-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Số CCCD (12 chữ số)
                    </label>
                    <input
                      type="text"
                      value={ocrData.idNumber}
                      onChange={(e) => setOcrData({...ocrData, idNumber: e.target.value})}
                      className="input-human w-full font-mono font-bold text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="text"
                      value={ocrData.dob}
                      onChange={(e) => setOcrData({...ocrData, dob: e.target.value})}
                      className="input-human w-full font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Giới tính
                    </label>
                    <select
                      value={ocrData.gender}
                      onChange={(e) => setOcrData({...ocrData, gender: e.target.value})}
                      className="input-human w-full font-medium"
                    >
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Quê quán
                    </label>
                    <input
                      type="text"
                      value={ocrData.hometown}
                      onChange={(e) => setOcrData({...ocrData, hometown: e.target.value})}
                      className="input-human w-full font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Ngày cấp
                    </label>
                    <input
                      type="text"
                      value={ocrData.issueDate}
                      onChange={(e) => setOcrData({...ocrData, issueDate: e.target.value})}
                      className="input-human w-full font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-slate-500 font-semibold uppercase text-[10px] block mb-1">
                      Nơi thường trú (theo sổ hộ khẩu)
                    </label>
                    <input
                      type="text"
                      value={ocrData.address}
                      onChange={(e) => setOcrData({...ocrData, address: e.target.value})}
                      className="input-human w-full font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Các trường dữ liệu định danh trên sẽ được khóa cố định tại Bước 2 (Tạo hồ sơ vay) nhằm đảm bảo tính pháp lý và chống giả mạo hồ sơ.
                </span>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubStep(1)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                >
                  Chụp lại từ đầu
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOcr}
                  className="w-full sm:w-auto btn-primary py-3 px-8 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  Xác nhận & Đi tới Tạo hồ sơ vay
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Ekyc;
