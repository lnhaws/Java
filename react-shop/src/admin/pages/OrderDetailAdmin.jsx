import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI, BACKEND_URL } from '../../api/httpAxios';
// import LoadingSpinner from '../components/LoadingSpinner';

// (Hàm tiện ích)
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'processing': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'completed': return 'bg-green-100 text-green-800 border-green-300';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100';
  }
};
// (Hàm tiện ích)
const getImageUrl = (imageUrl) => {
  if (imageUrl) {
    return `${BACKEND_URL}${imageUrl}`;
  }
  return 'https://placehold.co/400x400?text=No+Image';
};

// === MỚI: Hàm định dạng PTTT ===
const formatPaymentMethod = (method) => {
  if (method === 'cod') {
    return 'Thanh toán khi nhận hàng (COD)';
  }
  if (method === 'bank') {
    return 'Chuyển khoản ngân hàng';
  }
  return method || 'Chưa rõ';
};

export default function OrderDetailAdmin() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrderDetails();
  }, [id]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAPI.getOrderById(id);
      setOrder(res.data);
    } catch (err) {
      console.error("Lỗi tải chi tiết đơn hàng:", err);
      setError("Không thể tải đơn hàng. (Có thể đã bị xóa).");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setOrder(prev => ({ ...prev, status: newStatus }));
    
    try {
      await adminAPI.updateOrderStatus(order.id, { status: newStatus });
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
      alert("Cập nhật thất bại!");
      loadOrderDetails();
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('vi-VN', options);
  };

  if (loading) return <div className="p-6 text-center">Đang tải chi tiết đơn hàng...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!order) return <div className="p-6">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Chi tiết Đơn hàng #{order.id}
        </h1>
        <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 no-underline">
          &larr; Quay lại danh sách
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CỘT TRÁI (Danh sách sản phẩm) */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Các sản phẩm</h2>
            <div className="text-right">
              <span className="text-gray-600 mr-2">Tổng tiền:</span>
              <span className="text-xl font-bold text-red-600">
                {order.totalAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4">
                <img 
                  src={getImageUrl(item.imageUrl)} 
                  alt={item.productName}
                  className="w-16 h-16 object-cover rounded-md border"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    Giá: {item.price.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-sm text-gray-500">
                    Số lượng: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  {item.total.toLocaleString('vi-VN')}đ
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI (Thông tin khách hàng & Trạng thái) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">Trạng thái đơn hàng</h2>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`w-full py-2 px-3 text-sm rounded-md border font-medium cursor-pointer focus:outline-none ${getStatusColor(order.status)}`}
            >
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-3 border-b pb-2">Thông tin khách hàng</h2>
            {/* === SỬA TẠI ĐÂY === */}
            <div className="space-y-2 text-sm">
              <p><strong>Tên:</strong> {order.username}</p>
              <p><strong>Số điện thoại:</strong> {order.phone}</p>
              <p><strong>Địa chỉ:</strong> {order.address}</p>
              <p><strong>Ngày đặt:</strong> {formatDate(order.orderDate)}</p>
              <p><strong>Thanh toán:</strong> {formatPaymentMethod(order.paymentMethod)}</p>
            </div>
            {/* === HẾT SỬA === */}
          </div>
        </div>

      </div>
    </div>
  );
}