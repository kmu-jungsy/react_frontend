// ReportWritePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './DashboardPage.css';
import family_tree1 from '../assets/family_tree1.png';
import family_tree2 from '../assets/family_tree2.png';
import family_tree3 from '../assets/family_tree3.png';
import family_tree4 from '../assets/family_tree4.png';
import family_tree5 from '../assets/family_tree5.png';
import family_tree6 from '../assets/family_tree6.png';
import family_tree7 from '../assets/family_tree7.png';
import family_tree8 from '../assets/family_tree8.png';
import family_tree9 from '../assets/family_tree9.png';
import family_tree10 from '../assets/family_tree10.png';
import baby_profile from '../assets/baby_profile.jpg';
import logo from '../assets/logo.png';

function ReportWritePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const exam = location.state?.exam;
  const user = location.state?.user;
  const [selectedIcon, setSelectedIcon] = useState(0);
  const [drawingUrl, setDrawingUrl] = useState('');
  const iconButtons = ['🏠', '🌳', '👦', '👧'];
  const drawingTypes = ['house', 'tree', 'man', 'woman'];
  const drawingType = drawingTypes[selectedIcon];

  const familyTreeImages = [
    family_tree1, family_tree2, family_tree3, family_tree4, family_tree5,
    family_tree6, family_tree7, family_tree8, family_tree9, family_tree10
  ];
  const [showFamilyTreeSelector, setShowFamilyTreeSelector] = useState(false);
  const [selectedFamilyTreeIndex, setSelectedFamilyTreeIndex] = useState(null);

  const nameRef = useRef();
  const genderRef = useRef();
  const testDateRef = useRef();
  const examinerRef = useRef();
  const reasonRef = useRef();
  const backgroundRef = useRef();
  const ssnRef = useRef();
  const ageRef = useRef();
  const questionRefs = {
    house: useRef(),
    tree: useRef(),
    man: useRef(),
    woman: useRef()
  };

  const IP_ADDR = process.env.REACT_APP_IP_ADDR;

  const sectionKeys = {
    house: ['Subject', 'Roof', 'Wall', 'Door', 'Window', 'Others'],
    tree: ['Subject', 'Stem', 'Branch', 'Crown', 'Others'],
    man: [
      'Subject', 'GenderExpression', 'Head', 'Face', 'Torso',
      'Arm', 'Leg', 'Hand', 'Foot', 'Others', 'Character'
    ],
    woman: [
      'Subject', 'GenderExpression', 'Head', 'Face', 'Torso',
      'Arm', 'Leg', 'Hand', 'Foot', 'Others', 'Character'
    ]
  };

  const refTable = useRef({});

  const populateFields = (data) => {
    Object.keys(sectionKeys).forEach(section => {
      sectionKeys[section].forEach((key, idx) => {
        const exprRef = refTable.current[`${section}_${idx}_expr`];
        const interpRef = refTable.current[`${section}_${idx}_interp`];
        const item = data[`${section}${key}`];
        if (item) {
          if (exprRef) exprRef.value = item.expression || '';
          if (interpRef) interpRef.value = item.interpretation || '';
        }
      });
    });
  };

  const collectReportData = () => {
    const report = {};
    Object.keys(sectionKeys).forEach(section => {
      sectionKeys[section].forEach((key, idx) => {
        const expr = refTable.current[`${section}_${idx}_expr`]?.value || '';
        const interp = refTable.current[`${section}_${idx}_interp`]?.value || '';
        report[`${section}${key}`] = { expression: expr, interpretation: interp };
      });
    });
    return report;
  };

  const handleDraft = async () => {
    const confirm = window.confirm('작성된 초안이 사라질 수 있습니다');
    if (!confirm) return;

    try {
      await fetch(`${IP_ADDR}/emr-draft/auto-fill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          testId: exam.id,
          types: ['house', 'tree', 'man', 'woman']
        })
      });

      const res = await fetch(`${IP_ADDR}/htpReport/${exam.id}`);
      const data = await res.json();
      populateFields(data);
    } catch (error) {
      console.error('초안 작성 실패:', error);
      alert('초안 작성 중 오류가 발생했습니다.');
    }
  };

  const handleSave = async () => {
    const payload = collectReportData();
    try {
      const response = await fetch(`${IP_ADDR}/htpReport/${exam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert('저장 성공');
        const res = await fetch(`${IP_ADDR}/htpReport/${exam.id}`);
        const newData = await res.json();
        populateFields(newData);
      } else {
        const errorText = await response.text();
        console.error('서버 응답 실패:', errorText);
        alert('저장 실패: ' + errorText);
      }
    } catch (err) {
      console.error('저장 요청 실패:', err);
    }
  };

  useEffect(() => {
    const fetchDrawing = async () => {
      try {
        const res = await fetch(`${IP_ADDR}/image/download?testId=${exam.id}&type=${drawingType}`);
        if (!res.ok) throw new Error('이미지 불러오기 실패');
        const blob = await res.blob();
        const imageUrl = URL.createObjectURL(blob);
        setDrawingUrl(imageUrl);
      } catch (err) {
        console.error('이미지 로딩 오류:', err);
        setDrawingUrl(''); // 에러 시 빈 그림
      }
    };

    if (exam?.id) {
      fetchDrawing();
    }
  }, [selectedIcon, exam?.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const checkRes = await fetch(`${IP_ADDR}/htpReport/check/${exam.id}`);
        const { exists: exists } = await checkRes.json();
        if (!exists) {
          await fetch(`${IP_ADDR}/htpReport/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ testId: exam.id })
          });
        }

        const initRes = await fetch(`${IP_ADDR}/htpReport/init/${exam.id}`);
        const initData = await initRes.json();

        if (nameRef.current) nameRef.current.value = initData.name;
        if (genderRef.current) genderRef.current.value = initData.gender;
        if (testDateRef.current) testDateRef.current.value = initData.testDate;
        if (examinerRef.current) examinerRef.current.value = initData.examiner;
        if (reasonRef.current) reasonRef.current.value = initData.reason;
        if (backgroundRef.current) backgroundRef.current.value = initData.background;
        if (ssnRef.current && initData.ssn) {
          const ssn6 = initData.ssn.slice(0, 6);
          ssnRef.current.value = ssn6;

          const yearPrefix = parseInt(ssn6.slice(0, 2), 10) < 25 ? 2000 : 1900;
          const birthYear = yearPrefix + parseInt(ssn6.slice(0, 2), 10);
          const birthMonth = parseInt(ssn6.slice(2, 4), 10);
          const birthDay = parseInt(ssn6.slice(4, 6), 10);

          const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
          const today = new Date();

          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          if (ageRef.current) ageRef.current.value = age;
        }

        initData.qna.forEach(item => {
          const ref = questionRefs[item.drawingType];
          if (ref?.current) {
            ref.current.value = item.questions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n");
          }
        });

        const res = await fetch(`${IP_ADDR}/htpReport/${exam.id}`);
        const data = await res.json();
        populateFields(data);
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
          <div className="report-left-panel">
            <img src={baby_profile} alt="baby_profile" className="side-profile" />
            <div className="side-name-age">
              <div className="name">{exam?.name}</div>
              <div className="age">생년월일 : {exam?.birth}</div>
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
              <img src={drawingUrl} alt="그림" className="drawing-image" />
            </div>
          </div>

          <div className="report-right-panel">
          <div className="report-header">
            <h2 className="report-title">HTP 검사 보고서</h2>
            <div className="report-action-buttons">
              <button className="save-button" onClick={handleDraft}>
                초안 작성
              </button>
              <button className="save-button" onClick={handleSave}>
                저장
              </button>
            </div>
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
                    <td><input type="text" ref={ageRef} className="full-width-input" /></td>
                    <td>생년월일</td>
                    <td><input type="text" ref={ssnRef} className="full-width-input" /></td>
                  </tr>
                  <tr>
                    <td>검사일</td>
                    <td><input ref={testDateRef} type="text" className="full-width-input" /></td>
                    <td>검사자</td>
                    <td><input ref={examinerRef} type="text" className="full-width-input" /></td>
                  </tr>
                  <tr>
                    <td className="section-header" colSpan="4">의뢰 사유</td>
                  </tr>
                  <tr>
                    <td colSpan="4"><textarea ref={reasonRef} className="full-width-input" rows="3"></textarea></td>
                  </tr>
                  <tr>
                    <td className="section-header" colSpan="4">가족배경과 개인력</td>
                  </tr>
                  <tr>
                    <td colSpan="4"><textarea ref={backgroundRef} className="full-width-input" rows="5"></textarea></td>
                  </tr>
                  <tr>
                    <td className="section-header" colSpan="4">FAMILY TREE</td>
                  </tr>
                  <tr>
                  <td colSpan="4">
                    <div className="family-tree-section">
                      {selectedFamilyTreeIndex !== null && (
                        <img
                          src={familyTreeImages[selectedFamilyTreeIndex]}
                          alt={`가계도 ${selectedFamilyTreeIndex + 1}`}
                          style={{ maxWidth: '50%', borderRadius: '8px' }}
                        />
                      )}
                      <button
                        className="report-button"
                        onClick={() => setShowFamilyTreeSelector(!showFamilyTreeSelector)}
                        style={{ width: '200px' }}
                      >
                        가계도 입력하기
                      </button>
                    </div>

                    {showFamilyTreeSelector && (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
                        {familyTreeImages.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`가계도 ${idx + 1}`}
                            style={{
                              width: '80px',
                              height: '80px',
                              objectFit: 'cover',
                              cursor: 'pointer',
                              border: selectedFamilyTreeIndex === idx ? '3px solid black' : '1px solid #ccc',
                              borderRadius: '6px'
                            }}
                            onClick={() => {
                              setSelectedFamilyTreeIndex(idx);
                              setShowFamilyTreeSelector(false);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </td>
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
                        <input
                          type="text"
                          className="full-width-input"
                        />
                      </td>
                      <td>
                        <textarea
                          className="full-width-input"
                          rows="2"
                          ref={(el) => (refTable.current[`house_${idx}_expr`] = el)}
                        />
                      </td>
                      <td>
                        <textarea
                          className="full-width-input"
                          rows="2"
                          ref={(el) => (refTable.current[`house_${idx}_interp`] = el)}
                        />
                      </td>
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
                      <td style={{ width: '10%' }}>
                        <input
                          type="text"
                          className="full-width-input"
                        />
                      </td>
                      <td>
                        <textarea
                          className="full-width-input"
                          rows="2"
                          ref={(el) => (refTable.current[`tree_${idx}_expr`] = el)}
                        />
                      </td>
                      <td>
                        <textarea
                          className="full-width-input"
                          rows="2"
                          ref={(el) => (refTable.current[`tree_${idx}_interp`] = el)}
                        />
                      </td>
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
                      <td style={{ width: '10%' }}>
                        <input
                          type="text"
                          className="full-width-input"
                        />
                      </td>
                      <td>
                        <textarea
                          className="full-width-input"
                          rows="2"
                          ref={(el) => (refTable.current[`man_${idx}_expr`] = el)}
                        />
                      </td>
                      <td>
                        <textarea
                          className="full-width-input"
                          rows="2"
                          ref={(el) => (refTable.current[`man_${idx}_interp`] = el)}
                        />
                      </td>
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
                      <td style={{ width: '10%' }}>
                        <input
                          type="text"
                          className="full-width-input"
                        />
                      </td>
                      <td>
                        <textarea
                          className="full-width-input"
                          rows="2"
                          ref={(el) => (refTable.current[`woman_${idx}_expr`] = el)}
                        />
                      </td>
                      <td>
                        <textarea
                          className="full-width-input"
                          rows="2"
                          ref={(el) => (refTable.current[`woman_${idx}_interp`] = el)}
                        />
                      </td>
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
