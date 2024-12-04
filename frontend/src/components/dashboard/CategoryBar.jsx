import React from 'react';

export const CategoryBar = ({ categories, selectedCategories, onToggleCategory }) => {
  return (
    <div className="hidden lg:block bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onToggleCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${selectedCategories.includes(category.name)
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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