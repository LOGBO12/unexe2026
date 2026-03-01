import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

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
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
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
      navigate('/espace-candidat')
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🎓 UNEXE</h1>
          <p className="text-gray-500 mt-1 text-sm">Compléter votre profil</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Étapes */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">✓</div>
              <span className="text-xs text-gray-500">Candidature validée</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">2</div>
              <span className="text-xs font-medium text-gray-800">Profil</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-400 text-xs flex items-center justify-center font-bold">3</div>
              <span className="text-xs text-gray-400">Espace candidat</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            Bienvenue sur UNEXE ! 🎉
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Complétez votre profil pour apparaître sur la page publique des candidats.
          </p>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Photo */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo de profil <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/jpg,image/jpeg,image/png"
                  onChange={handlePhoto}
                  required
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition"
                />
                {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo[0]}</p>}
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition
                  ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biographie <span className="text-red-500">*</span>
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Parlez de vous en quelques mots... (min. 50 caractères)"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none
                  ${errors.bio ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              <div className="flex justify-between mt-1">
                {errors.bio
                  ? <p className="text-red-500 text-xs">{errors.bio[0]}</p>
                  : <span />
                }
                <span className={`text-xs ${form.bio.length < 50 ? 'text-gray-400' : 'text-green-600'}`}>
                  {form.bio.length}/500
                </span>
              </div>
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
                <span className="text-gray-400 font-normal"> (optionnel)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+229 XX XX XX XX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm transition"
            >
              {loading ? 'Enregistrement...' : 'Finaliser mon profil →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}