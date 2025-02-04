import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import Spinner from './Spinner';


export const CategoryManager = ({ 
  isOpen, 
  onClose, 
  categories, 
  onAddCategory, 
  onDeleteCategory 
}) => {
  const [newCategory, setNewCategory] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      await onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="카테고리 관리">
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="새 카테고리 이름"
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            추가
          </button>
        </form>

        <div className="space-y-2 mt-4">
          <h3 className="font-medium text-gray-700">현재 카테고리</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span>{category.name}</span>
                <button
                  onClick={() => onDeleteCategory(category.id)}
                  className="p-1 hover:bg-gray-200 rounded-full text-gray-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};