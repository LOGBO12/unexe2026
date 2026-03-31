import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import navigation from '../config/navigation'
import { LogOut, ChevronRight, Timer } from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const links    = navigation.filter(item => item.roles.includes(user?.role))
  const photoUrl = user?.avatar 
  ? `https://unexe.alwaysdata.net/api/storage/avatars/${user.avatar.split('/').pop()}` 
  : null

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
  }

  const roleConfig = {
    super_admin: { label: 'Super Admin', color: '#E8112D', bg: 'rgba(232,17,45,0.15)' },
    comite:      { label: 'Comité',      color: '#A5A5FF', bg: 'rgba(165,165,255,0.12)' },
    candidat:    { label: 'Candidat',    color: '#4DC896', bg: 'rgba(77,200,150,0.12)' },
  }
  const role = roleConfig[user?.role] || roleConfig.comite

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(8,8,26,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: '268px',
          background: '#08081A',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* ── Logo ── */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <img
            src="/unexe-logo.jpeg"
            alt="UNEXE"
            className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
            onError={e => {
              e.target.style.display = 'none'
              e.target.parentElement.innerHTML = `
                <div style="width:36px;height:36px;background:linear-gradient(135deg,#2A2AE0,#1A1A8B);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:16px;font-family:'Playfair Display',serif;flex-shrink:0">U</div>
                <div>
                  <p style="font-family:'Playfair Display',serif;font-weight:900;color:white;font-size:15px;letter-spacing:0.12em;line-height:1">UNEXE</p>
                  <p style="font-size:9px;color:rgba(255,255,255,0.3);letter-spacing:0.15em;text-transform:uppercase;margin-top:2px">Administration</p>
                </div>
              `
            }}
          />
          <div>
            <p
              className="font-black text-white leading-none"
              style={{ fontFamily: '"Playfair Display", serif', fontSize: '15px', letterSpacing: '0.12em' }}
            >
              UNEXE
            </p>
            <p className="text-[9px] uppercase tracking-[0.15em] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Administration
            </p>
          </div>
        </div>

        {/* ── Profil utilisateur ── */}
        <div
          className="px-4 py-4 mx-3 mt-3 rounded-2xl cursor-pointer group"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => { navigate('/dashboard/profil'); onClose?.() }}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-white font-black text-base"
                style={{ background: 'linear-gradient(135deg, #2A2AE0, #1A1A8B)', fontFamily: '"Playfair Display", serif' }}
              >
                {photoUrl
                  ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                  : user?.name?.charAt(0).toUpperCase()
                }
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{ background: '#22C55E', borderColor: '#08081A' }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">{user?.name}</p>
              <div
                className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                style={{ background: role.bg, color: role.color }}
              >
                {role.label}
              </div>
            </div>

            <ChevronRight
              size={14}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            />
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {links.map((item) => {
            const Icon = item.icon

            return (
              <div key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={onClose}
                  className="block"
                >
                  {({ isActive }) => (
                    <div
                      className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative"
                      style={{
                        background: isActive ? 'rgba(42,42,224,0.18)' : 'transparent',
                        color:      isActive ? '#A5A5FF' : 'rgba(255,255,255,0.45)',
                        border:     isActive ? '1px solid rgba(42,42,224,0.3)' : '1px solid transparent',
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                          e.currentTarget.style.color      = 'rgba(255,255,255,0.85)'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color      = 'rgba(255,255,255,0.45)'
                        }
                      }}
                    >
                      {/* Indicateur actif */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                          style={{ background: '#2A2AE0' }}
                        />
                      )}

                      <Icon size={16} className="flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>

                      {/* Badge optionnel (ex: "Admin") */}
                      {item.badge && !isActive && (
                        <span
                          className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(232,17,45,0.2)', color: '#E8112D' }}
                        >
                          {item.badge}
                        </span>
                      )}

                      {isActive && (
                        <ChevronRight size={13} style={{ color: '#A5A5FF' }} />
                      )}
                    </div>
                  )}
                </NavLink>

                {/* Séparateur après l'item si demandé */}
                {item.dividerAfter && (
                  <div className="my-2 mx-1" style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />
                )}
              </div>
            )
          })}
        </nav>

        {/* ── Déconnexion ── */}
        <div
          className="px-3 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(232,17,45,0.08)'
              e.currentTarget.style.color = '#E8112D'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)'
            }}
          >
            {loggingOut ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogOut size={16} />
            )}
            <span>{loggingOut ? 'Déconnexion...' : 'Se déconnecter'}</span>
          </button>

          <p className="text-center mt-3 text-[9px] uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.1)' }}>
            UNEXE · INSTI Lokossa · Bénin
          </p>
        </div>
      </aside>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
      `}</style>
    </>
  )
}