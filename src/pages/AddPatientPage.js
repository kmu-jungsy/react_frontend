import React, { useState } from 'react';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { useNavigate, useLocation } from 'react-router-dom';
import './AddPatientPage.css';
import logo from '../assets/logo.png';
import { v4 as uuidv4 } from 'uuid';

const AddPatientPage = () => {
  const location = useLocation();
  const userData = location.state?.userData;
  const userid = userData?.id;
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

  const handleSubmit = async () => {
    const ssn = `${formData.idFront}-${formData.idBack}`;
    const requestData = {
      name: formData.name,
      gender: formData.gender === '남자' ? 'male' : 'female',
      ssn: ssn,
      address: formData.address,
      phone_no: formData.phone,
      userid: userid,
      personal_history_family: formData.background,
      counseling_reason: formData.reason
    };

    try {
      const response = await fetch('http://172.21.214.129:3000/child/createChild', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 환자 추가 성공:', result);
        navigate('/dashboard', { state: { userData } });
      } else {
        const error = await response.text();
        alert('❌ 환자 추가 실패: ' + error);
      }
    } catch (error) {
      console.error('❌ 네트워크 오류:', error);
      alert('서버 연결 실패');
    }
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