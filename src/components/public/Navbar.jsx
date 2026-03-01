import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navLinks = [
  { label: 'Le Comité',     href: '#comite' },
  { label: 'Nos Candidats', href: '#candidats' },
  { label: 'Partenaires',   href: '#partenaires' },
  { label: 'À propos',      href: '#about' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (href) => {
    setMenuOpen(false)
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      else {
        navigate('/')
        setTimeout(() => {
          const target = document.querySelector(href)
          if (target) target.scrollIntoView({ behavior: 'smooth' })
        }, 300)
      }
    } else {
      navigate(href)
    }
  }

  const isLight = scrolled

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
        style={{
          background: scrolled
            ? 'rgba(255,255,255,0.97)'
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(42,42,224,0.1)' : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 24px rgba(42,42,224,0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo avec image téléchargée */}
          <button
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className="flex items-center gap-3 group"
          >
            {/* Remplace "logo-unexe.png" par le nom réel de ton fichier */}
            <img 
              src="/unexe-logo.jpeg" 
              alt="UNEXE Logo" 
              className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
              style={{
                filter: !scrolled ? 'brightness(0) invert(1)' : 'none', // Rend le logo blanc si fond transparent
              }}
            />
            <div className="flex flex-col items-start">
              <span
                className="font-black tracking-[0.18em] text-lg leading-none transition-colors"
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  color: scrolled ? '#0D0D1A' : '#FFFFFF',
                }}
              >
                UNEXE
              </span>
              <span
                className="text-[9px] tracking-[0.15em] uppercase font-semibold leading-none mt-0.5 transition-colors"
                style={{ color: scrolled ? 'rgba(13,13,26,0.4)' : 'rgba(255,255,255,0.45)' }}
              >
                INSTI Lokossa
              </span>
            </div>
          </button>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => handleNav(link.href)}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 hover:bg-blue-50"
                style={{
                  color: scrolled ? 'rgba(13,13,26,0.65)' : 'rgba(255,255,255,0.75)',
                  letterSpacing: '0.02em',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = scrolled ? '#2A2AE0' : '#FFFFFF'
                  e.currentTarget.style.background = scrolled ? 'rgba(42,42,224,0.07)' : 'rgba(255,255,255,0.1)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = scrolled ? 'rgba(13,13,26,0.65)' : 'rgba(255,255,255,0.75)'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* CTA desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate(user.role === 'candidat' ? '/espace-candidat' : '/dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:scale-105"
                style={{ background: '#2A2AE0', boxShadow: '0 4px 16px rgba(42,42,224,0.35)' }}
              >
                Mon espace
                <ChevronRight size={14} />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200"
                  style={{
                    color: scrolled ? '#2A2AE0' : 'rgba(255,255,255,0.85)',
                    border: scrolled ? '1.5px solid rgba(42,42,224,0.25)' : '1.5px solid rgba(255,255,255,0.25)',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = scrolled ? 'rgba(42,42,224,0.06)' : 'rgba(255,255,255,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  Se connecter
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-200 hover:scale-105"
                  style={{ background: '#2A2AE0', boxShadow: '0 4px 16px rgba(42,42,224,0.35)' }}
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className="md:hidden p-2.5 rounded-xl transition-all duration-200"
            style={{
              color: scrolled ? '#0D0D1A' : '#FFFFFF',
              background: scrolled ? 'rgba(42,42,224,0.06)' : 'rgba(255,255,255,0.1)',
            }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Menu mobile */}
      {menuOpen && (
        <div
          className="fixed top-20 left-0 right-0 z-40 px-4 py-4 space-y-1"
          style={{
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(42,42,224,0.12)',
            boxShadow: '0 20px 60px rgba(42,42,224,0.1)',
          }}
        >
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={() => handleNav(link.href)}
              className="flex items-center w-full px-4 py-3.5 text-sm font-semibold rounded-xl transition-all duration-200"
              style={{ color: 'rgba(13,13,26,0.7)' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(42,42,224,0.07)'
                e.currentTarget.style.color = '#2A2AE0'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(13,13,26,0.7)'
              }}
            >
              {link.label}
            </button>
          ))}
          <div className="pt-3 mt-2 border-t flex flex-col gap-2.5" style={{ borderColor: 'rgba(42,42,224,0.1)' }}>
            {user ? (
              <button
                onClick={() => { navigate(user.role === 'candidat' ? '/espace-candidat' : '/dashboard'); setMenuOpen(false) }}
                className="w-full py-3.5 text-sm font-bold text-white rounded-xl"
                style={{ background: '#2A2AE0' }}
              >
                Mon espace →
              </button>
            ) : (
              <>
                <button
                  onClick={() => { navigate('/login'); setMenuOpen(false) }}
                  className="w-full py-3.5 text-sm font-semibold rounded-xl border"
                  style={{ color: '#2A2AE0', borderColor: 'rgba(42,42,224,0.25)' }}
                >
                  Se connecter
                </button>
                <button
                  onClick={() => { navigate('/register'); setMenuOpen(false) }}
                  className="w-full py-3.5 text-sm font-bold text-white rounded-xl"
                  style={{ background: '#2A2AE0' }}
                >
                  S'inscrire
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}