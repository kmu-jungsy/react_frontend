// DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';
import profile from '../assets/profile.jpg';
import './DashboardPage.css';

function DashboardPage() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const user = location.state?.userData;
  const userName = user?.name || '김이름';
  const userId = user?.id;

  useEffect(() => {
    const fetchPatients = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`http://172.21.214.129:3000/child/getAllChildrenByUser?userid=${userId}`);
        if (!response.ok) {
          throw new Error('서버 응답 실패');
        }
        const data = await response.json();

        const processedPatients = data.map((child) => {
        const ssnFront = child.ssn?.split('-')[0] || '';
        const age = calculateAge(ssnFront);
        return {
          id: child.id,
          name: child.name,
          birth: ssnFront,
          age: age,
          ssn: child.ssn
        };
      });

        setPatients(processedPatients);
      } catch (error) {
        console.error('❌ 환자 목록 불러오기 실패:', error);
      }
    };

    fetchPatients();
  }, [userId]);

  const handleAddPatient = () => {
    navigate('/add-patient', {
      state: { userData: user }
    });
  };

  const handleDelete = async (id) => {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

     try {
      const response = await fetch('http://172.21.214.129:3000/child/deleteChild', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ssn: patient.ssn, 
          userid: userId
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // 삭제 성공 후 목록 갱신
      const updated = patients.filter(p => p.id !== id);
      setPatients(updated);
      console.log('✅ 환자 삭제 성공');
    } catch (error) {
      console.error('❌ 환자 삭제 실패:', error);
      alert('삭제에 실패했습니다: ' + error.message);
    }
  };


  const toggleDropdown = (id) => {
    setOpenDropdownId(prev => (prev === id ? null : id));
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (front) => {
    if (front.length !== 6) return '';
    const birthYear = parseInt(front.substring(0, 2), 10);
    const fullYear = birthYear > 24 ? 1900 + birthYear : 2000 + birthYear;
    const birthDate = new Date(`${fullYear}-${front.substring(2, 4)}-${front.substring(4, 6)}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleCreateTest = async (childId) => {
    try {
      const response = await fetch('http://172.21.214.129:3000/test/createTest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: userId,
          childid: childId,
          isCompleted: false,
          completedDate: null
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      console.log('✅ 검사 생성 성공');
      alert('검사가 성공적으로 생성되었습니다.');
    } catch (error) {
      console.error('❌ 검사 생성 실패:', error);
      alert('검사 생성에 실패했습니다: ' + error.message);
    }
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
            <div className="user-name">{userName} 님</div>
          </div>
          <nav className="nav-menu">
            <button className="nav-button active">home</button>
            <button className="nav-button" onClick={() => navigate('/exam', { state: { user } })}>검사</button>
            <button className="nav-button" onClick={() => navigate('/mypage')}>마이페이지</button>
          </nav>
        </div>

        <div className="main-area">
          <div className="sub-header">
            <input
              type="text"
              placeholder="환자검색"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="add-button2" onClick={handleAddPatient}>환자추가</button>
          </div>

          <div className="main-content patient-list aligned-left">
            {filteredPatients.length === 0 ? (
              <div className="empty-message">해당 환자가 없습니다</div>
            ) : (
              filteredPatients.map((p) => (
                <div key={p.id} className="patient-card">
                  <div className="card-header">
                    <strong>{p.name}</strong>
                    <div className="dropdown">
                      <button className="menu-button" onClick={() => toggleDropdown(p.id)}>⋮</button>
                      {openDropdownId === p.id && (
                        <div className="dropdown-content">
                          <button onClick={() => handleCreateTest(p.id)}>검사 생성하기</button>
                          <button onClick={() => handleDelete(p.id)}>환자 삭제하기</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p>나이: {p.age}세</p>
                  <p>생년월일: {p.birth}</p>

                  <button className="report-button" onClick={() => navigate('/report')}>보고서 작성</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;