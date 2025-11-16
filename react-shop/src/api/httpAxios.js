import axios from 'axios';

export const BACKEND_URL = 'http://localhost:8080'; 
export const SUCCESS_DURATION = 3000; 

// --- Axios CÔNG KHAI ---
const publicAxios = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// --- Axios USER ---
const userAxios = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
userAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Axios ADMIN ---
const adminAxios = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
adminAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Xử lý lỗi chung ---
const handleResponseError = (err) => {
  const status = err.response?.status;
  if (!err.response) {
    console.error("Lỗi mạng, không kết nối được server.");
  } else if (status === 401) {
    console.error("Lỗi 401 - Token không hợp lệ hoặc hết hạn.");
  }
  return Promise.reject(err);
};
userAxios.interceptors.response.use((res) => res, handleResponseError);
adminAxios.interceptors.response.use((res) => res, handleResponseError);

// ====================== API ======================
export const authAPI = {
  login: (u, p) => publicAxios.post('/auth/login', { username: u, password: p }),
  register: (d) => publicAxios.post('/auth/register', d),
  logout: () => publicAxios.post('/auth/logout'),
};
export const productAPI = {
  getAll: () => publicAxios.get('/products'),
  getById: (id) => publicAxios.get(`/products/${id}`),
  getCategories: () => publicAxios.get('/categories'),
};
export const userAPI = {
  createOrder: (data) => userAxios.post('/orders', data),
  getMyOrders: () => userAxios.get('/orders/my-orders'),
  cancelMyOrder: (orderId) => userAxios.put(`/orders/${orderId}/cancel`),
  getProfile: () => userAxios.get('/auth/me'),
  updateProfile: (formData) => userAxios.put('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
  }),
};
export const adminAPI = {
  getCategories: () => adminAxios.get('/categories'),
  createCategory: (d) => adminAxios.post('/categories', d),
  updateCategory: (id, d) => adminAxios.put(`/categories/${id}`, d),
  deleteCategory: (id) => adminAxios.delete(`/categories/${id}`),
  
  getProducts: () => adminAxios.get('/products'),
  createProduct: (f) => adminAxios.post('/products', f, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateProduct: (id, f) => adminAxios.put(`/products/${id}`, f, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProduct: (id) => adminAxios.delete(`/products/${id}`),

  getOrders: () => adminAxios.get('/orders'),
  updateOrderStatus: (id, data) => adminAxios.put(`/orders/${id}/status`, data),
  
  // === THÊM HÀM MỚI ===
  getOrderById: (id) => adminAxios.get(`/orders/${id}`),
  // === HẾT ===
  
  getAllUsers: () => adminAxios.get('/auth/users'),
};