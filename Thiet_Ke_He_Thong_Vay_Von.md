# BẢN THIẾT KẾ CHI TIẾT GIAO DIỆN VÀ CHỨC NĂNG - HỆ THỐNG LOMS

---

## I. KÊNH KHÁCH HÀNG (CUSTOMER PORTAL / APP)

### 1. Nhóm trang BẮT BUỘC PHẢI CÓ (Must-Have)

#### 1. Trang chủ / Đăng ký khoản vay
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Điểm chạm đầu tiên (Landing/Home). Thu hút khách hàng và cho phép họ tính toán sơ bộ khoản vay.
*   **UI Components:**
    *   **Hero Banner:** Hiển thị USP (Ưu điểm sản phẩm vay).
    *   **Loan Calculator Widget:** 2 thanh trượt (Slider) để chọn "Số tiền vay" và "Thời hạn vay".
    *   **Bảng tóm tắt:** Hiển thị tự động Lãi suất dự kiến, Tổng tiền phải trả, và Tiền trả hàng tháng (EMI).
    *   **CTA Button:** Nút "Đăng ký ngay" nổi bật.
*   **Logic:** Công thức tính toán khoản vay (Dư nợ giảm dần hoặc Gốc đều) chạy realtime bằng JavaScript khi kéo slider.

#### 2. Đăng ký / Đăng nhập / Xác thực OTP
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Xác thực định danh ban đầu.
*   **UI Components:**
    *   Input: Nhập Số điện thoại.
    *   Input: Ô nhập mã OTP 6 số (Auto-focus, hỗ trợ đọc SMS tự động trên mobile).
    *   Nút "Gửi lại OTP" (Kèm đồng hồ đếm ngược 60s).
    *   Biometrics Icon: Đăng nhập bằng FaceID/Fingerprint (cho user cũ).
*   **Logic:** Block user 15 phút nếu nhập sai OTP 5 lần liên tiếp.

#### 3. Xác thực danh tính (eKYC)
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Chống giả mạo, trích xuất dữ liệu tự động.
*   **UI Components:**
    *   **Khung chụp CCCD:** Camera view với tỷ lệ khung chữ nhật, có lớp phủ (overlay) hướng dẫn đặt thẻ đúng vị trí.
    *   **Khung Liveness:** Camera mặt trước hình Oval, hiển thị text hướng dẫn (Quay trái, mỉm cười).
    *   **Màn hình Confirm:** Hiển thị lại các text OCR đã bóc tách (Họ tên, Số CCCD...) để khách hàng xác nhận.
*   **Logic:** Hệ thống so sánh khuôn mặt (Face Matching) và ảnh trên CCCD. Tỷ lệ khớp phải >= 80%.

#### 4. Tạo hồ sơ vay (Form thông tin)
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Thu thập dữ liệu rủi ro.
*   **UI Components:**
    *   **Stepper:** Chia thành các bước (1. Cá nhân -> 2. Nghề nghiệp -> 3. Tham chiếu).
    *   **Fields:** Dropdown (Nghề nghiệp, Mức thu nhập), Input (Tên công ty, SĐT người thân).
*   **Logic:** Các trường thông tin từ eKYC bị Disable (Không cho sửa). Validate bắt buộc 2 người tham chiếu khác nhau.

#### 5. Tải lên chứng từ (Document Upload)
*   **Mức độ quan trọng:** Chủ chốt (4/5)
*   **Chức năng:** Cung cấp tài liệu chứng minh thu nhập/nơi ở.
*   **UI Components:**
    *   **Upload Zone:** Khung kéo thả hoặc nút "Mở thư viện/Camera".
    *   **List Upload:** Hiển thị thumbnail của file (Bảng lương, HĐLĐ), dung lượng file, nút Xóa.
*   **Logic:** Hỗ trợ JPG, PNG, PDF. Giới hạn dung lượng 10MB/file. Bắt buộc có chứng từ nếu chọn gói vay tín chấp qua lương.

#### 6. Xem & Ký hợp đồng điện tử
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Gắn kết trách nhiệm pháp lý.
*   **UI Components:**
    *   **PDF Viewer:** Hiển thị nguyên văn hợp đồng có watermark.
    *   **Checkbox:** "Tôi đã đọc và đồng ý...".
    *   **OTP/E-Signature:** Khung nhập mã OTP để thay thế chữ ký điện tử.
*   **Logic:** Checkbox chỉ được Enable khi người dùng cuộn (scroll) đến cuối trang PDF hợp đồng.

#### 7. Quản lý khoản vay (Dashboard)
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Trung tâm thông tin dành cho Khách hàng.
*   **UI Components:**
    *   **Loan Status Tracker:** Thanh tiến trình (Khởi tạo -> Đang thẩm định -> Chờ ký HĐ -> Giải ngân).
    *   **Active Loan Card:** Hiển thị Dư nợ hiện tại, Số tiền kỳ tới, Hạn chót thanh toán (màu đỏ nếu sắp đến hạn).
    *   **Nút thao tác:** "Thanh toán ngay", "Xem chi tiết lịch trả nợ".
