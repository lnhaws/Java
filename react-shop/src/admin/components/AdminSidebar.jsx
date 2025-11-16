import { Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useState } from 'react';

// --- Icons (Inline SVGs) ---
const IconLayoutDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
);

const IconCategory = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z"></path>
    <path d="M7 7h.01"></path>
  </svg>
);

const IconBox = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M12.89 1.45l8 4A2 2 0 0 1 22 7.24v9.53a2 2 0 0 1-1.11 1.79l-8 4a2 2 0 0 1-1.79 0l-8-4a2 2 0 0 1-1.1-1.79V7.24a2 2 0 0 1 1.11-1.79l8-4a2 2 0 0 1 1.78 0z"></path>
    <polyline points="2.32 6.16 12 11 21.68 6.16"></polyline>
    <line x1="12" y1="22.76" x2="12" y2="11"></line>
  </svg>
);

// === ICON MỚI CHO ĐƠN HÀNG ===
const IconShoppingCart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);
// =============================

const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const IconMenuToggle = ({ isOpen }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    {isOpen ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </>
    ) : (
      <>
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </>
    )}
  </svg>
);
// --- Hết Icons ---

export default function AdminSidebar() {
  const { logout } = useAdminAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  // Sửa isActive để xử lý /admin/ (trang dashboard) chính xác
  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) => {
    return `flex items-center gap-4 p-3 rounded-lg transition-all duration-200 no-underline text-base font-medium ${
      isActive(path)
        ? 'bg-blue-600 text-white font-semibold shadow-md'
        : 'hover:bg-gray-800 text-gray-300'
    } ${!isOpen ? 'justify-center' : ''}`;
  };

  return (
    <div className={`bg-gray-900 text-white min-h-screen flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'}`}>
      
      <div className={`p-6 flex items-center ${isOpen ? 'justify-between' : 'justify-center'}`}>
        <h1 className={`text-2xl font-bold tracking-wider text-white transition-all duration-200 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 w-0 h-0 overflow-hidden'}`}>
          ADMIN
        </h1>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-gray-300 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <IconMenuToggle isOpen={isOpen} />
        </button>
      </div>

      {/* Menu */}
      <nav className={`flex-1 space-y-2 ${isOpen ? 'px-6' : 'px-3'}`}>
        <Link to="/admin" className={linkClass('/admin')}>
          <IconLayoutDashboard />
          <span className={`transition-opacity ${!isOpen ? 'hidden' : ''}`}>Dashboard</span>
        </Link>

        <Link to="/admin/categories" className={linkClass('/admin/categories')}>
          <IconCategory />
          <span className={`transition-opacity ${!isOpen ? 'hidden' : ''}`}>Quản lý Danh mục</span>
        </Link>

        <Link to="/admin/products" className={linkClass('/admin/products')}>
          <IconBox />
          <span className={`transition-opacity ${!isOpen ? 'hidden' : ''}`}>Quản lý Sản phẩm</span>
        </Link>

        {/* === THÊM LINK ĐƠN HÀNG === */}
        <Link to="/admin/orders" className={linkClass('/admin/orders')}>
          <IconShoppingCart />
          <span className={`transition-opacity ${!isOpen ? 'hidden' : ''}`}>Quản lý Đơn hàng</span>
        </Link>
        {/* ========================== */}

      </nav>

      {/* Nút Đăng xuất */}
      <div className={`mt-8 ${isOpen ? 'px-6 pb-6' : 'px-3 pb-6'}`}>
        <button
          onClick={logout}
          className={`w-full flex items-center gap-4 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 bg-red-600 hover:bg-red-700 text-white ${isOpen ? 'px-4' : 'justify-center px-0'}`}
        >
          <IconLogout />
          <span className={`transition-opacity ${!isOpen ? 'hidden' : ''}`}>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}