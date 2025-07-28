import React from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  color: 'blue' | 'gray' | 'emerald' | 'amber' | 'red';
  onClick?: () => void;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
}

const colorClasses = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'from-blue-50 to-indigo-50',
  },
  gray: {
    gradient: 'from-gray-600 to-gray-700',
    bg: 'from-gray-50 to-slate-50',
  },
  emerald: {
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'from-emerald-50 to-green-50',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
  },
  red: {
    gradient: 'from-red-500 to-rose-500',
    bg: 'from-red-50 to-rose-50',
  },
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, color, onClick, href, target = '_self' }) => {
  const classes = colorClasses[color];

  const cardContent = (
    <>
      <div className={`absolute inset-0 bg-gradient-to-br ${classes.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative flex items-center gap-4">
        <div className={`p-3 bg-gradient-to-r ${classes.gradient} rounded-2xl shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        className={`group relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer block no-underline`}
        onClick={onClick}
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''
        }`}
      onClick={onClick}
    >
      {cardContent}
    </div>
  );
};

export default StatCard;