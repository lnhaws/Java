import { useState, useEffect, useMemo, useRef } from 'react';
import { adminAPI, BACKEND_URL, SUCCESS_DURATION } from '../../api/httpAxios';

// Tên của các danh mục CHA sẽ quyết định hiển thị giá S/M/L
const CATEGORIES_WITH_SIZES = ['Nước Ép Trái Cây', 'Trà Trái Cây'];

// === HÀM TIỆN ÍCH 1: Làm phẳng cây ===
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

// === HÀM TIỆN ÍCH 2: Tìm Node và Cha ===
const findNodeAndParent = (nodes, nodeId, parent = null) => {
  if (!nodes) return { node: null, parent: null };
  for (const node of nodes) {
    if (node.id === nodeId) {
      return { node, parent };
    }
    if (node.children) {
      const result = findNodeAndParent(node.children, nodeId, node);
      if (result.node) return result;
    }
  }
  return { node: null, parent: null };
};


export default function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [form, setForm] = useState({
    name: '', 
    description: '', 
    priceS: '', 
    priceM: '', 
    priceL: '', 
    quantity: '', 
    category_id: '', 
    image: null
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const formRef = useRef(null); 

  useEffect(() => {
    loadData();
  }, []);

  const flatCategoriesList = useMemo(() => flattenCategoriesForRender(categories), [categories]);

  const showSizePrices = useMemo(() => {
    if (!form.category_id) return false;
    const { parent } = findNodeAndParent(categories, parseInt(form.category_id));
    if (parent && CATEGORIES_WITH_SIZES.includes(parent.name)) {
      return true;
    }
    return false;
  }, [form.category_id, categories]);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        adminAPI.getProducts(),
        adminAPI.getCategories() 
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
      setMessage({ type: 'error', text: 'Lỗi tải dữ liệu. Vui lòng thử lại.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.priceS || form.priceS <= 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập giá (ít nhất là giá mặc định/Size S).' });
      setTimeout(() => setMessage({ type: '', text: '' }), SUCCESS_DURATION);
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('quantity', form.quantity);
    formData.append('category_id', form.category_id);
    if (form.image) formData.append('image', form.image);

    formData.append('priceS', form.priceS);
    formData.append('priceM', showSizePrices ? (form.priceM || 0) : 0);
    formData.append('priceL', showSizePrices ? (form.priceL || 0) : 0);
    
    try {
      let successMsg = '';
      if (editingId) {
        await adminAPI.updateProduct(editingId, formData);
        successMsg = 'Cập nhật sản phẩm thành công!';
      } else {
        await adminAPI.createProduct(formData);
        successMsg = 'Thêm sản phẩm mới thành công!';
      }
      
      resetForm();
      await loadData();
      setMessage({ type: 'success', text: successMsg });

    } catch (err) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      setMessage({ type: 'error', text: 'Thao tác thất bại. Vui lòng thử lại.' });
    } finally {
      setTimeout(() => setMessage({ type: '', text: '' }), SUCCESS_DURATION);
    }
  };

  const resetForm = () => {
    setForm({ 
      name: '', description: '', 
      priceS: '', priceM: '', priceL: '', 
      quantity: '', category_id: '', image: null 
    });
    setEditingId(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      priceS: p.priceS || '',
      priceM: p.priceM || '',
      priceL: p.priceL || '',
      quantity: p.quantity,
      category_id: p.category ? p.category.id : '',
      image: null
    });
    setEditingId(p.id);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await adminAPI.deleteProduct(id);
        await loadData();
        setMessage({ type: 'success', text: 'Xóa sản phẩm thành công!' });
      } catch (err) {
        console.error("Lỗi khi xóa sản phẩm:", err);
        setMessage({ type: 'error', text: 'Xóa thất bại. Vui lòng thử lại.' });
      } finally {
        setTimeout(() => setMessage({ type: '', text: '' }), SUCCESS_DURATION);
      }
    }
  };

  const getImageUrl = (imageUrl) => {
    if (imageUrl) {
      return `${BACKEND_URL}${imageUrl}`;
    }
    return 'https://placehold.co/600x400?text=No+Image';
  };

  // === SỬA: Cập nhật hàm displayPrice ===
  const displayPrice = (p) => {
    const hasMultipleSizes = p.priceM && p.priceM > 0;

    // 1. Nếu có nhiều size
    if (hasMultipleSizes) {
      const prices = [p.priceS, p.priceM, p.priceL].filter(price => price > 0);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return `${min.toLocaleString('vi-VN')}đ - ${max.toLocaleString('vi-VN')}đ`;
    }
    
    // 2. Nếu không có nhiều size (vd: Trái Cây) và có giá
    if (p.priceS && p.priceS > 0) {
      return `${p.priceS.toLocaleString('vi-VN')}đ /kg`;
    }
    
    // 3. Mặc định (giá là 0 hoặc null)
    return `${(p.priceS || 0).toLocaleString('vi-VN')}đ`;
  };

  return (
    <div className="p-6" ref={formRef}>
      <h1 className="text-2xl font-bold mb-6">Quản lý Sản phẩm</h1>
      
      {message.text && (
        <div 
          className={`p-4 rounded-lg mb-4 text-center font-medium ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {/* === FORM === */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-white shadow">
        
        {/* Cột 1: Tên, Danh mục */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input type="text" placeholder="Tên sản phẩm" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="p-3 border rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
            <select 
              required 
              value={form.category_id} 
              onChange={e => setForm({ ...form, category_id: e.target.value })} 
              className="p-3 border rounded w-full bg-white"
            >
              <option value="">-- Chọn danh mục --</option>
              {flatCategoriesList.map(c => {
                const isParent = c.children && c.children.length > 0;
                return (
                  <option 
                    key={c.id} 
                    value={c.id}
                    disabled={isParent} 
                    className={isParent ? 'text-gray-400 font-bold bg-gray-100' : 'text-black'}
                  >
                    {'\u00A0'.repeat(c.level * 3)} 
                    {c.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Cột 2: Giá + Số lượng */}
        <div className="space-y-4">
          <div>
            {/* === SỬA: Cập nhật Label === */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {showSizePrices ? "Giá Size S" : "Giá sản phẩm (/kg)"}
            </label>
            <input 
              type="number" 
              // === SỬA: Cập nhật Placeholder ===
              placeholder={showSizePrices ? "Giá Size S" : "Giá sản phẩm (/kg)"} 
              required 
              value={form.priceS} 
              onChange={e => setForm({ ...form, priceS: e.target.value })} 
              className="p-3 border rounded w-full" 
            />
          </div>
          
          {showSizePrices && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá Size M</label>
                <input 
                  type="number" 
                  placeholder="Giá Size M" 
                  value={form.priceM} 
                  onChange={e => setForm({ ...form, priceM: e.target.value })} 
                  className="p-3 border rounded w-full" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá Size L</label>
                <input 
                  type="number" 
                  placeholder="Giá Size L" 
                  value={form.priceL} 
                  onChange={e => setForm({ ...form, priceL: e.target.value })} 
                  className="p-3 border rounded w-full" 
                />
              </div>
            </>
          )}

          {!showSizePrices && <div className="hidden md:block"></div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng (Kho)</label>
            <input type="number" placeholder="Số lượng" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="p-3 border rounded w-full" />
          </div>
        </div>
        
        {/* Cột 3: Mô tả, Ảnh */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea placeholder="Mô tả" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="p-3 border rounded w-full h-24" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={e => setForm({ ...form, image: e.target.files[0] })} 
              className="p-2 border rounded w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
            {!editingId && (
              <p className="text-xs text-gray-500 mt-1">Bắt buộc khi thêm mới sản phẩm.</p>
            )}
          </div>
        </div>
        
        {/* Nút Submit */}
        <div className="md:col-span-3">
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 transition-colors">
            {editingId ? 'Cập nhật Sản phẩm' : 'Thêm Sản phẩm Mới'}
          </button>
          {editingId && (
            <button 
              type="button" 
              onClick={resetForm} 
              className="w-full bg-gray-500 text-white py-2 rounded font-bold hover:bg-gray-600 transition-colors mt-2"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* === Danh sách sản phẩm === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="border p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
            <img 
              src={getImageUrl(p.imageUrl)} 
              alt={p.name} 
              className="w-full h-48 object-cover rounded mb-2" 
              onError={(e) => { e.target.onerror = null; e.g.src='https://placehold.co/600x400?text=Error'; }}
            />
            <h3 className="font-bold text-lg">{p.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{p.category ? p.category.name : "Chưa phân loại"}</p>
            
            {/* Giá sản phẩm (đã được cập nhật bởi hàm displayPrice) */}
            <p className="text-lg font-semibold text-green-600 my-1">{displayPrice(p)}</p>
            
            <p className="text-sm text-gray-500 mb-2">Kho: {p.quantity}</p>
            
            <div className="mt-auto border-t pt-2 flex justify-end gap-2">
              <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 font-medium">Sửa</button>
              <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-medium">Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}