import { useState } from 'react';

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = import.meta.env.VITE_API_URL;


export function useAuthApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (username, password) => {
    console.log(username, password)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username,
          password,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to log in');
      const data = await response.json();
      console.log('Login successful:', data);
      return data;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  };
  
  

  const register = async (username, password) => {
    try {
      setLoading(true);

      // Form 데이터 생성
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Form 데이터 형식
        },
        body: formData.toString(),
      });

      if (!response.ok) throw new Error('Failed to register');

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const getAuthToken = () => localStorage.getItem('token');

  return {
    login,
    register,
    logout,
    getAuthToken,
    isAuthenticated,
    loading,
    error,
  };
}
