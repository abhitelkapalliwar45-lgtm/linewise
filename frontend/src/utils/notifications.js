/**
 * LineWise Safe & Universal Notification Utility
 * Provides 100% free web push notifications, audio chime synthesis,
 * device vibration, and WhatsApp deep link generation.
 */

// Safely request permission for browser system notifications
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  try {
    if (Notification.permission === 'granted') {
      return 'granted'
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }
    return Notification.permission
  } catch (err) {
    console.warn('Error requesting notification permission:', err)
    return 'error'
  }
}

// Safely send a system notification
export function sendSystemNotification(title, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null
  }
  try {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        silent: false,
        ...options,
      })
    }
  } catch (err) {
    console.warn('Unable to dispatch notification:', err)
  }
  return null
}

// Safely vibrate the device (smartphones)
export function vibrateDevice(pattern = [300, 150, 300]) {
  if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // Ignore vibration errors
    }
  }
}

// Synthesize a chime using Web Audio API (zero external mp3 dependencies)
export function playTurnChime() {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.3, startTime)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const now = ctx.currentTime
    // Pleasant two-tone chime (E5 -> G5)
    playTone(659.25, now, 0.3)
    playTone(783.99, now + 0.25, 0.5)
  } catch (err) {
    console.warn('Web Audio synthesis not allowed before user interaction:', err)
  }
}

// Announce token via Web Speech API (if supported)
export function speakTurnAlert(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel() // cancel any pending speech
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.volume = 1.0
    window.speechSynthesis.speak(utterance)
  } catch (err) {
    console.warn('Speech synthesis error:', err)
  }
}

// Build a WhatsApp Click-to-Chat deep link
export function buildWhatsAppUrl(phone, message) {
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '')
  const encodedText = encodeURIComponent(message || '')
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`
  }
  return `https://wa.me/?text=${encodedText}`
}
