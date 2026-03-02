import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { 
  Mail, Lock, Eye, EyeOff, CheckCircle, 
  ChevronRight, Sparkles, Key, AlertCircle,
  ArrowLeft
} from 'lucide-react'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({
    email: searchParams.get('email') || '',
    password: '',
    password_confirmation: '',
    token: searchParams.get('token') || window.location.pathname.split('/').pop(),
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      await api.post('/reset-password', form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ general: err.response?.data?.message || 'Lien invalide ou expiré.' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-6 bg-white rounded-3xl shadow-2xl p-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Mot de passe modifié !</h2>
        <p className="text-gray-500">Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...</p>
        <div className="w-8 h-8 border-4 border-[#2A2AE0] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )

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
            University Excellence Elite · INSTI Lokossa
          </p>
        </div>

        {/* Carte de réinitialisation */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-[#2A2AE0]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Key size={24} className="text-[#2A2AE0]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nouveau mot de passe</h2>
            <p className="text-gray-500 text-sm">
              Créez un mot de passe sécurisé pour votre compte
            </p>
          </div>

          {/* Message d'erreur général */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.general}
              </p>
            </div>
          )}

          {/* Message d'information si token invalide */}
          {!form.token && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-700 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                Lien de réinitialisation invalide ou expiré. Veuillez refaire une demande.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email (pré-rempli depuis l'URL) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white
                    ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
            </div>

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
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Force du mot de passe (indicateur visuel) */}
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

            {/* Token caché */}
            <input type="hidden" name="token" value={form.token} />

            {/* Bouton de réinitialisation */}
            <button
              type="submit"
              disabled={loading || !form.token}
              className="w-full bg-[#2A2AE0] hover:bg-[#1A1AB0] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Modification en cours...
                </>
              ) : (
                <>
                  Modifier le mot de passe
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
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
              <span className="px-4 bg-white text-gray-400">besoin d'aide ?</span>
            </div>
          </div>

          {/* Liens d'aide */}
          <div className="text-center space-y-2">
            <Link
              to="/forgot-password"
              className="text-sm text-[#2A2AE0] hover:underline block"
            >
              Renvoyer le lien de réinitialisation
            </Link>
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-gray-600 inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Retour à la connexion
            </Link>
          </div>

          {/* Badge de sécurité */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Sparkles size={12} />
            <span>Réinitialisation sécurisée · Chiffrement SSL</span>
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