import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_no: '',
    license_type: '',
    license_no: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://106.101.131.67:3000/user/createUser ', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('✅ 회원가입 성공');
        navigate('/'); // 다음 페이지로 이동
      } else {
        console.error('❌ 서버 오류:', await response.text());
      }
    } catch (error) {
      console.error('❌ 네트워크 오류:', error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>회원가입</h2>
        <p className="sub-text">회원이 되어 다양한 서비스를 이용해보세요</p>

        <form className="signup-form" onSubmit={handleNext}>
          <label>이름</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="이름을 입력해주세요" />
          <label>이메일</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="이메일을 입력해주세요" />
          <label>비밀번호</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="비밀번호를 입력해주세요" />
          <label>휴대폰 번호</label>
          <input type="tel" name="phone_no" value={formData.phone_no} onChange={handleChange} placeholder="휴대폰 번호를 입력해주세요" />
          <label>자격증 유형</label>
          <select name="license_type" value={formData.license_type} onChange={handleChange}>
            <option value="" disabled>자격증을 선택해주세요</option>
            <option value="B">청소년상담사</option>
            <option value="C">상담심리사</option>
            <option value="D">전문상담사</option>
            <option value="E">정신건강임상심리사</option>
            <option value="F">임상심리전문가</option>
          </select>
          <label>자격증 번호</label>
          <input type="text" name="license_no" value={formData.license_no} onChange={handleChange} placeholder="자격증 번호를 입력해주세요" />
          <button type="submit" className="signup-btn">가입하기</button>
        </form>

        <p className="login-text">
          이미 계정이 있으신가요? <Link to="/">로그인</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;