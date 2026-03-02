import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { 
  User, Mail, Lock, Eye, EyeOff, CheckCircle, 
  ChevronRight, Sparkles
} from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!acceptedTerms) {
      setErrors({ terms: 'Vous devez accepter les conditions d\'utilisation' })
      return
    }
    
    setLoading(true)
    setErrors({})

    try {
      await api.post('/register', form)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ general: err.response?.data?.message || 'Une erreur est survenue.' })
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
        <h2 className="text-2xl font-bold text-gray-900">Compte créé avec succès !</h2>
        <p className="text-gray-500">Félicitations ! Votre compte a été créé. Vous allez être redirigé vers la page de connexion dans quelques instants...</p>
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

        {/* Carte d'inscription */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription</h2>
            <p className="text-gray-500 text-sm">
              Créez votre compte en quelques secondes
            </p>
          </div>

          {/* Message d'erreur général */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                {errors.general}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Jean Dupont"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white
                    ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
            </div>

            {/* Email */}
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
                  placeholder="vous@exemple.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white
                    ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
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

            {/* Confirmation mot de passe */}
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

            {/* Conditions d'utilisation */}
            <div className="flex items-start gap-3 mt-4">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#2A2AE0] focus:ring-[#2A2AE0]"
              />
              <label htmlFor="terms" className="text-xs text-gray-500">
                J'accepte les{' '}
                <a href="#" className="text-[#2A2AE0] hover:underline">
                  conditions d'utilisation
                </a>{' '}
                et la{' '}
                <a href="#" className="text-[#2A2AE0] hover:underline">
                  politique de confidentialité
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
            )}

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2A2AE0] hover:bg-[#1A1AB0] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  Créer mon compte
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
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>

          {/* Badge de sécurité */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Sparkles size={12} />
            <span>Inscription sécurisée · Vos données sont protégées</span>
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