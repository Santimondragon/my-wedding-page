import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}>
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg text-white font-medium min-w-[300px] ${type === 'success'
        ? 'bg-gradient-to-r from-emerald-500 to-green-500'
        : 'bg-gradient-to-r from-red-500 to-rose-500'
        }`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;