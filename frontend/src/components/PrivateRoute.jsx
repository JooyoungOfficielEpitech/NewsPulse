import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // 로그인되지 않은 사용자는 로그인 화면으로 리다이렉트
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
