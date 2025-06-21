// src/App.jsx
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Questionaries from './pages/questionaries/Questionaries';
import Instruction from './pages/instruction/Instruction';
import { TestEnd } from './pages/test-end/TestEnd';
import CandidateQuestionnaireForm from './pages/create-assessment/CandidateQuestionnaireForm';
import ProtectedRoute from './components/ProtectedRoute';
import '@ant-design/v5-patch-for-react-19';
import { message } from 'antd';


function App() {


  message.config({
    top: undefined,
    duration: 2,
    maxCount: 3,
  });

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/get-started" replace />} />
      <Route path="/get-started" element={<Instruction />} />
      <Route
        path="/questionaries"
        element={
          <ProtectedRoute>
            <Questionaries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/done"
        element={
          <ProtectedRoute>
            <TestEnd />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-question"
        element={
          <ProtectedRoute>
            <CandidateQuestionnaireForm />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
