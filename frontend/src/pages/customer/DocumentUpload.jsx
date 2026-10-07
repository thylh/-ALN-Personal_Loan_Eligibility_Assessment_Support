import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, FileText, CheckCircle2, AlertCircle, 
  Trash2, Eye, ShieldCheck, ArrowRight, ArrowLeft, 
  Sparkles, FileCheck, X, ZoomIn, ZoomOut, Check
} from 'lucide-react';

const INITIAL_DOCUMENTS = [
  {
    id: 'doc_cccd',
    category: 'cccd',
    title: 'Căn cước công dân gắn chip (Đã xác thực eKYC)',
    required: true,
    status: 'completed',
    fileName: 'CCCD_Xac_Thuc_eKYC.png',
    fileSize: '1.2 MB',
    uploadedAt: 'Vừa hoàn tất',
    isEkycInherited: true,
    fileUrl: null
  }
];

const DocumentUpload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [selectedCategory, setSelectedCategory] = useState('income_statement');
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selfCertified, setSelfCertified] = useState(false);

  // Sync with real verified eKYC
  useEffect(() => {
    const saved = localStorage.getItem('verifiedEkyc');
    if (saved) {
      try {
        const verified = JSON.parse(saved);
        setDocuments([
          {
            id: 'doc_cccd',
            category: 'cccd',
            title: `Căn cước công dân gắn chip (${verified.fullName || 'Khách hàng'})`,
            required: true,
            status: 'completed',
            fileName: `CCCD_${verified.idNumber || 'DinhDanh'}.png`,
            fileSize: '1.2 MB',
            uploadedAt: 'Đã xác thực eKYC',
            isEkycInherited: true,
            fileUrl: verified.frontImageUrl || null
          }
        ]);
      } catch (e) {}
    }
  }, []);

  // Modal for preview
  const [previewDoc, setPreviewDoc] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Check requirements
  const hasIncomeProof = documents.some(d => d.category === 'income_statement');
  const hasLaborContract = documents.some(d => d.category === 'labor_contract');
  const isReadyToSubmit = (hasIncomeProof && hasLaborContract) || selfCertified;

  // Handle file upload
  const processUploadedFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    // Check size <= 10MB
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMsg('Dung lượng tệp vượt quá 10MB. Vui lòng nén hoặc chọn tệp nhỏ hơn.');
      return;
    }

    // Check type (jpg, png, pdf)
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
      setErrorMsg('Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPG, PNG hoặc PDF.');
      return;
    }

    // Progress simulation
    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc = {
              id: 'doc_' + Date.now(),
              category: selectedCategory,
              title: selectedCategory === 'income_statement' 
                ? 'Sao kê lương ngân hàng' 
                : selectedCategory === 'labor_contract' 
                ? 'Hợp đồng lao động' 
                : 'Giấy tờ tiện ích bổ sung',
              required: selectedCategory !== 'utility_bill',
              status: 'completed',
              fileName: file.name,
              fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
              uploadedAt: 'Vừa xong',
              isEkycInherited: false,
              fileUrl: file.type.includes('image') ? URL.createObjectURL(file) : null
            };
            setDocuments(curr => [...curr.filter(d => d.category !== selectedCategory), newDoc]);
            setUploadProgress(null);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleRemoveDoc = (id) => {
    setDocuments(curr => curr.filter(d => d.id !== id));
  };

  const handleProceedToContract = () => {
    if (!isReadyToSubmit) {
      setErrorMsg('Vui lòng tải lên chứng từ thu nhập hoặc tích chọn cam kết tự khai báo để tiếp tục.');
      return;
    }
    // Save document state
    localStorage.setItem('uploadedLoanDocuments', JSON.stringify(documents));
    navigate('/apply/contract');
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500">
      
      {/* Header & Step progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Bước 3 / 4</span>
            <h1 className="text-2xl font-black text-slate-900">Tải Lên Chứng Từ Thẩm Định (Document Upload)</h1>
            <p className="text-xs text-slate-500 mt-1">Tải ảnh hoặc tệp PDF chứng từ thu nhập trực tiếp từ máy tính/điện thoại của bạn.</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          <div className="h-2 rounded-full bg-blue-600"></div>
          <div className="h-2 rounded-full bg-blue-600"></div>
          <div className="h-2 rounded-full bg-blue-600"></div>
          <div className="h-2 rounded-full bg-slate-200"></div>
        </div>
        <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1.5">
          <span className="text-emerald-600 font-bold">1. eKYC ✓</span>
          <span className="text-emerald-600 font-bold">2. Tạo hồ sơ vay ✓</span>
          <span className="text-blue-600 font-bold">3. Tải chứng từ</span>
          <span>4. Ký hợp đồng</span>
        </div>
      </div>

      {/* Alert banner */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Upload Dropzone & Category Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Chọn loại chứng từ cần tải lên
              </label>
              
              <div className="grid sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('income_statement')}
                  className={`p-3 rounded-2xl border text-left transition ${selectedCategory === 'income_statement' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <div className="text-xs">Sao kê lương *</div>
                  <div className="text-[10px] text-slate-500 font-normal">Bắt buộc (3 tháng)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('labor_contract')}
                  className={`p-3 rounded-2xl border text-left transition ${selectedCategory === 'labor_contract' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <div className="text-xs">Hợp đồng LĐ *</div>
                  <div className="text-[10px] text-slate-500 font-normal">Hoặc quyết định</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('utility_bill')}
                  className={`p-3 rounded-2xl border text-left transition ${selectedCategory === 'utility_bill' ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <div className="text-xs">Hóa đơn điện/nước</div>
                  <div className="text-[10px] text-slate-500 font-normal">Tăng hạn mức</div>
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50/70 scale-[0.99]' 
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shadow-inner">
                <UploadCloud className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Kéo thả tệp vào đây hoặc <span className="text-blue-600 underline">bấm để chọn</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ định dạng PDF, JPG, PNG (Tối đa 10MB / file)
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Mã hóa SSL</span>
                <span>•</span>
                <span>Bảo mật dữ liệu tuyệt đối</span>
              </div>
            </div>

            {/* Uploading Progress Indicator */}
            {uploadProgress !== null && (
              <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-2xl animate-in fade-in">
                <div className="flex justify-between text-xs font-bold text-blue-800">
                  <span>Đang tải lên tài liệu...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Guidelines notes */}
          <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" /> Hướng dẫn chứng từ hợp lệ:
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li><strong>Sao kê lương:</strong> Hiển thị rõ dòng tiền chi lương hàng tháng từ người sử dụng lao động, dấu giáp lai hoặc mã QR xác thực của ngân hàng.</li>
              <li><strong>Hợp đồng lao động:</strong> Còn hiệu lực tối thiểu 03 tháng, có chữ ký đại diện doanh nghiệp và mộc tròn pháp lý.</li>
            </ul>
          </div>

        </div>

        {/* Right: Uploaded Documents List & Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                Danh mục tài liệu đã đính kèm ({documents.length})
              </h3>
              <span className="text-[10px] font-semibold text-slate-400">
                {isReadyToSubmit ? 'Đủ điều kiện ✓' : 'Còn thiếu chứng từ'}
              </span>
            </div>

            {/* List of uploaded items */}
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-sm">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 truncate block">
                          {doc.title}
                        </span>
                        {doc.isEkycInherited && (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                            eKYC
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="truncate max-w-[120px] font-mono">{doc.fileName}</span>
                        <span>•</span>
                        <span>{doc.fileSize}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition"
                      title="Xem trước"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!doc.isEkycInherited && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"
                        title="Xóa tệp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wide">
                Điều kiện nộp hồ sơ xét duyệt:
              </span>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-600">1. CCCD gắn chip (2 mặt):</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">2. Sao kê tài khoản nhận lương:</span>
                <span className={`font-bold flex items-center gap-1 ${hasIncomeProof ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {hasIncomeProof ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                  {hasIncomeProof ? 'Đã tải lên' : 'Chưa có *'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600">3. Hợp đồng lao động:</span>
                <span className={`font-bold flex items-center gap-1 ${hasLaborContract ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {hasLaborContract ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                  {hasLaborContract ? 'Đã tải lên' : 'Chưa có *'}
                </span>
              </div>
            </div>

            {/* Self-declaration option for users with manual entered financial data */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs flex items-start gap-2.5">
              <input 
                type="checkbox" 
                id="selfCert" 
                checked={selfCertified} 
                onChange={(e) => setSelfCertified(e.target.checked)} 
                className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5"
              />
              <label htmlFor="selfCert" className="text-amber-900 font-medium cursor-pointer text-[11px] leading-relaxed">
                Tôi xác nhận thông tin nghề nghiệp và thu nhập tự nhập ở Bước 2 là chính xác. Cho phép tiếp tục chuyển sang bước Ký hợp đồng.
              </label>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleProceedToContract}
                disabled={!isReadyToSubmit}
                className={`w-full py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition ${
                  isReadyToSubmit
                    ? 'btn-primary shadow-blue-500/25'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                Tiếp tục & Ký hợp đồng điện tử
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/apply/form')}
                className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại chỉnh sửa thông tin
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
            
            <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{previewDoc.title}</h4>
                <p className="text-[11px] text-slate-500 font-mono">{previewDoc.fileName} • {previewDoc.fileSize}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel(curr => Math.min(curr + 0.25, 2))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                  title="Phóng to"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(curr => Math.max(curr - 0.25, 0.75))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setPreviewDoc(null); setZoomLevel(1); }}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-auto bg-slate-100 flex items-center justify-center min-h-[350px]">
              {previewDoc.fileUrl ? (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md transition-transform"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md">
                  <FileText className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                  <h5 className="font-bold text-sm text-slate-800">{previewDoc.fileName}</h5>
                  <p className="text-xs text-slate-500 mt-1">
                    Tài liệu PDF điện tử đã được xác thực mã hóa an toàn trên hệ thống LOMS.
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 px-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">Trạng thái: <strong>Đã mã hóa và bảo mật</strong></span>
              <button
                type="button"
                onClick={() => { setPreviewDoc(null); setZoomLevel(1); }}
                className="btn-primary py-1.5 px-4 rounded-xl text-xs font-bold"
              >
                Đóng xem trước
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentUpload;
