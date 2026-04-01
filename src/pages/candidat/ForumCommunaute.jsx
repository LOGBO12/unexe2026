import { useEffect, useState, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import {
  Send, X, ChevronLeft, Megaphone, MessageCircle, Pin, Lock,
  CornerDownRight, CheckCircle, Search, Hash,
  Plus, ArrowDown, Trash2, AlertCircle,
} from 'lucide-react'

const API_BASE = 'https://unexe.alwaysdata.net/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ user, size = 36 }) {
  const raw = user?.avatar_url || (user?.avatar ? `${API_BASE}/storage/avatars/${user.avatar.split('/').pop()}` : null)
  const initials = user?.name?.charAt(0)?.toUpperCase()
  const colors = ['#2A2AE0', '#008751', '#E8112D', '#F0C040', '#8B5CF6']
  const color = colors[(user?.id || 0) % colors.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.3,
      overflow: 'hidden', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}99)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {raw
        ? <img src={raw} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
        : <span style={{ color: 'white', fontWeight: 900, fontSize: size * 0.4 }}>{initials}</span>
      }
    </div>
  )
}

function RolePill({ role }) {
  const config = {
    super_admin: { label: '⚡ Admin',   bg: 'rgba(232,17,45,0.12)',  color: '#E8112D' },
    comite:      { label: '🛡️ Comité', bg: 'rgba(232,17,45,0.1)',   color: '#E8112D' },
    candidat:    { label: 'Candidat',   bg: 'rgba(42,42,224,0.08)', color: '#2A2AE0' },
  }
  const c = config[role] || config.candidat
  return (
    <span style={{
      fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '2px 6px', borderRadius: 20, background: c.bg, color: c.color,
    }}>{c.label}</span>
  )
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'À l\'instant'
  if (diff < 3600000) return `Il y a ${Math.floor(diff / 60000)}m`
  if (diff < 86400000) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ reply, currentUser, isComite, onReplyTo, onDelete, onMarkOfficial }) {
  const isOwn = reply.user?.id === currentUser?.id
  const isOfficial = reply.is_official_response
  const [showActions, setShowActions] = useState(false)
  const canDelete = isComite || isOwn

  return (
    <div
      style={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', gap: 8, marginBottom: 8, alignItems: 'flex-end' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwn && <Avatar user={reply.user} size={28} />}

      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
        {!isOwn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, paddingLeft: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0D0D1A' }}>{reply.user?.name}</span>
            <RolePill role={reply.user?.role} />
          </div>
        )}

        <div style={{
          background: isOwn ? 'linear-gradient(135deg, #2A2AE0, #1A1A8B)' : isOfficial ? 'rgba(0,135,81,0.08)' : '#F0F0F8',
          color: isOwn ? '#fff' : '#0D0D1A',
          padding: '8px 12px',
          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          border: isOfficial && !isOwn ? '1px solid rgba(0,135,81,0.25)' : 'none',
          boxShadow: isOwn ? '0 2px 8px rgba(42,42,224,0.25)' : '0 1px 3px rgba(0,0,0,0.05)',
        }}>
          {isOfficial && !isOwn && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', color: '#008751' }}>
              <CheckCircle size={9} /> Réponse officielle
            </div>
          )}
          <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {reply.content}
          </p>
          <span style={{ fontSize: 9, opacity: isOwn ? 0.7 : 0.45, display: 'block', textAlign: 'right', marginTop: 4 }}>
            {formatTime(reply.created_at_raw || reply.created_at)}
          </span>
        </div>

        {reply.children?.length > 0 && (
          <div style={{ marginTop: 4, paddingLeft: 8, borderLeft: '2px solid rgba(42,42,224,0.15)' }}>
            {reply.children.map(child => (
              <div key={child.id} style={{ fontSize: 11, color: '#666', padding: '2px 0' }}>
                <strong style={{ color: '#0D0D1A' }}>{child.user?.name}:</strong> {child.content}
              </div>
            ))}
          </div>
        )}

        {showActions && (
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <button onClick={() => onReplyTo(reply)} title="Répondre" style={actionBtnStyle('#2A2AE0')}>
              <CornerDownRight size={11} /> <span style={{ fontSize: 10 }}>Répondre</span>
            </button>
            {canDelete && (
              <button onClick={() => onDelete(reply.id)} title="Supprimer" style={actionBtnStyle('#E8112D', true)}>
                <Trash2 size={11} />
              </button>
            )}
            {isComite && (
              <button onClick={() => onMarkOfficial(reply.id)} title={isOfficial ? 'Retirer officielle' : 'Marquer officielle'} style={actionBtnStyle('#008751', false, isOfficial)}>
                <CheckCircle size={11} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function actionBtnStyle(color, danger = false, active = false) {
  return {
    display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 6,
    border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600,
    background: active ? `${color}20` : danger ? '#FEE2E2' : '#F3F4F6',
    color: active ? color : danger ? '#DC2626' : '#6B7280',
  }
}

// ─── Channel Card ─────────────────────────────────────────────────────────────
function ChannelCard({ topic, isActive, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '10px 12px', textAlign: 'left',
      background: isActive ? 'rgba(42,42,224,0.1)' : 'transparent',
      border: 'none', borderRadius: 12, cursor: 'pointer',
      transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: topic.type === 'announcement' ? 'rgba(232,17,45,0.1)' : 'rgba(42,42,224,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {topic.type === 'announcement'
          ? <Megaphone size={16} color="#E8112D" />
          : <Hash size={16} color="#2A2AE0" />
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#2A2AE0' : '#0D0D1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
            {topic.title}
          </span>
          <span style={{ fontSize: 9, color: '#9CA3AF', flexShrink: 0 }}>{formatTime(topic.updated_at || topic.created_at)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {topic.is_pinned && <Pin size={9} color="#F0C040" fill="#F0C040" />}
          {topic.is_closed && <Lock size={9} color="#9CA3AF" />}
          <span style={{ fontSize: 10, color: '#9CA3AF' }}>{topic.replies_count} message{topic.replies_count !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </button>
  )
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function ForumCommunaute() {
  const { user } = useAuth()
  const location = useLocation()

  // ✅ CORRECTION RÔLES : un comité/admin peut créer des annonces, les candidats seulement des discussions
  const isComite = user?.role === 'super_admin' || user?.role === 'comite'

  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const pollRef = useRef(null)

  const [topics, setTopics] = useState([])
  const [statsGlobal, setStatsGlobal] = useState({})
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  const [activeTopic, setActiveTopic] = useState(null)
  const [replies, setReplies] = useState([])
  const [loadingReplies, setLoadingReplies] = useState(false)

  const [mobileView, setMobileView] = useState('list')

  const [showNewTopic, setShowNewTopic] = useState(false)
  const [newTopic, setNewTopic] = useState({ title: '', content: '', type: isComite ? 'announcement' : 'discussion' })
  const [savingTopic, setSavingTopic] = useState(false)
  const [topicError, setTopicError] = useState(null)

  const [replyContent, setReplyContent] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [sendingReply, setSendingReply] = useState(false)

  const loadRepliesSilent = useCallback(async (id) => {
    if (!id) return
    try {
      const res = await api.get(`/forum/topics/${id}`)
      setReplies(res.data.replies || [])
    } catch {}
  }, [])

  const loadTopics = async () => {
    setLoadingTopics(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (search) params.append('search', search)
      const res = await api.get(`/forum/topics?${params}`)
      setTopics(res.data.topics?.data || [])
      setStatsGlobal(res.data.stats || {})
    } catch {}
    finally { setLoadingTopics(false) }
  }

  const loadTopic = async (id) => {
    setLoadingReplies(true)
    try {
      const res = await api.get(`/forum/topics/${id}`)
      setActiveTopic(res.data.topic)
      setReplies(res.data.replies || [])
      setMobileView('chat') // ✅ bascule sur la vue chat sur mobile
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {}
    finally { setLoadingReplies(false) }
  }

  useEffect(() => { loadTopics() }, [filterType])

  useEffect(() => {
    const topicId = location.state?.topicId
    if (topicId) loadTopic(topicId)
  }, [location.state])

  useEffect(() => {
    if (!activeTopic) return
    pollRef.current = setInterval(() => loadRepliesSilent(activeTopic.id), 5000)
    return () => clearInterval(pollRef.current)
  }, [activeTopic?.id, loadRepliesSilent])

  useEffect(() => {
    if (replies.length > 0) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }, [replies.length])

  const handleCreateTopic = async (e) => {
    e.preventDefault()
    setSavingTopic(true)
    setTopicError(null)
    try {
      const endpoint = (isComite && newTopic.type === 'announcement')
        ? '/forum/announcements'
        : '/forum/topics'
      const res = await api.post(endpoint, { title: newTopic.title, content: newTopic.content })
      setNewTopic({ title: '', content: '', type: isComite ? 'announcement' : 'discussion' })
      setShowNewTopic(false)
      await loadTopics()
      loadTopic(res.data.topic.id)
    } catch (err) {
      setTopicError(err.response?.data?.message || 'Erreur lors de la création.')
    } finally { setSavingTopic(false) }
  }

  const handleSendReply = async () => {
    if (!replyContent.trim() || sendingReply) return
    setSendingReply(true)
    try {
      await api.post(`/forum/topics/${activeTopic.id}/replies`, {
        content: replyContent,
        parent_id: replyingTo?.id || null,
      })
      setReplyContent('')
      setReplyingTo(null)
      await loadTopic(activeTopic.id)
      await loadTopics()
    } catch {}
    finally { setSendingReply(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendReply()
    }
  }

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Supprimer ce message ?')) return
    await api.delete(`/forum/replies/${replyId}`)
    await loadTopic(activeTopic.id)
  }

  const handleMarkOfficial = async (replyId) => {
    await api.put(`/forum/replies/${replyId}/official`)
    await loadTopic(activeTopic.id)
  }

  const handleDeleteTopic = async (id) => {
    if (!confirm('Supprimer ce canal ?')) return
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

  // ✅ RESPONSIVE : styles adaptés mobile/desktop via media queries en JS
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif', display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0D0D1A', margin: 0 }}>Communauté</h1>
          <p style={{ fontSize: 12, color: '#9CA3AF', margin: '2px 0 0' }}>
            {statsGlobal.total_topics ?? 0} canaux · {statsGlobal.total_replies ?? 0} messages
          </p>
        </div>
        {/* ✅ CORRECTION : le bouton change selon le rôle */}
        <button
          onClick={() => setShowNewTopic(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: '#2A2AE0', color: 'white', border: 'none', borderRadius: 12,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          {isComite ? 'Nouvelle annonce' : 'Nouveau sujet'}
        </button>
      </div>

      {/* ✅ RESPONSIVE LAYOUT : flex-col sur mobile, flex-row sur desktop */}
      <div style={{ flex: 1, display: 'flex', gap: 12, minHeight: 0, overflow: 'hidden' }}>

        {/* SIDEBAR — cachée sur mobile quand on est dans le chat */}
        <div style={{
          width: 260, flexShrink: 0,
          display: mobileView === 'chat' ? 'none' : 'flex',
          flexDirection: 'column',
          background: 'white', borderRadius: 16,
          border: '1px solid rgba(42,42,224,0.08)',
          overflow: 'hidden',
          // Sur desktop, toujours visible
          ...(typeof window !== 'undefined' && window.innerWidth >= 768 ? { display: 'flex' } : {}),
        }} className="forum-sidebar">
          <div style={{ padding: '12px 12px 8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadTopics()}
                placeholder="Rechercher..."
                style={{
                  width: '100%', padding: '7px 10px 7px 30px',
                  border: '1.5px solid rgba(42,42,224,0.1)', borderRadius: 10,
                  fontSize: 12, outline: 'none', background: '#F7F7FC', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {[{ key: 'all', label: 'Tous' }, { key: 'announcement', label: '📢' }, { key: 'discussion', label: '💬' }].map(f => (
                <button key={f.key} onClick={() => setFilterType(f.key)} style={{
                  flex: 1, padding: '5px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: filterType === f.key ? '#2A2AE0' : 'rgba(42,42,224,0.06)',
                  color: filterType === f.key ? 'white' : 'rgba(13,13,26,0.5)',
                }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
            {loadingTopics ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>Chargement...</div>
            ) : filteredTopics.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
                <MessageCircle size={28} style={{ opacity: 0.3, margin: '0 auto 8px', display: 'block' }} />
                <p style={{ fontSize: 12 }}>Aucun canal</p>
              </div>
            ) : filteredTopics.map(t => (
              <ChannelCard key={t.id} topic={t} isActive={activeTopic?.id === t.id} onClick={() => loadTopic(t.id)} />
            ))}
          </div>
        </div>

        {/* ZONE CHAT — plein écran sur mobile quand actif */}
        <div style={{
          flex: 1, display: mobileView === 'list' && !activeTopic ? 'none' : 'flex',
          flexDirection: 'column',
          background: 'white', borderRadius: 16,
          border: '1px solid rgba(42,42,224,0.08)',
          overflow: 'hidden', minWidth: 0,
          // Sur desktop, toujours visible
          ...(typeof window !== 'undefined' && window.innerWidth >= 768 ? { display: 'flex' } : {}),
        }} className="forum-chat">

          {!activeTopic ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', padding: 24 }}>
                <MessageCircle size={40} color="rgba(42,42,224,0.2)" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: '#9CA3AF' }}>Sélectionnez un canal</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header chat */}
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid rgba(42,42,224,0.07)',
                display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
              }}>
                {/* ✅ Bouton retour mobile */}
                <button
                  onClick={() => { setMobileView('list'); setActiveTopic(null) }}
                  style={{
                    background: 'rgba(42,42,224,0.07)', border: 'none', borderRadius: 8,
                    padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  }}
                  className="forum-back-btn"
                >
                  <ChevronLeft size={16} color="#2A2AE0" />
                </button>

                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: activeTopic.type === 'announcement' ? 'rgba(232,17,45,0.1)' : 'rgba(42,42,224,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {activeTopic.type === 'announcement'
                    ? <Megaphone size={16} color="#E8112D" />
                    : <Hash size={16} color="#2A2AE0" />
                  }
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#0D0D1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {activeTopic.title}
                    </span>
                    {activeTopic.is_pinned && <Pin size={10} color="#F0C040" fill="#F0C040" />}
                    {activeTopic.is_closed && <Lock size={10} color="#9CA3AF" />}
                  </div>
                  <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>
                    {replies.length} message{replies.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Actions comité */}
                {isComite && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handlePin(activeTopic.id)} title={activeTopic.is_pinned ? 'Désépingler' : 'Épingler'} style={iconBtnStyle(activeTopic.is_pinned ? '#F0C040' : '#9CA3AF')}>
                      <Pin size={13} color={activeTopic.is_pinned ? '#F0C040' : '#9CA3AF'} fill={activeTopic.is_pinned ? '#F0C040' : 'none'} />
                    </button>
                    <button onClick={() => handleClose(activeTopic.id)} title={activeTopic.is_closed ? 'Rouvrir' : 'Fermer'} style={iconBtnStyle('#9CA3AF')}>
                      <Lock size={13} color={activeTopic.is_closed ? '#2A2AE0' : '#9CA3AF'} />
                    </button>
                    <button onClick={() => handleDeleteTopic(activeTopic.id)} style={iconBtnStyle('#E8112D', true)}>
                      <Trash2 size={13} color="#E8112D" />
                    </button>
                  </div>
                )}
              </div>

              {/* Description du topic */}
              {activeTopic.content && (
                <div style={{
                  padding: '10px 14px', borderBottom: '1px solid rgba(42,42,224,0.06)',
                  background: activeTopic.type === 'announcement' ? 'rgba(232,17,45,0.02)' : 'rgba(42,42,224,0.02)',
                  display: 'flex', gap: 8, alignItems: 'flex-start', flexShrink: 0,
                }}>
                  <Avatar user={activeTopic.author} size={26} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{activeTopic.author?.name}</span>
                      <RolePill role={activeTopic.author?.role} />
                    </div>
                    <p style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {activeTopic.content}
                    </p>
                  </div>
                </div>
              )}

              {/* Messages — zone scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', minHeight: 0 }}>
                {loadingReplies ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid rgba(42,42,224,0.2)', borderTopColor: '#2A2AE0', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                ) : replies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 32, color: '#9CA3AF' }}>
                    <p style={{ fontSize: 12 }}>Aucun message encore. Soyez le premier !</p>
                  </div>
                ) : replies.map(reply => (
                  <MessageBubble
                    key={reply.id}
                    reply={reply}
                    currentUser={user}
                    isComite={isComite}
                    onReplyTo={r => { setReplyingTo(r); textareaRef.current?.focus() }}
                    onDelete={handleDeleteReply}
                    onMarkOfficial={handleMarkOfficial}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {!activeTopic.is_closed ? (
                <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(42,42,224,0.07)', flexShrink: 0 }}>
                  {replyingTo && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                      padding: '6px 10px', borderRadius: 10,
                      background: 'rgba(42,42,224,0.06)', borderLeft: '3px solid #2A2AE0',
                    }}>
                      <CornerDownRight size={12} color="#2A2AE0" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#2A2AE0' }}>{replyingTo.user?.name}</span>
                        <p style={{ fontSize: 11, color: '#666', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {replyingTo.content}
                        </p>
                      </div>
                      <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={12} color="#9CA3AF" />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <Avatar user={user} size={30} />
                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'flex-end',
                      background: '#F7F7FC', borderRadius: 14,
                      border: '1.5px solid rgba(42,42,224,0.12)', padding: '6px 10px',
                    }}>
                      <textarea
                        ref={textareaRef}
                        value={replyContent}
                        onChange={e => {
                          setReplyContent(e.target.value)
                          e.target.style.height = 'auto'
                          e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Écrire un message... (Entrée pour envoyer)"
                        rows={1}
                        style={{
                          flex: 1, border: 'none', background: 'transparent',
                          fontSize: 13, outline: 'none', resize: 'none',
                          fontFamily: '"DM Sans", sans-serif', lineHeight: 1.5,
                          maxHeight: 100, overflowY: 'auto',
                        }}
                      />
                    </div>
                    <button
                      onClick={handleSendReply}
                      disabled={!replyContent.trim() || sendingReply}
                      style={{
                        width: 38, height: 38, borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: replyContent.trim() ? '#2A2AE0' : 'rgba(42,42,224,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Send size={15} color="white" />
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(42,42,224,0.07)', textAlign: 'center', flexShrink: 0 }}>
                  <Lock size={13} color="#9CA3AF" style={{ display: 'inline', marginRight: 6 }} />
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>Canal fermé aux nouveaux messages</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* ✅ Sur mobile, afficher la liste quand pas de chat actif */}
        {mobileView === 'list' && !activeTopic && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            background: 'white', borderRadius: 16,
            border: '1px solid rgba(42,42,224,0.08)', overflow: 'hidden',
          }} className="forum-mobile-list">
            <div style={{ padding: '12px 12px 8px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadTopics()}
                  placeholder="Rechercher..."
                  style={{
                    width: '100%', padding: '8px 10px 8px 30px',
                    border: '1.5px solid rgba(42,42,224,0.1)', borderRadius: 10,
                    fontSize: 13, outline: 'none', background: '#F7F7FC', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {[{ key: 'all', label: 'Tous' }, { key: 'announcement', label: '📢 Annonces' }, { key: 'discussion', label: '💬 Discussions' }].map(f => (
                  <button key={f.key} onClick={() => setFilterType(f.key)} style={{
                    flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: filterType === f.key ? '#2A2AE0' : 'rgba(42,42,224,0.06)',
                    color: filterType === f.key ? 'white' : 'rgba(13,13,26,0.5)',
                  }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 8px' }}>
              {filteredTopics.map(t => (
                <ChannelCard key={t.id} topic={t} isActive={false} onClick={() => loadTopic(t.id)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal nouveau topic */}
      {showNewTopic && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0',
        }}>
          <div style={{
            background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 560,
            boxShadow: '0 -10px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(42,42,224,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 900 }}>
                {isComite ? '📢 Nouveau canal / Annonce' : '💬 Nouvelle discussion'}
              </h2>
              <button onClick={() => setShowNewTopic(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#9CA3AF" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} style={{ padding: 20 }}>
              {topicError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, background: 'rgba(232,17,45,0.07)', marginBottom: 12 }}>
                  <AlertCircle size={14} color="#E8112D" />
                  <span style={{ fontSize: 12, color: '#E8112D' }}>{topicError}</span>
                </div>
              )}

              {/* ✅ Sélecteur de type SEULEMENT pour le comité */}
              {isComite && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  {[
                    { value: 'announcement', label: '📢 Annonce officielle', desc: 'Épinglée automatiquement' },
                    { value: 'discussion', label: '💬 Discussion ouverte', desc: 'Ouvert à tous' },
                  ].map(t => (
                    <label key={t.value} style={{
                      flex: 1, cursor: 'pointer', borderRadius: 12, padding: 12,
                      border: `2px solid ${newTopic.type === t.value ? '#2A2AE0' : 'rgba(42,42,224,0.12)'}`,
                      background: newTopic.type === t.value ? 'rgba(42,42,224,0.06)' : 'transparent',
                    }}>
                      <input type="radio" name="type" value={t.value} checked={newTopic.type === t.value}
                        onChange={e => setNewTopic(n => ({ ...n, type: e.target.value }))} style={{ display: 'none' }} />
                      <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>{t.label}</p>
                      <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>{t.desc}</p>
                    </label>
                  ))}
                </div>
              )}

              {/* ✅ Pour les candidats : badge informatif */}
              {!isComite && (
                <div style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(42,42,224,0.06)', marginBottom: 12, fontSize: 12, color: '#2A2AE0', fontWeight: 600 }}>
                  💬 Vous pouvez créer des discussions. Seul le comité peut publier des annonces officielles.
                </div>
              )}

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 6 }}>Titre *</label>
                <input
                  type="text" required minLength={5}
                  value={newTopic.title}
                  onChange={e => setNewTopic(n => ({ ...n, title: e.target.value }))}
                  placeholder="Titre de la discussion..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid rgba(42,42,224,0.12)', fontSize: 13, outline: 'none', background: '#F7F7FC', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 6 }}>Message *</label>
                <textarea
                  required minLength={10} rows={4}
                  value={newTopic.content}
                  onChange={e => setNewTopic(n => ({ ...n, content: e.target.value }))}
                  placeholder="Décrivez votre sujet ou posez votre question..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid rgba(42,42,224,0.12)', fontSize: 13, outline: 'none', background: '#F7F7FC', resize: 'none', boxSizing: 'border-box', fontFamily: '"DM Sans", sans-serif' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={savingTopic} style={{ flex: 1, padding: '11px 0', borderRadius: 12, border: 'none', cursor: 'pointer', background: '#2A2AE0', color: 'white', fontSize: 13, fontWeight: 700, opacity: savingTopic ? 0.6 : 1 }}>
                  {savingTopic ? 'Publication...' : 'Publier'}
                </button>
                <button type="button" onClick={() => setShowNewTopic(false)} style={{ padding: '11px 20px', borderRadius: 12, border: '1.5px solid rgba(42,42,224,0.15)', cursor: 'pointer', background: 'transparent', fontSize: 13, fontWeight: 600, color: '#9CA3AF' }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        
        /* Desktop : sidebar + chat côte à côte */
        @media (min-width: 768px) {
          .forum-mobile-list { display: none !important; }
          .forum-sidebar { display: flex !important; }
          .forum-chat { display: flex !important; }
          .forum-back-btn { display: none !important; }
        }
        
        /* Mobile : plein écran */
        @media (max-width: 767px) {
          .forum-sidebar { display: none !important; }
          .forum-back-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

function iconBtnStyle(color, danger = false) {
  return {
    width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
    background: danger ? 'rgba(232,17,45,0.07)' : 'rgba(42,42,224,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}