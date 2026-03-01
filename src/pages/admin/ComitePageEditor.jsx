import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Save, Plus, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ComitePageEditor() {
  const navigate  = useNavigate()
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(null)
  const [error, setError]       = useState(null)
  const [teamPhoto, setTeamPhoto]   = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const [form, setForm] = useState({
    project_description: '',
    vision: '',
    objectives: [''],
  })

  useEffect(() => {
    api.get('/committee/page')
      .then(res => {
        const page = res.data
        if (page) {
          setForm({
            project_description: page.project_description || '',
            vision:              page.vision || '',
            objectives:          page.objectives?.length ? page.objectives : [''],
          })
          if (page.team_photo_url) setPhotoPreview(page.team_photo_url)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleObjectiveChange = (i, val) => {
    const objs = [...form.objectives]
    objs[i] = val
    setForm({ ...form, objectives: objs })
  }

  const addObjective = () =>
    setForm({ ...form, objectives: [...form.objectives, ''] })

  const removeObjective = (i) =>
    setForm({ ...form, objectives: form.objectives.filter((_, idx) => idx !== i) })

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (file) {
      setTeamPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const fd = new FormData()
    fd.append('project_description', form.project_description)
    fd.append('vision', form.vision)
    form.objectives
      .filter(o => o.trim())
      .forEach((o, i) => fd.append(`objectives[${i}]`, o))
    if (teamPhoto) fd.append('team_photo', teamPhoto)
    // Laravel PUT via POST + _method
    fd.append('_method', 'PUT')

    try {
      await api.post('/committee/page', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setSuccess('Page du comité mise à jour avec succès !')
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page publique du Comité</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Modifier le contenu visible sur la page /comite
          </p>
        </div>
        <button
          onClick={() => navigate('/comite')}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
        >
          <Eye size={15} />
          Voir la page
        </button>
      </div>

      {/* Alertes */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Description du projet */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            📋 Description du projet
          </h2>
          <textarea
            value={form.project_description}
            onChange={e => setForm({ ...form, project_description: e.target.value })}
            rows={5}
            placeholder="Présentez le projet UNEXE en quelques paragraphes..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition leading-relaxed"
          />
        </div>

        {/* Vision */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            🎯 Vision
          </h2>
          <textarea
            value={form.vision}
            onChange={e => setForm({ ...form, vision: e.target.value })}
            rows={4}
            placeholder="La vision du comité UNEXE..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition leading-relaxed"
          />
        </div>

        {/* Objectifs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">🏆 Objectifs</h2>
            <button
              type="button"
              onClick={addObjective}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              <Plus size={13} />
              Ajouter
            </button>
          </div>
          <div className="space-y-3">
            {form.objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <input
                  type="text"
                  value={obj}
                  onChange={e => handleObjectiveChange(i, e.target.value)}
                  placeholder={`Objectif ${i + 1}...`}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                />
                {form.objectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(i)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Photo d'ensemble */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">📸 Photo d'ensemble du comité</h2>
          {photoPreview && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <img
                src={photoPreview}
                alt="Photo comité"
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/jpg,image/jpeg,image/png"
            onChange={handlePhoto}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition"
          />
          <p className="text-xs text-gray-400">
            Formats acceptés : JPG, PNG. Taille max : 5 Mo.
          </p>
        </div>

        {/* Bouton save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl transition"
          >
            <Save size={16} />
            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  )
}