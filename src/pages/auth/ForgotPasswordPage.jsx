import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Mail, Send, Sparkles, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await api.post('/forgot-password', { email })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

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
            <a href="/">
            <img 
              src="/unexe-logo.jpeg" 
              alt="UNEXE Logo" 
              className="w-16 h-16 object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML += '<div class="w-16 h-16 bg-[#2A2AE0] rounded-xl flex items-center justify-center text-white text-2xl font-black">U</div>';
              }}
            />
            </a>
          </div>
          <a href="/">
          <h1 className="text-3xl font-black text-gray-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            UNEXE
          </h1>
          </a>
          <p className="text-gray-500 text-sm mt-2">
            University Excellence Elite · INSTI Lokossa
          </p>
        </div>

        {/* Carte */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
          {success ? (
            /* État de succès */
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Si un compte existe avec l'adresse <span className="font-semibold text-gray-700">{email}</span>, 
                  vous recevrez un lien de réinitialisation dans quelques instants.
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 text-left">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  Pensez à vérifier vos spams si vous ne trouvez pas l'email dans votre boîte de réception.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[#2A2AE0] font-semibold text-sm hover:underline mt-4"
              >
                <ArrowLeft size={14} />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            /* Formulaire */
            <>
              <div className="mb-8 text-center">
                <div className="w-12 h-12 bg-[#2A2AE0]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-[#2A2AE0]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Mot de passe oublié ?
                </h2>
                <p className="text-gray-500 text-sm">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="vous@exemple.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2A2AE0] hover:bg-[#1A1AB0] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      Envoyer le lien
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

              {/* Lien retour */}
              <p className="text-center text-sm text-gray-500">
                <Link
                  to="/login"
                  className="text-[#2A2AE0] font-semibold hover:underline inline-flex items-center gap-1 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}

          {/* Badge de sécurité (visible dans les deux états) */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Sparkles size={12} />
            <span>Réinitialisation sécurisée · SSL 256 bits</span>
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