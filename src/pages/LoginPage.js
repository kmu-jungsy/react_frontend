import React from 'react';
import './LoginPage.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; 

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="logo" className="logo" />
        <h2>Drawing I</h2>

        <form className="login-form" onSubmit={handleLogin}>
          <label>이메일</label>
          <input type="email" placeholder="이메일" />

          <label>비밀번호</label>
          <input type="password" placeholder="비밀번호" />

          <button type="submit" className="login-btn">로그인</button>
        </form>

        <p className="signup-text">
          아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
