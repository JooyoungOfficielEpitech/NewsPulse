import { useState } from 'react';

// const API_BASE_URL = 'http://43.201.102.226:8000';
// const API_BASE_URL = 'http://localhost:8000';

const API_BASE_URL = import.meta.env.VITE_API_URL;


export function useNewsApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }
    return token;
  };

  const handleApiError = (error, customMessage) => {
    console.error(error);
    if (error.message.includes('401')) {
      setError('인증이 만료되었습니다. 다시 로그인해주세요.');
      // 로그인 페이지로 리다이렉트 하는 로직 추가 가능
      return;
    }
    setError(customMessage || error.message);
    throw error;
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
      if (!response.ok) throw new Error('사용자 정보를 가져오는데 실패했습니다.');
      return await response.json();
    } catch (err) {
      handleApiError(err, '사용자 정보를 가져오는데 실패했습니다.');
    }
  };

  const fetchNews = async (category = '', limit = 5) => {
    console.log(API_BASE_URL);
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/news?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error(`뉴스를 가져오는데 실패했습니다: ${response.status}`);
      return await response.json();
    } catch (err) {
      handleApiError(err, '뉴스를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async (categories = [], intervalMinutes = 60) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      categories.forEach(category => params.append('categories', category));
      params.append('interval_minutes', intervalMinutes.toString());

      const response = await fetch(`${API_BASE_URL}/trends/trend-data?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error(`트렌드를 가져오는데 실패했습니다: ${response.status}`);
      return await response.json();
    } catch (err) {
      handleApiError(err, '트렌드를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const refreshSelectedCategories = async (selectedCategories) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/trends/update/`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(selectedCategories),
      });
      if (!response.ok) throw new Error(`카테고리 새로고침에 실패했습니다: ${response.status}`);
      return await response.json();
    } catch (err) {
      handleApiError(err, '카테고리 새로고침에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const saveUserPreferences = async (selectedCategories, alertKeywords = []) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          selected_categories: selectedCategories,
          alert_keywords: alertKeywords,
        }),
      });
      if (!response.ok) throw new Error(`설정 저장에 실패했습니다: ${response.status}`);
      return await response.json();
    } catch (err) {
      handleApiError(err, '설정 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getUserPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/user/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error(`설정을 가져오는데 실패했습니다: ${response.status}`);
      return await response.json();
    } catch (err) {
      handleApiError(err, '설정을 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/category/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`카테고리를 가져오는데 실패했습니다: ${response.status}`);
      return await response.json();
    } catch (err) {
      handleApiError(err, '카테고리를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const queryChatbot = async (question) => {
    console.log(API_BASE_URL);
    if (!question?.trim()) {
      throw new Error('질문을 입력해주세요.');
    }

    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('user_id', '1'); // TODO: 실제 사용자 ID로 변경 필요
      params.append('question', question);

      const response = await fetch(`${API_BASE_URL}/chat/query?${params}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `챗봇 응답을 받아오는데 실패했습니다: ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.response) {
        throw new Error('유효하지 않은 응답 형식입니다.');
      }

      return data;
    } catch (err) {
      handleApiError(err, '챗봇 응답을 받아오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/category/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error(`카테고리 추가에 실패했습니다: ${response.status}`);
      return await response.json();
    } catch (err) {
      handleApiError(err, '카테고리 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!categoryId) {
      throw new Error('카테고리 ID가 필요합니다.');
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/category/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });
      if (!response.ok) throw new Error(`카테고리 삭제에 실패했습니다: ${response.status}`);
      return await response.json();
    } catch (err) {
      handleApiError(err, '카테고리 삭제에 실패했습니다.');
    } finally {
      setLoading(false);
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
    queryChatbot,
    loading,
    error,
  };
}