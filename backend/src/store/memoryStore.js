// In-Memory Data Store for seamless execution and fallbacks
const bcrypt = require('bcryptjs');

const initialUsers = [
  {
    _id: 'u_customer_1',
    username: 'khachhang',
    email: 'customer@demo.com',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'customer',
    occupation: 'EMPLOYED',
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
    version: 1,
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

const initialLoanProducts = [
  {
    id: 'prod-student',
    name: 'Gói Vay Sinh Viên & Học Phí',
    subtitle: 'Hỗ trợ sinh viên đóng học phí, mua sắm laptop và chi phí học tập',
    targetOccupations: ['STUDENT'],
    minAmount: 5000000,
    maxAmount: 35000000,
    defaultAmount: 20000000,
    stepAmount: 1000000,
    minTerm: 3,
    maxTerm: 18,
    defaultTerm: 12,
    interestRate: 0.75, // 0.75% / tháng
    rateType: 'FIXED',
    calcMethod: 'reducing',
    badge: 'Ưu đãi Lãi suất 0.75%',
    tag: 'Sinh viên',
    desc: 'Gói vay chuyên biệt dành cho sinh viên các trường Đại học, Cao đẳng với thủ tục đơn giản, ân hạn nợ gốc và lãi suất hỗ trợ học tập tối đa.',
    benefits: [
      'Chỉ cần Thẻ sinh viên & CCCD gắn chip',
      'Lãi suất ưu đãi vượt trội chỉ 0.75%/tháng',
      'Ân hạn trả gốc trong 3 tháng đầu kỳ học',
      'Miễn 100% phí tất toán khoản vay trước hạn'
    ],
    eligibilityCriteria: [
      'Độ tuổi từ 18 - 25 tuổi',
      'Đang theo học tại các trường Đại học, Cao đẳng, Trung cấp chuyên nghiệp',
      'Không có lịch sử nợ xấu trên hệ thống tín dụng CIC'
    ],
    requiredDocs: [
      'CCCD gắn chip còn hiệu lực 2 mặt',
      'Thẻ sinh viên hoặc Giấy xác nhận đang theo học',
      'Biên lai thu học phí hoặc Thẻ BHYT sinh viên'
    ]
  },
  {
    id: 'prod-salary',
    name: 'Gói Vay Tín Chấp Người Đi Làm (Theo Lương)',
    subtitle: 'Vay nhanh dựa trên thu nhập chuyển khoản, hạn mức tới 10 lần lương',
    targetOccupations: ['EMPLOYED'],
    minAmount: 15000000,
    maxAmount: 250000000,
    defaultAmount: 60000000,
    stepAmount: 5000000,
    minTerm: 6,
    maxTerm: 36,
    defaultTerm: 18,
    interestRate: 0.85, // 0.85% / tháng
    rateType: 'FIXED',
    calcMethod: 'reducing',
    badge: 'Duyệt Siêu Tốc 15 Phút',
    tag: 'Người đi làm (Hưởng lương)',
    desc: 'Dành cho cán bộ nhân viên, công chức, người đi làm có thu nhập hàng tháng chuyển khoản qua ngân hàng. Giải ngân nhanh chóng không cần bảo lãnh từ công ty.',
    benefits: [
      'Hạn mức cấp cao lên đến 250 triệu đồng',
      'Lãi suất cạnh tranh tính theo dư nợ giảm dần',
      'Không cần tài sản bảo đảm hay bảo lãnh người thân',
      'Tự động kết nối ngân hàng giải ngân 24/7'
    ],
    eligibilityCriteria: [
      'Độ tuổi từ 20 - 58 tuổi',
      'Thời gian làm việc tại đơn vị hiện tại từ 3 tháng trở lên',
      'Thu nhập hàng tháng tối thiểu từ 5,000,000 đ'
    ],
    requiredDocs: [
      'CCCD gắn chip',
      'Hợp đồng lao động hoặc Quyết định bổ nhiệm',
      'Sao kê tài khoản ngân hàng nhận lương 3 tháng gần nhất'
    ]
  },
  {
    id: 'prod-business',
    name: 'Gói Vay Hộ Kinh Doanh & Doanh Nhân',
    subtitle: 'Bổ sung vốn lưu động thần tốc, nhập hàng, mở rộng cơ sở buôn bán',
    targetOccupations: ['BUSINESS_OWNER'],
    minAmount: 30000000,
    maxAmount: 500000000,
    defaultAmount: 150000000,
    stepAmount: 10000000,
    minTerm: 6,
    maxTerm: 48,
    defaultTerm: 24,
    interestRate: 0.95, // 0.95% / tháng
    rateType: 'FIXED',
    calcMethod: 'reducing',
    badge: 'Hạn Mức Đến 500 Triệu',
    tag: 'Chủ hộ kinh doanh / Doanh nhân',
    desc: 'Giải pháp trợ lực tài chính đắc lực cho các chủ sạp, tiệm bán lẻ, chủ shop online và doanh nghiệp cá thể, linh hoạt trả nợ theo mùa vụ kinh doanh.',
    benefits: [
      'Hạn mức tín dụng đột phá lên đến 500 triệu đồng',
      'Chấp nhận Giấy phép kinh doanh hoặc mã số thuế cá thể',
      'Hình thức trả nợ linh hoạt phù hợp chu kỳ dòng tiền bán hàng',
      'Thẩm định hồ sơ tận nơi hoặc 100% online bảo mật'
    ],
    eligibilityCriteria: [
      'Chủ hộ kinh doanh hoặc đại diện pháp luật',
      'Hoạt động kinh doanh liên tục từ 6 tháng trở lên',
      'Có địa điểm kinh doanh cố định hoặc gian hàng TMĐT hợp pháp'
    ],
    requiredDocs: [
      'CCCD gắn chip chủ cơ sở',
      'Giấy chứng nhận Đăng ký kinh doanh hoặc Biên lai nộp thuế/sổ bán lẻ',
      'Hình ảnh địa điểm kinh doanh / sạp hàng / kho bãi'
    ]
  },
  {
    id: 'prod-freelancer',
    name: 'Gói Vay Thu Nhập Tự Do (Freelancer Flex)',
    subtitle: 'Tín dụng linh hoạt cho Designer, Dev, Creator dựa trên sao kê thu nhập',
    targetOccupations: ['FREELANCER'],
    minAmount: 10000000,
    maxAmount: 100000000,
    defaultAmount: 40000000,
    stepAmount: 2000000,
    minTerm: 3,
    maxTerm: 24,
    defaultTerm: 12,
    interestRate: 0.99, // 0.99% / tháng
    rateType: 'FIXED',
    calcMethod: 'reducing',
    badge: 'Đánh Giá Thu Nhập Đa Kênh',
    tag: 'Tự do (Freelancer)',
    desc: 'Thiết kế riêng cho các chuyên gia tự do, content creator, lập trình viên độc lập có nguồn thu nhập linh hoạt từ nhiều đối tác và nền tảng số.',
    benefits: [
      'Chấp nhận sao kê ngân hàng đa nguồn, ví điện tử',
      'Thẩm định linh hoạt hợp đồng dự án & email nghiệm thu',
      'Tùy chỉnh ngày trả nợ định kỳ theo chu kỳ thanh toán dự án',
      'Giải ngân ngay vào tài khoản thanh toán'
    ],
    eligibilityCriteria: [
      'Độ tuổi từ 18 - 50 tuổi',
      'Có lịch sử nhận thu nhập freelance trong 3 tháng gần nhất',
      'Không có nợ xấu tại các tổ chức tín dụng'
    ],
    requiredDocs: [
      'CCCD gắn chip',
      'Sao kê tài khoản ngân hàng hoặc lịch sử ví điện tử 3 tháng',
      'Hợp đồng dịch vụ hoặc email xác nhận nghiệm thu gần nhất'
    ]
  },
  {
    id: 'prod-utility',
    name: 'Gói Vay Tiêu Dùng Linh Hoạt (Mọi Đối Tượng)',
    subtitle: 'Duyệt nhanh dựa trên hóa đơn điện thoại, điện nước hoặc bảo hiểm',
    targetOccupations: ['OTHER', 'EMPLOYED', 'FREELANCER'],
    minAmount: 10000000,
    maxAmount: 70000000,
    defaultAmount: 30000000,
    stepAmount: 2000000,
    minTerm: 3,
    maxTerm: 24,
    defaultTerm: 12,
    interestRate: 1.05, // 1.05% / tháng
    rateType: 'FIXED',
    calcMethod: 'flat',
    badge: 'Duyệt Nhanh 100% Online',
    tag: 'Phổ thông / Khác',
    desc: 'Gói vay phổ thông không đòi hỏi bảng lương hay hợp đồng lao động phức tạp. Tiếp cận nguồn vốn nhanh chóng để giải quyết chi tiêu cấp bách.',
    benefits: [
      'Không yêu cầu chứng minh thu nhập sao kê lương',
      'Áp dụng linh hoạt cho mọi đối tượng khách hàng',
      'Thủ tục tối giản, thời gian xử lý và giải ngân trong ngày',
      'Theo dõi lịch trả góp minh bạch trực tiếp trên ứng dụng'
    ],
    eligibilityCriteria: [
      'Độ tuổi từ 18 - 60 tuổi',
      'Là công dân Việt Nam có đầy đủ năng lực hành vi dân sự',
      'Có hóa đơn dịch vụ hoặc hợp đồng dịch vụ chính chủ'
    ],
    requiredDocs: [
      'CCCD gắn chip',
      'Hóa đơn điện / nước / internet hoặc Hợp đồng BHNT đứng tên người vay'
    ]
  }
];

class MemoryStore {
  constructor() {
    this.users = [...initialUsers];
    this.scoringRules = { ...initialScoringRules };
    this.applications = [...initialApplications];
    this.notifications = [...initialNotifications];
    this.loanProducts = [...initialLoanProducts];
    this.drafts = {}; // customerId -> draft
    this.comments = []; // Realtime discussions between actors
    this.eventLogs = []; // Global event log for reconciliation & CDC fallback (eventId, documentId, version, envelope)
  }

  // Loan Products (Segmentation & Recommendations)
  getAllLoanProducts(occupation) {
    if (!occupation || occupation === 'ALL') {
      return this.loanProducts;
    }
    // Return products sorted so that products matching targetOccupations come first
    const matched = this.loanProducts.filter(p => p.targetOccupations.includes(occupation));
    const others = this.loanProducts.filter(p => !p.targetOccupations.includes(occupation));
    return [...matched, ...others];
  }

  getLoanProductById(id) {
    return this.loanProducts.find(p => p.id === id);
  }

  // MongoDB Synchronization Engine
  async initMongoSync() {
    try {
      const { User, LoanProduct, LoanApplication, ScoringRule, Notification, Comment } = require('../models');

      // 1. Sync Loan Products
      const productCount = await LoanProduct.countDocuments();
      if (productCount === 0) {
        for (const p of initialLoanProducts) {
          await LoanProduct.findOneAndUpdate({ id: p.id }, p, { upsert: true });
        }
        console.log('[Database] Seeded initial loan products into MongoDB.');
      } else {
        const dbProducts = await LoanProduct.find().lean();
        if (dbProducts.length > 0) {
          this.loanProducts = dbProducts;
        }
      }

      // 2. Sync Users
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        for (const u of initialUsers) {
          await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
        }
        console.log('[Database] Seeded initial users into MongoDB.');
      } else {
        const dbUsers = await User.find().lean();
        if (dbUsers.length > 0) {
          this.users = dbUsers;
        }
      }

      // 3. Sync Scoring Rules
      const ruleCount = await ScoringRule.countDocuments();
      if (ruleCount === 0) {
        await ScoringRule.findOneAndUpdate({ _id: 'rule_default' }, initialScoringRules, { upsert: true });
        console.log('[Database] Seeded default scoring rules into MongoDB.');
      } else {
        const dbRule = await ScoringRule.findOne({ _id: 'rule_default' }).lean();
        if (dbRule) {
          this.scoringRules = dbRule;
        }
      }

      // 4. Sync Applications
      const appCount = await LoanApplication.countDocuments();
      if (appCount === 0) {
        for (const a of initialApplications) {
          await LoanApplication.findOneAndUpdate({ _id: a._id }, a, { upsert: true });
        }
        console.log('[Database] Seeded initial loan applications into MongoDB.');
      } else {
        const dbApps = await LoanApplication.find().sort({ createdAt: -1 }).lean();
        if (dbApps.length > 0) {
          this.applications = dbApps;
        }
      }

      // 5. Sync Notifications
      const notifCount = await Notification.countDocuments();
      if (notifCount === 0) {
        for (const n of initialNotifications) {
          await Notification.findOneAndUpdate({ _id: n._id }, n, { upsert: true });
        }
      } else {
        const dbNotifs = await Notification.find().sort({ createdAt: -1 }).lean();
        if (dbNotifs.length > 0) {
          this.notifications = dbNotifs;
        }
      }

      // 6. Sync Comments
      const commentCount = await Comment.countDocuments();
      if (commentCount > 0) {
        const dbComments = await Comment.find().sort({ createdAt: 1 }).lean();
        if (dbComments.length > 0) {
          this.comments = dbComments;
        }
      }

      // 7. Sync Payment Transactions
      const { PaymentTransaction } = require('../models');
      const txCount = await PaymentTransaction.countDocuments();
      if (txCount > 0) {
        const dbTxs = await PaymentTransaction.find().sort({ createdAt: -1 }).lean();
        this.paymentTransactions = dbTxs;
      }

      console.log('[Database] MongoDB full two-way synchronization completed with memoryStore.');
    } catch (err) {
      console.warn('[Database] Mongo sync warning (continuing with memory store):', err.message);
    }
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
      role: 'customer',
      occupation: userData.occupation || 'OTHER',
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);

    // Async persist to MongoDB
    try {
      const { User } = require('../models');
      User.findOneAndUpdate({ _id: newUser._id }, newUser, { upsert: true })
        .catch(e => console.warn('[Mongo] User.create async error:', e.message));
    } catch (e) {}

    return newUser;
  }

  updateUserProfile(id, updateData) {
    const user = this.findUserById(id);
    if (user) {
      Object.assign(user, updateData);
      try {
        const { User } = require('../models');
        User.findOneAndUpdate({ _id: id }, updateData, { new: true })
          .catch(e => console.warn('[Mongo] User update error:', e.message));
      } catch (e) {}
    }
    return user;
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
    try {
      const { ScoringRule } = require('../models');
      ScoringRule.findOneAndUpdate({ _id: 'rule_default' }, this.scoringRules, { upsert: true })
        .catch(e => console.warn('[Mongo] ScoringRule update error:', e.message));
    } catch (e) {}
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
      version: 1,
      auditLogs: [],
      occupation: appData.occupation || 'OTHER',
      productId: appData.productId || '',
      productName: appData.productName || '',
      interestRate: appData.interestRate || 0.85,
      ...appData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.applications.unshift(newApp);

    // Record Event in event log
    this.recordEventLog({
      eventType: 'DOCUMENT_CREATED',
      documentId: newApp._id,
      applicationNo: newApp.applicationNo,
      version: newApp.version,
      payload: newApp,
      delta: { updatedFields: newApp, removedFields: [] }
    });

    // Async persist to MongoDB
    try {
      const { LoanApplication } = require('../models');
      LoanApplication.findOneAndUpdate({ _id: newApp._id }, newApp, { upsert: true })
        .catch(e => console.warn('[Mongo] LoanApplication.create async error:', e.message));
    } catch (e) {}

    return newApp;
  }

  updateApplication(id, updateData) {
    const index = this.applications.findIndex(a => a._id === id);
    if (index === -1) return null;
    const oldVersion = this.applications[index].version || 1;
    this.applications[index] = {
      ...this.applications[index],
      ...updateData,
      version: oldVersion + 1,
      updatedAt: new Date().toISOString()
    };

    // Async persist to MongoDB
    try {
      const { LoanApplication } = require('../models');
      LoanApplication.findOneAndUpdate({ _id: id }, this.applications[index])
        .catch(e => console.warn('[Mongo] LoanApplication update error:', e.message));
    } catch (e) {}

    return this.applications[index];
  }

  // Optimistic Concurrency Control (OCC)
  updateWithOptimisticLock(id, expectedVersion, updateData, actor = null) {
    const app = this.getApplicationById(id);
    if (!app) {
      const err = new Error('Hồ sơ không tồn tại.');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const currentVersion = app.version || 1;
    if (expectedVersion !== undefined && expectedVersion !== null && currentVersion !== expectedVersion) {
      const conflictErr = new Error(
        `Xung đột dữ liệu (Concurrency Conflict): Hồ sơ đang ở phiên bản v${currentVersion}, tác nhân gửi yêu cầu với v${expectedVersion}. Vui lòng đồng bộ dữ liệu mới nhất.`
      );
      conflictErr.code = 'CONCURRENCY_CONFLICT';
      conflictErr.currentVersion = currentVersion;
      conflictErr.expectedVersion = expectedVersion;
      throw conflictErr;
    }

    const nextVersion = currentVersion + 1;
    const updatedApp = {
      ...app,
      ...updateData,
      version: nextVersion,
      updatedAt: new Date().toISOString()
    };

    const index = this.applications.findIndex(a => a._id === app._id);
    this.applications[index] = updatedApp;

    // Record Event
    const event = this.recordEventLog({
      eventType: 'DOCUMENT_UPDATED',
      documentId: updatedApp._id,
      applicationNo: updatedApp.applicationNo,
      version: nextVersion,
      actor,
      payload: updatedApp,
      delta: { updatedFields: updateData, removedFields: [] }
    });

    // Async persist to MongoDB
    try {
      const { LoanApplication } = require('../models');
      LoanApplication.findOneAndUpdate({ _id: updatedApp._id }, updatedApp)
        .catch(e => console.warn('[Mongo] LoanApplication OCC update error:', e.message));
    } catch (e) {}

    return { updatedApp, event };
  }

  // Event Log Management (CDC / Event Sourcing)
  recordEventLog(eventData) {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const event = {
      eventId,
      timestamp: Date.now(),
      ...eventData
    };
    this.eventLogs.push(event);
    if (this.eventLogs.length > 500) {
      this.eventLogs.shift();
    }
    return event;
  }

  getMissedEvents(documentId, fromVersion = 0) {
    return this.eventLogs.filter(e => 
      e.documentId === documentId && e.version > fromVersion
    );
  }

  addAuditLog(appId, logEntry) {
    const app = this.getApplicationById(appId);
    if (!app) return null;
    app.auditLogs.push({
      timestamp: new Date().toISOString(),
      ...logEntry
    });

    // Async persist to MongoDB
    try {
      const { LoanApplication } = require('../models');
      LoanApplication.findOneAndUpdate({ _id: appId }, { auditLogs: app.auditLogs })
        .catch(e => console.warn('[Mongo] addAuditLog update error:', e.message));
    } catch (e) {}

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

    // Async persist to MongoDB
    try {
      const { Notification } = require('../models');
      Notification.findOneAndUpdate({ _id: newNotif._id }, newNotif, { upsert: true })
        .catch(e => console.warn('[Mongo] Notification create error:', e.message));
    } catch (e) {}

    return newNotif;
  }

  markNotificationAsRead(id) {
    const notif = this.notifications.find(n => n._id === id);
    if (notif) {
      notif.read = true;
      try {
        const { Notification } = require('../models');
        Notification.findOneAndUpdate({ _id: id }, { read: true })
          .catch(e => console.warn('[Mongo] Notification mark read error:', e.message));
      } catch (e) {}
    }
    return notif;
  }

  // Realtime Draft Sync Operations
  saveDraft(customerId, draftData) {
    const existing = this.drafts[customerId] || {};
    const updated = {
      ...existing,
      ...draftData,
      customerId,
      updatedAt: new Date().toISOString()
    };
    this.drafts[customerId] = updated;
    return updated;
  }

  getDraft(customerId) {
    return this.drafts[customerId] || null;
  }

  deleteDraft(customerId) {
    const draft = this.drafts[customerId];
    delete this.drafts[customerId];
    return draft;
  }

  // Realtime Discussion & Actor Clarification Comments
  addComment(appId, commentData) {
    const newComment = {
      _id: 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      appId,
      senderId: commentData.senderId,
      senderName: commentData.senderName,
      senderRole: commentData.senderRole, // 'customer' | 'credit_officer' | 'admin' | 'system'
      content: commentData.content,
      attachments: commentData.attachments || [],
      createdAt: new Date().toISOString()
    };
    this.comments.push(newComment);

    // Async persist to MongoDB
    try {
      const { Comment } = require('../models');
      Comment.findOneAndUpdate({ _id: newComment._id }, newComment, { upsert: true })
        .catch(e => console.warn('[Mongo] Comment create error:', e.message));
    } catch (e) {}

    return newComment;
  }

  // Realtime Payments & Repayment Transactions
  async recordPaymentTransaction(txData) {
    const tx = {
      _id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      transactionNo: 'TXN-REPAY-' + Date.now(),
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
      ...txData
    };
    if (!this.paymentTransactions) this.paymentTransactions = [];
    this.paymentTransactions.unshift(tx);

    // Update the associated loan application in memory
    const app = this.getApplicationById(tx.applicationId);
    if (app) {
      const payAmount = Number(tx.amount) || 0;
      const currentRemaining = Number(app.remainingPrincipal !== undefined ? app.remainingPrincipal : (app.approvedAmount || app.requestedAmount)) || 0;
      const nextRemaining = Math.max(0, currentRemaining - payAmount);
      const nextPaidMonths = (Number(app.paidMonths) || 0) + 1;
      const nextTotalPaid = (Number(app.totalPaidAmount) || 0) + payAmount;

      app.remainingPrincipal = nextRemaining;
      app.paidMonths = nextPaidMonths;
      app.totalPaidAmount = nextTotalPaid;
      app.version = (app.version || 1) + 1;
      app.updatedAt = new Date().toISOString();

      // If fully settled
      if (nextRemaining === 0) {
        app.status = 'COMPLETED';
      }

      this.addAuditLog(app._id, {
        action: 'Thanh toán khoản vay thành công',
        performedBy: tx.customerName || app.customerName,
        role: 'customer',
        note: `Đã thanh toán ${payAmount.toLocaleString('vi-VN')} VNĐ qua VietQR Napas 247. Dư nợ còn lại: ${nextRemaining.toLocaleString('vi-VN')} VNĐ.`
      });

      // Write-through to MongoDB
      try {
        const { LoanApplication, PaymentTransaction } = require('../models');
        await PaymentTransaction.findOneAndUpdate({ _id: tx._id }, tx, { upsert: true });
        await LoanApplication.findOneAndUpdate({ _id: app._id }, app);
      } catch (e) {
        console.warn('[Mongo] Payment transaction persistence error:', e.message);
      }
    } else {
      try {
        const { PaymentTransaction } = require('../models');
        await PaymentTransaction.findOneAndUpdate({ _id: tx._id }, tx, { upsert: true });
      } catch (e) {}
    }

    return { transaction: tx, updatedApplication: app };
  }

  getPaymentTransactionsByCustomerId(customerId) {
    if (!this.paymentTransactions) this.paymentTransactions = [];
    return this.paymentTransactions.filter(t => t.customerId === customerId);
  }

  getPaymentTransactionsByAppId(appId) {
    if (!this.paymentTransactions) this.paymentTransactions = [];
    return this.paymentTransactions.filter(t => t.applicationId === appId);
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
