import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import RegisterForm from './components/auth/RegisterForm'
import LoginForm from './components/auth/LoginForm'
import Dashboard from './components/dashboard/Dashboard'
import DashboardSuperUser from './components/dashboard/DashboardSuperUser'
import NotesPage from './components/eleve/NotesPage'
import PaiementPage from './components/eleve/PaiementPage'
import PlanningPage from './components/eleve/PlanningPage'
import CoursePage from './components/eleve/CoursePage'
import Profile from './components/common/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './components/layout/ForgotPassword';

// Dans votre composant Routes, ajoutez :

function App() {
  
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/LoginForm" element={<LoginForm />} />
      <Route path="/RegisterForm" element={<RegisterForm />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<DashboardSuperUser />} />
      <Route path="/cours" element={<CoursePage />} />
      <Route path="/notes" element={<NotesPage />} />
      <Route path="/planning" element={<PlanningPage />} />
      <Route path="/Paiement" element={<PaiementPage />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

    </Routes>
  )
}

export default App