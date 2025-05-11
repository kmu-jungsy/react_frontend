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

  useEffect(() => {
    const stored = localStorage.getItem('patients');
    if (stored) {
      setPatients(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    const newPatient = location.state;
    if (newPatient && newPatient.id) {
      setPatients((prev) => {
        const alreadyExists = prev.some((p) => p.id === newPatient.id);
        const updated = !alreadyExists ? [...prev, newPatient] : prev;
        localStorage.setItem('patients', JSON.stringify(updated));
        return updated;
      });
      navigate('.', { replace: true });
    }
  }, [location.state]);

  const handleAddPatient = () => {
    navigate('/add-patient');
  };

  const handleDelete = (id) => {
    const updated = patients.filter(p => p.id !== id);
    setPatients(updated);
    localStorage.setItem('patients', JSON.stringify(updated));
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(prev => (prev === id ? null : id));
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button className="nav-button active">home</button>
            <button className="nav-button" onClick={() => navigate('/exam')}>검사</button>
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
                          <button onClick={() => alert('수정 기능은 추후 구현됩니다.')}>정보 수정하기</button>
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