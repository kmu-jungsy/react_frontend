import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardPage.css';
import logo from '../assets/logo.png';
import profile from '../assets/profile.jpg';

function ExamPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const userId = user?.id;
  const userName = user?.name || '김이름';
  const [searchTerm, setSearchTerm] = useState('');

  const [examList, setExamList] = useState([]);
  const IP_ADDR = process.env.REACT_APP_IP_ADDR;

  useEffect(() => {
    const fetchExams = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`${IP_ADDR}/test/getAllTestsByUser?userid=${userId}`);
        if (!response.ok) throw new Error('서버 요청 실패');

        const data = await response.json();

        const processed = data.map(test => {
          const ssnFront = test.ssn?.split('-')[0] || '';
          return {
            id: test.id,
            name: test.childname,
            birth: ssnFront,
            status: test.isCompleted ? '완료' : '진행예정',
            date: test.isCompleted ? test.completedDate : '',
            isCompleted: test.isCompleted
          };
        });

        setExamList(processed);
      } catch (error) {
        console.error('❌ 검사 목록 불러오기 실패:', error);
      }
    };

    fetchExams();
  }, [userId]);

  const filteredList = examList.filter(exam =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="user-name">{userName} 님</div>
          </div>
          <nav className="nav-menu">
            <button className="nav-button" onClick={() => navigate('/dashboard', { state: { userData: user } })}>home</button>
            <button className="nav-button active">검사</button>
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
                  <th>검사 결과</th>    
                  <th>보고서 작성</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((exam) => (
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
                      {exam.isCompleted && (
                        <button
                          className="nav-button2"
                          onClick={() => navigate('/result-page', { state: { exam, user } })}
                        >
                          검사 보기
                        </button>
                      )}
                    </td>

                    <td>
                      {exam.isCompleted && (
                        <button
                          className="nav-button2"
                          onClick={() => navigate('/report', { state: { exam, user } })}
                        >
                          보고서 작성하기
                        </button>
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
