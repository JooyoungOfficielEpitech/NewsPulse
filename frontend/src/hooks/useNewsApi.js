import { useState } from 'react';

// const API_BASE_URL = 'http://43.201.102.226:8000';
const API_BASE_URL = 'http://localhost:8000';

export function useNewsApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  const getCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user info');
      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  const fetchNews = async (category = '', limit = 5) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('limit', limit);

      const response = await fetch(`${API_BASE_URL}/news?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`, // Authorization 헤더 추가
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch news: ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async (categories = [], intervalMinutes = 60) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      categories.forEach(category => params.append('categories', category));
      params.append('interval_minutes', intervalMinutes);

      const response = await fetch(`${API_BASE_URL}/trends/trend-data?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`, // Authorization 헤더 추가
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch trends: ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedCategories = async (selectedCategories) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/trends/update/`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`, // Authorization 헤더 추가
        },
        body: JSON.stringify(selectedCategories),
      });
      if (!response.ok) throw new Error(`Failed to refresh trends: ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveUserPreferences = async (selectedCategories, alertKeywords = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`, // Authorization 헤더 추가
        },
        body: JSON.stringify({
          selected_categories: selectedCategories,
          alert_keywords: alertKeywords,
        }),
      });
      if (!response.ok) throw new Error(`Failed to save preferences: ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getUserPreferences = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`, // Authorization 헤더 추가
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch preferences: ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`, // Authorization 헤더 추가
          'Accept': 'application/json', // 백엔드와 호환되는 헤더 추가
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addCategory = async (name) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/category/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`, // Authorization 헤더 추가
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error(`Failed to add category: ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`, // Authorization 헤더 추가
        },
      });
      if (!response.ok) throw new Error(`Failed to delete category: ${response.status}`);
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    fetchNews,
    fetchTrends,
    refreshSelectedCategories,
    saveUserPreferences,
    getUserPreferences,
    getCategories,
    addCategory,
    deleteCategory,
    getCurrentUser,
    loading,
    error,
  };
}
