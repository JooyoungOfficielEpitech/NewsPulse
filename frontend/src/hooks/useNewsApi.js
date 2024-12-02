import { useState, useEffect } from 'react';

const API_BASE_URL = "http://0.0.0.0:8000" // 실제 API 서버 주소로 변경 필요

export function useNewsApi() {
  const [news, setNews] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNews = async (category = '', limit = 10) => {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (limit) params.append('limit', limit);
      
      const response = await fetch(`${API_BASE_URL}/news?${params}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching news:', err);
      throw err;
    }
  };

  const fetchTrends = async (categories = []) => {
    try {
      const params = new URLSearchParams();
      categories.forEach(category => params.append('categories', category));
      
      const response = await fetch(`${API_BASE_URL}/trends?${params}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching trends:', err);
      throw err;
    }
  };

  const saveUserPreferences = async (userId, selectedCategories, alertKeywords) => {
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
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error saving preferences:', err);
      throw err;
    }
  };

  return {
    fetchNews,
    fetchTrends,
    saveUserPreferences,
    loading,
    error,
  };
}