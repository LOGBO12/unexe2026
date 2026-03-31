import { useState, useEffect } from 'react'
import api from '../../api/axios'
import {
  Clock, Calendar, ToggleLeft, ToggleRight,
  Save, Trash2, CheckCircle, AlertCircle,
  Lock, Unlock, Info, Eye
} from 'lucide-react'

// ─── Bloc chiffre compte à rebours ───────────────────────────────────────────
function CountUnit({ value, label }) {
  return (
    <div className="text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black tabular-nums mx-auto mb-1"
        style={{ background: 'rgba(42,42,224,0.1)', color: '#2A2AE0', fontFamily: '"Playfair Display", serif' }}
      >
        {String(value ?? 0).padStart(2, '0')}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    </div>
  )
}

// ─── Preview compte à rebours live ───────────────────────────────────────────
function CountdownPreview({ deadline }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  if (!deadline) return null

  const target  = new Date(deadline).getTime()
  const diffSec = Math.max(0, Math.floor((target - now) / 1000))

  const d = Math.floor(diffSec / 86400)
  const h = Math.floor((diffSec % 86400) / 3600)
  const m = Math.floor((diffSec % 3600) / 60)
  const s = diffSec % 60

  const isExpired = diffSec <= 0
  const isUrgent  = !isExpired && d === 0 && h < 2

  return (
    <div
      className="mt-4 p-5 rounded-2xl border"
      style={{
        background:   isExpired ? 'rgba(232,17,45,0.04)'  : isUrgent ? 'rgba(240,192,64,0.06)'  : 'rgba(42,42,224,0.04)',
        borderColor:  isExpired ? 'rgba(232,17,45,0.2)'   : isUrgent ? 'rgba(240,192,64,0.25)'  : 'rgba(42,42,224,0.12)',
      }}
    >
      <p className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2"
        style={{ color: isExpired ? '#E8112D' : isUrgent ? '#b45309' : '#2A2AE0' }}>
        <Eye size={13} />
        {isExpired ? '🔒 Délai expiré' : isUrgent ? '⚠️ Clôture imminente' : 'Prévisualisation temps réel'}
      </p>

      {isExpired ? (
        <p className="text-sm text-gray-500 text-center">
          Cette date est déjà passée — les inscriptions seraient immédiatement fermées.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-center gap-4">
            <CountUnit value={d} label="Jours" />
            <span className="text-2xl font-black text-gray-300 mb-4">:</span>
            <CountUnit value={h} label="Heures" />
            <span className="text-2xl font-black text-gray-300 mb-4">:</span>
            <CountUnit value={m} label="Min" />
            <span className="text-2xl font-black text-gray-300 mb-4">:</span>
            <CountUnit value={s} label="Sec" />
          </div>
          <p className="text-center text-xs mt-3 text-gray-400">
            Clôture le{' '}
            <strong className="text-gray-700">
              {new Date(deadline).toLocaleDateString('fr-FR', {
                weekday: 'long', day: '2-digit', month: 'long',
                year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </strong>
          </p>
        </>
      )}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function RegistrationSettingsPage() {
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(null)
  const [error, setError]       = useState(null)
  const [dbState, setDbState]   = useState(null)   // état réel en DB

  // Formulaire local
  const [regOpen, setRegOpen]         = useState(true)
  const [deadlineInput, setDeadline]  = useState('')   // format datetime-local YYYY-MM-DDTHH:mm
  const [closedMsg, setClosedMsg]     = useState('')

  // ── Helpers flash ─────────────────────────────────────────────────────────
  const flash = (type, msg) => {
    if (type === 'success') { setSuccess(msg); setError(null) }
    else                    { setError(msg);   setSuccess(null) }
    setTimeout(() => { setSuccess(null); setError(null) }, 5000)
  }

  // ── Convertir ISO → datetime-local ────────────────────────────────────────
  const isoToLocal = (iso) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      // Format : YYYY-MM-DDTHH:mm (requis par <input type="datetime-local">)
      const pad = n => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    } catch { return '' }
  }

  // ── Charger les settings ──────────────────────────────────────────────────
  useEffect(() => {
    api.get('/admin/registration-settings')
      .then(res => {
        const data = res.data
        setDbState(data)
        setRegOpen(data.registration_open ?? true)
        setDeadline(isoToLocal(data.registration_deadline))
        setClosedMsg(data.closed_message || '')
      })
      .catch(() => flash('error', 'Impossible de charger les paramètres.'))
      .finally(() => setLoading(false))
  }, [])

  // ── Sauvegarder ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)

    // Construire le payload
    const payload = {
      registration_open: regOpen,
      closed_message:    closedMsg || null,
      // Envoyer null explicitement si vide, sinon convertir en ISO
      registration_deadline: deadlineInput
        ? new Date(deadlineInput).toISOString()
        : null,
    }

    console.log('[RegistrationSettings] Payload envoyé :', payload)

    try {
      const res = await api.put('/admin/registration-settings', payload)
      console.log('[RegistrationSettings] Réponse serveur :', res.data)

      // Mettre à jour l'état DB affiché
      setDbState(res.data.data)
      // Re-synchroniser le champ date avec ce que le serveur a retourné
      setDeadline(isoToLocal(res.data.data?.registration_deadline))

      flash('success', 'Paramètres sauvegardés ! Compte à rebours actif sur l\'accueil.')
    } catch (err) {
      console.error('[RegistrationSettings] Erreur :', err.response?.data)
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(' — ')
        : err.response?.data?.message || 'Erreur lors de la sauvegarde.'
      flash('error', msg)
    } finally {
      setSaving(false)
    }
  }

  // ── Supprimer la deadline ─────────────────────────────────────────────────
  const handleClearDeadline = async () => {
    if (!window.confirm('Supprimer la deadline ? Les inscriptions n\'auront plus de limite de temps.')) return
    try {
      await api.delete('/admin/registration-settings/deadline')
      setDeadline('')
      setDbState(s => s ? { ...s, registration_deadline: null } : s)
      flash('success', 'Deadline supprimée.')
    } catch {
      flash('error', 'Erreur lors de la suppression.')
    }
  }

  // ── Statut actuel calculé ─────────────────────────────────────────────────
  const isCurrentlyOpen = dbState
    ? dbState.registration_open &&
      (!dbState.registration_deadline || new Date(dbState.registration_deadline) > new Date())
    : true

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#2A2AE0', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{ color: '#0D0D1A', fontFamily: '"Playfair Display", serif' }}>
            Gestion des inscriptions
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Contrôlez quand les candidats peuvent s'inscrire sur la plateforme.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
          style={{
            background: isCurrentlyOpen ? 'rgba(77,200,150,0.12)' : 'rgba(232,17,45,0.1)',
            color: isCurrentlyOpen ? '#4DC896' : '#E8112D',
          }}
        >
          {isCurrentlyOpen ? <Unlock size={14} /> : <Lock size={14} />}
          {isCurrentlyOpen ? 'Ouvertes' : 'Fermées'}
        </div>
      </div>

      {/* Alertes */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(77,200,150,0.08)', border: '1px solid rgba(77,200,150,0.3)' }}>
          <CheckCircle size={16} style={{ color: '#4DC896' }} />
          <span className="text-sm font-semibold" style={{ color: '#4DC896' }}>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'rgba(232,17,45,0.07)', border: '1px solid rgba(232,17,45,0.2)' }}>
          <AlertCircle size={16} style={{ color: '#E8112D' }} />
          <span className="text-sm font-semibold" style={{ color: '#E8112D' }}>{error}</span>
        </div>
      )}

      {/* Carte principale */}
      <div className="bg-white rounded-3xl border p-6 md:p-8 space-y-7"
        style={{ borderColor: 'rgba(42,42,224,0.07)', boxShadow: '0 2px 16px rgba(42,42,224,0.05)' }}>

        {/* ── Toggle ouvert / fermé ──────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
            Statut des inscriptions
          </label>
          <button
            type="button"
            onClick={() => setRegOpen(v => !v)}
            className="w-full flex items-center justify-between p-4 rounded-2xl border transition-all"
            style={{
              borderColor: regOpen ? 'rgba(77,200,150,0.25)' : 'rgba(232,17,45,0.2)',
              background:  regOpen ? 'rgba(77,200,150,0.05)' : 'rgba(232,17,45,0.04)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: regOpen ? 'rgba(77,200,150,0.12)' : 'rgba(232,17,45,0.08)' }}>
                {regOpen
                  ? <Unlock size={18} style={{ color: '#4DC896' }} />
                  : <Lock   size={18} style={{ color: '#E8112D' }} />
                }
              </div>
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: '#0D0D1A' }}>
                  {regOpen ? 'Inscriptions ouvertes' : 'Inscriptions fermées manuellement'}
                </p>
                <p className="text-xs text-gray-400">
                  {regOpen ? 'Les candidats peuvent s\'inscrire' : 'Personne ne peut s\'inscrire'}
                </p>
              </div>
            </div>
            {regOpen
              ? <ToggleRight size={40} style={{ color: '#4DC896' }} />
              : <ToggleLeft  size={40} style={{ color: '#9CA3AF' }} />
            }
          </button>
        </div>

        {/* ── Deadline ──────────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
            Date et heure de clôture automatique
          </label>
          <p className="text-xs text-gray-400 mb-3 leading-relaxed">
            Quand cette date/heure est atteinte, les inscriptions se ferment automatiquement.
            Le compte à rebours s'affichera sur la page d'accueil.
          </p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <input
                type="datetime-local"
                value={deadlineInput}
                onChange={e => setDeadline(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white"
                style={{ colorScheme: 'light' }}
              />
            </div>
            {deadlineInput && (
              <button
                type="button"
                onClick={handleClearDeadline}
                className="px-3 py-3 rounded-xl border text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                style={{ borderColor: 'rgba(42,42,224,0.12)' }}
                title="Supprimer la deadline"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Valeur ISO qui sera envoyée — pour debug */}
          {deadlineInput && (
            <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
              <Clock size={10} />
              Valeur envoyée au serveur :{' '}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                {new Date(deadlineInput).toISOString()}
              </code>
            </p>
          )}

          {/* Preview */}
          {deadlineInput && <CountdownPreview deadline={deadlineInput} />}

          {!deadlineInput && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(42,42,224,0.04)', border: '1px solid rgba(42,42,224,0.08)' }}>
              <Info size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-400">
                Aucune deadline — les inscriptions resteront ouvertes jusqu'à fermeture manuelle.
              </p>
            </div>
          )}
        </div>

        {/* ── Message fermé ──────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
            Message affiché quand les inscriptions sont fermées
          </label>
          <textarea
            value={closedMsg}
            onChange={e => setClosedMsg(e.target.value)}
            rows={2}
            maxLength={255}
            placeholder="Les inscriptions pour cette édition sont désormais clôturées."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2A2AE0] focus:border-transparent transition bg-gray-50 hover:bg-white resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{closedMsg.length}/255</p>
        </div>

        {/* ── Note info ──────────────────────────────────────────────────── */}
        <div className="p-4 rounded-2xl flex items-start gap-3"
          style={{ background: 'rgba(240,192,64,0.05)', border: '1px solid rgba(240,192,64,0.2)' }}>
          <Info size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <ul className="text-xs text-yellow-700/80 space-y-1">
            <li>• Le compte à rebours s'affiche dans le <strong>hero de l'accueil</strong> dès que vous sauvegardez.</li>
            <li>• Le bouton "S'inscrire" se grise automatiquement à l'expiration.</li>
            <li>• Les comptes déjà créés ne sont pas affectés.</li>
          </ul>
        </div>

        {/* ── Bouton sauvegarder ─────────────────────────────────────────── */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white rounded-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#2A2AE0', boxShadow: '0 6px 20px rgba(42,42,224,0.3)' }}
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sauvegarde...</>
            ) : (
              <><Save size={15} /> Sauvegarder les paramètres</>
            )}
          </button>
        </div>
      </div>

      {/* ── État actuel en base ────────────────────────────────────────────── */}
      {dbState && (
        <div className="bg-white rounded-2xl border p-5"
          style={{ borderColor: 'rgba(42,42,224,0.07)' }}>
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
            <Eye size={12} />
            État actuellement en base de données
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(42,42,224,0.06)' }}>
              <span className="text-gray-500 text-xs font-semibold">Inscriptions</span>
              <span className={`font-bold text-sm ${isCurrentlyOpen ? 'text-green-600' : 'text-red-600'}`}>
                {isCurrentlyOpen ? '✓ Ouvertes' : '✗ Fermées'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(42,42,224,0.06)' }}>
              <span className="text-gray-500 text-xs font-semibold">Toggle manuel</span>
              <span className="font-semibold text-sm" style={{ color: '#0D0D1A' }}>
                {dbState.registration_open ? 'Activé' : 'Désactivé'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500 text-xs font-semibold">Deadline en DB</span>
              <span className="font-semibold text-sm" style={{ color: dbState.registration_deadline ? '#2A2AE0' : '#9CA3AF' }}>
                {dbState.registration_deadline
                  ? new Date(dbState.registration_deadline).toLocaleString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })
                  : 'Aucune deadline enregistrée'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}