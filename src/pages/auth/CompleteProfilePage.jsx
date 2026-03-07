import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { 
  User, Phone, FileText, Camera, CheckCircle, 
  Sparkles, AlertCircle, ArrowRight, Upload,
  X, Save
} from 'lucide-react'

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    bio: '',
    phone: '',
  })
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: null })
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validation du type de fichier
      if (!file.type.match('image.*')) {
        setErrors({ photo: ['Veuillez sélectionner une image valide (jpg, jpeg, png)'] })
        return
      }
      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ photo: ['L\'image ne doit pas dépasser 5 Mo'] })
        return
      }
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
      setErrors({ ...errors, photo: null })
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setPreview(null)
    if (preview) URL.revokeObjectURL(preview)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('bio', form.bio)
    if (form.phone) formData.append('phone', form.phone)
    if (photo) formData.append('photo', photo)

    try {
      await api.post('/profile/complete', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
     const currentUser = await api.get('/me')
      const role = currentUser.data.user.role
      if (role === 'super_admin' || role === 'comite') {
        navigate('/dashboard')
      } else {
        navigate('/espace-candidat')
      }
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ general: 'Une erreur est survenue.' })
      }
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

      <div className="w-full max-w-2xl relative z-10">
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
            Compléter votre profil candidat
          </p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
          
          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500">Progression</span>
              <span className="text-xs font-semibold text-[#2A2AE0]">Étape 2/3</span>
            </div>
            <div className="flex gap-1 h-2">
              <div className="flex-1 bg-green-500 rounded-l-full" />
              <div className="flex-1 bg-[#2A2AE0] rounded-none" />
              <div className="flex-1 bg-gray-200 rounded-r-full" />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-green-600 font-medium">Candidature ✓</span>
              <span className="text-[10px] text-[#2A2AE0] font-medium">Profil (en cours)</span>
              <span className="text-[10px] text-gray-400">Espace candidat</span>
            </div>
          </div>

          {/* En-tête */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#2A2AE0]/10 rounded-xl flex items-center justify-center">
                <User size={20} className="text-[#2A2AE0]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Bienvenue sur UNEXE ! 🎉
                </h2>
                <p className="text-gray-500 text-sm">
                  Complétez votre profil pour apparaître sur la page publique des candidats.
                </p>
              </div>
            </div>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section Photo */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Photo de profil <span className="text-red-500">*</span>
              </label>
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Preview */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-[#2A2AE0] to-[#1A1AB0] border-4 border-white shadow-lg">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Camera size={32} className="text-white/70" />
                      </div>
                    )}
                  </div>
                  {preview && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition shadow-lg"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Upload button */}
                <div className="flex-1">
                  <div className="flex flex-col items-center sm:items-start gap-3">
                    <label className="cursor-pointer group">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-[#2A2AE0] transition group-hover:bg-gray-50">
                        <Upload size={16} className="text-gray-400 group-hover:text-[#2A2AE0]" />
                        <span className="text-sm text-gray-600 group-hover:text-[#2A2AE0]">
                          {photo ? 'Changer la photo' : 'Choisir une photo'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/jpg,image/jpeg,image/png"
                        onChange={handlePhoto}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-400">
                      JPG, JPEG ou PNG. Max 5 Mo.
                    </p>
                  </div>
                </div>
              </div>
              {errors.photo && (
                <p className="text-red-500 text-xs mt-3">{errors.photo[0]}</p>
              )}
            </div>

            {/* Nom complet */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet <span className="text-red-500">*</span>
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

            {/* Biographie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biographie <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Parlez de vous en quelques mots... (min. 50 caractères)"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white resize-none
                    ${errors.bio ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                />
              </div>
              <div className="flex justify-between mt-2">
                {errors.bio ? (
                  <p className="text-red-500 text-xs">{errors.bio[0]}</p>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2A2AE0] transition-all"
                      style={{ width: `${Math.min((form.bio.length / 50) * 100, 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs ${form.bio.length < 50 ? 'text-gray-400' : 'text-green-600'}`}>
                    {form.bio.length}/500
                  </span>
                </div>
              </div>
              {form.bio.length < 50 && form.bio.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Encore {50 - form.bio.length} caractères minimum requis
                </p>
              )}
            </div>

            {/* Téléphone 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
                <span className="text-gray-400 text-xs ml-2">(optionnel)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+229 XX XX XX XX"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white"
                />
              </div>
            </div>
*/}
            {/* Bouton de validation */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2A2AE0] hover:bg-[#1A1AB0] disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center gap-2 group mt-6"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enregistrement en cours...
                </>
              ) : (
                <>
                  Finaliser mon profil
                  <Save size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Note d'information */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              Les informations de votre profil seront visibles sur la page publique des candidats UNEXE.
              Assurez-vous qu'elles soient appropriées et professionnelles.
            </p>
          </div>

          {/* Badge de sécurité */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Sparkles size={12} />
            <span>Vos informations sont protégées · Confidentialité garantie</span>
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