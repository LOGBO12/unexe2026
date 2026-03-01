import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Auth
import LoginPage           from '../pages/auth/LoginPage'
import RegisterPage        from '../pages/auth/RegisterPage'
import ForgotPasswordPage  from '../pages/auth/ForgotPasswordPage'
import ResetPasswordPage   from '../pages/auth/ResetPasswordPage'
import InvitationPage      from '../pages/auth/InvitationPage'
import CompleteProfilePage from '../pages/auth/CompleteProfilePage'

// Layouts
import MainLayout   from '../layouts/MainLayout'
import PublicLayout from '../layouts/PublicLayout'

// Pages publiques
import CommitteePage from '../pages/public/CommitteePage'

// Pages admin
import DashboardPage      from '../pages/admin/DashboardPage'
import InvitationsPage    from '../pages/admin/InvitationsPage'
import CandidaturesPage   from '../pages/admin/CandidaturesPage'
import CandidatsAdminPage from '../pages/admin/CandidatsPage'
import ComiteMembresPage  from '../pages/admin/ComiteMembresPage'
import ComitePageEditor   from '../pages/admin/ComitePageEditor'
import PartenairesAdminPage from '../pages/admin/PartenairesPage'
import LogsPage           from '../pages/admin/LogsPage'
import ForumPage          from '../pages/admin/ForumPage'
import ProfilePage        from '../pages/admin/ProfilePage'

// Placeholders
const EspaceCandidat  = () => <div className="p-8 text-xl font-bold">🏆 Mon espace candidat (bientôt)</div>
const CandidatsPublic = () => <div className="p-8 text-xl font-bold">👥 Candidats (bientôt)</div>
const Partenaires     = () => <div className="p-8 text-xl font-bold">🤝 Partenaires (bientôt)</div>
const Communaute      = () => <div className="p-8 text-xl font-bold">💬 Communauté (bientôt)</div>

// ──────────────────────────────────────────────
// Composant : route protégée par rôle
// ──────────────────────────────────────────────
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    // Rediriger vers le bon espace selon le rôle
    if (user.role === 'candidat')    return <Navigate to="/espace-candidat" replace />
    if (user.role === 'comite')      return <Navigate to="/dashboard" replace />
    if (user.role === 'super_admin') return <Navigate to="/dashboard" replace />
    return <Navigate to="/login" replace />
  }
  return children
}

// ──────────────────────────────────────────────
// Composant : route réservée aux non-connectés
// Redirige vers le bon dashboard si déjà connecté
// ──────────────────────────────────────────────
function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user)   return children

  // Déjà connecté → rediriger vers le bon espace
  if (user.role === 'candidat') {
    if (!user.is_profile_complete) return <Navigate to="/complete-profile" replace />
    return <Navigate to="/espace-candidat" replace />
  }
  // super_admin ou comite
  return <Navigate to="/dashboard" replace />
}

// ──────────────────────────────────────────────
// Router principal
// ──────────────────────────────────────────────
export default function AppRouter() {
  const { loading } = useAuth()
  if (loading) return <LoadingSpinner />

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Racine : toujours publique ── */}
        <Route path="/" element={<Navigate to="/comite" replace />} />

        {/* ────────────────────────────────
            AUTH — réservé aux non-connectés
            (GuestRoute redirige si déjà loggé)
        ──────────────────────────────── */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Ces pages sont toujours accessibles (token dans URL) */}
        <Route path="/forgot-password"       element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/invitation/:token"     element={<InvitationPage />} />

        {/* Complétion de profil — candidat connecté uniquement */}
        <Route path="/complete-profile" element={
          <PrivateRoute roles={['candidat']}>
            <CompleteProfilePage />
          </PrivateRoute>
        } />

        {/* ────────────────────────────────
            PAGES PUBLIQUES
            (accessibles sans connexion)
        ──────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/comite"      element={<CommitteePage />} />
          <Route path="/candidats"   element={<CandidatsPublic />} />
          <Route path="/partenaires" element={<Partenaires />} />
          <Route path="/communaute"  element={<Communaute />} />
        </Route>

        {/* ────────────────────────────────
            ESPACE ADMIN (super_admin + comite)
        ──────────────────────────────── */}
        <Route element={
          <PrivateRoute roles={['super_admin', 'comite']}>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route path="/dashboard"                element={<DashboardPage />} />
          <Route path="/dashboard/invitations"    element={<InvitationsPage />} />
          <Route path="/dashboard/candidatures"   element={<CandidaturesPage />} />
          <Route path="/dashboard/candidats"      element={<CandidatsAdminPage />} />
          <Route path="/dashboard/comite"         element={<ComiteMembresPage />} />
          <Route path="/dashboard/partenaires"    element={<PartenairesAdminPage />} />
          <Route path="/dashboard/forum"          element={<ForumPage />} />
          <Route path="/profil"                   element={<ProfilePage />} />

          {/* super_admin uniquement */}
          <Route path="/dashboard/comite/page" element={
            <PrivateRoute roles={['super_admin']}>
              <ComitePageEditor />
            </PrivateRoute>
          } />
          <Route path="/dashboard/logs" element={
            <PrivateRoute roles={['super_admin']}>
              <LogsPage />
            </PrivateRoute>
          } />
        </Route>

        {/* ────────────────────────────────
            ESPACE CANDIDAT
        ──────────────────────────────── */}
        <Route element={
          <PrivateRoute roles={['candidat']}>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route path="/espace-candidat" element={<EspaceCandidat />} />
          <Route path="/profil"          element={<ProfilePage />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}