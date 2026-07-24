import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2000); // Show splash screen for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800">
      <div className="mb-8">
        <svg width="120" height="120" viewBox="0 0 32 32" className="text-white">
          <rect x="4" y="8" width="24" height="18" rx="2" fill="#10B981" stroke="#ffffff" strokeWidth="2"/>
          <rect x="4" y="8" width="24" height="6" rx="2" fill="#34D399"/>
          <line x1="16" y1="8" x2="16" y2="26" stroke="#ffffff" strokeWidth="2"/>
          <line x1="4" y1="14" x2="28" y2="14" stroke="#ffffff" strokeWidth="2"/>
          <rect x="8" y="18" width="4" height="4" rx="1" fill="#6EE7B7"/>
          <rect x="20" y="18" width="4" height="4" rx="1" fill="#6EE7B7"/>
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Po'o Inventory</h1>
      <p className="text-emerald-200 text-lg">Multi-Inventory Management System</p>
      <div className="mt-8">
        <div className="w-12 h-12 border-4 border-emerald-300 border-t-white rounded-full animate-spin"></div>
      </div>
    </div>
  );
}
