import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTicketStatus } from '../services/api'
import {
  requestNotificationPermission,
  sendSystemNotification,
  playTurnChime,
  speakTurnAlert,
  vibrateDevice,
  buildWhatsAppUrl,
} from '../utils/notifications'

function CustomerTicket() {
  const { queueId, ticketId } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const hasAlertedJoinedRef = useRef(false)
  const hasAlertedCalledRef = useRef(false)

  // Request notification permission once on mount
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    let intervalId = null

    async function fetchStatus() {
      try {
        const data = await getTicketStatus(queueId, ticketId)
        setTicket(data)
        setError('')

        // Notification 1: Initial join confirmation notification
        if (data && data.status === 'WAITING' && !hasAlertedJoinedRef.current) {
          hasAlertedJoinedRef.current = true
          sendSystemNotification(`🎟️ Token Confirmed: ${data.display_number}`, {
            body: `Hello ${data.customer_name}! You're in line at position #${data.position_in_queue || 1}. Estimated wait: ${data.estimated_wait_formatted || 'calculating...'}.`,
            tag: `join-${ticketId}`,
          })
        }

        // Notification 2: When user's turn arrives (status becomes CALLED)
        if (data && data.status === 'CALLED' && !hasAlertedCalledRef.current) {
          hasAlertedCalledRef.current = true
          sendSystemNotification(`📢 It's Your Turn! (${data.display_number})`, {
            body: `Please proceed to the counter desk now. Your verification OTP is: ${data.qvc_otp}`,
            requireInteraction: true,
            tag: `called-${ticketId}`,
          })
          vibrateDevice([400, 200, 400, 200, 400])
          playTurnChime()
          speakTurnAlert(`Token ${data.display_number}, please proceed to the counter.`)
        }
      } catch (err) {
        setError(err.message || 'Error fetching ticket status')
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
    // Poll every 3 seconds for real-time queue position & wait-time updates
    intervalId = setInterval(fetchStatus, 3000)

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [queueId, ticketId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow border border-red-100 text-center">
          <p className="text-red-600 font-semibold">{error || 'Ticket not found.'}</p>
          <button
            onClick={() => navigate('/get-started')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
          >
            Back Home
          </button>
        </div>
      </div>
    )
  }

  const isCalled = ticket.status === 'CALLED'
  const isInService = ticket.status === 'IN_SERVICE'
  const isCompleted = ticket.status === 'COMPLETED'
  const isSkipped = ticket.status === 'SKIPPED'

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 min-h-screen px-6 py-12 transition-colors duration-200">
      <div className="mx-auto max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-md border border-blue-100 dark:border-slate-800 text-center space-y-6">
          
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
              Queue: {ticket.queue_id}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isCalled
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                  : isInService
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : isCompleted
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                  : isSkipped
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : 'bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-blue-400'
              }`}
            >
              {ticket.status}
            </span>
          </div>

          {/* Ticket Number */}
          <div className="py-4">
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Your Token Number</p>
            <h1 className="text-5xl font-black text-blue-600 dark:text-blue-400 tracking-tight mt-1">
              {ticket.display_number}
            </h1>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-200 mt-2">{ticket.customer_name}</p>
          </div>

          {/* Alert Banner when CALLED */}
          {isCalled && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-2xl text-left">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📢</span>
                <div>
                  <h3 className="font-bold text-amber-900 dark:text-amber-200 text-base">You're Called to Counter!</h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    Please proceed to the counter desk and state your 4-digit verification code below.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* OTP Box (Queue Verification Code) */}
          {(isCalled || isInService) && ticket.qvc_otp && (
            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                Queue Verification Code (QVC)
              </p>
              <div className="text-4xl font-mono font-black tracking-widest my-2">
                {ticket.qvc_otp}
              </div>
              <p className="text-xs text-blue-100">
                Share this 4-digit OTP with the counter officer to begin service.
              </p>
            </div>
          )}

          {/* Live Position & Predicted Wait Time */}
          {!isCompleted && !isSkipped && (
            <div className="grid grid-cols-2 gap-4 bg-blue-50/70 dark:bg-slate-800/80 p-5 rounded-2xl">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Position in Line</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                  {ticket.position_in_queue > 0 ? `#${ticket.position_in_queue}` : 'Now'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Predicted Wait Time</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                  {ticket.estimated_wait_formatted}
                </p>
              </div>
            </div>
          )}

          {/* Completed / Skipped States */}
          {isCompleted && (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 rounded-2xl text-emerald-800 dark:text-emerald-200">
              <span className="text-4xl">🎉</span>
              <h3 className="font-bold text-lg mt-2">Service Completed</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Thank you for using LineWise digital queue management!
              </p>
            </div>
          )}

          {isSkipped && (
            <div className="p-6 bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900 rounded-2xl text-red-800 dark:text-red-200">
              <span className="text-4xl">❌</span>
              <h3 className="font-bold text-lg mt-2">Token Skipped</h3>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                This token was marked skipped due to non-attendance or wrong verification attempts.
              </p>
            </div>
          )}

          {/* Free WhatsApp Alert Link */}
          {!isCompleted && !isSkipped && (
            <div className="pt-2">
              <a
                href={buildWhatsAppUrl(
                  ticket.customer_phone,
                  `*LineWise Digital Queue Ticket*\n🎫 Token: *${ticket.display_number}*\n👤 Name: ${ticket.customer_name}\n📍 Queue ID: ${ticket.queue_id}\n⏳ Estimated Wait: ${ticket.estimated_wait_formatted}\n\nTrack your live position and get your OTP here:\n${typeof window !== 'undefined' ? window.location.href : ''}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-sm transition hover:scale-[1.02]"
              >
                <span>📲</span> Save Ticket to WhatsApp
              </a>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1.5">
                Keeps your ticket link and token saved in your personal chat.
              </p>
            </div>
          )}

          {/* Refresh hint */}
          <div className="pt-2 text-xs text-gray-400 dark:text-slate-500 flex items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            Real-Time Live Sync &amp; Alerts Active
          </div>
        </div>
      </div>
    </section>
  )
}

export default CustomerTicket
