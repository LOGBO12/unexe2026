import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import InvitationPage from '../pages/auth/InvitationPage'
import CompleteProfilePage from '../pages/auth/CompleteProfilePage'
import MainLayout from '../layouts/MainLayout'
import PublicLayout from '../layouts/PublicLayout'
import CommitteePage from '../pages/public/CommitteePage'
import ForumPage   from '../pages/admin/ForumPage'
import ProfilePage from '../pages/admin/ProfilePage'

// Admin pages
import DashboardPage    from '../pages/admin/DashboardPage'
import InvitationsPage  from '../pages/admin/InvitationsPage'
import CandidaturesPage from '../pages/admin/CandidaturesPage'
import ComiteMembresPage from '../pages/admin/ComiteMembresPage'
import LogsPage         from '../pages/admin/LogsPage'
import PartenairesAdminPage from '../pages/admin/PartenairesPage'
import ComitePageEditor     from '../pages/admin/ComitePageEditor'
import CandidatsAdminPage   from '../pages/admin/CandidatsPage'

// Placeholders
const EspaceCandidat  = () => <div className="text-xl font-bold p-4">🏆 Mon espace candidat</div>
const CandidatsPage   = () => <div className="text-xl font-bold p-8">👥 Candidats validés (bientôt)</div>
const PartenairesPage = () => <div className="text-xl font-bold p-8">🤝 Partenaires (bientôt)</div>
const CommunautePage  = () => <div className="text-xl font-bold p-8">💬 Communauté (bientôt)</div>

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

export default function AppRouter() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/comite" replace />} />

        {/* AUTH */}
        <Route path="/login"           element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register"        element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/invitation/:token"     element={<InvitationPage />} />
        <Route path="/complete-profile" element={
          <PrivateRoute roles={['candidat']}><CompleteProfilePage /></PrivateRoute>
        } />

        {/* PAGES PUBLIQUES */}
        <Route element={<PublicLayout />}>
          <Route path="/comite"      element={<CommitteePage />} />
          <Route path="/candidats"   element={<CandidatsPage />} />
          <Route path="/partenaires" element={<PartenairesPage />} />
          <Route path="/communaute"  element={<CommunautePage />} />
        </Route>

        {/* PAGES PRIVÉES */}
        <Route element={
          <PrivateRoute roles={['super_admin', 'comite', 'candidat']}>
            <MainLayout />
          </PrivateRoute>
        }>
          {/* Admin */}
          <Route path="/dashboard" element={
            <PrivateRoute roles={['super_admin', 'comite']}><DashboardPage /></PrivateRoute>
          } />
          <Route path="/dashboard/invitations" element={
            <PrivateRoute roles={['super_admin', 'comite']}><InvitationsPage /></PrivateRoute>
          } />
          <Route path="/dashboard/candidatures" element={
            <PrivateRoute roles={['super_admin', 'comite']}><CandidaturesPage /></PrivateRoute>
          } />
          <Route path="/dashboard/comite" element={
            <PrivateRoute roles={['super_admin', 'comite']}><ComiteMembresPage /></PrivateRoute>
          } />
          <Route path="/dashboard/logs" element={
            <PrivateRoute roles={['super_admin']}><LogsPage /></PrivateRoute>
          } />
          <Route path="/dashboard/partenaires" element={
            <PrivateRoute roles={['super_admin', 'comite']}>
                <PartenairesAdminPage />
            </PrivateRoute>
            } />
            <Route path="/dashboard/comite/page" element={
            <PrivateRoute roles={['super_admin', 'comite']}>
                <ComitePageEditor />
            </PrivateRoute>
            } />
            <Route path="/dashboard/candidats" element={
            <PrivateRoute roles={['super_admin', 'comite']}>
                <CandidatsAdminPage />
            </PrivateRoute>
            } />
            <Route path="/dashboard/forum" element={
  <PrivateRoute roles={['super_admin', 'comite']}>
    <ForumPage />
  </PrivateRoute>
} />
<Route path="/profil" element={
  <PrivateRoute roles={['super_admin', 'comite', 'candidat']}>
    <ProfilePage />
  </PrivateRoute>
} />

          {/* Candidat */}
          <Route path="/espace-candidat" element={
            <PrivateRoute roles={['candidat']}><EspaceCandidat /></PrivateRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}