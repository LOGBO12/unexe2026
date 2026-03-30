import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Navbar from '../../components/public/Navbar'
import Footer from '../../components/public/Footer'
import {
  Search, GraduationCap, Users, BookOpen,
  Trophy, Crown, ChevronRight, TrendingUp, Zap, X, Star,
  Eye, Download, Maximize2, X as XIcon, MapPin, Award,
  Calendar, Mail, Phone, Linkedin, Github, ExternalLink
} from 'lucide-react'

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

// Modal pour agrandir la photo
function PhotoModal({ isOpen, onClose, photoUrl, candidateName }) {
  if (!isOpen) return null

  const handleDownload = async () => {
    try {
      const response = await fetch(photoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${candidateName.replace(/\s+/g, '_')}_photo.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full max-h-[90vh] rounded-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Boutons de contrôle */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={handleDownload}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
            title="Télécharger"
          >
            <Download size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm"
            title="Fermer"
          >
            <XIcon size={20} />
          </button>
        </div>
        
        {/* Image */}
        <img
          src={photoUrl}
          alt={candidateName}
          className="w-full h-full object-contain"
        />
        
        {/* Nom du candidat */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white text-2xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
            {candidateName}
          </p>
        </div>
      </div>
    </div>
  )
}

// Modal des détails du candidat
function CandidateDetailsModal({ isOpen, onClose, candidate, hasCompetition }) {
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  
  if (!isOpen || !candidate) return null

  const dept = getDeptConfig(candidate)
  const phaseScores = Array.isArray(candidate.phase_scores) ? candidate.phase_scores : []
  const lastScore = phaseScores.filter(ps => ps.score !== null).pop() || null

  return (
    <>
      <div 
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <div 
          className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
          style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
        >
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <XIcon size={20} />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Colonne gauche - Photo */}
            <div className="md:w-2/5 relative">
              <div 
                className="h-64 md:h-full min-h-[300px] relative group cursor-pointer"
                onClick={() => setShowPhotoModal(true)}
              >
                {candidate.photo_url ? (
                  <>
                    <img
                      src={candidate.photo_url}
                      alt={candidate.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-center">
                        <Maximize2 size={32} className="mx-auto mb-2" />
                        <span className="text-sm font-medium">Cliquer pour agrandir</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: dept.bg }}>
                    <span className="text-8xl font-black opacity-30" style={{ color: dept.color }}>
                      {candidate.name?.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* Badges sur la photo */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                    style={{ background: dept.color, color: 'white' }}
                  >
                    {candidate.department_slug || 'INSTI'}
                  </span>
                  {candidate.is_leader && (
                    <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                      style={{ background: '#F0C040', color: '#1C0A00' }}>
                      <Crown size={12} className="inline mr-1" />
                      Champion
                    </span>
                  )}
                </div>
                
                <span
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
                >
                  {candidate.year === '1' ? '1ère' : '2ème'} année
                </span>
              </div>
            </div>

            {/* Colonne droite - Informations */}
            <div className="md:w-3/5 p-6 md:p-8">
              <div className="space-y-6">
                {/* Nom et titre */}
                <div>
                  <h2 className="text-3xl font-black mb-2" style={{ fontFamily: '"Playfair Display", serif', color: '#0D0D1A' }}>
                    {candidate.name}
                  </h2>
                  <p className="text-lg font-semibold" style={{ color: dept.color }}>
                    {dept.label}
                  </p>
                  {candidate.filiere && (
                    <p className="text-sm text-gray-500 mt-1">{candidate.filiere}</p>
                  )}
                </div>

                {/* Bio */}
                {candidate.bio && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">À propos</h3>
                    <p className="text-gray-600 leading-relaxed">{candidate.bio}</p>
                  </div>
                )}

                {/* Scores compétition */}
                {hasCompetition && phaseScores.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Performance</h3>
                    <div className="space-y-3">
                      {lastScore && (
                        <div className="p-4 rounded-xl" style={{ background: dept.bg }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Dernier score</span>
                            <DecisionBadge status={candidate.is_leader ? 'leader' : phaseScores[phaseScores.length - 1]?.status} />
                          </div>
                          <ScoreBar score={lastScore.score} large />
                        </div>
                      )}
                      
                      {/* Phases détaillées */}
                      <div className="space-y-2">
                        {phaseScores.map((ps, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.02)' }}>
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-white"
                                style={{ background: ps.is_final ? '#F0C040' : dept.color }}>
                                {ps.is_final ? '🏆' : ps.phase_number}
                              </span>
                              <span className="text-sm font-medium">{ps.phase_name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {ps.score !== null && (
                                <span className="font-bold" style={{ color: ps.score >= 14 ? '#4DC896' : ps.score >= 10 ? '#F0C040' : '#E8112D' }}>
                                  {ps.score}/20
                                </span>
                              )}
                              {ps.status && ps.status !== 'pending' && (
                                <DecisionBadge status={ps.status} sm />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Coordonnées (si disponibles) */}
                {(candidate.email || candidate.phone) && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Contact</h3>
                    <div className="space-y-2">
                      {candidate.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail size={16} className="text-gray-400" />
                          <a href={`mailto:${candidate.email}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                            {candidate.email}
                          </a>
                        </div>
                      )}
                      {candidate.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={16} className="text-gray-400" />
                          <a href={`tel:${candidate.phone}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                            {candidate.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Réseaux sociaux */}
                {(candidate.linkedin || candidate.github) && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Réseaux</h3>
                    <div className="flex gap-3">
                      {candidate.linkedin && (
                        <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                          <Linkedin size={18} className="text-gray-600" />
                        </a>
                      )}
                      {candidate.github && (
                        <a href={candidate.github} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                          <Github size={18} className="text-gray-600" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal photo agrandie */}
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        photoUrl={candidate.photo_url}
        candidateName={candidate.name}
      />
    </>
  )
}

function CandidateCard({ candidate, hasCompetition, onViewDetails }) {
  const [showPhases, setShowPhases] = useState(false)

  const dept       = getDeptConfig(candidate)
  const slug       = candidate.department_slug || ''
  const isLeader   = candidate.is_leader
  const phaseScores = Array.isArray(candidate.phase_scores) ? candidate.phase_scores : []

  const withScore  = phaseScores.filter(ps => ps.score !== null)
  const lastScore  = withScore[withScore.length - 1] ?? null

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

      {/* Photo - Plus grande */}
      <div
        className="relative overflow-hidden flex-shrink-0 cursor-pointer"
        style={{ height: '240px', background: isLeader ? 'linear-gradient(135deg,#FEF3C7,#FDE68A)' : dept.bg }}
        onClick={() => onViewDetails(candidate)}
      >
        {candidate.photo_url ? (
          <img
            src={candidate.photo_url} alt={candidate.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-8xl font-black opacity-20"
              style={{ fontFamily: '"Playfair Display",serif', color: isLeader ? '#92400E' : dept.color }}
            >
              {candidate.name?.charAt(0)}
            </span>
          </div>
        )}

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-center">
            <Eye size={24} className="mx-auto mb-2" />
            <span className="text-sm font-medium">Voir les détails</span>
          </div>
        </div>

        {/* Badge département */}
        <div
          className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
          style={{ background: isLeader ? '#92400E' : dept.color, color: isLeader ? '#FDE68A' : 'white' }}
        >
          {slug || candidate.department_slug || 'INSTI'}
        </div>

        {/* Badge année */}
        <div
          className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
        >
          {candidate.year === '1' ? '1ère' : '2ème'} année
        </div>

        {/* Badge phase actuelle */}
        {hasCompetition && !isLeader && (candidate.current_phase || 1) > 1 && (
          <div
            className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1"
            style={{ background: 'rgba(42,42,224,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}
          >
            <Trophy size={12} /> Phase {candidate.current_phase}
          </div>
        )}

        {/* Score flottant */}
        {lastScore && (
          <div
            className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-xs font-black"
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

      {/* Corps - Plus d'espace */}
      <div className="p-5 flex flex-col flex-1">

        {/* Nom */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="font-bold text-lg leading-tight flex-1"
            style={{ color: '#0D0D1A', fontFamily: '"Playfair Display",serif' }}
          >
            {candidate.name}
          </h3>
          {isLeader && <Crown size={16} style={{ color: '#D97706' }} fill="#D97706" />}
        </div>

        <p className="text-sm font-semibold mb-2" style={{ color: isLeader ? '#D97706' : dept.color }}>
          {dept.label}
        </p>

        {candidate.filiere && (
          <p className="text-xs text-gray-400 mb-2 font-medium">{candidate.filiere}</p>
        )}

        {candidate.bio && (
          <p className="text-sm leading-relaxed line-clamp-2 mb-3" style={{ color: 'rgba(13,13,26,0.45)' }}>
            {candidate.bio}
          </p>
        )}

        {/* ── Bloc compétition ── */}
        {hasCompetition && phaseScores.length > 0 && (
          <div className="mt-auto pt-3 space-y-3">
            {/* Encadré résultat principal */}
            <div
              className="rounded-xl p-4"
              style={{
                background: isLeader ? 'rgba(240,192,64,0.06)' : 'rgba(42,42,224,0.03)',
                border: `1px solid ${isLeader ? 'rgba(240,192,64,0.2)' : 'rgba(42,42,224,0.08)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Résultat concours
                </span>
                {globalStatus && <DecisionBadge status={globalStatus} />}
              </div>

              {lastScore
                ? <ScoreBar score={lastScore.score} />
                : <p className="text-sm text-gray-400 italic">Notes non encore publiées</p>
              }
            </div>

            {/* Boutons actions */}
            <div className="flex gap-2">
              <button
                onClick={e => { e.stopPropagation(); setShowPhases(v => !v) }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: showPhases ? 'rgba(42,42,224,0.07)' : 'rgba(42,42,224,0.03)',
                  color: '#2A2AE0',
                  border: '1px solid rgba(42,42,224,0.1)',
                }}
              >
                <TrendingUp size={12} />
                {phaseScores.length} phase{phaseScores.length > 1 ? 's' : ''}
              </button>
              
              <button
                onClick={() => onViewDetails(candidate)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: '#2A2AE0',
                  color: 'white',
                }}
              >
                Détails
              </button>
            </div>

            {/* Détail déroulant */}
            {showPhases && (
              <div className="px-1 pt-2 space-y-1">
                {phaseScores.map((ps, i) => <PhaseRow key={i} ps={ps} />)}
              </div>
            )}
          </div>
        )}

        {/* Footer sans compétition */}
        {(!hasCompetition || phaseScores.length === 0) && (
          <div
            className="mt-auto flex items-center justify-between pt-4"
            style={{ borderTop: '1px solid rgba(42,42,224,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <GraduationCap size={14} style={{ color: dept.color }} />
              <span className="text-xs font-medium" style={{ color: 'rgba(13,13,26,0.4)' }}>INSTI Lokossa</span>
            </div>
            <button
              onClick={() => onViewDetails(candidate)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: '#2A2AE0' }}
            >
              Voir profil
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PhaseRow({ ps }) {
  const cfg        = STATUS_CONFIG[ps.status] || STATUS_CONFIG.pending
  const scoreColor = ps.score !== null
    ? ps.score >= 14 ? '#4DC896' : ps.score >= 10 ? '#F0C040' : '#E8112D'
    : null

  return (
    <div className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
      {/* Numéro */}
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black text-white flex-shrink-0"
        style={{ background: ps.is_final ? '#F0C040' : '#2A2AE0' }}
      >
        {ps.is_final ? '🏆' : ps.phase_number}
      </span>

      {/* Nom phase */}
      <span className="flex-1 text-xs text-gray-500 truncate">{ps.phase_name}</span>

      {/* Score + décision */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {ps.score !== null ? (
          <span className="text-sm font-black tabular-nums" style={{ color: scoreColor }}>
            {ps.score}/20
          </span>
        ) : ps.phase_status === 'active' ? (
          <span className="text-xs text-gray-400 italic">En cours</span>
        ) : null}
        {ps.status && ps.status !== 'pending' && <DecisionBadge status={ps.status} sm />}
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border animate-pulse" style={{ borderColor: 'rgba(42,42,224,0.06)' }}>
      <div className="h-60 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-gray-100 rounded-lg w-3/4" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-10 bg-gray-100 rounded-xl w-full mt-3" />
      </div>
    </div>
  )
}

function LeaderBanner({ leaders, onViewDetails }) {
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
            <div 
              key={l.id} 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => onViewDetails(l)}
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 group-hover:scale-105 transition-transform" style={{ borderColor: '#F0C040' }}>
                {l.photo_url
                  ? <img src={l.photo_url} alt={l.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-xl font-black"
                      style={{ background: '#F0C040', color: '#1C0A00' }}>{l.name?.charAt(0)}</div>
                }
              </div>
              <div>
                <p className="font-black text-white group-hover:text-[#F0C040] transition-colors" style={{ fontFamily: '"Playfair Display",serif' }}>{l.name}</p>
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

function PhasesTimeline({ phases }) {
  if (!phases || phases.length === 0) return null
  const CLR = { pending: '#9CA3AF', active: '#4DC896', completed: '#2A2AE0' }
  return (
    <div
      className="mb-8 p-5 rounded-2xl border flex flex-wrap items-center gap-2"
      style={{ background: 'rgba(42,42,224,0.02)', borderColor: 'rgba(42,42,224,0.08)' }}
    >
      <span className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mr-2">
        <TrendingUp size={12} /> Concours
      </span>
      {phases.map((p, i) => {
        const c = CLR[p.status] || '#9CA3AF'
        return (
          <div key={p.id} className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: `${c}12`, color: c, border: `1px solid ${c}30` }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />
              {p.is_final ? '🏆 ' : ''}{p.name}
              {p.status === 'active' && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-black"
                  style={{ background: 'rgba(77,200,150,0.15)', color: '#4DC896' }}>
                  EN COURS
                </span>
              )}
              {p.status === 'completed' && (
                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-black"
                  style={{ background: 'rgba(42,42,224,0.12)', color: '#2A2AE0' }}>
                  TERMINÉE
                </span>
              )}
            </div>
            {i < phases.length - 1 && (
              <ChevronRight size={12} style={{ color: 'rgba(42,42,224,0.2)' }} />
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
      className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.22em] px-4 py-2 rounded-full mb-5"
      style={
        light
          ? { background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.2)' }
          : { background: 'rgba(42,42,224,0.09)', color: '#2A2AE0', border: '1px solid rgba(42,42,224,0.2)' }
      }
    >
      <span className="w-2 h-2 rounded-full" style={{ background: light ? 'rgba(255,255,255,0.7)' : '#2A2AE0' }} />
      {children}
    </span>
  )
}

export default function CandidatsPublicPage() {
  const [grouped, setGrouped] = useState({})
  const [allList, setAllList] = useState([])
  const [phases, setPhases] = useState([])
  const [hasCompetition, setHasCompetition] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [activeDept, setActiveDept] = useState('TOUS')
  const [activeYear, setActiveYear] = useState('TOUS')
  const [activePhase, setActivePhase] = useState('TOUS')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate)
    setIsModalOpen(true)
  }

  const leaders = allList.filter(c => c.is_leader)
  const highestPhase = allList.length ? Math.max(...allList.map(c => c.current_phase || 1)) : 1
  const availableDepts = Object.keys(grouped)
  const activePhaseObj = phases.find(p => p.status === 'active')

  const filtered = allList.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase())
    const matchDept = activeDept === 'TOUS'
      || c.department_slug === activeDept
      || c.department === activeDept
    const matchYear = activeYear === 'TOUS' || String(c.year) === activeYear
    const matchPhase = activePhase === 'TOUS' || String(c.current_phase) === activePhase
    return matchSearch && matchDept && matchYear && matchPhase
  })

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

      {/* HERO */}
      <section
        className="relative overflow-hidden pt-32 pb-20 px-4 sm:px-6"
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
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: '"Playfair Display",Georgia,serif' }}
          >
            Les talents de<br />
            <span style={{ color: '#A5A5FF' }}>l'INSTI Lokossa</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
            Découvrez nos candidats, leurs parcours et leurs performances en temps réel.
          </p>

          <div className="flex flex-wrap gap-4 sm:gap-6">
            {[
              { icon: Users,    val: allList.length || '—',                            label: 'Candidats'    },
              { icon: BookOpen, val: availableDepts.length || '—',                     label: 'Départements' },
              { icon: Trophy,   val: hasCompetition ? `Phase ${highestPhase}` : '—',   label: 'Phase max'  },
              ...(activePhaseObj ? [{ icon: Zap, val: 'En cours', label: activePhaseObj.name }] : []),
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(42,42,224,0.25)', color: '#A5A5FF' }}>
                    <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div>
                    <p className="text-white font-black text-lg sm:text-xl leading-none">{s.val}</p>
                    <p className="text-white/35 text-xs sm:text-sm">{s.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FILTRES */}
      <section
        className="sticky top-20 z-30 px-4 sm:px-6 py-4 border-b"
        style={{ background: 'rgba(247,247,252,0.97)', backdropFilter: 'blur(16px)', borderColor: 'rgba(42,42,224,0.1)' }}
      >
        <div className="max-w-6xl mx-auto space-y-3">

          {/* Recherche */}
          <div className="relative w-full sm:max-w-md">
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

          <div className="flex flex-wrap gap-2 items-center">
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
                    className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
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

            <div className="w-px h-5 bg-gray-200 hidden sm:block" />

            {/* Année */}
            <div className="flex gap-1.5">
              {[{ val: 'TOUS', label: 'Toutes' }, { val: '1', label: '1ère A.' }, { val: '2', label: '2ème A.' }].map(y => (
                <button key={y.val} onClick={() => setActiveYear(y.val)}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
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

            {/* Phase */}
            {hasCompetition && phases.length > 1 && (
              <>
                <div className="w-px h-5 bg-gray-200 hidden sm:block" />
                <div className="flex gap-1.5">
                  {['TOUS', ...phases.map(p => String(p.phase_number))].map(pf => (
                    <button key={pf} onClick={() => setActivePhase(pf)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{
                        background: activePhase === pf ? '#2A2AE0' : 'rgba(42,42,224,0.05)',
                        color:      activePhase === pf ? '#FFF' : 'rgba(13,13,26,0.55)',
                        border:     `1.5px solid ${activePhase === pf ? '#2A2AE0' : 'rgba(42,42,224,0.1)'}`,
                      }}
                    >
                      {pf === 'TOUS' ? 'Toutes' : `P.${pf}`}
                    </button>
                  ))}
                </div>
              </>
            )}

            <p className="ml-auto text-xs font-semibold hidden sm:block" style={{ color: 'rgba(13,13,26,0.35)' }}>
              {filtered.length} candidat{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-16">

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
            <LeaderBanner leaders={leaders} onViewDetails={handleViewDetails} />
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
              <div className="space-y-10 sm:space-y-14">
                {Object.entries(filteredGrouped).map(([deptName, candidates]) => {
                  const s    = Object.entries(DEPT_CONFIG)
                    .find(([, v]) => v.label.toLowerCase() === deptName.toLowerCase())?.[0] || ''
                  const conf = DEPT_CONFIG[s] || { color: '#2A2AE0' }
                  return (
                    <div key={deptName}>
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="h-6 sm:h-8 w-1 sm:w-1.5 rounded-full" style={{ background: conf.color }} />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className="font-black text-lg sm:text-xl"
                            style={{ fontFamily: '"Playfair Display",serif', color: conf.color }}>
                            {s || deptName}
                          </span>
                          <span className="text-xs sm:text-sm font-medium" style={{ color: 'rgba(13,13,26,0.4)' }}>
                            {deptName} · {candidates.length} candidat{candidates.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                        {candidates.map(c => (
                          <CandidateCard 
                            key={c.id} 
                            candidate={c} 
                            hasCompetition={hasCompetition}
                            onViewDetails={handleViewDetails}
                          />
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

      {/* Modals */}
      <CandidateDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        candidate={selectedCandidate}
        hasCompetition={hasCompetition}
      />

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}