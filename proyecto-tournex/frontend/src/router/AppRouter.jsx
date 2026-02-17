import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Tournaments from '../pages/Tournaments';
import CreateTournament from '../pages/CreateTournament';
import TournamentDetail from '../pages/TournamentDetail';
import TournamentBracket from '../pages/TournamentBracket';
import AdminUsers from '../pages/AdminUsers';
import NotFound from '../pages/NotFound';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            {/* Create debe ir ANTES de :id para evitar conflictos */}
            <Route
              path="/tournaments/create"
              element={
                <ProtectedRoute>
                  <CreateTournament />
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
            
            {/* Admin Routes - Solo super_admin */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />

            {/* 404 - Catch all */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;