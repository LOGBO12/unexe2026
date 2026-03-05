import { useRegistrationStatus } from '../../hooks/useRegistrationStatus'

/**
 * CountdownBadge
 * ──────────────
 * Badge compact qui affiche :
 *  - le compte à rebours si inscriptions ouvertes + deadline définie
 *  - "Inscriptions ouvertes" si ouvertes sans deadline
 *  - "Inscriptions fermées" si fermées
 *
 * Props :
 *  - variant : 'light' (fond sombre, texte clair) | 'dark' (fond clair, texte sombre)
 *  - size    : 'sm' | 'md'
 */
export default function CountdownBadge({ variant = 'light', size = 'sm' }) {
  const { isOpen, deadline, formatted, loaded } = useRegistrationStatus()

  if (!loaded) return null

  const hasCountdown = isOpen && deadline && formatted.label

  // Couleurs selon variant
  const colors = variant === 'light'
    ? {
        open:  { bg: 'rgba(77,200,150,0.15)',  border: 'rgba(77,200,150,0.3)',  text: '#4DC896', dot: '#4DC896' },
        timer: { bg: 'rgba(240,192,64,0.15)',  border: 'rgba(240,192,64,0.3)',  text: '#F0C040', dot: '#F0C040' },
        closed:{ bg: 'rgba(232,17,45,0.15)',   border: 'rgba(232,17,45,0.3)',   text: '#E8112D', dot: '#E8112D' },
      }
    : {
        open:  { bg: 'rgba(77,200,150,0.1)',   border: 'rgba(77,200,150,0.25)', text: '#059669', dot: '#059669' },
        timer: { bg: 'rgba(240,192,64,0.1)',   border: 'rgba(240,192,64,0.25)', text: '#b45309', dot: '#F0C040' },
        closed:{ bg: 'rgba(232,17,45,0.08)',   border: 'rgba(232,17,45,0.2)',   text: '#dc2626', dot: '#dc2626' },
      }

  const c = !isOpen ? colors.closed : hasCountdown ? colors.timer : colors.open

  const textSize = size === 'sm' ? '10px' : '12px'
  const padding  = size === 'sm' ? '4px 10px' : '6px 14px'

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider whitespace-nowrap"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: textSize,
        padding,
        letterSpacing: '0.08em',
      }}
    >
      {/* Point animé */}
      <span
        className="relative flex-shrink-0"
        style={{ width: 6, height: 6 }}
      >
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: c.dot, opacity: 0.5, animationDuration: '1.5s' }}
        />
        <span
          className="relative block w-full h-full rounded-full"
          style={{ background: c.dot }}
        />
      </span>

      {/* Texte */}
      {!isOpen
        ? 'Inscriptions fermées'
        : hasCountdown
        ? `Ferme dans ${formatted.label}`
        : 'Inscriptions ouvertes'
      }
    </div>
  )
}