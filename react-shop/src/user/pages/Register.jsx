import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Register() {
  const [form, setForm] = useState({ 
    displayName: '', 
    username: '', 
    password: '', 
    role: 'USER' 
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await register(form);
    if (res.success) {
      alert(res.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-green-600 mb-8">Đăng ký</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <input
            type="text"
            placeholder="Họ và Tên (Tên hiển thị)"
            required
            className="w-full p-3 border rounded-lg"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
          <input
            type="text"
            placeholder="Tên đăng nhập (viết liền, không dấu)"
            required
            className="w-full p-3 border rounded-lg"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Mật khẩu (ít nhất 6 ký tự)"
            required
            minLength="6"
            className="w-full p-3 border rounded-lg"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center"
          >
            {loading ? <LoadingSpinner size="sm" text={null} /> : 'Đăng ký'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm">
          Đã có tài khoản? <Link to="/login" className="text-green-600 font-bold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}