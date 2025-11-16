🍓 Dự án FruitShop (React + Spring Boot)

Đây là một dự án website thương mại điện tử Full-Stack hoàn chỉnh, xây dựng bằng React.js (Frontend) và Spring Boot (Backend). Dự án mô phỏng một cửa hàng trực tuyến chuyên bán trái cây, nước ép và các sản phẩm liên quan.

✨ Tính năng chính
👤 Khách hàng (User)
Xác thực: Đăng ký, Đăng nhập (JWT).

Hồ sơ: Xem và cập nhật thông tin cá nhân (Tên hiển thị, SĐT, Địa chỉ) và thay đổi ảnh đại diện (avatar).

Sản phẩm: Xem, tìm kiếm và lọc sản phẩm theo danh mục (cha/con) và khoảng giá.

Chi tiết sản phẩm: Xem chi tiết, chọn size (S/M/L) hoặc khối lượng (/kg).

Giỏ hàng: Thêm, xóa, cập nhật số lượng (kiểm tra tồn kho).

Thanh toán: Tự động điền thông tin, chọn phương thức thanh toán (COD/Chuyển khoản) và đặt hàng.

Đơn hàng: Xem lịch sử "Đơn hàng của tôi" và hủy đơn hàng (nếu đang "Chờ xử lý").

🔒 Quản trị viên (Admin)
Dashboard: Xem thống kê nhanh (Tổng sản phẩm, danh mục, đơn hàng hôm nay).

Quản lý Danh mục: Tạo, sửa, xóa danh mục (hỗ trợ 2 cấp cha-con).

Quản lý Sản phẩm: Tạo, sửa, xóa sản phẩm (bao gồm upload ảnh, giá theo size).

Quản lý Đơn hàng: Xem tất cả đơn hàng, xem chi tiết, và cập nhật trạng thái (Chờ xử lý, Đang giao, Hoàn thành, Đã hủy).

💻 Công nghệ sử dụng
Backend: Java 17+, Spring Boot 3, Spring Security (JWT), Spring Data JPA.

Frontend: React.js, React Router, Axios, Tailwind CSS.

Database: MySQL (hoặc H2, PostgreSQL - dễ dàng cấu hình).

🚀 Hướng dẫn Cài đặt & Chạy
Dự án này gồm 2 phần (Backend và Frontend) chạy độc lập. Bạn cần mở 2 cửa sổ terminal.

1. 🛠️ Backend (Spring Boot - Port 8080)
Yêu cầu: JDK 17+ (Java 17), Maven (hoặc Gradle), MySQL Server.

Cài đặt Database:

Mở MySQL Workbench (hoặc công cụ tương tự).

Tạo một database (schema) mới, ví dụ: fruitshop_db.

Cấu hình Backend:

Mở tệp src/main/resources/application.properties.

Cập nhật thông tin database của bạn:

Properties

# Cấu hình kết nối MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/fruitshop_db

spring.datasource.username=root

spring.datasource.password=matkhaucuaban

# (Quan trọng) Tự động tạo/cập nhật bảng khi chạy
spring.jpa.hibernate.ddl-auto=update

# (Tùy chọn) Chạy file data.sql để tạo dữ liệu mẫu
spring.jpa.defer-datasource-initialization=true
Chạy Backend:

Mở terminal tại thư mục gốc của backend.

(Nếu dùng Maven) Chạy: mvn spring-boot:run

(Nếu dùng Gradle) Chạy: gradle bootRun

Server sẽ chạy tại http://localhost:8080.

2. ⚛️ Frontend (React - Port 3000)
Yêu cầu: Node.js (v16+), npm.

Cấu hình Frontend:

Đảm bảo tệp src/api/httpAxios.js (hoặc file cấu hình axios của bạn) có BACKEND_URL trỏ đúng đến server Java:

JavaScript

export const BACKEND_URL = 'http://localhost:8080';
Cài đặt:

Mở terminal tại thư mục gốc của frontend (react-shop).

Chạy: npm install

Chạy Frontend:

Chạy: npm start

Trang web sẽ tự động mở tại http://localhost:3000.

3. 📂 Thư mục uploads (Quan trọng)

