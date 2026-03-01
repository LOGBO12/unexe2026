import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const spaces = [
    {
      key: 'comite',
      emoji: '🏛️',
      label: 'Espace Comité',
      desc: 'Présentation du projet, vision, objectifs et membres fondateurs.',
      path: '/comite',
      color: '#1a1a2e',
      accent: '#e63946',
      public: true,
    },
    {
      key: 'candidats',
      emoji: '🎓',
      label: 'Espace Candidat',
      desc: 'Découvrez tous les candidats par département et année d\'étude.',
      path: '/candidats',
      color: '#16213e',
      accent: '#f4a261',
      public: true,
    },
    {
      key: 'partenaires',
      emoji: '🤝',
      label: 'Espace Partenaire',
      desc: 'Logos et contributions de nos partenaires officiels.',
      path: '/partenaires',
      color: '#0f3460',
      accent: '#4cc9f0',
      public: true,
    },
    {
      key: 'communaute',
      emoji: '💬',
      label: 'Espace Communautaire',
      desc: 'Forum privé réservé au comité et aux candidats validés.',
      path: user ? '/communaute' : '/login',
      color: '#1b1b2f',
      accent: '#a8dadc',
      public: false,
    },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">

        {/* Fond animé avec grille */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grille subtile */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          {/* Orbes de lumière */}
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, #e63946 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'pulse 6s ease-in-out infinite',
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, #4cc9f0 0%, transparent 70%)',
              filter: 'blur(80px)',
              animation: 'pulse 8s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* Drapeau Bénin */}
        <div
          className="flex h-1.5 w-16 rounded overflow-hidden shadow mb-8 opacity-0"
          style={{
            animation: visible ? 'fadeUp 0.6s ease forwards 0.1s' : 'none',
          }}
        >
          <div className="w-1/3 bg-[#008751]" />
          <div className="flex flex-col w-2/3">
            <div className="flex-1 bg-[#FCD116]" />
            <div className="flex-1 bg-[#E8112D]" />
          </div>
        </div>

        {/* Badge */}
        <div
          className="opacity-0 mb-6"
          style={{ animation: visible ? 'fadeUp 0.6s ease forwards 0.2s' : 'none' }}
        >
          <span
            className="text-xs font-bold tracking-[0.25em] uppercase px-4 py-2 rounded-full border"
            style={{ borderColor: 'rgba(230,57,70,0.5)', color: '#e63946', background: 'rgba(230,57,70,0.08)' }}
          >
            INSTI Lokossa · République du Bénin
          </span>
        </div>

        {/* Titre principal */}
        <div
          className="opacity-0 text-center mb-4"
          style={{ animation: visible ? 'fadeUp 0.7s ease forwards 0.35s' : 'none' }}
        >
          <h1
            className="font-black leading-none tracking-tight"
            style={{
              fontSize: 'clamp(3rem, 10vw, 7rem)',
              fontFamily: '"Georgia", serif',
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            UNEXE
          </h1>
        </div>

        {/* Sous-titre */}
        <div
          className="opacity-0 text-center mb-10"
          style={{ animation: visible ? 'fadeUp 0.7s ease forwards 0.5s' : 'none' }}
        >
          <p
            className="font-light tracking-widest uppercase text-sm md:text-base"
            style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3em' }}
          >
            University Excellence Elite
          </p>
          <p className="mt-3 text-white/40 text-sm max-w-lg mx-auto leading-relaxed">
            Le concours d'excellence académique qui révèle et récompense les meilleurs étudiants de l'INSTI Lokossa.
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="opacity-0 flex flex-col sm:flex-row gap-4 justify-center items-center"
          style={{ animation: visible ? 'fadeUp 0.7s ease forwards 0.65s' : 'none' }}
        >
          <button
            onClick={() => navigate('/comite')}
            className="px-8 py-3.5 font-semibold text-sm rounded-full transition-all duration-300 hover:scale-105"
            style={{
              background: '#e63946',
              color: 'white',
              boxShadow: '0 0 30px rgba(230,57,70,0.4)',
            }}
          >
            Découvrir le projet →
          </button>
          {!user && (
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3.5 font-semibold text-sm rounded-full border transition-all duration-300 hover:scale-105"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              Se connecter
            </button>
          )}
          {user && (
            <button
              onClick={() => navigate(user.role === 'candidat' ? '/espace-candidat' : '/dashboard')}
              className="px-8 py-3.5 font-semibold text-sm rounded-full border transition-all duration-300 hover:scale-105"
              style={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              Mon espace →
            </button>
          )}
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
          style={{ animation: visible ? 'fadeUp 0.7s ease forwards 0.9s' : 'none' }}
        >
          <div className="flex flex-col items-center gap-2 text-white/30">
            <span className="text-xs tracking-widest uppercase">Explorer</span>
            <div
              className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent"
              style={{ animation: 'scrollPulse 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </section>

      {/* ── LES 4 ESPACES ── */}
      <section className="relative px-4 py-20 max-w-6xl mx-auto">
        <div
          className="text-center mb-16 opacity-0"
          style={{ animation: visible ? 'fadeUp 0.7s ease forwards 0.2s' : 'none' }}
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ fontFamily: '"Georgia", serif' }}
          >
            Quatre espaces,
            <span style={{ color: '#e63946' }}> une vision</span>
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Un écosystème complet pour vivre le concours UNEXE
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {spaces.map((space, i) => (
            <button
              key={space.key}
              onClick={() => navigate(space.path)}
              className="group text-left rounded-2xl p-6 transition-all duration-400 hover:scale-[1.03] opacity-0"
              style={{
                background: `linear-gradient(135deg, ${space.color} 0%, rgba(13,13,26,0.9) 100%)`,
                border: `1px solid rgba(255,255,255,0.07)`,
                animation: visible ? `fadeUp 0.6s ease forwards ${0.3 + i * 0.1}s` : 'none',
                boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = space.accent + '60'
                e.currentTarget.style.boxShadow = `0 8px 40px rgba(0,0,0,0.4), 0 0 30px ${space.accent}20`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3)'
              }}
            >
              {/* Emoji */}
              <div className="text-3xl mb-4 transition-transform duration-300 group-hover:scale-110">
                {space.emoji}
              </div>

              {/* Badge public/privé */}
              <div className="mb-3">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: space.public ? 'rgba(76,201,240,0.1)' : 'rgba(230,57,70,0.1)',
                    color: space.public ? '#4cc9f0' : '#e63946',
                  }}
                >
                  {space.public ? 'Public' : 'Privé'}
                </span>
              </div>

              <h3 className="font-bold text-white text-base mb-2 leading-tight">
                {space.label}
              </h3>
              <p className="text-white/40 text-xs leading-relaxed">
                {space.desc}
              </p>

              {/* Flèche */}
              <div
                className="mt-5 flex items-center gap-2 text-xs font-semibold transition-all duration-300 group-hover:gap-3"
                style={{ color: space.accent }}
              >
                Accéder
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── STATS / CHIFFRES ── */}
      <section
        className="px-4 py-16 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '5', label: 'Départements', suffix: '' },
            { value: '2', label: 'Niveaux d\'étude', suffix: '' },
            { value: '3', label: 'Phases du concours', suffix: '' },
            { value: '1', label: 'Champion par édition', suffix: 'er' },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div
                className="font-black text-5xl md:text-6xl"
                style={{
                  fontFamily: '"Georgia", serif',
                  background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.4))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {stat.value}<span className="text-2xl">{stat.suffix}</span>
              </div>
              <p className="text-white/40 text-xs tracking-wider uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER MINI ── */}
      <footer
        className="px-4 py-10 text-center border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex justify-center mb-4">
          <div className="flex h-1.5 w-12 rounded overflow-hidden">
            <div className="w-1/3 bg-[#008751]" />
            <div className="flex flex-col w-2/3">
              <div className="flex-1 bg-[#FCD116]" />
              <div className="flex-1 bg-[#E8112D]" />
            </div>
          </div>
        </div>
        <p className="text-white/20 text-xs tracking-widest uppercase">
          © {new Date().getFullYear()} UNEXE — University Excellence Elite · INSTI Lokossa
        </p>
        <p className="text-white/10 text-xs mt-1">Fraternité · Justice · Travail</p>
      </footer>

      {/* ── ANIMATIONS CSS ── */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }

        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(1); }
          50% { opacity: 0.6; transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  )
}