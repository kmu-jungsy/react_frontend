import React, { useState } from 'react';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { useNavigate } from 'react-router-dom';
import './AddPatientPage.css';
import logo from '../assets/logo.png';
import { v4 as uuidv4 } from 'uuid';

const AddPatientPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    idFront: '',
    idBack: '',
    zonecode: '',
    address: '',
    detailAddress: '',
    phone: '',
    reason: '',
    background: ''
  });

  const navigate = useNavigate();
  const open = useDaumPostcodePopup();

  const handleComplete = (data) => {
    setFormData({
      ...formData,
      zonecode: data.zonecode,
      address: data.address
    });
  };

  const handleSearchAddress = () => {
    open({ onComplete: handleComplete });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    const name = formData.name;
    const birth = formData.idFront;
    const age = calculateAge(birth);
    const id = uuidv4(); 
  
    navigate('/dashboard', {
      state: {
        id,
        name,
        age,
        birth,
      },
    });
  };

  const calculateAge = (front) => {
    if (front.length < 6) return '';
    const birthYear = parseInt(front.substring(0, 2), 10);
    const fullYear = birthYear > 24 ? 1900 + birthYear : 2000 + birthYear;
    const birthDate = new Date(`${fullYear}-${front.substring(2, 4)}-${front.substring(4, 6)}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="dashboard-container">
      <div className="topbar-logo">
        <img src={logo} alt="Logo" className="dashboard-logo" />
      </div>
      <div className="dashboard-content">
        <h2>환자 추가</h2>

        <label>이름</label>
        <input name="name" type="text" onChange={handleChange} />

        <label>성별</label>
        <div>
          <label><input type="radio" name="gender" value="남자" onChange={handleChange} /> 남자</label>
          <label><input type="radio" name="gender" value="여자" onChange={handleChange} /> 여자</label>
        </div>

        <label>주민번호</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input name="idFront" type="text" placeholder="앞자리" onChange={handleChange} />
          <input name="idBack" type="text" placeholder="뒷자리" onChange={handleChange} />
        </div>

        <label>주소</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input name="zonecode" type="text" placeholder="우편번호" value={formData.zonecode} readOnly />
          <button onClick={handleSearchAddress}>검색</button>
        </div>
        <input name="address" type="text" placeholder="주소" value={formData.address} readOnly />
        <input name="detailAddress" type="text" placeholder="상세주소" onChange={handleChange} />

        <label>전화번호</label>
        <input name="phone" type="text" onChange={handleChange} />

        <label>의뢰사유</label>
        <textarea name="reason" onChange={handleChange} />

        <label>가족배경과 개인력</label>
        <textarea name="background" onChange={handleChange} />

        <button className="add-button" onClick={handleSubmit}>환자 추가하기</button>
      </div>
    </div>
  );
};

export default AddPatientPage;