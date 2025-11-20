import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ForumProvider } from '../context/ForumContext';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NewPost from '../pages/NewPost';
import CommentDetail from '../pages/CommentDetail';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ForumProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/new-post"
                element={
                  <ProtectedRoute>
                    <NewPost />
                  </ProtectedRoute>
                }
              />
              <Route path="/comment/:id" element={<CommentDetail />} />
            </Routes>
          </div>
        </ForumProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
