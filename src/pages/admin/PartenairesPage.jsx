import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  Plus, Trash2, Pencil, RefreshCw, Handshake,
  ExternalLink, X, Save, Globe, ArrowUpDown,
  Eye, EyeOff, ImagePlus, Check
} from 'lucide-react'

const EMPTY_FORM = {
  name: '',
  contribution: '',
  website: '',
  display_order: 0,
}

/* ─── Carte partenaire ────────────────────────────────────────────────────── */
function PartnerCard({ partner, onEdit, onDelete }) {
  const logoUrl = partner.logo_url || (partner.logo ? `/storage/${partner.logo}` : null)

  return (
    <div
      className="group bg-white rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col"
      style={{
        borderColor: 'rgba(13,13,26,0.08)',
        boxShadow: '0 2px 12px rgba(13,13,26,0.04)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(42,42,224,0.1)'
        e.currentTarget.style.borderColor = 'rgba(42,42,224,0.2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(13,13,26,0.04)'
        e.currentTarget.style.borderColor = 'rgba(13,13,26,0.08)'
      }}
    >
      {/* Zone logo */}
      <div
        className="relative flex items-center justify-center"
        style={{
          height: '160px',
          background: 'linear-gradient(135deg, #F5F5FF 0%, #EBEBFF 100%)',
          borderBottom: '1px solid rgba(42,42,224,0.07)',
        }}
      >
        {/* Motif de points */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(42,42,224,0.12) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {logoUrl ? (
          <img
            src={logoUrl}
            alt={partner.name}
            className="relative z-10 object-contain transition-transform duration-300 group-hover:scale-105"
            style={{ maxWidth: '160px', maxHeight: '100px' }}
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextElementSibling.style.display = 'flex'
            }}
          />
        ) : null}

        {/* Fallback */}
        <div
          className="relative z-10 w-16 h-16 rounded-2xl items-center justify-center text-2xl font-black text-white"
          style={{
            display: logoUrl ? 'none' : 'flex',
            background: 'linear-gradient(135deg, #2A2AE0, #1A1A8B)',
            fontFamily: '"Playfair Display", serif',
          }}
        >
          {partner.name?.charAt(0)}
        </div>

        {/* Badge ordre */}
        <div
          className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-black"
          style={{ background: 'rgba(255,255,255,0.9)', color: '#2A2AE0', backdropFilter: 'blur(4px)' }}
        >
          #{partner.display_order}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="font-bold text-base mb-1 leading-tight"
          style={{ color: '#08081A', fontFamily: '"Playfair Display", serif' }}
        >
          {partner.name}
        </h3>

        {partner.website && (
          <a
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium mb-3 hover:underline"
            style={{ color: '#2A2AE0' }}
          >
            <Globe size={11} />
            {partner.website.replace(/^https?:\/\//, '').split('/')[0]}
            <ExternalLink size={10} />
          </a>
        )}

        {partner.contribution && (
          <p className="text-xs leading-relaxed line-clamp-2 flex-1 mb-4" style={{ color: 'rgba(13,13,26,0.5)' }}>
            {partner.contribution}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'rgba(13,13,26,0.06)' }}>
          <button
            onClick={() => onEdit(partner)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'rgba(42,42,224,0.07)', color: '#2A2AE0' }}
          >
            <Pencil size={13} />
            Modifier
          </button>
          <button
            onClick={() => onDelete(partner.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{ background: 'rgba(232,17,45,0.06)', color: '#E8112D' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Modal formulaire ────────────────────────────────────────────────────── */
function PartnerModal({ editing, initialData, onClose, onSaved }) {
  const [form, setForm]       = useState(initialData || EMPTY_FORM)
  const [logo, setLogo]       = useState(null)
  const [preview, setPreview] = useState(
    initialData?.logo_url || (initialData?.logo ? `/storage/${initialData.logo}` : null)
  )
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)

  const handleLogo = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogo(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const fd = new FormData()
    fd.append('name', form.name)
    if (form.contribution) fd.append('contribution', form.contribution)
    if (form.website)      fd.append('website', form.website)
    fd.append('display_order', form.display_order)
    if (logo) fd.append('logo', logo)

    try {
      if (editing) {
        fd.append('_method', 'PUT')
        await api.post(`/partners/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post('/partners', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.')
      setSaving(false)
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,8,26,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header modal */}
        <div
          className="flex items-center justify-between px-7 py-5 border-b"
          style={{ borderColor: 'rgba(13,13,26,0.07)' }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#08081A', fontFamily: '"Playfair Display", serif' }}>
              {editing ? 'Modifier le partenaire' : 'Nouveau partenaire'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(13,13,26,0.4)' }}>
              {editing ? 'Mettez à jour les informations' : 'Ajoutez un partenaire à la liste'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:bg-gray-100"
            style={{ color: 'rgba(13,13,26,0.4)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          {/* Erreur */}
          {error && (
            <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(232,17,45,0.07)', color: '#E8112D', border: '1px solid rgba(232,17,45,0.15)' }}>
              {error}
            </div>
          )}

          {/* Zone logo — grande et centrale */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#08081A' }}>
              Logo du partenaire
            </label>
            <div
              className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-200 cursor-pointer"
              style={{
                height: '180px',
                borderColor: 'rgba(42,42,224,0.2)',
                background: 'linear-gradient(135deg, #F8F8FF, #F0F0FF)',
              }}
              onClick={() => document.getElementById('logo-input').click()}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(42,42,224,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(42,42,224,0.2)'}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Aperçu"
                    className="object-contain"
                    style={{ maxWidth: '200px', maxHeight: '120px' }}
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(42,42,224,0.08)' }}
                  >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'rgba(42,42,224,0.9)' }}>
                      <ImagePlus size={15} />
                      Changer
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: 'rgba(42,42,224,0.1)' }}
                  >
                    <ImagePlus size={22} style={{ color: '#2A2AE0' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#2A2AE0' }}>Cliquer pour ajouter un logo</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(13,13,26,0.4)' }}>JPG, PNG ou SVG · Max 2 Mo</p>
                </div>
              )}
            </div>
            <input
              id="logo-input"
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/svg+xml"
              onChange={handleLogo}
              className="hidden"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#08081A' }}>
              Nom du partenaire <span style={{ color: '#E8112D' }}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ex : Université d'Abomey-Calavi"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                border: '1.5px solid rgba(13,13,26,0.1)',
                background: '#FAFAFA',
                color: '#08081A',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(13,13,26,0.1)'}
            />
          </div>

          {/* Site web */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#08081A' }}>
              Site web
            </label>
            <div className="relative">
              <Globe size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(13,13,26,0.3)' }} />
              <input
                type="url"
                value={form.website}
                onChange={e => setForm({ ...form, website: e.target.value })}
                placeholder="https://exemple.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid rgba(13,13,26,0.1)',
                  background: '#FAFAFA',
                  color: '#08081A',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(13,13,26,0.1)'}
              />
            </div>
          </div>

          {/* Contribution */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#08081A' }}>
              Description / Contribution
            </label>
            <textarea
              value={form.contribution}
              onChange={e => setForm({ ...form, contribution: e.target.value })}
              rows={3}
              placeholder="Décrivez l'apport de ce partenaire..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
              style={{
                border: '1.5px solid rgba(13,13,26,0.1)',
                background: '#FAFAFA',
                color: '#08081A',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(13,13,26,0.1)'}
            />
          </div>

          {/* Ordre d'affichage */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#08081A' }}>
              Ordre d'affichage
            </label>
            <div className="relative">
              <ArrowUpDown size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(13,13,26,0.3)' }} />
              <input
                type="number"
                value={form.display_order}
                onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                min={0}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '1.5px solid rgba(13,13,26,0.1)',
                  background: '#FAFAFA',
                  color: '#08081A',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(42,42,224,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(13,13,26,0.1)'}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'rgba(13,13,26,0.4)' }}>
              0 = affiché en premier
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #2A2AE0, #1A1A8B)' }}
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Check size={15} />
                  {editing ? 'Mettre à jour' : 'Ajouter le partenaire'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-gray-100"
              style={{ border: '1.5px solid rgba(13,13,26,0.1)', color: 'rgba(13,13,26,0.6)' }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────── */
export default function PartenairesPage() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPartner, setEditingPartner] = useState(null) // null = création
  const [toast, setToast]       = useState(null) // { type: 'success'|'error', msg }

  /* ── Data ── */
  const load = () => {
    setLoading(true)
    api.get('/partners')
      .then(res => setPartners(res.data))
      .catch(() => showToast('error', 'Impossible de charger les partenaires.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  /* ── Toast ── */
  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  /* ── CRUD ── */
  const openCreate = () => { setEditingPartner(null); setShowModal(true) }
  const openEdit   = (p) => { setEditingPartner(p);   setShowModal(true) }
  const closeModal = ()  => { setShowModal(false); setEditingPartner(null) }

  const handleSaved = () => {
    closeModal()
    showToast('success', editingPartner ? 'Partenaire mis à jour.' : 'Partenaire ajouté.')
    load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce partenaire ?')) return
    try {
      await api.delete(`/partners/${id}`)
      showToast('success', 'Partenaire supprimé.')
      load()
    } catch {
      showToast('error', 'Erreur lors de la suppression.')
    }
  }

  /* ── Render ── */
  return (
    <div className="space-y-7">

      {/* ── Toast notification ── */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all"
          style={{
            background: toast.type === 'success' ? '#08081A' : '#E8112D',
            color: '#FFFFFF',
            minWidth: '260px',
          }}
        >
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.msg}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <PartnerModal
          editing={editingPartner?.id || null}
          initialData={editingPartner ? {
            name: editingPartner.name || '',
            contribution: editingPartner.contribution || '',
            website: editingPartner.website || '',
            display_order: editingPartner.display_order || 0,
            logo_url: editingPartner.logo_url,
            logo: editingPartner.logo,
          } : null}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* ── En-tête page ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-black"
            style={{ color: '#08081A', fontFamily: '"Playfair Display", serif' }}
          >
            Partenaires
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(13,13,26,0.45)' }}>
            Gérez les partenaires visibles sur le site public · {partners.length} au total
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={load}
            className="p-2.5 rounded-xl border transition-all hover:bg-gray-50"
            style={{ borderColor: 'rgba(13,13,26,0.1)', color: 'rgba(13,13,26,0.5)' }}
            title="Actualiser"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #2A2AE0, #1A1A8B)', boxShadow: '0 4px 16px rgba(42,42,224,0.3)' }}
          >
            <Plus size={16} />
            Ajouter un partenaire
          </button>
        </div>
      </div>

      {/* ── Statistique rapide ── */}
      {!loading && partners.length > 0 && (
        <div
          className="flex items-center gap-6 px-6 py-4 rounded-2xl border"
          style={{ background: 'rgba(42,42,224,0.03)', borderColor: 'rgba(42,42,224,0.1)' }}
        >
          <div>
            <p className="text-2xl font-black" style={{ color: '#2A2AE0', fontFamily: '"Playfair Display", serif' }}>
              {partners.length}
            </p>
            <p className="text-xs" style={{ color: 'rgba(13,13,26,0.45)' }}>Partenaire{partners.length > 1 ? 's' : ''}</p>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div>
            <p className="text-2xl font-black" style={{ color: '#08081A', fontFamily: '"Playfair Display", serif' }}>
              {partners.filter(p => p.logo || p.logo_url).length}
            </p>
            <p className="text-xs" style={{ color: 'rgba(13,13,26,0.45)' }}>Avec logo</p>
          </div>
          <div className="w-px h-10 bg-gray-200" />
          <div>
            <p className="text-2xl font-black" style={{ color: '#08081A', fontFamily: '"Playfair Display", serif' }}>
              {partners.filter(p => p.website).length}
            </p>
            <p className="text-xs" style={{ color: 'rgba(13,13,26,0.45)' }}>Avec site web</p>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border overflow-hidden animate-pulse" style={{ borderColor: 'rgba(13,13,26,0.07)' }}>
              <div className="h-40" style={{ background: '#F5F5FF' }} />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 rounded-lg bg-gray-100" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
                <div className="h-3 w-full rounded bg-gray-50" />
                <div className="flex gap-2 pt-2">
                  <div className="h-9 flex-1 rounded-xl bg-gray-100" />
                  <div className="h-9 w-12 rounded-xl bg-gray-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Aucun partenaire ── */}
      {!loading && partners.length === 0 && (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-3xl border"
          style={{ background: '#FFFFFF', borderColor: 'rgba(13,13,26,0.07)', borderStyle: 'dashed' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'rgba(42,42,224,0.07)' }}
          >
            <Handshake size={28} style={{ color: '#2A2AE0' }} />
          </div>
          <p className="text-base font-bold mb-1" style={{ color: '#08081A' }}>Aucun partenaire</p>
          <p className="text-sm mb-5" style={{ color: 'rgba(13,13,26,0.4)' }}>
            Commencez par ajouter votre premier partenaire.
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
            style={{ background: '#2A2AE0' }}
          >
            <Plus size={15} />
            Ajouter un partenaire
          </button>
        </div>
      )}

      {/* ── Grille des partenaires ── */}
      {!loading && partners.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {partners
            .sort((a, b) => (a.display_order ?? 99) - (b.display_order ?? 99))
            .map(p => (
              <PartnerCard
                key={p.id}
                partner={p}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))
          }
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap');
      `}</style>
    </div>
  )
}