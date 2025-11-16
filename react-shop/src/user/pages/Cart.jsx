// src/user/pages/Cart.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const { cart, getTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-xl text-gray-600 mb-6">Giỏ hàng trống</p>
        <Link 
          to="/products" 
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 no-underline"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Giỏ hàng</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map(item => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <div className="bg-gray-50 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Tổng cộng</h2>
          <div className="flex justify-between text-lg font-semibold">
            <span>Tổng tiền:</span>
            <span>{getTotal().toLocaleString('vi-VN')}đ</span>
          </div>
          <Link
            to="/checkout"
            className="block mt-6 bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 no-underline"
          >
            Tiến hành thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
}