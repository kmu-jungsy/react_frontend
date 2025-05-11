// MyPage.js (주소 3줄 + 자격증 유형 select)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import logo from '../assets/logo.png';
import profile from '../assets/profile.jpg';
import './DashboardPage.css';

function MyPage() {
  const navigate = useNavigate();
  const open = useDaumPostcodePopup();

  const [formData, setFormData] = useState({
    name: '김이름',
    email: 'email@example.com',
    password: 'password1234',
    phone: '010-1234-5678',
    licenseType: '청소년상담사',
    licenseNumber: '12345678',
    centerName: '마음상담센터',
    businessNumber: '123-45-67890',
    tel: '02-123-4567',
    zipcode: '',
    address: '',
    addressDetail: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSearch = () => {
    open({
      onComplete: (data) => {
        setFormData((prev) => ({
          ...prev,
          zipcode: data.zonecode,
          address: data.roadAddress,
        }));
      },
    });
  };

  const labelMap = {
    name: '이름', email: '이메일', password: '비밀번호', phone: '휴대폰 번호',
    licenseType: '자격증 유형', licenseNumber: '자격증 번호',
    centerName: '상담센터명', businessNumber: '사업자번호',
    tel: '전화번호'
  };

  return (
    <div className="dashboard">
      <div className="global-top-bar">
        <img src={logo} alt="logo" className="center-logo" />
      </div>

      <div className="dashboard-body">
        <div className="sidebar">
          <div className="sidebar-user">
            <img src={profile} alt="profile" className="user-avatar" />
            <div className="user-name">김이름 님</div>
          </div>
          <nav className="nav-menu">
            <button className="nav-button" onClick={() => navigate('/dashboard')}>home</button>
            <button className="nav-button" onClick={() => navigate('/exam')}>검사</button>
            <button className="nav-button active">마이페이지</button>
          </nav>
        </div>

        <div className="main-area">
          <div className="sub-header">
            <button style={{ backgroundColor: 'red', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>로그아웃</button>
            <button className="add-button2">저장하기</button>
          </div>

          <div className="exam-list">
            <h2 className="exam-title">개인 정보</h2>
            <table className="exam-table">
              <tbody>
                {Object.entries(formData).map(([key, value]) => {
                  if (['zipcode', 'address', 'addressDetail'].includes(key)) return null;
                  return (
                    <tr key={key}>
                      <th>{labelMap[key]}</th>
                      <td className="input-cell">
                        {key === 'licenseType' ? (
                          <select
                            name={key}
                            value={value}
                            onChange={handleChange}
                            className="full-width-input"
                          >
                            <option value="청소년상담사">청소년상담사</option>
                            <option value="상담심리사">상담심리사</option>
                            <option value="전문상담사">전문상담사</option>
                            <option value="정신건강임상심리사">정신건강임상심리사</option>
                            <option value="임상심리전문가">임상심리전문가</option>
                          </select>
                        ) : (
                          <input
                            type={key === 'password' ? 'password' : 'text'}
                            name={key}
                            value={value}
                            onChange={handleChange}
                            className="full-width-input"
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}

                <tr>
                    <th>주소</th>
                    <td className="input-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <input
                            type="text"
                            name="zipcode"
                            placeholder="우편번호"
                            value={formData.zipcode}
                            onChange={handleChange}
                            style={{ width: '120px', padding: '6px 10px' }}
                        />
                        <button onClick={handleAddressSearch} style={{ padding: '6px 12px' }}>검색</button>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                        <input
                            type="text"
                            name="address"
                            placeholder="주소"
                            value={formData.address}
                            onChange={handleChange}
                            style={{ width: '70%', padding: '6px 10px' }}
                        />
                        </div>
                        <input
                        type="text"
                        name="addressDetail"
                        placeholder="상세주소"
                        value={formData.addressDetail}
                        onChange={handleChange}
                        style={{ width: '70%', padding: '6px 10px' }}
                        />
                    </td>
                </tr>


              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPage;
