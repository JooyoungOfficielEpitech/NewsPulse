import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export const CategoryBar = ({ 
  categories, 
  selectedCategories, 
  onToggleCategory,
  onDeleteCategory,
  onAddCategory
}) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
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

  return (
    <div className="hidden lg:block bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.name);
            const isHovered = hoveredCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => onToggleCategory(category.name)}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                  ${isSelected
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <span>{category.name}</span>
                {isHovered && (
                  <X 
                    className="h-3.5 w-3.5 ml-0.5" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCategory(category.id);
                    }}
                  />
                )}
              </button>
            );
          })}

          {isAdding ? (
            <form onSubmit={handleAddCategory} className="inline-flex">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="새 카테고리"
                className="px-4 py-2 rounded-l-full text-sm border-2 border-r-0 border-blue-200 
                         focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-r-full bg-blue-500 text-white text-sm font-medium
                         hover:bg-blue-600 transition-colors border-2 border-blue-500
                         hover:border-blue-600"
              >
                추가
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="ml-2 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-medium
                         hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 rounded-full bg-white border-2 border-blue-200 text-blue-600
                       hover:border-blue-500 hover:bg-blue-50 transition-all text-sm font-medium
                       flex items-center gap-2 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              카테고리 추가
            </button>
          )}
        </div>
      </div>
    </div>
  );
};