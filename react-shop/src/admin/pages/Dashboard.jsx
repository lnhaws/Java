import { useAdminAuth } from '../context/AdminAuthContext';
import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/httpAxios';
// import LoadingSpinner from '../components/LoadingSpinner'; 

// Hàm đếm danh mục (giữ nguyên)
const flattenCategoriesForRender = (categories, level = 0) => {
  let flatList = [];
  if (!categories) return flatList;
  for (const cat of categories) {
    flatList.push({ ...cat, level: level });
    if (cat.children && cat.children.length > 0) {
      flatList = flatList.concat(flattenCategoriesForRender(cat.children, level + 1));
    }
  }
  return flatList;
};

export default function Dashboard() {
  const { admin } = useAdminAuth();

  const [stats, setStats] = useState({
    productCount: 0,
    categoryCount: 0,
    todayOrderCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const [prodRes, catRes, orderRes] = await Promise.all([
          adminAPI.getProducts(),
          adminAPI.getCategories(),
          adminAPI.getOrders()
        ]);

        // 1. Đếm sản phẩm (đúng)
        const productCount = prodRes.data.length;

        // 2. Đếm danh mục (đúng)
        const flatCategories = flattenCategoriesForRender(catRes.data);
        const categoryCount = flatCategories.length;

        // === SỬA LỖI TIMEZONE TẠI ĐÂY ===
        
        // 3. Lấy ngày local (giờ Việt Nam) thay vì UTC
        // (Cách này sẽ lấy đúng ngày 15/11/2025)
        const localDate = new Date();
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, '0');
        const day = String(localDate.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`; // Sẽ ra "2025-11-15"

        // 4. Sửa tên trường từ 'created_at' thành 'orderDate' (cho khớp DTO)
        const todayOrderCount = orderRes.data.filter(order => 
          order.orderDate && order.orderDate.startsWith(today)
        ).length;
        
        // === HẾT SỬA ===

        setStats({
          productCount,
          categoryCount,
          todayOrderCount, // (Giờ sẽ hiển thị 1)
        });

      } catch (err) {
        console.error("Lỗi tải dashboard data:", err);
        setError("Không thể tải được dữ liệu thống kê.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []); // Chạy 1 lần khi component mount

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Chào mừng, {admin?.username}!</h1>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Chào mừng, {admin?.username}!</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Lỗi: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Chào mừng, {admin?.username}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Tổng sản phẩm</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.productCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Danh mục</h3>
          <p className="text-3xl font-bold text-green-600">{stats.categoryCount}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Đơn hàng hôm nay</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.todayOrderCount}</p>
        </div>
      </div>
    </div>
  );
}