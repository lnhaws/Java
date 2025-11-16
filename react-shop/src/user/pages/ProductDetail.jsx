import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import { productAPI, BACKEND_URL } from '../../api/httpAxios';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard'; 

const CATEGORIES_WITH_SIZES = ['Nước Ép Trái Cây', 'Trà Trái Cây'];

const findCategoryById = (categoriesTree, id) => {
  if (!categoriesTree || !id) return null;
  for (const category of categoriesTree) {
    if (category.id === id) return category;
    if (category.children) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }
  return null;
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState('S');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); 
    setLoading(true);
    setProduct(null);
    setRelatedProducts([]);
    setQuantity(1);
    setMessage('');

    Promise.all([
      productAPI.getById(id),
      productAPI.getCategories(),
      productAPI.getAll()
    ]).then(([productRes, categoriesRes, allProductsRes]) => {
      const currentProduct = productRes.data;
      setProduct(currentProduct);
      setCategories(categoriesRes.data);
      setCurrentPrice(currentProduct.priceS || 0);
      setSelectedSize('S');

      if (currentProduct.category) {
        const related = allProductsRes.data.filter(
          p => p.category.id === currentProduct.category.id && p.id !== currentProduct.id
        );
        setRelatedProducts(related.slice(0, 3)); 
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]); 

  const hasMultipleSizes = useMemo(() => {
    if (!product || !product.category || categories.length === 0) return false;
    const parentId = product.category.parentId;
    if (!parentId) return false;
    const parentCategory = findCategoryById(categories, parentId);
    if (parentCategory && 
        CATEGORIES_WITH_SIZES.includes(parentCategory.name) && 
        product.priceM > 0
    ) {
      return true;
    }
    return false;
  }, [product, categories]);

  const handleSelectSize = (size, price) => {
    if (price > 0) {
      setSelectedSize(size);
      setCurrentPrice(price);
      setMessage('');
    } else {
      setMessage(`Size ${size} tạm thời không có sẵn.`);
    }
  };

  const handleQuantityChange = (e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > product.quantity) {
      value = product.quantity;
      setMessage(`Chỉ còn ${product.quantity} sản phẩm trong kho.`);
    } else {
      setMessage('');
    }
    setQuantity(value);
  };

  const incrementQuantity = () => {
    setQuantity(prev => {
      const newValue = prev + 1;
      if (newValue > product.quantity) {
        setMessage(`Chỉ còn ${product.quantity} sản phẩm trong kho.`);
        return prev;
      }
      setMessage('');
      return newValue;
    });
  };

  const decrementQuantity = () => {
    setQuantity(prev => {
      if (prev > 1) {
        setMessage('');
        return prev - 1;
      }
      return 1;
    });
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    if (product.quantity === 0) {
        setMessage(`Sản phẩm đã hết hàng.`);
        return;
    }
    if (quantity > product.quantity) {
        setMessage(`Chỉ còn ${product.quantity} sản phẩm trong kho.`);
        return;
    }

    // === SỬA LỖI ID ===
    const productVariant = {
      ...product, // Giữ lại (imageUrl, description, v.v...)
      
      // 1. ID Gốc (cho Backend):
      // Lưu ID gốc (vd: 12) vào trường 'productId'
      productId: product.id, 

      // 2. ID Giỏ hàng (cho React):
      // Tạo ID duy nhất (vd: "12_S") và lưu vào 'id'
      id: hasMultipleSizes ? `${product.id}_${selectedSize}` : product.id, 
      
      name: hasMultipleSizes ? `${product.name} (Size ${selectedSize})` : product.name,
      price: currentPrice,
      quantity: quantity, // Số lượng user CHỌN
      stock: product.quantity // Số lượng TỒN KHO
    };
    // === HẾT SỬA ===
    
    addToCart(productVariant); 
    setMessage('Đã thêm vào giỏ hàng!');
    setQuantity(1); 
    setTimeout(() => setMessage(''), 2000);
  };

  const getImageUrl = (imageUrl) => {
    if (imageUrl) {
      return `${BACKEND_URL}${imageUrl}`;
    }
    return 'https://placehold.co/600x400?text=No+Image';
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center p-10">Không tìm thấy sản phẩm.</div>;

  return (
    <div className="bg-gray-100 py-10"> 
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="grid md:grid-cols-2"> 
            
            <div>
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-full md:h-[500px] object-cover" 
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400?text=Error'; }}
              />
            </div>
            
            <div className="p-8 md:p-10 flex flex-col"> 
              <p className="text-sm text-green-600 font-semibold mb-2">{product.category.name}</p>
              <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
              
              <p className="text-3xl font-bold text-gray-800 mb-6">
                {currentPrice.toLocaleString('vi-VN')}đ
                {!hasMultipleSizes && ' /kg'}
              </p>

              <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
              
              <p className="text-sm text-gray-600 mb-6">Còn {product.quantity} sản phẩm</p>

              {/* PHẦN CHỌN SIZE */}
              {hasMultipleSizes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Chọn size:</h3>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleSelectSize('S', product.priceS)}
                      className={`px-6 py-2 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === 'S'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      Size S
                    </button>
                    {product.priceM > 0 && (
                      <button
                        onClick={() => handleSelectSize('M', product.priceM)}
                        className={`px-6 py-2 rounded-lg border-2 font-medium transition-all ${
                          selectedSize === 'M'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                        }`}
                      >
                        Size M
                      </button>
                    )}
                    {product.priceL > 0 && (
                      <button
                        onClick={() => handleSelectSize('L', product.priceL)}
                        className={`px-6 py-2 rounded-lg border-2 font-medium transition-all ${
                          selectedSize === 'L'
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                        }`}
                      >
                        Size L
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* PHẦN CHỌN SỐ LƯỢNG */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  {hasMultipleSizes ? "Chọn số lượng:" : "Chọn khối lượng (kg):"}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={decrementQuantity}
                    className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-300 transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    onBlur={handleQuantityChange}
                    className="w-16 h-10 text-center border border-gray-300 rounded-lg quantity-input"
                    min="1"
                    max={product.quantity}
                  />
                  <button
                    onClick={incrementQuantity}
                    className="w-10 h-10 bg-gray-200 text-gray-700 rounded-lg font-bold text-lg hover:bg-gray-300 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Nút Thêm vào giỏ */}
              <div className="mt-auto pt-6"> 
                <button
                  onClick={handleAddToCart}
                  className={`w-full text-white px-8 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 text-lg transition-colors ${
                    product.quantity === 0 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                  disabled={product.quantity === 0}
                >
                  {product.quantity === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                </button>
                {message && (
                  <p className={`mt-4 font-medium text-center ${message.includes('thêm') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN SẢN PHẨM LIÊN QUAN */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} /> 
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}