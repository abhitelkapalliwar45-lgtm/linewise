import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getQueueDetails, joinQueue } from '../services/api'

function JoinQueue() {
  const { queueId } = useParams()
  const navigate = useNavigate()
  const [queue, setQueue] = useState(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
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
    try {
      const res = await joinQueue(queueId, customerName, customerPhone)
      if (res.success && res.ticket) {
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
                Mobile Number (Optional)
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="For SMS / WhatsApp alerts"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
