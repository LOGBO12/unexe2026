import { useRegistrationStatus } from '../../hooks/useRegistrationStatus'
import { Clock, Lock, ChevronRight, AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * RegistrationCountdown
 * ─────────────────────
 * Bloc visuel complet à insérer dans le Hero de la HomePage.
 * Affiche :
 *  - Un compte à rebours animé (jours / heures / minutes / secondes)
 *    si les inscriptions sont ouvertes avec une deadline définie
 *  - Un badge "Inscriptions ouvertes" si ouvertes sans deadline
 *  - Un message de fermeture si les inscriptions sont closes
 */
export default function RegistrationCountdown({ onRegisterClick }) {
  const { isOpen, deadline, formatted, closedMessage, loaded } = useRegistrationStatus()
  const navigate = useNavigate()

  if (!loaded) return null

  // ── Inscriptions fermées ─────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <div
        className="inline-flex flex-col items-center gap-3 px-8 py-5 rounded-3xl border"
        style={{
          background: 'rgba(232,17,45,0.08)',
          borderColor: 'rgba(232,17,45,0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex items-center gap-2">
          <Lock size={16} style={{ color: '#E8112D' }} />
          <span className="text-sm font-black uppercase tracking-wider" style={{ color: '#E8112D' }}>
            Inscriptions fermées
          </span>
        </div>
        {closedMessage && (
          <p className="text-xs text-center max-w-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {closedMessage}
          </p>
        )}
      </div>
    )
  }

  // ── Inscriptions ouvertes SANS deadline ──────────────────────────────────
  if (!deadline) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm"
          style={{
            background: 'rgba(77,200,150,0.15)',
            border: '1px solid rgba(77,200,150,0.3)',
            color: '#4DC896',
          }}
        >
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#4DC896' }} />
            <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: '#4DC896' }} />
          </span>
          Inscriptions ouvertes
        </div>
        <button
          onClick={onRegisterClick || (() => navigate('/register'))}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-white transition-all hover:scale-105"
          style={{ background: '#2A2AE0', boxShadow: '0 6px 24px rgba(42,42,224,0.4)' }}
        >
          S'inscrire <ChevronRight size={14} />
        </button>
      </div>
    )
  }

  // ── Inscriptions ouvertes AVEC compte à rebours ──────────────────────────
  const { days, hours, minutes, seconds } = formatted
  const isUrgent = days === 0 && hours < 2

  const units = [
    { value: days,    label: 'Jours' },
    { value: hours,   label: 'Heures' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Label */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
        style={{
          background: isUrgent ? 'rgba(232,17,45,0.15)' : 'rgba(240,192,64,0.12)',
          border: `1px solid ${isUrgent ? 'rgba(232,17,45,0.3)' : 'rgba(240,192,64,0.25)'}`,
          color: isUrgent ? '#E8112D' : '#F0C040',
        }}
      >
        {isUrgent
          ? <><AlertTriangle size={11} /> Clôture imminente des inscriptions</>
          : <><Clock size={11} /> Les inscriptions ferment dans</>
        }
      </div>

      {/* Blocs chiffres */}
      <div className="flex items-center gap-2 sm:gap-3">
        {units.map((unit, i) => (
          <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
            {/* Bloc */}
            <div className="flex flex-col items-center">
              <div
                className="relative w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  background: isUrgent
                    ? 'rgba(232,17,45,0.12)'
                    : 'rgba(255,255,255,0.08)',
                  border: `1.5px solid ${isUrgent ? 'rgba(232,17,45,0.25)' : 'rgba(255,255,255,0.12)'}`,
                  backdropFilter: 'blur(12px)',
                  minWidth: '56px',
                }}
              >
                {/* Ligne centrale décorative */}
                <div
                  className="absolute left-0 right-0 top-1/2 -translate-y-px h-px"
                  style={{ background: isUrgent ? 'rgba(232,17,45,0.15)' : 'rgba(255,255,255,0.06)' }}
                />
                <span
                  className="relative z-10 text-2xl sm:text-3xl font-black tabular-nums leading-none"
                  style={{
                    color: isUrgent ? '#E8112D' : 'white',
                    fontFamily: '"Playfair Display", serif',
                    textShadow: isUrgent ? '0 0 20px rgba(232,17,45,0.4)' : '0 2px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  {String(unit.value ?? 0).padStart(2, '0')}
                </span>
              </div>
              <span
                className="text-[9px] font-black uppercase tracking-widest mt-1.5"
                style={{ color: isUrgent ? 'rgba(232,17,45,0.6)' : 'rgba(255,255,255,0.3)' }}
              >
                {unit.label}
              </span>
            </div>

            {/* Séparateur : entre les unités (sauf après la dernière) */}
            {i < units.length - 1 && (
              <span
                className="text-xl sm:text-2xl font-black mb-5 tabular-nums"
                style={{ color: isUrgent ? 'rgba(232,17,45,0.4)' : 'rgba(255,255,255,0.2)' }}
              >
                :
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Date exacte de fermeture */}
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Clôture le{' '}
        <span style={{ color: isUrgent ? '#E8112D' : 'rgba(255,255,255,0.55)', fontWeight: 700 }}>
          {new Date(deadline).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </p>

      {/* CTA S'inscrire */}
      <button
        onClick={onRegisterClick || (() => navigate('/register'))}
        className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:scale-105 mt-1"
        style={{ background: '#2A2AE0', boxShadow: '0 8px 30px rgba(42,42,224,0.45)' }}
      >
        S'inscrire maintenant <ChevronRight size={15} />
      </button>
    </div>
  )
}