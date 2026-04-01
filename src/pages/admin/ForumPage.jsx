import { useEffect, useState, useRef, useCallback } from 'react'
import api from '../../api/axios'
import {
  MessageSquare, Plus, Send, X, Pin, Lock, Trash2,
  CheckCircle, Search, Megaphone, Hash,
  CornerDownRight, AlertCircle, ChevronLeft,
} from 'lucide-react'

const API_BASE = 'https://unexe.alwaysdata.net/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = 32 }) {
  const raw = user?.avatar
    ? `${API_BASE}/storage/avatars/${user.avatar.split('/').pop()}`
    : null
  const colors = ['#2A2AE0', '#008751', '#E8112D', '#8B5CF6', '#F0C040']
  const color = colors[(user?.id || 0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.28, overflow: 'hidden', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}88)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {raw
        ? <img src={raw} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
        : <span style={{ color: 'white', fontWeight: 900, fontSize: size * 0.38 }}>{user?.name?.charAt(0)?.toUpperCase()}</span>
      }
    </div>
  )
}

function RolePill({ role }) {
  const cfg = {
    super_admin: { label: '⚡ Admin',   bg: '#FEE2E2', color: '#DC2626' },
    comite:      { label: '🛡️ Comité', bg: '#FEE2E2', color: '#DC2626' },
    candidat:    { label: 'Candidat',   bg: '#EEF2FF', color: '#2A2AE0' },
  }
  const c = cfg[role] || cfg.candidat
  return (
    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20, background: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}

function formatTime(raw) {
  if (!raw) return ''
  const d = new Date(raw)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'maintenant'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MsgBubble({ reply, onReplyTo, onDelete, onMarkOfficial }) {
  const [hover, setHover] = useState(false)
  const isOfficial = reply.is_official_response
  const isAdmin = reply.user?.role === 'super_admin' || reply.user?.role === 'comite'

  return (
    <div
      style={{ display: 'flex', gap: 8, padding: '4px 0', alignItems: 'flex-start' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Avatar user={reply.user} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#111827' }}>{reply.user?.name}</span>
          <RolePill role={reply.user?.role} />
          {isOfficial && (
            <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 20, background: '#D1FAE5', color: '#059669', display: 'flex', alignItems: 'center', gap: 3 }}>
              <CheckCircle size={8} /> Officielle
            </span>
          )}
          <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 'auto' }}>{formatTime(reply.created_at_raw || reply.created_at)}</span>
        </div>

        <div style={{
          display: 'inline-block', maxWidth: '85%', padding: '8px 12px', borderRadius: '4px 12px 12px 12px',
          background: isAdmin ? '#EEF2FF' : '#F9FAFB',
          border: `1px solid ${isOfficial ? 'rgba(5,150,105,0.2)' : isAdmin ? 'rgba(42,42,224,0.12)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#1F2937', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {reply.content}
          </p>
        </div>

        {reply.children?.length > 0 && (
          <div style={{ marginTop: 4, paddingLeft: 12, borderLeft: '2px solid #EEF2FF' }}>
            {reply.children.map(c => (
              <div key={c.id} style={{ fontSize: 11, color: '#6B7280', padding: '2px 0', display: 'flex', gap: 4 }}>
                <span style={{ fontWeight: 700, color: '#374151' }}>{c.user?.name}:</span>
                <span>{c.content}</span>
              </div>
            ))}
          </div>
        )}

        {hover && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
            <ActionBtn label="Répondre" icon={<CornerDownRight size={11} />} onClick={() => onReplyTo(reply)} />
            <ActionBtn
              label={isOfficial ? '✓ Officielle' : 'Marquer officielle'}
              icon={<CheckCircle size={11} />}
              onClick={() => onMarkOfficial(reply.id)}
              active={isOfficial}
            />
            <ActionBtn label="Supprimer" icon={<Trash2 size={11} />} onClick={() => onDelete(reply.id)} danger />
          </div>
        )}
      </div>
    </div>
  )
}

function ActionBtn({ label, icon, onClick, danger, active }) {
  return (
    <button onClick={onClick} title={label} style={{
      display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6,
      border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600,
      background: active ? '#D1FAE5' : danger ? '#FEE2E2' : '#F3F4F6',
      color: active ? '#059669' : danger ? '#DC2626' : '#6B7280',
    }}>
      {icon} {label}
    </button>
  )
}

// ─── Channel Card ─────────────────────────────────────────────────────────────
function ChannelCard({ topic, isActive, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '10px 12px', textAlign: 'left', border: 'none', cursor: 'pointer',
      background: isActive ? '#EEF2FF' : 'transparent', borderRadius: 10, transition: 'all 0.12s',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: topic.type === 'announcement' ? '#FEE2E2' : '#EEF2FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {topic.type === 'announcement'
          ? <Megaphone size={15} color="#DC2626" />
          : <Hash size={15} color="#2A2AE0" />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#2A2AE0' : '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {topic.title}
          </span>
          <span style={{ fontSize: 9, color: '#9CA3AF', flexShrink: 0 }}>{formatTime(topic.updated_at || topic.created_at)}</span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {topic.is_pinned && <Pin size={9} color="#F59E0B" fill="#F59E0B" />}
          {topic.is_closed && <Lock size={9} color="#9CA3AF" />}
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>
            {topic.replies_count} message{topic.replies_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ForumPage() {
  const [topics, setTopics] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [activeTopic, setActiveTopic] = useState(null)
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  // Vue mobile : 'list' ou 'chat'
  const [mobileView, setMobileView] = useState('list')

  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [sending, setSending] = useState(false)

  // Modal nouveau topic/annonce
  const [showNewTopic, setShowNewTopic] = useState(false)
  const [newTopic, setNewTopic] = useState({ title: '', content: '', type: 'announcement' })
  const [savingTopic, setSavingTopic] = useState(false)
  const [topicError, setTopicError] = useState(null)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const pollRef = useRef(null)

  // ── Chargement topics ─────────────────────────────────────────────────────
  const loadTopics = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (filterType !== 'all') p.append('type', filterType)
      if (search) p.append('search', search)
      const res = await api.get(`/forum/topics?${p}`)
      setTopics(res.data.topics?.data || [])
      setStats(res.data.stats || {})
    } catch {}
    finally { setLoading(false) }
  }, [filterType, search])

  // ── Chargement d'un topic ────────────────────────────────────────────────
  const loadTopic = async (id) => {
    setLoadingReplies(true)
    try {
      const res = await api.get(`/forum/topics/${id}`)
      setActiveTopic(res.data.topic)
      setReplies(res.data.replies || [])
      setMobileView('chat')
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {}
    finally { setLoadingReplies(false) }
  }

  useEffect(() => { loadTopics() }, [filterType])

  // ── Polling toutes les 5s ────────────────────────────────────────────────
  useEffect(() => {
    if (!activeTopic) return
    pollRef.current = setInterval(async () => {
      const res = await api.get(`/forum/topics/${activeTopic.id}`).catch(() => null)
      if (res) setReplies(res.data.replies || [])
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [activeTopic?.id])

  // ── Créer un topic ou une annonce ────────────────────────────────────────
  const handleCreateTopic = async (e) => {
    e.preventDefault()
    setSavingTopic(true)
    setTopicError(null)
    try {
      const endpoint = newTopic.type === 'announcement' ? '/forum/announcements' : '/forum/topics'
      const res = await api.post(endpoint, { title: newTopic.title, content: newTopic.content })
      setNewTopic({ title: '', content: '', type: 'announcement' })
      setShowNewTopic(false)
      await loadTopics()
      loadTopic(res.data.topic.id)
    } catch (err) {
      setTopicError(err.response?.data?.message || 'Erreur lors de la création.')
    } finally { setSavingTopic(false) }
  }

  // ── Envoyer un message ───────────────────────────────────────────────────
  const handleSend = async () => {
    if (!replyContent.trim() || sending) return
    setSending(true)
    try {
      await api.post(`/forum/topics/${activeTopic.id}/replies`, {
        content: replyContent,
        parent_id: replyingTo?.id || null,
      })
      setReplyContent('')
      setReplyingTo(null)
      await loadTopic(activeTopic.id)
      await loadTopics()
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur')
    } finally { setSending(false) }
  }

  // ── Actions comité ───────────────────────────────────────────────────────
  const handleDeleteReply = async (id) => {
    if (!confirm('Supprimer ce message ?')) return
    await api.delete(`/forum/replies/${id}`)
    loadTopic(activeTopic.id)
  }

  const handleMarkOfficial = async (id) => {
    await api.put(`/forum/replies/${id}/official`)
    loadTopic(activeTopic.id)
  }

  const handleDeleteTopic = async (id) => {
    if (!confirm('Supprimer ce canal et tous ses messages ?')) return
    await api.delete(`/forum/topics/${id}`)
    setActiveTopic(null)
    setMobileView('list')
    loadTopics()
  }

  const handlePin = async (id) => {
    await api.put(`/forum/topics/${id}/pin`)
    loadTopics()
    if (activeTopic?.id === id) loadTopic(id)
  }

  const handleClose = async (id) => {
    await api.put(`/forum/topics/${id}/close`)
    loadTopics()
    if (activeTopic?.id === id) loadTopic(id)
  }

  const filteredTopics = topics.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  )

  const statItems = [
    { label: 'Canaux',      value: stats.total_topics },
    { label: 'Annonces',    value: stats.total_announcements },
    { label: 'Discussions', value: stats.total_discussions },
    { label: 'Messages',    value: stats.total_replies },
  ]

  return (
    <div style={{ fontFamily: '"DM Sans", system-ui', display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Forum & Messagerie</h1>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Échanges entre comité et candidats</p>
        </div>
        {/* ✅ Bouton créer annonce/discussion pour le comité */}
        <button
          onClick={() => setShowNewTopic(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
            background: '#2A2AE0', color: 'white', border: 'none', borderRadius: 12,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(42,42,224,0.25)',
          }}
        >
          <Plus size={15} /> Nouvelle annonce
        </button>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }} className="forum-stats-grid">
        {statItems.map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: '#6B7280' }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0, overflow: 'hidden' }}>

        {/* SIDEBAR — cachée sur mobile quand chat actif */}
        <div
          style={{
            width: 280, flexShrink: 0, background: 'white', border: '1px solid #eee',
            borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}
          className={`forum-sidebar ${mobileView === 'chat' ? 'forum-hidden-mobile' : ''}`}
        >
          <div style={{ padding: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadTopics()}
                placeholder="Rechercher..."
                style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            {/* Filtres */}
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[{ k: 'all', l: 'Tous' }, { k: 'announcement', l: '📢' }, { k: 'discussion', l: '💬' }].map(f => (
                <button key={f.k} onClick={() => setFilterType(f.k)} style={{
                  flex: 1, padding: '5px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: filterType === f.k ? '#2A2AE0' : '#F3F4F6',
                  color: filterType === f.k ? 'white' : '#6B7280',
                }}>
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>Chargement...</div>
            ) : filteredTopics.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>Aucun canal</div>
            ) : filteredTopics.map(t => (
              <ChannelCard key={t.id} topic={t} isActive={activeTopic?.id === t.id} onClick={() => loadTopic(t.id)} />
            ))}
          </div>
        </div>

        {/* ZONE CHAT */}
        <div
          style={{
            flex: 1, background: 'white', border: '1px solid #eee',
            borderRadius: 16, display: 'flex', flexDirection: 'column', minWidth: 0,
          }}
          className={`forum-chat ${mobileView === 'list' && !activeTopic ? 'forum-hidden-mobile' : ''}`}
        >
          {!activeTopic ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <MessageSquare size={40} style={{ opacity: 0.15, margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 600 }}>Sélectionnez un canal</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header du chat */}
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid #eee',
                display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
              }}>
                {/* Bouton retour mobile */}
                <button
                  onClick={() => { setMobileView('list'); setActiveTopic(null) }}
                  style={{ background: '#eee', border: 'none', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex' }}
                  className="forum-back-btn"
                >
                  <ChevronLeft size={16} />
                </button>

                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: activeTopic.type === 'announcement' ? '#FEE2E2' : '#EEF2FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {activeTopic.type === 'announcement'
                    ? <Megaphone size={15} color="#DC2626" />
                    : <Hash size={15} color="#2A2AE0" />
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeTopic.title}
                    </span>
                    {activeTopic.is_pinned && <Pin size={10} color="#F59E0B" fill="#F59E0B" />}
                    {activeTopic.is_closed && <Lock size={10} color="#9CA3AF" />}
                  </div>
                  <p style={{ margin: 0, fontSize: 10, color: '#9CA3AF' }}>{replies.length} message{replies.length !== 1 ? 's' : ''}</p>
                </div>

                {/* ✅ Actions comité dans le header */}
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => handlePin(activeTopic.id)} title={activeTopic.is_pinned ? 'Désépingler' : 'Épingler'} style={iconBtn()}>
                    <Pin size={13} color={activeTopic.is_pinned ? '#F59E0B' : '#9CA3AF'} fill={activeTopic.is_pinned ? '#F59E0B' : 'none'} />
                  </button>
                  <button onClick={() => handleClose(activeTopic.id)} title={activeTopic.is_closed ? 'Rouvrir' : 'Fermer'} style={iconBtn()}>
                    <Lock size={13} color={activeTopic.is_closed ? '#2A2AE0' : '#9CA3AF'} />
                  </button>
                  <button onClick={() => handleDeleteTopic(activeTopic.id)} title="Supprimer" style={iconBtn(true)}>
                    <Trash2 size={13} color="#DC2626" />
                  </button>
                </div>
              </div>

              {/* Description du topic */}
              {activeTopic.content && (
                <div style={{
                  padding: '10px 14px', borderBottom: '1px solid #f3f4f6',
                  background: activeTopic.type === 'announcement' ? '#FFF5F5' : '#F9FAFB',
                  display: 'flex', gap: 8, flexShrink: 0,
                }}>
                  <Avatar user={activeTopic.author} size={26} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{activeTopic.author?.name}</span>
                      <RolePill role={activeTopic.author?.role} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {activeTopic.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 12, minHeight: 0 }}>
                {loadingReplies ? (
                  <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF', fontSize: 12 }}>Chargement...</div>
                ) : replies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF', fontSize: 12 }}>
                    Aucun message pour l'instant.
                  </div>
                ) : replies.map(r => (
                  <MsgBubble
                    key={r.id}
                    reply={r}
                    onReplyTo={r => { setReplyingTo(r); inputRef.current?.focus() }}
                    onDelete={handleDeleteReply}
                    onMarkOfficial={handleMarkOfficial}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              {!activeTopic.is_closed ? (
                <div style={{ borderTop: '1px solid #eee', padding: 10, flexShrink: 0 }}>
                  {replyingTo && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                      padding: '5px 10px', borderRadius: 8,
                      background: '#EEF2FF', borderLeft: '3px solid #2A2AE0',
                    }}>
                      <CornerDownRight size={12} color="#2A2AE0" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#2A2AE0' }}>{replyingTo.user?.name}</span>
                        <p style={{ margin: '1px 0 0', fontSize: 11, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {replyingTo.content}
                        </p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={12} color="#9CA3AF" />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <textarea
                      ref={inputRef}
                      value={replyContent}
                      onChange={e => {
                        setReplyContent(e.target.value)
                        e.target.style.height = 'auto'
                        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                      }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                      placeholder="Votre message... (Entrée pour envoyer)"
                      rows={1}
                      style={{
                        flex: 1, resize: 'none', border: '1.5px solid rgba(42,42,224,0.15)',
                        borderRadius: 10, padding: '8px 12px', fontSize: 13,
                        outline: 'none', maxHeight: 100, overflowY: 'auto',
                        fontFamily: '"DM Sans", sans-serif',
                        background: '#F7F7FC',
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!replyContent.trim() || sending}
                      style={{
                        width: 38, height: 38, borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: replyContent.trim() ? '#2A2AE0' : 'rgba(42,42,224,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <Send size={15} color="white" />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid #eee', padding: '10px 14px', textAlign: 'center', flexShrink: 0 }}>
                  <Lock size={13} color="#9CA3AF" style={{ display: 'inline', marginRight: 6 }} />
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>Ce canal est fermé aux nouveaux messages</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile : afficher la liste si pas de chat */}
        {mobileView === 'list' && !activeTopic && (
          <div style={{
            flex: 1, background: 'white', border: '1px solid #eee',
            borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }} className="forum-mobile-list">
            <div style={{ padding: 12 }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {[{ k: 'all', l: 'Tous' }, { k: 'announcement', l: '📢 Annonces' }, { k: 'discussion', l: '💬 Discussions' }].map(f => (
                  <button key={f.k} onClick={() => setFilterType(f.k)} style={{
                    flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: filterType === f.k ? '#2A2AE0' : '#F3F4F6',
                    color: filterType === f.k ? 'white' : '#6B7280',
                  }}>
                    {f.l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredTopics.map(t => (
                <ChannelCard key={t.id} topic={t} isActive={false} onClick={() => loadTopic(t.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal création topic/annonce ── */}
      {showNewTopic && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <div style={{
            background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 560,
            boxShadow: '0 -10px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Nouveau canal</h2>
              <button onClick={() => setShowNewTopic(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#9CA3AF" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} style={{ padding: 20 }}>
              {topicError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: '#FEE2E2', marginBottom: 12 }}>
                  <AlertCircle size={14} color="#DC2626" />
                  <span style={{ fontSize: 12, color: '#DC2626' }}>{topicError}</span>
                </div>
              )}

              {/* Sélecteur type */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {[
                  { value: 'announcement', label: '📢 Annonce officielle', desc: 'Épinglée automatiquement' },
                  { value: 'discussion',   label: '💬 Discussion ouverte', desc: 'Ouvert à tous les candidats' },
                ].map(t => (
                  <label key={t.value} style={{
                    flex: 1, cursor: 'pointer', borderRadius: 12, padding: 12,
                    border: `2px solid ${newTopic.type === t.value ? '#2A2AE0' : 'rgba(42,42,224,0.12)'}`,
                    background: newTopic.type === t.value ? 'rgba(42,42,224,0.06)' : 'transparent',
                  }}>
                    <input type="radio" value={t.value} checked={newTopic.type === t.value}
                      onChange={e => setNewTopic(n => ({ ...n, type: e.target.value }))} style={{ display: 'none' }} />
                    <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>{t.label}</p>
                    <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>{t.desc}</p>
                  </label>
                ))}
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 6 }}>Titre *</label>
                <input
                  type="text" required minLength={5}
                  value={newTopic.title}
                  onChange={e => setNewTopic(n => ({ ...n, title: e.target.value }))}
                  placeholder="Titre du canal..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid rgba(42,42,224,0.15)', fontSize: 13, outline: 'none', background: '#F7F7FC', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 6 }}>Message / Description *</label>
                <textarea
                  required minLength={10} rows={4}
                  value={newTopic.content}
                  onChange={e => setNewTopic(n => ({ ...n, content: e.target.value }))}
                  placeholder="Contenu de l'annonce ou description..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid rgba(42,42,224,0.15)', fontSize: 13, outline: 'none', background: '#F7F7FC', resize: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans", sans-serif' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={savingTopic} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#2A2AE0', color: 'white', fontSize: 13, fontWeight: 700, opacity: savingTopic ? 0.6 : 1 }}>
                  {savingTopic ? 'Publication...' : 'Publier'}
                </button>
                <button type="button" onClick={() => setShowNewTopic(false)} style={{ padding: '11px 20px', borderRadius: 12, border: '1.5px solid #eee', cursor: 'pointer', background: 'transparent', fontSize: 13, color: '#9CA3AF' }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .forum-stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .forum-mobile-list { display: none !important; }
          .forum-sidebar { display: flex !important; }
          .forum-chat { display: flex !important; }
          .forum-back-btn { display: none !important; }
          .forum-hidden-mobile { display: flex !important; }
        }
        @media (max-width: 767px) {
          .forum-sidebar { display: none !important; }
          .forum-back-btn { display: flex !important; }
          .forum-hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function iconBtn(danger = false) {
  return {
    width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
    background: danger ? '#FEE2E2' : '#F3F4F6',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}