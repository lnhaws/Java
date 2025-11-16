import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { BACKEND_URL } from '../../api/httpAxios';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();

  const hasMultipleSizes = useMemo(() => {
    if (!product) return false;
    return product.priceM && product.priceM > 0;
  }, [product]);

  const displayPrice = () => {
    if (!product.priceS) {
      return "Liên hệ"; 
    }
    if (hasMultipleSizes) {
      const prices = [product.priceS, product.priceM, product.priceL].filter(p => p > 0);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return `${min.toLocaleString('vi-VN')}đ - ${max.toLocaleString('vi-VN')}đ`;
    }
    return `${product.priceS.toLocaleString('vi-VN')}đ`;
  };

  const getImageUrl = (imageUrl) => {
    if (imageUrl) {
      return `${BACKEND_URL}${imageUrl}`;
    }
    return 'https://placehold.co/600x400?text=No+Image';
  };

  const handleActionClick = () => {
    if (hasMultipleSizes) {
      navigate(`/products/${product.id}`);
    } else {
      if (!user) {
        navigate('/login', { state: { from: location } });
        return;
      }
      
      // === SỬA LỖI ID ===
      const productToAdd = {
        ...product, // Giữ lại (imageUrl, name, v.v...)

        // 1. ID Gốc (cho Backend)
        productId: product.id,
        // 2. ID Giỏ hàng (cho React)
        id: product.id, // (Vì không có size, id gốc và id giỏ hàng là một)

        price: product.priceS,
        quantity: 1, // Số lượng user CHỌN
        stock: product.quantity // Số lượng TỒN KHO
      };
      // === HẾT SỬA ===
      
      addToCart(productToAdd);
    }
  };

  if (!product) return null;

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-white flex flex-col">
      <Link to={`/products/${product.id}`} className="block overflow-hidden relative" style={{ paddingTop: '75%' }}>
        <img
          src={getImageUrl(product.imageUrl)}
          alt={product.name}
          className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400?text=Error'; }}
        />
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-1 truncate" title={product.name}>
          {product.name}
        </h3>
        
        <p className="text-xl font-bold text-green-600 mb-3 min-h-[32px]">
          {displayPrice()}
          {!hasMultipleSizes && product.priceS > 0 && ' /kg'}
        </p>
        
        <div className="mt-auto">
          <button
            onClick={handleActionClick}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-200"
          >
            {hasMultipleSizes ? 'Xem chi tiết' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
}