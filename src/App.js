// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AddPatientPage from './pages/AddPatientPage';
import ExamPage from './pages/ExamPage';
import Mypage from './pages/MyPage';
import ExamResultPage from './pages/ExamResultPage';
import ReportWritePage from './pages/ReportWritePage';
import VideoTimelinePage from './pages/VideoTimelinePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/add-patient" element={<AddPatientPage />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/result-page" element={<ExamResultPage />} />
        <Route path="/report" element={<ReportWritePage />} />
        <Route path="/video" element={<VideoTimelinePage />} />
      </Routes>
    </Router>
  );
}

export default App;
