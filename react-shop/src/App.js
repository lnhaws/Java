import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// === 1. IMPORT CONTEXT ===
import { AuthProvider } from './user/context/AuthContext';
import { CartProvider } from './user/context/CartContext';
import { AdminAuthProvider, useAdminAuth } from './admin/context/AdminAuthContext';

// === 2. IMPORT USER COMPONENTS & PAGES ===
import Navbar from './user/components/Navbar';
import Footer from './user/components/Footer';
import ProtectedRoute from './user/components/ProtectedRoute';

import Home from './user/pages/Home';
import Products from './user/pages/Products';
import ProductDetail from './user/pages/ProductDetail';
import Cart from './user/pages/Cart';
import Checkout from './user/pages/Checkout';
import Login from './user/pages/Login';
import Register from './user/pages/Register';
import MyOrders from './user/pages/MyOrders';
import Profile from './user/pages/Profile';
import Search from './user/pages/Search'; // (Tệp mới)

// === 3. IMPORT ADMIN COMPONENTS & PAGES ===
import AdminLayout from './admin/layouts/AdminLayout';
import AdminLogin from './admin/pages/AdminLogin';
import Dashboard from './admin/pages/Dashboard';
import CategoryManager from './admin/pages/CategoryManager';
import ProductManager from './admin/pages/ProductManager';
import OrderManager from './admin/pages/OrderManager';
import OrderDetailAdmin from './admin/pages/OrderDetailAdmin';

// === BẢO VỆ ROUTE ADMIN ===
const AdminRoute = ({ children }) => {
  const { admin } = useAdminAuth();
  return admin ? children : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AdminAuthProvider>
          <Router>
            <Routes>
              
              {/* ================= USER ROUTES ================= */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/search" element={<Search />} />
                        
                        {/* Các route cần đăng nhập */}
                        <Route 
                          path="/my-orders" 
                          element={<ProtectedRoute><MyOrders /></ProtectedRoute>} 
                        />
                        <Route 
                          path="/profile" 
                          element={<ProtectedRoute><Profile /></ProtectedRoute>} 
                        />

                        {/* Route 404 cho User */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />

              {/* ================= ADMIN ROUTES ================= */}
              <Route path="/admin/login" element={<AdminLogin />} />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Dashboard />} /> 
                <Route path="categories" element={<CategoryManager />} />
                <Route path="products" element={<ProductManager />} />
                <Route path="orders" element={<OrderManager />} />
                <Route path="orders/:id" element={<OrderDetailAdmin />} />
              </Route>
              
            </Routes>
          </Router>
        </AdminAuthProvider>
      </CartProvider>
    </AuthProvider>
  );
}