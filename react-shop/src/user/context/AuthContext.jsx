import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../../api/httpAxios'; // Import cả userAPI

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, _setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hàm setUser tùy chỉnh (đã chuẩn)
  const setUser = (data) => {
    if (data) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      _setUser(data);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      _setUser(null);
    }
  };

  // Khôi phục session khi tải lại trang
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (token && userJson && userJson !== "undefined") {
      try {
        _setUser(JSON.parse(userJson));
      } catch (error) {
        console.error("Lỗi parse userJson:", error);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      // 1. Đăng nhập
      const res = await authAPI.login(username, password);
      const loginData = res.data; // { token, role, username, displayName }

      // 2. Lưu token tạm thời để gọi API /me
      localStorage.setItem('token', loginData.token);
      
      // 3. Gọi /me để lấy đầy đủ thông tin (quan trọng)
      const profileRes = await userAPI.getProfile();
      
      // 4. Kết hợp thông tin và lưu
      const fullUserData = {
        ...profileRes.data, // (id, username, displayName, phone, address, imageUrl, role)
        token: loginData.token // Gắn token vào object
      };

      setUser(fullUserData); 
      return { success: true, role: fullUserData.role };
      
    } catch (err) {
      localStorage.removeItem('token'); // Xóa token nếu login thất bại
      return { success: false, message: err.response?.data?.message || 'Lỗi đăng nhập' };
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(formData);
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Lỗi đăng ký' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  // Giá trị context bao gồm cả 'setUser'
  const value = { user, setUser, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};