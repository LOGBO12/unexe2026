import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Navbar from '../../components/public/Navbar'
import Footer from '../../components/public/Footer'
import {
  Search, GraduationCap, Users, BookOpen,
  Trophy, Crown, ChevronRight, TrendingUp, Zap, X, Star
} from 'lucide-react'

// ─── Config départements ──────────────────────────────────────────────────────
const DEPT_CONFIG = {
  GEI: { label: 'Génie Électrique et Informatique', color: '#2A2AE0', bg: 'rgba(42,42,224,0.08)' },
  GC:  { label: 'Génie Civil',                      color: '#008751', bg: 'rgba(0,135,81,0.08)'   },
  GMP: { label: 'Génie Mécanique et Production',    color: '#D97706', bg: 'rgba(217,119,6,0.08)'  },
  GE:  { label: 'Génie Énergétique',                color: '#E8112D', bg: 'rgba(232,17,45,0.08)'  },
  MS:  { label: 'Maintenance de Systèmes',           color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
}

function getDeptConfig(candidate) {
  if (candidate.department_slug && DEPT_CONFIG[candidate.department_slug])
    return DEPT_CONFIG[candidate.department_slug]
  const found = Object.values(DEPT_CONFIG).find(d =>
    d.label.toLowerCase() === candidate.department?.toLowerCase()
  )
  return found || { label: candidate.department || 'Département', color: '#2A2AE0', bg: 'rgba(42,42,224,0.08)' }
}

// ─── Statuts de décision (même config que MesResultats) ──────────────────────
const STATUS_CONFIG = {
  pending:    { label: 'En attente',  color: '#F0C040', bg: 'rgba(240,192,64,0.1)',  icon: null         },
  continuing: { label: 'Qualifié ✓', color: '#4DC896', bg: 'rgba(77,200,150,0.1)',  icon: ChevronRight },
  eliminated: { label: 'Éliminé',    color: '#E8112D', bg: 'rgba(232,17,45,0.1)',   icon: X            },
  leader:     { label: 'Leader 🏆',  color: '#F0C040', bg: 'rgba(240,192,64,0.15)', icon: Crown        },
}

function DecisionBadge({ status, sm = false }) {
  const cfg  = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span
      className={`inline-flex items-center gap-1 font-black rounded-full ${sm ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {Icon && <Icon size={sm ? 8 : 9} />}
      {cfg.label}
    </span>
  )
}

// ─── Barre de score (identique à MesResultats) ────────────────────────────────
function ScoreBar({ score, large = false }) {
  if (score === null || score === undefined) return null
  const pct   = Math.min(100, (parseFloat(score) / 20) * 100)
  const color = score >= 14 ? '#4DC896' : score >= 10 ? '#F0C040' : '#E8112D'
  return (
    <div>
      <div className="flex items-baseline gap-1 mb-1">
        <span
          className={`font-black tabular-nums leading-none ${large ? 'text-2xl' : 'text-xl'}`}
          style={{ color, fontFamily: '"Playfair Display", serif' }}
        >
          {score}
        </span>
        <span className="text-xs font-normal text-gray-400">/20</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ─── Ligne d'une phase dans le panneau déroulant ──────────────────────────────
// phase_scores vient de l'API : { phase_number, phase_name, score, status, is_final, phase_status }
function PhaseRow({ ps }) {
  const cfg        = STATUS_CONFIG[ps.status] || STATUS_CONFIG.pending
  const scoreColor = ps.score !== null
    ? ps.score >= 14 ? '#4DC896' : ps.score >= 10 ? '#F0C040' : '#E8112D'
    : null

  return (
    <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      {/* Numéro */}
      <span
        className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
        style={{ background: ps.is_final ? '#F0C040' : '#2A2AE0' }}
      >
        {ps.is_final ? '🏆' : ps.phase_number}
      </span>

      {/* Nom phase */}
      <span className="flex-1 text-[10px] text-gray-500 truncate">{ps.phase_name}</span>

      {/* Score + décision */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {ps.score !== null ? (
          <span className="text-xs font-black tabular-nums" style={{ color: scoreColor }}>
            {ps.score}/20
          </span>
        ) : ps.phase_status === 'active' ? (
          <span className="text-[9px] text-gray-400 italic">Phase en cours</span>
        ) : null}
        {ps.status && ps.status !== 'pending' && <DecisionBadge status={ps.status} sm />}
      </div>
    </div>
  )
}

// ─── Carte Candidat ───────────────────────────────────────────────────────────
function CandidateCard({ candidate, hasCompetition }) {
  const [showPhases, setShowPhases] = useState(false)

  const dept       = getDeptConfig(candidate)
  const slug       = candidate.department_slug || ''
  const isLeader   = candidate.is_leader
  // phase_scores : [{ phase_number, phase_name, score, status, is_final, phase_status }]
  const phaseScores = Array.isArray(candidate.phase_scores) ? candidate.phase_scores : []

  // Dernier score publié (phases completed uniquement, car l'API masque les scores actifs)
  const withScore  = phaseScores.filter(ps => ps.score !== null)
  const lastScore  = withScore[withScore.length - 1] ?? null

  // Statut global : dernier statut connu du candidat
  const lastEntry    = phaseScores[phaseScores.length - 1] ?? null
  const globalStatus = isLeader ? 'leader' : lastEntry?.status ?? null

  const borderColor = isLeader ? 'rgba(240,192,64,0.55)' : 'rgba(42,42,224,0.08)'
  const shadowBase  = isLeader ? '0 8px 32px rgba(240,192,64,0.18)' : '0 2px 16px rgba(42,42,224,0.05)'

  return (
    <div
      className="group bg-white rounded-3xl overflow-hidden border flex flex-col transition-all duration-300"
      style={{ borderColor, boxShadow: shadowBase }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = isLeader ? 'rgba(240,192,64,0.85)' : dept.color + '45'
        e.currentTarget.style.boxShadow   = isLeader ? '0 20px 48px rgba(240,192,64,0.22)' : `0 20px 48px ${dept.color}18`
        e.currentTarget.style.transform   = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = borderColor
        e.currentTarget.style.boxShadow   = shadowBase
        e.currentTarget.style.transform   = 'translateY(0)'
      }}
    >
      {/* Bandeau champion */}
      {isLeader && (
        <div
          className="flex items-center justify-center gap-2 py-1.5 text-[10px] font-black uppercase tracking-widest"
          style={{ background: 'linear-gradient(90deg,#D97706,#F59E0B,#D97706)', color: '#1C0A00' }}
        >
          <Crown size={10} /> Champion UNEXE <Crown size={10} />
        </div>
      )}

      {/* Photo */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ height: '190px', background: isLeader ? 'linear-gradient(135deg,#FEF3C7,#FDE68A)' : dept.bg }}
      >
        {candidate.photo_url ? (
          <img
            src={candidate.photo_url} alt={candidate.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-7xl font-black opacity-20"
              style={{ fontFamily: '"Playfair Display",serif', color: isLeader ? '#92400E' : dept.color }}
            >
              {candidate.name?.charAt(0)}
            </span>
          </div>
        )}

        {/* Badge département */}
        <div
          className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
          style={{ background: isLeader ? '#92400E' : dept.color, color: isLeader ? '#FDE68A' : 'white' }}
        >
          {slug || candidate.department_slug || 'INSTI'}
        </div>

        {/* Badge année */}
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-semibold"
          style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
        >
          {candidate.year === '1' ? '1ère' : '2ème'} année
        </div>

        {/* Badge phase actuelle */}
        {hasCompetition && !isLeader && (candidate.current_phase || 1) > 1 && (
          <div
            className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1"
            style={{ background: 'rgba(42,42,224,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}
          >
            <Trophy size={9} /> Phase {candidate.current_phase}
          </div>
        )}

        {/* Score flottant (dernier score connu) */}
        {lastScore && (
          <div
            className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(8px)',
              color: lastScore.score >= 14 ? '#4DC896' : lastScore.score >= 10 ? '#F0C040' : '#E8112D',
            }}
          >
            {lastScore.score}/20
          </div>
        )}
      </div>

      {/* Corps */}
      <div className="p-4 flex flex-col flex-1">

        {/* Nom */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="font-bold text-base leading-tight flex-1"
            style={{ color: '#0D0D1A', fontFamily: '"Playfair Display",serif' }}
          >
            {candidate.name}
          </h3>
          {isLeader && <Crown size={14} style={{ color: '#D97706', flexShrink: 0 }} fill="#D97706" />}
        </div>

        <p className="text-xs font-semibold mb-1" style={{ color: isLeader ? '#D97706' : dept.color }}>
          {dept.label}
        </p>

        {candidate.filiere && (
          <p className="text-xs text-gray-400 mb-1 font-medium">{candidate.filiere}</p>
        )}

        {candidate.bio && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: 'rgba(13,13,26,0.45)' }}>
            {candidate.bio}
          </p>
        )}

        {/* ── Bloc compétition (si phases disponibles) ── */}
        {hasCompetition && phaseScores.length > 0 && (
          <div className="mt-auto pt-2 space-y-2">

            {/* Encadré résultat principal */}
            <div
              className="rounded-xl p-3"
              style={{
                background: isLeader ? 'rgba(240,192,64,0.06)' : 'rgba(42,42,224,0.03)',
                border: `1px solid ${isLeader ? 'rgba(240,192,64,0.2)' : 'rgba(42,42,224,0.08)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Résultat concours
                </span>
                {globalStatus && <DecisionBadge status={globalStatus} sm />}
              </div>

              {lastScore
                ? <ScoreBar score={lastScore.score} />
                : <p className="text-xs text-gray-400 italic">Notes non encore publiées</p>
              }
            </div>

            {/* Bouton détail phases */}
            <button
              onClick={e => { e.stopPropagation(); setShowPhases(v => !v) }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
              style={{
                background: showPhases ? 'rgba(42,42,224,0.07)' : 'rgba(42,42,224,0.03)',
                color: '#2A2AE0',
                border: '1px solid rgba(42,42,224,0.1)',
              }}
            >
              <span className="flex items-center gap-1.5">
                <TrendingUp size={9} />
                {phaseScores.length} phase{phaseScores.length > 1 ? 's' : ''}
              </span>
              <ChevronRight
                size={10}
                style={{ transform: showPhases ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}
              />
            </button>

            {/* Détail déroulant */}
            {showPhases && (
              <div className="px-1 pt-1">
                {phaseScores.map((ps, i) => <PhaseRow key={i} ps={ps} />)}
              </div>
            )}
          </div>
        )}

        {/* Footer sans compétition */}
        {(!hasCompetition || phaseScores.length === 0) && (
          <div
            className="mt-auto flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid rgba(42,42,224,0.07)' }}
          >
            <div className="flex items-center gap-1.5">
              <GraduationCap size={12} style={{ color: dept.color }} />
              <span className="text-[10px] font-medium" style={{ color: 'rgba(13,13,26,0.4)' }}>INSTI Lokossa</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={11} style={{ color: '#F0C040' }} fill="#F0C040" />
              <span className="text-[10px] font-bold" style={{ color: '#F0C040' }}>Validé</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border animate-pulse" style={{ borderColor: 'rgba(42,42,224,0.06)' }}>
      <div className="h-48 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-9 bg-gray-100 rounded-xl w-full mt-3" />
      </div>
    </div>
  )
}

// ─── Bannière Champions ───────────────────────────────────────────────────────
function LeaderBanner({ leaders }) {
  if (!leaders || leaders.length === 0) return null
  return (
    <div
      className="mb-10 rounded-3xl overflow-hidden relative"
      style={{ background: 'linear-gradient(135deg,#0D0D2B,#1a1a4e,#0D0D2B)', border: '1px solid rgba(240,192,64,0.35)' }}
    >
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%,#F0C040,transparent 60%)' }} />
      <div className="relative z-10 px-8 py-7">
        <div className="flex items-center gap-3 mb-5">
          <Trophy size={22} style={{ color: '#F0C040' }} />
          <h3 className="font-black text-lg text-white" style={{ fontFamily: '"Playfair Display",serif' }}>
            Leader{leaders.length > 1 ? 's' : ''} UNEXE
          </h3>
        </div>
        <div className="flex flex-wrap gap-6">
          {leaders.map(l => (
            <div key={l.id} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2" style={{ borderColor: '#F0C040' }}>
                {l.photo_url
                  ? <img src={l.photo_url} alt={l.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl font-black"
                      style={{ background: '#F0C040', color: '#1C0A00' }}>{l.name?.charAt(0)}</div>
                }
              </div>
              <div>
                <p className="font-black text-white" style={{ fontFamily: '"Playfair Display",serif' }}>{l.name}</p>
                <p className="text-xs font-semibold" style={{ color: '#F0C040' }}>
                  {l.department} · {l.year === '1' ? '1ère' : '2ème'} année
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Timeline des phases ──────────────────────────────────────────────────────
// phases vient de l'API : [{ id, phase_number, name, status, is_final }]
function PhasesTimeline({ phases }) {
  if (!phases || phases.length === 0) return null
  const CLR = { pending: '#9CA3AF', active: '#4DC896', completed: '#2A2AE0' }
  return (
    <div
      className="mb-8 p-4 rounded-2xl border flex flex-wrap items-center gap-2"
      style={{ background: 'rgba(42,42,224,0.02)', borderColor: 'rgba(42,42,224,0.08)' }}
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mr-1">
        <TrendingUp size={10} /> Concours
      </span>
      {phases.map((p, i) => {
        const c = CLR[p.status] || '#9CA3AF'
        return (
          <div key={p.id} className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: `${c}12`, color: c, border: `1px solid ${c}30` }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
              {p.is_final ? '🏆 ' : ''}{p.name}
              {p.status === 'active' && (
                <span className="ml-1 px-1 py-0.5 rounded text-[8px] font-black"
                  style={{ background: 'rgba(77,200,150,0.15)', color: '#4DC896' }}>
                  EN COURS
                </span>
              )}
              {p.status === 'completed' && (
                <span className="ml-1 px-1 py-0.5 rounded text-[8px] font-black"
                  style={{ background: 'rgba(42,42,224,0.12)', color: '#2A2AE0' }}>
                  TERMINÉE
                </span>
              )}
            </div>
            {i < phases.length - 1 && (
              <ChevronRight size={11} style={{ color: 'rgba(42,42,224,0.2)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Tag({ children, light = false }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] px-3.5 py-1.5 rounded-full mb-5"
      style={
        light
          ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)' }
          : { background: 'rgba(42,42,224,0.09)', color: '#2A2AE0', border: '1px solid rgba(42,42,224,0.2)' }
      }
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: light ? 'rgba(255,255,255,0.7)' : '#2A2AE0' }} />
      {children}
    </span>
  )
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────────────────────
export default function CandidatsPublicPage() {
  // Structure API :
  //   res.data.candidates  → objet groupé { "Nom département": [candidat, ...] }
  //   res.data.phases      → [{ id, phase_number, name, status, is_final }]
  //   res.data.has_competition → bool
  //   Chaque candidat : { id, name, photo_url, department, department_slug, year,
  //                       filiere, bio, is_leader, current_phase,
  //                       phase_scores: [{ phase_number, phase_name, score, status, is_final, phase_status }] }

  const [grouped, setGrouped]               = useState({})
  const [allList, setAllList]               = useState([])
  const [phases, setPhases]                 = useState([])
  const [hasCompetition, setHasCompetition] = useState(false)
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(false)
  const [search, setSearch]                 = useState('')
  const [activeDept, setActiveDept]         = useState('TOUS')
  const [activeYear, setActiveYear]         = useState('TOUS')
  const [activePhase, setActivePhase]       = useState('TOUS')

  useEffect(() => {
    window.scrollTo(0, 0)
    api.get('/public/candidates')
      .then(res => {
        const groupedData = res.data.candidates || {}
        setGrouped(groupedData)
        setAllList(Object.values(groupedData).flat())
        setPhases(res.data.phases || [])
        setHasCompetition(Boolean(res.data.has_competition))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const leaders        = allList.filter(c => c.is_leader)
  const highestPhase   = allList.length ? Math.max(...allList.map(c => c.current_phase || 1)) : 1
  const availableDepts = Object.keys(grouped)
  const activePhaseObj = phases.find(p => p.status === 'active')

  // ─── Filtrage ──────────────────────────────────────────────────────────────
  const filtered = allList.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase())
    const matchDept   = activeDept === 'TOUS'
      || c.department_slug === activeDept
      || c.department === activeDept
    const matchYear   = activeYear === 'TOUS' || String(c.year) === activeYear
    const matchPhase  = activePhase === 'TOUS' || String(c.current_phase) === activePhase
    return matchSearch && matchDept && matchYear && matchPhase
  })

  // Leaders en premier, puis par phase décroissante
  const sorted = [...filtered].sort((a, b) => {
    if (a.is_leader && !b.is_leader) return -1
    if (!a.is_leader && b.is_leader) return 1
    return (b.current_phase || 1) - (a.current_phase || 1)
  })

  const filteredGrouped = sorted.reduce((acc, c) => {
    const key = c.department || 'Autre'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  const resetFilters = () => {
    setSearch(''); setActiveDept('TOUS'); setActiveYear('TOUS'); setActivePhase('TOUS')
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F7FC', fontFamily: '"DM Sans","Segoe UI",sans-serif' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden pt-32 pb-20 px-6"
        style={{ background: 'linear-gradient(135deg,#08081A 0%,#0D0D2B 55%,#1A1A6A 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='92' viewBox='0 0 80 92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,3 77,23 77,69 40,89 3,69 3,23' fill='none' stroke='%232A2AE0' stroke-width='1.5'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 92px',
        }} />
        <div className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle,#2A2AE0 0%,transparent 70%)', filter: 'blur(100px)' }} />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Tag light>Nos Candidats</Tag>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: '"Playfair Display",Georgia,serif' }}
          >
            Les talents de<br />
            <span style={{ color: '#A5A5FF' }}>l'INSTI Lokossa</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl leading-relaxed mb-8">
            Candidats actifs · notes et classement en temps réel.
          </p>

          <div className="flex flex-wrap gap-6">
            {[
              { icon: Users,    val: allList.length || '—',                            label: 'Candidats actifs'    },
              { icon: BookOpen, val: availableDepts.length || '—',                     label: 'Départements'        },
              { icon: Trophy,   val: hasCompetition ? `Phase ${highestPhase}` : '—',   label: 'Phase max atteinte'  },
              ...(activePhaseObj ? [{ icon: Zap, val: 'En cours', label: activePhaseObj.name }] : []),
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(42,42,224,0.25)', color: '#A5A5FF' }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-white font-black text-xl leading-none">{s.val}</p>
                    <p className="text-white/35 text-xs">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FILTRES ── */}
      <section
        className="sticky top-20 z-30 px-6 py-4 border-b"
        style={{ background: 'rgba(247,247,252,0.97)', backdropFilter: 'blur(16px)', borderColor: 'rgba(42,42,224,0.1)' }}
      >
        <div className="max-w-6xl mx-auto space-y-3">

          {/* Recherche */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(42,42,224,0.4)' }} />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un candidat..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm font-medium outline-none"
              style={{ background: '#FFF', border: '1.5px solid rgba(42,42,224,0.12)', color: '#0D0D1A' }}
              onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(42,42,224,0.12)'}
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">

            {/* Département */}
            <div className="flex flex-wrap gap-1.5">
              {['TOUS', ...availableDepts].map(d => {
                const s   = d === 'TOUS' ? null
                  : (Object.entries(DEPT_CONFIG).find(([, v]) => v.label.toLowerCase() === d.toLowerCase())?.[0] || d)
                const conf = s && DEPT_CONFIG[s] ? DEPT_CONFIG[s] : { color: '#2A2AE0' }
                const isA  = activeDept === d
                return (
                  <button key={d}
                    onClick={() => setActiveDept(isA && d !== 'TOUS' ? 'TOUS' : d)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: isA ? (d === 'TOUS' ? '#2A2AE0' : conf.color) : 'rgba(42,42,224,0.05)',
                      color:      isA ? '#FFF' : 'rgba(13,13,26,0.55)',
                      border:     `1.5px solid ${isA ? (d === 'TOUS' ? '#2A2AE0' : conf.color) : 'rgba(42,42,224,0.1)'}`,
                    }}
                  >
                    {d === 'TOUS' ? 'Tous' : (s || d)}
                  </button>
                )
              })}
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Année */}
            <div className="flex gap-1.5">
              {[{ val: 'TOUS', label: 'Toutes' }, { val: '1', label: '1ère A.' }, { val: '2', label: '2ème A.' }].map(y => (
                <button key={y.val} onClick={() => setActiveYear(y.val)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: activeYear === y.val ? '#0D0D1A' : 'rgba(42,42,224,0.05)',
                    color:      activeYear === y.val ? '#FFF' : 'rgba(13,13,26,0.55)',
                    border:     `1.5px solid ${activeYear === y.val ? '#0D0D1A' : 'rgba(42,42,224,0.1)'}`,
                  }}
                >
                  {y.label}
                </button>
              ))}
            </div>

            {/* Phase — affiché seulement s'il y a plusieurs phases */}
            {hasCompetition && phases.length > 1 && (
              <>
                <div className="w-px h-5 bg-gray-200" />
                <div className="flex gap-1.5">
                  {['TOUS', ...phases.map(p => String(p.phase_number))].map(pf => (
                    <button key={pf} onClick={() => setActivePhase(pf)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: activePhase === pf ? '#2A2AE0' : 'rgba(42,42,224,0.05)',
                        color:      activePhase === pf ? '#FFF' : 'rgba(13,13,26,0.55)',
                        border:     `1.5px solid ${activePhase === pf ? '#2A2AE0' : 'rgba(42,42,224,0.1)'}`,
                      }}
                    >
                      {pf === 'TOUS' ? 'Toutes phases' : `Phase ${pf}`}
                    </button>
                  ))}
                </div>
              </>
            )}

            <p className="ml-auto text-xs font-semibold" style={{ color: 'rgba(13,13,26,0.35)' }}>
              {filtered.length} candidat{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTENU ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">

        {loading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-lg font-bold" style={{ color: '#0D0D1A' }}>Impossible de charger les candidats</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <LeaderBanner leaders={leaders} />
            <PhasesTimeline phases={phases} />

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-5"
                  style={{ background: 'rgba(42,42,224,0.07)' }}>
                  <Search size={32} style={{ color: '#2A2AE0' }} />
                </div>
                <p className="text-lg font-bold mb-1" style={{ color: '#0D0D1A' }}>
                  {allList.length === 0 ? 'Aucun candidat pour le moment' : 'Aucun résultat'}
                </p>
                <p className="text-sm mb-4" style={{ color: 'rgba(13,13,26,0.4)' }}>
                  {allList.length === 0
                    ? 'Les candidatures sont en cours de traitement.'
                    : 'Modifiez vos filtres pour voir plus de résultats.'}
                </p>
                {(search || activeDept !== 'TOUS' || activeYear !== 'TOUS' || activePhase !== 'TOUS') && (
                  <button onClick={resetFilters}
                    className="px-5 py-2.5 text-sm font-bold text-white rounded-xl"
                    style={{ background: '#2A2AE0' }}>
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-14">
                {Object.entries(filteredGrouped).map(([deptName, candidates]) => {
                  const s    = Object.entries(DEPT_CONFIG)
                    .find(([, v]) => v.label.toLowerCase() === deptName.toLowerCase())?.[0] || ''
                  const conf = DEPT_CONFIG[s] || { color: '#2A2AE0' }
                  return (
                    <div key={deptName}>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="h-8 w-1.5 rounded-full" style={{ background: conf.color }} />
                        <div>
                          <span className="font-black text-xl"
                            style={{ fontFamily: '"Playfair Display",serif', color: conf.color }}>
                            {s || deptName}
                          </span>
                          <span className="text-sm ml-3 font-medium" style={{ color: 'rgba(13,13,26,0.4)' }}>
                            {deptName} · {candidates.length} candidat{candidates.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {candidates.map(c => (
                          <CandidateCard key={c.id} candidate={c} hasCompetition={hasCompetition} />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}