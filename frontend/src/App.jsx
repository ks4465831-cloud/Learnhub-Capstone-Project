import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyLearning from './pages/MyLearning.jsx';
import Learn from './pages/Learn.jsx';
import InstructorDashboard from './pages/InstructorDashboard.jsx';
import ManageCourse from './pages/ManageCourse.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/my-learning" element={<ProtectedRoute roles={['student']}><MyLearning /></ProtectedRoute>} />
          <Route path="/learn/:id" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
          <Route path="/instructor" element={<ProtectedRoute roles={['instructor']}><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/courses/:id" element={<ProtectedRoute roles={['instructor']}><ManageCourse /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
