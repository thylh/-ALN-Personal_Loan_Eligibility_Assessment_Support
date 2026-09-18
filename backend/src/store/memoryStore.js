// In-Memory Data Store for seamless execution and fallbacks
const bcrypt = require('bcryptjs');

const initialUsers = [
  {
    _id: 'u_customer_1',
    username: 'khachhang',
    email: 'customer@demo.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'customer',
    fullName: 'Nguyen Van An',
    phone: '0901234567',
    identityCard: '012345678901',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'u_officer_1',
    username: 'thamdinhvien',
    email: 'officer@demo.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'credit_officer',
    fullName: 'Tran Thi Binh (Chuyen Vien Tham Dinh)',
    phone: '0912345678',
    identityCard: '012345678902',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'u_admin_1',
    username: 'quantrivien',
    email: 'admin@demo.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'admin',
    fullName: 'Le Van Cuong (Quantri System)',
    phone: '0987654321',
    identityCard: '012345678903',
    createdAt: new Date().toISOString()
  }
];

const initialScoringRules = {
  _id: 'rule_default',
  weights: {
    income: 25,       // 25% Thu nhập
    dti: 30,          // 30% Tỷ lệ nợ/thu nhập
    workTenure: 20,   // 20% Thâm niên
    creditHistory: 15,// 15% Lịch sử nợ
    age: 10           // 10% Độ tuổi
  },
  thresholds: {
    gradeA: 750, // >= 750 (Rủi ro Thấp - Green)
    gradeB: 650, // >= 650 (Rủi ro Trung Bình - Yellow)
    gradeC: 550  // >= 550 (Rủi ro Cao - Orange), < 550 (Critical - Red)
  },
  interestRates: {
    gradeA: 7.5,
    gradeB: 9.8,
    gradeC: 12.5,
    gradeD: 16.0
  },
  dtiSafetyRatio: 0.5, // Tối đa 50% thu nhập dành cho trả nợ
  updatedAt: new Date().toISOString()
};

