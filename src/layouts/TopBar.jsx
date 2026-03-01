import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      {/* Bouton menu mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
      >
        <Menu size={20} />
      </button>

      {/* Titre page (vide pour l'instant, on le remplira dynamiquement) */}
      <div className="hidden lg:block" />

      {/* Actions droite */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:block">
          Bonjour, <strong>{user?.name}</strong>
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut size={16} />
          <span className="hidden sm:block">Déconnexion</span>
        </button>
      </div>
    </header>
  )
}