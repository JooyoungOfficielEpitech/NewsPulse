import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './components/auth/AuthPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import PrivateRoute from './components/PrivateRoute'; // PrivateRoute 컴포넌트 추가

function App() {
  return (
    <Router>
      <Routes>
        {/* 로그인 및 회원가입 페이지 */}
        <Route path="/" element={<AuthPage />} />

        {/* 보호된 경로: PrivateRoute로 감싸서 인증 필요 */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        />

        {/* 존재하지 않는 경로는 기본적으로 로그인 페이지로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
