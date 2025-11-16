// src/user/components/LoadingSpinner.jsx
export default function LoadingSpinner({ size = 'md', text = 'Đang tải...' }) {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div
        className={`${sizeClass} animate-spin rounded-full border-4 border-gray-300 border-t-green-600`}
      />
      {text && <p className="mt-3 text-gray-600">{text}</p>}
    </div>
  );
}