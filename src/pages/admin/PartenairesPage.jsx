import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Plus, Trash2, Pencil, RefreshCw, Handshake, ExternalLink } from 'lucide-react'

const EMPTY_FORM = {
  name: '', contribution: '', website: '', display_order: 0
}

export default function PartenairesPage() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(null)
  const [error, setError]       = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [logo, setLogo]         = useState(null)
  const [preview, setPreview]   = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/partners')
      .then(res => setPartners(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setLogo(null)
    setPreview(null)
    setError(null)
    setShowForm(true)
  }

  const openEdit = (p) => {
    setEditing(p.id)
    setForm({
      name: p.name || '',
      contribution: p.contribution || '',
      website: p.website || '',
      display_order: p.display_order || 0,
    })
    setPreview(p.logo_url || null)
    setLogo(null)
    setError(null)
    setShowForm(true)
  }

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogo(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const fd = new FormData()
    fd.append('name', form.name)
    if (form.contribution) fd.append('contribution', form.contribution)
    if (form.website)      fd.append('website', form.website)
    fd.append('display_order', form.display_order)
    if (logo) fd.append('logo', logo)

    try {
      if (editing) {
        fd.append('_method', 'PUT')
        await api.post(`/partners/${editing}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSuccess('Partenaire mis à jour.')
      } else {
        await api.post('/partners', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        setSuccess('Partenaire ajouté.')
      }
      setShowForm(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      setLogo(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce partenaire ?')) return
    try {
      await api.delete(`/partners/${id}`)
      setSuccess('Partenaire supprimé.')
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur')
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partenaires</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gérer les partenaires visibles sur le site public
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
          >
            <Plus size={16} />
            Ajouter un partenaire
          </button>
        </div>
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

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editing ? '✏️ Modifier le partenaire' : '➕ Nouveau partenaire'}
          </h2>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du partenaire <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Ex: Université d'Abomey-Calavi"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            {/* Site web */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site web
              </label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            {/* Contribution */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contribution / Description
              </label>
              <textarea
                value={form.contribution}
                onChange={e => setForm({ ...form, contribution: e.target.value })}
                rows={3}
                placeholder="Décrivez l'apport de ce partenaire..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>
              <div className="flex items-center gap-3">
                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-gray-50 p-1"
                  />
                )}
                <input
                  type="file"
                  accept="image/jpg,image/jpeg,image/png,image/svg+xml"
                  onChange={handleLogo}
                  className="flex-1 text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition"
                />
              </div>
            </div>

            {/* Ordre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordre d'affichage
              </label>
              <input
                type="number"
                value={form.display_order}
                onChange={e => setForm({ ...form, display_order: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            {/* Boutons */}
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
              >
                {saving ? 'Sauvegarde...' : editing ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null) }}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste partenaires */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : partners.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
          <Handshake size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun partenaire enregistré</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {partners.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition flex flex-col gap-3"
            >
              {/* Logo + Nom */}
              <div className="flex items-center gap-3">
                {p.logo_url ? (
                  <img
                    src={p.logo_url}
                    alt={p.name}
                    className="w-14 h-14 object-contain rounded-xl border border-gray-100 bg-gray-50 p-1"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Handshake size={22} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                  {p.website && (
                    <a
                      href={p.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <ExternalLink size={11} />
                      {p.website.replace(/^https?:\/\//, '').split('/')[0]}
                    </a>
                  )}
                </div>
              </div>

              {/* Contribution */}
              {p.contribution && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {p.contribution}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <span className="text-xs text-gray-400">Ordre : {p.display_order}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(p)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Modifier"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}