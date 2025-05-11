// ExamPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import logo from '../assets/logo.png';
import profile from '../assets/profile.jpg';

const mockExamData = Array.from({ length: 12 }, (_, i) => ({
  id: String(1000 + i),
  name: '김이름',
  birth: '만 8세 / 2017.3.15',
  status: i % 2 === 0 ? '완료' : '진행예정',
  date: '2025.04.25',
}));

function ExamPage() {
    const navigate = useNavigate();
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
            <button className="nav-button active">검사</button>
            <button className="nav-button" onClick={() => navigate('/mypage')}>마이페이지</button>
          </nav>
        </div>

        <div className="main-area">
          <div className="sub-header">
            <input type="text" placeholder="환자검색" className="search-input" />
            <button className="add-button2">환자추가</button>
          </div>

          <div className="exam-list">
            <h3 className="exam-title">검사 목록</h3>
            <table className="exam-table">
              <thead>
                <tr>
                  <th>회원번호</th>
                  <th>이름</th>
                  <th>생년월일</th>
                  <th>검사진행 상황</th>
                  <th>검사일</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mockExamData.map((exam) => (
                  <tr key={exam.id}>
                    <td>{exam.id}</td>
                    <td>{exam.name}</td>
                    <td>{exam.birth}</td>
                    <td>
                      <span className={`status-badge ${exam.status === '완료' ? 'done' : 'pending'}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td>{exam.date}</td>
                    <td>
                      {exam.status === '완료' && (
                        <button className="nav-button" onClick={() => navigate('/result-page')}>검사 보기</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamPage;