Để upload ảnh (avatar, sản phẩm) hoạt động, bạn cần tự tạo một thư mục tên là uploads ngang hàng với thư mục src trong dự án Spring Boot của bạn.

🧪 Hướng dẫn Sử dụng & Dữ liệu mẫu (Seed Data)

Backend này được thiết kế để tự động "seed" (gieo) dữ liệu quan trọng khi khởi động lần đầu, bao gồm tài khoản Admin, User mẫu và các Danh mục gốc.

1. Tạo file Seed Data

Để tự động tạo dữ liệu mẫu, hãy tạo một tệp mới tại src/main/java/com/example/demoSpringBoot/config/DataSeeder.java.

📄 DataSeeder.java (Tệp mới)

```java
package com.example.demoSpringBoot.config;

import com.example.demoSpringBoot.entity.Category;
import com.example.demoSpringBoot.entity.User;
import com.example.demoSpringBoot.repository.CategoryRepository;
import com.example.demoSpringBoot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedCategories();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) { // Chỉ seed nếu bảng user trống
            // Tạo Admin
            User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .displayName("Quản Trị Viên")
                .role("ADMIN")
                .phone("0123456789")
                .address("123 Admin St, Admin City")
                .build();
            userRepository.save(admin);
            
            // Tạo User mẫu
            User user = User.builder()
                .username("user")
                .password(passwordEncoder.encode("user123"))
                .displayName("Người Dùng")
                .role("USER")
                .phone("0987654321")
                .address("123 User St, User City")
                .build();
            userRepository.save(user);
        }
    }
    
    private void seedCategories() {
        if (categoryRepository.count() == 0) { // Chỉ seed nếu bảng category trống
            // 1. Tạo Danh mục cha
            Category fruit = Category.builder().name("Trái Cây").build();
            Category juice = Category.builder().name("Nước Ép Trái Cây").build();
            Category tea = Category.builder().name("Trà Trái Cây").build();
            
            categoryRepository.save(fruit);
            categoryRepository.save(juice);
            categoryRepository.save(tea);

            // 2. Tạo Danh mục con (gán cha cho chúng)
            Category apple = Category.builder().name("Táo").parent(fruit).build();
            Category orange = Category.builder().name("Cam").parent(fruit).build();
            
            Category appleJuice = Category.builder().name("Nước ép Táo").parent(juice).build();
            Category orangeJuice = Category.builder().name("Nước ép Cam").parent(juice).build();
            
            Category peachTea = Category.builder().name("Trà Đào").parent(tea).build();

            categoryRepository.save(apple);
            categoryRepository.save(orange);
            categoryRepository.save(appleJuice);
            categoryRepository.save(orangeJuice);
            categoryRepository.save(peachTea);
        }
    }
}

2. Luồng thử nghiệm (Testing Flow)
   
Sau khi khởi động cả Backend (đã có file DataSeeder.java) và Frontend:

Đăng nhập Admin:

Đi đến trang đăng nhập Admin (ví dụ: http://localhost:3000/admin/login).

Username: admin

Password: admin123 (Đây là mật khẩu đã tạo trong file DataSeeder).

Quản lý:

Vào Quản lý Danh mục để xem các danh mục ("Trái Cây", "Nước Ép", "Táo", "Trà Đào"...) đã được tạo tự động.

Vào Quản lý Sản phẩm và tạo một vài sản phẩm mới (chọn đúng danh mục con như "Táo", "Nước ép Cam").

Đăng nhập User (Khách hàng):

Đăng xuất tài khoản Admin.

Truy cập trang chủ (http://localhost:3000) và đăng nhập với tài khoản user mẫu:

Username: user

Password: user123

Mua hàng:

Dùng tài khoản "user" để duyệt các sản phẩm bạn vừa tạo, thêm vào giỏ hàng và tiến hành đặt hàng.

(Tùy chọn) Đăng ký tài khoản mới:

Bạn cũng có thể tự đăng ký một tài khoản khách hàng hoàn toàn mới (ví dụ: "testuser" / "123456") và thử nghiệm luồng mua hàng từ đầu.

📚 Tài liệu API (API Docs)
Tất cả các endpoint đều có tiền tố là /api.

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



