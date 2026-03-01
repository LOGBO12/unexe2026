import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function CommitteePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/committee')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { page, members } = data || {}

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">

      {/* ── HERO ── */}
      <section className="text-center space-y-4">
        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full uppercase tracking-wider">
          Espace Comité
        </span>
        <h1 className="text-4xl font-bold text-gray-900">
          University Excellence Elite
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          INSTI Lokossa — République du Bénin
        </p>
        {/* Drapeau */}
        <div className="flex justify-center">
          <div className="flex h-3 w-20 rounded overflow-hidden shadow">
            <div className="w-1/3 bg-[#008751]" />
            <div className="flex flex-col w-2/3">
              <div className="flex-1 bg-[#FCD116]" />
              <div className="flex-1 bg-[#E8112D]" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PRÉSENTATION DU PROJET ── */}
      {page?.project_description && (
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Le Projet</h2>
            <p className="text-gray-600 leading-relaxed">{page.project_description}</p>
          </div>
          {page.team_photo_url && (
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={page.team_photo_url}
                alt="Photo du comité"
                className="w-full h-64 object-cover"
              />
            </div>
          )}
        </section>
      )}

      {/* ── VISION ── */}
      {page?.vision && (
        <section className="bg-[#1a1a2e] text-white rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-4">Notre Vision</h2>
          <p className="text-white/80 leading-relaxed text-lg">{page.vision}</p>
        </section>
      )}

      {/* ── OBJECTIFS ── */}
      {page?.objectives?.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Nos Objectifs</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {page.objectives.map((obj, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm mb-3">
                  {i + 1}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{obj}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MEMBRES DU COMITÉ ── */}
      {members?.length > 0 && (
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Les Membres Fondateurs</h2>
            <p className="text-gray-500">L'équipe qui donne vie au concours UNEXE</p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.map(member => (
              <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
                {/* Photo */}
                <div className="h-48 bg-gray-100 overflow-hidden">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-red-900">
                      <span className="text-4xl font-bold text-white">
                        {member.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="p-4 space-y-1">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-xs text-red-600 font-medium">{member.position}</p>
                  {member.bio && (
                    <p className="text-xs text-gray-500 line-clamp-3 mt-2">{member.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Message si aucune donnée */}
      {!page && members?.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">🏗️</p>
          <p className="text-lg font-medium">Page en cours de construction</p>
          <p className="text-sm mt-1">Le comité met à jour les informations.</p>
        </div>
      )}
    </div>
  )
}