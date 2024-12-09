import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import '../../css/LoginHome.css';

function LoginPage({ onLogin }) {
  const [storeId, setStoreId] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const [rememberMe, setRememberMe] = useState(false); // "아이디 기억하기" 체크박스 상태
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수

  // 페이지 로딩 시 쿠키에서 아이디 불러오기
  useEffect(() => {
    const savedStoreId = Cookies.get("storeId"); // 쿠키에서 아이디 가져오기
    if (savedStoreId) {
      setStoreId(savedStoreId); // 아이디를 input에 채워넣기
      setRememberMe(true); // "아이디 기억하기" 체크 상태를 true로 설정
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); // 폼 제출 시 새로고침 방지

    if (!storeId || !password) {
      setErrorMessage("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true); // 로딩 시작

    try {
      const url = `/ROOT/api/seller/login.do`; // 로그인 API
      const headers = { "Content-Type": "application/json" };
      const body = { storeId, password };

      const { data } = await axios.post(url, body, { headers });

      if (data.status === 200) {
        // 로그인 성공 시 로컬 스토리지에 토큰 저장
        localStorage.setItem("token", data.token);
        localStorage.setItem("storeId", storeId);

        // "아이디 기억하기"가 체크되었으면 쿠키에 아이디 저장
        if (rememberMe) {
          Cookies.set("storeId", storeId, { expires: 30 }); // 쿠키에 30일 동안 저장
        } else {
          Cookies.remove("storeId"); // 체크 안되었으면 쿠키에서 삭제
        }

        // 로그인 상태 업데이트
        onLogin();

        // 로그인 후 SellerHome 페이지로 이동, 로그인 데이터 전달
        navigate("/sellerhome", { state: { storeId, token: data.token } });
      } else if (data.status === 403) {
        // 삭제된 계정 처리
        setErrorMessage("탈퇴한 가게입니다.");
      } else {
        // 기타 에러 처리
        setErrorMessage(data.message || "아이디 또는 비밀번호가 잘못되었습니다.");
      }
    } catch (error) {
      console.error("로그인 중 오류:", error);
      setErrorMessage("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-home">
      <div className="logo-container">
        <h2 className="logo">ECOEATS</h2>
      </div>

      <div className="login-container">
        <h3 className="login-title">SELLER LOGIN</h3>

        <form onSubmit={handleLogin}>
          <div className="login-input">
            <input
              type="text"
              className="login-id"
              placeholder="ID"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
            />
            <input
              type="password"
              className="login-pw"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <div className="remember-me">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)} // 체크박스 상태 변경
              />
              아이디 기억하기
            </label>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !storeId || !password} // 로딩 중이거나 입력 값이 없으면 비활성화
          >
            {isLoading ? "로그인 중..." : "LOGIN"}
          </button>
        </form>

        <div className="links">
          <Link to="/signupPage" className="link">SIGN UP</Link>
          <Link to="/ForgotPassword" className="link">FORGOT PASSWORD?</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