*   **Logic:** Giao diện thay đổi động theo Trạng thái hồ sơ. Nếu hồ sơ bị "Yêu cầu bổ sung", nút "Cập nhật hồ sơ" sẽ hiện lên.

#### 8. Thanh toán / Giải ngân
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Luân chuyển dòng tiền.
*   **UI Components:**
    *   **Tab Giải ngân:** Dropdown chọn ngân hàng nhận tiền, nhập STK. Tích hợp API kiểm tra tên chủ tài khoản thật.
    *   **Tab Thanh toán:** Sinh mã QR (VietQR) tĩnh hoặc động (chứa số tiền) & Số tài khoản định danh (Virtual Account - VA). Có nút "Sao chép".
*   **Logic:** Bắt buộc Tên chủ tài khoản nhận giải ngân phải TRÙNG với Tên trên CCCD (eKYC).

### 2. Nhóm trang PHỤ / MỞ RỘNG (Nice-to-Have)

#### 9. Trang chi tiết Lịch sử giao dịch (3/5)
*   **Chức năng & UI:** List view dạng Timeline hiển thị các giao dịch giải ngân, trả gốc, trả lãi, phí phạt. Có bộ lọc theo thời gian. Trạng thái giao dịch (Thành công/Thất bại).

#### 10. Hồ sơ cá nhân & Cài đặt (3/5)
*   **Chức năng & UI:** Quản lý tài khoản. Bao gồm form đổi Email, địa chỉ hiện tại. Các Toggle bật/tắt Đăng nhập sinh trắc học, đổi mã PIN.

#### 11. Trung tâm thông báo (3/5)
*   **Chức năng & UI:** Biểu tượng cái chuông trên Header. Màn hình list các Notification (Nhắc nợ, Báo giải ngân thành công). Hiển thị text in đậm cho thông báo chưa đọc.

#### 12. Hỗ trợ & Trợ giúp (2/5)
*   **Chức năng & UI:** Chia làm 2 phần: (1) Danh sách Accordion các câu hỏi FAQ. (2) Bong bóng Chat ở góc phải để mở cửa sổ Chatbot / Livechat.

#### 13. Giới thiệu bạn bè (Referral) (2/5)
*   **Chức năng & UI:** Hiển thị Mã giới thiệu (Ref code) / QR Code hoặc Nút "Chia sẻ Link". Theo dõi số người đã giới thiệu và hoa hồng/Voucher nhận được.

---

## II. KÊNH QUẢN TRỊ & VẬN HÀNH (ADMIN & OPERATIONS PORTAL)

### 1. Nhóm trang BẮT BUỘC PHẢI CÓ (Must-Have)

#### 14. Tổng quan Quản trị (Dashboard)
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **UI Components:**
    *   **KPI Widgets:** Số hồ sơ chờ xử lý, Tổng giải ngân (theo ngày/tháng), Nợ xấu (NPL).
    *   **Charts:** Biểu đồ đường (Line chart) thể hiện tốc độ giải ngân, Biểu đồ tròn (Pie chart) tỷ lệ duyệt/từ chối.
*   **Logic:** Dữ liệu có thể lọc theo chi nhánh, phòng ban hoặc toàn hệ thống.

#### 15. Danh sách Hồ sơ vay (LOS List)
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **UI Components:**
    *   **Bảng dữ liệu (Data Table):** Cột (Mã HS, Tên KH, Số tiền, Trạng thái, Ngày tạo, SLA Timer).
    *   **Bộ lọc (Filters):** Lọc theo trạng thái, sản phẩm vay, thời gian. Thanh tìm kiếm nhanh.
*   **Logic:** Nhân viên thẩm định chỉ nhìn thấy các hồ sơ được phân công (Assign) cho chính họ (Trừ trưởng nhóm/Admin).

#### 16. Chi tiết Hồ sơ & Thẩm định
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Không gian làm việc chính để ra quyết định tín dụng.
*   **UI Components:** 
    *   **Split-view 3 cột:** 
        *   (Trái): Thông tin nhân khẩu học.
        *   (Giữa): Điểm CIC, Chấm điểm tín dụng, cảnh báo Blacklist.
        *   (Phải): Trình xem PDF/Ảnh (Zoom in/out tài liệu).
    *   **Action Bar:** Các nút Chấp thuận (Approve), Yêu cầu bổ sung (RFI), Từ chối (Reject).
*   **Logic:** Buộc nhân viên phải check vào ô "Đã kiểm tra CIC" thì nút Approve mới sáng lên.

