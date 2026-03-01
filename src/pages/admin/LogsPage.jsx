import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { ScrollText, RefreshCw, Filter } from 'lucide-react'

const ACTION_LABELS = {
  validate_candidate:    { label: 'Candidature validée',    color: 'bg-green-100 text-green-700' },
  reject_candidate:      { label: 'Candidature rejetée',    color: 'bg-red-100 text-red-700' },
  invite_comite:         { label: 'Invitation comité',      color: 'bg-blue-100 text-blue-700' },
  invite_candidat:       { label: 'Invitation candidat',    color: 'bg-yellow-100 text-yellow-700' },
  update_committee_page: { label: 'Page comité modifiée',   color: 'bg-purple-100 text-purple-700' },
  publish_announcement:  { label: 'Annonce publiée',        color: 'bg-indigo-100 text-indigo-700' },
  complete_profile:      { label: 'Profil complété',        color: 'bg-teal-100 text-teal-700' },
  add_committee_member:  { label: 'Membre ajouté',          color: 'bg-blue-100 text-blue-700' },
  remove_committee_member:{ label: 'Membre retiré',         color: 'bg-red-100 text-red-700' },
}

export default function LogsPage() {
  const [logs, setLogs]       = useState([])
  const [meta, setMeta]       = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(1)
  const [filters, setFilters] = useState({ action: '', user_id: '', from: '', to: '' })

  const load = (p = 1, f = filters) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p })
    if (f.action)  params.append('action', f.action)
    if (f.user_id) params.append('user_id', f.user_id)
    if (f.from)    params.append('from', f.from)
    if (f.to)      params.append('to', f.to)

    api.get(`/logs?${params}`)
      .then(res => {
        setLogs(res.data.data || [])
        setMeta(res.data.meta || {})
        setPage(p)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs d'actions</h1>
          <p className="text-gray-500 text-sm mt-0.5">Traçabilité complète des actions admin</p>
        </div>
        <button onClick={() => load()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filtres</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={filters.action}
            onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Toutes les actions</option>
            {Object.entries(ACTION_LABELS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.from}
            onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Du"
          />
          <input
            type="date"
            value={filters.to}
            onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Au"
          />
          <button
            onClick={() => load(1, filters)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
          >
            Filtrer
          </button>
        </div>
      </div>

      {/* Table des logs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ScrollText size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun log trouvé</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-5 py-3 text-left">Action</th>
                    <th className="px-4 py-3 text-left">Par</th>
                    <th className="px-4 py-3 text-left">Détails</th>
                    <th className="px-4 py-3 text-left">IP</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(log => {
                    const info = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-600' }
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${info.color}`}>
                            {info.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">{log.user?.name}</p>
                          <p className="text-xs text-gray-400">{log.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-48">
                          {log.details && Object.keys(log.details).length > 0
                            ? Object.entries(log.details).map(([k, v]) => (
                                <span key={k} className="block truncate">
                                  <strong>{k}</strong>: {String(v)}
                                </span>
                              ))
                            : '—'
                          }
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ip_address}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Page {meta.current_page} / {meta.last_page}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => load(page - 1)}
                    className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    ← Précédent
                  </button>
                  <button
                    disabled={page >= meta.last_page}
                    onClick={() => load(page + 1)}
                    className="px-3 py-1.5 border border-gray-300 text-sm rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}