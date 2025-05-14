// ReportWritePage.js
import React, { useState } from 'react';
import './DashboardPage.css';
import drawing from '../assets/example_drawing.png';
import baby_profile from '../assets/baby_profile.jpg';
import logo from '../assets/logo.png';

function ReportWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const exam = location.state?.exam;
  const user = location.state?.user;
  const [selectedIcon, setSelectedIcon] = useState(0);
  const iconButtons = ['🏠', '🌳', '👦', '👧'];

  const nameRef = useRef();
  const genderRef = useRef();
  const testDateRef = useRef();
  const questionRefs = {
    house: useRef(),
    tree: useRef(),
    man: useRef(),
    woman: useRef()
  };

  const IP_ADDR = process.env.REACT_APP_IP_ADDR;
  
  useEffect(() => {
    const fetchData = async () => {
      if (!exam?.id) return;
      try {
        const res = await fetch(`${IP_ADDR}/htpReport/init/${exam.id}`);
        const data = await res.json();

        if (nameRef.current) nameRef.current.value = data.name;
        if (genderRef.current) genderRef.current.value = data.gender;
        if (testDateRef.current) testDateRef.current.value = data.testDate;

        data.qna.forEach(item => {
          const ref = questionRefs[item.drawingType];
          if (ref?.current) {
            ref.current.value = item.questions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n");
          }
        });
      } catch (err) {
        console.error('보고서 데이터 불러오기 실패:', err);
      }
    };
    fetchData();
  }, [exam?.id]);


  return (
    <div className="dashboard">
      <div className="global-top-bar">
        <img src={logo} alt="logo" className="center-logo" />
      </div>

      <div className="dashboard-body">
        <div className="main-area report-write-area">
          {/* 왼쪽: 아이 정보 및 그림 */}
          <div className="report-left-panel">
            <img src={baby_profile} alt="baby_profile" className="side-profile" />
            <div className="side-name-age">
              <div className="name">{exam?.name}</div>
              <div className="age">만 {exam?.birth}세</div>
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
            <div className="drawing-container">
              <img src={drawing} alt="그림" className="drawing-image" />
            </div>
          </div>

          {/* 오른쪽: HTP 검사 보고서 양식 */}
          <div className="report-right-panel">
          <div className="report-header">
              <h2 className="report-title">HTP 검사 보고서</h2>
              <button className="save-button">저장</button>
            </div>
            <div className="report-scrollable">
              
              <table className="htp-table">
                <tbody>
                  <tr>
                    <td>이름</td>
                    <td><input ref={nameRef} type="text" className="full-width-input" /></td>
                    <td>성별</td>
                    <td><input ref={genderRef} type="text" className="full-width-input" /></td>
                  </tr>
                  <tr>
                    <td>나이</td>
                    <td><input type="text" className="full-width-input" /></td>
                    <td>생년월일</td>
                    <td><input type="text" className="full-width-input" /></td>
                  </tr>
                  <tr>
                    <td>검사일</td>
                    <td><input ref={testDateRef} type="text" className="full-width-input" /></td>
                    <td>검사자</td>
                    <td><input type="text" className="full-width-input" /></td>
                  </tr>
                  <tr>
                    <td className="section-header" colSpan="4">의뢰 사유</td>
                  </tr>
                  <tr>
                    <td colSpan="4"><textarea className="full-width-input" rows="3"></textarea></td>
                  </tr>
                  <tr>
                    <td className="section-header" colSpan="4">가족배경과 개인력</td>
                  </tr>
                  <tr>
                    <td colSpan="4"><textarea className="full-width-input" rows="5"></textarea></td>
                  </tr>
                  <tr>
                    <td className="section-header" colSpan="4">FAMILY TREE</td>
                  </tr>
                  <tr>
                    <td colSpan="4"><textarea className="full-width-input" rows="5"></textarea></td>
                  </tr>
                  <tr>
                    <td className="section-header" colSpan="4">요약 및 검사자의 견해</td>
                  </tr>
                  <tr>
                    <td colSpan="4"><textarea className="full-width-input" rows="8"></textarea></td>
                  </tr>
                </tbody>
              </table>
              <h3 className="page-title">1. 전체적 느낌과 그림의 내용</h3>
                <table className="htp-table">
                <tbody>
                    <tr>
                    <td style={{ width: '20%' }}>그림의 전체적 느낌</td>
                    <td style={{ width: '80%' }}>
                        <textarea className="full-width-input" rows="4" />
                    </td>
                    </tr>
                </tbody>
                </table>
                <div style={{ height: '80px' }}></div>
                <h3 className="page-title">2. 개별 그림 분석 - 집</h3>
                <table className="htp-table">
                <thead>
                    <tr>
                    <td rowSpan="2">집</td>
                    <td rowSpan="2">유무</td>
                    <td colSpan="2">분석</td>
                    </tr>
                    <tr>
                    <td>표현의 특징</td>
                    <td>상징과 해석</td>
                    </tr>
                </thead>
                <tbody>
                    {['주제', '지붕', '벽', '문', '창문', '기타 요소'].map((item, idx) => (
                    <tr key={idx}>
                        <td>{item}</td>
                        <td style={{ width: '10%' }}>
                        <input type="text" className="full-width-input" />
                        </td>
                        <td><textarea className="full-width-input" rows="2" /></td>
                        <td><textarea className="full-width-input" rows="2" /></td>
                    </tr>
                    ))}
                </tbody>
                </table>

                <h3 className="page-title">그린 후의 질문</h3>
                <table className="htp-table">
                <tbody>
                    <tr>
                    <td colSpan="4"><textarea ref={questionRefs.house} className="full-width-input" rows="3" /></td>
                    </tr>
                </tbody>
                </table>
                <div style={{ height: '80px' }}></div>
                <h3 className="page-title">3. 개별 그림 분석 - 나무</h3>
                <table className="htp-table">
                  <thead>
                    <tr>
                      <td rowSpan="2">나무</td>
                      <td rowSpan="2" style={{ width: '10%' }}>유무</td>
                      <td colSpan="2">분석</td>
                    </tr>
                    <tr>
                      <td>표현의 특징</td>
                      <td>상징과 해석</td>
                    </tr>
                  </thead>
                  <tbody>
                    {['주제', '줄기', '가지', '수관', '기타 요소'].map((item, idx) => (
                      <tr key={idx}>
                        <td>{item}</td>
                        <td><input type="text" className="full-width-input" /></td>
                        <td><textarea className="full-width-input" rows="2" /></td>
                        <td><textarea className="full-width-input" rows="2" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 className="page-title">그린 후의 질문</h3>
                <table className="htp-table">
                  <tbody>
                    <tr>
                      <td colSpan="4"><textarea ref={questionRefs.tree} className="full-width-input" rows="3" /></td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ height: '80px' }}></div>
                <h3 className="page-title">4. 개별 그림 분석 - 남자</h3>
                <table className="htp-table">
                  <thead>
                    <tr>
                      <td rowSpan="2">사람</td>
                      <td rowSpan="2" style={{ width: '10%' }}>유무</td>
                      <td colSpan="2">분석</td>
                    </tr>
                    <tr>
                      <td>표현의 특징</td>
                      <td>상징과 해석</td>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      '주제와 행동', '성차의 표현', '머리', '눈코입 표정', '몸통',
                      '팔', '다리', '손', '발', '기타 요소', '그 밖의 인물'
                    ].map((item, idx) => (
                      <tr key={idx}>
                        <td>{item}</td>
                        <td><input type="text" className="full-width-input" /></td>
                        <td><textarea className="full-width-input" rows="2" /></td>
                        <td><textarea className="full-width-input" rows="2" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 className="page-title">그린 후의 질문</h3>
                <table className="htp-table">
                  <tbody>
                    <tr>
                      <td colSpan="4">
                        <textarea ref={questionRefs.man} className="full-width-input" rows="3" />
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ height: '80px' }}></div>
                <h3 className="page-title">5. 개별 그림 분석 - 여자</h3>
                <table className="htp-table">
                  <thead>
                    <tr>
                      <td rowSpan="2">사람</td>
                      <td rowSpan="2" style={{ width: '10%' }}>유무</td>
                      <td colSpan="2">분석</td>
                    </tr>
                    <tr>
                      <td>표현의 특징</td>
                      <td>상징과 해석</td>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      '주제와 행동', '성차의 표현', '머리', '눈코입 표정', '몸통',
                      '팔', '다리', '손', '발', '기타 요소', '그 밖의 인물'
                    ].map((item, idx) => (
                      <tr key={idx}>
                        <td>{item}</td>
                        <td><input type="text" className="full-width-input" /></td>
                        <td><textarea className="full-width-input" rows="2" /></td>
                        <td><textarea className="full-width-input" rows="2" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3 className="page-title">그린 후의 질문</h3>
                <table className="htp-table">
                  <tbody>
                    <tr>
                      <td colSpan="4">
                        <textarea ref={questionRefs.woman} className="full-width-input" rows="3" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              <div style={{ height: '160px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportWritePage;
