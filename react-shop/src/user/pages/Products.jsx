import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { productAPI } from '../../api/httpAxios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

// Hàm tiện ích làm phẳng cây
const flattenCategoriesForRender = (categories, level = 0) => {
  let flatList = [];
  if (!categories) return flatList;

  for (const cat of categories) {
    flatList.push({ 
      ...cat, 
      level: level 
    });
    if (cat.children && cat.children.length > 0) {
      flatList = flatList.concat(flattenCategoriesForRender(cat.children, level + 1));
    }
  }
  return flatList;
};

export default function Products() {
  const location = useLocation(); 
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 

  const [filters, setFilters] = useState({
    categoryId: location.state?.categoryId || '',
    minPrice: '',
    maxPrice: ''
  });
  
  const [loading, setLoading] = useState(true);

  // Danh sách phẳng này CHỨA thông tin 'children', rất quan trọng
  const flatCategoriesList = useMemo(() => flattenCategoriesForRender(categories), [categories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          productAPI.getAll(),
          productAPI.getCategories()
        ]);
        setProducts(prodRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.categoryId) {
      setFilters(f => ({ ...f, categoryId: location.state.categoryId }));
    }
  }, [location.state]);

  // === SỬA LỖI LOGIC LỌC TẠI ĐÂY ===
  const filtered = products.filter(p => {
    // Lọc giá (không đổi)
    if (filters.minPrice && p.priceS < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && p.priceS > parseFloat(filters.maxPrice)) return false;

    // Lọc danh mục (logic mới)
    if (filters.categoryId) {
        const selectedCatId = parseInt(filters.categoryId);
        
        // 1. Tìm danh mục đã chọn trong danh sách
        const selectedCat = flatCategoriesList.find(c => c.id === selectedCatId);
        
        if (!selectedCat) return true; // Nếu không tìm thấy, bỏ qua lọc

        // 2. Kiểm tra xem có phải là danh mục cha không
        const isParent = selectedCat.children && selectedCat.children.length > 0;

        if (isParent) {
            // 3. Nếu là cha, lấy ID của TẤT CẢ các con
            const childIds = selectedCat.children.map(c => c.id);
            // Kiểm tra xem ID danh mục của sản phẩm có nằm trong danh sách con không
            if (!childIds.includes(p.category.id)) {
                return false;
            }
        } else {
            // 4. Nếu là con, lọc chính xác
            if (p.category.id !== selectedCatId) {
                return false;
            }
        }
    }
    
    // Nếu không có bộ lọc nào, trả về true
    return true;
  });
  // === HẾT SỬA ===

  const handleCategoryClick = (categoryId) => {
    setFilters({ ...filters, categoryId: categoryId });
  };
  
  const getCategoryButtonClass = (id) => {
    const isActive = filters.categoryId === id;
    return `w-full text-left p-2.5 rounded-lg transition no-underline text-sm font-medium
            ${isActive 
              ? 'bg-green-600 text-white shadow-sm' 
              : 'text-gray-700 hover:bg-gray-200'
            }`;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-700">Tất cả sản phẩm</h1>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64">
          <div className="bg-gray-50 p-5 rounded-lg shadow-sm space-y-5">
            <h3 className="font-bold text-lg text-gray-800">Lọc sản phẩm</h3>

            {/* === SỬA: Hiển thị danh mục (bỏ 'disabled') === */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1 bg-white"> 
                
                <button
                  className={getCategoryButtonClass('')}
                  onClick={() => handleCategoryClick('')}
                >
                  Tất cả
                </button>
                
                {flatCategoriesList.map(cat => {
                  const isParent = cat.children && cat.children.length > 0;
                  
                  return (
                    <button
                      key={cat.id}
                      // disabled={isParent} // <-- ĐÃ XÓA
                      className={`${getCategoryButtonClass(cat.id)} ${
                        // Giữ lại in đậm cho cha, nhưng bỏ 'cursor-not-allowed'
                        isParent ? 'font-bold' : '' 
                      }`}
                      style={{ 
                        paddingLeft: `${cat.level * 16 + 10}px` 
                      }}
                      onClick={() => handleCategoryClick(cat.id)} // <-- Bỏ check !isParent
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* === HẾT SỬA === */}

            {/* Lọc giá (không đổi) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá từ</label>
              <input
                type="number"
                placeholder="0"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition no-underline"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giá đến</label>
              <input
                type="number"
                placeholder="500000"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition no-underline"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>
            <button
              onClick={() => setFilters({ categoryId: '', minPrice: '', maxPrice: '' })}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 rounded-lg font-medium transition duration-200 no-underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        </aside>

        {/* Danh sách sản phẩm (không đổi) */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          {filtered.length === 0 && !loading && (
            <p className="text-center py-16 text-gray-500 text-lg">Không tìm thấy sản phẩm nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}