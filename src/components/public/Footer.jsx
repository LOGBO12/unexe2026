export default function Footer() {
  return (
    <footer className="bg-[#1a1a2e] text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Colonne 1 — Identité */}
          <div>
            <h3 className="text-lg font-bold mb-2">🎓 UNEXE</h3>
            <p className="text-sm text-white/50">University Excellence Elite</p>
            <p className="text-sm text-white/50">INSTI Lokossa — République du Bénin</p>
            <p className="text-xs text-white/30 mt-3 italic">Fraternité · Justice · Travail</p>
          </div>

          {/* Colonne 2 — Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="/comite" className="hover:text-white transition">Espace Comité</a></li>
              <li><a href="/candidats" className="hover:text-white transition">Espace Candidat</a></li>
              <li><a href="/partenaires" className="hover:text-white transition">Partenaires</a></li>
              <li><a href="/communaute" className="hover:text-white transition">Communauté</a></li>
            </ul>
          </div>

          {/* Colonne 3 — Drapeau Bénin */}
          <div className="flex flex-col items-start md:items-end justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-3">
                République du Bénin
              </h4>
              {/* Drapeau simplifié */}
              <div className="flex h-8 w-14 rounded overflow-hidden shadow">
                <div className="w-1/3 bg-[#008751]" />
                <div className="flex flex-col w-2/3">
                  <div className="flex-1 bg-[#FCD116]" />
                  <div className="flex-1 bg-[#E8112D]" />
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-white/30">
          © {new Date().getFullYear()} UNEXE — University Excellence Elite. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}