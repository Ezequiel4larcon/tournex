import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ForumProvider } from '../context/ForumContext';
import Layout from '../components/Layout';
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
import TournamentBracket from '../pages/TournamentBracket';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ForumProvider>
          <Routes>
            {/* Auth Routes - Sin Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Todas las demás rutas usan el Layout */}
            <Route element={<Layout />}>
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
              
              {/* Tournament Routes - All Protected */}
              <Route 
                path="/tournaments" 
                element={
                  <ProtectedRoute>
                    <Tournaments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tournaments/:id" 
                element={
                  <ProtectedRoute>
                    <TournamentDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tournaments/:id/bracket" 
                element={
                  <ProtectedRoute>
                    <TournamentBracket />
                  </ProtectedRoute>
                } 
              />
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
              <Route 
                path="/comment/:id" 
                element={
                  <ProtectedRoute>
                    <CommentDetail />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </ForumProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;
