// src/admin/context/AdminAuthContext.jsx
import { createContext, useContext, useState } from 'react';
import { authAPI } from '../../api/httpAxios'; // <-- Đảm bảo import authAPI

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login(username, password);
      
      const token = res.data.token;
      const role = res.data.role;

      // Kiểm tra cả token và role
      if (token && role === 'ADMIN') {
        // LƯU TOKEN VÀO LOCALSTORAGE
        localStorage.setItem('admin_token', token);
        setAdmin({ username, role });
        return { success: true };
      } else {
        return { success: false, message: 'Tài khoản này không có quyền Admin' };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Sai tên đăng nhập hoặc mật khẩu';
      console.error('Login error:', err);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // XÓA TOKEN KHỎI LOCALSTORAGE
    localStorage.removeItem('admin_token');
    setAdmin(null);
    window.location.href = '/admin/login'; // Chuyển hướng
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};