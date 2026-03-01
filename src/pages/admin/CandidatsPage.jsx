import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Search, Users, RefreshCw } from 'lucide-react'

export default function CandidatsPage() {
  const [data, setData]       = useState({ candidates: {}, departments: [] })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '', department_id: '', year: ''
  })

  const load = (f = filters) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (f.search)        params.append('search', f.search)
    if (f.department_id) params.append('department_id', f.department_id)
    if (f.year)          params.append('year', f.year)

    api.get(`/public/candidates?${params}`)
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const allCandidates = Object.values(data.candidates || {}).flat()

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidats validés</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {allCandidates.length} candidat{allCandidates.length > 1 ? 's' : ''} avec profil complété
          </p>
        </div>
        <button onClick={() => load()}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
          <RefreshCw size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && load({ ...filters })}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          />
        </div>
        <select
          value={filters.department_id}
          onChange={e => { const v = e.target.value; setFilters(f => ({ ...f, department_id: v })); load({ ...filters, department_id: v }) }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Tous les départements</option>
          {data.departments?.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <select
          value={filters.year}
          onChange={e => { const v = e.target.value; setFilters(f => ({ ...f, year: v })); load({ ...filters, year: v }) }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Toutes les années</option>
          <option value="1">1ère année</option>
          <option value="2">2ème année</option>
        </select>
        <button
          onClick={() => load(filters)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
        >
          Rechercher
        </button>
      </div>

      {/* Contenu */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : allCandidates.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun candidat trouvé</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(data.candidates || {}).map(([dept, candidates]) => (
            <div key={dept}>
              {/* Titre département */}
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-800">{dept}</h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                  {candidates.length} candidat{candidates.length > 1 ? 's' : ''}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Grouper par année */}
              {['1', '2'].map(year => {
                const group = candidates.filter(c => String(c.year) === year)
                if (group.length === 0) return null
                return (
                  <div key={year} className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {year === '1' ? '1ère' : '2ème'} Année
                    </h3>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {group.map(c => (
                        <div key={c.id}
                          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition group">
                          {/* Photo */}
                          <div className="h-36 bg-gray-100 overflow-hidden">
                            {c.photo_url ? (
                              <img
                                src={c.photo_url}
                                alt={c.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-red-900">
                                <span className="text-3xl font-bold text-white">
                                  {c.name?.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Infos */}
                          <div className="p-3">
                            <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                            <p className="text-xs text-red-600 font-medium truncate">{c.filiere}</p>
                            {c.bio && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{c.bio}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}