#### 17. Danh sách Khoản vay (LMS List)
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Quản lý vòng đời sau khi giải ngân.
*   **UI Components:** Data table với các trạng thái khoản vay (Active, Đóng, Quá hạn). Cột hiển thị Dư nợ gốc còn lại và DPD (Days Past Due - Số ngày quá hạn).

#### 18. Lập lệnh Giải ngân
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **Chức năng:** Dành cho Kế toán xuất tiền.
*   **UI Components:** Bảng danh sách các hồ sơ ở trạng thái "Chờ giải ngân". Cột số tài khoản ngân hàng của khách. Checkbox để chọn nhiều hồ sơ và nút "Lập lệnh Batch / Giải ngân hàng loạt".
*   **Logic:** Tích hợp API ngân hàng (Core Banking) để truyền lệnh chi. Cập nhật trạng thái thành công/thất bại theo webhook trả về.

#### 19. Quản lý Thu nợ & Đối soát
*   **Mức độ quan trọng:** Chủ chốt (4/5)
*   **Chức năng:** Ghi nhận tiền vào.
*   **UI Components:** Bảng đối soát giữa Tiền ngân hàng báo có vs Tiền phải thu hệ thống. Chức năng Upload file sao kê Excel (đối soát thủ công) hoặc auto-match qua VA.
*   **Logic:** Ưu tiên trừ tiền theo thứ tự: Phí phạt -> Lãi quá hạn -> Lãi trong hạn -> Dư nợ gốc.

#### 20. Quản lý Nợ xấu & Nhắc nợ (Collection)
*   **Mức độ quan trọng:** Chủ chốt (4/5)
*   **Chức năng:** Thu hồi nợ.
*   **UI Components:** 
    *   **Danh sách phân lớp:** Bucket 1 (Quá hạn 1-15 ngày), Bucket 2 (16-30 ngày), Bucket 3 (>30 ngày).
    *   **Khung Call Log:** Giao diện bên phải để Telesale nhập kết quả cuộc gọi (Khách hẹn trả, Thuê bao, Không nghe máy) và đặt lịch hẹn gọi lại.
*   **Logic:** Hồ sơ tự động chuyển qua các Bucket tùy theo số ngày quá hạn (DPD).

#### 21. Quản lý Khách hàng (CRM)
*   **Mức độ quan trọng:** Chủ chốt (4/5)
*   **UI Components:** Màn hình Customer 360 view. Hiển thị thông tin cá nhân và một bảng danh sách tất cả các khoản vay (cũ & mới) của khách hàng đó trong hệ thống. Lịch sử các lần nhắc nợ.

#### 22. Phân quyền & Tài khoản (IAM)
*   **Mức độ quan trọng:** Rất cao (5/5)
*   **UI Components:** Bảng danh sách User (Nhân viên). Form tạo User mới gán với Role (Dropdown chọn Role: Sales, Underwriter, Accountant, Admin, Collection). Matrix bảng Checkbox để Admin custom quyền cho từng Role.

### 2. Nhóm trang PHỤ / MỞ RỘNG (Nice-to-Have)

#### 23. Cấu hình Sản phẩm vay (4/5)
*   **Chức năng & UI:** Form tạo/sửa Gói vay. Các trường nhập liệu: Min/Max Số tiền, Min/Max Kỳ hạn, Loại lãi suất (Cố định/Thả nổi), Công thức tính (Gốc đều/Dư nợ giảm dần). Dùng để hệ thống tự render trên App Khách hàng.

#### 24. Cấu hình Quy tắc duyệt (Rule Engine) (3/5)
*   **Chức năng & UI:** Giao diện dạng Flowchart hoặc Condition Builder (IF/THEN). Ví dụ: `IF [Tuổi] < 18 THEN [Auto-Reject]`. `IF [CIC] == Nhóm 3 THEN [Gửi Thẩm định thủ công]`.

#### 25. Cấu hình Mẫu hợp đồng & SMS/Email (3/5)
*   **Chức năng & UI:** Editor dạng Rich Text (như Word) cho Hợp đồng và Editor text thường cho SMS. Sử dụng các biến nội suy (variables) như `{{CustomerName}}`, `{{LoanAmount}}` để hệ thống tự động điền khi sinh văn bản.

#### 26. Báo cáo Chuyên sâu (Reports & BI) (4/5)
*   **Chức năng & UI:** Màn hình xuất (Export) báo cáo. Cho phép chọn loại báo cáo (Vintage Analysis, Roll-rate, NPL, TAT Thẩm định viên). Nút "Xuất Excel / PDF". 

#### 27. Lịch sử thao tác (Audit Logs) (3/5)
*   **Chức năng & UI:** Bảng log bảo mật (Read-only). Hiển thị: Thời gian, User ID, Địa chỉ IP, Hành động (Thêm/Sửa/Xóa/Approve), Đối tượng tác động (Mã hồ sơ). Dùng để tra soát khi có sự cố. 
