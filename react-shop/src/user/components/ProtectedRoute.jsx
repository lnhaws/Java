import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

// Bạn có thể thay thế bằng component LoadingSpinner thật của bạn
const SimpleLoading = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
  </div>
);

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Nếu đang tải thông tin user, hiển thị loading
  if (loading) {
    return <SimpleLoading />;
  }

  // 2. Nếu tải xong mà vẫn chưa có user -> chưa đăng nhập -> chuyển về login
  if (!user) {
    // `state={{ from: location }}` giúp trang Login biết user muốn đi đâu để chuyển hướng lại sau khi login thành công
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Đã đăng nhập -> cho phép truy cập
  return children;
}