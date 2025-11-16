import { useState, useRef, useEffect } from 'react'; // 1. THÊM useState
import { Link, NavLink, useNavigate } from 'react-router-dom'; // 2. THÊM useNavigate
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logoImage from '../../images/logo.png';

// 3. THÊM ICON TÌM KIẾM
const IconSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 4. THÊM STATE VÀ HÀM XỬ LÝ SEARCH
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?q=${searchTerm}`);
    setSearchTerm('');
  };
  // (Hàm này bị thiếu trong code bạn gửi)

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg sticky top-0 z-50">

      {/* === SỬA BỐ CỤC CHUNG === */}
      {/* Thêm 'gap-6' để tạo khoảng cách giữa 3 khối */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-6">

        {/* 1. LOGO (flex-shrink-0 để không bị co lại) */}
        <Link to="/" className="flex-shrink-0 flex items-center gap-3 text-2xl font-bold hover:text-yellow-200 transition duration-200 no-underline">
          <img src={logoImage} alt="Logo" className="w-10 h-10" />
          <span>FruitShop</span>
        </Link>

        {/* 2. MENU & SEARCH (flex-grow để lấp đầy khoảng trống) */}
        <div className="hidden md:flex flex-grow items-center gap-8 text-lg">
          
          {/* Search Form (flex-grow để co giãn) */}
          <form onSubmit={handleSearchSubmit} className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              // Dùng 'w-full' để lấp đầy form cha
              className="w-full py-2 px-4 pr-10 rounded-lg bg-white/20 text-white placeholder-white/70 
                         text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button type="submit" className="absolute top-0 right-0 h-full px-3 text-white/70 hover:text-white">
              <IconSearch />
            </button>
          </form>
          {/* Menu (không co giãn) */}
          <NavLink to="/" className={({ isActive }) => `flex-shrink-0 hover:text-yellow-200 transition duration-200 no-underline ${isActive ? 'text-yellow-300 font-semibold' : ''}`}>
            Trang chủ
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `flex-shrink-0 hover:text-yellow-200 transition duration-200 no-underline ${isActive ? 'text-yellow-300 font-semibold' : ''}`}>
            Sản phẩm
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `flex-shrink-0 relative hover:text-yellow-200 transition duration-200 no-underline ${isActive ? 'text-yellow-300 font-semibold' : ''}`}>
            Giỏ hàng
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </NavLink>
        </div>

        {/* 3. USER (flex-shrink-0 để không bị co lại) */}
        <div className="flex-shrink-0 flex items-center">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-yellow-200 font-medium hover:text-white transition focus:outline-none"
              >
                Xin chào, {user.displayName || user.username}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-md shadow-xl py-2 z-50 text-gray-800 overflow-hidden">
                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition no-underline"
                  >
                    👤
                    <span className="text-gray-700">Hồ sơ của tôi</span>
                  </Link>
                  <Link
                    to="/my-orders"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition no-underline"
                  >
                    📦
                    <span className="text-gray-700">Đơn hàng của tôi</span>
                  </Link>
                  <div className="border-t my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    🚪
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-white text-green-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition duration-200 text-sm no-underline shadow-sm"
            >
              Đăng nhập / Đăng ký
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}