import React from 'react';

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-2xl font-medium text-sm transition-all duration-200 ${isActive
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
        }`}
    >
      {label}
    </button>
  );
};

export default FilterButton;