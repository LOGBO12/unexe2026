import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'

export default function InvitationPage() {
  const { token } = useParams()
  const navigate  = useNavigate()

  const [invitation, setInvitation] = useState(null)
  const [checking, setChecking]     = useState(true)
  const [tokenError, setTokenError] = useState(null)
  const [success, setSuccess]       = useState(false)

  const [form, setForm]   = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // Vérifier le token au chargement
  useEffect(() => {
    api.get(`/invitation/${token}`)
      .then(res => setInvitation(res.data))
      .catch(err => {
        setTokenError(
          err.response?.status === 410
            ? 'Cette invitation a expiré ou a déjà été utilisée.'
            : 'Invitation introuvable.'
        )
      })
      .finally(() => setChecking(false))
  }, [token])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Vérification côté client
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Les mots de passe ne correspondent pas.'] })
      setLoading(false)
      return
    }

    if (form.password.length < 8) {
      setErrors({ password: ['Le mot de passe doit contenir au moins 8 caractères.'] })
      setLoading(false)
      return
    }

    try {
      // Réinitialiser le mot de passe via le token
      await api.post('/reset-password', {
        token,
        email:                 invitation.email,
        password:              form.password,
        password_confirmation: form.password_confirmation,
      })

      // ✅ Succès → afficher message puis rediriger vers /login
      setSuccess(true)

    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({
          general: 'Une erreur est survenue. Le lien est peut-être expiré.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Chargement ──
  if (checking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // ── Token invalide ──
  if (tokenError) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-4">
        <div className="text-6xl">❌</div>
        <h2 className="text-2xl font-bold text-gray-900">Invitation invalide</h2>
        <p className="text-gray-500">{tokenError}</p>
        <Link
          to="/login"
          className="inline-block mt-4 px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
        >
          Aller à la connexion
        </Link>
      </div>
    </div>
  )

  // ── Succès → rediriger vers login ──
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎓 UNEXE</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Compte activé avec succès !
          </h2>
          <p className="text-gray-500">
            {invitation?.role === 'comite'
              ? 'Bienvenue dans l\'équipe UNEXE ! Connectez-vous pour accéder à votre espace.'
              : 'Bienvenue sur UNEXE ! Connectez-vous pour compléter votre profil candidat.'
            }
          </p>

          {/* Info compte */}
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 border border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Email :</span>{' '}
              {invitation?.email}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Rôle :</span>{' '}
              {invitation?.role === 'comite' ? '🛡️ Membre du Comité' : '🏆 Candidat UNEXE'}
            </p>
          </div>

          <Link
            to="/login"
            className="inline-block w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition text-sm"
          >
            Se connecter maintenant →
          </Link>
        </div>
      </div>
    </div>
  )

  // ── Formulaire principal ──
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎓 UNEXE</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {invitation?.role === 'comite'
              ? 'Rejoindre le Comité UNEXE'
              : 'Activer votre compte candidat'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Badge invitation */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Invitation pour</p>
            <p className="font-semibold text-gray-800">{invitation?.email}</p>
            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full
              ${invitation?.role === 'comite'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-green-100 text-green-700'}`}
            >
              {invitation?.role === 'comite'
                ? '🛡️ Membre du Comité'
                : '🏆 Candidat UNEXE'}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Choisissez votre mot de passe
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Définissez un mot de passe sécurisé pour accéder à votre espace.
          </p>

          {/* Erreur générale */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              ❌ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Minimum 8 caractères"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition
                  ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition
                  ${errors.password_confirmation ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">
                  {Array.isArray(errors.password_confirmation)
                    ? errors.password_confirmation[0]
                    : errors.password_confirmation}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Activation...' : 'Activer mon compte →'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-red-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}