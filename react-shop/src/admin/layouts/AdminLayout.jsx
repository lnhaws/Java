import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 1. Sidebar (đứng yên) */}
      {/* Component AdminSidebar đã có h-screen nên nó sẽ chiếm toàn bộ chiều cao */}
      <AdminSidebar />

      {/* 2. Khu vực nội dung chính (Cho phép cuộn) */}
      {/* - flex-1: Chiếm toàn bộ không gian còn lại
        - overflow-y-auto: TỰ ĐỘNG THÊM THANH CUỘN khi nội dung dài hơn
      */}
      <main className="flex-1 overflow-y-auto">
        {/* Đây là nơi các trang con (Product, Category) sẽ hiển thị */}
        <Outlet />
      </main>
    </div>
  );
}
