import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { userAPI, BACKEND_URL } from '../../api/httpAxios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Hàm lấy ảnh
const getImageUrl = (imageUrl) => {
  if (imageUrl) {
    return `${BACKEND_URL}${imageUrl}`;
  }
  return 'https://placehold.co/400x400?text=No+Image';
};

export default function Checkout() {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [form, setForm] = useState({ 
    name: user?.displayName || user?.username || '',
    phone: user?.phone || '', 
    address: user?.address || '', 
    note: '' 
  });
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' là mặc định
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Tự động điền form
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.displayName || user.username,
        phone: user.phone || prev.phone,
        address: user.address || prev.address
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
        setError("Giỏ hàng của bạn đang trống.");
        return;
    }
    setLoading(true);
    setError(null);

    const orderData = {
      phone: form.phone,
      address: form.address,
      note: form.note,
      paymentMethod: paymentMethod, // Thêm PTTT
      items: cart.map((i) => ({
        productId: i.productId, 
        quantity: i.quantity, 
        price: i.price,
        productName: i.name 
      })),
    };

    try {
      await userAPI.createOrder(orderData); 
      setLoading(false);
      clearCart();
      alert('Đặt hàng thành công! Cảm ơn bạn đã mua hàng.');
      navigate('/my-orders'); 
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError(err.response?.data?.error || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  if (cart.length === 0 && !loading) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h1>
        <button onClick={() => navigate('/products')} className="bg-green-600 text-white py-2 px-6 rounded font-bold hover:bg-green-700">
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-8 text-center text-green-800">Xác nhận Đơn hàng</h1>
        
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Cột Form thông tin (bao gồm PTTT) */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <h2 className="text-xl font-semibold mb-3">1. Thông tin giao hàng</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên (Người nhận)</label>
                <input
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  placeholder="09..." type="tel" required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                <textarea
                  placeholder="Ví dụ: Giao hàng vào giờ hành chính..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  rows="3"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              {/* Khối chọn PTTT */}
              <div className="border-t pt-4">
                <h2 className="text-xl font-semibold mb-4">2. Phương thức thanh toán</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-3 font-medium">Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-3 font-medium">Chuyển khoản ngân hàng</span>
                  </label>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:bg-gray-400 mt-6"
              >
                {loading ? 'Đang xử lý...' : 'Hoàn tất Đặt hàng'}
              </button>
              
              {error && (
                <p className="text-red-600 text-sm text-center mt-2">{error}</p>
              )}
            </form>
          </div>
          
          {/* Cột tóm tắt đơn hàng (đã thêm ảnh) */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 h-fit">
            <h2 className="text-xl font-semibold mb-5 border-b pb-3">Đơn hàng của bạn</h2>
            <div className="space-y-4 divide-y divide-gray-100">
              {cart.map((i) => (
                <div key={i.id} className="flex items-center gap-4 pt-4 first:pt-0">
                  <img 
                    src={getImageUrl(i.imageUrl)} 
                    alt={i.name}
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{i.name}</p>
                    <p className="text-sm text-gray-500">Số lượng: {i.quantity}</p>
                  </div>
                  <span className="font-medium text-gray-900">
                    {(i.price * i.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span className="text-red-600">{getTotal().toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}