import { useState } from 'react';

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'http://43.201.102.226:8000';

export function useNewsApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNews = async (category = '', limit = 10) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (limit) params.append('limit', limit);
      
      const response = await fetch(`${API_BASE_URL}/news?${params}`);
      if (!response.ok) throw new Error('Failed to fetch news');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchTrends = async (categories = [], intervalMinutes = 60) => {
    try {
      const params = new URLSearchParams();
      categories.forEach(category => params.append('categories', category));
      params.append('interval_minutes', intervalMinutes);
      
      const response = await fetch(`${API_BASE_URL}/trends/trend-data?${params}`);
      if (!response.ok) throw new Error('Failed to fetch trends');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const saveUserPreferences = async (userId, selectedCategories, alertKeywords = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          selected_categories: selectedCategories,
          alert_keywords: alertKeywords,
        }),
      });
      if (!response.ok) throw new Error('Failed to save preferences');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getUserPreferences = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/preferences?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addCategory = async (name) => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to add category');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/categories/${categoryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    fetchNews,
    fetchTrends,
    saveUserPreferences,
    getUserPreferences,
    getCategories,
    addCategory,
    deleteCategory,
    loading,
    error,
  };
}