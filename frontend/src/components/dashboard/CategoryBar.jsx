import React, { useState } from 'react';
import { X } from 'lucide-react';

export const CategoryBar = ({ 
  categories, 
  selectedCategories, 
  onToggleCategory,
  onDeleteCategory
}) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  return (
    <div className="hidden lg:block bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>
    </div>
  );
};