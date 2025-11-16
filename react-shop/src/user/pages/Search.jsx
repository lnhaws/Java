import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../../api/httpAxios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q'); // Lấy ?q=... từ URL
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tải tất cả sản phẩm
  useEffect(() => {
    setLoading(true);
    productAPI.getAll()
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => console.error("Lỗi tải sản phẩm", err))
      .finally(() => setLoading(false));
  }, []); // Tải 1 lần

  // Lọc sản phẩm dựa trên query
  const results = useMemo(() => {
    if (!query) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]); // Tính toán lại khi query hoặc products thay đổi

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-center mb-4 text-green-700">
        Kết quả tìm kiếm
      </h1>
      <p className="text-center text-lg text-gray-600 mb-8">
        Tìm thấy <strong>{results.length}</strong> sản phẩm cho từ khóa "<strong>{query}</strong>"
      </p>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {results.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-center py-16 text-gray-500 text-lg">
          Không tìm thấy sản phẩm nào phù hợp.
        </p>
      )}
    </div>
  );
}