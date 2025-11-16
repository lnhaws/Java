# 🍓 Dự án FruitShop (React + Spring Boot)

Đây là một dự án website thương mại điện tử Full-Stack hoàn chỉnh, xây dựng bằng React.js (Frontend) và Spring Boot (Backend). Dự án mô phỏng một cửa hàng trực tuyến chuyên bán trái cây, nước ép và các sản phẩm liên quan.

## ✨ Tính năng chính

### 👤 Khách hàng (User)
* **Xác thực:** Đăng ký, Đăng nhập (JWT).
* **Hồ sơ:** Xem và cập nhật thông tin cá nhân (Tên hiển thị, SĐT, Địa chỉ) và thay đổi ảnh đại diện (avatar).
* **Sản phẩm:** Xem, tìm kiếm và lọc sản phẩm theo danh mục (cha/con) và khoảng giá.
* **Chi tiết sản phẩm:** Xem chi tiết, chọn size (S/M/L) hoặc khối lượng (/kg).
* **Giỏ hàng:** Thêm, xóa, cập nhật số lượng (kiểm tra tồn kho).
* **Thanh toán:** Tự động điền thông tin, chọn phương thức thanh toán (COD/Chuyển khoản) và đặt hàng.
* **Đơn hàng:** Xem lịch sử "Đơn hàng của tôi" và hủy đơn hàng (nếu đang "Chờ xử lý").

### 🔒 Quản trị viên (Admin)
* **Dashboard:** Xem thống kê nhanh (Tổng sản phẩm, danh mục, đơn hàng hôm nay).
* **Quản lý Danh mục:** Tạo, sửa, xóa danh mục (hỗ trợ 2 cấp cha-con).
* **Quản lý Sản phẩm:** Tạo, sửa, xóa sản phẩm (bao gồm upload ảnh, giá theo size).
* **Quản lý Đơn hàng:** Xem tất cả đơn hàng, xem chi tiết, và cập nhật trạng thái (Chờ xử lý, Đang giao, Hoàn thành, Đã hủy).

## 💻 Công nghệ sử dụng

* **Backend:** Java 17+, Spring Boot 3, Spring Security (JWT), Spring Data JPA.
* **Frontend:** React.js, React Router, Axios, Tailwind CSS.
* **Database:** MySQL (hoặc H2, PostgreSQL - dễ dàng cấu hình).

---

## 🚀 Hướng dẫn Cài đặt & Chạy

Dự án này gồm 2 phần (Backend và Frontend) chạy độc lập. Bạn cần mở 2 cửa sổ terminal.

### 1. 🛠️ Backend (Spring Boot - Port 8080)

1.  **Yêu cầu:** JDK 17+ (Java 1Nghiệm
Khởi động Backend và Frontend.

Đăng ký tài khoản User: Tự đăng ký một tài khoản khách hàng mới (ví dụ: "user_test" / "123456").

Đăng nhập Admin:

Đi đến http://localhost:3000/admin/login

Username: admin

Password: admin123

Tạo sản phẩm: Dùng tài khoản Admin, vào "Quản lý Sản phẩm" và tạo một vài sản phẩm (nhớ chọn đúng danh mục con như "Táo", "Nước ép Cam").
Mua hàng: Đăng xuất Admin, đăng nhập bằng tài khoản "user_test" và bắt đầu mua sắm.


📚 Tài liệu API (API Docs)
1. Xác thực (/api/auth)
Phương thức,Endpoint,Bảo vệ,Chức năng
POST,/login,Public,"Đăng nhập, trả về (Token, Role, Username, DisplayName)."
POST,/register,Public,"Đăng ký (gửi displayName, username, password, role)."
GET,/me,User,Lấy thông tin chi tiết (profile) của user đang đăng nhập.
GET,/users,Admin,(Chỉ Admin) Lấy danh sách tất cả user.

2. Người dùng (/api/users)
Phương thức,Endpoint,Bảo vệ,Chức năng
PUT,/profile,User,"Cập nhật hồ sơ (gửi MultipartFile image, displayName, phone, address)."

3. Sản phẩm (/api/products)
Phương thức,Endpoint,Bảo vệ,Chức năng
GET,/,Public,Lấy tất cả sản phẩm.
GET,/{id},Public,Lấy chi tiết 1 sản phẩm.
POST,/,Admin,Tạo sản phẩm mới (gửi MultipartFile image và các trường khác).
PUT,/{id},Admin,Cập nhật sản phẩm (gửi MultipartFile image).
DELETE,/{id},Admin,Xóa sản phẩm.

4. Danh mục (/api/categories)
Phương thức,Endpoint,Bảo vệ,Chức năng
GET,/,Public,Lấy tất cả danh mục (dạng cây).
POST,/,Admin,"Tạo danh mục mới (gửi name, parentId)."
PUT,/{id},Admin,Cập nhật danh mục.
DELETE,/{id},Admin,Xóa danh mục.

5. Đơn hàng (/api/orders)
Phương thức,Endpoint,Bảo vệ,Chức năng
POST,/,User,Tạo đơn hàng mới (Checkout).
GET,/my-orders,User,Lấy lịch sử đơn hàng của user đang đăng nhập.
PUT,/{id}/cancel,User,"Hủy đơn hàng (chỉ khi status là ""pending"")."
GET,/,Admin,(Chỉ Admin) Lấy tất cả đơn hàng.
GET,/{id},Admin,(Chỉ Admin) Lấy chi tiết 1 đơn hàng.
PUT,/{id}/status,Admin,(Chỉ Admin) Cập nhật trạng thái đơn hàng.


