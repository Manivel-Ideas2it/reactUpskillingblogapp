import { Routes, Route, Navigate } from 'react-router-dom';
import DashBoard from './pages/DashBoard';
import BlogEditor from './pages/BlogEditor';
import BlogDetail from './pages/BlogDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './componenets/ProtectedRoute';
import PublicRoute from './componenets/PublicRoute';
import './App.css';
import { BlogProvider } from './context/BlogContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BlogProvider>
          <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
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
          <Route
            path="blog/:id"
            element={
              <ProtectedRoute>
                <BlogDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BlogProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
