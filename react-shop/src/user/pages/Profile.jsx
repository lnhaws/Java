import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, BACKEND_URL, SUCCESS_DURATION } from '../../api/httpAxios'; // === 1. IMPORT SUCCESS_DURATION ===
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { user, setUser, loading: authLoading } = useAuth(); 
  
  const [form, setForm] = useState({
    displayName: '',
    phone: '',
    address: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setPageLoading(true);
        userAPI.getProfile()
          .then(res => {
            const userData = res.data;
            setForm({
              displayName: userData.displayName || '',
              phone: userData.phone || '',
              address: userData.address || '',
            });
            if (userData.imageUrl) {
              setAvatarPreview(`${BACKEND_URL}${userData.imageUrl}`);
            } else {
              setAvatarPreview(`https://ui-avatars.com/api/?name=${userData.displayName || user.username}&background=random&color=fff`);
            }
          })
          .catch(err => {
            console.error("Lỗi tải profile:", err);
            const errorText = err.response?.data?.message || 'Không thể tải hồ sơ.';
            setMessage({ type: 'error', text: errorText });
          })
          .finally(() => {
            setPageLoading(false);
          });
      } else {
        setPageLoading(false);
        setMessage({ type: 'error', text: 'Vui lòng đăng nhập lại để xem hồ sơ.' });
      }
    }
  }, [authLoading, user]); 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' }); // Xóa thông báo cũ

    const formData = new FormData();
    formData.append('displayName', form.displayName);
    formData.append('phone', form.phone);
    formData.append('address', form.address);
    if (avatar) {
      formData.append('image', avatar);
    }

    try {
      const res = await userAPI.updateProfile(formData);
      const updatedUserDto = res.data;

      const updatedUserInContext = {
        ...user,
        displayName: updatedUserDto.displayName,
        phone: updatedUserDto.phone,
        address: updatedUserDto.address,
        imageUrl: updatedUserDto.imageUrl,
      };
      setUser(updatedUserInContext);

      if (updatedUserDto.imageUrl) {
         setAvatarPreview(`${BACKEND_URL}${updatedUserDto.imageUrl}`);
      }

      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
      setAvatar(null);

    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Lỗi cập nhật' });
    } finally {
      setLoading(false);
      
      // === 2. THÊM LẠI setTimeout TẠI ĐÂY ===
      // Tự động xóa thông báo (cả thành công và thất bại) sau 3 giây
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, SUCCESS_DURATION); // SUCCESS_DURATION là 3000 (từ httpAxios)
      // === HẾT SỬA ===
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-green-800 mb-8">Hồ sơ của tôi</h1>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {message.text && (
              <div className={`p-3 rounded-md text-center font-medium ${
                message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <div className="flex items-center gap-6">
              <img
                src={avatarPreview || `https://ui-avatars.com/api/?name=${form.displayName || user?.username}&background=random&color=fff`}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => { e.target.onerror = null; e.target.src=`https://ui-avatars.com/api/?name=${form.displayName || user?.username}&background=random&color=fff`}}
              />
              <div>
                <label 
                  htmlFor="avatar-upload" 
                  className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Đổi ảnh
                </label>
                <input 
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-gray-500 mt-2">PNG, JPG (Tối đa 2MB)</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và Tên (Tên hiển thị)</label>
              <input
                type="text"
                required
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                placeholder="Chưa cập nhật"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <input
                type="text"
                placeholder="Chưa cập nhật"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end">
              <button 
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
              >
                {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}