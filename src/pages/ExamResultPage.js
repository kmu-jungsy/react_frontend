import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardPage.css';
import logo from '../assets/logo.png';
import profile from '../assets/profile.jpg';
import exampleDrawing from '../assets/example_drawing.png';
import baby_profile from '../assets/baby_profile.jpg';
import { computeStrokeScale, getEventsAndStrokes, playTimelapse} from '../services/reconFunctions';
import * as fabric from 'fabric';
import './ExamResultPage.css';

function ExamResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const exam = location.state?.exam;
  const user = location.state?.user;
  const canvasRef = useRef(null);
  const [eventButtons, setEventButtons] = useState([]);

  const [selectedIcon, setSelectedIcon] = useState(0);
  const [viewMode, setViewMode] = useState('event');
  const [questions, setQuestions] = useState([]);
  const [eventStrokes, setEventStrokes] = useState([]);
  const [allStrokes, setAllStrokes] = useState(null);
  const [scaleMeta, setScaleMeta] = useState(null);

  const iconButtons = ['🏠', '🌳', '👦', '👧'];
  const drawingTypes = ['house', 'tree', 'man', 'woman'];
  const IP_ADDR = process.env.REACT_APP_IP_ADDR;
  
  const eventLabelMap = {
    thin: '얇은 선',
    thick: '굵은 선',
    slow: '느린선',
    fast: '빠른선',
    repeat: '반복선'
  };
  // 선택된 버튼에 따라 서버에서 QnA 불러오기

  useEffect(() => {
    if (!exam?.id) return;

    const drawingType = drawingTypes[selectedIcon];

    const fetchQnA = async () => {
      try {
        const response = await fetch(
          `${IP_ADDR}/test/getQnAByTestId?testId=${exam.id}&drawingType=${drawingType}`
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

    const reconData = async () => {
      try {
        const { events, allStrokes, finalStrokes } = await getEventsAndStrokes(exam.id, drawingType);
        console.log({ events, allStrokes, finalStrokes });
        setEventStrokes(events?.eventStrokes);
        setAllStrokes(allStrokes);
        
        // 👉 eventButtons 만들기
        const extractedEvents = new Set();
        for (const ev of events?.eventStrokes || []) {
          for (const e of ev.event || []) {
            extractedEvents.add(e);
          }
        }
        setEventButtons(Array.from(extractedEvents));

        console.log("이벤트 버튼 목록", extractedEvents);
        setEventButtons(Array.from(extractedEvents));
        
        if (canvasRef.current) canvasRef.current.dispose();
        const canvas = new fabric.Canvas('c', {
          isDrawingMode: false,
          selection: false,
        });
        canvasRef.current = canvas;
        
        const {scale, offsetX, offsetY} = computeStrokeScale(allStrokes.strokes, canvas);
        setScaleMeta({scale, offsetX, offsetY});
        
        if (allStrokes?.strokes?.length) {
          await playTimelapse(canvas, allStrokes.strokes, scale, offsetX, offsetY);
        }

      } catch (error) {
        console.error('❌ strokes, events 불러오기 실패:', error);
      }
    };

    fetchQnA();
    reconData();
    
  }, [selectedIcon, exam?.id]);
  
  const replayEventStrokes = async(eventStrokes, allStrokes, eventType) => {
    if(!canvasRef.current || !allStrokes?.strokes?.length) return;
    const canvas = canvasRef.current;
    const {scale, offsetX, offsetY} = scaleMeta;

    console.log('eventStrokes : ', eventStrokes);
    console.log('allStrokes : ', allStrokes);

    //event에 해당하는 strokeOrder 추출
    const matchedOrders = new Set();
    for(const ev of eventStrokes){
      if(ev.event.includes(eventType)){
        ev.strokeOrder.forEach(order => matchedOrders.add(order));
      }
    }
    console.log(`${eventType}의 matchedOrders : ${matchedOrders}`);

    //추출된 strokeOrder에 해당되는 좌표 추출
    const matchedStrokes = allStrokes.strokes.filter(
      (stroke) => matchedOrders.has(stroke.strokeOrder)
    );
    
    console.log(`${eventType}으로 재생될 matchedStrokes : ${matchedStrokes}`);
    
    for(const stroke of matchedStrokes){
      const toRemove = canvas.getObjects().filter(obj => 
        obj.strokeOrder === stroke.strokeOrder
      );
      console.log(`지울 strokeOrder: ${stroke.strokeOrder}`);
      console.log('toRemove:', toRemove);
      toRemove.forEach(obj => canvas.remove(obj));

      await playTimelapse(canvas, [stroke], scale, offsetX, offsetY);

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // if(matchedStrokes.length > 0){
    //   await playTimelapse(canvas, matchedStrokes);
    // }else{
    //   console.log(`${eventType} 관련 stroke 없음`);
    // }
  }

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
             
          <div className="drawing-section">
            <div className="drawing-container">
              <canvas id="c" width={500} height={500} style={{ border: '1px solid #ccc' }}></canvas>
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
                  {eventButtons.map((eventType, index) => (
                    <button 
                      key={index} 
                      className="behavior-item"
                      onClick = {() => replayEventStrokes(eventStrokes, allStrokes, eventType)}  
                    >
                      <span className="behavior-icon">🎯</span>
                      <span className="behavior-label">{eventLabelMap[eventType] || eventType}</span>
                    </button>
                  ))}
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
    </div>
  );
}

export default ExamResultPage;
