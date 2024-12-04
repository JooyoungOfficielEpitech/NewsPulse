import React from 'react';
import { Search, X } from 'lucide-react';

export const MobileMenu = ({ isOpen, onClose, categories, selectedCategories, onToggleCategory }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white lg:hidden">
      <div className="p-4">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="mt-12 space-y-4">
          <div className="relative w-full">
            <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="뉴스 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onToggleCategory(category.name)}
              className={`w-full px-4 py-3 rounded-lg text-left text-sm font-medium transition-all
                ${selectedCategories.includes(category.name)
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};