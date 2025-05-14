import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardPage.css';
import logo from '../assets/logo.png';
import profile from '../assets/profile.jpg';
import exampleDrawing from '../assets/example_drawing.png';
import baby_profile from '../assets/baby_profile.jpg';

function ExamResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const exam = location.state?.exam;
  const user = location.state?.user;

  const [selectedIcon, setSelectedIcon] = useState(0);
  const [viewMode, setViewMode] = useState('event');
  const [questions, setQuestions] = useState([]);

  const iconButtons = ['🏠', '🌳', '👦', '👧'];
  const drawingTypes = ['house', 'tree', 'man', 'woman'];

  // 선택된 버튼에 따라 서버에서 QnA 불러오기
  useEffect(() => {
    if (!exam?.id) return;

    const drawingType = drawingTypes[selectedIcon];

    const fetchQnA = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/test/getQnAByTestId?testId=${exam.id}&drawingType=${drawingType}`
        );
        if (!response.ok) throw new Error('서버 응답 실패');

        const data = await response.json();

        // ✅ 여기 수정됨: questions 배열 내부 접근
        const qaPairs = (data.questions || []).map((item) => ({
          q: item.question,
          a: item.answer,
        }));

        setQuestions(qaPairs);
      } catch (error) {
        console.error('❌ QnA 불러오기 실패:', error);
      }
    };

    fetchQnA();
  }, [selectedIcon, exam?.id]);


  return (
    <div className="dashboard">
      <div className="global-top-bar">
        <img src={logo} alt="logo" className="center-logo" />
      </div>

      <div className="dashboard-body">
        <div className="sidebar">
          <div className="sidebar-user">
            <img src={profile} alt="profile" className="user-avatar" />
            <div className="user-name">{user?.name || '이름 없음'}</div>
          </div>
          <nav className="nav-menu">
            <button className="nav-button" onClick={() => navigate('/dashboard', { state: { userData: user } })}>home</button>
            <button className="nav-button active">검사</button>
          </nav>
        </div>

        <div className="main-area exam-result-area">
          <div className="exam-side-info">
            <img src={baby_profile} alt="baby_profile" className="side-profile" />
            <div className="side-name-age">
              <div className="name">{exam?.name}</div>
              <div className="age">생년월일: {exam?.birth}</div>
            </div>
            <div className="icon-button-group">
              {iconButtons.map((icon, index) => (
                <button
                  key={index}
                  className={`icon-toggle-button ${selectedIcon === index ? 'selected' : ''}`}
                  onClick={() => setSelectedIcon(index)}
                >
                  {icon}
                </button>
              ))}
            </div>
            <button className="video-button black" onClick={() => navigate('/video', { state: { user, exam } })}>🎥 영상 확인하기</button>
          </div>

          <div className="drawing-container">
            <img src={exampleDrawing} alt="검사 그림" className="drawing-image" />
          </div>

          <div className="behavior-list">
            <div className="view-toggle-buttons">
              <button
                className={`toggle-button ${viewMode === 'event' ? 'active' : ''}`}
                onClick={() => setViewMode('event')}
              >
                ✔ 이벤트 보기
              </button>
              <button
                className={`toggle-button ${viewMode === 'question' ? 'active' : ''}`}
                onClick={() => setViewMode('question')}
              >
                ✔ 질문 보기
              </button>
            </div>

            {viewMode === 'event' ? (
              <>
                {/* 기존 이벤트 목록 유지 */}
                <button className="behavior-item"><span className="behavior-icon">☰</span><span className="behavior-label">선 굵기 변화</span></button>
                <button className="behavior-item"><span className="behavior-icon">📌</span><span className="behavior-label">지우고 다시 그림</span></button>
              </>
            ) : (
              questions.map((qa, index) => (
                <div key={index} className="qa-box">
                  <div className="qa-question">Q {qa.q}</div>
                  <div className="qa-answer">{qa.a}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamResultPage;
