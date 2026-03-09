import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import {
  Users, FileText, Mail, CheckCircle,
  XCircle, Clock, BarChart2, ScrollText
} from 'lucide-react'

function StatCard({ label, value, icon: Icon, color = 'red', sub }) {
  const colors = {
    red:    'bg-red-50 text-red-600',
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    gray:   'bg-gray-100 text-gray-600',
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function ActionRow({ action }) {
  const labels = {
    validate_candidate:   { label: 'Candidature validée',    color: 'text-green-600 bg-green-50' },
    reject_candidate:     { label: 'Candidature rejetée',    color: 'text-red-600 bg-red-50' },
    invite_comite:        { label: 'Invitation comité',      color: 'text-blue-600 bg-blue-50' },
    invite_candidat:      { label: 'Invitation candidat',    color: 'text-yellow-600 bg-yellow-50' },
    update_committee_page:{ label: 'Page comité modifiée',   color: 'text-purple-600 bg-purple-50' },
    publish_announcement: { label: 'Annonce publiée',        color: 'text-indigo-600 bg-indigo-50' },
    complete_profile:     { label: 'Profil complété',        color: 'text-teal-600 bg-teal-50' },
  }
  const info = labels[action.action] || { label: action.action, color: 'text-gray-600 bg-gray-100' }

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${info.color}`}>
        {info.label}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 truncate">
          <span className="font-medium">{action.user?.name}</span>
        </p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">
        {new Date(action.created_at).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        })}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { stats, by_department, recent_actions } = data || {}
  const c = stats?.candidates
  const a = stats?.applications

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 text-sm mt-0.5">Vue d'ensemble du concours UNEXE</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/invitations')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
        >
          <Mail size={16} />
          Envoyer une invitation
        </button>
      </div>

      {/* Stats candidats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Candidats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="Total"      value={c?.total}     icon={Users}       color="gray" />
          <StatCard label="Validés"    value={c?.validated} icon={CheckCircle} color="green" />
          <StatCard label="En attente" value={c?.pending}   icon={Clock}       color="yellow" />
          <StatCard label="Rejetés"    value={c?.rejected}  icon={XCircle}     color="red" />
          <StatCard label="1ère année" value={c?.year1}     icon={BarChart2}   color="blue" sub="Validés" />
          <StatCard label="2ème année" value={c?.year2}     icon={BarChart2}   color="blue" sub="Validés" />
        </div>
      </div>

      {/* Stats candidatures */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Dossiers de candidature
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total"      value={a?.total}     icon={FileText}    color="gray" />
          <StatCard label="En attente" value={a?.pending}   icon={Clock}       color="yellow" />
          <StatCard label="Validés"    value={a?.validated} icon={CheckCircle} color="green" />
          <StatCard label="Rejetés"    value={a?.rejected}  icon={XCircle}     color="red" />
        </div>
      </div>

     

      {/* Tableau par département + Dernières actions */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Par département */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Candidats par département</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left">Département</th>
                  <th className="px-3 py-3 text-center">Total</th>
                  <th className="px-3 py-3 text-center">Validés</th>
                  <th className="px-3 py-3 text-center">1ère</th>
                  <th className="px-3 py-3 text-center">2ème</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {by_department?.map(dept => (
                  <tr key={dept.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{dept.name}</td>
                    <td className="px-3 py-3 text-center text-gray-600">{dept.candidates_total}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-green-600 font-semibold">{dept.candidates_validated}</span>
                    </td>
                    <td className="px-3 py-3 text-center text-blue-600">{dept.candidates_year1}</td>
                    <td className="px-3 py-3 text-center text-blue-600">{dept.candidates_year2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dernières actions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Dernières actions</h3>
            <button
              onClick={() => navigate('/dashboard/logs')}
              className="text-xs text-red-600 hover:underline"
            >
              Voir tout →
            </button>
          </div>
          <div className="px-5 py-2">
            {recent_actions?.length > 0
              ? recent_actions.map(a => <ActionRow key={a.id} action={a} />)
              : <p className="text-gray-400 text-sm py-4 text-center">Aucune action récente</p>
            }
          </div>
        </div>

      </div>
    </div>
  )
}