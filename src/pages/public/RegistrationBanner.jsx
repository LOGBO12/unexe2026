import { useState } from 'react'
import { useRegistrationStatus } from '../../hooks/useRegistrationStatus'
import { useNavigate } from 'react-router-dom'
import { Clock, Lock, X, ChevronRight, AlertTriangle } from 'lucide-react'

/**
 * RegistrationBanner
 * ──────────────────
 * Bannière collante affichée SOUS la navbar (top: 80px).
 * Visible uniquement si :
 *  - les inscriptions sont ouvertes avec une deadline (urgence)
 *  - OU les inscriptions viennent de se fermer
 *
 * Usage dans HomePage :
 *   <RegistrationBanner />
 *   (à placer juste après <Navbar /> ou en premier dans le body)
 */
export default function RegistrationBanner() {
  const { isOpen, deadline, formatted, closedMessage, loaded, secondsLeft } = useRegistrationStatus()
  const navigate = useNavigate()
  const [dismissed, setDismissed] = useState(false)

  // Ne rien afficher si :
  // - pas encore chargé
  // - l'utilisateur a fermé la bannière
  // - inscriptions ouvertes SANS deadline (pas d'urgence à signaler)
  if (!loaded || dismissed) return null
  if (isOpen && !deadline) return null

  const isUrgent  = isOpen && deadline && formatted.days === 0 && formatted.hours < 24
  const isClosed  = !isOpen

  // Uniquement afficher si urgent ou fermé
  if (!isUrgent && !isClosed) return null

  return (
    <div
      className="sticky top-0 z-40 w-full flex items-center justify-between px-4 sm:px-6 py-3 gap-4"
      style={{
        background: isClosed
          ? 'rgba(232,17,45,0.95)'
          : isUrgent
          ? 'rgba(180,83,9,0.95)'
          : 'rgba(42,42,224,0.95)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        {/* Icône */}
        {isClosed
          ? <Lock size={15} className="text-white flex-shrink-0" />
          : <AlertTriangle size={15} className="text-white flex-shrink-0" />
        }

        {/* Texte */}
        <span className="text-white text-sm font-bold">
          {isClosed
            ? closedMessage || 'Les inscriptions sont désormais fermées.'
            : `Les inscriptions ferment dans ${formatted.label} !`
          }
        </span>

        {/* Date exacte si ouvert */}
        {isOpen && deadline && (
          <span className="text-white/60 text-xs hidden sm:inline">
            · Clôture le {new Date(deadline).toLocaleDateString('fr-FR', {
              day: '2-digit', month: 'long', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* CTA si encore ouvert */}
        {isOpen && (
          <button
            onClick={() => navigate('/register')}
            className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            S'inscrire <ChevronRight size={12} />
          </button>
        )}

        {/* Fermer la bannière */}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-white/60 hover:text-white transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}