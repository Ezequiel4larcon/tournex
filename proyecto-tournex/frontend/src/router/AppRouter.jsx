import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ForumProvider } from '../context/ForumContext';
import Navbar from '../components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import NewPost from '../pages/NewPost';
import CommentDetail from '../pages/CommentDetail';
import Tournaments from '../pages/Tournaments';
import CreateTournament from '../pages/CreateTournament';
import TournamentDetail from '../pages/TournamentDetail';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ForumProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              
              {/* Dashboard Route */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Tournament Routes */}
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetail />} />
              <Route
                path="/tournaments/create"
                element={
                  <ProtectedRoute>
                    <CreateTournament />
                  </ProtectedRoute>
                }
              />
              
              {/* Forum Routes (Legacy) */}
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
