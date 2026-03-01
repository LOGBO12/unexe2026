import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  MessageSquare, Plus, Trash2, Pin, Lock,
  RefreshCw, Megaphone, CheckCircle, X
} from 'lucide-react'

export default function ForumPage() {
  const [topics, setTopics]     = useState([])
  const [stats, setStats]       = useState({})
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('all') // all | announcement | discussion
  const [form, setForm]         = useState({ title: '', content: '', type: 'announcement' })
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(null)
  const [error, setError]       = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [replies, setReplies]   = useState([])
  const [replyContent, setReplyContent] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  const load = () => {
    setLoading(true)
    const params = activeTab !== 'all' ? `?type=${activeTab}` : ''
    api.get(`/forum/topics${params}`)
      .then(res => {
        setTopics(res.data.topics?.data || [])
        setStats(res.data.stats || {})
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [activeTab])

  const loadTopic = (id) => {
    api.get(`/forum/topics/${id}`)
      .then(res => {
        setSelectedTopic(res.data.topic)
        setReplies(res.data.replies || [])
      })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (form.type === 'announcement') {
        await api.post('/forum/announcements', { title: form.title, content: form.content })
      } else {
        await api.post('/forum/topics', { title: form.title, content: form.content })
      }
      setSuccess('Publié avec succès !')
      setShowForm(false)
      setForm({ title: '', content: '', type: 'announcement' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la publication.')
    } finally {
      setSaving(false)
    }
  }

  const handlePin = async (id) => {
    await api.put(`/forum/topics/${id}/pin`)
    load()
  }

  const handleClose = async (id) => {
    await api.put(`/forum/topics/${id}/close`)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce topic et toutes ses réponses ?')) return
    await api.delete(`/forum/topics/${id}`)
    setSelectedTopic(null)
    load()
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    setSendingReply(true)
    try {
      await api.post(`/forum/topics/${selectedTopic.id}/replies`, {
        content: replyContent
      })
      setReplyContent('')
      loadTopic(selectedTopic.id)
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally {
      setSendingReply(false)
    }
  }

  const handleMarkOfficial = async (replyId) => {
    await api.put(`/forum/replies/${replyId}/official`)
    loadTopic(selectedTopic.id)
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Supprimer cette réponse ?')) return
    await api.delete(`/forum/replies/${replyId}`)
    loadTopic(selectedTopic.id)
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forum</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gérer les annonces et discussions de la communauté
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
            <RefreshCw size={16} className="text-gray-500" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
          >
            <Plus size={16} />
            Nouveau post
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Topics total',    value: stats.total_topics },
          { label: 'Annonces',        value: stats.total_announcements },
          { label: 'Discussions',     value: stats.total_discussions },
          { label: 'Réponses total',  value: stats.total_replies },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Alertes */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ❌ {error}
        </div>
      )}

      {/* Formulaire nouveau post */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            ✍️ Nouveau post
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">

            {/* Type */}
            <div className="flex gap-3">
              {[
                { value: 'announcement', label: '📢 Annonce officielle', desc: 'Épinglée automatiquement' },
                { value: 'discussion',   label: '💬 Discussion',          desc: 'Ouverte à tous' },
              ].map(t => (
                <label
                  key={t.value}
                  className={`flex-1 cursor-pointer rounded-xl border-2 p-3 transition
                    ${form.type === t.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    checked={form.type === t.value}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="sr-only"
                  />
                  <p className="font-medium text-sm text-gray-800">{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                </label>
              ))}
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                minLength={5}
                placeholder="Titre du post..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            {/* Contenu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contenu <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                required
                minLength={10}
                rows={6}
                placeholder="Contenu du post..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition">
                {saving ? 'Publication...' : 'Publier'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Liste topics */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Onglets */}
          <div className="flex border-b border-gray-100">
            {[
              { key: 'all',          label: 'Tous' },
              { key: 'announcement', label: '📢 Annonces' },
              { key: 'discussion',   label: '💬 Discussions' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 text-sm font-medium transition
                  ${activeTab === tab.key
                    ? 'text-red-600 border-b-2 border-red-600'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun topic</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
              {topics.map(topic => (
                <div
                  key={topic.id}
                  onClick={() => loadTopic(topic.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition
                    ${selectedTopic?.id === topic.id ? 'bg-red-50 border-l-2 border-red-500' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {topic.type === 'announcement' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                            📢 Annonce
                          </span>
                        )}
                        {topic.is_pinned && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            📌 Épinglé
                          </span>
                        )}
                        {topic.is_closed && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            🔒 Fermé
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-gray-800 text-sm truncate">{topic.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {topic.author?.name} · {topic.replies_count} réponse{topic.replies_count > 1 ? 's' : ''} · {topic.created_at}
                      </p>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handlePin(topic.id)}
                        className={`p-1.5 rounded-lg transition
                          ${topic.is_pinned
                            ? 'text-yellow-600 bg-yellow-50'
                            : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}
                        title="Épingler"
                      >
                        <Pin size={13} />
                      </button>
                      <button
                        onClick={() => handleClose(topic.id)}
                        className={`p-1.5 rounded-lg transition
                          ${topic.is_closed
                            ? 'text-gray-600 bg-gray-100'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                        title="Fermer"
                      >
                        <Lock size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Détail topic + replies */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {!selectedTopic ? (
            <div className="flex items-center justify-center h-full min-h-64 text-gray-400">
              <div className="text-center">
                <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Sélectionnez un topic</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full max-h-[700px]">

              {/* Header topic */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedTopic.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Par {selectedTopic.author?.name} · {selectedTopic.created_at}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedTopic(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-line">
                  {selectedTopic.content}
                </p>
              </div>

              {/* Replies */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {replies.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">
                    Aucune réponse pour l'instant
                  </p>
                ) : (
                  replies.map(reply => (
                    <div
                      key={reply.id}
                      className={`rounded-xl p-3 text-sm
                        ${reply.is_official_response
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{reply.user?.name}</span>
                          {reply.is_official_response && (
                            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              ✓ Officielle
                            </span>
                          )}
                          <span className={`text-xs px-1.5 py-0.5 rounded-full
                            ${reply.user?.role === 'super_admin' || reply.user?.role === 'comite'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-200 text-gray-500'}`}
                          >
                            {reply.user?.role === 'super_admin' ? 'Admin' : reply.user?.role === 'comite' ? 'Comité' : 'Candidat'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleMarkOfficial(reply.id)}
                            className={`p-1 rounded transition text-xs
                              ${reply.is_official_response
                                ? 'text-blue-600 hover:bg-blue-100'
                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                            title="Marquer officielle"
                          >
                            <CheckCircle size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteReply(reply.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {reply.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{reply.created_at}</p>

                      {/* Sous-réponses */}
                      {reply.children?.length > 0 && (
                        <div className="mt-2 ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
                          {reply.children.map(child => (
                            <div key={child.id} className="text-xs text-gray-600">
                              <span className="font-medium">{child.user?.name} :</span> {child.content}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Zone réponse */}
              {!selectedTopic.is_closed ? (
                <div className="px-5 py-3 border-t border-gray-100">
                  <form onSubmit={handleReply} className="flex gap-2">
                    <input
                      type="text"
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder="Répondre en tant que comité..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                    />
                    <button
                      type="submit"
                      disabled={sendingReply || !replyContent.trim()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition"
                    >
                      {sendingReply ? '...' : 'Envoyer'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="px-5 py-3 border-t border-gray-100 text-center text-sm text-gray-400">
                  🔒 Ce topic est fermé aux réponses
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}