import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './DashboardPage.css';
import logo from '../assets/logo.png';
import profile from '../assets/profile.jpg';
import baby_profile from '../assets/baby_profile.jpg';

function VideoTimelinePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef(null);
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const exam = location.state?.exam;
  const testId = exam?.id
  const user = location.state?.user;
  const [noteTimestamp, setNoteTimestamp] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null); 
  const [editedContent, setEditedContent] = useState('');  

  const iconButtons = ['🏠', '🌳', '👦', '👧'];
  const drawingTypes = ['house', 'tree', 'man', 'woman'];

  
  const IP_ADDR = process.env.REACT_APP_IP_ADDR;
  const fetchNotes = async (testId, drawingType) => {
    try {
        const response = await fetch(`${IP_ADDR}/note?testId=${testId}&type=${drawingType}`);
        if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
        } else {
        console.error("노트 불러오기 실패");
        }
    } catch (error) {
        console.error("노트 가져오기 오류", error);
    }
    };

  const handleAddNote = async () => {
  const typeMap = ['house', 'tree', 'man', 'woman'];
  const noteData = {
        testId: exam?.id,
        type: typeMap[selectedIcon],
        timestamp: noteTimestamp,
        content: noteContent
    };

    try {
        const response = await fetch(`${IP_ADDR}/note/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('서버 응답 내용:', errorText);
            alert('메모 추가에 실패했습니다.');
        }

        if (response.ok) {
        alert('메모가 성공적으로 추가되었습니다.');
        setNoteTimestamp('');
        setNoteContent('');
        await fetchNotes(exam.id, typeMap[selectedIcon]);
        } else {
            const errorText = await response.text();
            console.error('서버 응답 내용:', errorText);
            alert('메모 추가에 실패했습니다.');
        }
    } catch (error) {
        console.error('서버 오류:', error);
        alert('서버 연결에 실패했습니다.');
    }
    };

    const handleUpdateNote = async (noteId) => {
        const typeMap = ['house', 'tree', 'man', 'woman'];
        const updatedNote = {
            testId: exam.id,
            type: typeMap[selectedIcon],
            noteId: noteId,
            content: editedContent,
        };

        try {
            const response = await fetch(`${IP_ADDR}/note/updateById`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedNote)
            });

            if (response.ok) {
            alert('메모가 수정되었습니다.');
            setEditingNoteId(null);
            setEditedContent('');
            await fetchNotes(exam.id, typeMap[selectedIcon]);  
            } else {
            alert('수정 실패');
            }
        } catch (error) {
            console.error('서버 오류:', error);
            alert('서버 연결 실패');
        }
        };


  const handleIconChange = (index) => {
    setSelectedIcon(index);
    const type = drawingTypes[index];

    const url = `${IP_ADDR}/video/download?testId=${exam.id}&type=${type}`;
    setVideoUrl(url);

    fetchNotes(exam.id, type);  
    };

  useEffect(() => {
    const fetchTestData = async () => {
        try {
        setLoading(true);

        const type = drawingTypes[selectedIcon];
        const url = `${IP_ADDR}/video/download?testId=${exam.id}&type=${type}`;
        setVideoUrl(url);

        await fetchNotes(exam.id, type);

        setLoading(false);

        } catch (error) {
        console.error('데이터 로딩 오류:', error);
        setLoading(false);
        }
    };

    if (exam?.id) {
        fetchTestData();
    }
    }, [exam?.id]);


  const handleTimelineClick = (timestamp) => {
    if (videoRef.current) {
      const seconds = convertToSeconds(timestamp);
      
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const convertToSeconds = (timestamp) => {
    const [minutes, seconds] = timestamp.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const calculateAge = (ssn) => {
    if (!ssn) return '';
    
    const front = ssn.split('-')[0];
    if (front.length !== 6) return '';
    
    const birthYear = parseInt(front.substring(0, 2), 10);
    const fullYear = birthYear > 24 ? 1900 + birthYear : 2000 + birthYear;
    const birthDate = new Date(`${fullYear}-${front.substring(2, 4)}-${front.substring(4, 6)}`);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    
    return `만 ${age}세`;
  };


  return (
    <div className="dashboard">
      <div className="global-top-bar">
        <img src={logo} alt="logo" className="center-logo" />
      </div>

      <div className="dashboard-body">

        <div className="main-area">
          <div className="video-timeline-container">
            <div className="patient-info-panel">
              <img src={baby_profile} alt="baby_profile" className="side-profile" />
              <div className="side-name-age">
                <div className="name">{exam?.name}</div>
                <div className="age">{exam?.birth}</div>
              </div>
              <div className="icon-button-group">
                {iconButtons.map((icon, index) => (
                  <button
                    key={index}
                    className={`icon-toggle-button ${selectedIcon === index ? 'selected' : ''}`}
                    onClick={() => handleIconChange(index)}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              
              <button 
                className="back-button"
                onClick={() => navigate('/result-page', { state: { exam, user } })}
              >
                ← 결과 페이지로
              </button>

              <div className="note-area">
                <input
                    type="text"
                    className="note-input"
                    placeholder="타임스탬프 (예: 01:23)"
                    value={noteTimestamp}
                    onChange={(e) => setNoteTimestamp(e.target.value)}
                />
                <textarea
                    className="note-textarea"
                    rows="3"
                    placeholder="메모 내용을 입력하세요"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                />
                <button className="note-button" onClick={handleAddNote}>
                    메모 추가
                </button>
                </div>
            </div>
            
            <div className="video-container">
              {loading ? (
                <div className="loading-indicator">영상 로딩 중...</div>
              ) : (
                <video 
                  ref={videoRef} 
                  controls 
                  className="video-player"
                  src={videoUrl}
                >
                  브라우저가 비디오를 지원하지 않습니다.
                </video>
              )}
              
              {analysisData && (
                <div className="video-summary">
                  <h3>그림 과정 요약</h3>
                  <p>{analysisData.objectiveSummary}</p>
                </div>
              )}
            </div>
            
            <div className="timeline-container">
              <h3 className="timeline-title">타임라인</h3>
              
              {loading ? (
                <div className="loading-indicator">타임라인 로딩 중...</div>
                ) : (timelineEvents.length === 0 && notes.length === 0) ? (
                <div className="empty-timeline">타임라인 이벤트가 없습니다.</div>
                ) : (
                <div className="timeline-events">
                    {notes.map((note, index) => (
                        <div key={`note-${index}`} className="timeline-event note">
                            <div className="note-content-wrapper">
                            <div
                                className="event-time"
                                onClick={() => handleTimelineClick(note.timestamp)}
                            >
                                {note.timestamp}
                            </div>
                            <div className="event-icon">?</div>
                            {editingNoteId === note._id ? (
                                <textarea
                                className="note-edit-textarea"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                />
                            ) : (
                                <div className="event-description">{note.content}</div>
                            )}
                            </div>

                            <button
                            className="note-edit-button"
                            onClick={() => {
                                if (editingNoteId === note._id) {
                                handleUpdateNote(note._id);
                                } else {
                                setEditingNoteId(note._id);
                                setEditedContent(note.content);
                                }
                            }}
                            >
                            {editingNoteId === note._id ? '저장하기' : '수정하기'}
                            </button>
                        </div>
                        ))}

                </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoTimelinePage;