import { useEffect, useState } from 'react'
import api from '../../api/axios'
import Navbar from '../../components/public/Navbar'
import Footer from '../../components/public/Footer'
import { ExternalLink, Mail, Globe, ArrowUpRight, Star } from 'lucide-react'

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getLogoUrl(partner) {
  if (partner.logo_url) return partner.logo_url
  if (partner.logo)     return `/storage/${partner.logo}`
  return null
}

/* ─── Composant : grande carte partenaire ─────────────────────────────────── */
function PartnerCard({ partner, index }) {
  const logoUrl = getLogoUrl(partner)
  const isEven  = index % 2 === 0

  return (
    <article
      className="group relative flex flex-col md:flex-row gap-0 overflow-hidden rounded-3xl border transition-all duration-500"
      style={{
        background: '#FFFFFF',
        borderColor: 'rgba(13,13,26,0.07)',
        boxShadow: '0 2px 24px rgba(13,13,26,0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 16px 56px rgba(42,42,224,0.12)'
        e.currentTarget.style.borderColor = 'rgba(42,42,224,0.2)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 24px rgba(13,13,26,0.04)'
        e.currentTarget.style.borderColor = 'rgba(13,13,26,0.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Numéro décoratif */}
      <div
        className="absolute top-5 right-6 text-7xl font-black leading-none select-none pointer-events-none"
        style={{
          fontFamily: '"Playfair Display", serif',
          color: 'rgba(42,42,224,0.04)',
          zIndex: 0,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Zone logo — grande, aérée */}
      <div
        className="relative flex-shrink-0 flex items-center justify-center"
        style={{
          width: '100%',
          maxWidth: '340px',
          minHeight: '220px',
          background: 'linear-gradient(135deg, #F8F8FF 0%, #EEEEFF 100%)',
          borderRight: '1px solid rgba(42,42,224,0.07)',
        }}
      >
        {/* Grille de points décorative */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(42,42,224,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`Logo ${partner.name}`}
            className="relative z-10 object-contain transition-transform duration-500 group-hover:scale-105"
            style={{ maxWidth: '200px', maxHeight: '120px' }}
            onError={e => {
              e.target.style.display = 'none'
              e.target.parentElement.querySelector('.fallback-logo').style.display = 'flex'
            }}
          />
        ) : null}

        {/* Fallback initiale */}
        <div
          className="fallback-logo relative z-10 w-24 h-24 rounded-3xl items-center justify-center text-4xl font-black text-white"
          style={{
            display: logoUrl ? 'none' : 'flex',
            background: 'linear-gradient(135deg, #2A2AE0, #1A1A8B)',
            fontFamily: '"Playfair Display", serif',
            boxShadow: '0 8px 32px rgba(42,42,224,0.35)',
          }}
        >
          {partner.name?.charAt(0)}
        </div>
      </div>

      {/* Contenu textuel */}
      <div className="relative flex-1 p-8 flex flex-col justify-between z-10">
        <div>
          {/* Numéro d'ordre */}
          <span
            className="inline-block text-xs font-black uppercase tracking-[0.25em] mb-3 px-3 py-1 rounded-full"
            style={{ background: 'rgba(42,42,224,0.07)', color: '#2A2AE0' }}
          >
            Partenaire #{String(index + 1).padStart(2, '0')}
          </span>

          <h2
            className="text-2xl font-black mb-3 leading-tight"
            style={{ fontFamily: '"Playfair Display", serif', color: '#08081A' }}
          >
            {partner.name}
          </h2>

          {partner.contribution && (
            <p
              className="text-base leading-relaxed"
              style={{ color: 'rgba(13,13,26,0.55)', maxWidth: '480px' }}
            >
              {partner.contribution}
            </p>
          )}
        </div>

        {/* Liens */}
        <div className="flex flex-wrap gap-3 mt-6">
          {partner.website && (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105"
              style={{
                background: '#2A2AE0',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(42,42,224,0.3)',
              }}
            >
              <Globe size={14} />
              Visiter le site
              <ArrowUpRight size={13} />
            </a>
          )}
          {partner.email && (
            <a
              href={`mailto:${partner.email}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all duration-200 hover:bg-gray-50"
              style={{ borderColor: 'rgba(13,13,26,0.12)', color: 'rgba(13,13,26,0.65)' }}
            >
              <Mail size={14} />
              Contact
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
function PartnerSkeleton() {
  return (
    <div
      className="rounded-3xl border overflow-hidden animate-pulse"
      style={{ borderColor: 'rgba(13,13,26,0.06)', background: '#FFFFFF' }}
    >
      <div className="flex flex-col md:flex-row">
        <div className="md:w-80 h-52" style={{ background: '#F3F3FA' }} />
        <div className="flex-1 p-8 space-y-4">
          <div className="h-4 w-28 rounded-full" style={{ background: '#EEEEFF' }} />
          <div className="h-7 w-2/3 rounded-lg" style={{ background: '#F3F3FA' }} />
          <div className="h-4 w-full rounded" style={{ background: '#F8F8FF' }} />
          <div className="h-4 w-5/6 rounded" style={{ background: '#F8F8FF' }} />
          <div className="flex gap-3 pt-2">
            <div className="h-10 w-32 rounded-xl" style={{ background: '#EEEEFF' }} />
            <div className="h-10 w-24 rounded-xl" style={{ background: '#F3F3FA' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── PAGE ────────────────────────────────────────────────────────────────── */
export default function PartenairesPublicPage() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    api.get('/public/partners')
      .then(res => {
        const data = res.data
        if (Array.isArray(data))              setPartners(data)
        else if (Array.isArray(data?.partners)) setPartners(data.partners)
        else                                   setPartners([])
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      className="min-h-screen"
      style={{ background: '#F7F7FC', fontFamily: '"DM Sans", "Segoe UI", sans-serif' }}
    >
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #08081A 0%, #0D0D2B 60%, #18184A 100%)',
          paddingTop: '120px',
          paddingBottom: '96px',
        }}
      >
        {/* Motif hexagonal subtil */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='92' viewBox='0 0 80 92' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,3 77,23 77,69 40,89 3,69 3,23' fill='none' stroke='%232A2AE0' stroke-width='1.5'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 92px',
          }}
        />
        {/* Halo gauche */}
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2A2AE0, transparent 70%)', filter: 'blur(100px)' }}
        />
        {/* Halo doré droit */}
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F0C040, transparent 70%)', filter: 'blur(80px)' }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border"
            style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
            <Star size={12} style={{ color: '#F0C040' }} fill="#F0C040" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/60">
              Partenaires UNEXE
            </span>
          </div>

          <h1
            className="font-black text-white leading-none mb-6"
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            }}
          >
            Ils croient en<br />
            <span style={{
              background: 'linear-gradient(90deg, #F0C040, #FFD700)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              l'excellence
            </span>
          </h1>

          <p
            className="text-lg leading-relaxed max-w-xl"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            UNEXE est porté par des institutions et entreprises engagées dans la
            promotion du capital humain et de l'excellence académique au Bénin.
          </p>

          {/* Séparateur décoratif */}
          <div className="flex items-center gap-4 mt-10">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(42,42,224,0.6), transparent)' }} />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/20">
              {!loading && `${partners.length} partenaire${partners.length !== 1 ? 's' : ''}`}
            </span>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(270deg, rgba(42,42,224,0.6), transparent)' }} />
          </div>
        </div>
      </section>

      {/* ── LISTE DES PARTENAIRES ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-20">

        {/* Loading */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <PartnerSkeleton key={i} />)}
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <div className="text-center py-28">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-lg font-bold text-gray-800">Chargement impossible</p>
            <p className="text-sm text-gray-400 mt-1">Vérifiez votre connexion et réessayez.</p>
          </div>
        )}

        {/* Aucun partenaire */}
        {!loading && !error && partners.length === 0 && (
          <div className="text-center py-28">
            <div
              className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6"
              style={{ background: 'rgba(240,192,64,0.1)' }}
            >
              <Star size={32} style={{ color: '#F0C040' }} />
            </div>
            <p className="text-xl font-bold text-gray-800 mb-2">Aucun partenaire enregistré</p>
            <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
              Nous recherchons des partenaires engagés pour soutenir l'excellence académique. Rejoignez l'aventure UNEXE !
            </p>
            <a
              href="mailto:contact@unexe.bj"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-bold text-sm text-white"
              style={{ background: '#2A2AE0' }}
            >
              <Mail size={14} />
              Devenir partenaire
            </a>
          </div>
        )}

        {/* Partenaires — liste verticale avec grandes cartes */}
        {!loading && !error && partners.length > 0 && (
          <div className="space-y-6">
            {/* Titre de section */}
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 px-4">
                Nos partenaires
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {partners
              .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99))
              .map((partner, i) => (
                <PartnerCard key={partner.id} partner={partner} index={i} />
              ))
            }
          </div>
        )}
      </section>

      {/* ── CTA DEVENIR PARTENAIRE ───────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{
          background: 'linear-gradient(160deg, #08081A 0%, #0D0D2B 100%)',
          borderTop: '1px solid rgba(42,42,224,0.15)',
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full border"
                style={{ borderColor: 'rgba(240,192,64,0.25)', background: 'rgba(240,192,64,0.05)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F0C040]" />
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F0C040]">
                  Rejoindre l'aventure
                </span>
              </div>
              <h2
                className="font-black text-white leading-tight mb-4"
                style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}
              >
                Devenez partenaire<br />
                <span style={{ color: '#F0C040' }}>UNEXE</span>
              </h2>
              <p className="text-white/45 leading-relaxed">
                Soutenez l'excellence académique à l'INSTI Lokossa. Bénéficiez d'une
                visibilité auprès des meilleurs étudiants et futurs talents du Bénin.
              </p>
            </div>

            {/* Contact card */}
            <div
              className="rounded-3xl p-8 border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(240,192,64,0.15)' }}
            >
              <h3 className="text-white font-bold text-lg mb-6">Nous contacter</h3>
              <div className="space-y-4">
                <a href="mailto:contact@unexe.bj"
                  className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(42,42,224,0.15)', color: '#A5A5FF' }}>
                    <Mail size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/25 mb-0.5 uppercase tracking-wider">Email</p>
                    <p className="text-sm font-semibold">contact@unexe.bj</p>
                  </div>
                </a>
                <a href="https://unexe.bj" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(240,192,64,0.12)', color: '#F0C040' }}>
                    <Globe size={15} />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/25 mb-0.5 uppercase tracking-wider">Site web</p>
                    <p className="text-sm font-semibold">unexe.bj</p>
                  </div>
                </a>
              </div>

              <a
                href="mailto:contact@unexe.bj"
                className="mt-8 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(90deg, #F0C040, #E8A800)', color: '#08081A' }}
              >
                Devenir partenaire
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  )
}