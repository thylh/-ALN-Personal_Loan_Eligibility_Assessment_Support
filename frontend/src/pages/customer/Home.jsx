import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LOAN_PRODUCTS, OCCUPATIONS, getRecommendedProducts, formatVND } from '../../data/loanProducts';
import { 
  ShieldCheck, Clock, CheckCircle2, 
  ArrowRight, Sparkles, TrendingUp, HelpCircle, 
  Building2, CreditCard, ChevronRight, Info,
  Smartphone, Award, UserCheck, Shield, Briefcase,
  GraduationCap, Store, Laptop, User, Filter, Check
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Selected occupation filter for recommendations
  // Prioritize user's stored occupation or location state from registration
  const initialOccupation = location.state?.occupation || user?.occupation || 'ALL';
  const [selectedOccupation, setSelectedOccupation] = useState(initialOccupation);
  const [products, setProducts] = useState(LOAN_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Sync if user login state changes
  useEffect(() => {
    if (user?.occupation && selectedOccupation === 'ALL') {
      setSelectedOccupation(user.occupation);
    }
  }, [user]);

  // Dynamic fetch products according to chosen segmentation filter
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await api.getLoanProducts(selectedOccupation);
        if (res && res.success && res.products && isMounted) {
          setProducts(res.products);
        } else if (isMounted) {
          setProducts(getRecommendedProducts(selectedOccupation));
        }
      } catch (err) {
        console.warn('Failed to fetch dynamic loan products, using catalog fallback:', err.message);
        if (isMounted) {
          setProducts(getRecommendedProducts(selectedOccupation));
        }
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    loadProducts();
    return () => { isMounted = false; };
  }, [selectedOccupation]);

  // Current active user occupation label
  const currentUserOccupationLabel = OCCUPATIONS.find(o => o.id === (user?.occupation || location.state?.occupation))?.label;

  const handleSelectProduct = (productId) => {
    navigate(`/loan-products/${productId}`);
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      
      {/* 1. HERO BANNER (Clean, Modern, No Misleading Calculator Widget) */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 sm:p-14 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            Nền Tảng Thẩm Định Tín Dụng LOMS 2026
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
            Vay Vốn Trực Tuyến <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Phê Duyệt Siêu Tốc 5 Phút
            </span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl font-normal">
            Định danh eKYC hiện đại, mô hình chấm điểm tín dụng AI tự động. Hệ thống gợi ý chính xác gói vay phù hợp với ngành nghề và nguồn thu nhập của bạn.
          </p>

          {/* 4 Golden Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-3xl">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-blue-400">0.75%</div>
              <div className="text-xs text-slate-400 mt-1">Lãi suất từ / tháng</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">5 Phút</div>
              <div className="text-xs text-slate-400 mt-1">Thời gian xét duyệt</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">500 Triệu</div>
              <div className="text-xs text-slate-400 mt-1">Hạn mức tối đa</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-2xl sm:text-3xl font-black text-sky-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">Thao tác Online 24/7</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a 
              href="#products"
              className="btn-primary text-base font-bold py-3.5 px-8 rounded-xl flex items-center gap-2.5 shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition"
            >
              Khám phá gói vay theo nghề nghiệp
              <ArrowRight className="w-5 h-5" />
            </a>

            {!user ? (
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition backdrop-blur-sm flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4 text-blue-400" />
                Đăng ký tài khoản nhận gợi ý
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/15 transition backdrop-blur-sm flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Vào Dashboard Quản Lý Khoản Vay
              </Link>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Bảo mật mã hóa 256-bit</span>
            <span className="flex items-center gap-1.5"><UserCheck className="w-4 h-4 text-sky-400" /> Không giữ giấy tờ gốc</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-amber-400" /> Giấy phép NHNN cấp</span>
          </div>

        </div>
      </section>

      {/* 2. PERSONALIZED RECOMMENDATION BANNER (KHI ĐÃ ĐĂNG NHẬP / VỪA ĐĂNG KÝ) */}
      {(user || location.state?.justRegistered) && (
        <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg animate-in slide-in-from-top-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Đề Xuất Cá Nhân Hóa Thông Minh
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Gói Vay Ưu Đãi Cho: {currentUserOccupationLabel || 'Khách Hàng Thân Thiết'}
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Dựa trên thông tin nghề nghiệp bạn đã đăng ký, hệ thống đã tự động lọc các gói vay có hạn mức phù hợp nhất, lãi suất giảm tối đa và hồ sơ thẩm định đơn giản nhất.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setSelectedOccupation(user?.occupation || 'ALL')}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              Xem gói ưu tiên cho bạn
            </button>
            <button
              type="button"
              onClick={() => setSelectedOccupation('ALL')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition"
            >
              Xem tất cả gói vay
            </button>
          </div>
        </section>
      )}

      {/* 3. LOAN PRODUCTS SECTION (CÁC GÓI VAY ĐỀ XUẤT) */}
      <section id="products" className="space-y-8 scroll-mt-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <CreditCard className="w-3.5 h-3.5" /> Danh Mục Gói Vay Tối Ưu
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Gói Vay Đề Xuất Theo Phân Loại Nghề Nghiệp
          </h2>
          <p className="text-slate-600 text-sm">
            Chọn nhóm nghề nghiệp của bạn để khám phá gói vay được thiết kế riêng với biểu phí và hạn mức tối ưu. Bấm vào từng gói để xem chi tiết và kéo bảng dự toán trực tiếp.
          </p>
        </div>

        {/* Occupation Segment Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedOccupation('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${selectedOccupation === 'ALL' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Filter className="w-3.5 h-3.5" /> Tất cả ({LOAN_PRODUCTS.length})
          </button>

          {OCCUPATIONS.map((occ) => {
            const isTarget = (user?.occupation === occ.id);
            const isSelected = selectedOccupation === occ.id;
            return (
              <button
                key={occ.id}
                type="button"
                onClick={() => setSelectedOccupation(occ.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${isSelected ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'}`}
              >
                {occ.label}
                {isTarget && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-amber-400 text-slate-900' : 'bg-blue-100 text-blue-700'}`}>
                    Của bạn
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Products Grid */}
        {loadingProducts ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 text-xs">Đang tải danh sách gói vay...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => {
              const isRecommended = selectedOccupation !== 'ALL' && p.targetOccupations.includes(selectedOccupation);
              
              return (
                <div 
                  key={p.id}
                  onClick={() => handleSelectProduct(p.id)}
                  className={`bg-white rounded-3xl border p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-500 transition-all cursor-pointer group relative overflow-hidden ${isRecommended ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'}`}
                >
                  {/* Recommended Ribbon */}
                  {isRecommended && (
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Phù hợp nhất với bạn
                    </div>
                  )}

                  <div>
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {p.badge}
                      </span>
                      <span className="text-xs font-black text-emerald-600 ml-auto">
                        {p.interestRate}% / tháng
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition mb-1 leading-snug">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {p.subtitle || p.desc}
                    </p>

                    {/* Numeric Highlights Box */}
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Hạn mức vay:</span>
                        <strong className="font-bold text-slate-900">{formatVND(p.maxAmount)}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Kỳ hạn vay:</span>
                        <strong className="font-bold text-slate-900">{p.minTerm} - {p.maxTerm} tháng</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Cách tính lãi:</span>
                        <span className="font-semibold text-blue-700">
                          {p.calcMethod === 'reducing' ? 'Dư nợ giảm dần' : 'Gốc đều'}
                        </span>
                      </div>
                    </div>

                    {/* Benefits Bullets */}
                    <div className="space-y-2 mb-6">
                      {(p.benefits || []).slice(0, 3).map((b, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="font-medium line-clamp-1">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTA button leading to Loan Detail & Calculator */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleSelectProduct(p.id); }}
                      className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Xem chi tiết & Dự toán</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* 4. HOW IT WORKS - 4 SIMPLE STEPS */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Quy Trình Rõ Ràng & Minh Bạch</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            4 Bước Đơn Giản Nhận Tiền Vay
          </h2>
          <p className="text-slate-600 text-sm">
            Thao tác hoàn toàn trên điện thoại hoặc máy tính, giải ngân tự động không cần gặp mặt.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Chọn Gói & Dự Toán',
              desc: 'Chọn gói vay phù hợp theo nghề nghiệp, kéo chỉnh số tiền và kỳ hạn để biết chính xác tiền gốc lãi hàng tháng.'
            },
            {
              step: '02',
              title: 'Đăng Ký & eKYC',
              desc: 'Đăng ký tài khoản, chụp ảnh CCCD 2 mặt và quét khuôn mặt sinh trắc học trực tuyến trong 2 phút.'
            },
            {
              step: '03',
              title: 'Điền Hồ Sơ & Thẩm Định',
              desc: 'Kê khai thông tin việc làm và tải chứng từ thu nhập. Hệ thống AI kết hợp thẩm định viên xét duyệt tự động.'
            },
            {
              step: '04',
              title: 'Ký Hợp Đồng & Giải Ngân',
              desc: 'Ký hợp đồng điện tử qua OTP SMS. Tiền được chuyển thẳng vào tài khoản ngân hàng của bạn ngay lập tức.'
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group hover:bg-blue-50/50 hover:border-blue-200 transition">
              <span className="text-3xl font-black text-blue-200 group-hover:text-blue-500 transition block mb-3">
                {item.step}
              </span>
              <h3 className="font-bold text-base text-slate-900 mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. NAPAS & INTERBANK PARTNERS */}
      <section className="bg-slate-100/70 rounded-3xl p-8 border border-slate-200/80 text-center space-y-6">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Liên kết giải ngân & thanh toán liên ngân hàng qua hệ thống NAPAS 247
        </p>
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
          {['Vietcombank', 'MB Bank', 'Techcombank', 'BIDV', 'VPBank', 'ACB', 'TPBank', 'VietinBank'].map((bank, i) => (
            <div key={i} className="px-4 py-2 bg-white rounded-lg border border-slate-200 font-bold text-xs text-slate-700 shadow-sm">
              {bank}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
