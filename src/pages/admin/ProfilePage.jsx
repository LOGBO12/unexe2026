import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { Save, KeyRound, UserCircle } from 'lucide-react'

export default function ProfilePage() {
  const { user, login } = useAuth()

  const [form, setForm] = useState({
    name: user?.name || '',
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [avatar, setAvatar]       = useState(null)
  const [preview, setPreview]     = useState(
    user?.avatar ? `/storage/${user.avatar}` : null
  )
  const [saving, setSaving]       = useState(false)
  const [success, setSuccess]     = useState(null)
  const [error, setError]         = useState(null)
  const [errors, setErrors]       = useState({})
  const [activeTab, setActiveTab] = useState('profile') // profile | password

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatar(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    setErrors({})

    const fd = new FormData()
    fd.append('name', form.name)
    if (avatar) fd.append('photo', avatar)

    try {
      await api.post('/profile/update', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Profil mis à jour avec succès !')
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    setErrors({})

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ['Les mots de passe ne correspondent pas.'] })
      setSaving(false)
      return
    }

    try {
      await api.put('/profile/password', {
        current_password:      form.current_password,
        password:              form.password,
        password_confirmation: form.password_confirmation,
      })
      setSuccess('Mot de passe modifié avec succès !')
      setForm(f => ({ ...f, current_password: '', password: '', password_confirmation: '' }))
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la modification.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Gérer vos informations personnelles
        </p>
      </div>

      {/* Carte profil */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Avatar + infos */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow">
              {preview ? (
                <img src={preview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-red-900 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full
              ${user?.role === 'super_admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
            >
              {user?.role === 'super_admin' ? '⚡ Super Admin' : '🛡️ Comité'}
            </span>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex border-b border-gray-100">
          {[
            { key: 'profile',  label: 'Informations', icon: UserCircle },
            { key: 'password', label: 'Mot de passe',  icon: KeyRound },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSuccess(null); setError(null); setErrors({}) }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition
                  ${activeTab === tab.key
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Alertes */}
        <div className="px-6 pt-4">
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm mb-4">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
              ❌ {error}
            </div>
          )}
        </div>

        {/* Tab Profil */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom complet
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition
                  ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo de profil
              </label>
              <input
                type="file"
                accept="image/jpg,image/jpeg,image/png"
                onChange={handleAvatar}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
              >
                <Save size={15} />
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {/* Tab Mot de passe */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={form.current_password}
                onChange={e => setForm({ ...form, current_password: e.target.value })}
                required
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition
                  ${errors.current_password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.current_password && (
                <p className="text-red-500 text-xs mt-1">{errors.current_password[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Minimum 8 caractères"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition
                  ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={form.password_confirmation}
                onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                required
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition
                  ${errors.password_confirmation ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">{errors.password_confirmation[0]}</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
              >
                <KeyRound size={15} />
                {saving ? 'Modification...' : 'Changer le mot de passe'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}