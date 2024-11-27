import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Member/LoginHome";
import SellerHome from "./pages/Home/SellerHome";
import SignupPage from "./pages/Member/SignupPage";
import ForgotPassword from "./pages/Member/ForgotPassword";
import ThankYouPage from "./pages/Home/ThankYouPage";

function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  // 로그인 상태 초기화
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    setIsLoggedIn(storedLoginStatus === "true");
  }, []);

  // 로그인 및 로그아웃 핸들러
  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
  };

  // 로그인 상태 확인 중 로딩 표시
  if (isLoggedIn === null) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* 인증된 사용자 */}
          <Route path="/sellerhome"
            element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <SellerHome onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />

          <Route path="/Thankyou" element={<ThankYouPage />} />

          {/* 비인증 사용자 */}
          <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signupPage" element={<SignupPage />} />
          <Route path="/ForgotPassword" element={<ForgotPassword />} />

          {/* 잘못된 경로 처리 */}
          <Route path="*" element={<Navigate to={isLoggedIn ? "/sellerhome" : "/"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
