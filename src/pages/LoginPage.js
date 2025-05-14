import React, { useState } from 'react';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function LoginPage() {
  const navigate = useNavigate();
  const IP_ADDR = process.env.REACT_APP_IP_ADDR;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${IP_ADDR}/user/findByEmailAndPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 로그인 성공:', data);
        navigate('/dashboard', { state: { userData: data } });
      } else {
        const errorText = await response.text();
        alert('❌ 로그인 실패: ' + errorText);
      }
    } catch (error) {
      console.error('❌ 로그인 에러:', error);
      alert('서버 연결에 실패했습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="logo" className="logo" />
        <h2>Drawing I</h2>

        <form className="login-form" onSubmit={handleLogin}>
          <label>이메일</label>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

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
