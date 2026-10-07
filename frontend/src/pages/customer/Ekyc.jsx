import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { 
  CheckCircle2, UploadCloud, AlertCircle, 
  ShieldCheck, ArrowRight, ArrowLeft,
  FileText, Image as ImageIcon, Trash2,
  User, Check, Sparkles, Building2, Phone, Mail, CreditCard,
  Briefcase
} from 'lucide-react';
import { OCCUPATIONS } from '../../data/loanProducts';

const Ekyc = () => {
  const navigate = useNavigate();
  const { user, updateCurrentUser } = useAuth();

  // Mode: 'manual' (default & recommended) or 'upload_photos'
  const [activeTab, setActiveTab] = useState('manual');

  // Real Uploaded Images (optional device files)
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const frontInputRef = useRef(null);
  const backInputRef = useRef(null);

  // Synchronized Identity Data: initialized directly from registration
  const [formData, setFormData] = useState({
    fullName: user?.fullName ? user.fullName.toUpperCase() : '',
    idNumber: user?.identityCard || '',
    phone: user?.phone || '',
    email: user?.email || '',
    occupation: user?.occupation || 'OTHER',
    dob: '',
    gender: 'Nam',
    nationality: 'Việt Nam',
    hometown: '',
    address: '',
    issueDate: '',
    issuePlace: 'Cục Cảnh sát QLHC về TTXH'
  });

  const [selfCertified, setSelfCertified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Keep synchronized if user context is updated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName.toUpperCase(),
        idNumber: prev.idNumber || user.identityCard || '',
        phone: prev.phone || user.phone || '',
        email: prev.email || user.email || '',
        occupation: prev.occupation || user.occupation || 'OTHER'
      }));
    }

    // Also check if there was a previous draft
    const saved = localStorage.getItem('verifiedEkyc');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsed }));
        if (parsed.frontImageUrl) setFrontImage(parsed.frontImageUrl);
        if (parsed.backImageUrl) setBackImage(parsed.backImageUrl);
      } catch (e) {}
    }
  }, [user]);

  // Handle Front CCCD File Upload
  const handleFrontFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ảnh không được vượt quá 10MB.');
        return;
      }
      const url = URL.createObjectURL(file);
      setFrontImage(url);
      setErrorMsg('');
    }
  };

  // Handle Back CCCD File Upload
  const handleBackFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Ảnh không được vượt quá 10MB.');
        return;
      }
      const url = URL.createObjectURL(file);
      setBackImage(url);
      setErrorMsg('');
    }
  };

  // Handle confirmation and synchronous save
  const handleConfirmAndProceed = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    // Validation
    if (!formData.fullName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }
    if (!formData.idNumber || formData.idNumber.length !== 12) {
      setErrorMsg('Vui lòng nhập đúng 12 chữ số Căn cước công dân (CCCD).');
      return;
    }
    if (!formData.dob) {
      setErrorMsg('Vui lòng nhập Ngày sinh.');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('Vui lòng nhập Nơi thường trú / Địa chỉ cư trú.');
      return;
    }

    setIsSubmitting(true);

    const verifiedPayload = {
      fullName: formData.fullName.trim().toUpperCase(),
      idNumber: formData.idNumber.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      occupation: formData.occupation,
      dob: formData.dob,
      gender: formData.gender,
      nationality: formData.nationality || 'Việt Nam',
      hometown: formData.hometown.trim(),
      address: formData.address.trim(),
      issueDate: formData.issueDate,
      issuePlace: formData.issuePlace,
      frontImageUrl: frontImage,
      backImageUrl: backImage,
      verified: true,
      ekycVerifiedAt: new Date().toISOString()
    };

    // 1. Save unified payload to localStorage
    localStorage.setItem('verifiedEkyc', JSON.stringify(verifiedPayload));

    // 2. Sync to Backend & MongoDB
    try {
      await api.updateProfile({
        fullName: verifiedPayload.fullName,
        identityCard: verifiedPayload.idNumber,
        phone: verifiedPayload.phone,
        occupation: verifiedPayload.occupation
      });

      if (updateCurrentUser) {
        updateCurrentUser({
          fullName: verifiedPayload.fullName,
          identityCard: verifiedPayload.idNumber,
          phone: verifiedPayload.phone,
          occupation: verifiedPayload.occupation
        });
      }

      setSuccessMsg('Xác thực danh tính điện tử thành công! Đang chuyển tiếp...');
      setTimeout(() => {
        navigate('/apply/form');
      }, 500);
    } catch (err) {
      console.warn('Backend sync warning:', err.message);
      // Proceed even if offline so user flow doesn't block
      navigate('/apply/form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOccupationLabel = (code) => {
    const found = OCCUPATIONS.find(o => o.id === code);
    return found ? found.label : 'Lao động tự do';
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 animate-in fade-in duration-500">
      
      {/* Step Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Bước 1 / 4</span>
            <h1 className="text-2xl font-black text-slate-900">Xác Thực Danh Tính Điện Tử (eKYC)</h1>
            <p className="text-xs text-slate-500 mt-1">
              Đồng bộ thông tin đăng ký tài khoản của <strong>{formData.fullName || 'Quý khách'}</strong> vào hồ sơ vay vốn.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Đồng Bộ Tự Động Toàn Hệ Thống
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

      {/* Sync Status Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Thông tin đã liên kết từ tài khoản đăng ký
            </h3>
            <p className="text-xs text-slate-600">
              Họ tên: <strong>{formData.fullName || '---'}</strong> • SĐT: <strong>{formData.phone || '---'}</strong> • Nghề nghiệp: <strong>{getOccupationLabel(formData.occupation)}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'manual' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            Nhập tay & Kiểm tra
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload_photos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'upload_photos' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
          >
            Đính kèm ảnh CCCD
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          {successMsg}
        </div>
      )}

      {/* Main Form Content */}
      <form onSubmit={handleConfirmAndProceed} className="space-y-6">
        
        {/* CARD 1: Identity Information (CCCD Details) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Thông Tin Định Danh Khách Hàng (Tự Nhập & Kiểm Tra)
            </h2>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              Đồng bộ dữ liệu trực tiếp
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            
            {/* Full Name */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Họ và Tên (như trên CCCD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value.toUpperCase() })}
                  placeholder="NGUYỄN VĂN AN"
                  className="input-human w-full font-bold uppercase text-slate-900"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* CCCD Number */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Số Căn cước công dân (12 chữ số) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={12}
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="001099123456"
                  className="input-human w-full font-mono font-bold text-blue-700 tracking-wider"
                  required
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Ngày sinh (DD/MM/YYYY) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                placeholder="15/08/1995"
                className="input-human w-full font-medium"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input-human w-full font-medium bg-white"
                required
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Số điện thoại liên hệ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0901234567"
                  className="input-human w-full font-medium"
                  required
                />
                <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@demo.com"
                  className="input-human w-full font-medium"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {/* Occupation */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Nhóm Nghề Nghiệp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="input-human w-full font-medium bg-white"
                  required
                >
                  {OCCUPATIONS.map(occ => (
                    <option key={occ.id} value={occ.id}>{occ.label}</option>
                  ))}
                </select>
                <Briefcase className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Hometown */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Quê quán / Nguyên quán
              </label>
              <input
                type="text"
                value={formData.hometown}
                onChange={(e) => setFormData({ ...formData, hometown: e.target.value })}
                placeholder="Nam Định, Việt Nam"
                className="input-human w-full font-medium"
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Nơi thường trú / Nơi ở hiện tại (Theo CCCD) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Số 123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh"
                className="input-human w-full font-medium"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Địa chỉ này sẽ được tự động điền làm nơi cư trú hiện tại trong hồ sơ đăng ký vay.
              </p>
            </div>

            {/* Issue Date */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Ngày cấp CCCD
              </label>
              <input
                type="text"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                placeholder="10/05/2021"
                className="input-human w-full font-medium"
              />
            </div>

            {/* Issue Place */}
            <div>
              <label className="text-slate-600 font-bold block mb-1.5 uppercase text-[11px]">
                Nơi cấp CCCD
              </label>
              <input
                type="text"
                value={formData.issuePlace}
                onChange={(e) => setFormData({ ...formData, issuePlace: e.target.value })}
                placeholder="Cục Cảnh sát QLHC về TTXH"
                className="input-human w-full font-medium"
              />
            </div>

          </div>
        </div>

        {/* CARD 2: Optional Device Photo Attachments */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Đính Kèm Ảnh CCCD Từ Thiết Bị (Không Bắt Buộc)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bạn có thể chọn ảnh từ máy tính hoặc điện thoại để lưu trữ chứng thực cùng hồ sơ.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">Tùy chọn</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* Front Image Box */}
            <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-50">
              <span className="text-xs font-bold text-slate-700 mb-2">Mặt trước CCCD</span>
              {frontImage ? (
                <div className="relative w-full aspect-[1.58/1] rounded-xl overflow-hidden border border-slate-300 bg-white mb-3">
                  <img src={frontImage} alt="Mặt trước" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFrontImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => frontInputRef.current?.click()}
                  className="w-full aspect-[1.58/1] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition mb-3"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-600">Chọn ảnh mặt trước</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG (Tối đa 10MB)</span>
                </div>
              )}
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                onChange={handleFrontFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => frontInputRef.current?.click()}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                {frontImage ? 'Đổi ảnh khác' : 'Tải tệp từ máy'}
              </button>
            </div>

            {/* Back Image Box */}
            <div className="border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-slate-50">
              <span className="text-xs font-bold text-slate-700 mb-2">Mặt sau CCCD</span>
              {backImage ? (
                <div className="relative w-full aspect-[1.58/1] rounded-xl overflow-hidden border border-slate-300 bg-white mb-3">
                  <img src={backImage} alt="Mặt sau" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setBackImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => backInputRef.current?.click()}
                  className="w-full aspect-[1.58/1] rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition mb-3"
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-600">Chọn ảnh mặt sau</span>
                  <span className="text-[10px] text-slate-400">JPG, PNG (Tối đa 10MB)</span>
                </div>
              )}
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backInputRef.current?.click()}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                {backImage ? 'Đổi ảnh khác' : 'Tải tệp từ máy'}
              </button>
            </div>

          </div>
        </div>

        {/* Commitment Checkbox */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
          <input
            id="selfCertified"
            type="checkbox"
            checked={selfCertified}
            onChange={(e) => setSelfCertified(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <label htmlFor="selfCertified" className="text-xs text-slate-700 leading-relaxed cursor-pointer select-none">
            <strong>Cam kết tính chính xác:</strong> Tôi xác nhận các thông tin định danh cá nhân trên là hoàn toàn chính xác, trùng khớp với Căn cước công dân của tôi và chịu hoàn toàn trách nhiệm pháp lý trước tổ chức tài chính.
          </label>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full sm:w-auto px-6 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Trang Chủ
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !selfCertified}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition ${
              isSubmitting || !selfCertified
                ? 'bg-slate-400 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang Lưu & Đồng Bộ...
              </>
            ) : (
              <>
                Xác Nhận Định Danh & Tiếp Tục Tạo Hồ Sơ
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default Ekyc;
