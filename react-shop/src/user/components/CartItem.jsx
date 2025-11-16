import { useCart } from '../context/CartContext';
import { BACKEND_URL } from '../../api/httpAxios';

const getImageUrl = (imageUrl) => {
  if (imageUrl) {
    return `${BACKEND_URL}${imageUrl}`;
  }
  return 'https://placehold.co/400x400?text=No+Image';
};

export default function CartItem({ item }) {
  const { updateQty, removeFromCart } = useCart();

  // quantity: số lượng trong giỏ
  // stock: số lượng tồn kho

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQty(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    // Chỉ tăng nếu số lượng hiện tại < tồn kho
    if (item.quantity < item.stock) {
      updateQty(item.id, item.quantity + 1);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-white">
      <img
        src={getImageUrl(item.imageUrl)}
        alt={item.name}
        className="w-20 h-20 object-cover rounded"
        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x400?text=Error'; }}
      />
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-600">{item.price.toLocaleString('vi-VN')}đ</p>
        
        {/* Hiển thị thông báo nếu hết hàng */}
        {item.quantity >= item.stock && (
            <p className="text-xs text-red-500 font-medium">Đã đạt tối đa</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Nút Giảm */}
        <button
          onClick={handleDecrease}
          disabled={item.quantity === 1}
          className="w-8 h-8 flex items-center justify-center border rounded 
                     hover:bg-gray-100 text-lg font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
        >
          -
        </button>

        <span className="w-12 text-center text-lg font-semibold">{item.quantity}</span>
        
        {/* Nút Tăng */}
        <button
          onClick={handleIncrease}
          disabled={item.quantity >= item.stock}
          className="w-8 h-8 flex items-center justify-center border rounded 
                     hover:bg-gray-100 text-lg font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
        >
          +
        </button>
      </div>
      <button
        onClick={() => removeFromCart(item.id)}
        className="text-red-500 hover:text-red-700"
      >
        Xóa
      </button>
    </div>
  );
}