import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardPage.css';
import logo from '../assets/logo.png';
import profile from '../assets/profile.jpg';
import exampleDrawing from '../assets/example_drawing.png';
import baby_profile from '../assets/baby_profile.jpg';
require('dotenv').config();


function ExamResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const testId = location.state?.testId;

  // const response = await fetch();

  useEffect(() => {
    if(testId){
      localStorage.setItem('testId', testId);
    }
  }, [testId]);



  const [selectedIcon, setSelectedIcon] = useState(0);
  const [viewMode, setViewMode] = useState('event'); // 'event' or 'question'
  
  const behaviorList = [
    { icon: '☰', label: '선 굵기 변화' },
    { icon: '📌', label: '지우고 다시 그림' },
    { icon: '⏰', label: '오래 머문 부위' },
    { icon: '»', label: '빠르게 그린 부위' },
    { icon: '🔍', label: '반복 그림' },
  ];

  const questions = [
    { q: '집에 누가 살고있어?', a: '엄마랑 아빠랑 내가 살아' },
    { q: '집을 그릴때 기분이 어땠어?', a: '이런 집에서 살고 싶었어' },
  ];

  const iconButtons = ['🏠', '🌳', '👦', '👧'];

  return (
    <div className="dashboard">
      <div className="global-top-bar">
        <img src={logo} alt="logo" className="center-logo" />
      </div>

      <div className="dashboard-body">
        <div className="sidebar">
          <div className="sidebar-user">
            <img src={profile} alt="profile" className="user-avatar" />
            <div className="user-name">김이름</div>
          </div>

          <nav className="nav-menu">
            <button className="nav-button" onClick={() => navigate('/dashboard')}>home</button>
            <button className="nav-button active">검사</button>
            <button className="nav-button" onClick={() => navigate('/mypage')}>마이페이지</button>
          </nav>
        </div>

        <div className="main-area exam-result-area">
            <div className="exam-side-info">
                <img src={baby_profile} alt="baby_profile" className="side-profile" />
                <div className="side-name-age">
                    <div className="name">김이름</div>
                    <div className="age">만 7세</div>
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

                {/* ✅ 영상 확인하기 버튼 추가 위치 */}
                <button className="video-button black">
                    🎥 영상 확인하기
                </button>
            </div>

          <div className="drawing-container">
            <img src={exampleDrawing} alt="검사 그림" className="drawing-image" />
          </div>

          <div className="behavior-list">
            {/* ✅ 탭 선택 버튼 */}
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

            {/* ✅ 내용 렌더링 */}
            {viewMode === 'event' ? (
              behaviorList.map((item, index) => (
                <button key={index} className="behavior-item">
                  <span className="behavior-icon">{item.icon}</span>
                  <span className="behavior-label">{item.label}</span>
                </button>
              ))
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
