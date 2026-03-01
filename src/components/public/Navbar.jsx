import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { label: 'Espace Comité',    path: '/comite' },
  { label: 'Espace Candidat',  path: '/candidats' },
  { label: 'Partenaires',      path: '/partenaires' },
  { label: 'Communauté',       path: '/communaute' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-[#1a1a2e] text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wide">🎓 UNEXE</span>
          <span className="hidden sm:block text-xs text-white/40 border-l border-white/20 pl-2">
            INSTI Lokossa
          </span>
        </NavLink>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-red-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Bouton connexion / espace perso */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <button
              onClick={() => navigate(user.role === 'candidat' ? '/espace-candidat' : '/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Mon espace →
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
            >
              <LogIn size={16} />
              Connexion
            </button>
          )}
        </div>

        {/* Burger mobile */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1 bg-[#1a1a2e]">
          {links.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition
                ${isActive ? 'bg-red-600 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-white/10">
            {user ? (
              <button
                onClick={() => { navigate(user.role === 'candidat' ? '/espace-candidat' : '/dashboard'); setMenuOpen(false) }}
                className="w-full px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg"
              >
                Mon espace →
              </button>
            ) : (
              <button
                onClick={() => { navigate('/login'); setMenuOpen(false) }}
                className="w-full px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}