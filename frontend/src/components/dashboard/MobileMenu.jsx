import React, { useState } from 'react';
import { Search, X, Plus } from 'lucide-react';

export const MobileMenu = ({ 
  isOpen, 
  onClose, 
  categories, 
  selectedCategories, 
  onToggleCategory, 
  onAddCategory, 
  onDeleteCategory 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
      setIsAdding(false);
    }
  };

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
          {/* 검색 필드 */}
          <div className="relative w-full">
            <Search className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="뉴스 검색..."
              className="w-full pl-10 pr-4 py-2 border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 카테고리 목록 */}
          {categories.map((category) => (
            <div key={category.id} className="flex items-center gap-2">
              <button
                onClick={() => onToggleCategory(category.name)}
                className={`flex-1 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all
                  ${selectedCategories.includes(category.name)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600'
                  }`}
              >
                {category.name}
              </button>
              <X
                className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer"
                onClick={() => onDeleteCategory(category.id)}
              />
            </div>
          ))}

          {/* 카테고리 추가 폼 */}
          {isAdding ? (
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="새 카테고리"
                className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2 hover:bg-gray-200"
            >
              <Plus className="h-5 w-5" />
              카테고리 추가
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
