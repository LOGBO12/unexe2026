import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import navigation from '../config/navigation'

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()

  // Filtrer les liens selon le rôle de l'utilisateur
  const links = navigation.filter(item => item.roles.includes(user?.role))

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#1a1a2e] text-white z-30
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-wide">🎓 UNEXE</h1>
          <p className="text-xs text-white/40 mt-0.5">INSTI Lokossa</p>
        </div>

        {/* Rôle badge */}
        <div className="px-6 py-3 border-b border-white/10">
          <span className={`
            text-xs font-semibold px-2 py-1 rounded-full
            ${user?.role === 'super_admin' ? 'bg-red-600/30 text-red-300' : ''}
            ${user?.role === 'comite' ? 'bg-blue-600/30 text-blue-300' : ''}
            ${user?.role === 'candidat' ? 'bg-green-600/30 text-green-300' : ''}
          `}>
            {user?.role === 'super_admin' && '⚡ Super Admin'}
            {user?.role === 'comite' && '🛡️ Comité'}
            {user?.role === 'candidat' && '🏆 Candidat'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {links.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard' || item.path === '/espace-candidat'}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${isActive
                      ? 'bg-red-600 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>

                {/* Séparateur */}
                {item.dividerAfter && (
                  <div className="my-2 border-t border-white/10" />
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer sidebar : infos user */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}