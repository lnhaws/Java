import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/httpAxios';
import { useNavigate } from 'react-router-dom'; // <-- 1. IMPORT

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // <-- 2. KHỞI TẠO

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getOrders();
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      alert("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await adminAPI.updateOrderStatus(orderId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Cập nhật trạng thái thất bại!");
      loadOrders();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100';
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Quản lý Đơn hàng</h1>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Mã ĐH</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Khách hàng</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Ngày đặt</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Tổng tiền</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Trạng thái</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">#{order.id}</td>
                <td className="p-4">
                  <div className="font-medium text-gray-900">{order.username}</div>
                  <div className="text-sm text-gray-500">{order.phone}</div>
                </td>
                <td className="p-4 text-gray-600">
                  {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                  <br />
                  <span className="text-xs">
                    {new Date(order.orderDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </td>
                <td className="p-4 font-bold text-gray-900">
                  {order.totalAmount.toLocaleString('vi-VN')}đ
                </td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`py-1 px-2 text-sm rounded-md border font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(order.status)}`}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang giao</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
                
                {/* === 3. SỬA CỘT NÀY === */}
                <td className="p-4 text-sm text-gray-500">
                  <button
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                    className="text-blue-600 hover:text-blue-800 font-medium no-underline"
                  >
                    Xem
                  </button>
                </td>
                {/* === HẾT SỬA === */}
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">Chưa có đơn hàng nào.</div>
        )}
      </div>
    </div>
  );
}