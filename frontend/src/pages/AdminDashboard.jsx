import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getAdminDashboardData,
  callNextCustomer,
  verifyCustomerOtp,
  completeCustomerService,
  skipCustomer,
} from '../services/api'
import { buildWhatsAppUrl, sendEmailViaRelay } from '../utils/notifications'

function AdminDashboard() {
  const { queueId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [otpInput, setOtpInput] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpSuccess, setOtpSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchDashboard = async () => {
    try {
      const res = await getAdminDashboardData(queueId)
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
    const interval = setInterval(fetchDashboard, 3000)
    return () => clearInterval(interval)
  }, [queueId])

  const handleCallNext = async () => {
    setActionLoading(true)
    setOtpError('')
    setOtpSuccess('')
    try {
      const res = await callNextCustomer(queueId)
      if (res.success) {
        setOtpSuccess(res.message)
        // Send urgent OTP notification via email if customer email exists
        if (res.ticket && res.ticket.customer_email) {
          const queueName = data?.queue?.name || 'LineWise Counter Desk'
          const ticketUrl = `${window.location.origin}/ticket/${queueId}/${res.ticket.id}`
          sendEmailViaRelay({
            to: res.ticket.customer_email,
            subject: `📢 IT'S YOUR TURN! (Token ${res.ticket.display_number}) - OTP: ${res.ticket.qvc_otp}`,
            text: `Hello ${res.ticket.customer_name},\n\nIT'S YOUR TURN!\nToken: ${res.ticket.display_number}\nQueue: ${queueName}\n\nYOUR 4-DIGIT VERIFICATION OTP: ${res.ticket.qvc_otp}\n\nPlease proceed to the counter desk now.`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
                <div style="background: linear-gradient(135deg, #ea580c, #c2410c); padding: 24px; text-align: center; border-radius: 12px; color: white;">
                  <h2 style="margin: 0; font-size: 22px;">📢 IT'S YOUR TURN!</h2>
                  <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">${queueName}</p>
                </div>
                <div style="padding: 20px 0; text-align: center;">
                  <p style="font-size: 15px; color: #475569; margin: 0;">Hello <strong>${res.ticket.customer_name}</strong>,</p>
                  <p style="color: #64748b; font-size: 13px; margin: 4px 0 20px 0;">Your token <strong>${res.ticket.display_number}</strong> is now called to the counter!</p>
                  <div style="background: #fff7ed; border: 2px solid #fdba74; border-radius: 16px; padding: 20px; margin-bottom: 20px;">
                    <div style="font-size: 12px; font-weight: 700; color: #c2410c; text-transform: uppercase;">Your 4-Digit Verification OTP</div>
                    <div style="font-size: 44px; font-weight: 900; letter-spacing: 6px; color: #9a3412; margin: 8px 0;">${res.ticket.qvc_otp}</div>
                    <div style="font-size: 12px; color: #7c2d12;">Share this OTP with the counter officer to verify your turn</div>
                  </div>
                  <a href="${ticketUrl}" style="display: inline-block; background: #ea580c; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px;">
                    View Live Ticket & Status &rarr;
                  </a>
                </div>
              </div>
            `,
          }).catch(() => {})
        }
      } else {
        setOtpError(res.message)
      }
      fetchDashboard()
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otpInput.trim() || !calledTicket) return
    setActionLoading(true)
    setOtpError('')
    setOtpSuccess('')
    try {
      const res = await verifyCustomerOtp(queueId, calledTicket.id, otpInput)
      setOtpSuccess(res.message)
      setOtpInput('')
      fetchDashboard()
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteService = async (ticketId) => {
    setActionLoading(true)
    setOtpError('')
    setOtpSuccess('')
    try {
      const res = await completeCustomerService(queueId, ticketId)
      setOtpSuccess(res.message)
      fetchDashboard()
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleSkipTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to skip this customer?')) return
    setActionLoading(true)
    setOtpError('')
    setOtpSuccess('')
    try {
      const res = await skipCustomer(queueId, ticketId)
      setOtpSuccess(res.message)
      fetchDashboard()
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data || !data.queue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow">
          <p className="text-red-600 font-semibold">Queue dashboard failed to load.</p>
          <button
            onClick={() => navigate('/generate-code')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
          >
            Create New Queue
          </button>
        </div>
      </div>
    )
  }

  const queue = data.queue
  const calledTicket = queue.currently_called
  const servingTicket = queue.currently_serving
  const waitingList = data.waiting_tickets || []
  const mlMetrics = data.ml_metrics || {}

  return (
    <section className="bg-gray-50 dark:bg-slate-950 min-h-screen p-6 md:p-10 transition-colors duration-200">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold rounded-full">
                {queue.id}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                {queue.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{queue.name}</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">{queue.category}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin-portal')}
              className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Switch Queue ↔
            </button>
            <button
              onClick={() => navigate(`/join/${queue.id}`)}
              className="px-4 py-2.5 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Open Join Link ↗
            </button>
            <button
              onClick={fetchDashboard}
              className="px-4 py-2.5 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-xl hover:bg-blue-100 dark:hover:bg-slate-700"
            >
              Refresh 🔄
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase">Waiting in Line</p>
            <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{queue.active_waiting_count}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase">Total Served</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{queue.total_served}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase">Total Skipped</p>
            <p className="text-3xl font-black text-red-500 dark:text-red-400 mt-1">{queue.total_skipped}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase">Avg Service Time</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-slate-200 mt-1">
              {Math.round(queue.avg_service_time_seconds / 60)} mins
            </p>
          </div>
        </div>

        {/* Notification Banners */}
        {otpError && (
          <div className="p-4 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900 text-sm font-semibold">
            ⚠️ {otpError}
          </div>
        )}
        {otpSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-2xl border border-emerald-200 dark:border-emerald-900 text-sm font-semibold">
            ✅ {otpSuccess}
          </div>
        )}

        {/* Counter Action Desk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Active Called Customer & OTP Verification */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Current Called Counter Desk</h2>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full">
                Step 1: OTP Verification
              </span>
            </div>

            {calledTicket ? (
              <div className="space-y-4 bg-amber-50/60 dark:bg-amber-950/40 p-5 rounded-xl border border-amber-200 dark:border-amber-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold uppercase">Token Called</p>
                    <p className="text-3xl font-black text-amber-900 dark:text-amber-200">{calledTicket.display_number}</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{calledTicket.customer_name}</p>
                    {calledTicket.customer_email && (
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">✉️ {calledTicket.customer_email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {calledTicket.customer_phone && (
                      <a
                        href={buildWhatsAppUrl(
                          calledTicket.customer_phone,
                          `*LineWise Queue Counter Alert*\nHello ${calledTicket.customer_name}, your token *${calledTicket.display_number}* is now called at *${queue.name}*!\n\nYour 4-Digit Verification OTP is: *${calledTicket.qvc_otp}*\n\nPlease proceed to the counter desk now.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                      >
                        <span>📲</span> WhatsApp Customer
                      </a>
                    )}
                    <button
                      onClick={() => handleSkipTicket(calledTicket.id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs font-bold rounded-lg hover:bg-red-200 dark:hover:bg-red-900"
                    >
                      Skip Customer
                    </button>
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="pt-2 space-y-3">
                  <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase">
                    Enter Customer 4-Digit QVC OTP
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="e.g. 4831"
                      className="flex-1 px-4 py-3 font-mono text-xl text-center tracking-widest rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={actionLoading || otpInput.length !== 4}
                      className="px-6 py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 disabled:opacity-50 transition"
                    >
                      Verify OTP
                    </button>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Failed Attempts: {calledTicket.qvc_attempts}/2 (2 wrong attempts auto-skips)
                  </p>
                </form>
              </div>
            ) : (
              <div className="py-8 text-center bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">No customer currently called to counter.</p>
                <button
                  onClick={handleCallNext}
                  disabled={actionLoading || waitingList.length === 0}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  📢 Call Next Customer
                </button>
              </div>
            )}
          </div>

          {/* Currently In Service Counter */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Currently Serving Desk</h2>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                Step 2: Service Active
              </span>
            </div>

            {servingTicket ? (
              <div className="space-y-4 bg-emerald-50/60 dark:bg-emerald-950/40 p-5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold uppercase">In Service Token</p>
                    <p className="text-3xl font-black text-emerald-900 dark:text-emerald-200">{servingTicket.display_number}</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{servingTicket.customer_name}</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-xs font-extrabold rounded-full animate-pulse">
                    Verified
                  </span>
                </div>

                <button
                  onClick={() => handleCompleteService(servingTicket.id)}
                  disabled={actionLoading}
                  className="w-full py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700 transition"
                >
                  ✅ Complete Service & Log ML Duration
                </button>
              </div>
            ) : (
              <div className="py-12 text-center bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">No active service in progress.</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Verify customer OTP on the left to start service.</p>
              </div>
            )}
          </div>

        </div>

        {/* Waiting List Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Waiting Customers Line ({waitingList.length})</h2>
          
          {waitingList.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-6">The queue line is currently empty.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b dark:border-slate-800 text-xs font-bold text-gray-400 dark:text-slate-400 uppercase bg-gray-50 dark:bg-slate-800/50">
                    <th className="p-3">Pos</th>
                    <th className="p-3">Token #</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
                  {waitingList.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-gray-700 dark:text-slate-300">#{idx + 1}</td>
                      <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{t.display_number}</td>
                      <td className="p-3">
                        <p className="font-semibold text-gray-900 dark:text-white">{t.customer_name}</p>
                        {t.customer_email && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">{t.customer_email}</p>
                        )}
                      </td>
                      <td className="p-3 text-gray-500 dark:text-slate-400">{t.customer_phone || '-'}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {t.customer_phone && (
                          <a
                            href={buildWhatsAppUrl(
                              t.customer_phone,
                              `*LineWise Queue Notice*\nHello ${t.customer_name}, your token is *${t.display_number}* at *${queue.name}*. You are currently #${idx + 1} in line.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                          >
                            📲 WhatsApp
                          </a>
                        )}
                        <button
                          onClick={() => handleSkipTicket(t.id)}
                          className="px-3 py-1 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                        >
                          Skip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* AI ML Wait Time Analytics */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">🤖 AI Wait-Time Prediction Engine Analytics</h3>
            <span className="px-3 py-1 bg-blue-800 text-blue-200 text-xs font-semibold rounded-full">
              {mlMetrics.status || 'Active'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-sm">
            <div>
              <p className="text-xs text-blue-300">ML Model</p>
              <p className="font-semibold">{mlMetrics.model_type || 'Linear Regression + EMA'}</p>
            </div>
            <div>
              <p className="text-xs text-blue-300">EMA Moving Avg</p>
              <p className="font-semibold">{mlMetrics.moving_average_seconds || 300}s</p>
            </div>
            <div>
              <p className="text-xs text-blue-300">Training Samples</p>
              <p className="font-semibold">{mlMetrics.total_completed_samples || 0} completed services</p>
            </div>
            <div>
              <p className="text-xs text-blue-300">Mean Duration</p>
              <p className="font-semibold">{mlMetrics.mean_service_seconds || 300}s</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default AdminDashboard
