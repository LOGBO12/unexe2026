import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import {
  Search, Filter, Eye, CheckCircle,
  XCircle, Clock, RefreshCw, FileText
} from 'lucide-react'

function StatusBadge({ status }) {
  if (status === 'validated') return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1 w-fit"><CheckCircle size={11} />Validé</span>
  if (status === 'rejected')  return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1 w-fit"><XCircle size={11} />Rejeté</span>
  return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium flex items-center gap-1 w-fit"><Clock size={11} />En attente</span>
}

export default function CandidaturesPage() {
  const [data, setData]           = useState({ applications: { data: [] }, stats: {} })
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [actionModal, setActionModal] = useState(null) // { type: 'validate'|'reject', app }
  const [reviewNote, setReviewNote]   = useState('')
  const [processing, setProcessing]   = useState(false)
  const [filters, setFilters]     = useState({ status: '', search: '' })

  const load = (f = filters) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (f.status) params.append('status', f.status)
    if (f.search) params.append('search', f.search)

    api.get(`/applications?${params}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleValidate = async () => {
    setProcessing(true)
    try {
      await api.post(`/applications/${actionModal.app.id}/validate`, {
        review_note: reviewNote
      })
      setActionModal(null)
      setReviewNote('')
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!reviewNote.trim()) {
      alert('Le motif de rejet est obligatoire.')
      return
    }
    setProcessing(true)
    try {
      await api.post(`/applications/${actionModal.app.id}/reject`, {
        review_note: reviewNote
      })
      setActionModal(null)
      setReviewNote('')
      load()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setProcessing(false)
    }
  }

  const apps = data.applications?.data || []
  const stats = data.stats || {}

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatures</h1>
          <p className="text-gray-500 text-sm mt-0.5">Examiner et traiter les dossiers</p>
        </div>
        <button onClick={() => load()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',      value: stats.total,     color: 'gray' },
          { label: 'En attente', value: stats.pending,   color: 'yellow' },
          { label: 'Validés',    value: stats.validated, color: 'green' },
          { label: 'Rejetés',    value: stats.rejected,  color: 'red' },
        ].map(s => (
          <div
            key={s.label}
            onClick={() => { setFilters(f => ({ ...f, status: s.label === 'Total' ? '' : s.label === 'En attente' ? 'pending' : s.label === 'Validés' ? 'validated' : 'rejected' })); load({ ...filters, status: s.label === 'Total' ? '' : s.label === 'En attente' ? 'pending' : s.label === 'Validés' ? 'validated' : 'rejected' }) }}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:shadow-md transition"
          >
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && load({ ...filters })}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
        </div>
        <select
          value={filters.status}
          onChange={e => { const s = e.target.value; setFilters(f => ({ ...f, status: s })); load({ ...filters, status: s }) }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
        >
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="validated">Validés</option>
          <option value="rejected">Rejetés</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun dossier trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Candidat</th>
                  <th className="px-4 py-3 text-left">Département</th>
                  <th className="px-4 py-3 text-left">Filière / Année</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Soumis le</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apps.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{app.user?.name}</p>
                      <p className="text-xs text-gray-400">{app.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{app.department?.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {app.filiere} · {app.year}ère/ème
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(app.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelected(app)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Voir le dossier"
                        >
                          <Eye size={15} />
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => { setActionModal({ type: 'validate', app }); setReviewNote('') }}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Valider"
                            >
                              <CheckCircle size={15} />
                            </button>
                            <button
                              onClick={() => { setActionModal({ type: 'reject', app }); setReviewNote('') }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Rejeter"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal détail dossier */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-800">Dossier de candidature</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Nom</span><p className="font-medium">{selected.user?.name}</p></div>
                <div><span className="text-gray-500">Email</span><p className="font-medium">{selected.user?.email}</p></div>
                <div><span className="text-gray-500">Département</span><p className="font-medium">{selected.department?.name}</p></div>
                <div><span className="text-gray-500">Filière</span><p className="font-medium">{selected.filiere}</p></div>
                <div><span className="text-gray-500">Année</span><p className="font-medium">{selected.year}ère/ème année</p></div>
                <div><span className="text-gray-500">Matricule</span><p className="font-medium">{selected.matricule || '—'}</p></div>
                <div><span className="text-gray-500">Téléphone</span><p className="font-medium">{selected.phone || '—'}</p></div>
                <div><span className="text-gray-500">Statut</span><StatusBadge status={selected.status} /></div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Lettre de motivation</span>
                <p className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed">
                  {selected.motivation_letter}
                </p>
              </div>
              {selected.review_note && (
                <div>
                  <span className="text-gray-500 text-sm">Note du comité</span>
                  <p className="mt-1 text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                    {selected.review_note}
                  </p>
                </div>
              )}
              {selected.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setActionModal({ type: 'validate', app: selected }); setSelected(null); setReviewNote('') }}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
                  >
                    ✓ Valider
                  </button>
                  <button
                    onClick={() => { setActionModal({ type: 'reject', app: selected }); setSelected(null); setReviewNote('') }}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
                  >
                    ✕ Rejeter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal validation / rejet */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {actionModal.type === 'validate' ? '✅ Valider la candidature' : '❌ Rejeter la candidature'}
            </h3>
            <p className="text-sm text-gray-600">
              Candidat : <strong>{actionModal.app.user?.name}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {actionModal.type === 'reject' ? 'Motif du rejet *' : 'Note (optionnelle)'}
              </label>
              <textarea
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                rows={3}
                placeholder={actionModal.type === 'reject' ? 'Expliquer le motif du rejet...' : 'Ajouter une note...'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={actionModal.type === 'validate' ? handleValidate : handleReject}
                disabled={processing}
                className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50
                  ${actionModal.type === 'validate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {processing ? 'Traitement...' : actionModal.type === 'validate' ? 'Confirmer la validation' : 'Confirmer le rejet'}
              </button>
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}