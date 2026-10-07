// Shared Loan Products & Occupations Dataset

export const OCCUPATIONS = [
  { 
    id: 'STUDENT', 
    label: 'Sinh viên', 
    desc: 'Đang theo học tại các trường Đại học, Cao đẳng',
    iconName: 'GraduationCap'
  },
  { 
    id: 'EMPLOYED', 
    label: 'Người đi làm (Hưởng lương)', 
    desc: 'Cán bộ công chức, nhân viên văn phòng nhận lương chuyển khoản hoặc tiền mặt',
    iconName: 'Briefcase'
  },
  { 
    id: 'BUSINESS_OWNER', 
    label: 'Chủ hộ kinh doanh / Doanh nhân', 
    desc: 'Chủ cơ sở buôn bán, tiểu thương, doanh nghiệp vừa và nhỏ',
    iconName: 'Store'
  },
  { 
    id: 'FREELANCER', 
    label: 'Tự do (Freelancer)', 
    desc: 'Người làm việc tự do, sáng tạo nội dung, lập trình viên độc lập',
    iconName: 'Laptop'
  },
  { 
    id: 'OTHER', 
    label: 'Khác', 
    desc: 'Lao động thời vụ, hưu trí hoặc các nhóm ngành nghề khác',
    iconName: 'User'
  }
];

export const LOAN_PRODUCTS = [
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
      'Lãi suất ưu đãi vượt trội chỉ 0.75%/tháng (~9%/năm)',
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

export const getRecommendedProducts = (occupation) => {
  if (!occupation || occupation === 'ALL') {
    return LOAN_PRODUCTS;
  }
  const matched = LOAN_PRODUCTS.filter(p => p.targetOccupations.includes(occupation));
  const others = LOAN_PRODUCTS.filter(p => !p.targetOccupations.includes(occupation));
  return [...matched, ...others];
};

export const getProductById = (id) => {
  return LOAN_PRODUCTS.find(p => p.id === id) || LOAN_PRODUCTS[0];
};

export const formatVND = (val) => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND', 
    maximumFractionDigits: 0 
  }).format(val || 0);
};
