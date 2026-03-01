import { useNavigate } from 'react-router-dom'
import { 
  FiGithub, FiLinkedin, FiTwitter, FiMail, 
  FiMapPin, FiPhone, FiGlobe, FiHeart,
  FiChevronRight, FiAward, FiUsers, FiBriefcase, FiInfo
} from 'react-icons/fi'
import { FaWhatsapp, FaTelegram, FaGraduationCap } from 'react-icons/fa'

export default function Footer() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  // Tes informations personnelles
  const developerInfo = {
    name: "LOGBO Maurel Oswald D.",
    role: "Développeur Full Stack & Concepteur UNEXE",
    email: "logbomaurel@gmail.com",
    phone: "+229 01 90 07 89 88",
    location: "Lokossa, Bénin",
    website: "logbomaurel.com", // À modifier si tu as un site
    github: "https://github.com/LOGBO12", // À modifier
    linkedin: "https://linkedin.com/in/logbomaurel", // À modifier
    twitter: "https://twitter.com/tonusername", // À modifier
    whatsapp: "https://wa.me/2290190078988",
    telegram: "https://t.me/tonusername", // À modifier
    bio: "Passionné par l'éducation et la technologie, j'ai conçu UNEXE pour valoriser l'excellence académique à l'INSTI Lokossa. Avec une approche moderne et innovante, je développe des solutions qui ont un impact réel."
  }

  const navigationLinks = [
    { label: 'Le Comité', href: '#comite', icon: FiUsers },
    { label: 'Nos Candidats', href: '#candidats', icon: FiAward },
    { label: 'Partenaires', href: '#partenaires', icon: FiBriefcase },
    { label: 'À propos', href: '#about', icon: FiInfo },
  ]

  const handleNav = (href) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else {
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

  return (
    <footer 
      className="relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(135deg, #0a0a14 0%, #0D0D1A 100%)',
        borderTop: '1px solid rgba(42,42,224,0.2)'
      }}
    >
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(42,42,224,0.5), transparent)'
          }}
        />
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #2A2AE0 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #008751 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">
        
        {/* Grid principale - 3 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">

          {/* Colonne 1: Identité UNEXE (4 colonnes) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              {/* Image du logo - Remplace par le chemin de ton logo */}
              <img 
                src="unexe-logo.jpeg" 
                alt="UNEXE Logo" 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  // Fallback si l'image n'existe pas
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML += '<div class="w-12 h-12 bg-[#2A2AE0] rounded-xl flex items-center justify-center text-white text-xl font-black">U</div>';
                }}
              />
              <div>
                <p
                  className="font-black tracking-[0.18em] text-2xl text-white leading-none"
                  style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
                >
                  UNEXE
                </p>
                <p className="text-[10px] tracking-[0.12em] uppercase font-semibold text-white/35 mt-0.5">
                  University Excellence Elite
                </p>
              </div>
            </div>
            
            <p className="text-white/45 text-sm leading-relaxed max-w-sm">
              Le concours académique d'excellence qui révèle et récompense les meilleurs étudiants de l'INSTI Lokossa, République du Bénin.
            </p>
            
            {/* Drapeau Bénin */}
            <div className="flex items-center gap-3">
              <div className="flex h-5 w-8 rounded-sm overflow-hidden shadow-lg">
                <div className="w-1/3 bg-[#008751]" />
                <div className="flex flex-col w-2/3">
                  <div className="flex-1 bg-[#F0C040]" />
                  <div className="flex-1 bg-[#E8112D]" />
                </div>
              </div>
              <span className="text-white/30 text-xs tracking-wide">République du Bénin</span>
            </div>

            {/* Stats mini */}
            <div className="flex gap-4 pt-2">
              <div>
                <p className="text-white font-bold text-lg">5</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Départements</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-white font-bold text-lg">100+</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Candidats</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <p className="text-white font-bold text-lg">1</p>
                <p className="text-white/30 text-[10px] uppercase tracking-wider">Champion</p>
              </div>
            </div>
          </div>

          {/* Colonne 2: Navigation (2 colonnes) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6">
              Navigation
            </h4>
            <ul className="space-y-4">
              {navigationLinks.map(item => {
                const Icon = item.icon
                return (
                  <li key={item.label}>
                    <button
                      onClick={() => handleNav(item.href)}
                      className="group flex items-center gap-3 text-sm text-white/50 hover:text-white transition-all"
                    >
                      <Icon className="w-4 h-4 text-[#2A2AE0] group-hover:scale-110 transition-transform" />
                      <span>{item.label}</span>
                      <FiChevronRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </button>
                  </li>
                )
              })}
            </ul>

            {/* Espace candidat rapide */}
            <div className="mt-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-4">
                Espace
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/login')}
                  className="block text-sm text-white/50 hover:text-white transition-colors"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="block text-sm text-white/50 hover:text-white transition-colors"
                >
                  S'inscrire
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="block text-sm text-white/50 hover:text-white transition-colors"
                >
                  Tableau de bord
                </button>
              </div>
            </div>
          </div>

          {/* Colonne 3: Informations développeur (6 colonnes) */}
          <div className="lg:col-span-6">
            {/* Badge développeur */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{
                borderColor: 'rgba(42,42,224,0.3)',
                background: 'rgba(42,42,224,0.07)',
              }}
            >
              <FiHeart className="w-3 h-3 text-[#2A2AE0]" />
              <span className="text-white/60 text-xs">Conçu et développé avec passion par</span>
              <span className="text-white font-semibold text-sm">{developerInfo.name}</span>
            </div>

            {/* Carte développeur */}
            <div 
              className="rounded-2xl p-6 border"
              style={{
                background: 'rgba(42,42,224,0.03)',
                borderColor: 'rgba(42,42,224,0.15)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar / Initiales */}
                <div className="flex-shrink-0">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
                    style={{
                      background: 'linear-gradient(135deg, #2A2AE0, #1A1A8B)',
                      boxShadow: '0 10px 20px rgba(42,42,224,0.3)',
                    }}
                  >
                    {developerInfo.name.charAt(0)}
                  </div>
                </div>

                {/* Infos */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{developerInfo.name}</h3>
                    <p className="text-[#2A2AE0] text-sm font-medium">{developerInfo.role}</p>
                  </div>
                  
                  <p className="text-white/50 text-sm leading-relaxed">
                    {developerInfo.bio}
                  </p>

                  {/* Contacts avec icônes - MIS À JOUR AVEC TES INFORMATIONS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <a 
                      href={`mailto:${developerInfo.email}`}
                      className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-xs"
                    >
                      <FiMail className="w-3.5 h-3.5 text-[#2A2AE0]" />
                      {developerInfo.email}
                    </a>
                    <a 
                      href={`tel:${developerInfo.phone.replace(/\s/g, '')}`}
                      className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-xs"
                    >
                      <FiPhone className="w-3.5 h-3.5 text-[#008751]" />
                      {developerInfo.phone}
                    </a>
                    <div className="flex items-center gap-2 text-white/40 text-xs">
                      <FiMapPin className="w-3.5 h-3.5 text-[#F0C040]" />
                      {developerInfo.location}
                    </div>
                    <a 
                      href={`https://${developerInfo.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-xs"
                    >
                      <FiGlobe className="w-3.5 h-3.5 text-[#E8112D]" />
                      {developerInfo.website}
                    </a>
                  </div>
                </div>
              </div>

              {/* Réseaux sociaux */}
              <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'rgba(42,42,224,0.15)' }}>
                {[
                  { icon: FiGithub, href: developerInfo.github, label: 'GitHub', color: '#2A2AE0' },
                  { icon: FiLinkedin, href: developerInfo.linkedin, label: 'LinkedIn', color: '#0077b5' },
                  { icon: FiTwitter, href: developerInfo.twitter, label: 'Twitter', color: '#1da1f2' },
                  { icon: FaWhatsapp, href: developerInfo.whatsapp, label: 'WhatsApp', color: '#25D366' },
                  { icon: FaTelegram, href: developerInfo.telegram, label: 'Telegram', color: '#0088cc' },
                ].map((social, index) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative"
                      title={social.label}
                    >
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(42,42,224,0.15)',
                        }}
                      >
                        <Icon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                      </div>
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {social.label}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Séparateur + bas de page */}
        <div
          className="pt-8 mt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: 'rgba(42,42,224,0.15)' }}
        >
          <p className="text-white/25 text-xs text-center sm:text-left">
            © {year} UNEXE — University Excellence Elite. Tous droits réservés.
          </p>
          <div className="flex items-center gap-3">
            <p className="text-white/15 text-xs italic">Fraternité · Justice · Travail</p>
            <span className="text-white/10 text-xs">|</span>
            <p className="text-white/15 text-xs">
              Développé par <span className="text-[#2A2AE0] font-semibold">LOGBO Maurel O. D.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}