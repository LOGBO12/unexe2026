import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  MessageSquare,
  Handshake,
  Shield,
  ScrollText,
  UserCircle,
  Trophy,
} from 'lucide-react'

// Chaque item a :
// - label       : texte affiché
// - path        : route
// - icon        : composant Lucide
// - roles       : qui peut voir ce lien
// - dividerAfter: ligne de séparation après cet item

const navigation = [
  // ── GÉNÉRAL ──
  {
    label: 'Tableau de bord',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'comite'],
  },

  // ── CANDIDATURES ──
  {
    label: 'Candidatures',
    path: '/dashboard/candidatures',
    icon: FileText,
    roles: ['super_admin', 'comite'],
  },
  {
    label: 'Candidats validés',
    path: '/dashboard/candidats',
    icon: Users,
    roles: ['super_admin', 'comite'],
    dividerAfter: true,
  },

  // ── COMMUNAUTÉ ──
  {
    label: 'Forum',
    path: '/dashboard/forum',
    icon: MessageSquare,
    roles: ['super_admin', 'comite'],
    dividerAfter: true,
  },

  // ── ADMINISTRATION ──
  {
    label: 'Invitations',
    path: '/dashboard/invitations',
    icon: Mail,
    roles: ['super_admin', 'comite'],
  },
  {
    label: 'Membres du comité',
    path: '/dashboard/comite',
    icon: Shield,
    roles: ['super_admin', 'comite'],
  },
  {
    label: 'Partenaires',
    path: '/dashboard/partenaires',
    icon: Handshake,
    roles: ['super_admin', 'comite'],
  },
  {
    label: 'Logs d\'actions',
    path: '/dashboard/logs',
    icon: ScrollText,
    roles: ['super_admin'], // super_admin uniquement
    dividerAfter: true,
  },

  // ── ESPACE CANDIDAT ──
  {
    label: 'Mon espace',
    path: '/espace-candidat',
    icon: Trophy,
    roles: ['candidat'],
  },
  {
    label: 'Ma candidature',
    path: '/espace-candidat/candidature',
    icon: FileText,
    roles: ['candidat'],
  },
  {
    label: 'Forum',
    path: '/espace-candidat/forum',
    icon: MessageSquare,
    roles: ['candidat'],
    dividerAfter: true,
  },

  // ── COMMUN ──
  {
    label: 'Mon profil',
    path: '/profil',
    icon: UserCircle,
    roles: ['super_admin', 'comite', 'candidat'],
  },
]

export default navigation