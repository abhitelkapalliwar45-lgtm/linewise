import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQueueDetails, joinQueue } from '../services/api'

import { requestNotificationPermission, sendEmailViaRelay } from '../utils/notifications'

function JoinQueue() {
  const { queueId } = useParams()
  const navigate = useNavigate()
  const [queue, setQueue] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchQueue() {
      try {
        const data = await getQueueDetails(queueId)
        setQueue(data)
      } catch (err) {
        setError(err.message || 'Queue not found or invalid')
      } finally {
        setLoading(false)
      }
    }
    fetchQueue()
  }, [queueId])

  const handleJoin = async (e) => {
    e.preventDefault()
    if (!customerName.trim()) return
    setSubmitting(true)
    setError('')

    // Pre-prompt for lock screen / system notifications
    await requestNotificationPermission()

    try {
      const res = await joinQueue(queueId, customerName, customerPhone, customerEmail)
      if (res.success && res.ticket) {
        // Dispatch instant email confirmation via relay
        if (customerEmail && customerEmail.trim()) {
          const queueName = queue?.name || 'LineWise Service Desk'
          const displayNumber = res.ticket.display_number
          const position = res.ticket.position_in_queue || 1
          const waitTime = res.ticket.estimated_wait_formatted || 'Calculating...'
          const ticketUrl = `${window.location.origin}/ticket/${queueId}/${res.ticket.id}`

          sendEmailViaRelay({
            to: customerEmail.trim(),
            subject: `🎟️ Token Confirmed: ${displayNumber} - ${queueName}`,
            text: `Hello ${customerName},\n\nYou have joined the line at ${queueName}!\n\nYour Token: ${displayNumber}\nPosition: #${position}\nEstimated Wait: ${waitTime}\n\nTrack your live ticket:\n${ticketUrl}`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
                <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; text-align: center; border-radius: 12px; color: white;">
                  <h2 style="margin: 0; font-size: 22px;">⚡ LineWise Token Confirmed</h2>
                  <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">${queueName}</p>
                </div>
                <div style="padding: 20px 0; text-align: center;">
                  <p style="font-size: 15px; color: #475569; margin: 0;">Hello <strong>${customerName}</strong>,</p>
                  <p style="color: #64748b; font-size: 13px; margin: 4px 0 20px 0;">You are confirmed in line. Here are your ticket details:</p>
                  <div style="background: #eff6ff; border: 2px dashed #93c5fd; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                    <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Your Token Number</div>
                    <div style="font-size: 40px; font-weight: 900; color: #1d4ed8; margin: 6px 0;">${displayNumber}</div>
                    <div style="font-size: 13px; color: #475569;">Position in Line: <strong>#${position}</strong></div>
                  </div>
                  <div style="background: #f8fafc; padding: 12px; border-radius: 10px; font-size: 14px; margin-bottom: 20px;">
                    ⏱️ Estimated Wait Time: <strong>${waitTime}</strong>
                  </div>
                  <a href="${ticketUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;">
                    View Live Ticket & Status &rarr;
                  </a>
                </div>
              </div>
            `,
          }).catch(() => {})
        }

        // Redirect to Live Ticket status page
        navigate(`/ticket/${queueId}/${res.ticket.id}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to join queue')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading queue details...</p>
        </div>
      </div>
    )
  }

  if (error || !queue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 px-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900">Queue Not Available</h2>
          <p className="mt-2 text-sm text-gray-600">{error || 'This queue is invalid or closed.'}</p>
          <button
            onClick={() => navigate('/get-started')}
            className="mt-6 w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 min-h-screen px-6 py-16 transition-colors duration-200">
      <div className="mx-auto max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-blue-100 dark:border-slate-800 space-y-6">
          <div className="text-center">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-semibold rounded-full uppercase">
              Queue ID: {queue.id}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{queue.name}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{queue.category}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-blue-50/70 dark:bg-slate-800/80 p-4 rounded-xl text-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">People Waiting</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">{queue.active_waiting_count}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Avg Wait Time</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">
                {Math.round(queue.avg_service_time_seconds / 60)} mins
              </p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Email Address (For Instant Token &amp; Turn Alerts)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. yourname@gmail.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                Receive token confirmation and your 4-digit OTP directly in your inbox.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Mobile Number (Optional)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="e.g. 9876543210 (For WhatsApp alerts)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-[11px] text-gray-400 dark:text-slate-500">
                Optional: helps counter staff send you a WhatsApp alert if needed.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              {submitting ? 'Enrolling in Line...' : 'Join Queue Now'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-slate-500">
            Powered by LineWise ML Wait-Time Prediction System
          </p>
        </div>
      </div>
    </section>
  )
}

export default JoinQueue
