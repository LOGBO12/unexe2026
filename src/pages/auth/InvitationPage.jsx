import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { 
  Mail, Lock, Eye, EyeOff, CheckCircle, 
  Sparkles, AlertCircle, UserCheck, Shield,
  ArrowLeft, Send
} from 'lucide-react'

export default function InvitationPage() {
  const { token } = useParams()

  const [invitation, setInvitation] = useState(null)
  const [checking, setChecking]     = useState(true)
  const [tokenError, setTokenError] = useState(null)
  const [success, setSuccess]       = useState(false)

  const [form, setForm] = useState({ 
    password: '', 
    password_confirmation: '' 
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
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

    // Validation côté client
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
      await api.post(`/invitation/${token}/activate`, {
        password: form.password,
        password_confirmation: form.password_confirmation,
      })
      setSuccess(true)
    } catch (err) {
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

  // Chargement
  if (checking) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#2A2AE0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Vérification de votre invitation...</p>
      </div>
    </div>
  )

  // Token invalide / expiré
  if (tokenError) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
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
        </div>

        {/* Carte d'erreur */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Invitation invalide</h2>
          <p className="text-gray-500 text-sm mb-6">{tokenError}</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2A2AE0] hover:bg-[#1A1AB0] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
          >
            <ArrowLeft size={16} />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )

  // Succès : compte activé
  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
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
        </div>

        {/* Carte de succès */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-500" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte activé !</h2>
              <p className="text-gray-500 text-sm">
                {invitation?.role === 'comite'
                  ? 'Bienvenue dans l\'équipe UNEXE ! Connectez-vous pour accéder à votre espace administrateur.'
                  : 'Bienvenue sur UNEXE ! Connectez-vous puis complétez votre profil candidat.'
                }
              </p>
            </div>

            {/* Carte des identifiants */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 text-left space-y-3">
              <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
                <Mail size={16} className="text-[#2A2AE0]" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </div>
              <p className="text-sm text-gray-600 pl-7">{invitation?.email}</p>
              
              <div className="flex items-center gap-3 pt-2">
                <Shield size={16} className="text-[#2A2AE0]" />
                <span className="text-sm font-medium text-gray-700">Rôle</span>
              </div>
              <p className="pl-7">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                  ${invitation?.role === 'comite' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'}`}
                >
                  <UserCheck size={12} />
                  {invitation?.role === 'comite' ? 'Membre du Comité' : 'Candidat UNEXE'}
                </span>
              </p>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#2A2AE0] hover:bg-[#1A1AB0] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
            >
              Se connecter maintenant
              <Send size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  // Formulaire
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#2A2AE0] rounded-full opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#E8112D] rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo centré */}
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

        {/* Carte d'invitation */}
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

          {/* Séparateur */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-gray-400">ou</span>
            </div>
          </div>

          {/* Lien connexion */}
          <p className="text-center text-sm text-gray-500">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="text-[#2A2AE0] font-semibold hover:underline inline-flex items-center gap-1 group"
            >
              Se connecter
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </p>

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