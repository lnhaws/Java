import { useState, useEffect, useMemo, useRef } from 'react'; // === MỚI: Thêm useRef ===
import { adminAPI } from '../../api/httpAxios';

// Hàm tiện ích để làm phẳng cây danh mục
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

export default function CategoryManager() {
  const [categories, setCategories] = useState([]); 
  const [form, setForm] = useState({ name: '', parentId: null }); 
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // === MỚI: Tạo ref cho form ===
  const formRef = useRef(null); 

  const flattenedCategories = useMemo(() => flattenCategoriesForRender(categories), [categories]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setMessage({ text: 'Không thể tải danh mục. Vui lòng thử lại.', type: 'error' });
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setMessage({ text: 'Tên danh mục không được để trống.', type: 'error' });
        setTimeout(() => {
          setMessage({ text: '', type: '' });
      }, 3000);
      return;
    }

    const payload = {
      name: form.name,
      parentId: form.parentId ? parseInt(form.parentId) : null 
    };

    try {
      let successMessage = '';
      if (editingId) {
        await adminAPI.updateCategory(editingId, payload); 
        successMessage = 'Cập nhật danh mục thành công!';
      } else {
        await adminAPI.createCategory(payload);
        successMessage = 'Thêm danh mục mới thành công!';
      }
      
      setForm({ name: '', parentId: null });
      setEditingId(null);
      loadCategories(); 
      
      setMessage({ text: successMessage, type: 'success' });

    } catch (error) {
      console.error("Failed to submit category:", error);
      const errorMsg = error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  // === SỬA: Cập nhật hàm handleEdit ===
  const handleEdit = (cat) => {
    setForm({ 
      name: cat.name, 
      parentId: cat.parentId || null 
    });
    setEditingId(cat.id);
    
    // Cuộn đến form (đã được đánh dấu bằng ref)
    if (formRef.current) {
      formRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start' // Căn form lên đầu viewport
      });
    }
  };
  // === HẾT SỬA ===

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', parentId: null });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xóa danh mục này? LƯU Ý: Tất cả danh mục con (nếu có) cũng sẽ bị xóa vĩnh viễn.')) {
      try {
        await adminAPI.deleteCategory(id);
        loadCategories();
        setMessage({ text: 'Xóa danh mục thành công!', type: 'success' });
        if (editingId === id) {
          handleCancelEdit();
        }
      } catch (error) {
        console.error("Failed to delete category:", error);
        setMessage({ text: 'Lỗi khi xóa danh mục. (Có thể do danh mục này vẫn còn chứa sản phẩm).', type: 'error' });
      } finally {
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý Danh mục</h1>

      {message.text && (
        <div 
          className={`px-4 py-3 rounded relative mb-4 ${
            message.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
          }`} 
          role="alert"
        >
          <span className="block sm:inline">{message.text}</span>
        </div>
      )}

      {/* === SỬA: Thêm ref vào form === */}
      <form ref={formRef} onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
        <div className="flex flex-wrap md:flex-nowrap gap-3">
          {/* Input Tên */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="catName" className="block text-sm font-medium text-gray-700 mb-1">
              {editingId ? `Đang sửa (ID: ${editingId})` : 'Tên danh mục mới'}
            </label>
            <input
              id="catName"
              required
              type="text"
              placeholder="Tên danh mục"
              className="w-full p-2 border rounded"
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* Dropdown chọn Cha */}
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="catParent" className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục cha
            </label>
            <select
              id="catParent"
              className="w-full p-2 border rounded bg-white"
              value={form.parentId || ""} 
              onChange={(e) => setForm(f => ({ ...f, parentId: e.target.value ? parseInt(e.target.value) : null }))}
            >
              <option value="">-- (Là danh mục gốc) --</option>
              {flattenedCategories.map(cat => (
                <option 
                  key={cat.id} 
                  value={cat.id}
                  disabled={cat.id === editingId} 
                >
                  {'\u00A0'.repeat(cat.level * 3)} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Nút Submit/Cancel */}
        <div className="flex gap-2 mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </button>
          {editingId && (
            <button 
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* === Bảng === */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 shadow-sm rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">ID</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">Tên</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flattenedCategories.map(cat => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="p-3 text-sm text-gray-700">{cat.id}</td>
                
                <td 
                  className="p-3 text-sm text-gray-900 font-medium"
                  style={{ paddingLeft: `${cat.level * 24 + 12}px` }} 
                >
                  {cat.level > 0 && <span className="text-gray-400 mr-1">↳</span>} 
                  {cat.name}
                </td>

                <td className="p-3 text-sm">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800 mr-3 font-medium">Sửa</button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800 font-medium">Xóa</button>
                </td>
              </tr>
            ))}

            {flattenedCategories.length === 0 && (
                <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-500">
                        Không tìm thấy danh mục nào.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}