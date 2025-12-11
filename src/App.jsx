import { Routes, Route, Navigate } from 'react-router-dom';
import DashBoard from './pages/DashBoard';
import BlogEditor from './pages/BlogEditor';
import Login from './pages/Login';
import ProtectedRoute from './componenets/ProtectedRoute';
import './App.css';
import { BlogProvider } from './context/BlogContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BlogProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="create"
            element={
              <ProtectedRoute>
                <BlogEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="edit/:id"
            element={
              <ProtectedRoute>
                <BlogEditor />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BlogProvider>
    </AuthProvider>
  );
}

export default App;
