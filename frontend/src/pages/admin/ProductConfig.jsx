import React, { useState } from 'react';
import { 
  CreditCard, Plus, Edit, Trash2, CheckCircle2, 
  Sliders, DollarSign, Clock, ShieldCheck, X, Check, Save
} from 'lucide-react';

const INITIAL_PRODUCTS = [
  {
    id: 'PROD_SALARY',
    name: 'Vay Tín Chấp Theo Lương',
    minAmount: 10000000,
    maxAmount: 200000000,
    minTerm: 6,
    maxTerm: 36,
    interestRate: 0.85,
    rateType: 'FIXED',
    calcMethod: 'REDUCING', // Dư nợ giảm dần
    isActive: true,
    requiresIncomeProof: true
  },
  {
    id: 'PROD_BUSINESS',
    name: 'Vay Hộ Kinh Doanh & Tiểu Thương',
    minAmount: 20000000,
    maxAmount: 500000000,
    minTerm: 12,
    maxTerm: 48,
    interestRate: 0.95,
    rateType: 'FIXED',
    calcMethod: 'REDUCING',
    isActive: true,
    requiresIncomeProof: true
  },
  {
    id: 'PROD_UTILITY',
    name: 'Vay Theo Hóa Đơn & Bảo Hiểm',
    minAmount: 10000000,
    maxAmount: 70000000,
    minTerm: 3,
    maxTerm: 24,
    interestRate: 1.05,
    rateType: 'FIXED',
    calcMethod: 'FLAT', // Gốc đều
    isActive: true,
    requiresIncomeProof: false
  },
  {
    id: 'PROD_STARTER',
    name: 'Vay Sinh Viên & Người Đi Làm Mới',
    minAmount: 5000000,
    maxAmount: 30000000,
    minTerm: 3,
    maxTerm: 12,
    interestRate: 0.75,
    rateType: 'FIXED',
    calcMethod: 'REDUCING',
    isActive: true,
    requiresIncomeProof: false
  }
];

const ProductConfig = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState('');

  const formatCurrency = (val) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(val);

  const handleToggleActive = (id) => {
    setProducts(curr => curr.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct.isNew) {
      setProducts([...products, { ...editingProduct, isNew: false }]);
    } else {
      setProducts(curr => curr.map(p => p.id === editingProduct.id ? editingProduct : p));
    }
    setEditingProduct(null);
    setSaveSuccess('Lưu cấu hình sản phẩm vay thành công! Hệ thống sẽ cập nhật realtime lên App khách hàng.');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Cấu Hình Sản Phẩm Vay (Product Engine)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Thiết lập hạn mức, kỳ hạn, lãi suất và công thức tính. Các thông số sẽ được tự động hiển thị trên App Khách hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEditingProduct({
            id: 'PROD_' + Date.now().toString().slice(-4),
            name: '',
            minAmount: 10000000,
            maxAmount: 100000000,
            minTerm: 6,
            maxTerm: 24,
            interestRate: 0.99,
            rateType: 'FIXED',
            calcMethod: 'REDUCING',
            isActive: true,
            requiresIncomeProof: true,
            isNew: true
          })}
          className="btn-primary py-2.5 px-5 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md"
        >
          <Plus className="w-4 h-4" /> Thêm gói vay mới
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">{saveSuccess}</span>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                  {p.id}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {p.isActive ? 'Đang mở bán' : 'Tạm dừng'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(p.id)}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    {p.isActive ? 'Tắt' : 'Bật'}
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">{p.name}</h3>

              {/* Specs Box */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Hạn mức cho vay</span>
                  <strong className="text-slate-800 text-xs">
                    {formatCurrency(p.minAmount)} - {formatCurrency(p.maxAmount)}
                  </strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Kỳ hạn vay</span>
                  <strong className="text-slate-800 text-xs">
                    {p.minTerm} - {p.maxTerm} tháng
                  </strong>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Lãi suất cơ sở</span>
                  <strong className="text-blue-600 text-sm">{p.interestRate}% / tháng</strong>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Công thức tính</span>
                  <strong className="text-slate-800 text-xs">
                    {p.calcMethod === 'REDUCING' ? 'Dư nợ giảm dần' : 'Gốc đều (Flat EMI)'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingProduct(p)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Edit className="w-3.5 h-3.5" /> Chỉnh sửa cấu hình
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / CREATE PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct.isNew ? 'Thêm Mới Gói Sản Phẩm Vay' : `Chỉnh Sửa Gói Vay: ${editingProduct.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên gói sản phẩm</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  placeholder="Ví dụ: Vay Tín Chấp Hưu Trí"
                  className="input-human w-full font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số tiền tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={editingProduct.minAmount}
                    onChange={(e) => setEditingProduct({...editingProduct, minAmount: Number(e.target.value)})}
                    className="input-human w-full font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số tiền tối đa (VNĐ)</label>
                  <input
                    type="number"
                    step="1000000"
                    value={editingProduct.maxAmount}
                    onChange={(e) => setEditingProduct({...editingProduct, maxAmount: Number(e.target.value)})}
                    className="input-human w-full font-semibold text-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kỳ hạn tối thiểu (tháng)</label>
                  <input
                    type="number"
                    value={editingProduct.minTerm}
                    onChange={(e) => setEditingProduct({...editingProduct, minTerm: Number(e.target.value)})}
                    className="input-human w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kỳ hạn tối đa (tháng)</label>
                  <input
                    type="number"
                    value={editingProduct.maxTerm}
                    onChange={(e) => setEditingProduct({...editingProduct, maxTerm: Number(e.target.value)})}
                    className="input-human w-full font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lãi suất (% / tháng)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editingProduct.interestRate}
                    onChange={(e) => setEditingProduct({...editingProduct, interestRate: Number(e.target.value)})}
                    className="input-human w-full font-bold text-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phương thức tính lãi</label>
                  <select
                    value={editingProduct.calcMethod}
                    onChange={(e) => setEditingProduct({...editingProduct, calcMethod: e.target.value})}
                    className="input-human w-full font-medium"
                  >
                    <option value="REDUCING">Dư nợ giảm dần</option>
                    <option value="FLAT">Gốc đều cố định (Flat EMI)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductConfig;
