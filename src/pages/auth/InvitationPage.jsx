import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { 
  Mail, Lock, Eye, EyeOff, CheckCircle, 
  Sparkles, AlertCircle, UserCheck, Shield,
  ArrowLeft, Send
} from 'lucide-react'

export default function InvitationPage() {
  const { token }  = useParams()
  const navigate   = useNavigate()
  const { login }  = useAuth()   // ← auto-login après activation

  const [invitation, setInvitation] = useState(null)
  const [checking, setChecking]     = useState(true)
  const [tokenError, setTokenError] = useState(null)
  const [activating, setActivating] = useState(false) // animation redirection

  const [form, setForm] = useState({ 
    password: '', 
    password_confirmation: '' 
  })
  const [errors, setErrors]             = useState({})
  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Vérifier le token au chargement
  useEffect(() => {
    api.get(`/invitation/${token}`)
      .then(res => setInvitation(res.data))
      .catch(err => {
        const status = err.response?.status
        setTokenError(
          status === 410 ? 'Cette invitation a expiré ou a déjà été utilisée.'
          : status === 404 ? 'Invitation introuvable.'
          : 'Une erreur est survenue lors de la vérification.'
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

    if (form.password.length < 8) {
      setErrors({ password: ['Le mot de passe doit contenir au moins 8 caractères.'] })
      setLoading(false)
      return
    }

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Les mots de passe ne correspondent pas.'] })
      setLoading(false)
      return
    }

    try {
      // 1. Activer le compte
      await api.post(`/invitation/${token}/activate`, {
        password: form.password,
        password_confirmation: form.password_confirmation,
      })

      // 2. Connexion automatique avec l'email de l'invitation
      setActivating(true)
      const user = await login(invitation.email, form.password)

      // 3. Redirection vers le bon espace selon le rôle
      if (user.role === 'candidat') {
        if (!user.is_profile_complete) {
          navigate('/complete-profile', { replace: true })
        } else {
          navigate('/espace-candidat', { replace: true })
        }
      } else {
        // comite ou super_admin → espace administration
        navigate('/dashboard', { replace: true })
      }

    } catch (err) {
      setActivating(false)
      const status = err.response?.status
      if (status === 422) {
        setErrors(err.response.data.errors || {})
      } else if (status === 410) {
        setTokenError('Cette invitation a expiré ou a déjà été utilisée.')
      } else {
        setErrors({ general: err.response?.data?.message || 'Une erreur est survenue.' })
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Chargement ────────────────────────────────────────────────────────────
  if (checking) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#2A2AE0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Vérification de votre invitation...</p>
      </div>
    </div>
  )

  // ── Redirection en cours ──────────────────────────────────────────────────
  if (activating) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Compte activé !</h2>
        <div className="w-10 h-10 border-4 border-[#2A2AE0] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500">Redirection vers votre espace...</p>
      </div>
    </div>
  )

  // ── Token invalide / expiré ───────────────────────────────────────────────
  if (tokenError) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/unexe-logo.jpeg" 
              alt="UNEXE Logo" 
              className="w-16 h-16 object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML += '<div class="w-16 h-16 bg-[#2A2AE0] rounded-xl flex items-center justify-center text-white text-2xl font-black">U</div>';
              }}
            />
          </div>
          <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            UNEXE
          </h1>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Invitation invalide</h2>
          <p className="text-gray-500 text-sm mb-6">{tokenError}</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A2AE0] hover:bg-[#1A1AB0] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            <ArrowLeft size={16} />
            Retour à la connexion
          </button>
        </div>
      </div>
    </div>
  )

  // ── Formulaire principal ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2A2AE0] rounded-full opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E8112D] rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/unexe-logo.jpeg" 
              alt="UNEXE Logo" 
              className="w-16 h-16 object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML += '<div class="w-16 h-16 bg-[#2A2AE0] rounded-xl flex items-center justify-center text-white text-2xl font-black">U</div>';
              }}
            />
          </div>
          <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            UNEXE
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {invitation?.role === 'comite'
              ? 'Rejoindre le Comité UNEXE'
              : 'Activer votre compte candidat'}
          </p>
        </div>

        {/* Carte */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
          
          {/* Badge invitation */}
          <div className="mb-6 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Mail size={18} className="text-[#2A2AE0]" />
              <p className="text-xs text-gray-500">Invitation pour</p>
            </div>
            <p className="font-semibold text-gray-800 pl-7 mb-3">{invitation?.email}</p>
            <div className="pl-7">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                ${invitation?.role === 'comite' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-green-100 text-green-700'}`}
              >
                <UserCheck size={12} />
                {invitation?.role === 'comite' ? 'Membre du Comité' : 'Candidat UNEXE'}
              </span>
            </div>
          </div>

          {/* Destination info */}
          <div className="mb-6 p-4 rounded-xl border" style={{
            background: invitation?.role === 'comite' ? 'rgba(42,42,224,0.04)' : 'rgba(77,200,150,0.04)',
            borderColor: invitation?.role === 'comite' ? 'rgba(42,42,224,0.15)' : 'rgba(77,200,150,0.15)',
          }}>
            <p className="text-xs flex items-center gap-2" style={{
              color: invitation?.role === 'comite' ? '#2A2AE0' : '#059669'
            }}>
              <Shield size={13} />
              {invitation?.role === 'comite'
                ? 'Vous serez redirigé vers l\'espace d\'administration après activation.'
                : 'Vous serez redirigé vers votre espace candidat après activation.'}
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Choisissez votre mot de passe
            </h2>
            <p className="text-gray-500 text-sm">
              Créez un mot de passe sécurisé pour votre compte UNEXE.
            </p>
          </div>

          {/* Erreur générale */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.general}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nouveau mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white
                    ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                </p>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white
                    ${errors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">
                  {Array.isArray(errors.password_confirmation)
                    ? errors.password_confirmation[0]
                    : errors.password_confirmation}
                </p>
              )}
            </div>

            {/* Force du mot de passe */}
            {form.password && (
              <div className="space-y-2">
                <div className="flex gap-1 h-1">
                  <div className={`flex-1 rounded-full transition-all ${
                    form.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                  <div className={`flex-1 rounded-full transition-all ${
                    /[0-9]/.test(form.password) && /[a-zA-Z]/.test(form.password) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                  <div className={`flex-1 rounded-full transition-all ${
                    /[!@#$%^&*]/.test(form.password) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                </div>
                <p className="text-xs text-gray-400">
                  Force: {
                    form.password.length < 8 ? 'Faible' :
                    form.password.length >= 8 && /[0-9]/.test(form.password) && /[a-zA-Z]/.test(form.password) ? 'Moyenne' :
                    'Forte'
                  }
                </p>
              </div>
            )}

            {/* Bouton d'activation */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2A2AE0] hover:bg-[#1A1AB0] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Activation en cours...
                </>
              ) : (
                <>
                  Activer mon compte
                  <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Badge de sécurité */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Sparkles size={12} />
            <span>Activation sécurisée · Chiffrement SSL</span>
          </div>

          {/* Drapeau Bénin mini */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="flex h-4 w-6 rounded overflow-hidden shadow-sm">
              <div className="w-1/3 bg-[#008751]" />
              <div className="flex flex-col w-2/3">
                <div className="flex-1 bg-[#FCD116]" />
                <div className="flex-1 bg-[#E8112D]" />
              </div>
            </div>
            <span className="text-xs text-gray-400">INSTI Lokossa · Bénin</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} UNEXE — University Excellence Elite. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}