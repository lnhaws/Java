import { useState, useEffect } from 'react';
import { userAPI, BACKEND_URL } from '../../api/httpAxios';
// import LoadingSpinner from '../components/LoadingSpinner';

const getImageUrl = (imageUrl) => {
  if (imageUrl) {
    return `${BACKEND_URL}${imageUrl}`;
  }
  return 'https://placehold.co/400x400?text=No+Image';
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); 

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await userAPI.getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải đơn hàng:", err);
      setError("Không thể tải lịch sử đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này? (Hàng sẽ được hoàn lại kho)")) {
      return;
    }
    setMessage(null);
    try {
      const res = await userAPI.cancelMyOrder(orderId); 
      const cancelledOrder = res.data;
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? cancelledOrder : order
        )
      );
      setMessage({ type: 'success', text: 'Hủy đơn hàng thành công.' });
    } catch (err) {
      console.error("Lỗi hủy đơn hàng:", err);
      const errorText = err.response?.data?.error || "Không thể hủy đơn hàng.";
      setMessage({ type: 'error', text: errorText });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString('vi-VN', options);
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-800' };
      case 'processing':
        return { text: 'Đang giao', class: 'bg-blue-100 text-blue-800' };
      case 'completed':
        return { text: 'Hoàn thành', class: 'bg-green-100 text-green-800' };
      case 'cancelled':
        return { text: 'Đã hủy', class: 'bg-red-100 text-red-800' };
      default:
        return { text: status || 'Không rõ', class: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải đơn hàng...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-green-800 mb-8 border-b border-gray-300 pb-4">
          Đơn hàng của tôi
        </h1>
        
        {message && (
          <div className={`p-4 rounded-md mb-6 text-center font-medium ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center text-gray-500">
            Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const statusDisplay = getStatusDisplay(order.status);
              return (
                <div key={order.id} className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                  {/* Header */}
                  <div className="px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-200">
                    <div>
                      <span className="font-bold text-gray-800 text-lg">Đơn hàng #{order.id}</span>
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="text-sm text-gray-500">
                        Ngày đặt: {formatDate(order.orderDate)}
                      </span>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusDisplay.class}`}>
                        {statusDisplay.text}
                      </span>
                    </div>
                  </div>

                  {/* Danh sách sản phẩm */}
                  <div className="px-6 py-2 divide-y divide-gray-100">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getImageUrl(item.imageUrl)} 
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                          <div>
                            <p className="font-medium text-gray-800">{item.productName}</p>
                            {/* === SỬA TẠI ĐÂY === */}
                            <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                            {/* === HẾT SỬA === */}
                          </div>
                        </div>
                        <p className="font-medium">
                          {item.total.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center">
                    <div>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="px-4 py-2 rounded-md border border-red-500 text-red-600 
                                     text-sm font-medium 
                                     hover:bg-red-500 hover:text-white transition-colors duration-200"
                        >
                          Hủy đơn hàng
                        </button>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-gray-600 mr-2">Tổng tiền:</span>
                      <span className="text-xl font-bold text-red-600">
                        {order.totalAmount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}