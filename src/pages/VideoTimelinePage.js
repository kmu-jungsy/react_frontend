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
  const [childInfo, setChildInfo] = useState({ name: '���̸�', age: '�� 7��' });
  const exam = location.state?.exam;
  const testId = exam?.id
  const user = location.state?.user;
  const [noteTimestamp, setNoteTimestamp] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null); // � �޸� ���� ������
  const [editedContent, setEditedContent] = useState('');   // ���� ���� �޸� ����

  // ������ ��ư �迭 - ��, ����, ����, ����
  const iconButtons = ['?', '?', '?', '?'];
  const drawingTypes = ['house', 'tree', 'man', 'woman'];

  
  const IP_ADDR = process.env.REACT_APP_IP_ADDR;
  const fetchNotes = async (testId, drawingType) => {
    try {
        const response = await fetch(`${IP_ADDR}/note?testId=${testId}&type=${drawingType}`);
        if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
        } else {
        console.error("? ��Ʈ �ҷ����� ����");
        }
    } catch (error) {
        console.error("? ��Ʈ �������� ����:", error);
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
            console.error('���� ���� ����:', errorText);
            alert('? �޸� �߰��� �����߽��ϴ�.');
        }

        if (response.ok) {
        alert('? �޸� ���������� �߰��Ǿ����ϴ�.');
        setNoteTimestamp('');
        setNoteContent('');
        await fetchNotes(exam.id, typeMap[selectedIcon]);
        } else {
            const errorText = await response.text();
            console.error('���� ���� ����:', errorText);
            alert('? �޸� �߰��� �����߽��ϴ�.');
        }
    } catch (error) {
        console.error('? ���� ����:', error);
        alert('? ���� ���ῡ �����߽��ϴ�.');
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
            alert('? �޸� �����Ǿ����ϴ�.');
            setEditingNoteId(null);
            setEditedContent('');
            await fetchNotes(exam.id, typeMap[selectedIcon]);  // ���� �� notes ����
            } else {
            alert('? ���� ����');
            }
        } catch (error) {
            console.error('? ���� ����:', error);
            alert('? ���� ���� ����');
        }
        };

  // �׸� ���� ���� �ڵ鷯
  const handleIconChange = (index) => {
    setSelectedIcon(index);
    const type = drawingTypes[index];

    const url = `${IP_ADDR}/video/view/${exam.id}/${type}/${exam.id}_${type}.mp4`;
    setVideoUrl(url);

    fetchNotes(exam.id, type);  // ? �޸� �ҷ�����
    };

  useEffect(() => {
    const fetchTestData = async () => {
        try {
        setLoading(true);

        const type = drawingTypes[selectedIcon];
        const url = `${IP_ADDR}/video/view/${exam.id}/${type}/${exam.id}_${type}.mp4`;
        setVideoUrl(url);

        await fetchNotes(exam.id, type);

        setLoading(false);

        } catch (error) {
        console.error('? ������ �ε� ����:', error);
        setLoading(false);
        }
    };

    if (exam?.id) {
        fetchTestData();
    }
    }, [exam?.id]);

  // Ÿ�Ӷ��� �̺�Ʈ Ŭ�� �ڵ鷯
  const handleTimelineClick = (timestamp) => {
    if (videoRef.current) {
      // �ð� ���� (mm:ss)�� �ʷ� ��ȯ
      const seconds = convertToSeconds(timestamp);
      
      // ���� �ð� ����
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  // �ð� ���ڿ�(MM:SS)�� �ʷ� ��ȯ
  const convertToSeconds = (timestamp) => {
    const [minutes, seconds] = timestamp.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  // �ֹι�ȣ ���ڸ��� ���� ���
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
    
    return `�� ${age}��`;
  };

  // �̺�Ʈ Ÿ�Ժ� ������ ��ȯ �Լ�
  const getEventIcon = (type) => {
    switch (type) {
      case 'object': return '?'; // ��ü ����
      case 'repeat': return '?'; // �ݺ�
      case 'hesitation': return '??'; // ������
      case 'erase': return '?'; // �����
      case 'emphasis': return '?'; // ����
      default: return '?';
    }
  };

  return (
    <div className="dashboard">
      <div className="global-top-bar">
        <img src={logo} alt="logo" className="center-logo" />
      </div>

      <div className="dashboard-body">

        <div className="main-area">
          <div className="video-timeline-container">
            {/* ���� �г�: ȯ�� ���� */}
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
                �� ��� ��������
              </button>

              <div className="note-area">
                <input
                    type="text"
                    className="note-input"
                    placeholder="Ÿ�ӽ����� (��: 01:23)"
                    value={noteTimestamp}
                    onChange={(e) => setNoteTimestamp(e.target.value)}
                />
                <textarea
                    className="note-textarea"
                    rows="3"
                    placeholder="�޸� ������ �Է��ϼ���"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                />
                <button className="note-button" onClick={handleAddNote}>
                    �޸� �߰�
                </button>
                </div>
            </div>
            
            {/* �߾� �г�: ���� �÷��̾� */}
            <div className="video-container">
              {loading ? (
                <div className="loading-indicator">���� �ε� ��...</div>
              ) : (
                <video 
                  ref={videoRef} 
                  controls 
                  className="video-player"
                  src={videoUrl}
                >
                  �������� ������ �������� �ʽ��ϴ�.
                </video>
              )}
              
              {analysisData && (
                <div className="video-summary">
                  <h3>�׸� ���� ���</h3>
                  <p>{analysisData.objectiveSummary}</p>
                </div>
              )}
            </div>
            
            {/* ������ �г�: Ÿ�Ӷ��� */}
            <div className="timeline-container">
              <h3 className="timeline-title">Ÿ�Ӷ���</h3>
              
              {loading ? (
                <div className="loading-indicator">Ÿ�Ӷ��� �ε� ��...</div>
                ) : (timelineEvents.length === 0 && notes.length === 0) ? (
                <div className="empty-timeline">Ÿ�Ӷ��� �̺�Ʈ�� �����ϴ�.</div>
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
                            {editingNoteId === note._id ? '�����ϱ�' : '�����ϱ�'}
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