import React, { useState } from 'react';
import { 
  Shield, Users, Key, UserPlus, Check, 
  X, CheckCircle2, Lock, Save, Edit, Trash2, 
  RotateCcw, AlertCircle
} from 'lucide-react';

const INITIAL_USERS = [
  {
    id: 'u_admin_1',
    fullName: 'Lê Văn Cường',
    email: 'admin@demo.com',
    role: 'admin',
    roleLabel: 'Quản trị viên hệ thống (Admin)',
    status: 'ACTIVE',
    lastLogin: '27/09/2026 23:15'
  },
  {
    id: 'u_officer_1',
    fullName: 'Trần Thị Bình',
    email: 'officer@demo.com',
    role: 'credit_officer',
    roleLabel: 'Chuyên viên thẩm định (Underwriter)',
    status: 'ACTIVE',
    lastLogin: '27/09/2026 22:40'
  },
  {
    id: 'u_accountant_1',
    fullName: 'Nguyễn Thu Trang',
    email: 'accountant@demo.com',
    role: 'accountant',
    roleLabel: 'Kế toán trưởng (Accountant)',
    status: 'ACTIVE',
    lastLogin: '27/09/2026 18:20'
  },
  {
    id: 'u_collection_1',
    fullName: 'Vũ Đức Thịnh',
    email: 'collection@demo.com',
    role: 'collection',
    roleLabel: 'Chuyên viên thu hồi nợ (Collection)',
    status: 'ACTIVE',
    lastLogin: '27/09/2026 17:05'
  }
];

const INITIAL_PERMISSIONS = [
  { id: 'view_los', name: 'Xem danh sách hồ sơ vay (LOS)', admin: true, officer: true, accountant: false, collection: false, sales: true },
  { id: 'approve_loan', name: 'Phê duyệt / Từ chối khoản vay', admin: true, officer: true, accountant: false, collection: false, sales: false },
  { id: 'disburse_batch', name: 'Lập lệnh chi giải ngân Core Banking', admin: true, officer: false, accountant: true, collection: false, sales: false },
  { id: 'reconcile_cash', name: 'Đối soát thu nợ & Gạch nợ ngân hàng', admin: true, officer: false, accountant: true, collection: false, sales: false },
  { id: 'debt_collection', name: 'Tác nghiệp Telesale & Thu hồi nợ xấu', admin: true, officer: false, accountant: false, collection: true, sales: false },
  { id: 'rule_config', name: 'Cấu hình Quy tắc duyệt (Rule Engine)', admin: true, officer: false, accountant: false, collection: false, sales: false },
  { id: 'iam_admin', name: 'Quản lý Tài khoản & Phân quyền (IAM)', admin: true, officer: false, accountant: false, collection: false, sales: false },
  { id: 'view_reports', name: 'Xem Báo cáo chuyên sâu BI & Audit Logs', admin: true, officer: true, accountant: true, collection: false, sales: false }
];

const IamManagement = () => {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'matrix'

  // Modal New User
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'credit_officer'
  });
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleTogglePermission = (index, roleKey) => {
    const updated = [...permissions];
    updated[index][roleKey] = !updated[index][roleKey];
    setPermissions(updated);
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const created = {
      id: 'u_' + Date.now(),
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      roleLabel: newUser.role === 'admin' ? 'Admin' : newUser.role === 'credit_officer' ? 'Thẩm định viên' : newUser.role === 'accountant' ? 'Kế toán' : 'Thu hồi nợ',
      status: 'ACTIVE',
      lastLogin: 'Chưa đăng nhập'
    };
    setUsers([...users, created]);
    setShowNewUserModal(false);
    setNewUser({ fullName: '', email: '', phone: '', role: 'credit_officer' });
    setSaveSuccess('Thêm tài khoản nhân viên thành công!');
    setTimeout(() => setSaveSuccess(''), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto py-2">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Phân Quyền & Quản Lý Tài Khoản (IAM)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị định danh cán bộ nội bộ, phân vai trò nghiệp vụ và thiết lập ma trận bảo mật theo Role (RBAC).
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-5 py-2 rounded-xl transition ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Danh sách nhân viên ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-5 py-2 rounded-xl transition ${activeTab === 'matrix' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Ma trận phân quyền (RBAC Matrix)
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">{saveSuccess}</span>
        </div>
      )}

      {/* TAB 1: USERS LIST */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-4">
          <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Danh sách tài khoản cán bộ vận hành ({users.length})
            </span>
            <button
              type="button"
              onClick={() => setShowNewUserModal(true)}
              className="btn-primary py-2 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <UserPlus className="w-4 h-4" /> Thêm người dùng mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Tên nhân viên</th>
                  <th className="py-3.5 px-4">Email đăng nhập</th>
                  <th className="py-3.5 px-4">Vai trò (Role)</th>
                  <th className="py-3.5 px-4">Đăng nhập gần nhất</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <strong className="block text-slate-900 font-bold">{u.fullName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {u.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' : u.role === 'credit_officer' ? 'bg-blue-100 text-blue-800' : u.role === 'accountant' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.roleLabel}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {u.lastLogin}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                        Hoạt động
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => alert(`Chỉnh sửa tài khoản ${u.fullName}`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC PERMISSION MATRIX TABLE */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden space-y-4">
          <div className="p-4 px-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                Ma Trận Phân Quyền Chi Tiết Theo Vai Trò (Role-Based Access Control)
              </span>
              <p className="text-[11px] text-slate-400">Admin có thể tùy chỉnh phân quyền chức năng cho từng nhóm cán bộ</p>
            </div>

            <button
              type="button"
              onClick={() => { setSaveSuccess('Đã lưu cấu hình ma trận phân quyền RBAC thành công!'); setTimeout(() => setSaveSuccess(''), 2500); }}
              className="btn-primary py-2 px-5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" /> Lưu cấu hình ma trận
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Chức năng / Quyền hạn nghiệp vụ</th>
                  <th className="py-3.5 px-4 text-center">Admin (Toàn quyền)</th>
                  <th className="py-3.5 px-4 text-center">Thẩm định viên (LOS)</th>
                  <th className="py-3.5 px-4 text-center">Kế toán quỹ</th>
                  <th className="py-3.5 px-4 text-center">Thu hồi nợ</th>
                  <th className="py-3.5 px-4 text-center">Sales / Kinh doanh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((perm, idx) => (
                  <tr key={perm.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {perm.name}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={perm.admin}
                        onChange={() => handleTogglePermission(idx, 'admin')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={perm.officer}
                        onChange={() => handleTogglePermission(idx, 'officer')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={perm.accountant}
                        onChange={() => handleTogglePermission(idx, 'accountant')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={perm.collection}
                        onChange={() => handleTogglePermission(idx, 'collection')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={perm.sales}
                        onChange={() => handleTogglePermission(idx, 'sales')}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE NEW USER MODAL */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-slate-900">Thêm Mới Cán Bộ Nội Bộ</h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  placeholder="Ví dụ: Lê Thị Hồng"
                  className="input-human w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email đăng nhập</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="hong.lt@loms.vn"
                  className="input-human w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vai trò hệ thống (Role)</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="input-human w-full font-bold"
                >
                  <option value="credit_officer">Chuyên viên Thẩm định (Underwriter)</option>
                  <option value="accountant">Kế toán quỹ (Accountant)</option>
                  <option value="collection">Thu hồi nợ (Collection)</option>
                  <option value="sales">Kinh doanh (Sales)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary py-2.5 rounded-xl font-bold"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default IamManagement;
