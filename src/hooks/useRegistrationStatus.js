import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../api/axios'

/**
 * useRegistrationStatus
 * ─────────────────────
 * Récupère le statut des inscriptions depuis l'API et :
 *  - met à jour le compte à rebours chaque seconde (côté client)
 *  - re-vérifie auprès du serveur toutes les 60 secondes
 *  - ferme automatiquement les inscriptions quand la deadline est atteinte
 */
export function useRegistrationStatus() {
  const [status, setStatus] = useState({
    isOpen: true,
    registrationOpen: true,
    deadline: null,          // Date JS ou null
    closedMessage: '',
    loaded: false,
  })

  // Compte à rebours en secondes restantes (null = pas de deadline)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const intervalRef = useRef(null)
  const pollRef     = useRef(null)

  // ── Calculer les secondes restantes ────────────────────────────────────────
  const computeSeconds = useCallback((deadline) => {
    if (!deadline) return null
    const diff = Math.floor((deadline.getTime() - Date.now()) / 1000)
    return diff > 0 ? diff : 0
  }, [])

  // ── Charger depuis l'API ───────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res  = await api.get('/registration-status')
      const data = res.data

      const deadline = data.registration_deadline
        ? new Date(data.registration_deadline)
        : null

      setStatus({
        isOpen:           data.is_open,
        registrationOpen: data.registration_open,
        deadline,
        closedMessage:    data.closed_message || 'Les inscriptions sont fermées.',
        loaded:           true,
      })

      setSecondsLeft(computeSeconds(deadline))
    } catch {
      // En cas d'erreur réseau, on garde l'état actuel
      setStatus(s => ({ ...s, loaded: true }))
    }
  }, [computeSeconds])

  // ── Minuterie côté client (1 seconde) ─────────────────────────────────────
  useEffect(() => {
    // Nettoyer l'ancien interval
    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null) return null
        if (prev <= 0) {
          // Deadline atteinte → fermer les inscriptions localement
          setStatus(s => ({ ...s, isOpen: false }))
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(intervalRef.current)
  }, [])

  // ── Polling serveur toutes les 60 secondes ────────────────────────────────
  useEffect(() => {
    fetchStatus()

    pollRef.current = setInterval(fetchStatus, 60_000)
    return () => clearInterval(pollRef.current)
  }, [fetchStatus])

  // ── Formatter le temps restant ────────────────────────────────────────────
  const formatted = formatCountdown(secondsLeft)

  return {
    ...status,
    secondsLeft,
    formatted,      // { days, hours, minutes, seconds, label }
    refresh: fetchStatus,
  }
}

// ── Formatteur ─────────────────────────────────────────────────────────────────
export function formatCountdown(seconds) {
  if (seconds === null || seconds === undefined) {
    return { days: null, hours: null, minutes: null, seconds: null, label: '' }
  }

  if (seconds <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, label: 'Inscriptions fermées' }
  }

  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  const pad = (n) => String(n).padStart(2, '0')

  let label = ''
  if (d > 0) label = `${d}j ${pad(h)}h ${pad(m)}m ${pad(s)}s`
  else if (h > 0) label = `${pad(h)}h ${pad(m)}m ${pad(s)}s`
  else label = `${pad(m)}m ${pad(s)}s`

  return { days: d, hours: h, minutes: m, seconds: s, label }
}