const initialApplications = [
  {
    _id: 'app_1001',
    applicationNo: 'LOAN-2026-1001',
    customerId: 'u_customer_1',
    customerName: 'Nguyen Van An',
    customerPhone: '0901234567',
    identityCard: '012345678901',
    requestedAmount: 150000000,
    requestedTermMonths: 24,
    loanPurpose: 'Mua sắm thiết bị gia đình & sửa nhà',
    personalDetails: {
      fullName: 'Nguyen Van An',
      dob: '1992-05-15',
      gender: 'Nam',
      educationLevel: 'Đại học',
      maritalStatus: 'Đã kết hôn',
      dependents: 1,
      address: '123 Nguyen Trai, Quan 1, TP.HCM'
    },
    financialDetails: {
      grossMonthlyIncome: 35000000,
      monthlyExpenses: 12000000,
      existingMonthlyDebt: 3000000,
      workTenureYears: 4.5,
      employerName: 'Công ty TNHH Công Nghệ Việt',
      jobTitle: 'Kỹ sư Phần mềm',
      creditHistoryScore: 80 // Lịch sử tín dụng tốt (0-100)
    },
    documents: [
      {
        id: 'doc_1',
        title: 'CCCD Mặt Trước & Mặt Sau',
        fileUrl: '/uploads/cccd_sample.png',
        ocrData: {
          idNumber: '012345678901',
          fullName: 'NGUYỄN VĂN AN',
          dob: '15/05/1992',
          address: '123 Nguyễn Trãi, Quận 1, TP.HCM',
          matchScore: 98
        },
        verified: true
      },
      {
        id: 'doc_2',
        title: 'Sao kê Tài khoản Lương 3 tháng',
        fileUrl: '/uploads/saoke_sample.pdf',
        ocrData: {
          accountHolder: 'NGUYEN VAN AN',
          averageMonthlyIncome: 35200000,
          bankName: 'Vietcombank',
          matchScore: 95
        },
        verified: true
      }
    ],
    scoringResult: {
      calculatedAt: new Date().toISOString(),
      score: 785,
      riskGrade: 'A',
      riskLevel: 'Rủi ro Thấp (Low Risk)',
      riskColor: 'green',
      dtiRatioPercent: 42.86,
      maxRecommendedLimit: 250000000,
      suggestedInterestRate: 7.5,
      factorScores: {
        incomeScore: 85,
        dtiScore: 90,
        workTenureScore: 80,
        creditHistoryScore: 80,
        ageScore: 85
      },
      suggestions: [
        'Hồ sơ có chỉ số tài chính vững mạnh. Đủ điều kiện phê duyệt hạn mức tối đa.',
        'Khuyên nghị duy trì tỷ lệ DTI dưới 45%.'
      ]
    },
    status: 'SUBMITTED', // DRAFT, SUBMITTED, UNDER_REVIEW, ACTION_REQUIRED, APPROVED, REJECTED
    appraisalNote: '',
    actionRequiredReason: '',
    auditLogs: [
      {
        action: 'Nộp hồ sơ vay',
        performedBy: 'Nguyen Van An',
        role: 'customer',
        timestamp: new Date().toISOString(),
        note: 'Khách hàng khởi tạo và nộp hồ sơ thành công.'
      },
      {
        action: 'Chấm điểm tín dụng tự động',
        performedBy: 'Rule-Based Engine v1.0',
        role: 'system',
        timestamp: new Date().toISOString(),
        note: 'Hệ thống tự động chấm điểm: 785 điểm - Hạng A.'
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialNotifications = [
  {
    _id: 'notif_1',
    recipientId: 'u_customer_1',
    loanId: 'app_1001',
    title: 'Hồ sơ đã được nhận',
    message: 'Hồ sơ vay LOAN-2026-1001 của bạn đã được chuyển đến bộ phận Thẩm định.',
    read: false,
    createdAt: new Date().toISOString()
  }
];

class MemoryStore {
  constructor() {
    this.users = [...initialUsers];
    this.scoringRules = { ...initialScoringRules };
    this.applications = [...initialApplications];
    this.notifications = [...initialNotifications];
  }

  // User Operations
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u._id === id);
  }

  createUser(userData) {
    const newUser = {
      _id: 'u_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Scoring Rules
  getScoringRules() {
    return this.scoringRules;
  }

  updateScoringRules(newRules) {
    this.scoringRules = {
      ...this.scoringRules,
      ...newRules,
      updatedAt: new Date().toISOString()
    };
    return this.scoringRules;
  }

  // Loan Applications
  getAllApplications() {
    return this.applications;
  }

  getApplicationById(id) {
    return this.applications.find(a => a._id === id || a.applicationNo === id);
  }

  getApplicationsByCustomerId(customerId) {
    return this.applications.filter(a => a.customerId === customerId);
  }

  createApplication(appData) {
    const appNo = 'LOAN-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newApp = {
      _id: 'app_' + Date.now(),
      applicationNo: appNo,
      status: 'SUBMITTED',
      auditLogs: [],
      ...appData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.applications.unshift(newApp);
    return newApp;
  }

  updateApplication(id, updateData) {
    const index = this.applications.findIndex(a => a._id === id);
    if (index === -1) return null;
    this.applications[index] = {
      ...this.applications[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    return this.applications[index];
  }

  addAuditLog(appId, logEntry) {
    const app = this.getApplicationById(appId);
    if (!app) return null;
    app.auditLogs.push({
      timestamp: new Date().toISOString(),
      ...logEntry
    });
    return app;
  }

  // Notifications
  getNotificationsByUserId(userId) {
    return this.notifications.filter(n => n.recipientId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  createNotification(notifData) {
    const newNotif = {
      _id: 'notif_' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
      ...notifData
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  markNotificationAsRead(id) {
    const notif = this.notifications.find(n => n._id === id);
    if (notif) notif.read = true;
    return notif;
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
